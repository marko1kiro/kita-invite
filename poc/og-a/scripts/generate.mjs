/**
 * generate.mjs — baca poc/shared/* + dist/client/client.js, tulis src/generated.ts.
 *
 * File hasil generate di-.gitignore (poc/og-a/src/generated.ts); `npm run build`
 * selalu me-regenerate-nya, jadi checkout bersih tetap bisa build.
 * Dijalankan juga oleh `npm run typecheck` sebelum tsc, supaya worker.ts
 * yang mengimpor ./generated bisa dicek tipenya.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHARED = path.resolve(ROOT, '..', 'shared');

export async function generate() {
  const fixture = JSON.parse(
    await readFile(path.join(SHARED, 'fixture.json'), 'utf8'),
  );
  const css = await readFile(path.join(SHARED, 'shared.css'), 'utf8');
  const clientJs = await readFile(
    path.join(ROOT, 'dist', 'client', 'client.js'),
    'utf8',
  );

  const imageNames = [
    ...new Set(
      fixture.invitations.flatMap((inv) => [inv.ogImage, inv.coverImage]),
    ),
  ];
  const images = {};
  for (const name of imageNames) {
    images[name] = (await readFile(path.join(SHARED, name))).toString('base64');
  }

  const out = `// GENERATED — jangan edit manual. Dibuat scripts/generate.mjs dari poc/shared/* + dist/client/client.js.
import type { Invitation } from './types';

export const INVITATIONS: Invitation[] = ${JSON.stringify(fixture.invitations)};

export const SHARED_CSS: string = ${JSON.stringify(css)};

export const CLIENT_JS: string = ${JSON.stringify(clientJs)};

export const IMAGES: Record<string, string> = ${JSON.stringify(images)};
`;
  await writeFile(path.join(ROOT, 'src', 'generated.ts'), out, 'utf8');
  return { invitations: fixture.invitations.length, images: imageNames.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = await generate();
  console.log(
    `generated.ts: ${r.invitations} undangan, ${r.images} gambar ter-inline`,
  );
}
