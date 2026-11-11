// Modul 2F — Data demo & reset (checkpoint 2F, verifikasi akhir Stage 2, v24).
// Menguji counts/relasi seed + orphan scan, konfirmasi reset (batal vs
// jalankan), nasib draft buatan sendiri, dan kebersihan storage pasca-reset
// — semuanya di browser lokal disposable, tanpa menyentuh kode aplikasi.
module.exports = {
  id: '2f',
  name: '2F Data demo & reset',
  run: async (t) => {
    const readStore = () => {
      const J2 = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
      const idx = J2('vowora:v1:index') || [];
      const invs = idx.map((id) => { const w = J2('vowora:v1:invitation:' + id); return w && w.invitation ? w.invitation : w; }).filter(Boolean);
      const guests = J2('vowora:v1:guests') || [];
      const rsvps = J2('vowora:v1:rsvps') || [];
      const orders = J2('vowora:v1:orders') || [];
      const payments = J2('vowora:v1:payments') || [];
      const services = J2('vowora:v1:service-requests') || [];
      const users = J2('vowora:v1:users') || [];
      return {
        totalInv: invs.length,
        invIds: invs.map((i) => i.id),
        mine: invs.filter((i) => i.ownerId === 'cust-1').map((i) => ({ id: i.id, title: i.title, status: i.status, ownerId: i.ownerId })),
        users: users.map((u) => u.id),
        guests: guests.length, rsvps: rsvps.length, orders: orders.length, payments: payments.length, services: services.length,
        guestsByInv: Object.fromEntries(invs.map((i) => [i.id, guests.filter((g) => g.invitationId === i.id).length])),
        rsvpsByInv: Object.fromEntries(invs.map((i) => [i.id, rsvps.filter((r) => r.invitationId === i.id).length])),
        hadir: rsvps.filter((r) => r.status === 'Hadir').reduce((a, r) => a + (r.count || 0), 0),
        ordersByCust: { 'cust-1': orders.filter((o) => o.customerId === 'cust-1').length, 'cust-2': orders.filter((o) => o.customerId === 'cust-2').length, 'cust-3': orders.filter((o) => o.customerId === 'cust-3').length },
        paymentsPerOrder: Object.fromEntries(orders.map((o) => [o.id, payments.filter((p) => p.orderId === o.id).length])),
      };
    };
    const scanOrphans = () => {
      const J2 = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
      const idx = J2('vowora:v1:index') || [];
      const invs = idx.map((id) => { const w = J2('vowora:v1:invitation:' + id); return w && w.invitation ? w.invitation : w; }).filter(Boolean);
      const cols = {
        invitations: invs,
        guests: J2('vowora:v1:guests') || [],
        rsvps: J2('vowora:v1:rsvps') || [],
        orders: J2('vowora:v1:orders') || [],
        payments: J2('vowora:v1:payments') || [],
        services: J2('vowora:v1:service-requests') || [],
      };
      const fnAvailable = typeof kiOrphanScan === 'function';
      const fn = fnAvailable ? kiOrphanScan(cols) : null;
      const invIds = new Set(invs.map((i) => i.id));
      const guestIds = new Set(cols.guests.map((g) => g.id));
      const orderById = {}; cols.orders.forEach((o) => { orderById[o.id] = o; });
      const manual = {
        guests: cols.guests.filter((g) => !invIds.has(g.invitationId)).map((g) => g.id),
        rsvps: cols.rsvps.filter((r) => !guestIds.has(r.guestId) || !invIds.has(r.invitationId)).map((r) => r.id),
        payments: cols.payments.filter((p) => { const o = orderById[p.orderId]; return !o || p.invitationId !== o.invitationId; }).map((p) => p.id),
        ordersHistorical: cols.orders.filter((o) => o.invitationId && !invIds.has(o.invitationId)).map((o) => o.id),
        servicesNoOrder: cols.services.filter((s) => s.orderId && !orderById[s.orderId]).map((s) => s.id),
        servicesHistorical: cols.services.filter((s) => s.invitationId && !invIds.has(s.invitationId)).map((s) => s.id),
        rsvpGuestMismatch: cols.rsvps.filter((r) => { const g = cols.guests.find((x) => x.id === r.guestId); return g && (g.invitationId !== r.invitationId || g.rsvpStatus !== r.status); }).map((r) => r.id),
      };
      return { fnAvailable, fn, manual };
    };
    const readKeys = () => ({
      keys: Object.keys(localStorage).sort(),
      tmp: localStorage.getItem('vowora-tmp:backup-next'),
      quarantine: localStorage.getItem('vowora:v1:quarantine'),
      seeded: localStorage.getItem('vowora:v1:seeded2'),
    });
    const readBackup = () => {
      const raw = localStorage.getItem('vowora:v1:backup:pre-stage2-fix');
      if (!raw) return { exists: false };
      try {
        const b = JSON.parse(raw);
        return { exists: true, at: b.at, reason: b.reason, nKeys: Object.keys(b.keys || {}).length, keys: Object.keys(b.keys || {}).sort() };
      } catch (e) { return { exists: true, parseError: String(e) }; }
    };
    const modalInfo = () => { const m = document.querySelector('#s2-modal'); if (!m) return null; return { title: (m.querySelector('h3') || {}).textContent, body: (m.querySelector('p') || {}).textContent, ok: (m.querySelector('#s2-modal-ok') || {}).textContent, cancel: (m.querySelector('#s2-modal-cancel') || {}).textContent }; };
    const readCards = () => Array.from(document.querySelectorAll('.inv-card')).map((c) => (c.querySelector('h3') || {}).textContent);

    // ================= Seed: counts & relasi =================
    t.section('seed');
    await t.goto('dashboard');
    const c0 = await t.storageCounts();
    t.check('counts seed storage', c0.invitations === 5 && c0.users === 6 && c0.guests === 22 && c0.rsvps === 18 && c0.orders === 8 && c0.payments === 8 && c0.services === 4 && c0.notifications === 4 && c0.activity === 4 && c0.coupons === 3,
      `storageCounts=${JSON.stringify(c0)}`);
    const s0 = await t.eval(readStore);
    t.check('seed: 5 undangan (Nadia 3, Bimo 1, Salsa 1)', s0.totalInv === 5 && s0.mine.length === 3 && JSON.stringify(s0.invIds.slice().sort()) === JSON.stringify(['seed-inv-1', 'seed-inv-2', 'seed-inv-3', 'seed-inv-4', 'seed-inv-5']),
      `invIds=${JSON.stringify(s0.invIds)} mine=${JSON.stringify(s0.mine.map((i) => i.id))}`);
    t.check('seed: 6 user (cust-1..3, admin-1, des-1, des-2)', JSON.stringify(s0.users) === JSON.stringify(['cust-1', 'cust-2', 'cust-3', 'admin-1', 'des-1', 'des-2']),
      `users=${JSON.stringify(s0.users)}`);
    t.check('seed: tamu per undangan 14/8/0/0/0', s0.guestsByInv['seed-inv-1'] === 14 && s0.guestsByInv['seed-inv-2'] === 8 && s0.guestsByInv['seed-inv-3'] === 0 && s0.guestsByInv['seed-inv-4'] === 0 && s0.guestsByInv['seed-inv-5'] === 0,
      `guestsByInv=${JSON.stringify(s0.guestsByInv)} total=${s0.guests}`);
    t.check('seed: RSVP per undangan 12/6/0/0/0; hadir 26', s0.rsvpsByInv['seed-inv-1'] === 12 && s0.rsvpsByInv['seed-inv-2'] === 6 && s0.rsvpsByInv['seed-inv-3'] === 0 && s0.rsvpsByInv['seed-inv-4'] === 0 && s0.rsvpsByInv['seed-inv-5'] === 0 && s0.hadir === 26,
      `rsvpsByInv=${JSON.stringify(s0.rsvpsByInv)} total=${s0.rsvps} hadir=${s0.hadir}`);
    t.check('seed: order per pelanggan 4/2/2; 1 pembayaran per order', JSON.stringify(s0.ordersByCust) === JSON.stringify({ 'cust-1': 4, 'cust-2': 2, 'cust-3': 2 }) && Object.values(s0.paymentsPerOrder).every((n) => n === 1),
      `ordersByCust=${JSON.stringify(s0.ordersByCust)} paymentsPerOrder=${JSON.stringify(s0.paymentsPerOrder)}`);
    const orph0 = await t.eval(scanOrphans);
    t.check('orphan scan (kiOrphanScan) tersedia & kosong', orph0.fnAvailable && orph0.fn && Object.values(orph0.fn).every((a) => a.length === 0),
      `fnAvailable=${orph0.fnAvailable} fn=${JSON.stringify(orph0.fn)}`);
    t.check('orphan scan manual: tanpa yatim (tamu/RSVP/bayar/layanan/historis)', Object.values(orph0.manual).every((a) => a.length === 0),
      `manual=${JSON.stringify(orph0.manual)}`);
    const keys0 = await t.eval(readKeys);
    t.check('pra-reset: tanpa kunci tmp backup; tanpa sisa fixture', keys0.tmp === null && !keys0.keys.some((k) => /fixture|stub|handler-test/i.test(k)),
      `keys=${JSON.stringify(keys0.keys)} tmp=${keys0.tmp}`);
    const bk0 = await t.eval(readBackup);
    t.check('pra-reset: belum ada backup pre-reset', bk0.exists === false, `backup=${JSON.stringify(bk0)}`);
    await t.shot('2f-seed');

    // ================= Draft buatan sendiri via Builder =================
    t.section('draft-sendiri');
    await t.goto('buat/luxury-ivory');
    const hasNewDraft = await t.eval(() => !!document.querySelector('[data-new-draft="luxury-ivory"]'));
    const buatHash = await t.eval(() => location.hash);
    t.check('halaman buat/luxury-ivory: tombol Buat Undangan Baru ada', hasNewDraft === true,
      `hasNewDraft=${hasNewDraft} url=${buatHash}`);
    await t.click('[data-new-draft="luxury-ivory"]');
    try { await t.page.waitForURL((u) => u.includes('#/studio/'), { timeout: 5000 }); } catch (e) { /* dilaporkan oleh check berikut */ }
    const draftHash = await t.eval(() => location.hash);
    const draftId = draftHash.replace(/^#\/studio\//, '');
    t.check('klik Buat: pindah ke studio draft baru', /^#\/studio\/inv-\d+$/.test(draftHash),
      `hash=${draftHash}`);
    const sDraft = await t.eval(readStore);
    const draftRec = await t.eval((id) => { const v = JSON.parse(localStorage.getItem('vowora:v1:invitation:' + id) || 'null'); const inv = v && v.invitation ? v.invitation : v; return inv ? { id: inv.id, title: inv.title, status: inv.status, ownerId: inv.ownerId, archived: inv.archived, slug: inv.slug, templateId: inv.templateId } : null; }, draftId);
    t.check('draft baru: record draft milik cust-1 di storage', !!draftRec && draftRec.status === 'draft' && draftRec.ownerId === 'cust-1' && draftRec.archived === false && draftRec.slug === null && draftRec.templateId === 'luxury-ivory',
      `draftRec=${JSON.stringify(draftRec)} totalInv=${sDraft.totalInv}`);
    await t.goto('dashboard?tab=undangan');
    const cardsDraft = await t.eval(readCards);
    t.check('draft baru: tampil di daftar undangan (4 kartu)', cardsDraft.length === 4 && draftRec && cardsDraft.includes(draftRec.title),
      `cards=${JSON.stringify(cardsDraft)} draftTitle=${draftRec ? draftRec.title : null}`);
    await t.shot('2f-draft-baru');

    // ================= Reset: batal =================
    t.section('reset-batal');
    await t.goto('dashboard?tab=pengaturan');
    const hasResetBtn = await t.eval(() => !!document.querySelector('[data-s2="reset-demo"]'));
    t.check('pengaturan: tombol Reset Data Demo ada', hasResetBtn === true, `hasResetBtn=${hasResetBtn}`);
    await t.click('[data-s2="reset-demo"]');
    const modalReset = await t.eval(modalInfo);
    t.check('reset: modal konfirmasi eksplisit muncul', !!modalReset && modalReset.title === 'Reset seluruh data demo?' && modalReset.ok === 'Ya, Reset Semua Data Demo',
      `modal=${JSON.stringify(modalReset)}`);
    t.check('reset: modal menyatakan draft buatan sendiri ikut terhapus', !!modalReset && /draft undangan buatan Anda sendiri ikut terhapus/i.test(modalReset.body || ''),
      `body=${JSON.stringify(modalReset ? modalReset.body : null)}`);
    await t.click('#s2-modal-cancel');
    const modalGone = await t.eval(modalInfo);
    const cCancel = await t.storageCounts();
    const sCancel = await t.eval(readStore);
    t.check('reset batal: modal hilang, data utuh (6 undangan, draft ada)', modalGone === null && cCancel.invitations === 6 && sCancel.invIds.includes(draftId) && cCancel.guests === 22 && cCancel.rsvps === 18,
      `modal=${JSON.stringify(modalGone)} inv=${cCancel.invitations} draftMasihAda=${sCancel.invIds.includes(draftId)} guests=${cCancel.guests}`);

    // ================= Reset: konfirmasi =================
    t.section('reset-konfirmasi');
    await t.click('[data-s2="reset-demo"]');
    const modalReset2 = await t.eval(modalInfo);
    t.check('reset kedua: modal muncul lagi', !!modalReset2 && modalReset2.title === 'Reset seluruh data demo?', `modal=${JSON.stringify(modalReset2)}`);
    await t.click('#s2-modal-ok');
    await t.page.waitForTimeout(2500); // handler: toast + location.reload() setelah 500ms
    await t.goto('dashboard');
    const c1 = await t.storageCounts();
    t.check('pasca-reset: counts kembali ke seed (5/6/22/18/8/8/4/4/4/3)', c1.invitations === 5 && c1.users === 6 && c1.guests === 22 && c1.rsvps === 18 && c1.orders === 8 && c1.payments === 8 && c1.services === 4 && c1.notifications === 4 && c1.activity === 4 && c1.coupons === 3,
      `storageCounts=${JSON.stringify(c1)}`);
    const s1 = await t.eval(readStore);
    t.check('pasca-reset: draft buatan sendiri TERHAPUS', !s1.invIds.includes(draftId) && s1.totalInv === 5,
      `invIds=${JSON.stringify(s1.invIds)} draftId=${draftId}`);
    t.check('pasca-reset: undangan seed utuh (id seed 1..5)', JSON.stringify(s1.invIds.slice().sort()) === JSON.stringify(['seed-inv-1', 'seed-inv-2', 'seed-inv-3', 'seed-inv-4', 'seed-inv-5']),
      `invIds=${JSON.stringify(s1.invIds)}`);
    const orph1 = await t.eval(scanOrphans);
    t.check('pasca-reset: orphan scan kosong (kiOrphanScan + manual)', orph1.fnAvailable && Object.values(orph1.fn).every((a) => a.length === 0) && Object.values(orph1.manual).every((a) => a.length === 0),
      `fn=${JSON.stringify(orph1.fn)} manual=${JSON.stringify(orph1.manual)}`);
    const bk1 = await t.eval(readBackup);
    t.check('pasca-reset: backup pre-reset ADA + berisi snapshot pra-reset', bk1.exists === true && bk1.reason === 'pre-reset' && typeof bk1.at === 'number' && bk1.nKeys > 0,
      `backup=${JSON.stringify(bk1)}`);
    t.check('backup berisi kunci draft yang dihapus + koleksi seed', bk1.exists === true && bk1.keys.includes('vowora:v1:invitation:' + draftId) && bk1.keys.includes('vowora:v1:guests') && bk1.keys.includes('vowora:v1:orders') && bk1.keys.includes('vowora:v1:index'),
      `backupKeys=${JSON.stringify(bk1.keys)}`);
    const keys1 = await t.eval(readKeys);
    const added = keys1.keys.filter((k) => !keys0.keys.includes(k));
    const removed = keys0.keys.filter((k) => !keys1.keys.includes(k));
    t.check('kebersihan storage: hanya tambah kunci backup, hanya hapus kunci draft', JSON.stringify(added) === JSON.stringify(['vowora:v1:backup:pre-stage2-fix']) && removed.length === 0,
      `added=${JSON.stringify(added)} removedVsPraReset=${JSON.stringify(removed)} keys=${JSON.stringify(keys1.keys)}`);
    t.check('kebersihan storage: kunci tmp hilang, tanpa sisa fixture/stub', keys1.tmp === null && !keys1.keys.some((k) => /fixture|stub|handler-test|tmp/i.test(k)),
      `tmp=${keys1.tmp} keys=${JSON.stringify(keys1.keys)}`);
    t.check('karantina dipertahankan (nilai sama pra/pasca reset)', keys1.quarantine === keys0.quarantine,
      `quarantinePra=${JSON.stringify(keys0.quarantine)} quarantinePasca=${JSON.stringify(keys1.quarantine)}`);
    t.check('flag seeded kembali true', keys1.seeded === 'true', `seeded=${keys1.seeded}`);
    await t.goto('dashboard?tab=undangan');
    const cardsAfter = await t.eval(readCards);
    t.check('pasca-reset: daftar undangan kembali 3 kartu seed', cardsAfter.length === 3,
      `cards=${JSON.stringify(cardsAfter)}`);
    await t.reload();
    const c1r = await t.storageCounts();
    t.check('pasca-reset stabil sesudah reload', c1r.invitations === 5 && c1r.guests === 22 && c1r.rsvps === 18 && c1r.orders === 8,
      `storageCounts=${JSON.stringify(c1r)}`);
    await t.shot('2f-pasca-reset');
  },
};
