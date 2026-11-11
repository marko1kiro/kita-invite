// Modul 2C — Order & Pembayaran + regresi order v22 (verifikasi akhir Stage 2).
// Browser nyata (Playwright) pada clone lokal disposable; klik simulasi
// bayar/pesan HANYA di sini, tidak pernah di Pages publik.
// Fakta seed (js/11-s2-seed.js, mkOrder): harga paket Basic 29000,
// Premium 59000, Signature 99000, Exclusive 149000 (js/01-core.js).
// Template tier (js/02-catalog.js): confetti-pop=Basic (seed-inv-2 Kirana,
// cust-1), luxury-ivory=Premium (seed-inv-1 Nadia, cust-1),
// noir-elan=Signature (seed-inv-5, cust-1), champagne-vow=Premium
// (seed-inv-4 Salsa, cust-3), summit-prime=Signature (seed-inv-3, cust-2).
// Order seed cust-1: 1001 premium Selesai/Success, 1003 basic
// Menunggu Pembayaran/Pending, 1007 signature Diproses/Success
// (HEMAT10: 99000-9900=89100), 1008 premium Menunggu Pembayaran/Pending
// (HOLD: paket Premium di undangan tier Basic).
// Order seed lain: 1002 signature Diproses/Success LAUNCH20 (cust-2),
// 1004 premium Dibatalkan/Failed (cust-3 Salsa), 1005 premium
// Menunggu Pembayaran/Expired (cust-3), 1006 exclusive Selesai/Success.
module.exports = {
  id: '2c',
  name: '2C Order & Pembayaran',
  run: async (t) => {
    const sleep = (ms) => t.page.waitForTimeout(ms);
    const toast = () => t.eval(() => (document.getElementById('toast') || {}).textContent || '');
    const orders = () => t.eval(() => JSON.parse(localStorage.getItem('vowora:v1:orders') || '[]'));
    const payments = () => t.eval(() => JSON.parse(localStorage.getItem('vowora:v1:payments') || '[]'));
    const orderByNum = async (num) => (await orders()).find((o) => o.number === num);
    const paysOf = async (orderId) => (await payments()).filter((p) => p.orderId === orderId);
    const invRec = (id) => t.eval((i) => { const w = JSON.parse(localStorage.getItem('vowora:v1:invitation:' + i) || 'null'); return w ? w.invitation : null; }, id);
    const cardText = (num) => t.eval((n) => {
      const r = [...document.querySelectorAll('.lrow')].find((x) => x.textContent.includes(n));
      return r ? r.innerText.replace(/\s+/g, ' ').trim().toLowerCase() : 'NOT-FOUND';
    }, num);
    const cardHref = (num, sel) => t.eval((o) => {
      const r = [...document.querySelectorAll('.lrow')].find((x) => x.textContent.includes(o.n));
      if (!r) return 'NO-CARD';
      const a = o.s ? r.querySelector(o.s) : r.querySelector('a.btn.gold.sm');
      return a ? (a.getAttribute('href') || '') : 'NO-LINK';
    }, { n: num, s: sel });
    const appText = () => t.eval(() => (document.getElementById('app') || {}).innerText || '');
    const confirmBtn = () => t.eval(() => {
      const b = document.querySelector('button[data-s2="co-confirm"]');
      return b ? { text: b.textContent.replace(/\s+/g, ' ').trim(), disabled: !!b.disabled } : null;
    });
    const coInv = () => t.eval(() => { const s = document.querySelector('#co-inv'); return s ? s.value : 'NO-SELECT'; });
    const pkgOpts = () => t.eval(() => [...document.querySelectorAll('.pkg-opt')].map((el) => ({
      name: (el.querySelector('b') || {}).textContent || '?',
      tag: el.tagName,
      note: (el.textContent.includes('Tidak tersedia untuk tier template undangan ini') ? 'locked' : el.textContent.includes('Checkout Ditahan') || el.textContent.includes('tidak dapat dibuktikan') || el.textContent.includes('Undangan tidak ditemukan') ? 'held' : 'on'),
    })));
    const payButtons = () => t.eval(() => [...document.querySelectorAll('[data-s2="pay-result"]')].map((b) => b.dataset.res));
    const firePayResult = (orderId, res) => t.eval((o) => {
      const b = document.createElement('button');
      b.setAttribute('data-s2', 'pay-result'); b.setAttribute('data-id', o.oid); b.setAttribute('data-res', o.r);
      document.body.appendChild(b); b.click(); b.remove();
      return (document.getElementById('toast') || {}).textContent || '';
    }, { oid: orderId, r: res });
    const setRole = async (role) => {
      await t.select('#s2-role', role);
      await sleep(700);
    };

    // ================= A. Seed: snapshot + status terpisah + hold 1008 =================
    t.section('A seed dashboard pesanan (cust-1)');
    await t.goto('dashboard?tab=pesanan');
    const base = await t.storageCounts();
    t.check('baseline storage seed', base.orders === 8 && base.payments === 8, `orders=${base.orders} payments=${base.payments} coupons=${base.coupons} invitations-index=${base.invitations}`);
    const c1001 = await cardText('KI-2026-1001');
    t.check('1001 snapshot Selesai/Success Rp59.000', c1001.includes('selesai') && c1001.includes('success') && c1001.includes('subtotal rp59.000') && c1001.includes('total rp59.000') && c1001.includes('harga paket tersimpan saat pesanan dibuat'), c1001);
    const c1007 = await cardText('KI-2026-1007');
    t.check('1007 Diproses/Success terpisah, HEMAT10 9900 total 89100', c1007.includes('diproses') && c1007.includes('success') && c1007.includes('subtotal rp99.000') && c1007.includes('diskon hemat10') && c1007.includes('rp9.900') && c1007.includes('total rp89.100'), c1007);
    t.check('1007 (Success, tier mismatch lama) tidak ditahan di tampilan', !c1007.includes('perlu pesanan baru') && !c1007.includes('pembayaran ditahan'), c1007);
    const c1003 = await cardText('KI-2026-1003');
    t.check('1003 Menunggu Pembayaran/Pending basic Rp29.000 + Bayar Sekarang', c1003.includes('menunggu pembayaran') && c1003.includes('pending') && c1003.includes('total rp29.000') && c1003.includes('bayar sekarang'), c1003);
    t.check('1003 link bayar ke order sendiri', (await cardHref('KI-2026-1003')) === '#/bayar/seed-order-3', await cardHref('KI-2026-1003'));
    const c1008 = await cardText('KI-2026-1008');
    t.check('1008 HOLD utuh: Premium Rp59.000 di undangan Basic', c1008.includes('menunggu pembayaran') && c1008.includes('pending') && c1008.includes('premium') && c1008.includes('total rp59.000') && c1008.includes('perlu pesanan baru') && c1008.includes('pembayaran ditahan'), c1008);
    t.check('1008 tanpa tombol Bayar Sekarang', !c1008.includes('bayar sekarang') && !c1008.includes('coba bayar lagi'), c1008);
    t.check('1008 CTA Buat Pesanan Baru bawa ?inv=seed-inv-2', (await cardHref('KI-2026-1008')) === '#/checkout?inv=seed-inv-2', await cardHref('KI-2026-1008'));
    const c1002cust = await cardText('KI-2026-1002');
    t.check('1002 (milik cust-2) tidak tampil di dashboard cust-1', c1002cust === 'NOT-FOUND', c1002cust);
    await t.shot('2c-a-dashboard-pesanan');

    // ================= B. Checkout: konteks undangan / tier / harga =================
    t.section('B checkout konteks & kunci tier');
    await t.goto('checkout?inv=seed-inv-2');
    t.check('checkout inv-2: undangan Kirana terpilih', (await coInv()) === 'seed-inv-2', 'co-inv=' + (await coInv()));
    const cb2 = await confirmBtn();
    t.check('checkout inv-2: kunci Basic Rp29.000', !!cb2 && cb2.text.includes('Rp29.000') && cb2.disabled === false, JSON.stringify(cb2));
    const pk2 = await pkgOpts();
    t.check('checkout inv-2: hanya Basic aktif, tier lain terkunci', pk2.length === 4 && pk2.find((p) => p.name === 'Basic').tag === 'BUTTON' && pk2.filter((p) => p.name !== 'Basic').every((p) => p.tag === 'DIV' && p.note === 'locked'), JSON.stringify(pk2));
    await t.goto('checkout?inv=seed-inv-1');
    t.check('checkout inv-1 (luxury-ivory Premium): kunci Premium Rp59.000', (await coInv()) === 'seed-inv-1' && (await confirmBtn()).text.includes('Rp59.000'), 'co-inv=' + (await coInv()) + ' confirm=' + JSON.stringify(await confirmBtn()));
    await t.goto('checkout?inv=seed-inv-5');
    t.check('checkout inv-5 (noir-elan Signature): kunci Signature Rp99.000', (await coInv()) === 'seed-inv-5' && (await confirmBtn()).text.includes('Rp99.000'), 'co-inv=' + (await coInv()) + ' confirm=' + JSON.stringify(await confirmBtn()));
    const ordBeforeHold = (await orders()).length;
    await t.goto('checkout?inv=');
    const txtEmpty = await appText();
    const cbEmpty = await confirmBtn();
    t.check('?inv= kosong fail-closed: ditahan + placeholder + tombol disabled', txtEmpty.includes('Checkout Ditahan — Undangan Tidak Ditemukan') && txtEmpty.includes('— pilih undangan —') && !!cbEmpty && cbEmpty.disabled === true, 'confirm=' + JSON.stringify(cbEmpty) + ' | teks-ditahan=' + txtEmpty.includes('Checkout Ditahan — Undangan Tidak Ditemukan'));
    t.check('?inv= kosong: 0 order baru', (await orders()).length === ordBeforeHold, `orders=${(await orders()).length} sebelum=${ordBeforeHold}`);
    await t.goto('checkout?inv=seed-inv-3');
    const txt3 = await appText();
    t.check('?inv=seed-inv-3 (milik cust-2) fail-closed', txt3.includes('Checkout Ditahan — Undangan Tidak Ditemukan') && (await confirmBtn()).disabled === true && (await orders()).length === ordBeforeHold, 'confirm-disabled=' + (await confirmBtn()).disabled + ' orders=' + (await orders()).length);
    await t.goto('checkout?inv=ngawur');
    const txtNg = await appText();
    t.check('?inv=ngawur fail-closed + pesan jelas', txtNg.includes('Checkout Ditahan — Undangan Tidak Ditemukan') && txtNg.includes('tidak ditemukan') && (await confirmBtn()).disabled === true && (await orders()).length === ordBeforeHold, 'orders=' + (await orders()).length);
    await t.shot('2c-b-checkout-held');

    // ================= C. Kupon + buat order baru =================
    t.section('C kupon & order baru');
    await t.goto('checkout?inv=seed-inv-2');
    await t.fill('#co-coupon', 'HEMAT10');
    await t.click('button[data-s2="co-coupon-apply"]');
    await sleep(500);
    const toastH = await toast();
    const sumH = await appText();
    t.check('kupon HEMAT10 diterima: toast + total Rp26.100', toastH.includes('Kupon HEMAT10 aktif') && sumH.includes('Rp26.100'), `toast="${toastH}" total-26100=${sumH.includes('Rp26.100')}`);
    await t.click('button[data-s2="co-confirm"]');
    await sleep(800);
    const hash1 = await t.eval(() => location.hash);
    const newId1 = hash1.replace('#/bayar/', '');
    const oNew1 = (await orders()).find((o) => o.id === newId1);
    t.check('order baru HEMAT10 tercipta: Basic 29000-2900=26100', !!oNew1 && oNew1.packageId === 'basic' && oNew1.price === 29000 && oNew1.discount === 2900 && oNew1.total === 26100 && oNew1.couponCode === 'HEMAT10' && oNew1.status === 'Menunggu Pembayaran' && oNew1.paymentStatus === 'Pending' && oNew1.invitationId === 'seed-inv-2', JSON.stringify(oNew1));
    const pNew1 = await paysOf(newId1);
    t.check('payment record order HEMAT10: Pending Rp26.100 + kode', pNew1.length === 1 && pNew1[0].status === 'Pending' && pNew1[0].amount === 26100 && !!pNew1[0].code, JSON.stringify(pNew1));
    await t.goto('checkout?inv=seed-inv-5');
    await t.fill('#co-coupon', 'LAUNCH20');
    await t.click('button[data-s2="co-coupon-apply"]');
    await sleep(500);
    const toastL = await toast();
    const sumL = await appText();
    t.check('kupon LAUNCH20 diterima: toast + total Rp79.200', toastL.includes('Kupon LAUNCH20 aktif') && sumL.includes('Rp79.200'), `toast="${toastL}" total-79200=${sumL.includes('Rp79.200')}`);
    await t.click('button[data-s2="co-confirm"]');
    await sleep(800);
    const hash2 = await t.eval(() => location.hash);
    const newId2 = hash2.replace('#/bayar/', '');
    const oNew2 = (await orders()).find((o) => o.id === newId2);
    t.check('order baru LAUNCH20 tercipta: Signature 99000-19800=79200', !!oNew2 && oNew2.packageId === 'signature' && oNew2.price === 99000 && oNew2.discount === 19800 && oNew2.total === 79200 && oNew2.couponCode === 'LAUNCH20' && oNew2.invitationId === 'seed-inv-5', JSON.stringify(oNew2));
    const ordAfterCoupons = (await orders()).length;
    await t.goto('checkout?inv=seed-inv-1');
    await t.fill('#co-coupon', 'TEMAN15');
    await t.click('button[data-s2="co-coupon-apply"]');
    await sleep(500);
    const toastT = await toast();
    const sumT = await appText();
    t.check('kupon nonaktif TEMAN15 ditolak + total kembali Rp59.000', toastT.includes('tidak ditemukan atau sudah nonaktif') && sumT.includes('Rp59.000') && !sumT.includes('Kupon TEMAN15 aktif'), `toast="${toastT}"`);
    await t.fill('#co-coupon', 'NGAWUR99');
    await t.click('button[data-s2="co-coupon-apply"]');
    await sleep(500);
    const toastW = await toast();
    t.check('kupon salah NGAWUR99 ditolak + 0 order baru', toastW.includes('tidak ditemukan atau sudah nonaktif') && (await orders()).length === ordAfterCoupons, `toast="${toastW}" orders=${(await orders()).length} sebelum=${ordAfterCoupons}`);

    // ================= D. Bayar: sukses / gagal / kedaluwarsa =================
    t.section('D simulasi bayar 1003 + gagal/kedaluwarsa order baru');
    await t.goto('bayar/seed-order-3');
    const payBtns3 = await payButtons();
    t.check('halaman bayar 1003 tawarkan 3 simulasi', JSON.stringify(payBtns3) === JSON.stringify(['Success', 'Failed', 'Expired']), JSON.stringify(payBtns3));
    const paysBefore3 = (await payments()).length;
    await t.click('button[data-s2="pay-result"][data-res="Success"]');
    await sleep(700);
    const o1003 = await orderByNum('KI-2026-1003');
    const p1003 = await paysOf('seed-order-3');
    t.check('1003 Success: order Diproses, payment Success, record sama (tanpa record baru)', o1003.status === 'Diproses' && o1003.paymentStatus === 'Success' && p1003.length === 1 && p1003[0].status === 'Success' && !!p1003[0].paidAt && (await payments()).length === paysBefore3, `order=${o1003.status}/${o1003.paymentStatus} pays=${p1003.length} status=${p1003[0].status} payments-total=${(await payments()).length} sebelum=${paysBefore3}`);
    const invB = await invRec('seed-inv-2');
    t.check('1003 Success: packageId undangan Kirana jadi basic', invB && invB.packageId === 'basic', 'packageId=' + (invB && invB.packageId));
    await t.goto('bayar/seed-order-3');
    const txtDone3 = await appText();
    t.check('1003 sesudah Success: kartu berhasil, tanpa tombol simulasi lagi', txtDone3.includes('Pembayaran Simulasi Berhasil') && (await payButtons()).length === 0, 'payButtons=' + JSON.stringify(await payButtons()));
    const paysBeforeRe = (await payments()).length;
    const toastRe = await firePayResult('seed-order-3', 'Success');
    await sleep(500);
    const o1003b = await orderByNum('KI-2026-1003');
    t.check('1003 Success diulang: idempoten, tanpa perubahan', toastRe.includes('idempoten') && o1003b.status === 'Diproses' && o1003b.paymentStatus === 'Success' && (await payments()).length === paysBeforeRe, `toast="${toastRe}" payments=${(await payments()).length} sebelum=${paysBeforeRe}`);
    // Gagal pada order baru LAUNCH20 (inv-5 masih draft)
    await t.goto('bayar/' + newId2);
    await t.click('button[data-s2="pay-result"][data-res="Failed"]');
    await sleep(700);
    const oN2f = (await orders()).find((o) => o.id === newId2);
    const pN2f = await paysOf(newId2);
    const inv5f = await invRec('seed-inv-5');
    t.check('order baru Failed: status order tetap Menunggu Pembayaran, 0 Success', oN2f.status === 'Menunggu Pembayaran' && oN2f.paymentStatus === 'Failed' && pN2f.every((p) => p.status !== 'Success'), `order=${oN2f.status}/${oN2f.paymentStatus} pays=${JSON.stringify(pN2f.map((p) => p.status))}`);
    t.check('gagal tidak menerbitkan undangan: inv-5 tetap draft + packageId null', inv5f && inv5f.status === 'draft' && (inv5f.packageId === null || inv5f.packageId === undefined), 'status=' + (inv5f && inv5f.status) + ' packageId=' + (inv5f && inv5f.packageId));
    const vaStruck = await t.eval(() => { const v = document.querySelector('.va'); return v ? (v.getAttribute('style') || '') : 'NO-VA'; });
    t.check('kode percobaan Failed dicoret (tidak aktif)', String(vaStruck).includes('line-through'), 'va-style=' + vaStruck);
    const codeBefore = pN2f[pN2f.length - 1].code;
    const paysBeforeExp = (await payments()).length;
    await t.click('button[data-s2="pay-result"][data-res="Expired"]');
    await sleep(700);
    const oN2e = (await orders()).find((o) => o.id === newId2);
    const pN2e = await paysOf(newId2);
    const inv5e = await invRec('seed-inv-5');
    t.check('order baru Expired (percobaan baru): status order tetap, record baru, kode baru', oN2e.status === 'Menunggu Pembayaran' && oN2e.paymentStatus === 'Expired' && pN2e.length === 2 && pN2e[1].status === 'Expired' && pN2e[1].code !== codeBefore && (await payments()).length === paysBeforeExp + 1, `order=${oN2e.status}/${oN2e.paymentStatus} pays=${JSON.stringify(pN2e.map((p) => p.status))} kodeBaru=${pN2e[1].code !== codeBefore}`);
    t.check('kedaluwarsa tidak menerbitkan undangan: inv-5 tetap draft', inv5e && inv5e.status === 'draft' && !inv5e.packageId, 'status=' + (inv5e && inv5e.status) + ' packageId=' + (inv5e && inv5e.packageId));
    await t.shot('2c-d-bayar-failed-expired');

    // ================= E. Admin: 1002/1004/1005 lintas-pemilik =================
    t.section('E admin inspeksi 1002/1004/1005');
    await t.goto('dashboard?tab=pesanan');
    await setRole('admin');
    await t.goto('admin?tab=pesanan');
    const a1002 = await cardText('KI-2026-1002');
    t.check('admin: 1002 (cust-2) Diproses/Success LAUNCH20 total 79200', a1002.includes('diproses') && a1002.includes('success') && a1002.includes('diskon launch20') && a1002.includes('rp19.800') && a1002.includes('total rp79.200'), a1002);
    const a1004 = await cardText('KI-2026-1004');
    t.check('admin: 1004 Dibatalkan/Failed tanpa tombol bayar', a1004.includes('dibatalkan') && a1004.includes('failed') && !a1004.includes('bayar sekarang') && !a1004.includes('coba bayar lagi'), a1004);
    t.check('admin: kartu 1004 TIDAK punya CTA (CTA hanya bila hold tier, js/12:212; href CTA dibuktikan di halaman bayar §F)', (await cardHref('KI-2026-1004')) === 'NO-LINK', await cardHref('KI-2026-1004'));
    const a1005 = await cardText('KI-2026-1005');
    t.check('admin: 1005 Menunggu Pembayaran/Expired Rp59.000', a1005.includes('menunggu pembayaran') && a1005.includes('expired') && a1005.includes('total rp59.000'), a1005);
    const href1005 = await cardHref('KI-2026-1005');
    t.check('OBSERVASI 1005: kartu Expired MASIH tawarkan Coba Bayar Lagi (bukan tanpa tombol)', href1005 === '#/bayar/seed-order-5', 'href=' + href1005 + ' | kartu=' + a1005);
    await t.goto('bayar/seed-order-5');
    const txt1005 = await appText();
    const btns1005 = await payButtons();
    // 1005 metodenya QRIS (seed-pay-5: methods[5%4]) -> halaman bayar render
    // .qr-fake, bukan .va (js/12:313); bukti nonaktif = pemberitahuan kode.
    const va1005 = await t.eval(() => { const v = document.querySelector('.va'); const q = document.querySelector('.qr-fake'); return v ? (v.getAttribute('style') || '') : (q ? 'QRIS-qr-fake' : 'NO-VA'); });
    t.check('1005 halaman bayar: kode percobaan lama dinyatakan tidak aktif + pesan Expired tampil', txt1005.includes('Kode percobaan ini sudah tidak aktif') && txt1005.includes('Expired'), 'va=' + va1005 + ' | teks-tidak-aktif=' + txt1005.includes('Kode percobaan ini sudah tidak aktif'));
    // v25 F1 — KRITERIA LAMA ("order Expired TIDAK bisa dibayar")
    // DICABUT: keputusan produk Lora — retry DIIZINKAN bila attempt
    // lama Expired dan order induk masih Menunggu Pembayaran. Halaman
    // bayar 1005 MENAWARKAN ketiga tombol simulasi; perilaku retry
    // (attempt baru + kode baru, attempt lama utuh) dibuktikan
    // handler-level di §F2.
    t.check('KRITERIA-v25-F1: order Expired BOLEH retry (3 tombol simulasi tampil)', JSON.stringify(btns1005) === JSON.stringify(['Success', 'Failed', 'Expired']), 'pay-result buttons=' + JSON.stringify(btns1005) + ' | kartu simulasi tampil=' + txt1005.includes('Simulasikan Hasil Pembayaran'));
    await t.shot('2c-e-bayar-1005-expired');

    // ================= F. 1004 terminal (admin + grant) =================
    t.section('F order batal 1004 terminal');
    await t.goto('bayar/seed-order-4');
    const txt1004 = await appText();
    const btns1004 = await payButtons();
    const va1004 = await t.eval(() => { const v = document.querySelector('.va'); return v ? ((v.getAttribute('style') || '') + '|' + (v.getAttribute('aria-label') || '')) : 'NO-VA'; });
    t.check('1004 halaman bayar: Pesanan Dibatalkan + status terminal + VA dinonaktifkan', txt1004.includes('Pesanan Dibatalkan') && txt1004.includes('status terminal') && txt1004.includes('Kode ini sudah dinonaktifkan') && String(va1004).includes('line-through'), 'va=' + va1004);
    t.check('1004 halaman bayar: tanpa tombol simulasi pembayaran', btns1004.length === 0, 'payButtons=' + JSON.stringify(btns1004));
    t.check('1004 halaman bayar: CTA Buat Pesanan Baru href seed-inv-4', (await t.eval(() => { const a = [...document.querySelectorAll('a')].find((x) => (x.textContent || '').includes('Buat Pesanan Baru')); return a ? a.getAttribute('href') : 'NO-CTA'; })) === '#/checkout?inv=seed-inv-4', await t.eval(() => { const a = [...document.querySelectorAll('a')].find((x) => (x.textContent || '').includes('Buat Pesanan Baru')); return a ? a.getAttribute('href') : 'NO-CTA'; }));
    await t.goto('admin?tab=ringkasan');
    await t.click('button[data-s2="admin-write-toggle"]');
    await sleep(500);
    await t.click('#s2-modal-ok');
    await sleep(600);
    const grantOn = await t.eval(() => window.__kiAdminWrite === true);
    t.check('grant tulis Admin aktif (untuk uji handler terminal)', grantOn === true, 'window.__kiAdminWrite=' + grantOn + ' toast=' + (await toast()));
    const paysBefore1004 = (await payments()).length;
    const toast1004 = await firePayResult('seed-order-4', 'Success');
    await sleep(500);
    const o1004 = await orderByNum('KI-2026-1004');
    t.check('pay-result Success pada 1004 DITOLAK handler: tetap Dibatalkan/Failed, 0 payment baru', toast1004.includes('sudah dibatalkan (status terminal)') && o1004.status === 'Dibatalkan' && o1004.paymentStatus === 'Failed' && (await payments()).length === paysBefore1004, `toast="${toast1004}" order=${o1004.status}/${o1004.paymentStatus} payments=${(await payments()).length} sebelum=${paysBefore1004}`);
    // v25 F1 — kontrol negatif: retry Expired pada order Dibatalkan juga ditolak.
    const paysBefore1004b = (await payments()).length;
    const toast1004b = await firePayResult('seed-order-4', 'Expired');
    await sleep(500);
    const o1004b = await orderByNum('KI-2026-1004');
    t.check('retry Expired pada 1004 DITOLAK handler: tetap Dibatalkan/Failed, 0 payment baru', toast1004b.includes('sudah dibatalkan (status terminal)') && o1004b.status === 'Dibatalkan' && o1004b.paymentStatus === 'Failed' && (await payments()).length === paysBefore1004b, `toast="${toast1004b}" order=${o1004b.status}/${o1004b.paymentStatus} payments=${(await payments()).length} sebelum=${paysBefore1004b}`);
    await t.shot('2c-f-bayar-1004-batal');

    // ================= F2. v25 F1: retry Expired 1005 diizinkan + gate Selesai =================
    t.section('F2 retry Expired 1005 diizinkan (admin+grant)');
    const grantStill = await t.eval(() => window.__kiAdminWrite === true);
    t.check('F2 prasyarat: grant tulis Admin masih aktif dari §F', grantStill === true, 'window.__kiAdminWrite=' + grantStill);
    const pays5Before = await paysOf('seed-order-5');
    const old5 = pays5Before[pays5Before.length - 1];
    const inv4Before = await invRec('seed-inv-4');
    const ordBeforeF2 = (await orders()).length;
    await t.goto('bayar/seed-order-5');
    t.check('F2 halaman bayar 1005: 3 tombol simulasi (retry ditawarkan)', JSON.stringify(await payButtons()) === JSON.stringify(['Success', 'Failed', 'Expired']), 'payButtons=' + JSON.stringify(await payButtons()));
    await t.click('button[data-s2="pay-result"][data-res="Expired"]');
    await sleep(700);
    const pays5e = await paysOf('seed-order-5');
    const o1005e = await orderByNum('KI-2026-1005');
    const inv4e = await invRec('seed-inv-4');
    const old5e = pays5e.find((p) => p.id === 'seed-pay-5');
    const new5e = pays5e[pays5e.length - 1];
    t.check('F2 retry Expired 1005 (klik nyata): attempt BARU + kode BARU, attempt lama utuh, order tetap Menunggu Pembayaran/Expired, undangan tidak berubah', pays5e.length === pays5Before.length + 1 && new5e.id !== 'seed-pay-5' && new5e.status === 'Expired' && new5e.code !== old5.code && new5e.code === 'QRIS-SIM-KI-2026-1005-A2' && old5e && old5e.status === 'Expired' && old5e.code === old5.code && o1005e.status === 'Menunggu Pembayaran' && o1005e.paymentStatus === 'Expired' && (await orders()).length === ordBeforeF2 && inv4e && inv4e.status === inv4Before.status && inv4e.packageId === inv4Before.packageId && inv4e.publishedAt === inv4Before.publishedAt, `pays=${pays5e.length} (sebelum ${pays5Before.length}) baru=${new5e.id}/${new5e.code}/${new5e.status} lama=${old5e.id}/${old5e.code}/${old5e.status} order=${o1005e.status}/${o1005e.paymentStatus} inv4=${inv4e.status}/${inv4e.packageId}`);
    await t.click('button[data-s2="pay-result"][data-res="Failed"]');
    await sleep(700);
    const pays5f = await paysOf('seed-order-5');
    const o1005f = await orderByNum('KI-2026-1005');
    const inv4f = await invRec('seed-inv-4');
    t.check('F2 retry Expired 1005 berakhir Failed: attempt ke-3 Failed, order tetap Menunggu Pembayaran/Failed, undangan tetap tidak berubah', pays5f.length === pays5e.length + 1 && pays5f[pays5f.length - 1].status === 'Failed' && o1005f.status === 'Menunggu Pembayaran' && o1005f.paymentStatus === 'Failed' && inv4f.packageId === inv4Before.packageId && inv4f.status === inv4Before.status, `pays=${pays5f.length} terakhir=${pays5f[pays5f.length - 1].status} order=${o1005f.status}/${o1005f.paymentStatus} inv4pkg=${inv4f.packageId}`);
    await t.click('button[data-s2="pay-result"][data-res="Success"]');
    await sleep(700);
    const pays5s = await paysOf('seed-order-5');
    const o1005s = await orderByNum('KI-2026-1005');
    const inv4s = await invRec('seed-inv-4');
    t.check('F2 retry 1005 lalu Berhasil: attempt ke-4 Success, order Diproses, paket Premium aktif pada undangan Salsa (tanpa order duplikat)', pays5s.length === pays5f.length + 1 && pays5s[pays5s.length - 1].status === 'Success' && o1005s.status === 'Diproses' && o1005s.paymentStatus === 'Success' && inv4s.packageId === 'premium' && (await orders()).length === ordBeforeF2, `pays=${pays5s.length} terakhir=${pays5s[pays5s.length - 1].status} order=${o1005s.status}/${o1005s.paymentStatus} inv4pkg=${inv4s.packageId} orders=${(await orders()).length}`);
    // Kontrol negatif Selesai: 1001 & 1006 (Success-terminal) + halaman bayar tanpa tombol.
    const paysBeforeS = (await payments()).length;
    const toast1001 = await firePayResult('seed-order-1', 'Failed');
    await sleep(500);
    const o1001f = await orderByNum('KI-2026-1001');
    t.check('F2 retry pada 1001 Selesai DITOLAK handler: tetap Selesai/Success, 0 payment baru', o1001f.status === 'Selesai' && o1001f.paymentStatus === 'Success' && (await payments()).length === paysBeforeS, `toast="${toast1001}" order=${o1001f.status}/${o1001f.paymentStatus} payments=${(await payments()).length} sebelum=${paysBeforeS}`);
    const toast1006 = await firePayResult('seed-order-6', 'Expired');
    await sleep(500);
    const o1006f = await orderByNum('KI-2026-1006');
    t.check('F2 retry pada 1006 Selesai DITOLAK handler: tetap Selesai/Success, 0 payment baru', o1006f.status === 'Selesai' && o1006f.paymentStatus === 'Success' && (await payments()).length === paysBeforeS, `toast="${toast1006}" order=${o1006f.status}/${o1006f.paymentStatus} payments=${(await payments()).length} sebelum=${paysBeforeS}`);
    await t.goto('bayar/seed-order-1');
    t.check('F2 halaman bayar 1001 Selesai: kartu berhasil, tanpa tombol simulasi', (await appText()).includes('Pembayaran Simulasi Berhasil') && (await payButtons()).length === 0, 'payButtons=' + JSON.stringify(await payButtons()));
    await t.goto('bayar/seed-order-6');
    t.check('F2 halaman bayar 1006 Selesai: kartu berhasil, tanpa tombol simulasi', (await appText()).includes('Pembayaran Simulasi Berhasil') && (await payButtons()).length === 0, 'payButtons=' + JSON.stringify(await payButtons()));
    await t.shot('2c-f2-retry-1005');

    // ================= G. Salsa CTA sebagai Nadia (non-pemilik) =================
    t.section('G CTA Salsa sebagai Nadia');
    await t.goto('admin?tab=ringkasan');
    await setRole('customer');
    const ordBeforeG = (await orders()).length;
    await t.goto('checkout?inv=seed-inv-4');
    const txtG = await appText();
    t.check('Nadia klik/jalur CTA Salsa: checkout fail-closed Undangan tidak ditemukan — DITAHAN', txtG.includes('Checkout Ditahan — Undangan Tidak Ditemukan') && txtG.includes('checkout DITAHAN') && (await confirmBtn()).disabled === true, 'confirm-disabled=' + (await confirmBtn()).disabled);
    t.check('Nadia jalur CTA Salsa: 0 order dibuat', (await orders()).length === ordBeforeG, `orders=${(await orders()).length} sebelum=${ordBeforeG}`);
    // Jalur pemilik Salsa BELUM dites live (CURRENT_USER hard-coded cust-1,
    // tanpa pengalih pengguna — diputuskan tidak dibangun). Bukti pemilik
    // hanya fixture H20 end-to-end di jsdom (js/09-s2-fixtures.js:1522-1560).
    t.check('CELAH-DIDOKUMENTASIKAN: jalur pemilik Salsa belum dites live (lihat laporan)', true, 'CURRENT_USER hard-coded cust-1; bukti pemilik hanya fixture H20 jsdom; bukan PASS live');

    // ================= H. Snapshot vs perubahan harga paket =================
    t.section('H snapshot harga vs perubahan harga paket');
    await t.goto('dashboard?tab=pesanan');
    await setRole('admin');
    await t.goto('admin?tab=paket');
    await t.fill('.s2-pkg-form[data-id="basic"] input[name="price"]', '35000');
    await t.click('.s2-pkg-form[data-id="basic"] button[type="submit"]');
    await sleep(600);
    const toastPkg = await toast();
    const pkgOv = await t.eval(() => JSON.parse(localStorage.getItem('vowora:v1:packages') || '{}'));
    t.check('harga Basic diubah admin 29000 -> 35000 (override tersimpan)', toastPkg.includes('Paket Basic diperbarui') && pkgOv.basic && pkgOv.basic.price === 35000, `toast="${toastPkg}" override=${JSON.stringify(pkgOv.basic)}`);
    await t.goto('dashboard?tab=pesanan');
    await setRole('customer');
    await t.goto('dashboard?tab=pesanan');
    const c1003b = await cardText('KI-2026-1003');
    t.check('snapshot 1003 TETAP Rp29.000 walau harga paket kini Rp35.000', c1003b.includes('subtotal rp29.000') && c1003b.includes('total rp29.000'), c1003b);
    const cNew1 = await cardText(oNew1.number);
    t.check('snapshot order HEMAT10 TETAP: subtotal Rp29.000 total Rp26.100', cNew1.includes('subtotal rp29.000') && cNew1.includes('total rp26.100'), cNew1);
    await t.goto('checkout?inv=seed-inv-2');
    const cbNew = await confirmBtn();
    t.check('harga BARU berlaku untuk pesanan baru: checkout inv-2 kini Rp35.000', !!cbNew && cbNew.text.includes('Rp35.000'), JSON.stringify(cbNew));
    // Kembalikan harga Basic ke 29000 agar clone kembali ke baseline.
    await t.goto('dashboard?tab=pesanan');
    await setRole('admin');
    await t.goto('admin?tab=paket');
    await t.fill('.s2-pkg-form[data-id="basic"] input[name="price"]', '29000');
    await t.click('.s2-pkg-form[data-id="basic"] button[type="submit"]');
    await sleep(600);
    const pkgOvBack = await t.eval(() => JSON.parse(localStorage.getItem('vowora:v1:packages') || '{}'));
    t.check('harga Basic dikembalikan ke Rp29.000', pkgOvBack.basic && pkgOvBack.basic.price === 29000, 'override=' + JSON.stringify(pkgOvBack.basic));
    const fin = await t.storageCounts();
    // v25 F1: payments 11 -> 14 = +3 percobaan retry 1005 di §F2 (Expired,
    // Failed, Success); orders tetap 10 (retry tidak membuat order baru).
    t.check('akhir: orders=10 payments=14 (8 seed + 2 order baru + 1 percobaan Expired baru §D + 3 percobaan retry 1005 §F2)', fin.orders === 10 && fin.payments === 14, `orders=${fin.orders} payments=${fin.payments}`);
    await t.shot('2c-h-snapshot');
  },
};
