// Modul 2B — Tamu & RSVP (checkpoint 2B, verifikasi akhir Stage 2).
// Repo-direct terhadap tree lokal v24; HANYA membaca/menulis lewat UI
// browser + localStorage seed. Tidak menyentuh kode aplikasi.
// Seed (js/11-s2-seed.js): cust-1 Nadia, undangan seed-inv-1
// "Nadia & Reza" (published, slug nadia-dan-reza) = 14 tamu, 12 RSVP;
// seed-inv-2 = 8 tamu, 6 RSVP; total 22 tamu / 18 RSVP.
// Kode tamu seed-inv-1: T1001..T1014 (seed-guest-1..14).
//   T1001 Keluarga Wijaya (Hadir, 2, ada ucapan)
//   T1006 Sinta Maharani (Tidak Hadir, ada ucapan)
//   T1007 Keluarga Besar Santoso (Hadir, 4, ucapan moderation 'hidden' seed)
//   T1008 Fajar Ramadhan (Belum Menjawab — tanpa RSVP)
//   T1005 Andi Kurniawan (Masih Ragu, ada ucapan)
module.exports = {
  id: '2b',
  name: '2B Tamu & RSVP',
  run: async (t) => {
    const INV = 'seed-inv-1';
    const INV2 = 'seed-inv-2';
    const readGuests = (invId) => JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]').filter(g => g.invitationId === invId);
    const readRsvps = (invId) => JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]').filter(r => r.invitationId === invId);
    const uiRows = () => Array.from(document.querySelectorAll('.list-rows .lrow')).map(r => r.textContent.replace(/\s+/g, ' ').trim());
    const uiRowNames = () => Array.from(document.querySelectorAll('.list-rows .lrow .grow > b')).map(b => b.textContent.trim());
    const statTexts = () => Array.from(document.querySelectorAll('.stat-grid .stat')).map(s => s.textContent.replace(/\s+/g, ' ').trim());
    const wishText = () => { const el = document.querySelector('[data-wish-list]'); return el ? el.textContent.replace(/\s+/g, ' ').trim() : 'TIDAK ADA [data-wish-list]'; };
    const coverGuest = () => { const b = document.querySelector('.guestbox b'); return b ? b.textContent.trim() : 'TIDAK ADA .guestbox b'; };
    const toastText = () => { const el = document.querySelector('.toast, [class*="toast"]'); return el ? el.textContent.trim() : ''; };

    // ---------- 1. Baseline seed ----------
    t.section('baseline seed');
    await t.goto('dashboard?tab=tamu&inv=' + INV);
    const base = await t.eval(({ INV, INV2 }) => {
      const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]');
      const R = JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]');
      const g1 = G.filter(g => g.invitationId === INV);
      const g2 = G.filter(g => g.invitationId === INV2);
      const r1 = R.filter(r => r.invitationId === INV);
      const byStatus = s => g1.filter(g => g.rsvpStatus === s).length;
      const byGroup = gr => g1.filter(g => g.group === gr).length;
      return { guestsTotal: G.length, rsvpsTotal: R.length, g1: g1.length, g2: g2.length, r1: r1.length,
        hadir: byStatus('Hadir'), tidak: byStatus('Tidak Hadir'), ragu: byStatus('Masih Ragu'), belum: byStatus('Belum Menjawab'),
        keluarga: byGroup('Keluarga'), teman: byGroup('Teman'), rekan: byGroup('Rekan Kerja'), vip: byGroup('VIP'),
        fajar: g1.find(g => g.code === 'T1008') || null, sinta: g1.find(g => g.code === 'T1006') || null };
    }, { INV, INV2 });
    t.check('seed tamu & RSVP', base.guestsTotal === 22 && base.rsvpsTotal === 18 && base.g1 === 14 && base.g2 === 8 && base.r1 === 12,
      `guests=${base.guestsTotal} rsvps=${base.rsvpsTotal} invA=${base.g1} invB=${base.g2} rsvpInvA=${base.r1}`);
    t.check('seed status invA', base.hadir === 9 && base.tidak === 1 && base.ragu === 2 && base.belum === 2,
      `Hadir=${base.hadir} TidakHadir=${base.tidak} MasihRagu=${base.ragu} BelumMenjawab=${base.belum}`);
    t.check('seed grup invA', base.keluarga === 4 && base.teman === 5 && base.rekan === 3 && base.vip === 2,
      `Keluarga=${base.keluarga} Teman=${base.teman} RekanKerja=${base.rekan} VIP=${base.vip}`);
    t.check('seed tamu kunci ada', !!base.fajar && base.fajar.name === 'Fajar Ramadhan' && !!base.sinta && base.sinta.name === 'Sinta Maharani',
      `Fajar=${base.fajar && base.fajar.name}/${base.fajar && base.fajar.rsvpStatus} Sinta=${base.sinta && base.sinta.name}/${base.sinta && base.sinta.rsvpStatus}`);
    const uiBase = await t.eval(uiRows);
    t.check('UI daftar tamu seed = 14 baris', uiBase.length === 14, `baris UI=${uiBase.length} contoh=${uiBase.slice(0, 2).join(' | ')}`);

    // ---------- 2. CRUD tambah ----------
    t.section('CRUD tambah tamu');
    await t.fill('#gf-name', 'Tamu Uji 2B');
    await t.fill('#gf-contact', '081200000001');
    await t.fill('#gf-group', 'Teman');
    await t.fill('#gf-att', '2');
    await t.click('#s2-guest-form button[type="submit"]');
    await t.page.waitForTimeout(500);
    const added = await t.eval((INV) => {
      const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]');
      const g = G.find(x => x.name === 'Tamu Uji 2B');
      return g ? { id: g.id, inv: g.invitationId, group: g.group, contact: g.contact, att: g.attendees, status: g.rsvpStatus, code: g.code, totalInv: G.filter(x => x.invitationId === INV).length } : null;
    }, INV);
    t.check('tambah tamu tersimpan + terikat invA', !!added && added.inv === INV && added.status === 'Belum Menjawab' && added.att === 2 && added.group === 'Teman',
      added ? `id=${added.id} inv=${added.inv} grup=${added.group} kontak=${added.contact} orang=${added.att} status=${added.status} kode=${added.code} totalInvA=${added.totalInv}` : 'tamu tidak ditemukan di storage');
    const uiAfterAdd = await t.eval(uiRowNames);
    t.check('tambah tamu muncul di UI', uiAfterAdd.includes('Tamu Uji 2B') && uiAfterAdd.length === 15,
      `baris=${uiAfterAdd.length} adaNama=${uiAfterAdd.includes('Tamu Uji 2B')}`);
    await t.reload();
    await t.goto('dashboard?tab=tamu&inv=' + INV);
    const addPersist = await t.eval((INV) => {
      const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]');
      const g = G.find(x => x.name === 'Tamu Uji 2B');
      return g ? { inv: g.invitationId, totalInv: G.filter(x => x.invitationId === INV).length } : null;
    }, INV);
    t.check('tambah tamu persist sesudah reload', !!addPersist && addPersist.inv === INV && addPersist.totalInv === 15,
      addPersist ? `inv=${addPersist.inv} totalInvA=${addPersist.totalInv}` : 'hilang sesudah reload');
    const newId = added.id;

    // ---------- 3. CRUD edit ----------
    t.section('CRUD edit tamu');
    await t.click(`button[data-s2="guest-edit"][data-id="${newId}"]`);
    await t.page.waitForTimeout(400);
    const editForm = await t.eval(() => {
      const h = document.querySelector('#s2-guest-form b');
      return { heading: h ? h.textContent.trim() : '', name: document.querySelector('#gf-name').value, group: document.querySelector('#gf-group').value };
    });
    t.check('mode edit terbuka + nilai awal', editForm.heading === 'Ubah Tamu' && editForm.name === 'Tamu Uji 2B' && editForm.group === 'Teman',
      `heading=${editForm.heading} nama=${editForm.name} grup=${editForm.group}`);
    await t.fill('#gf-name', 'Tamu Uji 2B Edit');
    await t.fill('#gf-group', 'VIP');
    await t.fill('#gf-att', '3');
    await t.click('#s2-guest-form button[type="submit"]');
    await t.page.waitForTimeout(500);
    const edited = await t.eval(() => {
      const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]');
      const g = G.find(x => x.name === 'Tamu Uji 2B Edit');
      return g ? { id: g.id, group: g.group, att: g.attendees, oldStillThere: G.some(x => x.name === 'Tamu Uji 2B') } : null;
    });
    t.check('edit tamu tersimpan (nama+grup+jumlah)', !!edited && edited.group === 'VIP' && edited.att === 3 && edited.oldStillThere === false,
      edited ? `id=${edited.id} grup=${edited.group} orang=${edited.att} namaLamaMasihAda=${edited.oldStillThere}` : 'tamu edit tidak ditemukan');
    await t.reload();
    await t.goto('dashboard?tab=tamu&inv=' + INV);
    const editPersist = await t.eval(uiRowNames);
    t.check('edit tamu persist sesudah reload', editPersist.includes('Tamu Uji 2B Edit') && !editPersist.includes('Tamu Uji 2B'),
      `baris=${editPersist.length} adaEdit=${editPersist.includes('Tamu Uji 2B Edit')} adaLama=${editPersist.includes('Tamu Uji 2B')}`);

    // ---------- 4. CRUD hapus: batalkan lalu konfirmasi (Sinta, punya RSVP) ----------
    t.section('CRUD hapus tamu + cascade RSVP');
    const sintaId = await t.eval(() => {
      const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]');
      const g = G.find(x => x.name === 'Sinta Maharani');
      return g ? g.id : null;
    });
    const rsvpBefore = await t.eval((INV) => JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]').filter(r => r.invitationId === INV).length, INV);
    await t.click(`button[data-s2="guest-del"][data-id="${sintaId}"]`);
    await t.page.waitForTimeout(400);
    const modalShown = await t.eval(() => {
      const m = document.querySelector('#s2-modal');
      return m ? m.textContent.replace(/\s+/g, ' ').trim().slice(0, 200) : null;
    });
    t.check('hapus tamu minta konfirmasi modal', !!modalShown && modalShown.includes('Hapus tamu ini?') && modalShown.includes('Sinta Maharani'),
      `modal=${modalShown}`);
    await t.click('#s2-modal-cancel');
    await t.page.waitForTimeout(400);
    const cancelKept = await t.eval(uiRowNames);
    t.check('batal hapus: tamu tetap ada', cancelKept.includes('Sinta Maharani'),
      `baris=${cancelKept.length} adaSinta=${cancelKept.includes('Sinta Maharani')}`);
    await t.click(`button[data-s2="guest-del"][data-id="${sintaId}"]`);
    await t.page.waitForTimeout(400);
    await t.click('#s2-modal-ok');
    await t.page.waitForTimeout(500);
    const delRes = await t.eval((INV) => {
      const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]');
      const R = JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]');
      return { guestGone: !G.some(x => x.name === 'Sinta Maharani'), rsvpGone: !R.some(r => r.name === 'Sinta Maharani'),
        totalInv: G.filter(x => x.invitationId === INV).length, rsvpInv: R.filter(r => r.invitationId === INV).length,
        invBGuests: G.filter(x => x.invitationId === 'seed-inv-2').length };
    }, INV);
    t.check('konfirmasi hapus: tamu hilang dari UI+storage', delRes.guestGone && delRes.totalInv === 14,
      `guestGone=${delRes.guestGone} totalInvA=${delRes.totalInv} (14 = 14 seed +1 tambah -1 hapus)`);
    t.check('hapus tamu cascade: RSVP-nya ikut terhapus', delRes.rsvpGone && delRes.rsvpInv === rsvpBefore - 1,
      `rsvpGone=${delRes.rsvpGone} rsvpInvA=${delRes.rsvpInv} sebelumnya=${rsvpBefore}`);
    t.check('hapus tamu tidak sentuh undangan lain', delRes.invBGuests === 8, `tamuInvB=${delRes.invBGuests}`);
    await t.reload();
    await t.goto('dashboard?tab=tamu&inv=' + INV);
    const delPersist = await t.eval(uiRowNames);
    t.check('hapus tamu persist sesudah reload', !delPersist.includes('Sinta Maharani') && delPersist.length === 14,
      `baris=${delPersist.length} adaSinta=${delPersist.includes('Sinta Maharani')}`);

    // ---------- 5. Filter status & grup (dihitung vs storage) ----------
    t.section('filter status & grup');
    const filterCheck = async (sel, val, expectedFn) => {
      await t.select(sel, val);
      await t.page.waitForTimeout(400);
      const got = await t.eval(({ INV, expectedFnSrc }) => {
        const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]').filter(g => g.invitationId === INV);
        const fn = new Function('G', 'return (' + expectedFnSrc + ')(G)');
        const exp = fn(G);
        const ui = Array.from(document.querySelectorAll('.list-rows .lrow .grow > b')).map(b => b.textContent.trim());
        return { expCount: exp.length, expNames: exp.map(g => g.name).sort(), uiCount: ui.length, uiNames: ui.slice().sort() };
      }, { INV, expectedFnSrc: expectedFn.toString() });
      return got;
    };
    let f = await filterCheck('#s2-guest-status', 'Hadir', G => G.filter(g => g.rsvpStatus === 'Hadir'));
    t.check('filter status Hadir', f.uiCount === f.expCount && f.expCount === 9 && JSON.stringify(f.uiNames) === JSON.stringify(f.expNames),
      `UI=${f.uiCount} storage=${f.expCount} nama=${f.uiNames.join(', ')}`);
    f = await filterCheck('#s2-guest-status', 'Tidak Hadir', G => G.filter(g => g.rsvpStatus === 'Tidak Hadir'));
    t.check('filter status Tidak Hadir (0 pasca-hapus Sinta)', f.uiCount === 0 && f.expCount === 0,
      `UI=${f.uiCount} storage=${f.expCount}`);
    f = await filterCheck('#s2-guest-status', 'Belum Menjawab', G => G.filter(g => g.rsvpStatus === 'Belum Menjawab'));
    t.check('filter status Belum Menjawab', f.uiCount === f.expCount && f.expCount === 3,
      `UI=${f.uiCount} storage=${f.expCount} nama=${f.uiNames.join(', ')}`);
    await t.select('#s2-guest-status', 'semua');
    await t.page.waitForTimeout(400);
    f = await filterCheck('#s2-guest-group', 'Keluarga', G => G.filter(g => g.group === 'Keluarga'));
    t.check('filter grup Keluarga', f.uiCount === f.expCount && f.expCount === 4,
      `UI=${f.uiCount} storage=${f.expCount} nama=${f.uiNames.join(', ')}`);
    f = await filterCheck('#s2-guest-group', 'VIP', G => G.filter(g => g.group === 'VIP'));
    t.check('filter grup VIP (2 seed + 1 edit)', f.uiCount === f.expCount && f.expCount === 3,
      `UI=${f.uiCount} storage=${f.expCount} nama=${f.uiNames.join(', ')}`);
    f = await filterCheck('#s2-guest-group', 'Teman', G => G.filter(g => g.group === 'Teman'));
    t.check('filter grup Teman', f.uiCount === f.expCount && f.expCount === 4,
      `UI=${f.uiCount} storage=${f.expCount} nama=${f.uiNames.join(', ')} (seed 5 − Sinta dihapus = 4)`);
    await t.select('#s2-guest-group', 'semua');
    await t.page.waitForTimeout(300);
    await t.shot('tamu-daftar');

    // ---------- 6. Bulk import ----------
    t.section('bulk import');
    const bulkHasUI = await t.eval(() => !!document.querySelector('#s2-bulk-text') && !!document.querySelector('button[data-s2="bulk-preview"]'));
    t.check('UI input massal ADA', bulkHasUI, bulkHasUI ? 'textarea #s2-bulk-text + tombol bulk-preview ada di kartu "Tambah Banyak Tamu Sekaligus"' : 'textarea/tombol import tidak ditemukan');
    await t.fill('#s2-bulk-text', 'Tamu Bulk Satu; Keluarga; 081200000001\nTamu Bulk Dua; Teman\nTamu Bulk Tiga');
    await t.click('button[data-s2="bulk-preview"]');
    await t.page.waitForTimeout(500);
    const preview = await t.eval(() => {
      const z = document.querySelector('#s2-bulk-zone');
      return z ? z.textContent.replace(/\s+/g, ' ').trim() : 'TIDAK ADA #s2-bulk-zone';
    });
    t.check('pratinjau bulk: 3 valid 0 bermasalah', preview.includes('3 baris valid') && preview.includes('0 baris bermasalah') && preview.includes('Tamu Bulk Satu') && preview.includes('Tamu Bulk Dua') && preview.includes('Tamu Bulk Tiga'),
      `preview=${preview.slice(0, 300)}`);
    await t.click('button[data-s2="bulk-import"]');
    await t.page.waitForTimeout(500);
    const bulkRes = await t.eval((INV) => {
      const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]');
      const added = G.filter(x => x.invitationId === INV && /^Tamu Bulk/.test(x.name));
      return { n: added.length, totalInv: G.filter(x => x.invitationId === INV).length,
        detail: added.map(g => `${g.name}|${g.id}|${g.group}|${g.contact}|${g.code}|${g.rsvpStatus}`).join(' ; '),
        stableOk: (() => { try { return added.every(g => g.id === kiGuestStableId(INV, { name: g.name, group: g.group, contact: g.contact })); } catch (e) { return 'ERR:' + e.message; } })() };
    }, INV);
    t.check('bulk import: 3 tamu masuk + ID stabil benar', bulkRes.n === 3 && bulkRes.totalInv === 17 && bulkRes.stableOk === true,
      `masuk=${bulkRes.n} totalInvA=${bulkRes.totalInv} stableIdOk=${bulkRes.stableOk} detail=${bulkRes.detail}`);
    // Impor ulang daftar yang sama -> dedupe ID stabil, 0 baru.
    await t.fill('#s2-bulk-text', 'Tamu Bulk Satu; Keluarga; 081200000001\nTamu Bulk Dua; Teman\nTamu Bulk Tiga');
    await t.click('button[data-s2="bulk-preview"]');
    await t.page.waitForTimeout(400);
    await t.click('button[data-s2="bulk-import"]');
    await t.page.waitForTimeout(500);
    const dupRes = await t.eval((INV) => {
      const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]');
      return { totalInv: G.filter(x => x.invitationId === INV).length, bulkN: G.filter(x => x.invitationId === INV && /^Tamu Bulk/.test(x.name)).length };
    }, INV);
    t.check('bulk import ulang: duplikat dilewati (0 baru)', dupRes.totalInv === 17 && dupRes.bulkN === 3,
      `totalInvA=${dupRes.totalInv} bulk=${dupRes.bulkN} (tetap 17/3)`);
    await t.reload();
    await t.goto('dashboard?tab=tamu&inv=' + INV);
    const bulkPersist = await t.eval(uiRowNames);
    t.check('bulk import persist sesudah reload', bulkPersist.filter(n => /^Tamu Bulk/.test(n)).length === 3 && bulkPersist.length === 17,
      `baris=${bulkPersist.length} bulk=${bulkPersist.filter(n => /^Tamu Bulk/.test(n)).join(', ')}`);

    // ---------- 7. Metrik RSVP dashboard SEBELUM RSVP publik ----------
    t.section('metrik dashboard sebelum RSVP publik');
    await t.goto('dashboard?tab=rsvp&inv=' + INV);
    const statsBefore = await t.eval(statTexts);
    const storeBefore = await t.eval((INV) => {
      const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]').filter(g => g.invitationId === INV);
      const R = JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]').filter(r => r.invitationId === INV);
      return { total: G.length, hadir: R.filter(r => r.status === 'Hadir').length,
        hadirOrang: R.filter(r => r.status === 'Hadir').reduce((a, r) => a + (r.count || 0), 0),
        tidak: R.filter(r => r.status === 'Tidak Hadir').length, belum: G.filter(g => g.rsvpStatus === 'Belum Menjawab').length, rsvpN: R.length };
    }, INV);
    t.check('metrik RSVP sebelum RSVP publik', statsBefore[0].includes(String(storeBefore.total)) && statsBefore[1].includes(String(storeBefore.hadir)) && statsBefore[1].includes(String(storeBefore.hadirOrang) + ' total orang') && statsBefore[2].includes(String(storeBefore.tidak)) && statsBefore[3].includes(String(storeBefore.belum)),
      `statUI=[${statsBefore.join(' | ')}] storage: total=${storeBefore.total} hadir=${storeBefore.hadir} (${storeBefore.hadirOrang} orang) tidak=${storeBefore.tidak} belum=${storeBefore.belum} rsvp=${storeBefore.rsvpN}`);

    // ---------- 8. RSVP publik tamu BENAR (?to=T1008 Fajar Ramadhan) ----------
    t.section('RSVP publik tamu benar');
    await t.goto('u/nadia-dan-reza?to=T1008');
    await t.click('[data-open-inv]');
    await t.page.waitForTimeout(400);
    const cover = await t.eval(coverGuest);
    t.check('tautan personal ?to=T1008 menyapa nama kanonis', cover === 'Fajar Ramadhan', `coverGuest=${cover}`);
    const formPrefill = await t.eval(() => {
      const f = document.querySelector('form[data-rsvp-form]');
      if (!f) return { form: false };
      return { form: true, name: f.querySelector('input[name="name"]').value,
        segOn: (f.querySelector('[data-seg] button.on') || {}).dataset?.val || null };
    });
    t.check('form RSVP terisi nama tamu berkode', formPrefill.form === true && formPrefill.name === 'Fajar Ramadhan',
      `form=${formPrefill.form} nama=${formPrefill.name} segOn=${formPrefill.segOn}`);
    await t.click('form[data-rsvp-form] [data-seg] button[data-val="Hadir"]');
    await t.select('form[data-rsvp-form] select[name="count"]', '2');
    await t.fill('form[data-rsvp-form] textarea[name="message"]', 'Doa terbaik untuk Nadia & Reza — 2B');
    await t.click('form[data-rsvp-form] button[type="submit"]');
    await t.page.waitForTimeout(600);
    const okBox = await t.eval(() => {
      const b = document.querySelector('[data-rsvp-zone] .ok-box');
      return b ? b.textContent.replace(/\s+/g, ' ').trim().slice(0, 220) : 'TIDAK ADA .ok-box';
    });
    t.check('submit RSVP tampil konfirmasi terkirim', okBox.includes('Respons Anda sudah terkirim') && okBox.includes('Fajar Ramadhan') && okBox.includes('Hadir'),
      `okBox=${okBox}`);
    const rsvpStored = await t.eval((INV) => {
      const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]');
      const R = JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]');
      const g = G.find(x => x.id === 'seed-guest-8');
      const r = g ? R.find(x => x.guestId === g.id) : null;
      return { guest: g ? { status: g.rsvpStatus, att: g.attendees, name: g.name } : null,
        rsvp: r ? { name: r.name, status: r.status, count: r.count, msg: r.message, inv: r.invitationId, mod: r.moderation } : null,
        rsvpInv: R.filter(x => x.invitationId === INV).length };
    }, INV);
    t.check('RSVP tersimpan terhubung ke tamu + undangan benar', !!rsvpStored.rsvp && rsvpStored.rsvp.inv === INV && rsvpStored.rsvp.status === 'Hadir' && rsvpStored.rsvp.count === 2 && rsvpStored.rsvp.msg === 'Doa terbaik untuk Nadia & Reza — 2B' && rsvpStored.guest.status === 'Hadir' && rsvpStored.guest.att === 2,
      `rsvp=${JSON.stringify(rsvpStored.rsvp)} guest=${JSON.stringify(rsvpStored.guest)} rsvpInvA=${rsvpStored.rsvpInv}`);
    const wishAfter = await t.eval(wishText);
    t.check('buku tamu publik tampilkan ucapan baru', wishAfter.includes('Doa terbaik untuk Nadia & Reza — 2B') && wishAfter.includes('Fajar Ramadhan'),
      `wishList=${wishAfter.slice(0, 400)}`);
    await t.shot('rsvp-publik-terkirim');

    // ---------- 9. Metrik berubah + persist ----------
    t.section('metrik berubah + persist');
    await t.goto('dashboard?tab=rsvp&inv=' + INV);
    const statsAfter = await t.eval(statTexts);
    const storeAfter = await t.eval((INV) => {
      const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]').filter(g => g.invitationId === INV);
      const R = JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]').filter(r => r.invitationId === INV);
      return { total: G.length, hadir: R.filter(r => r.status === 'Hadir').length,
        hadirOrang: R.filter(r => r.status === 'Hadir').reduce((a, r) => a + (r.count || 0), 0),
        tidak: R.filter(r => r.status === 'Tidak Hadir').length, belum: G.filter(g => g.rsvpStatus === 'Belum Menjawab').length, rsvpN: R.length };
    }, INV);
    t.check('metrik RSVP naik sesuai (hadir +1, belum -1)', statsAfter[1].includes(String(storeAfter.hadir)) && storeAfter.hadir === storeBefore.hadir + 1 && storeAfter.hadirOrang === storeBefore.hadirOrang + 2 && storeAfter.belum === storeBefore.belum - 1 && storeAfter.rsvpN === storeBefore.rsvpN + 1,
      `statUI=[${statsAfter.join(' | ')}] storage: hadir=${storeAfter.hadir} (${storeAfter.hadirOrang} orang) belum=${storeAfter.belum} rsvp=${storeAfter.rsvpN} (sebelum hadir=${storeBefore.hadir} orang=${storeBefore.hadirOrang} belum=${storeBefore.belum} rsvp=${storeBefore.rsvpN})`);
    await t.goto('dashboard?tab=ringkasan');
    const overview = await t.eval(statTexts);
    // Ringkasan menghitung SEMUA undangan milik cust-1 (invA + invB + inv5):
    // RSVP total = invA 12 + invB 6 = 18; hadir-orang = invA 20 + invB 8 = 28
    // (invB Hadir: Kirana 3 + Teman Sekelas 2 + Bu Guru 1 + Om Beni 2; Nugraha Masih Ragu).
    const overviewExp = await t.eval(() => {
      const R = JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]');
      const mine = ['seed-inv-1', 'seed-inv-2', 'seed-inv-5'];
      const rs = R.filter(r => mine.includes(r.invitationId));
      return { rsvpN: rs.length, hadirOrang: rs.filter(r => r.status === 'Hadir').reduce((a, r) => a + (r.count || 0), 0) };
    });
    t.check('ringkasan ikut berubah (Respons RSVP)', overview[2].includes(String(overviewExp.rsvpN)) && overview[2].includes(String(overviewExp.hadirOrang) + ' tamu terkonfirmasi hadir'),
      `overview=[${overview.join(' | ')}] storage semua undangan cust-1: rsvp=${overviewExp.rsvpN} hadirOrang=${overviewExp.hadirOrang} (invA saja: rsvp=${storeAfter.rsvpN} hadirOrang=${storeAfter.hadirOrang})`);
    await t.reload();
    await t.goto('dashboard?tab=rsvp&inv=' + INV);
    const statsReload = await t.eval(statTexts);
    t.check('metrik persist sesudah reload', statsReload[1].includes(String(storeAfter.hadir)) && statsReload[3].includes(String(storeAfter.belum)),
      `statUI sesudah reload=[${statsReload.join(' | ')}]`);

    // ---------- 10. Moderasi persist ----------
    t.section('moderasi buku tamu');
    const modIds = await t.eval((INV) => {
      const R = JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]').filter(r => r.invitationId === INV && r.message);
      const byName = n => { const r = R.find(x => x.name === n); return r ? { id: r.id, mod: r.moderation, msg: r.message } : null; };
      return { santoso: byName('Keluarga Besar Santoso'), wijaya: byName('Keluarga Wijaya'), andi: byName('Andi Kurniawan'), n: R.length };
    }, INV);
    t.check('seed moderasi: Santoso hidden, Wijaya approved', !!modIds.santoso && modIds.santoso.mod === 'hidden' && !!modIds.wijaya && modIds.wijaya.mod === 'approved',
      `santoso=${JSON.stringify(modIds.santoso)} wijaya=${JSON.stringify(modIds.wijaya)} ucapanDimoderasi=${modIds.n}`);
    // Setujui Santoso (hidden -> approved)
    await t.click(`button[data-s2="mod"][data-act="approved"][data-id="${modIds.santoso.id}"]`);
    await t.page.waitForTimeout(500);
    const santosoAfter = await t.eval(() => {
      const R = JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]');
      const r = R.find(x => x.name === 'Keluarga Besar Santoso');
      return r ? r.moderation : null;
    });
    t.check('moderasi setujui: hidden -> approved tersimpan', santosoAfter === 'approved', `moderation Santoso=${santosoAfter}`);
    // Sembunyikan Wijaya (approved -> hidden)
    await t.click(`button[data-s2="mod"][data-act="hidden"][data-id="${modIds.wijaya.id}"]`);
    await t.page.waitForTimeout(500);
    const wijayaAfter = await t.eval(() => {
      const R = JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]');
      const r = R.find(x => x.name === 'Keluarga Wijaya');
      return r ? r.moderation : null;
    });
    t.check('moderasi sembunyikan: approved -> hidden tersimpan', wijayaAfter === 'hidden', `moderation Wijaya=${wijayaAfter}`);
    // Hapus ucapan Andi: pesan kosong, jawaban kehadiran tetap Masih Ragu
    await t.click(`button[data-s2="mod"][data-act="delete"][data-id="${modIds.andi.id}"]`);
    await t.page.waitForTimeout(500);
    const andiAfter = await t.eval(() => {
      const R = JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]');
      const r = R.find(x => x.name === 'Andi Kurniawan');
      return r ? { msg: r.message, mod: r.moderation, status: r.status } : null;
    });
    t.check('hapus ucapan: pesan kosong, jawaban kehadiran tetap', !!andiAfter && andiAfter.msg === '' && andiAfter.status === 'Masih Ragu',
      `Andi=${JSON.stringify(andiAfter)}`);
    await t.reload();
    await t.goto('dashboard?tab=rsvp&inv=' + INV);
    const modPersist = await t.eval(() => {
      const R = JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]');
      const get = n => { const r = R.find(x => x.name === n); return r ? { mod: r.moderation, msg: r.message, status: r.status } : null; };
      return { santoso: get('Keluarga Besar Santoso'), wijaya: get('Keluarga Wijaya'), andi: get('Andi Kurniawan') };
    });
    t.check('moderasi persist sesudah reload', modPersist.santoso.mod === 'approved' && modPersist.wijaya.mod === 'hidden' && modPersist.andi.msg === '' && modPersist.andi.status === 'Masih Ragu',
      `santoso=${JSON.stringify(modPersist.santoso)} wijaya=${JSON.stringify(modPersist.wijaya)} andi=${JSON.stringify(modPersist.andi)}`);
    // Buku tamu publik: Santoso kini tampil, Wijaya tidak tampil
    await t.goto('u/nadia-dan-reza');
    await t.click('[data-open-inv]');
    await t.page.waitForTimeout(400);
    const wishMod = await t.eval(wishText);
    t.check('buku tamu publik hormati moderasi', wishMod.includes('Kami sekeluarga hadir, insya Allah') && !wishMod.includes('Selamat Nadia & Reza! Semoga sakinah') && wishMod.includes('Doa terbaik untuk Nadia & Reza — 2B'),
      `wishList=${wishMod.slice(0, 500)}`);
    await t.shot('buku-tamu-moderasi');

    // ---------- 11. RSVP kode SALAH (fail-closed?) — TERAKHIR karena menulis data ----------
    t.section('RSVP kode salah');
    await t.goto('u/nadia-dan-reza?to=T9999');
    await t.click('[data-open-inv]');
    await t.page.waitForTimeout(400);
    const wrongCover = await t.eval(coverGuest);
    t.check('kode salah: tidak menyapa tamu mana pun', wrongCover === 'Bapak/Ibu/Saudara/i',
      `coverGuest=${wrongCover} (s2GuestByCode T9999 -> null, js/10-s2-rsvp.js s2GuestByCode)`);
    const wrongForm = await t.eval(() => {
      const f = document.querySelector('form[data-rsvp-form]');
      const ok = document.querySelector('[data-rsvp-zone] .ok-box');
      return { form: !!f, name: f ? f.querySelector('input[name="name"]').value : null, alreadySent: !!ok };
    });
    t.check('kode salah: form kosong, bukan status terkirim tamu lain', wrongForm.form === true && wrongForm.name === '' && wrongForm.alreadySent === false,
      `form=${wrongForm.form} namaPrefill=${JSON.stringify(wrongForm.name)} alreadySent=${wrongForm.alreadySent}`);
    const guestsBeforeWrong = await t.eval((INV) => JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]').filter(g => g.invitationId === INV).length, INV);
    await t.fill('form[data-rsvp-form] input[name="name"]', 'Tamu Kode Salah');
    await t.fill('form[data-rsvp-form] textarea[name="message"]', 'Ucapan dari kode salah');
    await t.click('form[data-rsvp-form] button[type="submit"]');
    await t.page.waitForTimeout(600);
    const wrongRes = await t.eval((INV) => {
      const G = JSON.parse(localStorage.getItem('vowora:v1:guests') || '[]');
      const R = JSON.parse(localStorage.getItem('vowora:v1:rsvps') || '[]');
      const g = G.find(x => x.name === 'Tamu Kode Salah');
      const r = g ? R.find(x => x.guestId === g.id) : null;
      const bodyTxt = document.body.innerText;
      return { guestCreated: !!g, guestId: g ? g.id : null, guestInv: g ? g.invitationId : null,
        rsvpCreated: !!r, rsvpStatus: r ? r.status : null,
        totalInv: G.filter(x => x.invitationId === INV).length,
        anyRejectionText: /ditolak|tidak ditemukan|kode (tamu )?tidak|tidak valid|tidak sah/i.test(bodyTxt) };
    }, INV);
    t.check('kode salah DITOLAK dengan pesan jelas (fail-closed)', wrongRes.guestCreated === false && wrongRes.rsvpCreated === false && wrongRes.anyRejectionText === true,
      `guestCreated=${wrongRes.guestCreated} guestId=${wrongRes.guestId} inv=${wrongRes.guestInv} rsvpCreated=${wrongRes.rsvpCreated} status=${wrongRes.rsvpStatus} totalInvA=${wrongRes.totalInv} (sebelum=${guestsBeforeWrong}) adaTeksPenolakan=${wrongRes.anyRejectionText} — handler js/13-s2-handlers.js:758+ tidak memvalidasi ?to=, kode tak cocok jatuh ke identitas web dan membuat tamu baru`);
    await t.shot('rsvp-kode-salah');
  },
};
