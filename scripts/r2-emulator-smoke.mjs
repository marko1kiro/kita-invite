#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoot = await mkdtemp(join(tmpdir(), "kita-invite-r2-emulator-smoke-"));
const wranglerCli = resolve(projectRoot, "node_modules/wrangler/bin/wrangler.js");
const bucket = "kita-invite-local-r2-emulator-smoke";
const objectKey = `smoke/${randomUUID()}/synthetic.json`;
const objectPath = `${bucket}/${objectKey}`;
const configPath = join(temporaryRoot, "wrangler.jsonc");
const sourcePath = join(temporaryRoot, "source.json");
const downloadedPath = join(temporaryRoot, "downloaded.json");
const persistencePath = join(temporaryRoot, "r2-state");
let cleanupNeeded = true;

function localOnlyEnvironment() {
  const env = {
    ...process.env,
    HOME: join(temporaryRoot, "home"),
    XDG_CONFIG_HOME: join(temporaryRoot, "xdg"),
    WRANGLER_SEND_METRICS: "false",
  };
  for (const key of Object.keys(env)) {
    if (/^(CF_|CLOUDFLARE_)/i.test(key) || /WRANGLER.*(TOKEN|AUTH|ACCOUNT)/i.test(key)) {
      delete env[key];
    }
  }
  return env;
}

function runWrangler(action, extraArgs = [], { expectSuccess = true } = {}) {
  const result = spawnSync(
    process.execPath,
    [
      wranglerCli,
      "r2",
      "object",
      action,
      objectPath,
      "--config",
      configPath,
      "--local",
      "--persist-to",
      persistencePath,
      ...extraArgs,
    ],
    {
      cwd: projectRoot,
      env: localOnlyEnvironment(),
      encoding: "utf8",
      timeout: 30_000,
      maxBuffer: 2 * 1024 * 1024,
    },
  );
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (!output.includes("Resource location: local")) {
    throw new Error(`Wrangler did not confirm local resource location for ${action}. Output:\n${output}`);
  }
  const succeeded = result.status === 0 && !result.error;
  if (expectSuccess && !succeeded) {
    throw new Error(`Local Wrangler ${action} failed (status ${result.status}). ${result.error?.message ?? ""}\n${output}`);
  }
  if (!expectSuccess && succeeded) {
    throw new Error(`Expected local Wrangler ${action} to fail after deletion, but it succeeded.\n${output}`);
  }
  return output;
}

try {
  await mkdir(join(temporaryRoot, "home"), { recursive: true });
  await mkdir(join(temporaryRoot, "xdg"), { recursive: true });
  await writeFile(
    configPath,
    JSON.stringify({
      name: "kita-invite-local-r2-emulator-smoke",
      compatibility_date: "2026-11-10",
      r2_buckets: [{ binding: "MEDIA", bucket_name: bucket }],
    }),
  );
  const syntheticPayload = Buffer.from('{"synthetic":true,"fixture":"local-r2-emulator-smoke"}', "utf8");
  await writeFile(sourcePath, syntheticPayload);

  runWrangler("put", ["--file", sourcePath, "--content-type", "application/json", "--force"]);
  const downloadOutput = runWrangler("get", ["--file", downloadedPath]);
  const downloadedPayload = await readFile(downloadedPath);
  if (!downloadedPayload.equals(syntheticPayload)) {
    throw new Error(`Downloaded bytes did not match the synthetic upload.\n${downloadOutput}`);
  }

  runWrangler("delete", ["--force"]);
  cleanupNeeded = false;
  const absentOutput = runWrangler("get", ["--file", downloadedPath], { expectSuccess: false });
  if (!absentOutput.includes("The specified key does not exist.")) {
    throw new Error(`Deleted object absence was not confirmed.\n${absentOutput}`);
  }
  console.log("PASS: local R2 emulator synthetic object uploaded, downloaded byte-for-byte, deleted, and confirmed absent.");
  console.log("PASS: Wrangler confirmed local resource location; fake bucket and persistence were disposable; Cloudflare credentials were removed from the subprocess environment.");
} catch (error) {
  console.error(`FAIL: local R2 emulator smoke: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  if (cleanupNeeded) {
    try {
      runWrangler("delete", ["--force"]);
    } catch {
      // The isolated temporary persistence directory is removed below even if no object was created.
    }
  }
  await rm(temporaryRoot, { recursive: true, force: true });
}
