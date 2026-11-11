/**
 * Varian A — Hono + React + Vite + TypeScript (POC Open Graph Kita Invite).
 *
 * Worker self-contained: semua aset (fixture, CSS bersama, client bundle,
 * gambar JPEG) di-inline saat build ke dist/worker.mjs — tidak ada import
 * eksternal dan tidak ada akses filesystem saat runtime. Bisa diimpor
 * langsung di Node: `import worker from './dist/worker.mjs'` lalu
 * `worker.fetch(new Request(url))`.
 *
 * Ruang lingkup POC: tanpa pembayaran, login, form kontak, atau data nyata.
 * Semua undangan fiktif (poc/shared/fixture.json).
 */
import { Hono } from 'hono';
import { CLIENT_JS, IMAGES, INVITATIONS, SHARED_CSS } from './generated';
import type { Invitation } from './types';

const NOT_FOUND_TEXT = 'Undangan tidak ditemukan';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Decode base64 ke bytes tanpa global khusus Node/Workers (atob ada di keduanya). */
function b64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function findInvitation(slug: string): Invitation | undefined {
  return INVITATIONS.find((inv) => inv.slug === slug);
}

function htmlShell(title: string, body: string, headExtra = ''): string {
  return (
    '<!doctype html>\n' +
    '<html lang="id">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    `<title>${esc(title)}</title>\n` +
    headExtra +
    `<style>\n${SHARED_CSS}\n</style>\n` +
    '</head>\n<body>\n' +
    body +
    '\n</body>\n</html>\n'
  );
}

function notFoundHtml(): string {
  return htmlShell(
    `${NOT_FOUND_TEXT} — Kita Invite`,
    '<main class="page"><section class="hero">' +
      `<h1 class="hero__names">${esc(NOT_FOUND_TEXT)}</h1>` +
      '<p class="hero__date">Tautan undangan yang Anda buka tidak tersedia.</p>' +
      '<p class="hero__venue">Periksa kembali tautan undangan Anda.</p>' +
      '</section></main>',
  );
}

function invitationHtml(inv: Invitation, origin: string): string {
  const pageUrl = `${origin}/${inv.slug}`;
  const imageUrl = `${origin}/images/${inv.ogImage}`;
  const embedded = JSON.stringify(inv).replace(/</g, '\\u003c');
  const head =
    `<link rel="canonical" href="${esc(pageUrl)}">\n` +
    `<meta property="og:title" content="${esc(inv.title)}">\n` +
    `<meta property="og:description" content="${esc(inv.description)}">\n` +
    '<meta property="og:type" content="website">\n' +
    `<meta property="og:url" content="${esc(pageUrl)}">\n` +
    `<meta property="og:image" content="${esc(imageUrl)}">\n` +
    '<meta property="og:image:width" content="1200">\n' +
    '<meta property="og:image:height" content="630">\n' +
    '<meta property="og:image:type" content="image/jpeg">\n';
  // Konten statis di dalam #root sebagai fallback sebelum React mount;
  // React (createRoot) menggantinya saat bundle client jalan.
  const fallback =
    '<main class="page"><section class="hero">' +
    `<img class="hero__cover" src="/images/${esc(inv.coverImage)}" alt="Sampul undangan ${esc(inv.names)}">` +
    '<p class="hero__eyebrow">Undangan Pernikahan</p>' +
    `<h1 class="hero__names">${esc(inv.names)}</h1>` +
    `<p class="hero__date">${esc(inv.dateDisplay)}</p>` +
    `<p class="hero__venue">${esc(inv.venue)}</p>` +
    '<button class="open-btn" type="button">Buka Undangan</button>' +
    '<noscript><p>Konten interaktif memerlukan JavaScript.</p></noscript>' +
    '</section></main>';
  const body =
    `<div id="root">${fallback}</div>\n` +
    `<script id="invitation-data" type="application/json">${embedded}</script>\n` +
    '<script src="/assets/client.js"></script>';
  return htmlShell(inv.title, body, head);
}

const app = new Hono();

const NO_STORE = { 'Cache-Control': 'no-store' };

app.get('/', (c) => {
  const links = INVITATIONS.map(
    (inv) =>
      `<p><a href="/${esc(inv.slug)}">${esc(inv.names)}</a> — ${esc(inv.dateDisplay)}, ${esc(inv.venue)}</p>`,
  ).join('\n');
  const body =
    '<main class="page"><section class="hero">' +
    '<h1 class="hero__names">Kita Invite — POC Open Graph</h1>' +
    '<p class="hero__date">Varian A: Hono + React + Vite + TypeScript</p>' +
    '<p class="hero__venue">POC ini membandingkan rendering metadata Open Graph ' +
    'per undangan. Semua nama, tanggal, dan venue bersifat fiktif; ' +
    'tanpa pembayaran, login, atau form kontak.</p>' +
    '</section><section class="section">' +
    '<h2 class="section__title">Undangan Fiktif</h2><hr class="section__rule">' +
    links +
    '</section></main>';
  return c.html(htmlShell('Kita Invite — POC Open Graph (Varian A: Hono + React)', body), 200, NO_STORE);
});

app.get('/api/invitation/:slug', (c) => {
  const inv = findInvitation(c.req.param('slug'));
  if (!inv) {
    return c.json({ error: NOT_FOUND_TEXT.toLowerCase() }, 404, NO_STORE);
  }
  return c.json(inv, 200, NO_STORE);
});

app.get('/images/:name', (c) => {
  const name = c.req.param('name');
  const b64 = IMAGES[name];
  if (!b64) {
    return c.text(NOT_FOUND_TEXT, 404, NO_STORE);
  }
  return new Response(b64ToBytes(b64), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
});

app.get('/assets/client.js', (c) => {
  return new Response(CLIENT_JS, {
    headers: { 'Content-Type': 'text/javascript; charset=utf-8', ...NO_STORE },
  });
});

// Browser otomatis meminta /favicon.ico; tanpa ini request jatuh ke /:slug
// → 404 + console error di first load (ditemukan di audit deployed, K4 49/50).
// POC tidak punya favicon — 204 bersih, sama seperti varian B.
app.get('/favicon.ico', () => new Response(null, { status: 204, headers: NO_STORE }));

app.get('/:slug', (c) => {
  const slug = c.req.param('slug');
  const inv = findInvitation(slug);
  if (!inv) {
    return c.html(notFoundHtml(), 404, NO_STORE);
  }
  const origin = new URL(c.req.url).origin;
  return c.html(invitationHtml(inv, origin), 200, NO_STORE);
});

export default {
  fetch: (request: Request): Response | Promise<Response> => app.fetch(request),
};
