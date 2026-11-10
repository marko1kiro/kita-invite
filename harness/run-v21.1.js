#!/usr/bin/env node
// Harness v21.1 (disertakan di branch): sajikan tree v21.1/ lewat HTTP
// lokal, muat di jsdom (script eksternal ikut dimuat), jalankan suite
// fixture + handler in-page, dump state untuk 5 rute yang SAMA.
// Perbandingan storage dinormalisasi (buang field timestamp di semua
// kedalaman — terbukti volatil antar-boot bahkan pada monolit yang sama).
// Perbandingan baseline OPSIONAL: beri direktori baseline sebagai argumen
// ke-2 (atau env KI_BASELINE); tanpa itu, perbandingan dilewati dan
// hasil run dilaporkan apa adanya.
// Penggunaan: node run-v21.1.js [out.json] [baseline-dir]
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { JSDOM, VirtualConsole, requestInterceptor } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const BASE = process.argv[3] ? path.resolve(process.argv[3]) : (process.env.KI_BASELINE ? path.resolve(process.env.KI_BASELINE) : null);
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : null;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

// jsdom 31: tidak ada lagi ResourceLoader publik — blokir request
// non-localhost (Google Fonts dkk.) lewat interceptor agar gagal cepat
// alih-alih menggantung di koneksi egress yang diblokir.
const localOnlyResources = {
  interceptors: [
    requestInterceptor(async (request) => {
      const u = new URL(request.url);
      if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') return undefined;
      return new Response('', { status: 404, headers: { 'Content-Type': 'text/css' } });
    }),
  ],
};

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const fp = path.join(ROOT, p === '/' ? 'index.html' : p);
      if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || !fs.statSync(fp).isFile()) {
        res.writeHead(404); res.end('nf'); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
      fs.createReadStream(fp).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function loadPage(url, hash) {
  return new Promise((resolve, reject) => {
    const errors = [];
    const vc = new VirtualConsole();
    vc.on('jsdomError', (e) => errors.push('jsdomError: ' + (e.detail && e.detail.stack || e.message || String(e))));
    const dom = new JSDOM('<!doctype html>', {
      url: url + (hash || ''),
      runScripts: 'dangerously',
      resources: localOnlyResources,
      pretendToBeVisual: false,
      virtualConsole: vc,
      beforeParse(window) { window.structuredClone = structuredClone; window.scrollTo = () => {}; },
    });
    // Muat HTML lewat fetch (jsdom butuh dokumen dari URL agar src relatif resolve)
    fetch(url).then(r => r.text()).then((html) => {
      dom.window.document.open(); dom.window.document.write(html); dom.window.document.close();
      const done = () => resolve({ dom, errors });
      dom.window.addEventListener('load', () => setTimeout(done, 200));
      setTimeout(done, 8000); // fallback bila load tak kunjung datang
    }).catch(reject);
  });
}

const TS_KEYS = new Set(['at', 'createdAt', 'updatedAt', 'publishedAt', 'paidAt', 'joined', 'savedAt']);
function normalize(v) {
  if (Array.isArray(v)) return v.map(normalize);
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, val] of Object.entries(v)) {
      if (TS_KEYS.has(k)) continue;
      o[k] = normalize(val);
    }
    return o;
  }
  return v;
}
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

