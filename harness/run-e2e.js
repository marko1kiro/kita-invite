#!/usr/bin/env node
// Harness E2E v24 (disertakan di branch; nama file DIPERTAHANKAN di ronde
// v24): jalankan alur browser END-TO-END pada clone lokal disposable
// dengan data sintetis — Playwright Chromium nyata terhadap server HTTP
// lokal yang menyajikan tree ini. BUKAN jsdom: layout, klik, isi form,
// reload, dan persistensi diuji di browser sungguhan.
//
// Penggunaan:
//   node run-e2e.js [out.json] [--only <id>] [--root <tree-dir>]
//   atau: npm run test:e2e   (menjalankan "node run-e2e.js ./e2e-result.json"
//   dari dalam folder harness/ — hasil JSON ditulis ke
//   harness/e2e-result.json, artefak run lokal, BUKAN bagian commit;
//   ringkasan jelas juga dicetak ke stdout, lihat E2E SUMMARY di akhir)
//
// Modul tes tinggal di harness/e2e/*.js, masing-masing mengekspor:
//   module.exports = { id: '2a', name: '2A Dashboard', run: async (t) => {...} }
// dengan t = helper: t.page, t.baseUrl, t.goto(hash), t.check(nama, ok, detail),
// t.section(nama), t.shot(nama), t.setViewport(w, h), t.eval(fn, ...args),
// t.reload(), t.storageCounts(), t.click/fill/select passthrough.
// Setiap modul mendapat browser context SEGAR (localStorage kosong -> seed
// baru), jadi modul tidak saling mengotori data.
//
// Chromium: playwright-core (TIDAK mengunduh browser saat npm ci).
// Binary diambil dari env PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH (atau
// CHROMIUM_PATH), lalu dari cache Playwright bawaan VM
// (~/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome), lalu
// fallback default playwright-core (akan gagal dengan pesan jelas bila
// tidak ada binary — jalankan `npx playwright install chromium` di
// mesin yang belum punya binary, atau set env di atas).
// JANGAN PERNAH jalankan runner ini terhadap Pages publik — root HARUS
// tree lokal (guard: root harus berisi index.html + js/13-s2-handlers.js).
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function parseArgs(argv) {
  const out = { out: null, only: null, root: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only') out.only = argv[++i];
    else if (a === '--root') out.root = argv[++i];
    else if (!a.startsWith('--') && !out.out) out.out = a;
  }
  return out;
}

