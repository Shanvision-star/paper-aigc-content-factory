import path from "node:path";
import type { Topic } from "./contracts.js";

export function episodeDirForTopic(topic: Topic): string {
  return `episodes/${topic.episode_id}`;
}

export function episodePath(topic: Topic, relativePath: string): string {
  return path.join(episodeDirForTopic(topic), relativePath);
}
