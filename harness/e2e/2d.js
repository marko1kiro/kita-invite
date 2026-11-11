// Modul 2D — Admin CMS (checkpoint v24, verifikasi akhir Stage 2).
// Repo-direct, clone lokal disposable. TIDAK mengubah kode aplikasi.
// Bukti: browser lokal (Playwright) + storage + source/fixtures.
module.exports = {
  id: '2d',
  name: '2D Admin CMS',
  run: async (t) => {
    const sleep = (ms) => t.page.waitForTimeout(ms);
    const appText = () => t.eval(() => document.getElementById('app').innerText);
    const appHtml = () => t.eval(() => document.getElementById('app').innerHTML);
    const toast = () => t.eval(() => { const el = document.querySelector('#toast'); return el ? (el.textContent || '') : ''; });
    const ls = (k) => t.eval((key) => { try { const v = localStorage.getItem(key); return v === null ? null : JSON.parse(v); } catch (e) { return 'PARSE-ERR:' + e.message; } }, k);
    const navOn = (tab) => t.eval((tb) => !!document.querySelector('a[href="#/admin?tab=' + tb + '"].on'), tab);
    const setRole = async (role) => { await t.select('#s2-role', role); await sleep(600); };
    const grantOn = async () => {
      await t.click('[data-s2="admin-write-toggle"]'); await sleep(300);
      await t.click('#s2-modal-ok'); await sleep(400);
    };
    const bannerText = () => t.eval(() => { const c = document.querySelector('.admin-grid'); const card = c ? c.previousElementSibling : null; return card ? card.innerText.replace(/\n/g, ' | ') : ''; });
    const invRec = (id) => ls('vowora:v1:invitation:' + id).then(r => (r && r.invitation) || null);

    // ---------- Gerbang peran ----------
    t.section('gerbang peran');
    await t.goto('admin');
    let txt = await appText();
    t.check('customer #/admin -> Akses Ditolak', txt.includes('Akses ditolak') && txt.includes('peran tidak sesuai') && !txt.includes('Panel Admin'), 'teks memuat "Akses ditolak — peran tidak sesuai"; "Panel Admin" hadir=' + txt.includes('Panel Admin'));
    await t.goto('dashboard');
    await setRole('admin');
    txt = await appText();
    t.check('role admin -> Panel Admin tampil', txt.includes('Panel Admin'), 'h1="Panel Admin" hadir=' + txt.includes('Panel Admin') + '; hash=' + await t.eval(() => location.hash));
    const banner0 = await bannerText();
    t.check('admin default = mode inspeksi (tanpa grant)', banner0.includes('Mode Inspeksi Admin: hanya-lihat lintas-pemilik'), banner0.slice(0, 160));
    await t.shot('admin-panel');

    // ---------- 14 tab ----------
    t.section('tab admin 14/14');
    const TABS = [
      ['ringkasan', null], ['template', 'Template CMS'], ['kategori', 'Kategori Acara'],
      ['gaya', 'Gaya Visual'], ['pelanggan', 'Pelanggan & Akun Demo'], ['undangan', 'Semua Undangan'],
      ['pesanan', 'Semua Pesanan'], ['pembayaran', 'Pembayaran (Simulasi)'], ['layanan', 'Antrean Layanan Bantuan'],
      ['media', 'Pustaka Media'], ['paket', 'Paket & Harga'], ['kupon', null],
      ['notifikasi', 'Notifikasi Platform'], ['pengaturan', 'Pengaturan Platform (Demo)'],
    ];
    for (const [tab, marker] of TABS) {
      await t.goto('admin?tab=' + tab);
      const hasMarker = marker ? (await appText()).includes(marker)
        : tab === 'ringkasan' ? await t.eval(() => !!document.querySelector('.stat-grid'))
        : tab === 'kupon' ? await t.eval(() => { const h = document.querySelector('.admin-grid h2'); return h ? h.textContent : ''; }) === 'Kupon'
        : false;
      const on = await navOn(tab);
      t.check('tab ' + tab + ' tampil + nav tersorot', hasMarker && on, 'marker=' + (marker || (tab === 'ringkasan' ? '.stat-grid' : 'h2=Kupon')) + ' hadir=' + hasMarker + '; nav-on=' + on);
    }
    await t.goto('admin');
    const defOn = await navOn('ringkasan');
    const defGrid = await t.eval(() => !!document.querySelector('.stat-grid'));
    t.check('#/admin polos -> tab default Ringkasan', defOn && defGrid, 'nav ringkasan on=' + defOn + '; stat-grid=' + defGrid);

    // ---------- Alias + fallback (regresi v22) ----------
    t.section('alias + fallback v22');
    await t.goto('admin?tab=bantuan');
    txt = await appText();
    t.check('alias bantuan -> Layanan', txt.includes('Antrean Layanan Bantuan') && await navOn('layanan'), 'konten "Antrean Layanan Bantuan" hadir; nav layanan on=' + await navOn('layanan'));
    await t.goto('admin?tab=ngawur');
    txt = await appText();
    const unkGrid = await t.eval(() => !!document.querySelector('.stat-grid'));
    t.check('tab ngawur -> pemberitahuan + Ringkasan', txt.includes('Tab tidak dikenal') && txt.includes('Tab “ngawur” tidak ada') && unkGrid && await navOn('ringkasan'), 'notice=' + txt.includes('Tab tidak dikenal') + '; stat-grid=' + unkGrid + '; nav ringkasan on=' + await navOn('ringkasan'));

    // ---------- Lintas-pemilik: read-only + grant ----------
    t.section('lintas-pemilik read-only + grant');
    await t.goto('admin?tab=undangan');
    txt = await appText();
    const writeBtnsUnd = await t.eval(() => document.querySelectorAll('.admin-grid .card [data-s2]').length);
    t.check('admin undangan: record cust-2 tampil, tanpa tombol tulis', txt.includes('Nusantara Tech') && txt.includes('Summit Prime') && writeBtnsUnd === 0, 'baris cust-2 "Nusantara Tech / Summit Prime" hadir; tombol [data-s2] di daftar=' + writeBtnsUnd);
    // Builder milik cust-2 sebagai admin tanpa grant
    const palBefore = await invRec('seed-inv-3').then(r => r && r.design && r.design.paletteId);
    await t.goto('studio/seed-inv-3');
    txt = await appText();
    const readonlyFlag = await t.eval(() => (typeof B !== 'undefined' ? B.readonly : 'B-tak-ada'));
    const saveBtnAbsent = await t.eval(() => !document.querySelector('[data-save]'));
    t.check('builder cust-2 sbg admin: mode inspeksi, tanpa Simpan', txt.includes('Mode inspeksi Admin') && txt.includes('Hanya-baca') && readonlyFlag === true && saveBtnAbsent, 'banner inspeksi=' + txt.includes('Mode inspeksi Admin') + '; B.readonly=' + readonlyFlag + '; [data-save] absen=' + saveBtnAbsent);
    await t.click('[data-btab="desain"]'); await sleep(300);
    const palDisabled = await t.eval(() => { const b = document.querySelector('[data-pal="slate"]'); return b ? b.matches(':disabled') : 'tak-ada'; });
    const fieldsetDisabled = await t.eval(() => !!document.querySelector('#b-main fieldset[disabled]'));
    const palAfterDeny = await invRec('seed-inv-3').then(r => r && r.design && r.design.paletteId);
    t.check('editor read-only: fieldset disabled + tombol palet nonaktif + storage tak berubah', palDisabled === true && fieldsetDisabled === true && palAfterDeny === palBefore, 'palet disabled=' + palDisabled + '; fieldset[disabled]=' + fieldsetDisabled + '; paletteId storage tetap=' + palAfterDeny);
    // Grant via banner builder, lalu tulis berhasil
    await t.click('[data-admin-write]'); await sleep(400);
    const toastGrant = await toast();
    txt = await appText();
    t.check('grant via banner builder aktif', toastGrant.includes('Izin tulis Admin lintas-pemilik aktif') && txt.includes('Izin tulis Admin lintas-pemilik AKTIF'), 'toast="' + toastGrant.slice(0, 80) + '"');
    await t.click('[data-btab="desain"]'); await sleep(300);
    await t.click('[data-pal="slate"]'); await sleep(1000);
    const palAfterGrant = await invRec('seed-inv-3').then(r => r && r.design && r.design.paletteId);
    t.check('klik palet DENGAN grant tersimpan', palAfterGrant === 'slate', 'paletteId storage=' + palAfterGrant + ' (sebelum=' + palBefore + ')');
    await t.click('[data-pal="inkblue"]'); await sleep(1000);
    const palRestored = await invRec('seed-inv-3').then(r => r && r.design && r.design.paletteId);
    t.check('palet dikembalikan ke inkblue', palRestored === 'inkblue', 'paletteId storage=' + palRestored);
    await t.click('[data-admin-write-off]'); await sleep(400);
    // Order lintas-pemilik: tolak tanpa grant, lolos dengan grant
    await t.goto('admin?tab=pesanan');
    const ordBtn = await t.eval(() => !!document.querySelector('[data-s2="order-done"][data-id="seed-order-2"]'));
    const ordBefore = await t.eval(() => { const o = S2.orders.find(x => x.id === 'seed-order-2'); return o ? o.status : 'tak-ada'; });
    t.check('order cust-2 KI-2026-1002 tampil + tombol Tandai Selesai', ordBtn && ordBefore === 'Diproses', 'tombol=' + ordBtn + '; status awal=' + ordBefore);
    await t.click('[data-s2="order-done"][data-id="seed-order-2"]'); await sleep(300);
    const toastOrdDeny = await toast();
    const ordAfterDeny = await t.eval(() => { const o = S2.orders.find(x => x.id === 'seed-order-2'); return o ? o.status : 'tak-ada'; });
    t.check('order-done tanpa grant DITOLAK', toastOrdDeny.includes('Mode inspeksi Admin') && ordAfterDeny === 'Diproses', 'toast="' + toastOrdDeny.slice(0, 80) + '"; status tetap=' + ordAfterDeny);
    await grantOn();
    const banner1 = await bannerText();
    t.check('grant via panel toggle AKTIF', banner1.includes('Izin Tulis Admin: AKTIF (sesi ini)'), banner1.slice(0, 120));
    await t.click('[data-s2="order-done"][data-id="seed-order-2"]'); await sleep(400);
    const toastOrdOk = await toast();
    const ordAfterGrant = await t.eval(() => { const o = S2.orders.find(x => x.id === 'seed-order-2'); return o ? o.status : 'tak-ada'; });
    t.check('order-done DENGAN grant berhasil', ordAfterGrant === 'Selesai' && toastOrdOk.includes('ditandai selesai'), 'status=' + ordAfterGrant + '; toast="' + toastOrdOk.slice(0, 60) + '"');
    // Grant TIDAK persist lintas reload (sesi baru)
    await t.reload();
    const bannerAfterReload = await bannerText();
    const grantAfterReload = await t.eval(() => window.__kiAdminWrite === true);
    const roleAfterReload = await t.eval(() => S2.role);
    t.check('grant hilang sesudah reload (sesi baru), peran tetap admin', bannerAfterReload.includes('Mode Inspeksi Admin') && grantAfterReload === false && roleAfterReload === 'admin', 'banner="' + bannerAfterReload.slice(0, 80) + '"; __kiAdminWrite=' + grantAfterReload + '; role=' + roleAfterReload);
    // Grant dicabut saat ganti peran
    await grantOn();
    const grantOnNow = await t.eval(() => window.__kiAdminWrite === true);
    await setRole('customer');
    const grantAfterRoleSwitch = await t.eval(() => window.__kiAdminWrite === true);
    await t.goto('admin');
    const deniedAgain = (await appText()).includes('Akses ditolak');
    t.check('grant dicabut saat ganti peran (kiRevokeAdminGrant)', grantOnNow === true && grantAfterRoleSwitch === false && deniedAgain, '__kiAdminWrite sebelum=' + grantOnNow + ' sesudah ganti peran=' + grantAfterRoleSwitch + '; #/admin sbg customer ditolak=' + deniedAgain);
    await t.goto('dashboard');
    await setRole('admin');

    // ---------- Template CMS: buat / edit / terbit / arsip ----------
    t.section('template CMS CRUD');
    const cmsBefore = await ls('vowora:v1:templates-cms');
    const cmsBeforeN = cmsBefore === null ? 0 : (Array.isArray(cmsBefore) ? cmsBefore.length : -1);
    t.check('storage templates-cms awal kosong', cmsBeforeN === 0, 'jumlah=' + cmsBeforeN + ' (key absen dihitung 0)');
    // Snapshot versi lama SEBELUM edit luxury-ivory
    const inv1Before = await invRec('seed-inv-1');
    const provenBefore = await t.eval(() => { const iv = S.invitations.find(i => i.id === 'seed-inv-1'); const p = kiInvTemplateProven(iv); return p ? { name: p.name, price: p.price, tier: p.tier, version: p.version } : null; });
    t.check('seed-inv-1 pra-edit: templateVersion=1, snapshot v1', inv1Before && inv1Before.templateVersion === 1 && provenBefore && provenBefore.version === 1 && provenBefore.name === 'Luxury Ivory', 'templateVersion=' + (inv1Before && inv1Before.templateVersion) + '; snapshot=' + JSON.stringify(provenBefore));
    // Buat template baru lewat form nyata
    await t.goto('admin?tab=template');
    await t.click('[data-s2="tpl-new"]'); await sleep(500);
    const newHash = await t.eval(() => location.hash);
    const newTplId = (newHash.match(/edit=(tpl-[a-z0-9]+)/) || [])[1] || '';
    t.check('tpl-new membuka form edit template baru', !!newTplId && newHash.includes('edit=' + newTplId), 'hash=' + newHash);
    await t.fill('#tf-name', 'Template Uji 2D');
    await t.fill('#tf-price', '49000');
    await t.fill('#tf-desc', 'Template uji checkpoint 2D');
    await t.select('#tf-tier', 'Basic');
    await t.select('#tf-status', 'draft');
    await t.click('#s2-tpl-form button[type="submit"]'); await sleep(500);
    const cmsAfterCreate = await ls('vowora:v1:templates-cms');
    const created = (cmsAfterCreate || []).find(x => x.id === newTplId);
    txt = await appText();
    t.check('template baru tersimpan di templates-cms + tampil di daftar', !!created && created.name === 'Template Uji 2D' && created.status === 'draft' && txt.includes('Template Uji 2D'), 'storage=' + JSON.stringify(created && { id: created.id, name: created.name, version: created.version, status: created.status }) + '; daftar memuat nama=' + txt.includes('Template Uji 2D'));
    t.check('simpan form template menaikkan versi (v1 -> v2)', created && created.version === 2, 'version storage=' + (created && created.version) + ' (tpl-new membuat v1, submit form menaikkan ke v2)');
    // Edit luxury-ivory (template yang dipakai seed-inv-1)
    await t.goto('admin?tab=template&edit=luxury-ivory');
    await t.fill('#tf-name', 'Luxury Ivory (Uji 2D)');
    await t.fill('#tf-price', '69000');
    await t.click('#s2-tpl-form button[type="submit"]'); await sleep(500);
    const cmsAfterEdit = await ls('vowora:v1:templates-cms');
    const luxCms = (cmsAfterEdit || []).find(x => x.id === 'luxury-ivory');
    const hist = await ls('vowora:v1:templates-history');
    txt = await appText();
    t.check('edit luxury-ivory: v1->v2, nama+harga berubah, histori v1 tersimpan', !!luxCms && luxCms.version === 2 && luxCms.name === 'Luxury Ivory (Uji 2D)' && luxCms.price === 69000 && !!(hist && hist['luxury-ivory'] && hist['luxury-ivory']['1'] && hist['luxury-ivory']['1'].name === 'Luxury Ivory'), 'cms=' + JSON.stringify(luxCms && { version: luxCms.version, name: luxCms.name, price: luxCms.price }) + '; histori v1 nama=' + (hist && hist['luxury-ivory'] && hist['luxury-ivory']['1'] && hist['luxury-ivory']['1'].name));
    t.check('daftar template menampilkan v2.0 baru', txt.includes('Luxury Ivory (Uji 2D)') && txt.includes('v2.0'), 'daftar memuat nama baru + v2.0');
    await t.shot('template-list-v2');
    // Terbitkan template baru
    await t.click('[data-s2="tpl-status"][data-id="' + newTplId + '"][data-st="published"]'); await sleep(400);
    const createdPub = await ls('vowora:v1:templates-cms').then(a => (a || []).find(x => x.id === newTplId));
    await t.goto('template'); await sleep(300);
    txt = await appText();
    t.check('terbitkan template baru: status published + tampil di marketplace', createdPub && createdPub.status === 'published' && txt.includes('Template Uji 2D'), 'storage status=' + (createdPub && createdPub.status) + '; marketplace memuat nama=' + txt.includes('Template Uji 2D'));
    // Arsipkan template baru
    await t.goto('admin?tab=template');
    await t.click('[data-s2="tpl-status"][data-id="' + newTplId + '"][data-st="archived"]'); await sleep(400);
    const createdArc = await ls('vowora:v1:templates-cms').then(a => (a || []).find(x => x.id === newTplId));
    txt = await appText();
    await t.goto('template'); await sleep(300);
    const mktAfterArc = await appText();
    t.check('arsipkan template: status archived, hilang dari marketplace, tetap di storage', createdArc && createdArc.status === 'archived' && txt.includes('Arsip') && !mktAfterArc.includes('Template Uji 2D'), 'storage status=' + (createdArc && createdArc.status) + '; pill Arsip di daftar=' + txt.includes('Arsip') + '; marketplace memuat nama=' + mktAfterArc.includes('Template Uji 2D'));

    // ---------- Versi baru tanpa mengubah undangan lama ----------
    t.section('versi template vs undangan lama');
    const inv1After = await invRec('seed-inv-1');
    const provenAfter = await t.eval(() => { const iv = S.invitations.find(i => i.id === 'seed-inv-1'); const p = kiInvTemplateProven(iv); return p ? { name: p.name, price: p.price, tier: p.tier, version: p.version } : null; });
    const luxNow = await t.eval(() => { const x = TEMPLATES.find(t => t.id === 'luxury-ivory'); return x ? { name: x.name, price: x.price, version: x.version } : null; });
    t.check('undangan lama seed-inv-1 tetap templateVersion=1', inv1After && inv1After.templateVersion === 1, 'templateVersion storage=' + (inv1After && inv1After.templateVersion));
    t.check('snapshot v1 luxury-ivory utuh (nama/harga/tier lama)', provenAfter && provenAfter.name === 'Luxury Ivory' && provenAfter.price === 59000 && provenAfter.tier === 'Premium' && provenAfter.version === 1, 'snapshot=' + JSON.stringify(provenAfter) + '; template kini=' + JSON.stringify(luxNow));
    await t.goto('u/nadia-dan-reza'); await sleep(300);
    await t.click('[data-open-inv]'); await sleep(500);
    txt = await appText();
    t.check('render publik lama tidak berubah (Nadia & Reza)', txt.includes('Nadia & Reza') && txt.includes('Reza Mahendra'), 'judul + nama mempelai pria masih tampil di /u/nadia-dan-reza setelah amplop dibuka');
    // Undangan BARU memakai versi baru
    await t.goto('dashboard');
    await setRole('customer');
    await t.goto('buat/luxury-ivory'); await sleep(300);
    txt = await appText();
    t.check('halaman buat memakai template v2.0', txt.includes('Luxury Ivory (Uji 2D)') && txt.includes('v2.0'), 'teks halaman buat memuat nama baru + v2.0');
    await t.click('[data-new-draft="luxury-ivory"]'); await sleep(600);
    const newInvHash = await t.eval(() => location.hash);
    const newInvId = (newInvHash.match(/#\/studio\/(inv-[a-z0-9-]+)/) || [])[1] || '';
    const newInv = newInvId ? await invRec(newInvId) : null;
    t.check('undangan baru dari luxury-ivory memakai templateVersion=2', !!newInv && newInv.templateVersion === 2 && newInv.templateId === 'luxury-ivory', 'id baru=' + newInvId + '; templateVersion=' + (newInv && newInv.templateVersion));
    const newProven = await t.eval((id) => { const iv = S.invitations.find(i => i.id === id); const p = iv ? kiInvTemplateProven(iv) : null; return p ? { name: p.name, version: p.version } : null; }, newInvId);
    t.check('snapshot undangan baru = v2 (nama baru)', newProven && newProven.version === 2 && newProven.name === 'Luxury Ivory (Uji 2D)', 'proven=' + JSON.stringify(newProven));
    await t.goto('dashboard?tab=undangan'); await sleep(300);
    txt = await appText();
    t.check('dashboard: undangan baru tampil v2.0, lama tetap v1.0', txt.includes('v2.0') && txt.includes('v1.0'), 'daftar memuat v2.0=' + txt.includes('v2.0') + ' dan v1.0=' + txt.includes('v1.0'));
    await t.shot('dashboard-undangan-v1-v2');
  },
};
