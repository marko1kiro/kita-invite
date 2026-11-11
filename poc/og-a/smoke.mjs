/**
 * smoke.mjs — impor dist/worker.mjs, panggil fetch() untuk semua route,
 * assert status + OG meta + content-type. Exit 0 bila semua lolos.
 * Tidak butuh server / jaringan: fetch langsung ke objek worker.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from './dist/worker.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SHARED = path.resolve(ROOT, '..', 'shared');
const BASE = 'http://localhost:8787';

const failures = [];
const passes = [];

function check(name, cond, extra = '') {
  if (cond) {
    passes.push(name);
    console.log(`PASS  ${name}${extra ? ` — ${extra}` : ''}`);
  } else {
    failures.push(name);
    console.log(`FAIL  ${name}${extra ? ` — ${extra}` : ''}`);
  }
}

async function get(p) {
  const res = await worker.fetch(new Request(BASE + p));
  return { res, text: await res.text() };
}

async function getBytes(p) {
  const res = await worker.fetch(new Request(BASE + p));
  return { res, buf: Buffer.from(await res.arrayBuffer()) };
}

const ogAisha = readFileSync(path.join(SHARED, 'og-aisha.jpg'));
const ogCitra = readFileSync(path.join(SHARED, 'og-citra.jpg'));

// --- index ---
{
  const { res, text } = await get('/');
  check('GET / -> 200', res.status === 200, `status=${res.status}`);
  check('GET / content-type html', (res.headers.get('content-type') || '').includes('text/html'));
  check('GET / judul varian A', text.includes('Kita Invite — POC Open Graph (Varian A: Hono + React)'));
  check('GET / tautan aisha-dan-bima', text.includes('href="/aisha-dan-bima"'));
  check('GET / tautan citra-dan-dimas', text.includes('href="/citra-dan-dimas"'));
}

// --- halaman undangan + OG meta ---
async function checkInvitation(slug, namesEsc, ogFile, dateDisplay) {
  const { res, text } = await get(`/${slug}`);
  const origin = BASE;
  check(`GET /${slug} -> 200`, res.status === 200, `status=${res.status}`);
  check(`GET /${slug} no-store`, (res.headers.get('cache-control') || '') === 'no-store');
  check(`GET /${slug} <title>`, text.includes(`<title>${namesEsc} — Undangan Pernikahan</title>`));
  check(`GET /${slug} canonical`, text.includes(`<link rel="canonical" href="${origin}/${slug}">`));
  check(`GET /${slug} og:title`, text.includes(`<meta property="og:title" content="${namesEsc} — Undangan Pernikahan">`));
  check(`GET /${slug} og:description`, text.includes('<meta property="og:description" content="Undangan pernikahan'));
  check(`GET /${slug} og:type website`, text.includes('<meta property="og:type" content="website">'));
  check(`GET /${slug} og:url absolut`, text.includes(`<meta property="og:url" content="${origin}/${slug}">`));
  check(`GET /${slug} og:image absolut`, text.includes(`<meta property="og:image" content="${origin}/images/${ogFile}">`));
  check(`GET /${slug} og:image:width 1200`, text.includes('<meta property="og:image:width" content="1200">'));
  check(`GET /${slug} og:image:height 630`, text.includes('<meta property="og:image:height" content="630">'));
  check(`GET /${slug} og:image:type jpeg`, text.includes('<meta property="og:image:type" content="image/jpeg">'));
  check(`GET /${slug} CSS bersama inline`, text.includes('--ivory') && text.includes('.open-btn'));
  check(`GET /${slug} JSON fixture tersemat`, text.includes('id="invitation-data"') && text.includes(`"slug":"${slug}"`));
  check(`GET /${slug} script client`, text.includes('<script src="/assets/client.js"></script>'));
  check(`GET /${slug} nama + tanggal tampil`, text.includes(namesEsc) && text.includes(dateDisplay));
}
await checkInvitation('aisha-dan-bima', 'Aisha &amp; Bima', 'og-aisha.jpg', 'Sabtu, 20 Februari 2027');
await checkInvitation('citra-dan-dimas', 'Citra &amp; Dimas', 'og-citra.jpg', 'Minggu, 14 Maret 2027');

// --- API JSON ---
async function checkApi(slug, names) {
  const { res, text } = await get(`/api/invitation/${slug}`);
  check(`GET /api/invitation/${slug} -> 200`, res.status === 200, `status=${res.status}`);
  check(`GET /api/invitation/${slug} content-type json`, (res.headers.get('content-type') || '').includes('application/json'));
  const data = JSON.parse(text);
  check(`GET /api/invitation/${slug} slug+names`, data.slug === slug && data.names === names);
}
await checkApi('aisha-dan-bima', 'Aisha & Bima');
await checkApi('citra-dan-dimas', 'Citra & Dimas');

// --- gambar (bytes persis file shared) ---
async function checkImage(name, expected) {
  const { res, buf } = await getBytes(`/images/${name}`);
  check(`GET /images/${name} -> 200`, res.status === 200, `status=${res.status}`);
  check(`GET /images/${name} content-type jpeg`, (res.headers.get('content-type') || '') === 'image/jpeg');
  check(`GET /images/${name} bytes persis`, buf.equals(expected), `${buf.length} byte`);
}
await checkImage('og-aisha.jpg', ogAisha);
await checkImage('og-citra.jpg', ogCitra);

// --- client bundle ---
{
  const { res, text } = await get('/assets/client.js');
  check('GET /assets/client.js -> 200', res.status === 200, `status=${res.status}`);
  check('GET /assets/client.js content-type js', (res.headers.get('content-type') || '').includes('javascript'));
  check('GET /assets/client.js berisi "Buka Undangan"', text.includes('Buka Undangan'));
}

// --- slug tak dikenal: 404, tanpa bocor data pasangan lain ---
{
  const { res, text } = await get('/slug-tidak-ada');
  check('GET /slug-tidak-ada -> 404', res.status === 404, `status=${res.status}`);
  check('GET /slug-tidak-ada pesan jelas', text.toLowerCase().includes('undangan tidak ditemukan'));
  check(
    'GET /slug-tidak-ada tanpa data pasangan lain',
    !text.includes('Aisha') && !text.includes('Bima') && !text.includes('Citra') && !text.includes('Dimas'),
  );
}
{
  const { res, text } = await get('/api/invitation/slug-tidak-ada');
  check('GET /api/invitation/slug-tidak-ada -> 404', res.status === 404, `status=${res.status}`);
  check('GET /api/invitation/slug-tidak-ada pesan jelas', text.toLowerCase().includes('tidak ditemukan'));
  check(
    'GET /api/invitation/slug-tidak-ada tanpa data pasangan lain',
    !text.includes('Aisha') && !text.includes('Citra'),
  );
}
{
  const { res } = await get('/images/tidak-ada.jpg');
  check('GET /images/tidak-ada.jpg -> 404', res.status === 404, `status=${res.status}`);
}

console.log(`\n${passes.length} lolos, ${failures.length} gagal`);
if (failures.length > 0) {
  console.log('Gagal:', failures.join(', '));
  process.exit(1);
}
console.log('SMOKE HIJAU');
