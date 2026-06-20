import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const episodeDir = path.join(root, "episodes", "ep05_rope_position_encoding");
const coverDir = path.join(episodeDir, "video_script", "cover_hyperframes");
const snapshotPath = path.join(coverDir, "snapshots", "frame-00-at-2.4s.png");
const outPath = path.join(episodeDir, "video_script", "cover_ep05_rope_final_1080x1920_safe90.png");
const hyperframesCli = path.join(root, "node_modules", "hyperframes", "dist", "cli.js");

function runHyperframes(args) {
  execFileSync(process.execPath, [hyperframesCli, ...args], {
    cwd: root,
    stdio: "inherit",
  });
}

async function main() {
  runHyperframes(["lint", coverDir]);
  runHyperframes(["snapshot", coverDir, "--at=2.4", "--describe=false"]);
  await fs.copyFile(snapshotPath, outPath);

  const meta = await sharp(outPath).metadata();
  console.log(JSON.stringify({
    outPath,
    source: path.relative(episodeDir, path.join(coverDir, "index.html")),
    width: meta.width,
    height: meta.height,
    format: meta.format,
    style_reference: "EP04 light-paper HyperFrames cover grammar",
    constraints: {
      no_black_border: true,
      no_black_background: true,
      hyperframes_snapshot_s: 2.4,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
