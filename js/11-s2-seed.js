    /* ---------- Seed demo Stage 2 (sekali, tidak menimpa data Stage 1 yang valid) ---------- */
    function seedInvitation(id, tplId, ownerId, status, slug, tweak){
      if (S.invitations.some(i => i.id === id)) return S.invitations.find(i => i.id === id);
      const t = TEMPLATES.find(x => x.id === tplId);
      const content = structuredClone(demoFor(t.categoryId));
      if (tweak) tweak(content);
      const inv = { id, templateId:t.id, templateVersion:t.version, slug: slug || null, title: defaultTitle(t, content), categoryId:t.categoryId, status, ownerId, archived:false, packageId:null, content, design:{paletteId:t.palettes[0].id, fontId:t.fontId, ornament:t.ornament}, sections:Object.fromEntries(t.sections.map(s => [s, true])), createdAt:Date.now() - 864e5 * 12, updatedAt:Date.now() - 864e5 * 2, publishedAt: status === 'published' ? Date.now() - 864e5 * 10 : null };
      S.invitations.unshift(inv); persistInvitationNow(inv);
      return inv;
    }
    function seedStage2(){
      if (load2(K2.seeded, false)) return;
      S2.users = [
        {id:'cust-1', name:'Nadia Prameswari', email:'nadia@contoh.id', role:'customer', joined:Date.now() - 864e5 * 40},
        {id:'cust-2', name:'Bimo Aditama', email:'bimo@contoh.id', role:'customer', joined:Date.now() - 864e5 * 33},
        {id:'cust-3', name:'Salsabila Zahra', email:'salsa@contoh.id', role:'customer', joined:Date.now() - 864e5 * 21},
        {id:'admin-1', name:'Admin Kita Invite', email:'admin@contoh.id', role:'admin', joined:Date.now() - 864e5 * 90},
        {id:'des-1', name:'Rani Kirana', email:'rani@contoh.id', role:'designer', joined:Date.now() - 864e5 * 60},
        {id:'des-2', name:'Dewa Prasetyo', email:'dewa@contoh.id', role:'designer', joined:Date.now() - 864e5 * 55}
      ]; saveColl('users');
      const invA = seedInvitation('seed-inv-1', 'luxury-ivory', 'cust-1', 'published', 'nadia-dan-reza', c => { c.subjects[0].nick = 'Nadia'; c.subjects[0].name = 'Nadia Prameswari, S.E.'; c.subjects[0].detail = ''; c.subjects[1].nick = 'Reza'; c.subjects[1].name = 'Reza Mahendra, S.T.'; c.subjects[1].detail = ''; c.events.forEach(e => { e.date = '2027-02-14'; }); c.story = NADIA_STORY; /* Amplop digital Nadia & Reza: belum ada data rekening milik undangan ini di seed, jadi dikosongkan. Jangan tampilkan rekening undangan lain (demo Luxury Ivory memakai data Aurelia). */ c.gift = {bank:'', number:'', holder:'', address:''}; });
      const invB = seedInvitation('seed-inv-2', 'confetti-pop', 'cust-1', 'draft', null, null);
      const invC = seedInvitation('seed-inv-3', 'summit-prime', 'cust-2', 'published', 'nusantara-tech-summit', null);
      const invD = seedInvitation('seed-inv-4', 'champagne-vow', 'cust-3', 'published', 'salsa-dan-fikri', c => { c.events[0].date = '2026-01-17'; c.subjects[0].nick = 'Salsa'; c.subjects[0].name = 'Salsabila Zahra'; c.subjects[0].detail = ''; c.subjects[1].nick = 'Fikri'; c.subjects[1].name = 'Fikri Ramadhan'; c.subjects[1].detail = ''; c.story = SALSA_STORY; c.gift = {bank:'', number:'', holder:'', address:''}; });
      seedInvitation('seed-inv-5', 'noir-elan', 'cust-1', 'draft', null, null);
      invA.title = 'Nadia & Reza'; persistInvitationNow(invA);
      const G = [
        ['Keluarga Wijaya','Keluarga','0812 3400 1101','Hadir',2,'Selamat Nadia & Reza! Semoga sakinah mawaddah warahmah.'],
        ['Rani Amelia','Teman','0813 2210 8845','Hadir',1,'Akhirnya! Turut berbahagia, sampai jumpa di hari H.'],
        ['Dimas Prasetyo','Teman','0821 7788 9012','Hadir',2,''],
        ['Bu Tuti Hartini','Keluarga','0857 1122 3344','Hadir',3,'Barakallahu lakuma wa baraka alaikuma.'],
        ['Andi Kurniawan','Rekan Kerja','0819 6655 2210','Masih Ragu',1,'Semoga lancar sampai hari H, masih menunggu jadwal kantor.'],
        ['Sinta Maharani','Teman','0822 9087 6654','Tidak Hadir',0,'Mohon maaf berhalangan, doa terbaik untuk kalian berdua.'],
        ['Keluarga Besar Santoso','Keluarga','0815 4433 2211','Hadir',4,'Kami sekeluarga hadir, insya Allah.'],
        ['Fajar Ramadhan','Rekan Kerja','0812 9900 7765','Belum Menjawab',0,''],
        ['Dewi Lestari','VIP','0856 7788 1122','Hadir',2,'Suatu kehormatan bisa hadir. Selamat untuk kedua mempelai!'],
        ['Rizky Fauzan','Teman','0838 2211 9900','Belum Menjawab',0,''],
        ['Maya Kusuma','Rekan Kerja','0817 3344 5566','Hadir',1,'Selamat! Kantor kami ramai membicarakan hari bahagia ini.'],
        ['Pak Haji Mahmud','Keluarga','0813 6655 4433','Hadir',2,'Semoga menjadi keluarga yang diberkahi.'],
        ['Intan Permata','VIP','0821 1100 9988','Masih Ragu',2,''],
        ['Bagus Setiawan','Teman','0859 4433 2211','Hadir',1,'']
      ];
      S2.guests = G.map((g, i) => ({id:'seed-guest-' + (i + 1), invitationId: invA.id, name:g[0], group:g[1], contact:g[2], rsvpStatus:g[3], attendees:g[4], code:'T' + (1001 + i), createdAt:Date.now() - 864e5 * 6}));
      const B = [
        ['Kirana Ayu Lestari','Keluarga','0812 1000 2001','Hadir',3,'Selamat ulang tahun Kirana!'],
        ['Teman Sekelas Kirana','Teman','0813 1000 2002','Hadir',2,''],
        ['Keluarga Hartono','Keluarga','0815 1000 2003','Belum Menjawab',0,''],
        ['Bu Guru Tania','VIP','0817 1000 2004','Hadir',1,'Sampai jumpa di pesta, Kirana sayang.'],
        ['Keluarga Nugraha','Keluarga','0819 1000 2005','Masih Ragu',2,''],
        ['Om Beni & Tante Rika','Keluarga','0821 1000 2006','Hadir',2,''],
        ['Tetangga Komplek Melati','Lainnya','0822 1000 2007','Belum Menjawab',0,''],
        ['Keluarga Pradana','Keluarga','0823 1000 2008','Tidak Hadir',0,'Maaf, kami sedang di luar kota.']
      ];
      B.forEach((g, i) => S2.guests.push({id:'seed-guest-b' + (i + 1), invitationId: invB.id, name:g[0], group:g[1], contact:g[2], rsvpStatus:g[3], attendees:g[4], code:'U' + (2001 + i), createdAt:Date.now() - 864e5 * 3}));
      saveColl('guests');
      S2.rsvps = [];
      S2.guests.filter(g => g.rsvpStatus !== 'Belum Menjawab').forEach((g, i) => {
        const src = G.concat(B).find(x => x[0] === g.name);
        S2.rsvps.push({id:'seed-rsvp-' + (i + 1), guestId:g.id, invitationId:g.invitationId, name:g.name, status:g.rsvpStatus, count:g.attendees, message:(src && src[5]) || '', at:Date.now() - 864e5 * (5 - (i % 5)), moderation: (src && src[5]) ? (i === 6 ? 'hidden' : 'approved') : 'approved'});
      });
      saveColl('rsvps');
      const mkOrder = (n, inv, cust, pkgId, status, payStatus, daysAgo, coupon) => {
        const p = pkgById(pkgId); const disc = coupon ? Math.round(p.price * coupon.pct / 100) : 0;
        const o = {id:'seed-order-' + n, number:'KI-2026-' + String(1000 + n), invitationId:inv.id, customerId:cust, packageId:p.id, packageName:p.name, price:p.price, discount:disc, couponCode:coupon ? coupon.code : null, total:p.price - disc, status, paymentStatus:payStatus, createdAt:Date.now() - 864e5 * daysAgo};
        S2.payments.push({id:'seed-pay-' + n, orderId:o.id, invitationId:o.invitationId, method:['Virtual Account','QRIS','E-Wallet','Bank Transfer'][n % 4], status:payStatus, amount:o.total, code:'8808 ' + (4100 + n * 37) + ' ' + (9200 + n * 11), createdAt:o.createdAt, paidAt: payStatus === 'Success' ? o.createdAt + 36e5 : null});
        return o;
      };
      S2.orders = [
        mkOrder(1, invA, 'cust-1', 'premium', 'Selesai', 'Success', 9, null),
        mkOrder(2, invC, 'cust-2', 'signature', 'Diproses', 'Success', 4, {code:'LAUNCH20', pct:20}),
        mkOrder(3, invB, 'cust-1', 'basic', 'Menunggu Pembayaran', 'Pending', 1, null),
        mkOrder(4, invD, 'cust-3', 'premium', 'Dibatalkan', 'Failed', 15, null),
        mkOrder(5, invD, 'cust-3', 'premium', 'Menunggu Pembayaran', 'Expired', 12, null),
        mkOrder(6, invC, 'cust-2', 'exclusive', 'Selesai', 'Success', 20, null),
        mkOrder(7, invA, 'cust-1', 'signature', 'Diproses', 'Success', 2, {code:'HEMAT10', pct:10}),
        mkOrder(8, invB, 'cust-1', 'premium', 'Menunggu Pembayaran', 'Pending', 0, null)
      ];
      saveColl('orders'); saveColl('payments');
      invA.packageId = 'premium'; persistInvitationNow(invA);
      S2.coupons = [
        {id:'cpn-1', code:'HEMAT10', pct:10, active:true, note:'Diskon pembuka 10%'},
        {id:'cpn-2', code:'LAUNCH20', pct:20, active:true, note:'Promo peluncuran 20%'},
        {id:'cpn-3', code:'TEMAN15', pct:15, active:false, note:'Kampanye referral (nonaktif)'}
      ]; saveColl('coupons');
      const svc = (n, cust, title, cat, status, designer, daysAgo, revs) => ({id:'seed-svc-' + n, number:'REQ-2026-' + String(200 + n), customerId:cust, title, category:cat, eventName:title, eventDate:'2027-02-14', style:'Luxury Editorial', features:['Countdown','Galeri','Amplop Digital'], reference:'reception', notes:'Mohon nuansa ivory & emas, foto utama tangga bunga.', status, designerId:designer, revisions:revs, internalNotes:[], createdAt:Date.now() - 864e5 * daysAgo, updatedAt:Date.now() - 864e5 * Math.max(0, daysAgo - 1)});
      S2.services = [
        svc(1, 'cust-1', 'Pernikahan Nadia & Reza — Desain Kustom', 'Pernikahan', 'Review', 'des-1', 8, [{note:'Tolong sampul lebih terang dan ornamen diperkecil.', at:Date.now() - 864e5 * 2, by:'customer'}]),
        svc(2, 'cust-2', 'Summit Nusantara Tech 2027', 'Korporat & Bisnis', 'In Progress', 'des-2', 6, []),
        svc(3, 'cust-3', 'Lamaran Salsa & Fikri', 'Lamaran', 'New', null, 3, []),
        svc(4, 'cust-1', 'Aqiqah Arkan — Konsep Sage', 'Aqiqah', 'New', null, 1, [])
      ];
      /* Tautan proyek ↔ undangan/pesanan: status layanan dan publikasi
         undangan adalah dua hal berbeda yang terhubung, bukan disamakan. */
      S2.services[0].invitationId = invA.id; S2.services[0].orderId = 'seed-order-1';
      S2.services[2].invitationId = invD.id; S2.services[2].orderId = null;
      saveColl('services');
      S2.notifications = [
        {id:'seed-ntf-1', title:'RSVP baru masuk', body:'Keluarga Wijaya mengonfirmasi hadir (2 orang) untuk Nadia & Reza.', scope:'customer', owner:'cust-1', at:Date.now() - 36e5 * 5, read:false},
        {id:'seed-ntf-2', title:'Pembayaran simulasi berhasil', body:'Pesanan KI-2026-1007 (Signature) berstatus Success.', scope:'customer', owner:'cust-1', at:Date.now() - 864e5, read:false},
        {id:'seed-ntf-3', title:'Permintaan desain baru', body:'REQ-2026-204 menunggu penugasan desainer.', scope:'admin', owner:null, at:Date.now() - 864e5, read:false},
        {id:'seed-ntf-4', title:'Desain menunggu ulasan Anda', body:'Proyek Pernikahan Nadia & Reza masuk tahap Review.', scope:'customer', owner:'cust-1', at:Date.now() - 864e5 * 2, read:true}
      ]; saveColl('notifications');
      S2.activity = [
        {id:'seed-act-2', text:'RSVP baru dari Keluarga Wijaya untuk Nadia & Reza.', scope:'customer', owner:'cust-1', at:Date.now() - 36e5 * 5},
        {id:'seed-act-1', text:'Pembayaran simulasi KI-2026-1007 berhasil (Signature).', scope:'customer', owner:'cust-1', at:Date.now() - 864e5},
        {id:'seed-act-4', text:'Permintaan desain REQ-2026-204 dibuat.', scope:'customer', owner:'cust-1', at:Date.now() - 864e5},
        {id:'seed-act-3', text:'Undangan Nadia & Reza diterbitkan.', scope:'customer', owner:'cust-1', at:Date.now() - 864e5 * 10}
      ]; saveColl('activity');
      save2(K2.seeded, true);
    }
    seedStage2();

    /* Pemilik untuk event seed lama: record aktivitas/notifikasi seed yang
       tersimpan dari build sebelumnya belum punya field owner. Semuanya
       adalah event milik Nadia (cust-1) — beri owner yang benar agar tetap
       tampil di dashboard pemiliknya dan tidak bocor ke pelanggan lain.
       Idempoten: hanya mengisi owner yang masih kosong pada ID seed. */
    (function assignSeedOwners(){
      let ac = false, nc = false;
      S2.activity.forEach(a => { if (!a.owner && /^seed-act-/.test(a.id || '')){ a.owner = 'cust-1'; ac = true; } });
      S2.notifications.forEach(n => { if (!n.owner && /^seed-ntf-/.test(n.id || '') && n.scope === 'customer'){ n.owner = 'cust-1'; nc = true; } });
      if (ac) saveColl('activity');
      if (nc) saveColl('notifications');
    })();

    /* Migrasi record pembayaran lama (idempoten): record pembayaran yang
       belum punya invitationId diisi SATU KALI dari pesanan induknya —
       penautan deterministik di lapisan data, BUKAN fallback di gerbang.
       Sesudah migrasi ini, payment gate menilai semua record secara
       ketat: tanpa invitationId yang cocok dengan order + undangan yang
       sama, record tidak pernah dihitung sebagai pembayaran sah. */
    (function backfillPaymentInv(){
      let changed = false;
      S2.payments.forEach(p => {
        if (p.invitationId) return;
        const o = S2.orders.find(x => x.id === p.orderId);
        if (o && o.invitationId){ p.invitationId = o.invitationId; changed = true; }
      });
      if (changed) saveColl('payments');
    })();

    /* Rekonsiliasi undangan terbit tanpa packageId (idempoten): packageId
       diisi HANYA dari bukti order tertaut yang terbukti tunggal
       (kiResolvePackageId); selain itu record ditandai packageUnresolved
       agar UI menyatakan masa akses BELUM terhitung — bukan diam-diam
       dianggap aktif tanpa dasar. Seed Nadia–Reza tidak disentuh:
       packageId-nya sudah terisi dari seed. */
    (function reconcilePublishedPackages(){
      S.invitations.forEach(inv => {
        if (inv.status !== 'published') return;
        if (inv.packageId){ if (inv.packageUnresolved){ inv.packageUnresolved = false; persistInvitationNow(inv); } return; }
        const pid = kiResolvePackageId(inv.id, S2.orders, S2.payments, inv);
        if (pid){ inv.packageId = pid; inv.packageUnresolved = false; persistInvitationNow(inv); }
        else if (!inv.packageUnresolved){ inv.packageUnresolved = true; persistInvitationNow(inv); }
      });
    })();

    /* Perbaikan record lama (jaring pengaman kedua setelah seed; migrasi utama
       repairSeedDemoLeak sudah jalan sebelum render pertama): seed-inv-1
       (Nadia & Reza) dan seed-inv-4 (Salsa & Fikri) yang terlanjur tersimpan
       dengan sisa konten demo. Guard ID seed + nama panggilan subjek +
       signature nilai demo yang spesifik; undangan buatan pengguna dan nilai
       yang tidak cocok signature tidak disentuh. Idempoten. */
    (function repairSeedNadia(){ repairSeedDemoLeak('seed-inv-1', 'Nadia', 'Reza', NADIA_STORY); })();
    (function repairSeedSalsa(){ repairSeedDemoLeak('seed-inv-4', 'Salsa', 'Fikri', SALSA_STORY); })();
    /* Jaring pengaman tabrakan slug: record lama pemegang slug salsa-dan-fikri
       yang subjeknya masih demo lamaran (Nadia/Raka) diubah menjadi Salsa &
       Fikri oleh repairSalsaSlugCollision (definisi & guard ketat di Stage 1,
       sudah jalan sebelum render pertama; pemanggilan ini idempoten). */
    (function repairSalsaSlug(){ repairSalsaSlugCollision(); })();
    /* Penyelaras Guest–RSVP (idempoten): setiap tamu yang statusnya sudah
       menjawab WAJIB punya tepat satu record RSVP. Seed lama hanya membuat
       14 record untuk 18 tamu yang menjawab — record yang hilang dibuat di
       sini (pesan seed yang dikenal dipulihkan dari peta di bawah), tanpa
       pernah mengubah/menghapus record yang sudah ada. */
    (function alignGuestRsvp(){
      const SEED_MSG = {'seed-guest-b4':'Sampai jumpa di pesta, Kirana sayang.', 'seed-guest-b8':'Maaf, kami sedang di luar kota.'};
      let changed = false;
      S2.guests.forEach(g => {
        if (g.rsvpStatus === 'Belum Menjawab') return;
        if (S2.rsvps.some(r => r.guestId === g.id)) return;
        S2.rsvps.push({id:'rsvp-align-' + g.id, guestId:g.id, invitationId:g.invitationId, name:g.name, status:g.rsvpStatus, count:g.attendees, message:SEED_MSG[g.id] || '', at:(g.createdAt || Date.now()) + 864e5, moderation:'approved'});
        changed = true;
      });
      if (changed) saveColl('rsvps');
    })();
    /* Koreksi tanggal Nadia & Reza atas arahan pemilik (14 Feb 2027 yang
       benar). Guard ketat: hanya record seed-inv-1 berpasangan Nadia/Reza
       yang SELURUH tanggal acaranya masih tanggal seed lama 2026-12-12;
       tanggal lain dianggap edit pengguna dan tidak disentuh. */
    (function fixNadiaEventDate(){
      const inv = S.invitations.find(i => i.id === 'seed-inv-1');
      if (!inv || !inv.content || !Array.isArray(inv.content.events) || !inv.content.events.length) return;
      const subs = inv.content.subjects || [];
      if (!(subs[0] && subs[0].nick === 'Nadia' && subs[1] && subs[1].nick === 'Reza')) return;
      if (!inv.content.events.every(e => e.date === '2026-12-12')) return;
      inv.content.events.forEach(e => { e.date = '2027-02-14'; });
      persistInvitationNow(inv);
    })();
    /* Tautan layanan untuk profil lama: isi invitationId/orderId yang belum
       ada pada proyek seed yang dikenal; field yang sudah terisi tidak diubah. */
    (function alignServiceLinks(){
      let changed = false;
      S2.services.forEach(s => {
        if (s.invitationId) return;
        if (s.id === 'seed-svc-1'){ s.invitationId = 'seed-inv-1'; const o = S2.orders.find(x => x.invitationId === 'seed-inv-1' && linkedSuccessPayment(x, 'seed-inv-1')); s.orderId = o ? o.id : null; changed = true; }
        else if (s.id === 'seed-svc-2'){ s.invitationId = 'seed-inv-3'; const o = S2.orders.find(x => x.invitationId === 'seed-inv-3' && linkedSuccessPayment(x, 'seed-inv-3')); s.orderId = o ? o.id : null; changed = true; }
        else if (s.id === 'seed-svc-3'){ s.invitationId = 'seed-inv-4'; s.orderId = s.orderId || null; changed = true; }
      });
      if (changed) saveColl('services');
    })();
    /* Penyelaras alur layanan (idempoten): proyek yang pesanannya terbukti
       lunas tetapi masih "New" berarti pembayarannya sudah lunas
       — majukan ke "Paid" agar alur New → Paid → Assigned tidak pernah
       melompat. BUKTI (v18): bukan paymentStatus pesanan saja, melainkan
       bukti ketat kiServicePaidProof — record pembayaran Success yang
       tertaut ke order DAN undangan yang sama dengan proyek ini, sama
       seperti jalur penugasan. Proyek tanpa pesanan terkait tidak
       diwajibkan melewati Paid. */
    (function alignServicePaid(){
      let changed = false;
      S2.services.forEach(s => {
        if (s.status !== 'New' || !s.orderId) return;
        if (kiServicePaidProof(s, S2.orders, S2.payments)){ s.status = 'Paid'; changed = true; }
      });
      if (changed) saveColl('services');
    })();
    /* Penegak alur New → Paid → Assigned untuk record lama (idempoten),
       keputusannya lewat kiSvcGateDecision yang sama dengan uji fixture:
       proyek warisan berstatus Assigned TANPA pembayaran Success yang
       terhubung (termasuk seed lama REQ-2026-203 yang Assigned tanpa
       orderId) melompat melewati Paid — kembalikan ke New dan lepas
       desainernya. Status BERJALAN/TERMINAL tidak pernah diturunkan
       diam-diam saat reload (v17): proyek yang sudah mulai kerja tidak
       kehilangan tahapnya hanya karena dimuat ulang. Penugasan baru
       hanya bisa terjadi lewat gerbang di handler penugasan setelah
       pembayaran Success terverifikasi. */
    (function enforceServicePaidGate(){
      let changed = false;
      S2.services.forEach(s => {
        const d = kiSvcGateDecision(s, S2.orders, S2.payments);
        if (d.action !== 'downgrade') return;
        s.status = d.toStatus;
        if (d.releaseDesigner) s.designerId = null;
        s.updatedAt = Date.now(); changed = true;
      });
      if (changed) saveColl('services');
    })();
    /* Aktivitas selalu ditampilkan terbaru dulu berdasarkan timestamp asli;
       tulis balik hanya bila urutannya benar-benar berubah. */
    const _actOrder = S2.activity.map(a => a.id).join(',');
    S2.activity.sort((a, b) => (b.at || 0) - (a.at || 0));
    if (S2.activity.map(a => a.id).join(',') !== _actOrder) saveColl('activity');
    /* Migrasi tampilan rebrand untuk data lama: nama/email bawaan lama diganti
       ke brand baru; ID, peran, dan relasi record tidak berubah. */
    (function migrateBrandDisplay(){
      let uc = false;
      S2.users.forEach(u => {
        if (u.name === 'Admin VOWORA'){ u.name = 'Admin Kita Invite'; uc = true; }
        if (typeof u.email === 'string' && u.email.slice(-10) === '@vowora.id'){ u.email = u.email.slice(0, -10) + '@contoh.id'; uc = true; }
      });
      if (uc) saveColl('users');
      let sc = false;
      if (S2.settings.storeName === 'VOWORA'){ S2.settings.storeName = 'Kita Invite'; sc = true; }
      if (S2.settings.supportEmail === 'halo@vowora.id'){ S2.settings.supportEmail = ''; sc = true; }
      if (sc) save2(K2.settings, S2.settings);
    })();
