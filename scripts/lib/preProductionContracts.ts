import fs from "node:fs";
import path from "node:path";

export const requiredPreProductionContracts = [
  "contracts/claim_contract.md",
  "contracts/visual_contract.md",
  "contracts/notation_contract.md",
  "contracts/render_contract.md"
] as const;

export type PreProductionContractGateResult = {
  status: "passed" | "missing_inputs";
  required_contracts: readonly string[];
  missing_inputs: string[];
};

export function validatePreProductionContracts(episodeDir: string): PreProductionContractGateResult {
  const missingInputs = requiredPreProductionContracts.filter((relativePath) => {
    const filePath = path.join(episodeDir, relativePath);

    return !fs.existsSync(filePath) || fs.readFileSync(filePath, "utf8").trim().length === 0;
  });

  return {
    status: missingInputs.length === 0 ? "passed" : "missing_inputs",
    required_contracts: requiredPreProductionContracts,
    missing_inputs: missingInputs
  };
}

export function preProductionContractMissingInputs(episodeDir: string): string[] {
  return validatePreProductionContracts(episodeDir).missing_inputs;
}

export function assertPreProductionContracts(episodeDir: string, stage: "tts" | "render" | "sfx"): void {
  const result = validatePreProductionContracts(episodeDir);

  if (result.status === "passed") {
    return;
  }

  throw new Error(
    `Pre-production contract gate failed before ${stage}: missing ${result.missing_inputs.join(", ")}`
  );
}
