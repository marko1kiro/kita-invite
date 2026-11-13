#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const allowedEnvironments = new Set(["dev", "staging"]);
const environment = process.argv[2];

if (process.argv.length !== 3 || !allowedEnvironments.has(environment)) {
  console.error(
    'Refusing deployment. Choose exactly one explicit environment: "dev" or "staging". Use `npm run deploy:dev` or `npm run deploy:staging`.',
  );
  process.exit(2);
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const wranglerCli = resolve(projectRoot, "node_modules/wrangler/bin/wrangler.js");
const result = spawnSync(
  process.execPath,
  [wranglerCli, "deploy", "--env", environment],
  { cwd: projectRoot, stdio: "inherit" },
);

if (result.error) {
  console.error(`Could not start Wrangler: ${result.error.message}`);
  process.exit(1);
}

if (result.signal) {
  console.error(`Wrangler stopped by signal ${result.signal}.`);
  process.exit(1);
}

process.exit(result.status ?? 1);
