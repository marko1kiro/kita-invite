// Modul 2A — Dashboard (checkpoint 2A, verifikasi akhir Stage 2, v24).
// Menguji ringkasan vs storage, filter, cari, duplikat, arsip, hapus
// berkonfirmasi (+cascade), dan persistensi sesudah reload — semuanya
// di browser lokal disposable, tanpa menyentuh kode aplikasi.
module.exports = {
  id: '2a',
  name: '2A Dashboard',
  run: async (t) => {
    // --- Helper baca storage (self-contained, dievaluasi di page) ---
    const readStore = () => {
      const J = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
      const idx = J('vowora:v1:index') || [];
      const invs = idx.map((id) => { const w = J('vowora:v1:invitation:' + id); return w && w.invitation ? w.invitation : w; }).filter(Boolean);
      const mine = invs.filter((i) => i.ownerId === 'cust-1');
      const guests = J('vowora:v1:guests') || [];
      const rsvps = J('vowora:v1:rsvps') || [];
      const orders = J('vowora:v1:orders') || [];
      const payments = J('vowora:v1:payments') || [];
      const mineIds = new Set(mine.map((i) => i.id));
      const myRsvps = rsvps.filter((r) => mineIds.has(r.invitationId));
      const hadir = myRsvps.filter((r) => r.status === 'Hadir').reduce((a, r) => a + (r.count || 0), 0);
      // Status efektif sederhana (seed: tidak ada expiry — publishedAt
      // seed-inv-1 = seed-10 hari, paket Premium 6 bulan).
      const st = (i) => (i.archived ? 'archived' : i.status !== 'published' ? 'draft' : 'published');
      return {
        totalInv: invs.length,
        mine: mine.map((i) => ({ id: i.id, title: i.title, status: i.status, archived: !!i.archived, slug: i.slug || null, templateId: i.templateId, ownerId: i.ownerId, key: st(i) })),
        guests: guests.length,
        myGuests: guests.filter((g) => mineIds.has(g.invitationId)).length,
        rsvps: rsvps.length,
        myRsvps: myRsvps.length,
        hadir,
        orders: orders.length,
        myOrders: orders.filter((o) => o.customerId === 'cust-1').length,
        myPending: orders.filter((o) => o.customerId === 'cust-1' && o.paymentStatus === 'Pending').length,
        payments: payments.length,
        guestsByInv: Object.fromEntries(mine.map((i) => [i.id, guests.filter((g) => g.invitationId === i.id).length])),
        rsvpsByInv: Object.fromEntries(mine.map((i) => [i.id, rsvps.filter((r) => r.invitationId === i.id).length])),
        presentIds: invs.map((i) => i.id),
        indexIds: idx,
        ordersByInv: Object.fromEntries(invs.map((i) => [i.id, orders.filter((o) => o.invitationId === i.id).map((o) => o.id)])),
      };
    };
    const readOverview = () => Array.from(document.querySelectorAll('.stat-grid .stat')).map((s) => ({
      b: (s.querySelector('b') || {}).textContent,
      span: (s.querySelector('span') || {}).textContent,
      small: (s.querySelector('small') || {}).textContent,
    }));
    const readCards = () => Array.from(document.querySelectorAll('.inv-card')).map((c) => ({
      title: (c.querySelector('h3') || {}).textContent,
      pill: (c.querySelector('.pill') || {}).textContent,
    }));
    const emptyShown = () => { const e = document.querySelector('.empty h3'); return e ? e.textContent : null; };
    const modalInfo = () => { const m = document.querySelector('#s2-modal'); if (!m) return null; return { title: (m.querySelector('h3') || {}).textContent, body: (m.querySelector('p') || {}).textContent, ok: (m.querySelector('#s2-modal-ok') || {}).textContent, cancel: (m.querySelector('#s2-modal-cancel') || {}).textContent }; };
    const clickFilter = async (f) => { await t.click(`button[data-s2="inv-filter"][data-id="${f}"]`); };

    // ================= Ringkasan =================
    t.section('ringkasan');
    await t.goto('dashboard');
    const c0 = await t.storageCounts();
    t.check('counts seed storage', c0.invitations === 5 && c0.users === 6 && c0.guests === 22 && c0.rsvps === 18 && c0.orders === 8 && c0.payments === 8 && c0.services === 4 && c0.notifications === 4 && c0.activity === 4 && c0.coupons === 3,
      `storageCounts=${JSON.stringify(c0)}`);
    const s0 = await t.eval(readStore);
    t.check('record milik Nadia = 3 undangan', s0.mine.length === 3, `mine=${JSON.stringify(s0.mine.map((i) => i.id + ':' + i.title + ':' + i.key))} totalInv=${s0.totalInv}`);
    t.check('tamu/RSVP/hadir milik Nadia', s0.myGuests === 22 && s0.myRsvps === 18 && s0.hadir === 26,
      `myGuests=${s0.myGuests} myRsvps=${s0.myRsvps} hadir=${s0.hadir} guestsByInv=${JSON.stringify(s0.guestsByInv)} rsvpsByInv=${JSON.stringify(s0.rsvpsByInv)}`);
    t.check('order milik Nadia 4, pending 2', s0.myOrders === 4 && s0.myPending === 2, `myOrders=${s0.myOrders} myPending=${s0.myPending} ordersTotal=${s0.orders}`);
    const ov0 = await t.eval(readOverview);
    t.check('stat ringkasan = 3/22/18/2', ov0.length === 4 && ov0[0].b === '3' && ov0[1].b === '22' && ov0[2].b === '18' && ov0[3].b === '2',
      `stats=${JSON.stringify(ov0)}`);
    t.check('stat kecil: 2 draft · 1 terbit; 26 hadir', ov0[0].small === '2 draft · 1 terbit' && ov0[2].small === '26 tamu terkonfirmasi hadir',
      `small0=${JSON.stringify(ov0[0].small)} small2=${JSON.stringify(ov0[2].small)}`);
    await t.reload();
    const ov0r = await t.eval(readOverview);
    const c0r = await t.storageCounts();
    t.check('ringkasan tetap sama sesudah reload', JSON.stringify(ov0r) === JSON.stringify(ov0) && c0r.invitations === 5 && c0r.guests === 22 && c0r.rsvps === 18,
      `statsReload=${JSON.stringify(ov0r)} countsReload=inv${c0r.invitations}/g${c0r.guests}/r${c0r.rsvps}`);
    await t.shot('2a-ringkasan');

    // ================= Filter =================
    t.section('filter');
    await t.goto('dashboard?tab=undangan');
    let cards = await t.eval(readCards);
    t.check('filter semua: 3 kartu', cards.length === 3, `cards=${JSON.stringify(cards.map((c) => c.title))}`);
    await clickFilter('draft');
    cards = await t.eval(readCards);
    const expDraft = s0.mine.filter((i) => i.key === 'draft').map((i) => i.title).sort();
    t.check('filter draft: 2 kartu sesuai record', cards.length === 2 && JSON.stringify(cards.map((c) => c.title).sort()) === JSON.stringify(expDraft),
      `cards=${JSON.stringify(cards.map((c) => c.title))} expected=${JSON.stringify(expDraft)}`);
    await clickFilter('published');
    cards = await t.eval(readCards);
    t.check('filter terbit: 1 kartu Nadia & Reza', cards.length === 1 && cards[0].title === 'Nadia & Reza',
      `cards=${JSON.stringify(cards)}`);
    await clickFilter('expired');
    cards = await t.eval(readCards);
    t.check('filter kedaluwarsa: 0 kartu + empty state', cards.length === 0 && (await t.eval(emptyShown)) === 'Tidak ada undangan pada filter ini',
      `cards=${cards.length} empty=${JSON.stringify(await t.eval(emptyShown))}`);
    await clickFilter('archived');
    cards = await t.eval(readCards);
    t.check('filter arsip: 0 kartu + empty state', cards.length === 0 && (await t.eval(emptyShown)) === 'Tidak ada undangan pada filter ini',
      `cards=${cards.length} empty=${JSON.stringify(await t.eval(emptyShown))}`);
    await clickFilter('semua');
    cards = await t.eval(readCards);
    t.check('kembali ke semua: 3 kartu', cards.length === 3, `cards=${JSON.stringify(cards.map((c) => c.title))}`);

    // ================= Cari =================
    t.section('cari');
    await t.fill('#s2-inv-q', 'Nadia');
    cards = await t.eval(readCards);
    t.check('cari "Nadia": 1 kartu', cards.length === 1 && cards[0].title === 'Nadia & Reza', `cards=${JSON.stringify(cards)}`);
    await t.fill('#s2-inv-q', 'Ivory');
    cards = await t.eval(readCards);
    t.check('cari "Ivory" (nama template): 1 kartu', cards.length === 1 && cards[0].title === 'Nadia & Reza', `cards=${JSON.stringify(cards)}`);
    await t.fill('#s2-inv-q', 'zzz-tidak-ada');
    cards = await t.eval(readCards);
    t.check('cari tanpa hasil: 0 kartu + empty state', cards.length === 0 && (await t.eval(emptyShown)) === 'Tidak ada undangan pada filter ini',
      `cards=${cards.length} empty=${JSON.stringify(await t.eval(emptyShown))}`);
    await t.fill('#s2-inv-q', '');
    cards = await t.eval(readCards);
    t.check('cari dikosongkan: kembali 3 kartu', cards.length === 3, `cards=${JSON.stringify(cards.map((c) => c.title))}`);
    await t.shot('2a-cari-kosong');

    // ================= Duplikat =================
    t.section('duplikat');
    const beforeDup = await t.eval(readStore);
    const srcContent = await t.eval(() => { const v = JSON.parse(localStorage.getItem('vowora:v1:invitation:seed-inv-1') || 'null'); const inv = v && v.invitation ? v.invitation : v; return inv ? JSON.stringify(inv.content) : null; });
    await t.click('button[data-s2="inv-duplicate"][data-id="seed-inv-1"]');
    const afterDup = await t.eval(readStore);
    const copy = afterDup.mine.find((i) => !beforeDup.mine.some((b) => b.id === i.id));
    t.check('duplikat: record baru bertambah (total 6, milik Nadia 4)', afterDup.totalInv === 6 && afterDup.mine.length === 4,
      `totalInv=${afterDup.totalInv} mine=${afterDup.mine.length} ids=${JSON.stringify(afterDup.mine.map((i) => i.id))}`);
    t.check('duplikat: judul + "(Salinan)", status draft, slug null, template sama',
      !!copy && copy.title === 'Nadia & Reza (Salinan)' && copy.status === 'draft' && copy.slug === null && copy.templateId === 'luxury-ivory' && copy.ownerId === 'cust-1' && copy.archived === false,
      `copy=${JSON.stringify(copy)}`);
    const copyContent = copy ? await t.eval((id) => { const v = JSON.parse(localStorage.getItem('vowora:v1:invitation:' + id) || 'null'); const inv = v && v.invitation ? v.invitation : v; return inv ? JSON.stringify(inv.content) : null; }, copy.id) : null;
    t.check('duplikat: isi content sama persis dengan sumber', !!copy && copyContent === srcContent,
      `contentSama=${copyContent === srcContent} copyId=${copy ? copy.id : null}`);
    cards = await t.eval(readCards);
    t.check('duplikat: tampil di daftar (4 kartu, salinan di atas)', cards.length === 4 && cards.some((c) => c.title === 'Nadia & Reza (Salinan)'),
      `cards=${JSON.stringify(cards.map((c) => c.title))}`);
    await t.reload();
    await t.goto('dashboard?tab=undangan');
    const afterDupReload = await t.eval(readStore);
    t.check('duplikat bertahan sesudah reload', afterDupReload.totalInv === 6 && afterDupReload.mine.some((i) => i.title === 'Nadia & Reza (Salinan)'),
      `totalInv=${afterDupReload.totalInv} mineTitles=${JSON.stringify(afterDupReload.mine.map((i) => i.title))}`);

    // ================= Arsip =================
    t.section('arsip');
    const inv2Title = afterDupReload.mine.find((i) => i.id === 'seed-inv-2').title;
    await t.click('button[data-s2="inv-archive"][data-id="seed-inv-2"]');
    const afterArc = await t.eval(readStore);
    const arcRec = afterArc.mine.find((i) => i.id === 'seed-inv-2');
    t.check('arsip: record storage archived=true', !!arcRec && arcRec.archived === true && arcRec.key === 'archived',
      `rec=${JSON.stringify(arcRec)}`);
    cards = await t.eval(readCards);
    t.check('arsip: filter semua tetap menampilkan (4 kartu, pill Arsip)', cards.length === 4 && cards.some((c) => c.title === inv2Title && c.pill === 'Arsip'),
      `cards=${JSON.stringify(cards)}`);
    await clickFilter('draft');
    cards = await t.eval(readCards);
    t.check('arsip: hilang dari filter draft (tinggal 2: draft lain + salinan)', cards.length === 2 && !cards.some((c) => c.title === inv2Title),
      `cards=${JSON.stringify(cards.map((c) => c.title))}`);
    await clickFilter('archived');
    cards = await t.eval(readCards);
    t.check('arsip: muncul di filter arsip (1 kartu)', cards.length === 1 && cards[0].title === inv2Title && cards[0].pill === 'Arsip',
      `cards=${JSON.stringify(cards)}`);
    await t.reload();
    await t.goto('dashboard?tab=undangan');
    const afterArcReload = await t.eval(readStore);
    t.check('arsip bertahan sesudah reload', afterArcReload.mine.find((i) => i.id === 'seed-inv-2').archived === true,
      `archived=${afterArcReload.mine.find((i) => i.id === 'seed-inv-2').archived}`);
    await clickFilter('semua');
    await t.click('button[data-s2="inv-unarchive"][data-id="seed-inv-2"]');
    const afterUnarc = await t.eval(readStore);
    t.check('batal arsip: archived=false lagi', afterUnarc.mine.find((i) => i.id === 'seed-inv-2').archived === false,
      `rec=${JSON.stringify(afterUnarc.mine.find((i) => i.id === 'seed-inv-2'))}`);
    await clickFilter('archived');
    cards = await t.eval(readCards);
    t.check('batal arsip: filter arsip kembali 0 kartu', cards.length === 0, `cards=${cards.length}`);
    await clickFilter('semua');
    await t.shot('2a-arsip');

    // ================= Hapus berkonfirmasi (+cascade) =================
    t.section('hapus');
    // Target seed-inv-2: draft dengan 8 tamu + 6 RSVP (uji cascade).
    const preDel = await t.eval(readStore);
    t.check('pra-hapus: seed-inv-2 punya 8 tamu + 6 RSVP', preDel.guestsByInv['seed-inv-2'] === 8 && preDel.rsvpsByInv['seed-inv-2'] === 6,
      `guestsByInv=${JSON.stringify(preDel.guestsByInv)} rsvpsByInv=${JSON.stringify(preDel.rsvpsByInv)}`);
    await t.click('button[data-s2="inv-delete"][data-id="seed-inv-2"]');
    const modalDel = await t.eval(modalInfo);
    t.check('hapus: modal konfirmasi muncul', !!modalDel && modalDel.title === 'Hapus undangan ini?' && modalDel.ok === 'Ya, Hapus Permanen',
      `modal=${JSON.stringify(modalDel)}`);
    await t.click('#s2-modal-cancel');
    const modalGone = await t.eval(modalInfo);
    const afterCancel = await t.eval(readStore);
    t.check('hapus batal: modal hilang, record tetap ada', modalGone === null && afterCancel.totalInv === 6 && afterCancel.presentIds.includes('seed-inv-2') && afterCancel.guests === 22 && afterCancel.rsvps === 18,
      `modal=${JSON.stringify(modalGone)} totalInv=${afterCancel.totalInv} guests=${afterCancel.guests} rsvps=${afterCancel.rsvps}`);
    await t.click('button[data-s2="inv-delete"][data-id="seed-inv-2"]');
    await t.click('#s2-modal-ok');
    const afterDel = await t.eval(readStore);
    const ordersKept = await t.eval(() => { const o = JSON.parse(localStorage.getItem('vowora:v1:orders') || '[]'); return o.filter((x) => x.invitationId === 'seed-inv-2').map((x) => x.id + ':' + x.number); });
    t.check('hapus konfirmasi: undangan hilang dari storage + index', afterDel.totalInv === 5 && afterDel.mine.length === 3 && !afterDel.presentIds.includes('seed-inv-2') && !afterDel.indexIds.includes('seed-inv-2'),
      `totalInv=${afterDel.totalInv} mine=${afterDel.mine.length} presentIds=${JSON.stringify(afterDel.presentIds)}`);
    t.check('hapus cascade: tamu 22->14, RSVP 18->12', afterDel.guests === 14 && afterDel.myGuests === 14 && afterDel.rsvps === 12 && afterDel.myRsvps === 12,
      `guests=${afterDel.guests} myGuests=${afterDel.myGuests} rsvps=${afterDel.rsvps} guestsByInv=${JSON.stringify(afterDel.guestsByInv)}`);
    t.check('hapus: pesanan riwayat tetap (8 order, 2 order seed-inv-2 utuh)', afterDel.orders === 8 && ordersKept.length === 2,
      `orders=${afterDel.orders} ordersForSeedInv2=${JSON.stringify(ordersKept)} payments=${afterDel.payments}`);
    cards = await t.eval(readCards);
    t.check('hapus: hilang dari daftar UI (3 kartu)', cards.length === 3 && !cards.some((c) => c.title === inv2Title),
      `cards=${JSON.stringify(cards.map((c) => c.title))}`);
    await t.reload();
    await t.goto('dashboard?tab=undangan');
    const afterDelReload = await t.eval(readStore);
    t.check('hapus bertahan sesudah reload', afterDelReload.totalInv === 5 && afterDelReload.guests === 14 && afterDelReload.rsvps === 12 && !afterDelReload.presentIds.includes('seed-inv-2'),
      `totalInv=${afterDelReload.totalInv} guests=${afterDelReload.guests} rsvps=${afterDelReload.rsvps}`);
    await t.goto('dashboard');
    const ovEnd = await t.eval(readOverview);
    t.check('ringkasan akhir: 3 undangan / 14 tamu / 12 RSVP / 2 pending; hadir 18',
      ovEnd[0].b === '3' && ovEnd[1].b === '14' && ovEnd[2].b === '12' && ovEnd[3].b === '2' && ovEnd[2].small === '18 tamu terkonfirmasi hadir' && ovEnd[0].small === '2 draft · 1 terbit',
      `stats=${JSON.stringify(ovEnd)}`);
    await t.shot('2a-akhir');
  },
};
