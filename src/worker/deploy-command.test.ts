import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const deployScript = resolve(process.cwd(), "scripts/deploy.mjs");

function invokeDeploy(args: string[]) {
  return spawnSync(process.execPath, [deployScript, ...args], { encoding: "utf8" });
}

describe("npm deployment guard", () => {
  it("rejects a missing environment before Wrangler starts", () => {
    const result = invokeDeploy([]);

    expect(result.status).toBe(2);
    expect(`${result.stdout}${result.stderr}`).toContain("Refusing deployment");
  });

  it("rejects an invalid environment before Wrangler starts", () => {
    const result = invokeDeploy(["production"]);

    expect(result.status).toBe(2);
    expect(`${result.stdout}${result.stderr}`).toContain('Choose exactly one explicit environment: "dev" or "staging"');
  });
});