function serve(root) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const fp = path.join(root, p === '/' ? 'index.html' : p);
      if (!fp.startsWith(root) || !fs.existsSync(fp) || !fs.statSync(fp).isFile()) { res.writeHead(404); res.end('nf'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
      fs.createReadStream(fp).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function chromiumExecutable() {
  const fromEnv = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || process.env.CHROMIUM_PATH;
  if (fromEnv) return fromEnv;
  const cached = path.join(process.env.HOME || '/home/hatch', '.cache/ms-playwright/chromium-1254/chrome-linux64/chrome');
  if (fs.existsSync(cached)) return cached;
  return undefined; // biar playwright-core yang memutuskan (error jelas bila tak ada)
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const ROOT = path.resolve(args.root || path.join(__dirname, '..'));
  const OUT = path.resolve(args.out || path.join(__dirname, 'e2e-result.json'));
  if (!fs.existsSync(path.join(ROOT, 'index.html')) || !fs.existsSync(path.join(ROOT, 'js/13-s2-handlers.js'))) {
    console.error('E2E ABORT: root bukan tree Kita Invite lokal (tidak ada index.html / js/13-s2-handlers.js): ' + ROOT);
    console.error('Runner ini HANYA untuk clone lokal — jangan arahkan ke Pages publik.');
    process.exit(2);
  }
  const E2E_DIR = path.join(__dirname, 'e2e');
  const SHOT_DIR = path.join(path.dirname(OUT), 'e2e-shots');
  const modFiles = fs.existsSync(E2E_DIR) ? fs.readdirSync(E2E_DIR).filter(f => f.endsWith('.js') && !f.startsWith('_')).sort() : [];
  const modules = [];
  for (const f of modFiles) {
    const m = require(path.join(E2E_DIR, f));
    if (!m || !m.id || typeof m.run !== 'function') { console.error('E2E ABORT: modul tidak valid: ' + f + ' (butuh {id, name, run})'); process.exit(2); }
    modules.push(m);
  }
  const selected = args.only ? modules.filter(m => m.id === args.only) : modules;
  if (selected.length === 0) { console.error('E2E ABORT: tidak ada modul' + (args.only ? ' dengan id ' + args.only : '')); process.exit(2); }

  const { server, port } = await serve(ROOT);
  const baseUrl = `http://127.0.0.1:${port}`;
  let browser;
  try {
    browser = await chromium.launch({ executablePath: chromiumExecutable() });
  } catch (e) {
    console.error('E2E ABORT: Chromium tidak bisa diluncurkan: ' + (e && e.message));
    console.error('Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ke binary Chromium, atau jalankan `npx playwright install chromium`.');
    server.close();
    process.exit(2);
  }

  const result = { root: ROOT, baseUrl, startedAt: new Date().toISOString(), modules: [], totals: { checks: 0, passed: 0, failed: 0 } };
  try {
    for (const mod of selected) {
      const modResult = { id: mod.id, name: mod.name || mod.id, checks: [], passed: 0, failed: 0 };
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      let section = '';
      const shotDir = path.join(SHOT_DIR, mod.id);
      const t = {
        page, baseUrl, root: ROOT,
        goto: async (hash) => {
          const url = baseUrl + '/' + (hash ? '#/' + String(hash).replace(/^#\/?/, '') : '');
          await page.goto(url, { waitUntil: 'load', timeout: 20000 });
          try { await page.waitForSelector('.topbar', { timeout: 8000 }); } catch (e) {}
          await page.waitForTimeout(700);
        },
        reload: async () => {
          await page.reload({ waitUntil: 'load', timeout: 20000 });
          try { await page.waitForSelector('.topbar', { timeout: 8000 }); } catch (e) {}
          await page.waitForTimeout(700);
        },
        check: (name, ok, detail) => {
          const c = { section, name, pass: !!ok, detail: detail === undefined ? '' : String(detail) };
          modResult.checks.push(c);
          if (c.pass) modResult.passed++; else modResult.failed++;
        },
        section: (name) => { section = name; },
        shot: async (name) => {
          fs.mkdirSync(shotDir, { recursive: true });
          const p = path.join(shotDir, String(name).replace(/[^a-z0-9_-]+/gi, '-') + '.png');
          await page.screenshot({ path: p });
          return p;
        },
        setViewport: async (w, h) => { await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(400); },
        eval: (fn, ...a) => page.evaluate(fn, ...a),
        click: (sel, opts) => page.click(sel, opts),
        fill: (sel, val) => page.fill(sel, val),
        select: (sel, val) => page.selectOption(sel, val),
        storageCounts: () => page.evaluate(() => {
          const out = { invitations: 0, users: 0, guests: 0, rsvps: 0, orders: 0, payments: 0, services: 0, notifications: 0, activity: 0, coupons: 0, templates: 0, keys: [] };
          const read = (k) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return Array.isArray(v) ? v : null; } catch (e) { return null; } };
          const idx = read('vowora:v1:index');
          out.invitations = idx ? idx.length : 0;
          for (const [field, key] of [['users', 'vowora:v1:users'], ['guests', 'vowora:v1:guests'], ['rsvps', 'vowora:v1:rsvps'], ['orders', 'vowora:v1:orders'], ['payments', 'vowora:v1:payments'], ['services', 'vowora:v1:service-requests'], ['notifications', 'vowora:v1:notifications'], ['activity', 'vowora:v1:activity'], ['coupons', 'vowora:v1:coupons'], ['templates', 'vowora:v1:templates-cms']]) {
            const v = read(key);
            out[field] = v ? v.length : 0;
          }
          out.keys = Object.keys(localStorage).sort();
          return out;
        }),
      };
      try {
        await mod.run(t);
      } catch (e) {
        modResult.checks.push({ section, name: 'modul selesai tanpa throw', pass: false, detail: String((e && e.stack) || e) });
        modResult.failed++;
      } finally {
        await context.close();
      }
      result.modules.push(modResult);
      result.totals.checks += modResult.checks.length;
      result.totals.passed += modResult.passed;
      result.totals.failed += modResult.failed;
      console.log(`E2E [${mod.id}] ${mod.name}: ${modResult.passed}/${modResult.checks.length} PASS` + (modResult.failed ? ` — ${modResult.failed} FAIL` : ''));
      for (const c of modResult.checks.filter(c => !c.pass)) console.log(`  FAIL [${mod.id}] ${c.section ? c.section + ' / ' : ''}${c.name}: ${c.detail}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
  result.finishedAt = new Date().toISOString();
  result.exitCode = result.totals.failed > 0 ? 1 : 0;
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(`\nE2E SUMMARY: ${result.totals.passed}/${result.totals.checks} PASS | ${result.totals.failed} FAIL | modules: ${result.modules.length} | exit: ${result.exitCode}`);
  console.log('E2E result: ' + OUT);
  process.exit(result.exitCode);
}
main().catch(e => { console.error('E2E RUNNER ERROR', e); process.exit(2); });