async function main() {
  const { server, port } = await serve();
  const baseUrl = `http://127.0.0.1:${port}/index.html`;
  const result = { baseUrl, httpStatus: {}, suites: {}, routes: {}, compare: {} };
  try {
    // 1) Semua path yang direferensikan harus 200
    const paths = ['/', '/index.html', '/css/design-system.css', '/css/renderer.css',
      '/css/builder.css', '/css/stage2.css',
      ...['01-core.js', '02-catalog.js', '03-state.js', '04-views.js', '05-builder.js',
        '06-s2-core.js', '07-s2-access.js', '08-s2-reset.js', '09-s2-fixtures.js',
        '10-s2-rsvp.js', '11-s2-seed.js', '12-s2-views.js', '13-s2-handlers.js'].map((f) => '/js/' + f)];
    for (const p of paths) {
      const r = await fetch(`http://127.0.0.1:${port}${p}`);
      result.httpStatus[p] = r.status;
      await r.arrayBuffer();
    }

    // 2) Suite fixture + handler pada halaman refactor
    const { dom, errors } = await loadPage(baseUrl, '#/');
    const { window } = dom;
    result.bootErrors = errors;
    await new Promise((r) => setTimeout(r, 300));
    for (const name of ['kiFixtureTests', 'kiHandlerTests']) {
      try {
        const out = window[name]();
        const cases = out.map((c) => ({ name: c.name, pass: !!c.pass, exp: c.exp, act: c.act }));
        result.suites[name] = { total: cases.length, passed: cases.filter((c) => c.pass).length, cases };
      } catch (e) {
        result.suites[name] = { error: 'THREW: ' + (e && e.stack || e) };
      }
    }
    // Storage setelah suite (harus 16 key, sama seperti baseline)
    const st = window.localStorage;
    const keys = []; for (let i = 0; i < st.length; i++) keys.push(st.key(i));
    result.storageKeysAfterSuite = keys.sort();
    dom.window.close();

    // 3) State per rute (fresh jsdom per rute, sama seperti dump-state baseline)
    const routeFiles = {
      '#/': 'state-home.json', '#/dashboard': 'state-dashboard.json',
      '#/admin': 'state-admin.json', '#/u/nadia-dan-reza': 'state-u_nadia-dan-reza.json',
      '#/template': 'state-template.json',
    };
    for (const [hash, file] of Object.entries(routeFiles)) {
      const r = await loadPage(baseUrl, hash);
      const w = r.dom.window;
      await new Promise((res2) => setTimeout(res2, 300));
      const S = w.eval('S'); const S2 = w.eval('S2');
      const storage = {};
      const lst = w.localStorage;
      for (let i = 0; i < lst.length; i++) { const k = lst.key(i); storage[k] = JSON.parse(lst.getItem(k)); }
      result.routes[hash] = {
        appHtmlSha: sha(w.document.getElementById('app').innerHTML),
        counts: { users: S2.users.length, guests: S2.guests.length, rsvps: S2.rsvps.length, orders: S2.orders.length, payments: S2.payments.length, services: S2.services.length, notifications: S2.notifications.length, activity: S2.activity.length, coupons: S2.coupons.length },
        invitations: (S.invitations || []).map((iv) => ({ id: iv.id, slug: iv.slug, ownerId: iv.ownerId, status: iv.status, templateId: iv.templateId, packageId: iv.packageId || null, archived: !!iv.archived, title: iv.title })),
        orders: (S2.orders || []).map((o) => ({ id: o.id, invitationId: o.invitationId, packageId: o.packageId, paymentStatus: o.paymentStatus, status: o.status, total: o.total })),
        storageNorm: normalize(storage),
        storageKeys: Object.keys(storage).sort(),
        bootErrors: r.errors,
      };
      r.dom.window.close();
    }

    // 4) Bandingkan dengan baseline (opsional — dilewati bila
    // direktori baseline tidak diberikan / tidak berisi file yang
    // diperlukan: suite-result.json + index.html + state-*.json).
    const hasBase = BASE && fs.existsSync(path.join(BASE, 'suite-result.json')) && fs.existsSync(path.join(BASE, 'index.html'));
    if (hasBase) {
        // 4) Bandingkan dengan baseline
        const baseSuite = JSON.parse(fs.readFileSync(path.join(BASE, 'suite-result.json'), 'utf8'));
        for (const name of ['kiFixtureTests', 'kiHandlerTests']) {
          const b = baseSuite.suites[name]; const a = result.suites[name];
          const same = !a.error && b.total === a.total && b.cases.every((c, i) => c.name === a.cases[i].name && !!c.pass === !!a.cases[i].pass);
          result.compare[name] = { baseline: `${b.passed}/${b.total}`, refactor: a.error ? 'ERROR ' + a.error : `${a.passed}/${a.total}`, identical: same };
        }
        // Rute: bandingkan dengan baseline yang dimuat FRESH back-to-back dalam
        // proses yang sama (bukan hash tersimpan yang usianya bermenit-menit) —
        // render dashboard memuat stempel waktu aktivitas seed
        // (new Date(a.at).toLocaleString) sehingga hash mentahnya berubah
        // tiap menit; back-to-back menghilangkan selisih waktu itu.
        const baseHtml = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
        async function loadBaselineRoute(hash) {
          const vc2 = new VirtualConsole(); vc2.on('jsdomError', () => {});
          const dom2 = new JSDOM(baseHtml, {
            url: 'http://localhost/' + hash, runScripts: 'dangerously',
            pretendToBeVisual: false, virtualConsole: vc2,
            beforeParse(w) { w.structuredClone = structuredClone; w.scrollTo = () => {}; },
          });
          await new Promise((r) => setTimeout(r, 300));
          const w = dom2.window;
          const S = w.eval('S'); const S2 = w.eval('S2');
          const storage = {};
          const lst = w.localStorage;
          for (let i = 0; i < lst.length; i++) { const k = lst.key(i); storage[k] = JSON.parse(lst.getItem(k)); }
          const out2 = {
            appHtmlSha: sha(w.document.getElementById('app').innerHTML),
            counts: { users: S2.users.length, guests: S2.guests.length, rsvps: S2.rsvps.length, orders: S2.orders.length, payments: S2.payments.length, services: S2.services.length, notifications: S2.notifications.length, activity: S2.activity.length, coupons: S2.coupons.length },
            invitations: (S.invitations || []).map((iv) => ({ id: iv.id, slug: iv.slug, ownerId: iv.ownerId, status: iv.status, templateId: iv.templateId, packageId: iv.packageId || null, archived: !!iv.archived, title: iv.title })),
            orders: (S2.orders || []).map((o) => ({ id: o.id, invitationId: o.invitationId, packageId: o.packageId, paymentStatus: o.paymentStatus, status: o.status, total: o.total })),
            storageNorm: normalize(storage),
            storageKeys: Object.keys(storage).sort(),
          };
          dom2.window.close();
          return out2;
        }
        for (const [hash, file] of Object.entries(routeFiles)) {
          const b = await loadBaselineRoute(hash);
          const a = result.routes[hash];
          const stored = JSON.parse(fs.readFileSync(path.join(BASE, file), 'utf8'));
          result.compare['route ' + hash] = {
            appHtmlShaFresh: { baseline: b.appHtmlSha, refactor: a.appHtmlSha, identical: b.appHtmlSha === a.appHtmlSha },
            appHtmlShaStored: { baseline: stored.appHtmlSha, refactor: a.appHtmlSha, identical: stored.appHtmlSha === a.appHtmlSha, note: 'hash tersimpan bisa berbeda karena stempel waktu aktivitas (lihat BASELINE §8)' },
            countsIdentical: JSON.stringify(b.counts) === JSON.stringify(a.counts),
            invitationsIdentical: JSON.stringify(b.invitations) === JSON.stringify(a.invitations),
            ordersIdentical: JSON.stringify(b.orders) === JSON.stringify(a.orders),
            storageKeysIdentical: JSON.stringify(b.storageKeys) === JSON.stringify(a.storageKeys),
            storageNormIdentical: JSON.stringify(b.storageNorm) === JSON.stringify(a.storageNorm),
            bootErrors: a.bootErrors,
          };
        }
        // Normalisasi storage refactor vs baseline TIDAK bisa dibandingkan dari
        // state-*.json (hanya hash) — simpan storageNorm refactor untuk arsip.
    } else {
      result.compare = { note: 'Baseline tidak diberikan/ditemukan — perbandingan dilewati. Beri argumen ke-2 (direktori baseline) untuk membandingkan.' };
    }
    if (OUT) fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ httpStatus: result.httpStatus, compare: result.compare, bootErrors: result.bootErrors, storageKeysAfterSuite: result.storageKeysAfterSuite }, null, 2));
  } finally {
    server.close();
  }
  process.exit(0);
}
main().catch((e) => { console.error('HARNESS ERROR', e); process.exit(2); });
