// Modul 2E — Layanan desain / Assisted Design (checkpoint v24).
// Repo-direct, clone lokal disposable. TIDAK mengubah kode aplikasi.
module.exports = {
  id: '2e',
  name: '2E Layanan Desain',
  run: async (t) => {
    const sleep = (ms) => t.page.waitForTimeout(ms);
    const appText = () => t.eval(() => document.getElementById('app').innerText);
    const toast = () => t.eval(() => { const el = document.querySelector('#toast'); return el ? (el.textContent || '') : ''; });
    const ls = (k) => t.eval((key) => { try { const v = localStorage.getItem(key); return v === null ? null : JSON.parse(v); } catch (e) { return 'PARSE-ERR:' + e.message; } }, k);
    const svc = (id) => t.eval((sid) => { const s = S2.services.find(x => x.id === sid); return s ? JSON.parse(JSON.stringify(s)) : null; }, id);
    const setRole = async (role) => { await t.select('#s2-role', role); await sleep(600); };
    const grantOn = async () => {
      await t.click('[data-s2="admin-write-toggle"]'); await sleep(300);
      await t.click('#s2-modal-ok'); await sleep(400);
    };
    const grantOff = async () => { await t.click('[data-s2="admin-write-toggle"]'); await sleep(400); };
    const grantState = () => t.eval(() => window.__kiAdminWrite === true);
    // Klik tombol sintetis (uji penolakan handler atas aksi yang tak ada di UI)
    const synthSvc = async (act, id, to) => {
      await t.eval((p) => {
        const b = document.createElement('button');
        b.id = 'synth-btn'; b.setAttribute('data-s2', p.a); b.setAttribute('data-id', p.sid);
        if (p.sto) b.setAttribute('data-to', p.sto);
        document.body.appendChild(b);
      }, { a: act, sid: id, sto: to || null });
      await t.click('#synth-btn'); await sleep(300);
      await t.eval(() => { const b = document.getElementById('synth-btn'); if (b) b.remove(); });
    };
    const NOTE = 'Catatan internal uji 2E: cek ulang palet ivory sebelum kirim.';
    const REVNOTE = 'Tolong warna sampul lebih hangat, kurangi ornamen.';

    // ---------- Daftar layanan ----------
    t.section('daftar layanan');
    await t.goto('dashboard?tab=layanan');
    let txt = await appText();
    t.check('customer: proyek sendiri 201 Review + 204 New tampil', txt.includes('REQ-2026-201') && txt.includes('REQ-2026-204'), '201 hadir=' + txt.includes('REQ-2026-201') + '; 204 hadir=' + txt.includes('REQ-2026-204'));
    t.check('customer: proyek pelanggan lain TIDAK tampil', !txt.includes('REQ-2026-202') && !txt.includes('REQ-2026-203'), '202 hadir=' + txt.includes('REQ-2026-202') + '; 203 hadir=' + txt.includes('REQ-2026-203'));
    t.check('preview desain svc-1 (Review) tampil + tombol aksi', txt.includes('Pratinjau desain dari desainer') && txt.includes('Setujui Desain') && txt.includes('Minta Revisi'), 'preview=' + txt.includes('Pratinjau desain dari desainer') + '; setujui=' + txt.includes('Setujui Desain') + '; revisi=' + txt.includes('Minta Revisi'));
    const s1seed = await svc('seed-svc-1');
    t.check('seed svc-1: Review, des-1, revisi 1', s1seed && s1seed.status === 'Review' && s1seed.designerId === 'des-1' && s1seed.revisions.length === 1, JSON.stringify(s1seed && { number: s1seed.number, status: s1seed.status, designerId: s1seed.designerId, revisions: s1seed.revisions.length }));

    // ---------- Revisi (customer) -> desainer -> kirim ulang ----------
    t.section('revisi + catatan internal + kirim ulang');
    await t.click('[data-s2="svc-revision"][data-id="seed-svc-1"]'); await sleep(300);
    await t.fill('#s2-modal-text', REVNOTE);
    await t.click('#s2-modal-ok'); await sleep(500);
    let s1 = await svc('seed-svc-1');
    txt = await appText();
    t.check('minta revisi: Review -> Revision + catatan tercatat', s1 && s1.status === 'Revision' && s1.revisions.length === 2 && s1.revisions[1].note === REVNOTE && txt.includes(REVNOTE), 'status=' + (s1 && s1.status) + '; revisi=' + (s1 && s1.revisions.length) + '; catatan tampil di kartu=' + txt.includes(REVNOTE));
    // Desainer des-1: workspace hanya proyeknya; tambah catatan internal
    await setRole('designer');
    txt = await appText();
    t.check('workspace desainer des-1: svc-1 tampil, svc-2 (des-2) tidak', txt.includes('REQ-2026-201') && !txt.includes('REQ-2026-202'), '201 hadir=' + txt.includes('REQ-2026-201') + '; 202 hadir=' + txt.includes('REQ-2026-202'));
    await t.fill('.s2-note-form[data-id="seed-svc-1"] input[name="note"]', NOTE);
    await t.click('.s2-note-form[data-id="seed-svc-1"] button[type="submit"]'); await sleep(400);
    s1 = await svc('seed-svc-1');
    txt = await appText();
    t.check('catatan internal desainer tersimpan + tampil di workspace', s1 && (s1.internalNotes || []).includes(NOTE) && txt.includes(NOTE), 'internalNotes=' + JSON.stringify(s1 && s1.internalNotes));
    // Customer TIDAK bisa melihat catatan internal
    await setRole('customer');
    await t.goto('dashboard?tab=layanan'); await sleep(200);
    txt = await appText();
    t.check('customer TIDAK melihat catatan internal', !txt.includes(NOTE), 'teks kartu customer memuat catatan internal=' + txt.includes(NOTE));
    // Desainer kirim ulang untuk ulasan
    await setRole('designer');
    await t.click('[data-s2="svc-progress"][data-id="seed-svc-1"][data-to="Review"]'); await sleep(400);
    s1 = await svc('seed-svc-1');
    t.check('desainer: Revision -> Review', s1 && s1.status === 'Review', 'status=' + (s1 && s1.status));
    // Transisi tak sah sebagai desainer (tombol sintetis)
    await synthSvc('svc-progress', 'seed-svc-1', 'Completed');
    let toastBad = await toast();
    s1 = await svc('seed-svc-1');
    t.check('desainer: Review -> Completed DITOLAK (bukan kewenangan)', toastBad.includes('bukan kewenangan Desainer') && s1.status === 'Review', 'toast="' + toastBad.slice(0, 80) + '"; status tetap=' + s1.status);
    // Desainer tak berhak atas proyek desainer lain
    await synthSvc('svc-progress', 'seed-svc-2', 'Review');
    toastBad = await toast();
    const s2 = await svc('seed-svc-2');
    const allowed2 = await t.eval(() => { const s = S2.services.find(x => x.id === 'seed-svc-2'); return kiDesignerAllowed(s); });
    t.check('desainer des-1: tulis proyek des-2 DITOLAK (kiDesignerAllowed=false)', toastBad.includes('tidak ditugaskan kepada desainer yang sedang aktif') && s2.status === 'In Progress' && allowed2 === false, 'toast="' + toastBad.slice(0, 80) + '"; status svc-2 tetap=' + s2.status + '; kiDesignerAllowed=' + allowed2);

    // ---------- Persetujuan pelanggan ----------
    t.section('persetujuan pelanggan');
    await setRole('customer');
    await t.goto('dashboard?tab=layanan'); await sleep(200);
    await t.click('[data-s2="svc-approve"][data-id="seed-svc-1"]'); await sleep(400);
    const toastAp = await toast();
    s1 = await svc('seed-svc-1');
    t.check('setujui desain: Review -> Approved', s1 && s1.status === 'Approved' && toastAp.includes('Desain disetujui'), 'status=' + (s1 && s1.status) + '; toast="' + toastAp.slice(0, 50) + '"');
    await synthSvc('svc-approve', 'seed-svc-4', null);
    toastBad = await toast();
    const s4 = await svc('seed-svc-4');
    t.check('setujui dari status New DITOLAK (state asal tak sah)', toastBad.includes('hanya dapat disetujui dari status Review') && s4.status === 'New', 'toast="' + toastBad.slice(0, 80) + '"; status svc-4 tetap=' + s4.status);

    // ---------- Admin: Published -> Completed + transisi tak sah ----------
    t.section('admin terbit + selesai');
    await setRole('admin');
    await t.goto('admin?tab=layanan'); await sleep(200);
    txt = await appText();
    t.check('admin layanan: keempat REQ tampil', ['REQ-2026-201', 'REQ-2026-202', 'REQ-2026-203', 'REQ-2026-204'].every(n => txt.includes(n)), '201/202/203/204 hadir semua=' + ['REQ-2026-201', 'REQ-2026-202', 'REQ-2026-203', 'REQ-2026-204'].map(n => txt.includes(n)).join(','));
    t.check('admin TIDAK melihat catatan internal desainer', !txt.includes(NOTE), 'catatan internal tampil di admin=' + txt.includes(NOTE));
    const pubBtn = await t.eval(() => !!document.querySelector('[data-s2="svc-progress"][data-id="seed-svc-1"][data-to="Published"]'));
    t.check('svc-1 Approved: tombol Terbitkan Hasil ada', pubBtn, 'tombol Published hadir=' + pubBtn);
    await t.click('[data-s2="svc-progress"][data-id="seed-svc-1"][data-to="Published"]'); await sleep(300);
    toastBad = await toast();
    s1 = await svc('seed-svc-1');
    t.check('admin tanpa grant: Approved -> Published DITOLAK', toastBad.includes('Mode inspeksi Admin') && s1.status === 'Approved', 'toast="' + toastBad.slice(0, 80) + '"; status tetap=' + s1.status);
    await grantOn();
    await t.click('[data-s2="svc-progress"][data-id="seed-svc-1"][data-to="Published"]'); await sleep(400);
    s1 = await svc('seed-svc-1');
    t.check('admin dengan grant: Approved -> Published', s1 && s1.status === 'Published', 'status=' + (s1 && s1.status));
    await t.click('[data-s2="svc-progress"][data-id="seed-svc-1"][data-to="Completed"]'); await sleep(400);
    s1 = await svc('seed-svc-1');
    t.check('admin dengan grant: Published -> Completed', s1 && s1.status === 'Completed', 'status=' + (s1 && s1.status));
    await synthSvc('svc-progress', 'seed-svc-1', 'Published');
    toastBad = await toast();
    s1 = await svc('seed-svc-1');
    t.check('terminal: Completed -> Published DITOLAK (state machine)', toastBad.includes('Transisi layanan TIDAK SAH') && s1.status === 'Completed', 'toast="' + toastBad.slice(0, 80) + '"; status tetap=' + s1.status);
    await synthSvc('svc-progress', 'seed-svc-1', 'In Progress');
    toastBad = await toast();
    s1 = await svc('seed-svc-1');
    t.check('admin: transisi kerja Desainer DITOLAK', toastBad.includes('dikerjakan Desainer') && s1.status === 'Completed', 'toast="' + toastBad.slice(0, 80) + '"; status tetap=' + s1.status);
    await setRole('customer');
    await synthSvc('svc-progress', 'seed-svc-1', 'Review');
    toastBad = await toast();
    s1 = await svc('seed-svc-1');
    t.check('customer: perubahan status pengerjaan DITOLAK', toastBad.includes('aksi Desainer/Admin, bukan pelanggan') && s1.status === 'Completed', 'toast="' + toastBad.slice(0, 80) + '"; status tetap=' + s1.status);
    await t.shot('layanan-completed-customer');

    // ---------- Penugasan ----------
    t.section('penugasan desainer');
    await t.goto('dashboard');
    await setRole('admin');
    await grantOn();
    await t.goto('admin?tab=layanan'); await sleep(200);
    // Ganti penugasan proyek berjalan (svc-2 In Progress des-2 -> des-1)
    await t.select('[data-s2-assign="seed-svc-2"]', 'des-1'); await sleep(400);
    let s2b = await svc('seed-svc-2');
    t.check('ganti penugasan proyek berjalan: des-2 -> des-1, status tetap In Progress', s2b && s2b.designerId === 'des-1' && s2b.status === 'In Progress', 'designerId=' + (s2b && s2b.designerId) + '; status=' + (s2b && s2b.status));
    await setRole('designer');
    txt = await appText();
    t.check('workspace des-1 kini menampilkan svc-2', txt.includes('REQ-2026-202'), '202 hadir di workspace des-1=' + txt.includes('REQ-2026-202'));
    await t.goto('dashboard');
    await setRole('admin');
    await grantOn();
    await t.goto('admin?tab=layanan'); await sleep(200);
    await t.select('[data-s2-assign="seed-svc-2"]', 'des-2'); await sleep(400);
    s2b = await svc('seed-svc-2');
    t.check('penugasan svc-2 dikembalikan ke des-2', s2b && s2b.designerId === 'des-2', 'designerId=' + (s2b && s2b.designerId));
    // Tolak penugasan proyek New tanpa pesanan lunas (svc-3)
    await t.select('[data-s2-assign="seed-svc-3"]', 'des-1'); await sleep(400);
    toastBad = await toast();
    const s3 = await svc('seed-svc-3');
    t.check('tugaskan REQ-2026-203 (New, tanpa order) DITOLAK', toastBad.includes('belum dapat ditugaskan') && toastBad.includes('belum ada pesanan terkait berstatus Success') && s3.status === 'New' && !s3.designerId, 'toast="' + toastBad.slice(0, 100) + '"; status=' + s3.status + '; designerId=' + s3.designerId);
    // Tolak penugasan tanpa grant
    await grantOff();
    const gOff = await grantState();
    await t.select('[data-s2-assign="seed-svc-3"]', 'des-1'); await sleep(400);
    toastBad = await toast();
    const s3b = await svc('seed-svc-3');
    t.check('tugaskan tanpa grant DITOLAK (mode inspeksi)', gOff === false && toastBad.includes('Mode inspeksi Admin') && s3b.status === 'New' && !s3b.designerId, 'grant=' + gOff + '; toast="' + toastBad.slice(0, 80) + '"; status=' + s3b.status);
    await grantOn();

    // ---------- Alur positif New -> Paid -> Assigned (UI penuh) ----------
    t.section('alur positif New-Paid-Assigned');
    await setRole('customer');
    await t.goto('checkout?inv=seed-inv-2'); await sleep(300);
    const confirmTxt = await t.eval(() => { const b = document.querySelector('[data-s2="co-confirm"]'); return b ? b.textContent : ''; });
    t.check('checkout seed-inv-2 terkunci Basic Rp29.000', confirmTxt.includes('Rp29.000'), 'tombol konfirmasi="' + confirmTxt.trim().slice(0, 60) + '"');
    await t.click('[data-s2="co-confirm"]'); await sleep(600);
    const payHash = await t.eval(() => location.hash);
    const newOrder = await t.eval(() => { const o = S2.orders[0]; return o ? { id: o.id, number: o.number, invitationId: o.invitationId, packageId: o.packageId, paymentStatus: o.paymentStatus } : null; });
    t.check('pesanan baru dibuat untuk seed-inv-2 (Basic)', payHash.startsWith('#/bayar/') && newOrder && newOrder.invitationId === 'seed-inv-2' && newOrder.packageId === 'basic', 'hash=' + payHash + '; order=' + JSON.stringify(newOrder));
    await t.click('[data-s2="pay-result"][data-res="Success"]'); await sleep(500);
    const paidOrder = await t.eval((id) => { const o = S2.orders.find(x => x.id === id); return o ? { paymentStatus: o.paymentStatus, status: o.status } : null; }, newOrder.id);
    t.check('bayar simulasi Success untuk pesanan baru', paidOrder && paidOrder.paymentStatus === 'Success', 'order=' + JSON.stringify(paidOrder));
    // Buat permintaan layanan tertaut ke seed-inv-2 (order terbaru = pesanan barusan)
    await t.goto('dashboard?tab=layanan'); await sleep(200);
    await t.fill('#sv-name', 'Ulang Tahun Kirana — Desain Kustom');
    await t.select('#sv-inv', 'seed-inv-2');
    await t.click('#s2-svc-form button[type="submit"]'); await sleep(500);
    const svcNew = await t.eval(() => { const s = S2.services.find(x => x.title === 'Ulang Tahun Kirana — Desain Kustom'); return s ? JSON.parse(JSON.stringify(s)) : null; });
    txt = await appText();
    t.check('permintaan baru REQ-2026-205 dibuat, status New, tertaut order lunas', !!svcNew && svcNew.number === 'REQ-2026-205' && svcNew.status === 'New' && svcNew.orderId === newOrder.id && txt.includes('REQ-2026-205'), 'svc=' + JSON.stringify(svcNew && { number: svcNew.number, status: svcNew.status, orderId: svcNew.orderId, invitationId: svcNew.invitationId }));
    // Tugaskan sebagai admin dengan grant
    await setRole('admin');
    await grantOn();
    await t.goto('admin?tab=layanan'); await sleep(200);
    const toastAssign = await (async () => { await t.select('[data-s2-assign="' + svcNew.id + '"]', 'des-1'); await sleep(400); return toast(); })();
    const svcAssigned = await svc(svcNew.id);
    t.check('tugaskan REQ-2026-205: New -> Assigned, des-1', svcAssigned && svcAssigned.status === 'Assigned' && svcAssigned.designerId === 'des-1', 'status=' + (svcAssigned && svcAssigned.status) + '; designerId=' + (svcAssigned && svcAssigned.designerId) + '; toast="' + (toastAssign || '').slice(0, 60) + '"');
    await setRole('designer');
    txt = await appText();
    t.check('workspace des-1 menampilkan REQ-2026-205 (Assigned)', txt.includes('REQ-2026-205') && txt.includes('Assigned'), '205 hadir=' + txt.includes('REQ-2026-205'));
    await t.shot('desainer-workspace-assigned');

    // ---------- Satu record, tiga peran ----------
    t.section('satu record tiga peran');
    const recAdmin = await t.eval(() => { const s = S2.services.find(x => x.id === 'seed-svc-1'); return s ? { id: s.id, number: s.number, status: s.status, designerId: s.designerId, revs: s.revisions.length, notes: (s.internalNotes || []).length } : null; });
    await setRole('admin');
    await t.goto('admin?tab=layanan'); await sleep(200);
    txt = await appText();
    const adminView = { number: txt.includes('REQ-2026-201'), status: txt.includes('Completed'), designer: await t.eval(() => { const s = document.querySelector('[data-s2-assign="seed-svc-1"]'); return s ? s.value : ''; }) };
    await setRole('designer');
    txt = await appText();
    const desView = { number: txt.includes('REQ-2026-201'), status: txt.includes('Completed'), designer: txt.includes('Desainer: Rani Kirana') };
    await setRole('customer');
    await t.goto('dashboard?tab=layanan'); await sleep(200);
    txt = await appText();
    const custView = { number: txt.includes('REQ-2026-201'), status: txt.includes('Completed'), designer: txt.includes('Desainer: Rani Kirana'), revs: txt.includes('Revisi: 2') };
    const recEnd = await t.eval(() => { const s = S2.services.find(x => x.id === 'seed-svc-1'); return s ? { id: s.id, number: s.number, status: s.status, designerId: s.designerId, revs: s.revisions.length, notes: (s.internalNotes || []).length } : null; });
    t.check('record seed-svc-1 SAMA di storage lintas peran', JSON.stringify(recAdmin) === JSON.stringify(recEnd) && recEnd.status === 'Completed' && recEnd.designerId === 'des-1' && recEnd.revs === 2 && recEnd.notes === 1, 'record=' + JSON.stringify(recEnd));
    t.check('tiga peran menampilkan id/status/desainer/revisi yang sama', adminView.number && adminView.status && adminView.designer === 'des-1' && desView.number && desView.status && desView.designer && custView.number && custView.status && custView.designer && custView.revs, 'admin=' + JSON.stringify(adminView) + '; desainer=' + JSON.stringify(desView) + '; customer=' + JSON.stringify(custView));
    await t.shot('layanan-customer-akhir');

    // ---------- Regresi v24 (F3): pesan penolakan tier-mismatch ----------
    t.section('regresi v24: pesan penolakan tier-mismatch');
    // Layanan baru tertaut seed-inv-1 (template Premium): form menautkan
    // order TERBARU undangan itu = seed-order-7 (Signature, Success).
    // Penugasan harus DITOLAK (kiServicePaidProof null karena tier
    // mismatch), tetapi pesannya harus menyebut tier — bukan menuduh
    // pembayaran Success "belum Success" (bug v24, diperbaiki di
    // js/13-s2-handlers.js handler data-s2-assign).
    await t.goto('dashboard?tab=layanan'); await sleep(200);
    await t.fill('#sv-name', 'Layanan Uji Tier 2E');
    await t.select('#sv-inv', 'seed-inv-1');
    await t.click('#s2-svc-form button[type="submit"]'); await sleep(500);
    const svcTier = await t.eval(() => { const s = S2.services.find(x => x.title === 'Layanan Uji Tier 2E'); return s ? JSON.parse(JSON.stringify(s)) : null; });
    t.check('layanan baru tertaut seed-inv-1 + order terbaru seed-order-7 (Signature Success)', !!svcTier && svcTier.invitationId === 'seed-inv-1' && svcTier.orderId === 'seed-order-7' && svcTier.status === 'New', 'svc=' + JSON.stringify(svcTier && { number: svcTier.number, invitationId: svcTier.invitationId, orderId: svcTier.orderId, status: svcTier.status }));
    await setRole('admin');
    await grantOn();
    await t.goto('admin?tab=layanan'); await sleep(200);
    await t.select('[data-s2-assign="' + svcTier.id + '"]', 'des-1'); await sleep(400);
    const toastTier = await toast();
    const svcTierAfter = await svc(svcTier.id);
    t.check('penugasan DITOLAK dengan pesan tier (bukan "belum Success")', toastTier.includes('belum dapat ditugaskan') && toastTier.includes('tidak sesuai') && toastTier.includes('tier') && !toastTier.includes('belum Success') && svcTierAfter.status === 'New' && !svcTierAfter.designerId, 'toast="' + toastTier.slice(0, 170) + '"; status=' + svcTierAfter.status + '; designerId=' + svcTierAfter.designerId);
  },
};
