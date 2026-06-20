import path from "node:path";
import { episodeDirFromTopicPath } from "./lib/runtimeAdapters.js";
import { validatePreProductionContracts } from "./lib/preProductionContracts.js";

function main(argv: string[]): number {
  const [topicPath] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/preproduction_contract_gate.ts <topic.yaml>");
    return 1;
  }

  const episodeDir = episodeDirFromTopicPath(topicPath);
  const result = validatePreProductionContracts(episodeDir);
  console.log(JSON.stringify({
    ...result,
    episode_dir: path.relative(process.cwd(), episodeDir).replace(/\\/g, "/")
  }));

  return result.status === "passed" ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/preproduction_contract_gate.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
