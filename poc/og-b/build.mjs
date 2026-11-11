import { execSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";

// 1. Build bundle client -> dist/client/client.js
execSync("npx vite build", { stdio: "inherit" });

// 2. Gzip client.js lalu simpan sebagai base64 satu baris
//    (dist/client/client.js.b64) — di-inline worker via ?raw dan didekompres
//    saat runtime dengan DecompressionStream (tersedia di Node 22 dan di
//    Workers). Menghemat ~150 KB dibanding ?raw mentah.
const clientJs = readFileSync("dist/client/client.js");
const b64 = gzipSync(clientJs, { level: 9 }).toString("base64");
writeFileSync("dist/client/client.js.b64", b64);
console.log(
  `client.js: ${clientJs.length} B -> gzip+base64 ${b64.length} B (dist/client/client.js.b64)`,
);

// 3. Build worker (meng-inline client.js.b64 via ?raw + gambar via ?url) -> dist/worker.mjs
execSync("npx vite build --config vite.config.worker.ts", { stdio: "inherit" });
console.log("build OK: dist/client/client.js + dist/worker.mjs");
