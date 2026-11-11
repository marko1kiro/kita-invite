/**
 * build-worker.mjs — regenerate src/generated.ts lalu bundle src/worker.ts
 * menjadi SATU ES module self-contained dist/worker.mjs (esbuild, semua
 * dependensi ter-bundle, tanpa import eksternal saat runtime).
 * Dijalankan setelah `npm run build:client` (butuh dist/client/client.js).
 * Gagal bila bundle >= 800 KB.
 */
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { generate } from './generate.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIMIT = 800 * 1024;

await generate();

await esbuild.build({
  entryPoints: [path.join(ROOT, 'src', 'worker.ts')],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  outfile: path.join(ROOT, 'dist', 'worker.mjs'),
  minify: true,
  legalComments: 'none',
});

const { size } = await stat(path.join(ROOT, 'dist', 'worker.mjs'));
console.log(`dist/worker.mjs: ${size} byte (${(size / 1024).toFixed(1)} KB)`);
if (size >= LIMIT) {
  console.error(`BUNDLE TERLALU BESAR: ${size} byte >= batas ${LIMIT} byte`);
  process.exit(1);
}
console.log('OK: bundle < 800 KB');
