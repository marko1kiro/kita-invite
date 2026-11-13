#!/usr/bin/env node
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoot = await mkdtemp(join(tmpdir(), "kita-invite-dev-api-smoke-"));
const workerPort = 8787;
const vitePort = 5173;
const children = [];

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

async function assertPortAvailable(port) {
  await new Promise((resolvePromise, rejectPromise) => {
    const server = createServer();
    server.once("error", rejectPromise);
    server.listen(port, "127.0.0.1", () => server.close(resolvePromise));
  }).catch((error) => {
    throw new Error(`Required local port ${port} is unavailable: ${error.message}`);
  });
}

function startProcess(label, args) {
  const child = spawn(process.execPath, args, {
    cwd: projectRoot,
    env: localOnlyEnvironment(),
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  child.label = label;
  child.output = "";
  const append = (chunk) => {
    child.output = `${child.output}${chunk.toString()}`.slice(-8000);
  };
  child.stdout.on("data", append);
  child.stderr.on("data", append);
  children.push(child);
  return child;
}

function childFailure(child) {
  return `${child.label} exited early (code ${child.exitCode}, signal ${child.signalCode}).\n${child.output}`;
}

async function waitForReady(child, url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(childFailure(child));
    }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });
      if (response.ok) return response;
      await response.body?.cancel();
    } catch {
      // The local server may still be compiling or starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 150));
  }
  throw new Error(`Timed out waiting for ${url}.\n${child.output}`);
}

async function assertHealthJson(url, label) {
  const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.json().catch(() => null);
  const expected = { status: "ok", environment: "dev" };
  if (response.status !== 200 || !contentType.includes("application/json") || JSON.stringify(body) !== JSON.stringify(expected)) {
    throw new Error(`${label} did not return expected health JSON: status=${response.status}, content-type=${contentType}, body=${JSON.stringify(body)}`);
  }
  console.log(`PASS: ${label} returned ${JSON.stringify(body)} (HTTP ${response.status}).`);
}

async function stopProcess(child) {
  if (child.exitCode !== null || child.signalCode !== null || !child.pid) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
  await Promise.race([once(child, "exit").catch(() => undefined), new Promise((resolvePromise) => setTimeout(resolvePromise, 2_000))]);
  if (child.exitCode === null && child.signalCode === null) {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      child.kill("SIGKILL");
    }
  }
}

try {
  await mkdir(join(temporaryRoot, "home"), { recursive: true });
  await mkdir(join(temporaryRoot, "xdg"), { recursive: true });
  await assertPortAvailable(workerPort);
  await assertPortAvailable(vitePort);

  const wranglerCli = resolve(projectRoot, "node_modules/wrangler/bin/wrangler.js");
  const viteCli = resolve(projectRoot, "node_modules/vite/bin/vite.js");
  const worker = startProcess("local Worker", [
    wranglerCli,
    "dev",
    "--local",
    "--env",
    "dev",
    "--ip",
    "127.0.0.1",
    "--port",
    String(workerPort),
    "--persist-to",
    join(temporaryRoot, "worker-state"),
  ]);
  await waitForReady(worker, `http://127.0.0.1:${workerPort}/api/v1/health`);
  await assertHealthJson(`http://127.0.0.1:${workerPort}/api/v1/health`, "local Worker /api/v1/health");

  const vite = startProcess("Vite dev server", [
    viteCli,
    "--config",
    "vite.config.ts",
    "--host",
    "127.0.0.1",
    "--port",
    String(vitePort),
    "--strictPort",
  ]);
  await waitForReady(vite, `http://127.0.0.1:${vitePort}/`);
  await assertHealthJson(`http://127.0.0.1:${vitePort}/api/v1/health`, "Vite-proxied /api/v1/health");
  console.log("PASS: local-only Worker and Vite integration smoke completed; both servers and disposable local state are cleaned up.");
} catch (error) {
  console.error(`FAIL: local dev/API smoke: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  for (const child of [...children].reverse()) await stopProcess(child);
  await rm(temporaryRoot, { recursive: true, force: true });
}
