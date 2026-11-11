#!/usr/bin/env node
/**
 * local-server.mjs — Harness POC Open Graph Kita Invite.
 *
 * Memuat worker module (export default { fetch }) dari path argumen, lalu
 * membungkus fetch() dalam server node:http di 127.0.0.1 port ephemeral.
 * Mencetak SATU baris `BASE_URL=<url>` ke stdout (parseable oleh runner /
 * koordinator), log lain ke stderr. Berjalan sampai SIGINT/SIGTERM.
 *
 * Pemakaian:
 *   node local-server.mjs <path-ke-worker.mjs> [port]
 *   node local-server.mjs ../og-a/dist/worker.mjs          # port ephemeral
 *   node local-server.mjs ../og-a/dist/worker.mjs 8787      # port tetap
 *
 * Hanya menangani GET (cukup untuk tes K1–K5). Method lain -> 405.
 * TIDAK menyentuh Pages / production / D1 / R2 — murni in-process lokal.
 */
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const workerPath = process.argv[2];
if (!workerPath) {
  console.error('Usage: node local-server.mjs <worker.mjs> [port]');
  process.exit(2);
}
const port = process.argv[3] ? Number(process.argv[3]) : 0;
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error(`Port tidak valid: ${process.argv[3]}`);
  process.exit(2);
}

const mod = await import(pathToFileURL(resolve(workerPath)).href);
const worker = mod.default ?? mod;
if (!worker || typeof worker.fetch !== 'function') {
  console.error(`Worker module tidak export default { fetch }: ${workerPath}`);
  process.exit(2);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8', allow: 'GET' });
      res.end('Method Not Allowed — harness ini hanya melayani GET\n');
      return;
    }
    const host = req.headers.host ?? `127.0.0.1:${server.address().port}`;
    const url = `http://${host}${req.url ?? '/'}`;
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v === undefined) continue;
      if (Array.isArray(v)) headers.set(k, v.join(', '));
      else headers.set(k, v);
    }
    const request = new Request(url, { method: 'GET', headers });
    const response = await worker.fetch(request);
    const body = Buffer.from(await response.arrayBuffer());
    const outHeaders = {};
    response.headers.forEach((v, k) => { outHeaders[k] = v; });
    // Content-Length eksplisit agar klien (dan Playwright) tidak menggantung.
    outHeaders['content-length'] = String(body.length);
    res.writeHead(response.status, outHeaders);
    res.end(body);
  } catch (err) {
    console.error('[local-server] worker.fetch error:', err?.stack ?? err);
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error (harness wrapper)\n');
  }
});

server.listen(port, '127.0.0.1', () => {
  const { port: actual } = server.address();
  // SATU baris parseable di stdout; sisanya ke stderr.
  console.log(`BASE_URL=http://127.0.0.1:${actual}`);
  console.error(`[local-server] worker=${resolve(workerPath)} listening on http://127.0.0.1:${actual}`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.once(sig, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  });
}
