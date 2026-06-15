"""IndexTTS2 分段口播生成入口。

这个脚本只读取已经审核过的 segment manifest，把 `spoken_text`
交给本地 IndexTTS2 推理。它不会修改 `source_text`，也不会生成
占位音频；失败时直接退出，让上游 Dagu 节点停住。
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


W2V_BERT_REPO_ID = "facebook/w2v-bert-2.0"
MASKGCT_REPO_ID = "amphion/MaskGCT"
MASKGCT_SEMANTIC_CODEC = "semantic_codec/model.safetensors"
CAMPPLUS_REPO_ID = "funasr/campplus"
CAMPPLUS_CKPT = "campplus_cn_common.bin"
BIGVGAN_REPO_ID = "nvidia/bigvgan_v2_22khz_80band_256x"
BIGVGAN_FILES = {"config.json", "bigvgan_generator.pt"}


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)
        file.write("\n")


def parse_segment_ids(raw_values: list[str]) -> set[str] | None:
    values: set[str] = set()
    for raw_value in raw_values:
        for item in raw_value.split(","):
            segment_id = item.strip()
            if segment_id:
                values.add(segment_id)

    return values or None


def install_local_w2v_bert_patch(local_dir: Path) -> None:
    """让 IndexTTS2 的硬编码 W2V-BERT 依赖优先读取本地目录。"""

    if not local_dir.exists():
        raise FileNotFoundError(f"Missing local W2V-BERT model directory: {local_dir}")

    from transformers import SeamlessM4TFeatureExtractor, Wav2Vec2BertModel

    def patch_from_pretrained(model_class: Any) -> None:
        original_from_pretrained = model_class.from_pretrained

        def patched_from_pretrained(
            cls: Any,
            pretrained_model_name_or_path: str | os.PathLike[str],
            *args: Any,
            **kwargs: Any,
        ) -> Any:
            if str(pretrained_model_name_or_path) == W2V_BERT_REPO_ID:
                pretrained_model_name_or_path = str(local_dir)
                kwargs["local_files_only"] = True
            return original_from_pretrained(pretrained_model_name_or_path, *args, **kwargs)

        model_class.from_pretrained = classmethod(patched_from_pretrained)

    patch_from_pretrained(SeamlessM4TFeatureExtractor)
    patch_from_pretrained(Wav2Vec2BertModel)


def install_local_hf_asset_patch(
    *,
    maskgct_semantic_codec: Path | None,
    campplus_ckpt: Path | None,
    bigvgan_dir: Path | None,
) -> None:
    """把 IndexTTS2 内部的 hf_hub_download 调用钉到本地资产。

    IndexTTS2 的主权重已经在 `model_dir`，但推理链路还会通过
    `hf_hub_download` 读取语义 codec、speaker encoder 和 vocoder。
    这些路径必须在导入 `indextts.infer_v2` 前完成 monkey patch，
    否则脚本会在模型加载阶段继续联网，Dagu 里看起来就像卡住。
    """

    local_files: dict[tuple[str, str], Path] = {}

    if maskgct_semantic_codec is not None:
        if not maskgct_semantic_codec.exists():
            raise FileNotFoundError(f"Missing local MaskGCT semantic codec: {maskgct_semantic_codec}")
        local_files[(MASKGCT_REPO_ID, MASKGCT_SEMANTIC_CODEC)] = maskgct_semantic_codec

    if campplus_ckpt is not None:
        if not campplus_ckpt.exists():
            raise FileNotFoundError(f"Missing local CampPlus checkpoint: {campplus_ckpt}")
        local_files[(CAMPPLUS_REPO_ID, CAMPPLUS_CKPT)] = campplus_ckpt

    if bigvgan_dir is not None:
        missing_bigvgan_files = [filename for filename in BIGVGAN_FILES if not (bigvgan_dir / filename).exists()]
        if missing_bigvgan_files:
            raise FileNotFoundError(
                f"Missing local BigVGAN files in {bigvgan_dir}: {', '.join(sorted(missing_bigvgan_files))}"
            )
        for filename in BIGVGAN_FILES:
            local_files[(BIGVGAN_REPO_ID, filename)] = bigvgan_dir / filename

    if not local_files:
        return

    import huggingface_hub

    original_hf_hub_download = huggingface_hub.hf_hub_download

    def patched_hf_hub_download(
        repo_id: str,
        filename: str | None = None,
        *args: Any,
        **kwargs: Any,
    ) -> str:
        requested_filename = filename if filename is not None else kwargs.get("filename")
        local_file = local_files.get((repo_id, str(requested_filename)))
        if local_file is not None:
            return str(local_file)

        if filename is None:
            return original_hf_hub_download(repo_id, *args, **kwargs)
        return original_hf_hub_download(repo_id, filename=filename, *args, **kwargs)

    huggingface_hub.hf_hub_download = patched_hf_hub_download


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate segmented EP voiceover with IndexTTS2.")
    parser.add_argument("--episode-dir", required=True)
    parser.add_argument("--manifest", default="audio/indextts2/segments/segment_manifest.json")
    parser.add_argument("--reference-audio", required=True)
    parser.add_argument("--cfg-path", required=True)
    parser.add_argument("--model-dir", required=True)
    parser.add_argument("--w2v-bert-dir", default=os.environ.get("INDEXTTS2_W2V_BERT_DIR"))
    parser.add_argument("--maskgct-semantic-codec", default=os.environ.get("INDEXTTS2_MASKGCT_SEMANTIC_CODEC"))
    parser.add_argument("--campplus-ckpt", default=os.environ.get("INDEXTTS2_CAMPPLUS_CKPT"))
    parser.add_argument("--bigvgan-dir", default=os.environ.get("INDEXTTS2_BIGVGAN_DIR"))
    parser.add_argument("--segment-id", action="append", default=[])
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--use-fp16", action="store_true")
    parser.add_argument("--use-cuda-kernel", action="store_true")
    args = parser.parse_args()

    episode_dir = Path(args.episode_dir).resolve()
    manifest_path = episode_dir / args.manifest
    reference_audio = (episode_dir / args.reference_audio).resolve()
    cfg_path = Path(args.cfg_path).resolve()
    model_dir = Path(args.model_dir).resolve()
    w2v_bert_dir = Path(args.w2v_bert_dir).resolve() if args.w2v_bert_dir else None
    maskgct_semantic_codec = Path(args.maskgct_semantic_codec).resolve() if args.maskgct_semantic_codec else None
    campplus_ckpt = Path(args.campplus_ckpt).resolve() if args.campplus_ckpt else None
    bigvgan_dir = Path(args.bigvgan_dir).resolve() if args.bigvgan_dir else None

    for required_path in [manifest_path, reference_audio, cfg_path, model_dir]:
        if not required_path.exists():
            raise FileNotFoundError(f"Missing required IndexTTS2 input: {required_path}")

    if w2v_bert_dir is not None:
        install_local_w2v_bert_patch(w2v_bert_dir)
    install_local_hf_asset_patch(
        maskgct_semantic_codec=maskgct_semantic_codec,
        campplus_ckpt=campplus_ckpt,
        bigvgan_dir=bigvgan_dir,
    )

    from indextts.infer_v2 import IndexTTS2  # type: ignore

    manifest = load_json(manifest_path)
    requested_ids = parse_segment_ids(args.segment_id)
    segments = manifest["segments"]
    if requested_ids is not None:
        segments = [segment for segment in segments if segment["segment_id"] in requested_ids]
        found_ids = {segment["segment_id"] for segment in segments}
        if found_ids != requested_ids:
            raise ValueError(f"Requested segment ids were not all found. requested={sorted(requested_ids)} found={sorted(found_ids)}")

    print(
        json.dumps(
            {
                "status": "loading_model",
                "model_dir": str(model_dir),
                "cfg_path": str(cfg_path),
                "w2v_bert_dir": str(w2v_bert_dir) if w2v_bert_dir is not None else None,
                "maskgct_semantic_codec": str(maskgct_semantic_codec) if maskgct_semantic_codec is not None else None,
                "campplus_ckpt": str(campplus_ckpt) if campplus_ckpt is not None else None,
                "bigvgan_dir": str(bigvgan_dir) if bigvgan_dir is not None else None,
                "use_fp16": args.use_fp16,
                "use_cuda_kernel": args.use_cuda_kernel,
            },
            ensure_ascii=False,
        ),
        flush=True,
    )
    tts = IndexTTS2(
        cfg_path=str(cfg_path),
        model_dir=str(model_dir),
        is_fp16=args.use_fp16,
        use_cuda_kernel=args.use_cuda_kernel,
    )

    generated_segments: list[dict[str, str]] = []
    for segment in segments:
        output_path = episode_dir / segment["output_audio"]
        output_path.parent.mkdir(parents=True, exist_ok=True)

        if output_path.exists() and not args.force:
            print(f"segment={segment['segment_id']} status=skipped_existing output={output_path}", flush=True)
        else:
            print(f"segment={segment['segment_id']} status=generating output={output_path}", flush=True)
            tts.infer(
                spk_audio_prompt=str(reference_audio),
                text=segment["spoken_text"],
                output_path=str(output_path),
                verbose=True,
            )

        if not output_path.exists() or output_path.stat().st_size <= 44:
            raise RuntimeError(f"IndexTTS2 did not create a valid wav for {segment['segment_id']}: {output_path}")

        generated_segments.append(
            {
                "segment_id": segment["segment_id"],
                "output_audio": segment["output_audio"],
            }
        )

    status_path = manifest_path.parent / "segmented_tts_status.json"
    write_json(
        status_path,
        {
            "status": "generated_segmented_review",
            "engine": "indextts2_local_segmented",
            "provider_calls": False,
            "tts_calls": True,
            "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
            "source_manifest": args.manifest.replace("\\", "/"),
            "reference_audio": args.reference_audio.replace("\\", "/"),
            "settings": {
                "use_fp16": args.use_fp16,
                "use_cuda_kernel": args.use_cuda_kernel,
                "w2v_bert_dir": str(w2v_bert_dir) if w2v_bert_dir is not None else None,
                "maskgct_semantic_codec": str(maskgct_semantic_codec) if maskgct_semantic_codec is not None else None,
                "campplus_ckpt": str(campplus_ckpt) if campplus_ckpt is not None else None,
                "bigvgan_dir": str(bigvgan_dir) if bigvgan_dir is not None else None,
            },
            "limitations": [
                "IndexTTS2 samples still require human listening review before full generation.",
                "This run prioritizes content consistency and terminology clarity over personal timbre similarity.",
            ],
            "segments": generated_segments,
        },
    )

    print("status=generated_segmented", flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error={exc}", file=sys.stderr, flush=True)
        raise
