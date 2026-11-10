    /* Uji fixture TERISOLASI & DISPOSABLE: stub storage di memori dan
       data sintetis dengan mode gagal yang disuntikkan — tidak pernah
       menulis localStorage/data nyata (data nyata hanya dibaca untuk
       pemindaian yatim terakhir). Kelompok uji: (1) reset fail-closed,
       (2) predikat HANDLER tulis dipanggil langsung, (3) payment gate,
       (4) dedupe impor ID stabil, (5) orphan-reference, (6) publish-save
       failure, (7) owner mismatch route bayar/faktur + Builder,
       (8) identitas stabil RSVP tanpa kode, (9) transisi layanan,
       (10) konsistensi seed + aturan multi-order se-paket,
       (11) siklus hidup grant Admin (tanpa/dengan izin, tersimpan
       setelah baca-ulang, pencabutan saat persona/peran berubah),
       (12) autosave tertunda vs pencabutan grant/perubahan peran
       (gerbang penembakan kiFireAutosave yang sama dengan timer nyata),
       (13) RSVP: dedupe & rollback yang mencakup NAMA,
       (14) rollback pembayaran: hasil pemulihan packageId diperiksa,
       kegagalan simpan vs kegagalan rollback terpisah,
       (15) state machine unassign + konsistensi status setelah reload,
       (16) badge paket Admin: packageId kosong/tidak dikenal =
       belum terselesaikan; tanggal berakhir hanya bila terbukti,
       (17) kunci paket checkout ke tier template + inti pembatalan
       snapshot-first (simpan gagal & rollback gagal terpisah),
       (18) bukti rekonsiliasi layanan ketat di semua jalur
       (kiServicePaidProof), (19) semantik nama RSVP: snapshot saat
       submit, dedupe per guestId — bukan nama, (20) blocker v19:
       gerbang tier order lama (kiOrderTierGate), tier dari VERSI
       template (kiInvTemplate), bukti Paid tanpa fallback
       invitationId, expiry clamp WIB (kiAddMonthsClampWIB), identitas
       RSVP per orang, kode pembayaran stabil (kiActivePayment) —
       kasus grup 20 membawa expected vs actual. Kasus terakhir suite
       memverifikasi snapshot SELURUH key storage tidak berubah.
       ISOLASI PENUH (v18): sebelum suite berjalan, seluruh state sesi
       yang dapat disentuh suite di-snapshot (peran, desainer aktif,
       flag grant, GENERASI grant, referensi semua koleksi, daftar ID
       undangan); sesudah suite, semuanya dipulihkan persis dan kasus
       isolasi terakhir MEMVERIFIKASI pemulihan itu. Suite tidak
       menjadwalkan timer nyata (autosave diuji lewat kiFireAutosave
       langsung), tidak menulis localStorage nyata (semua penulisan
       lewat stub/saveFn suntikan), dan kegagalan di tengah satu grup
       tidak membocorkan koleksi fixture ke sesi — pemulihan akhir
       menimpa referensi koleksi apa pun yang tertukar. */
    function kiFixtureTests(){
      const mk = fail => { const m = new Map([['vowora:v1:guests','["g1"]'],['vowora:v1:orders','["o1"]'],[K2.backup,'{"lama":true}'],[K2.quarantine,'[]']]);
        const reads = {};
        return { get length(){ return m.size; }, key:i => [...m.keys()][i] ?? null,
          getItem:k => { if (fail === 'read') throw new Error('read-fail'); if (fail === 'corrupt' && k === KI_TMP_BK) return '{"rusak":1}'; if (fail === 'mutate' && k === 'vowora:v1:guests'){ reads[k] = (reads[k] || 0) + 1; if (reads[k] > 1) return '["diubah-tab-lain"]'; } return m.has(k) ? m.get(k) : null; },
          setItem:(k, v) => { if (fail === 'write' && k === KI_TMP_BK) throw new Error('quota'); if (fail === 'restore-fail' && k === 'vowora:v1:orders') throw new Error('restore-quota'); m.set(k, String(v)); },
          removeItem:k => { if (fail === 'partial' && k === 'vowora:v1:orders') return; if (fail === 'restore-fail' && k === 'vowora:v1:guests') return; m.delete(k); }, _m:m }; };
      const out = [];
      /* Snapshot isolasi sesi (v18) — diambil SEBELUM kasus pertama;
         dipulihkan + diverifikasi di akhir suite (lihat kasus isolasi). */
      const sessBak = { role:S2.role, designerId:S2.designerId,
        grant:(() => { try { return window.__kiAdminWrite === true; } catch(e){ return false; } })(),
        gen:kiGrantGen(),
        orders:S2.orders, payments:S2.payments, services:S2.services, activity:S2.activity, notifications:S2.notifications, guests:S2.guests, rsvps:S2.rsvps,
        invIds:new Set(S.invitations.map(i => i.id)) };
      /* Snapshot SELURUH key storage sesi (v19): suite fixture tidak
         boleh menambah/mengubah/menghapus satu key pun di storage
         nyata — diverifikasi byte-per-byte pada kasus terakhir suite. */
      const kiDumpAllKeys = () => { const st = storageBackend(); const d = {}; if (!st) return d; for (let i = 0; i < st.length; i++){ const k = st.key(i); if (k != null) d[k] = st.getItem(k); } return d; };
      const keySnapBefore = kiDumpAllKeys();
      let st = mk('read'); let r = kiResetCore(st); out.push({name:'Reset: snapshot tak terbaca -> berhenti, data utuh', pass: r.ok === false && r.stage === 'snapshot-unreadable' && st._m.get('vowora:v1:guests') === '["g1"]'});
      st = mk('mutate'); r = kiResetCore(st); out.push({name:'Reset: snapshot berubah saat diverifikasi -> berhenti sebelum menghapus apa pun', pass: r.ok === false && r.stage === 'snapshot-verify' && st._m.get('vowora:v1:guests') === '["g1"]' && st._m.get(K2.backup) === '{"lama":true}'});
      st = mk('write'); r = kiResetCore(st); out.push({name:'Reset: backup gagal ditulis -> berhenti, backup lama dipertahankan', pass: r.ok === false && r.stage === 'backup-write' && st._m.get(K2.backup) === '{"lama":true}' && st._m.has('vowora:v1:orders')});
      st = mk('corrupt'); r = kiResetCore(st); out.push({name:'Reset: backup tak lolos verifikasi -> berhenti sebelum menghapus', pass: r.ok === false && r.stage === 'backup-verify' && st._m.has('vowora:v1:guests') && st._m.get(K2.backup) === '{"lama":true}'});
      st = mk('partial'); r = kiResetCore(st); out.push({name:'Reset: penghapusan parsial -> snapshot dipulihkan & terverifikasi', pass: r.ok === false && r.stage === 'partial-delete' && r.restored === true && st._m.get('vowora:v1:orders') === '["o1"]'});
      st = mk('restore-fail'); r = kiResetCore(st); out.push({name:'Reset: pemulihan snapshot GAGAL -> dilaporkan restored=false (tidak diklaim pulih)', pass: r.ok === false && r.stage === 'partial-delete' && r.restored === false && st._m.get('vowora:v1:guests') === '["g1"]'});
      st = mk(''); r = kiResetCore(st); out.push({name:'Reset: jalur normal -> terhapus bersih, backup baru tersimpan, karantina dipertahankan', pass: r.ok === true && !st._m.has('vowora:v1:guests') && !!st._m.get(K2.backup) && st._m.get(K2.quarantine) === '[]'});
      /* (2) Handler tulis dipanggil LANGSUNG lewat predikat yang dipakai
         handler (kiWriteAllowed = logika ownGuard; kiDesignerAllowed =
         logika svcGuard) dengan peran/grant yang disimulasikan pada
         fixture; peran, desainer aktif, dan grant dipulihkan sesudahnya. */
      try {
        const roleBak = S2.role, desBak = S2.designerId;
        let grantBak = null, canGrant = false;
        try { grantBak = window.__kiAdminWrite === true; canGrant = true; } catch(e){}
        S2.role = 'customer';
        out.push({name:'Handler tulis: pemilik yang aktif diizinkan menulis undangannya', pass: kiWriteAllowed({ownerId:'cust-1'}) === true});
        out.push({name:'Handler tulis: undangan akun lain ditolak untuk pelanggan (bukan sekadar tombol)', pass: kiWriteAllowed({ownerId:'cust-2'}) === false});
        if (canGrant){
          S2.role = 'admin'; try { window.__kiAdminWrite = false; } catch(e){}
          out.push({name:'Handler tulis: Admin lintas-pemilik TANPA grant eksplisit ditolak di handler', pass: kiWriteAllowed({ownerId:'cust-2'}) === false});
          try { window.__kiAdminWrite = true; } catch(e){}
          out.push({name:'Handler tulis: Admin lintas-pemilik DENGAN grant eksplisit diizinkan (persistensi aktif)', pass: kiWriteAllowed({ownerId:'cust-2'}) === true});
          try { window.__kiAdminWrite = grantBak; } catch(e){}
        }
        S2.role = 'designer'; S2.designerId = 'des-1';
        out.push({name:'Desainer: proyek assignee yang sedang aktif diizinkan', pass: kiDesignerAllowed({designerId:'des-1'}) === true});
        out.push({name:'Desainer: proyek desainer lain ditolak di handler', pass: kiDesignerAllowed({designerId:'des-2'}) === false});
        out.push({name:'Desainer: proyek tanpa assignee ditolak', pass: kiDesignerAllowed({designerId:null}) === false});
        S2.role = roleBak; S2.designerId = desBak;
      } catch(e){ out.push({name:'Uji handler tulis (predikat guard)', pass:false}); }
      /* (3) Payment gate pada data sintetis */
      const oGate = {id:'fx-order-1', invitationId:'fx-inv-1', paymentStatus:'Success', status:'Diproses'};
      const pLegacy = {id:'fx-pay-legacy', orderId:'fx-order-1', status:'Success'};
      const pOther = {id:'fx-pay-other', orderId:'fx-order-1', invitationId:'fx-inv-2', status:'Success'};
      const pOk = {id:'fx-pay-ok', orderId:'fx-order-1', invitationId:'fx-inv-1', status:'Success'};
      out.push({name:'Payment gate: record Success TANPA invitationId (legacy) ditolak — tidak ada fallback', pass: linkedSuccessPayment(oGate, 'fx-inv-1', [pLegacy]) === null});
      out.push({name:'Payment gate: record Success milik undangan lain ditolak', pass: linkedSuccessPayment(oGate, 'fx-inv-1', [pOther]) === null});
      out.push({name:'Payment gate: record Success untuk order + undangan yang sama diterima', pass: (linkedSuccessPayment(oGate, 'fx-inv-1', [pLegacy, pOther, pOk]) || {}).id === 'fx-pay-ok'});
      out.push({name:'Payment gate: order Dibatalkan tetap terminal walau ada record Success yang cocok', pass: linkedSuccessPayment(Object.assign({}, oGate, {status:'Dibatalkan'}), 'fx-inv-1', [pOk]) === null});
      /* (4) Dedupe impor ID stabil pada data sintetis */
      const rows = [{name:'Tes Satu', group:'Teman', contact:'0811'}, {name:'Tes Satu', group:'Teman', contact:'0811'}, {name:'Tes Dua', group:'Keluarga', contact:''}];
      const imp1 = kiImportGuests([], 'fx-inv-1', rows);
      const imp2 = kiImportGuests(imp1.added, 'fx-inv-1', rows);
      out.push({name:'Impor: ID stabil & dedupe — baris ganda dilewati, impor ulang tidak menggandakan tamu', pass: imp1.added.length === 2 && imp1.skipped.length === 1 && imp2.added.length === 0 && imp2.skipped.length === 3 && kiGuestStableId('fx-inv-1', rows[0]) === imp1.added[0].id});
      /* (5) Orphan-reference pada data sintetis + pemindaian data nyata (baca saja) */
      const cols = { invitations:[{id:'fx-inv-1'}], guests:[{id:'g-ok', invitationId:'fx-inv-1'}, {id:'g-orphan', invitationId:'fx-inv-x'}], rsvps:[{id:'r-ok', guestId:'g-ok', invitationId:'fx-inv-1'}, {id:'r-orphan', guestId:'g-gone', invitationId:'fx-inv-1'}], orders:[{id:'o-ok', invitationId:'fx-inv-1'}], payments:[{id:'p-ok', orderId:'o-ok', invitationId:'fx-inv-1'}, {id:'p-orphan', orderId:'o-gone', invitationId:'fx-inv-1'}, {id:'p-mismatch', orderId:'o-ok', invitationId:'fx-inv-2'}], services:[{id:'s-ok', invitationId:'fx-inv-1', orderId:'o-ok'}, {id:'s-orphan', invitationId:null, orderId:'o-gone'}] };
      const scan = kiOrphanScan(cols);
      out.push({name:'Orphan-reference: tamu/RSVP/pembayaran/layanan yatim pada fixture terdeteksi tepat', pass: scan.guests.length === 1 && scan.rsvps.length === 1 && scan.payments.length === 2 && scan.services.length === 1});
      const live = kiOrphanScan({invitations:S.invitations, guests:S2.guests, rsvps:S2.rsvps, orders:S2.orders, payments:S2.payments, services:S2.services});
      const liveHard = live.guests.length + live.rsvps.length + live.payments.length + live.services.length;
      out.push({name:'Orphan-reference: data demo saat ini bersih (0 referensi yatim keras; ' + live.historical.length + ' referensi historis riwayat)', pass: liveHard === 0});
      /* (6) Publish-save failure (P1 v15): inti publikasi yang sama
         dengan handler Builder (kiPublishCore) + persistensi stub. */
      try {
        const fxInv = {id:'fx-inv-pub', title:'Uji Terbit Gagal', slug:null, status:'draft', publishedAt:null, updatedAt:1};
        let failOnce = 1;
        const rPubFail = kiPublishCore(fxInv, () => { if (failOnce-- > 0) return false; return true; });
        out.push({name:'Publish: persistensi GAGAL -> tidak ada status terbit; rollback menulis state draft kembali (setelah reload tetap draft)', pass: rPubFail.ok === false && rPubFail.rollbackOk === true && fxInv.status === 'draft' && fxInv.slug === null && fxInv.publishedAt === null});
        const fxInv2 = {id:'fx-inv-pub2', title:'Uji Terbit Rollback Gagal', slug:null, status:'draft', publishedAt:null, updatedAt:1};
        const rPubRb = kiPublishCore(fxInv2, () => false);
        out.push({name:'Publish: persistensi + rollback sama-sama GAGAL -> rollbackOk=false dilaporkan (tidak diklaim pulih, tidak diklaim terbit)', pass: rPubRb.ok === false && rPubRb.rollbackOk === false && fxInv2.status === 'draft'});
        const fxInv3 = {id:'fx-inv-pub3', title:'Uji Terbit Berhasil', slug:null, status:'draft', publishedAt:null, updatedAt:1};
        const rPubOk = kiPublishCore(fxInv3, () => true);
        out.push({name:'Publish: persistensi berhasil -> terbit dengan slug (satu-satunya jalur yang boleh menampilkan sukses)', pass: rPubOk.ok === true && fxInv3.status === 'published' && !!rPubOk.slug && !!fxInv3.publishedAt});
      } catch(e){ out.push({name:'Uji publish-save failure (kiPublishCore)', pass:false}); }
      /* (7) Owner mismatch: route bayar/faktur (kiOrderViewAllowed) dan
         Builder role+owner (kiOwns) dengan peran yang disimulasikan. */
      try {
        const roleBak2 = S2.role;
        S2.role = 'customer';
        out.push({name:'Route bayar/faktur: pemilik pesanan diizinkan membuka pesanannya sendiri', pass: kiOrderViewAllowed({customerId:'cust-1'}) === true});
        out.push({name:'Route bayar/faktur: pesanan akun LAIN ditolak untuk pelanggan (owner mismatch)', pass: kiOrderViewAllowed({customerId:'cust-2'}) === false});
        S2.role = 'designer';
        out.push({name:'Route bayar/faktur: Desainer ditolak walau ID pesanannya benar', pass: kiOrderViewAllowed({customerId:'cust-1'}) === false});
        out.push({name:'Builder: peran Desainer TIDAK dianggap pemilik lewat CURRENT_USER (role + owner sekaligus)', pass: kiOwns({ownerId:'cust-1'}) === false});
        S2.role = 'admin';
        out.push({name:'Builder: peran Admin TIDAK dianggap pemilik lewat CURRENT_USER (perlu grant terpisah)', pass: kiOwns({ownerId:'cust-1'}) === false});
        out.push({name:'Route bayar/faktur: Admin boleh memeriksa lintas-pemilik (mode inspeksi)', pass: kiOrderViewAllowed({customerId:'cust-2'}) === true});
        S2.role = roleBak2;
      } catch(e){ out.push({name:'Uji owner mismatch route bayar/faktur + Builder', pass:false}); }
      /* (8) RSVP tanpa kode tamu: identitas stabil per undangan. */
      try {
        const idA = kiPublicGuestId('fx-inv-1', 'token-a');
        out.push({name:'RSVP tanpa kode: token yang sama -> ID tamu yang sama (submit ulang = update, bukan duplikat)', pass: idA === kiPublicGuestId('fx-inv-1', 'token-a')});
        out.push({name:'RSVP tanpa kode: token/undangan berbeda -> ID berbeda (identitas BUKAN dari nama)', pass: idA !== kiPublicGuestId('fx-inv-1', 'token-b') && idA !== kiPublicGuestId('fx-inv-2', 'token-a')});
      } catch(e){ out.push({name:'Uji identitas stabil RSVP tanpa kode', pass:false}); }
      /* (9) Transisi layanan ilegal ditolak di handler (tabel transisi). */
      try {
        const legal = kiSvcTransitionAllowed('Assigned','In Progress','designer') && kiSvcTransitionAllowed('In Progress','Review','designer') && kiSvcTransitionAllowed('Revision','Review','designer') && kiSvcTransitionAllowed('Approved','Published','admin') && kiSvcTransitionAllowed('Published','Completed','admin');
        const illegal = !kiSvcTransitionAllowed('New','In Progress','designer') && !kiSvcTransitionAllowed('Assigned','Review','designer') && !kiSvcTransitionAllowed('Review','Approved','designer') && !kiSvcTransitionAllowed('Approved','Completed','admin') && !kiSvcTransitionAllowed('Completed','In Progress','designer') && !kiSvcTransitionAllowed('Paid','Assigned','admin');
        out.push({name:'Layanan: transisi sah per peran diterima (Assigned→In Progress→Review, Approved→Published→Completed)', pass: legal});
        out.push({name:'Layanan: transisi ilegal ditolak (lompat tahap, Approved→Completed, mundur dari Completed, Assigned lewat progres)', pass: illegal});
      } catch(e){ out.push({name:'Uji transisi layanan (kiSvcTransitionAllowed)', pass:false}); }
      /* (10) Konsistensi seed terbit tanpa packageId (kiResolvePackageId). */
      try {
        const so = (id, inv, pkg, ps) => ({id, invitationId:inv, packageId:pkg, paymentStatus:ps, status:'Diproses'});
        const sp = (id, oid, inv, st) => ({id, orderId:oid, invitationId:inv, status:st});
        out.push({name:'Seed: terbit tanpa packageId + order Success terbukti TUNGGAL -> paket diambil dari order itu', pass: kiResolvePackageId('fx-inv-s', [so('o1','fx-inv-s','premium','Success')], [sp('p1','o1','fx-inv-s','Success')]) === 'premium'});
        out.push({name:'Seed: terbit tanpa packageId + TIDAK ada order Success terbukti -> belum terselesaikan (paket tidak ditebak)', pass: kiResolvePackageId('fx-inv-s', [so('o2','fx-inv-s','premium','Expired')], [sp('p2','o2','fx-inv-s','Expired')]) === null});
        out.push({name:'Seed: bukti menunjuk DUA paket berbeda -> belum terselesaikan (tidak dipilih sembarang)', pass: kiResolvePackageId('fx-inv-s', [so('o3','fx-inv-s','premium','Success'), so('o4','fx-inv-s','signature','Success')], [sp('p3','o3','fx-inv-s','Success'), sp('p4','o4','fx-inv-s','Success')]) === null});
        out.push({name:'Seed: order Success tanpa record pembayaran tertaut ketat -> tidak dihitung sebagai bukti paket', pass: kiResolvePackageId('fx-inv-s', [so('o5','fx-inv-s','premium','Success')], [sp('p5','o5',undefined,'Success')]) === null});
        out.push({name:'Seed — ATURAN multi-order: DUA order Success dengan package ID yang SAMA (keduanya terbukti) -> SATU bukti paket, paket itu dipakai (syaratnya tepat satu package ID unik, bukan tepat satu order)', pass: kiResolvePackageId('fx-inv-s', [so('o6','fx-inv-s','premium','Success'), so('o7','fx-inv-s','premium','Success')], [sp('p6','o6','fx-inv-s','Success'), sp('p7','o7','fx-inv-s','Success')]) === 'premium'});
        out.push({name:'Seed — ATURAN multi-order: dua order Success se-paket, hanya SATU yang terbukti tertaut -> yang terbukti tetap dihitung, paket teresolusi', pass: kiResolvePackageId('fx-inv-s', [so('o8','fx-inv-s','premium','Success'), so('o9','fx-inv-s','premium','Success')], [sp('p8','o8','fx-inv-s','Success'), sp('p9','o9',undefined,'Success')]) === 'premium'});
      } catch(e){ out.push({name:'Uji konsistensi seed (kiResolvePackageId)', pass:false}); }
      /* (11) Siklus hidup grant Admin lintas-pemilik — fungsi yang SAMA
         dengan handler nyata: predikat handler (kiWriteAllowed),
         predikat persistensi Builder (kiCanPersist), dan pencabut grant
         yang dipanggil handler ganti persona/peran (kiRevokeAdminGrant).
         "Setelah reload" dibuktikan dengan baca-ulang dari stub storage:
         yang tertulis lewat jalur ber-grant masih terbaca persis; jalur
         tanpa grant tidak menulis apa pun sejak awal. Semua pada stub —
         data nyata tidak disentuh; peran & grant dipulihkan sesudahnya. */
      try {
        const roleBak3 = S2.role;
        let grantBak3 = null; try { grantBak3 = window.__kiAdminWrite === true; } catch(e){}
        const fxOther = {id:'fx-inv-grant', ownerId:'cust-2', title:'Fixture Grant'};
        const gStore = new Map();
        const gStub = { getItem:k => gStore.has(k) ? gStore.get(k) : null, setItem:(k, v) => { gStore.set(k, String(v)); } };
        const gatedPersist = inv => { if (!kiCanPersist(inv)) return false; gStub.setItem('fx:grant-write', inv.id); return gStub.getItem('fx:grant-write') === inv.id; };
        S2.role = 'admin'; kiRevokeAdminGrant();
        out.push({name:'Grant: Admin TANPA grant -> handler menolak tulis lintas-pemilik (kiWriteAllowed=false)', pass: kiWriteAllowed(fxOther) === false});
        out.push({name:'Grant: Admin TANPA grant -> persistensi Builder ikut tertutup (kiCanPersist=false, bukan hanya UI)', pass: kiCanPersist(fxOther) === false});
        out.push({name:'Grant: TANPA grant, jalur simpan yang digerbang predikat persistensi TIDAK menulis apa pun ke storage', pass: gatedPersist(fxOther) === false && gStub.getItem('fx:grant-write') === null});
        try { window.__kiAdminWrite = true; } catch(e){}
        out.push({name:'Grant: Admin DENGAN grant eksplisit -> handler mengizinkan tulis lintas-pemilik', pass: kiWriteAllowed(fxOther) === true});
        out.push({name:'Grant: DENGAN grant, penulisan lolos persistensi dan MASIH TERBACA setelah baca-ulang storage (simulasi reload)', pass: gatedPersist(fxOther) === true && gStub.getItem('fx:grant-write') === 'fx-inv-grant'});
        kiRevokeAdminGrant();
        out.push({name:'Grant: persona/peran berubah -> kiRevokeAdminGrant (fungsi yang dipanggil handler ganti peran) mencabut grant; handler & persistensi menolak lagi', pass: kiAdminWriteOn() === false && kiWriteAllowed(fxOther) === false && kiCanPersist(fxOther) === false});
        out.push({name:'Grant: setelah dicabut, jalur simpan kembali tidak menulis (record hasil grant sebelumnya tidak ditimpa diam-diam)', pass: gatedPersist(fxOther) === false && gStub.getItem('fx:grant-write') === 'fx-inv-grant'});
        S2.role = roleBak3;
        try { window.__kiAdminWrite = grantBak3 === true; } catch(e){}
      } catch(e){ out.push({name:'Uji siklus hidup grant Admin (tanpa/dengan izin, reload, pencabutan)', pass:false}); }
      /* (12) Autosave tertunda vs pencabutan grant (v17): gerbang
         penembakan yang SAMA dengan timer nyata (kiFireAutosave) —
         persistensi disuntikkan sebagai stub disposable; izin dinilai
         ulang pada SAAT penulisan, bukan hanya saat penjadwalan. */
      try {
        const roleBak4 = S2.role;
        let grantBak4 = null; try { grantBak4 = window.__kiAdminWrite === true; } catch(e){}
        const fxInvAuto = {id:'fx-inv-auto', ownerId:'cust-2', title:'Fixture Autosave'};
        const writes = [];
        const stubPersist = inv => { writes.push(inv.id); return true; };
        S2.role = 'admin'; kiRevokeAdminGrant();
        try { window.__kiAdminWrite = true; } catch(e){}
        const genAtSchedule = kiGrantGen();
        out.push({name:'Autosave: timer dijadwalkan SAAT grant aktif & izin tidak berubah -> menulis saat timer menyala', pass: kiFireAutosave(fxInvAuto, genAtSchedule, stubPersist) === true && writes.length === 1});
        kiRevokeAdminGrant(); /* grant dicabut SEBELUM timer menyala */
        out.push({name:'Autosave: grant DICABUT sebelum timer menyala -> timer TIDAK menulis (izin dinilai ulang saat penulisan + generasi berubah)', pass: kiFireAutosave(fxInvAuto, genAtSchedule, stubPersist) === false && writes.length === 1});
        try { window.__kiAdminWrite = true; } catch(e){} /* grant baru untuk persona berikutnya */
        out.push({name:'Autosave: grant BARU sesudah pencabutan TIDAK menghidupkan timer lama (generasi berbeda)', pass: kiFireAutosave(fxInvAuto, genAtSchedule, stubPersist) === false && writes.length === 1});
        const genBaru = kiGrantGen();
        out.push({name:'Autosave: timer BARU pada generasi grant yang aktif menulis normal', pass: kiFireAutosave(fxInvAuto, genBaru, stubPersist) === true && writes.length === 2});
        S2.role = 'customer'; /* peran berganti sebelum timer menyala */
        out.push({name:'Autosave: PERAN berubah sebelum timer menyala -> predikat persistensi gugur, tidak menulis', pass: kiFireAutosave(fxInvAuto, genBaru, stubPersist) === false && writes.length === 2});
        S2.role = roleBak4;
        try { window.__kiAdminWrite = grantBak4 === true; } catch(e){}
      } catch(e){ out.push({name:'Uji autosave tertunda vs pencabutan grant (kiFireAutosave)', pass:false}); }
      /* (13) RSVP: snapshot, dedupe, dan rollback mencakup NAMA (v17) —
         fungsi yang sama dengan handler submit (kiRsvpIsChanged,
         kiRsvpRestoreGuest, kiRsvpRestoreRsvp) pada record sintetis. */
      try {
        const gFx = {id:'fx-g1', name:'Nama Lama', rsvpStatus:'Hadir', attendees:2};
        const rFx = {id:'fx-r1', guestId:'fx-g1', name:'Nama Lama', status:'Hadir', count:2, message:'Siap hadir', at:111};
        const gPrevFx = {name:gFx.name, rsvpStatus:gFx.rsvpStatus, attendees:gFx.attendees};
        const prevFx = {name:rFx.name, status:rFx.status, count:rFx.count, message:rFx.message, at:rFx.at};
        out.push({name:'RSVP: submit identik PENUH (nama + status + jumlah + pesan sama) -> dedupe, tidak ada penulisan ulang', pass: kiRsvpIsChanged(gPrevFx, prevFx, {name:'Nama Lama', status:'Hadir', count:2, message:'Siap hadir'}) === false});
        out.push({name:'RSVP: perubahan NAMA saja -> BUKAN dedupe (perubahan sah yang wajib tersimpan)', pass: kiRsvpIsChanged(gPrevFx, prevFx, {name:'Nama Baru', status:'Hadir', count:2, message:'Siap hadir'}) === true});
        gFx.name = 'Nama Baru'; gFx.rsvpStatus = 'Tidak Hadir'; gFx.attendees = 0;
        rFx.name = 'Nama Baru'; rFx.status = 'Tidak Hadir'; rFx.count = 0; rFx.message = ''; rFx.at = 222;
        kiRsvpRestoreGuest(gFx, gPrevFx); kiRsvpRestoreRsvp(rFx, prevFx);
        out.push({name:'RSVP: rollback memulihkan NAMA tamu & NAMA record RSVP beserta status/jumlah/pesan/waktu — tanpa sisa parsial', pass: gFx.name === 'Nama Lama' && gFx.rsvpStatus === 'Hadir' && gFx.attendees === 2 && rFx.name === 'Nama Lama' && rFx.status === 'Hadir' && rFx.count === 2 && rFx.message === 'Siap hadir' && rFx.at === 111});
      } catch(e){ out.push({name:'Uji RSVP nama (dedupe + rollback)', pass:false}); }
      /* (14) Rollback pembayaran (v17): inti yang sama dengan handler
         pay-result (kiRollbackPayment) pada koleksi sintetis yang
         ditukar sementara — hasil pemulihan SETIAP koleksi diperiksa,
         packageId termasuk; kegagalan per koleksi dan kegagalan
         packageId diuji TERPISAH. Koleksi nyata dipulihkan sesudahnya. */
      try {
        const keepCols = {orders:S2.orders, payments:S2.payments, services:S2.services, activity:S2.activity, notifications:S2.notifications};
        const fxInvRb = {id:'fx-inv-rbf', packageId:'premium'};
        S.invitations.push(fxInvRb);
        const snapFx = {invId:'fx-inv-rbf', invPkg:'premium', orders:[{id:'fx-o-keep'}], payments:[{id:'fx-p-keep'}], services:[], activity:[], notifications:[]};
        S2.orders = [{id:'fx-o-mut'}]; S2.payments = [{id:'fx-p-mut'}]; S2.services = [{id:'fx-s-mut'}]; S2.activity = [{id:'fx-a-mut'}]; S2.notifications = [{id:'fx-n-mut'}];
        fxInvRb.packageId = 'basic'; /* packageId tertimpa oleh jalur yang gagal */
        const rbAllOk = kiRollbackPayment(snapFx, () => true, () => true);
        out.push({name:'Pembayaran: rollback dengan SEMUA penulisan pulih -> dilaporkan sukses, koleksi & packageId kembali persis ke snapshot', pass: rbAllOk === true && S2.orders[0].id === 'fx-o-keep' && S2.payments[0].id === 'fx-p-keep' && fxInvRb.packageId === 'premium'});
        S2.orders = [{id:'fx-o-mut'}]; fxInvRb.packageId = 'basic';
        const rbPkgFail = kiRollbackPayment(snapFx, () => false, () => true);
        out.push({name:'Pembayaran: pemulihan packageId GAGAL -> rollback dilaporkan GAGAL (rbOk=false), tidak diklaim pulih walau koleksi lain berhasil', pass: rbPkgFail === false});
        S2.payments = [{id:'fx-p-mut'}];
        const rbCollFail = kiRollbackPayment(snapFx, () => true, nm => nm !== 'payments');
        out.push({name:'Pembayaran: satu koleksi (payments) GAGAL dipulihkan -> rbOk=false, terpisah dari kegagalan packageId', pass: rbCollFail === false});
        S2.orders = keepCols.orders; S2.payments = keepCols.payments; S2.services = keepCols.services; S2.activity = keepCols.activity; S2.notifications = keepCols.notifications;
        S.invitations = S.invitations.filter(i => i.id !== 'fx-inv-rbf');
      } catch(e){ out.push({name:'Uji rollback pembayaran (kiRollbackPayment)', pass:false}); }
      /* (15) State machine unassign + konsistensi setelah reload (v17):
         keputusan yang sama dengan handler penugasan
         (kiSvcUnassignDecision) dan penegak muat-ulang
         (kiSvcGateDecision) pada record sintetis. */
      try {
        const oFxSvc = {id:'fx-o-svc', invitationId:'fx-inv-svc', packageId:'premium', paymentStatus:'Success', status:'Diproses'};
        const pFxSvc = {id:'fx-p-svc', orderId:'fx-o-svc', invitationId:'fx-inv-svc', status:'Success'};
        const svcFx = st => ({id:'fx-svc-u', number:'REQ-FX', status:st, designerId:'des-1', orderId:'fx-o-svc', invitationId:'fx-inv-svc'});
        const dAsg = kiSvcUnassignDecision(svcFx('Assigned'), [oFxSvc], [pFxSvc]);
        out.push({name:'Unassign: dari Assigned + bukti Success tertaut ketat -> boleh, status kembali ke Paid', pass: dAsg.ok === true && dAsg.toStatus === 'Paid'});
        const dAsgNoPay = kiSvcUnassignDecision(svcFx('Assigned'), [Object.assign({}, oFxSvc, {paymentStatus:'Pending'})], [Object.assign({}, pFxSvc, {status:'Pending'})]);
        out.push({name:'Unassign: dari Assigned TANPA bukti Success tertaut -> boleh, kembali ke New (Paid tidak ditebak)', pass: dAsgNoPay.ok === true && dAsgNoPay.toStatus === 'New'});
        out.push({name:'Unassign: proyek BERJALAN (In Progress/Review/Revision) -> DITOLAK di state machine', pass: ['In Progress','Review','Revision'].every(st => kiSvcUnassignDecision(svcFx(st), [oFxSvc], [pFxSvc]).ok === false)});
        out.push({name:'Unassign: proyek TERMINAL (Approved/Published/Completed) -> DITOLAK di state machine', pass: ['Approved','Published','Completed'].every(st => kiSvcUnassignDecision(svcFx(st), [oFxSvc], [pFxSvc]).ok === false)});
        out.push({name:'Reload: hasil unassign sah (Paid, tanpa desainer) KONSISTEN — penegak muat-ulang tidak mengubahnya', pass: kiSvcGateDecision({status:'Paid', designerId:null, orderId:'fx-o-svc', invitationId:'fx-inv-svc'}, [oFxSvc], [pFxSvc]).action === 'keep'});
        out.push({name:'Reload: status BERJALAN tanpa desainer TIDAK diturunkan diam-diam ke Paid/New oleh penegak', pass: kiSvcGateDecision({status:'In Progress', designerId:null, orderId:'fx-o-svc', invitationId:'fx-inv-svc'}, [oFxSvc], [pFxSvc]).action === 'keep' && kiSvcGateDecision({status:'Completed', designerId:null, orderId:'fx-o-svc', invitationId:'fx-inv-svc'}, [oFxSvc], [pFxSvc]).action === 'keep'});
        const dLegacy = kiSvcGateDecision({status:'Assigned', designerId:'des-1', orderId:null, invitationId:null}, [], []);
        out.push({name:'Reload: Assigned warisan TANPA bukti pembayaran tetap ditegakkan -> New + desainer dilepas (satu-satunya penurunan otomatis)', pass: dLegacy.action === 'downgrade' && dLegacy.toStatus === 'New' && dLegacy.releaseDesigner === true});
      } catch(e){ out.push({name:'Uji state machine unassign + konsistensi reload', pass:false}); }
      /* (16) Badge paket Admin (v17): fungsi status yang sama dengan
         daftar Admin (invStatus/invAccessEndsAt) pada undangan sintetis. */
      try {
        const nowFx = Date.now();
        const invEmptyPkg = {status:'published', archived:false, packageId:'', publishedAt:nowFx - 864e5, slug:'fx-a'};
        const invUnknownPkg = {status:'published', archived:false, packageId:'paket-ngaco', publishedAt:nowFx - 864e5, slug:'fx-b'};
        const invKnownPkg = {status:'published', archived:false, packageId:'premium', publishedAt:nowFx - 864e5, slug:'fx-c'};
        out.push({name:'Badge Admin: undangan terbit dengan packageId KOSONG -> belum terselesaikan', pass: invStatus(invEmptyPkg).unresolved === true});
        out.push({name:'Badge Admin: packageId TIDAK DIKENAL -> belum terselesaikan dan tanggal berakhir TIDAK diklaim (endsAt kosong)', pass: invStatus(invUnknownPkg).unresolved === true && invStatus(invUnknownPkg).endsAt == null});
        const stKnownFx = invStatus(invKnownPkg);
        out.push({name:'Badge Admin: paket dikenal + tanggal terbit terbukti -> terselesaikan, tanggal berakhir terhitung (Premium +6 bulan)', pass: stKnownFx.unresolved === false && typeof stKnownFx.endsAt === 'number' && stKnownFx.endsAt > nowFx});
        out.push({name:'Badge Admin: paket dikenal TAPI tanggal terbit tidak terbukti -> tetap belum terselesaikan', pass: invStatus({status:'published', archived:false, packageId:'premium', publishedAt:null, slug:'fx-d'}).unresolved === true});
      } catch(e){ out.push({name:'Uji badge paket Admin (invStatus)', pass:false}); }
      /* (17) v18 — Kunci paket checkout (inti handler co-confirm,
         kiCheckoutValidate/kiTemplatePackage) + inti pembatalan
         snapshot-first (kiCancelOrderCore, inti handler order-cancel)
         dengan saveFn suntikan: simpan gagal dan rollback gagal diuji
         TERPISAH, dan status di memori harus kembali persis. */
      try {
        const invLux = {id:'fx-inv-co', templateId:'luxury-ivory'}; /* template Premium Rp59.000 */
        const invBas = {id:'fx-inv-co2', templateId:'confetti-pop'}; /* template Basic Rp29.000 */
        out.push({name:'Checkout: paket terkunci dihitung dari tier template (Luxury Ivory -> Premium Rp59.000; Confetti Pop -> Basic Rp29.000)', pass: (kiTemplatePackage(invLux) || {}).id === 'premium' && (kiTemplatePackage(invLux) || {}).price === 59000 && (kiTemplatePackage(invBas) || {}).id === 'basic' && (kiTemplatePackage(invBas) || {}).price === 29000});
        out.push({name:'Checkout: paket + harga SESUAI tier template -> handler mengizinkan (ok)', pass: kiCheckoutValidate(invLux, 'premium', 59000).ok === true});
        out.push({name:'Checkout: paket LAIN dari tier template (Signature untuk template Premium) -> DITOLAK di validasi handler, bukan hanya UI', pass: kiCheckoutValidate(invLux, 'signature', 99000).ok === false});
        out.push({name:'Checkout: paket benar tapi HARGA tidak cocok dengan harga tier (Rp29.000 untuk Premium) -> DITOLAK di handler', pass: kiCheckoutValidate(invLux, 'premium', 29000).ok === false});
        const ocOk = {id:'fx-o-c1', status:'Menunggu Pembayaran'};
        const rcOk = kiCancelOrderCore(ocOk, () => true);
        out.push({name:'Batal: simpan berhasil -> status Dibatalkan (satu-satunya jalur sukses)', pass: rcOk.ok === true && ocOk.status === 'Dibatalkan'});
        const ocFail = {id:'fx-o-c2', status:'Menunggu Pembayaran'};
        let cancelCalls = 0;
        const rcFail = kiCancelOrderCore(ocFail, () => { cancelCalls++; return cancelCalls > 1; }); /* simpan pertama gagal, tulis-balik rollback berhasil */
        out.push({name:'Batal: simpan GAGAL -> ok=false, rollbackOk=true, status di MEMORI kembali persis ke sebelum dibatalkan (tidak ada status batal palsu)', pass: rcFail.ok === false && rcFail.rollbackOk === true && ocFail.status === 'Menunggu Pembayaran'});
        const ocRbFail = {id:'fx-o-c3', status:'Diproses'};
        const rcRbFail = kiCancelOrderCore(ocRbFail, () => false); /* simpan DAN rollback gagal */
        out.push({name:'Batal: simpan gagal DAN rollback gagal -> dilaporkan rollbackOk=false (tidak diklaim pulih), status memori tetap snapshot asal', pass: rcRbFail.ok === false && rcRbFail.rollbackOk === false && ocRbFail.status === 'Diproses'});
      } catch(e){ out.push({name:'Uji kunci checkout + pembatalan snapshot-first', pass:false}); }
      /* (18) v18 — Bukti rekonsiliasi layanan (kiServicePaidProof, inti
         yang dipakai penyelaras muat-ulang alignServicePaid DAN penajuan
         New->Paid di handler pay-result): paymentStatus Success saja
         TIDAK cukup; record harus tertaut ke order + undangan yang sama
         dengan proyek. */
      try {
        const svcR = {id:'fx-svc-r', orderId:'fx-o-r', invitationId:'fx-inv-r', status:'New'};
        const ordR = {id:'fx-o-r', invitationId:'fx-inv-r', packageId:'premium', paymentStatus:'Success', status:'Diproses'};
        const payROk = {id:'fx-p-r', orderId:'fx-o-r', invitationId:'fx-inv-r', status:'Success'};
        const payRNoInv = {id:'fx-p-r2', orderId:'fx-o-r', status:'Success'};
        const payROther = {id:'fx-p-r3', orderId:'fx-o-r', invitationId:'fx-inv-lain', status:'Success'};
        out.push({name:'Rekonsiliasi: order Success + record Success tertaut ke order & undangan yang sama -> bukti lunas terbukti', pass: !!kiServicePaidProof(svcR, [ordR], [payROk])});
        out.push({name:'Rekonsiliasi: order berstatus Success TAPI record pembayaran tanpa invitationId -> TIDAK terbukti (status menggantung tidak cukup di jalur rekonsiliasi mana pun)', pass: kiServicePaidProof(svcR, [ordR], [payRNoInv]) === null});
        out.push({name:'Rekonsiliasi: record Success tertaut ke UNDANGAN LAIN -> TIDAK terbukti untuk proyek ini', pass: kiServicePaidProof(svcR, [ordR], [payROther]) === null});
        out.push({name:'Rekonsiliasi: orderId proyek menunjuk pesanan milik undangan lain -> TIDAK terbukti walau record Success-nya cocok dengan pesanan itu', pass: kiServicePaidProof(svcR, [Object.assign({}, ordR, {invitationId:'fx-inv-lain'})], [Object.assign({}, payROk, {invitationId:'fx-inv-lain'})]) === null});
        out.push({name:'Rekonsiliasi: proyek tanpa orderId / pesanan Pending -> tidak ada bukti (tetap New, tidak ditebak Paid)', pass: kiServicePaidProof({id:'fx-svc-r2', orderId:null, invitationId:'fx-inv-r', status:'New'}, [ordR], [payROk]) === null && kiServicePaidProof(svcR, [Object.assign({}, ordR, {paymentStatus:'Pending'})], [payROk]) === null});
      } catch(e){ out.push({name:'Uji bukti rekonsiliasi layanan (kiServicePaidProof)', pass:false}); }
      /* (19) v18 — Semantik nama RSVP (keputusan: SNAPSHOT nama kanonis
         saat submit; identitas & dedupe per guestId, BUKAN nama) — inti
         yang dipakai handler submit (kiRsvpSnapshotName +
         kiRsvpIsChanged) pada record sintetis multi-tamu. */
      try {
        out.push({name:'Nama RSVP: tamu tertaut KODE -> snapshot memakai nama kanonis record tamu; nama ketikan berbeda diabaikan (konsisten lintas perangkat dengan kode sama)', pass: kiRsvpSnapshotName({id:'fx-g-code', name:'Nama Kanonis'}, 'Nama Ketikan', false) === 'Nama Kanonis'});
        out.push({name:'Nama RSVP: tamu identitas-PERANGKAT -> nama ketikan menjadi snapshot & nama kanonis barunya', pass: kiRsvpSnapshotName({id:'fx-g-web', name:'Nama Lama'}, 'Nama Ketikan', true) === 'Nama Ketikan'});
        out.push({name:'Nama RSVP: tamu baru (belum ada record) -> snapshot memakai nama ketikan pertama', pass: kiRsvpSnapshotName(null, 'Nama Pertama', false) === 'Nama Pertama'});
        /* Multi-tamu bernama SAMA: dedupe dinilai per record tamu
           (guestId), tidak pernah dari nama — respons identik milik
           tamu A tidak mendedupe respons berbeda milik tamu B. */
        const prevA = {name:'Sari', status:'Hadir', count:1, message:''};
        const prevB = {name:'Sari', status:'Hadir', count:1, message:''};
        const dupA = kiRsvpIsChanged({name:'Sari'}, prevA, {name:'Sari', status:'Hadir', count:1, message:''});
        const chgB = kiRsvpIsChanged({name:'Sari'}, prevB, {name:'Sari', status:'Tidak Hadir', count:0, message:''});
        out.push({name:'Nama RSVP: dua tamu bernama sama (“Sari”) -> dedupe PER guestId: submit identik tamu A didedupe, perubahan tamu B tetap perubahan (nama sama tidak saling menelan)', pass: dupA === false && chgB === true});
        /* Snapshot vs rename: rename oleh penyelenggara mengubah record
           tamu (master) SAJA; record RSVP lama mempertahankan nama saat
           submit sampai tamu itu submit lagi (snapshot tersegar). */
        const gSnap = {id:'fx-g-snap', name:'Nama Submit'};
        const rSnapRec = {guestId:'fx-g-snap', name:kiRsvpSnapshotName(gSnap, 'Apa Pun', false)};
        gSnap.name = 'Nama Hasil Rename';
        const refreshed = kiRsvpSnapshotName(gSnap, 'Apa Pun', false);
        out.push({name:'Nama RSVP: rename tamu TIDAK menulis ulang snapshot RSVP lama; submit berikutnya menyegarkan snapshot ke nama kanonis baru', pass: rSnapRec.name === 'Nama Submit' && refreshed === 'Nama Hasil Rename'});
      } catch(e){ out.push({name:'Uji semantik nama RSVP (snapshot per guestId)', pass:false}); }
      /* (20) v19 — Blocker v18: gerbang tier untuk order lama, tier
         dari VERSI template yang dipakai undangan, bukti Paid tanpa
         fallback invitationId, helper expiry clamp WIB, identitas
         RSVP per orang pada perangkat bersama, dan kode pembayaran
         stabil per percobaan aktif. Setiap kasus membawa expected vs
         actual; reproduksi: buka Pengaturan → tombol uji fixture ini. */
      try {
        const fxTplId = 'fx-tpl-ver';
        TEMPLATES.push(tpl({id:fxTplId, slug:fxTplId, name:'Fixture Versi', categoryId:'pernikahan', styleId:'luxury-editorial', tier:'Premium', price:59000, version:2, status:'published', thumb:'rings', ornament:'garis', fontId:'modern', desc:'', palettes:TEMPLATES[0].palettes, sections:TEMPLATES[0].sections, features:[]}));
        TPL_VERSIONS[fxTplId + '@1'] = {id:fxTplId, name:'Fixture Versi', tier:'Basic', price:29000, version:1};
        TPL_VERSIONS[fxTplId + '@2'] = TEMPLATES[TEMPLATES.length - 1];
        TPL_VERSIONS[fxTplId + '@3'] = {id:fxTplId, name:'Fixture Versi', tier:'Exclusive', price:149000, version:3};
        try {
          const invV1 = {id:'fx-inv-v1', templateId:fxTplId, templateVersion:1};
          const invV2 = {id:'fx-inv-v2', templateId:fxTplId, templateVersion:2};
          const invV3 = {id:'fx-inv-v3', templateId:fxTplId, templateVersion:3};
          const pkV1 = kiTemplatePackage(invV1), pkV2 = kiTemplatePackage(invV2), pkV3 = kiTemplatePackage(invV3);
          out.push({name:'Versi template: undangan pada v1 (Basic) -> paket Basic Rp29.000, BUKAN tier template terkini (v2 = Premium)', pass: !!pkV1 && pkV1.id === 'basic' && pkV1.price === 29000, exp:'basic / 29000', act: pkV1 ? pkV1.id + ' / ' + pkV1.price : 'null'});
          out.push({name:'Versi template: undangan v2 -> Premium; undangan v3 bertier Exclusive -> paket Exclusive Rp149.000 (tier Exclusive dapat dimodelkan & ditag konsisten)', pass: !!pkV2 && pkV2.id === 'premium' && !!pkV3 && pkV3.id === 'exclusive' && pkV3.price === 149000, exp:'premium + exclusive / 149000', act: (pkV2 ? pkV2.id : 'null') + ' + ' + (pkV3 ? pkV3.id + ' / ' + pkV3.price : 'null')});
          const ordPremium = {id:'fx-o-tier', invitationId:'fx-inv-v1', packageId:'premium', packageName:'Premium', price:59000, total:59000, paymentStatus:'Pending', status:'Menunggu Pembayaran'};
          const gMis = kiOrderTierGate(ordPremium, invV1), gOk = kiOrderTierGate(Object.assign({}, ordPremium, {packageId:'basic'}), invV1);
          out.push({name:'Gerbang tier: order Premium untuk undangan template v1 Basic -> MISMATCH (hasil Success wajib ditahan; pesanan ditandai untuk dibuat ulang, snapshot tidak ditulis ulang)', pass: gMis.mismatch === true && !!gMis.expected && gMis.expected.id === 'basic', exp:'mismatch=true, expected=basic', act:'mismatch=' + gMis.mismatch + ', expected=' + (gMis.expected ? gMis.expected.id : 'null')});
          out.push({name:'Gerbang tier: order Basic untuk undangan yang sama -> cocok, tidak ditahan', pass: gOk.mismatch === false, exp:'mismatch=false', act:'mismatch=' + gOk.mismatch});
        } finally {
          const ix = TEMPLATES.findIndex(t => t.id === fxTplId); if (ix >= 0) TEMPLATES.splice(ix, 1);
          delete TPL_VERSIONS[fxTplId + '@1']; delete TPL_VERSIONS[fxTplId + '@2']; delete TPL_VERSIONS[fxTplId + '@3'];
        }
        const svcNoInv = {id:'fx-svc-nofb', orderId:'fx-o-fb', invitationId:'', status:'New'};
        const ordFb = {id:'fx-o-fb', invitationId:'fx-inv-fb', packageId:'premium', paymentStatus:'Success', status:'Diproses'};
        const payFb = {id:'fx-p-fb', orderId:'fx-o-fb', invitationId:'fx-inv-fb', status:'Success'};
        const proofNoFb = kiServicePaidProof(svcNoInv, [ordFb], [payFb]);
        out.push({name:'Rekonsiliasi v19: proyek dengan invitationId KOSONG + order & record Success tertaut ke undangan milik order -> TIDAK terbukti Paid (fallback dari order dilarang)', pass: proofNoFb === null, exp:'null', act: String(proofNoFb)});
        const proofStrict = kiServicePaidProof({id:'fx-svc-fb2', orderId:'fx-o-fb', invitationId:'fx-inv-fb', status:'New'}, [ordFb], [payFb]);
        out.push({name:'Rekonsiliasi v19: invitationId proyek sama persis dengan order + record Success-nya -> terbukti (jalur sah tidak ikut tertutup)', pass: !!proofStrict, exp:'record pembayaran fx-p-fb', act: proofStrict ? proofStrict.id : 'null'});
        const e1 = kiAddMonthsClampWIB(Date.UTC(2026, 9, 31, 3, 0, 0), 6);
        const e1Exp = Date.UTC(2027, 3, 30, 16, 59, 59, 999);
        out.push({name:'Expiry clamp: 31 Okt 2026 + 6 bulan -> 30 April 2027 23:59:59 WIB (BUKAN overflow Date.setMonth ke 1 Mei)', pass: e1 === e1Exp, exp:'2027-04-30T23:59:59.999 (WIB)', act: e1 ? new Date(e1 + KI_WIB_MS).toISOString().replace('T', ' ').replace('Z', ' (WIB)') : 'null'});
        const e2 = kiAddMonthsClampWIB(Date.UTC(2027, 0, 31, 3, 0, 0), 1);
        const e2Exp = Date.UTC(2027, 1, 28, 16, 59, 59, 999);
        out.push({name:'Expiry clamp: 31 Jan 2027 + 1 bulan -> 28 Februari 2027 23:59:59 WIB (hari dibatasi ke hari terakhir bulan tujuan)', pass: e2 === e2Exp, exp:'2027-02-28T23:59:59.999 (WIB)', act: e2 ? new Date(e2 + KI_WIB_MS).toISOString().replace('T', ' ').replace('Z', ' (WIB)') : 'null'});
        const e3 = invAccessEndsAt({publishedAt: Date.UTC(2026, 9, 31, 3, 0, 0), packageId:'premium'});
        out.push({name:'Expiry terapan: undangan Premium terbit 31 Okt 2026 -> masa aktif berakhir 30 April 2027 (invAccessEndsAt memakai helper clamp yang sama)', pass: e3 === e1Exp, exp:'2027-04-30T23:59:59.999 (WIB)', act: e3 ? new Date(e3 + KI_WIB_MS).toISOString().replace('T', ' ').replace('Z', ' (WIB)') : 'null'});
        const fxRespInv = 'fx-inv-resp';
        const respRawBefore = kiRespondentRaw(fxRespInv);
        try {
          const t1 = kiRespondentToken(fxRespInv, true);
          const t1Again = kiRespondentToken(fxRespInv, false);
          const t2 = kiRespondentNewPerson(fxRespInv);
          const listFx = kiRespondentList(fxRespInv);
          const idP1 = kiPublicGuestId(fxRespInv, t1), idP2 = kiPublicGuestId(fxRespInv, t2);
          out.push({name:'Identitas RSVP: token orang pertama stabil saat dibaca ulang; “tamu lain” membuat token BERBEDA yang menjadi aktif; token orang pertama tetap tersimpan (dua orang berbagi peramban = dua identitas, tanpa dedupe nama)', pass: !!t1 && t1Again === t1 && !!t2 && t2 !== t1 && listFx.tokens.length === 2 && listFx.tokens[listFx.active] === t2 && idP1 !== idP2, exp:'token1 stabil; token2 != token1; daftar 2 token; aktif = token2; guestId berbeda', act:'stabil=' + (t1Again === t1) + '; token2!=token1=' + (t2 !== t1) + '; daftar=' + listFx.tokens.length + '; guestId berbeda=' + (idP1 !== idP2)});
        } finally { kiRespondentRestoreRaw(fxRespInv, respRawBefore); }
        out.push({name:'Identitas RSVP: kunci identitas fixture dipulihkan persis ke snapshot pra-uji', pass: kiRespondentRaw(fxRespInv) === respRawBefore, exp: String(respRawBefore), act: String(kiRespondentRaw(fxRespInv))});
        const paysFx = [{id:'fx-pay-a1', orderId:'fx-o-att', status:'Failed', code:'8808 1111 2222', attempt:1}, {id:'fx-pay-a2', orderId:'fx-o-att', status:'Pending', code:'8808 3333 4444', attempt:2}];
        const actBeforeReload = kiActivePayment('fx-o-att', paysFx);
        const paysReloaded = JSON.parse(JSON.stringify(paysFx));
        const actAfterReload = kiActivePayment('fx-o-att', paysReloaded);
        out.push({name:'Kode pembayaran: percobaan aktif = percobaan terakhir; kodenya sama sebelum & sesudah muat ulang; percobaan lama tetap Failed sebagai riwayat (kode baru hanya untuk percobaan baru)', pass: !!actBeforeReload && actBeforeReload.id === 'fx-pay-a2' && !!actAfterReload && actAfterReload.code === '8808 3333 4444' && actAfterReload.code === actBeforeReload.code && paysReloaded[0].status === 'Failed', exp:'aktif=fx-pay-a2; kode 8808 3333 4444 stabil; lama=Failed', act:'aktif=' + (actAfterReload ? actAfterReload.id : 'null') + '; kode=' + (actAfterReload ? actAfterReload.code : 'null') + '; lama=' + paysReloaded[0].status});
      } catch(e){ out.push({name:'Uji blocker v19 (gerbang tier, versi template, bukti Paid, expiry, identitas, kode bayar)', pass:false}); }
      /* PEMULIHAN ISOLASI (v18): kembalikan SEMUA state sesi yang dapat
         disentuh suite ke snapshot awal — peran, desainer aktif, flag &
         GENERASI grant (grup 11/12 menaikkan generasi lewat
         kiRevokeAdminGrant), referensi koleksi (grup 14 menukar
         referensi; kegagalan di tengah grup tidak lagi membocorkan
         koleksi fixture), dan daftar undangan (buang record fixture
         yang mungkin tertinggal). Timer nyata tidak pernah dijadwalkan
         suite; storage nyata tidak pernah ditulis suite. */
      S2.role = sessBak.role; S2.designerId = sessBak.designerId;
      try { window.__kiAdminWrite = sessBak.grant; window.__kiGrantGen = sessBak.gen; } catch(e){}
      S2.orders = sessBak.orders; S2.payments = sessBak.payments; S2.services = sessBak.services; S2.activity = sessBak.activity; S2.notifications = sessBak.notifications; S2.guests = sessBak.guests; S2.rsvps = sessBak.rsvps;
      if (S.invitations.some(i => !sessBak.invIds.has(i.id))) S.invitations = S.invitations.filter(i => sessBak.invIds.has(i.id));
      out.push({name:'Isolasi suite: setelah suite selesai, peran, desainer aktif, flag grant, GENERASI grant, referensi koleksi, dan daftar undangan pulih PERSIS seperti sebelum suite (state sesi tidak berubah oleh pengujian)', pass: S2.role === sessBak.role && S2.designerId === sessBak.designerId && kiGrantGen() === sessBak.gen && (function(){ try { return (window.__kiAdminWrite === true) === sessBak.grant; } catch(e){ return false; } })() && S2.orders === sessBak.orders && S2.payments === sessBak.payments && S2.services === sessBak.services && S2.guests === sessBak.guests && S2.rsvps === sessBak.rsvps && S.invitations.every(i => sessBak.invIds.has(i.id))});
      /* VERIFIKASI SNAPSHOT SELURUH KEY (v19): storage sesi harus
         identik byte-per-byte dengan sebelum suite berjalan — tidak
         ada key yang ditambah, diubah, atau dihapus oleh pengujian,
         termasuk sesudah reload (nilai yang dibaca ulang dari storage
         adalah nilai yang sama dengan snapshot ini). */
      const keySnapAfter = kiDumpAllKeys();
      const driftKeys = Object.keys(keySnapBefore).filter(k => !(k in keySnapAfter) || keySnapAfter[k] !== keySnapBefore[k]).concat(Object.keys(keySnapAfter).filter(k => !(k in keySnapBefore)));
      out.push({name:'Snapshot seluruh key: storage sesi identik sebelum & sesudah suite fixture (0 key ditambah/diubah/dihapus oleh pengujian)', pass: driftKeys.length === 0, exp:'0 key berubah', act: driftKeys.length ? driftKeys.length + ' key berubah: ' + driftKeys.slice(0, 4).join(', ') : '0 key berubah'});
      return out;
    }
    /* ---------- Uji HANDLER PENUH (v18, harness terpisah dari suite
       fixture inti) ----------
       Kasus-kasus ini menggerakkan HANDLER ASLI lewat event DOM nyata —
       klik tombol [data-s2] yang diproses listener delegasi yang sama
       dengan klik pengguna, konfirmasi modal asli, dan submit formulir
       RSVP asli — bukan memanggil helper/inti secara langsung. Semua
       record yang dipakai sintetis (awalan fx-), fault-injection hanya
       lewat override Storage.prototype.setItem yang dipulihkan di
       tempat, dan SELURUH storage di-snapshot byte-per-byte sebelum
       suite lalu dipulihkan sesudahnya (kunci yang ditambahkan suite
       dihapus; nilai yang berubah ditulis balik persis), ditutup dengan
       kasus isolasi yang memverifikasi pemulihan itu. Kasus v19:
       (H5) hasil Success order lama mismatch tier DITAHAN handler
       pay-result asli, (H6) RSVP dua orang pada satu peramban lewat
       tombol “Isi sebagai tamu lain” + submit asli, (H7) kode
       pembayaran stabil per percobaan dan kode baru hanya pada
       percobaan baru — semuanya membawa expected vs actual. */
    function kiHandlerTests(){
      const out = [];
      const store = storageBackend();
      const dump = {};
      if (store){ for (let i = 0; i < store.length; i++){ const k = store.key(i); dump[k] = store.getItem(k); } }
      const restoreStore = () => { if (!store) return; const cur = []; for (let i = 0; i < store.length; i++) cur.push(store.key(i)); cur.forEach(k => { if (!(k in dump)){ try { store.removeItem(k); } catch(e){} } }); Object.keys(dump).forEach(k => { try { if (store.getItem(k) !== dump[k]) store.setItem(k, dump[k]); } catch(e){} }); };
      const roleBak = S2.role;
      const coBak = {invId:CO.invId, pkgId:CO.pkgId, coupon:CO.coupon, couponCode:CO.couponCode, method:CO.method, _lock:CO._lock};
      const origHash = location.hash;
      const fire = attrs => { const b = document.createElement('button'); Object.keys(attrs).forEach(k => b.setAttribute(k, attrs[k])); b.textContent = 'fx'; document.body.appendChild(b); b.click(); b.remove(); };
      try {
        S2.role = 'customer';
        const fxInv = {id:'fx-inv-hdl', templateId:'luxury-ivory', templateVersion:1, slug:'fx-handler', title:'Fixture Handler Penuh', categoryId:'pernikahan', status:'draft', ownerId:'cust-1', archived:false, packageId:null, content:{}, design:{}, sections:{}, createdAt:Date.now(), updatedAt:Date.now(), publishedAt:null};
        S.invitations.push(fxInv);
        /* (H1) Checkout terkunci lewat handler co-confirm ASLI: state
           checkout dipaksa mismatch (paket Signature untuk template
           Premium), klik konfirmasi diproses listener nyata -> handler
           menolak, tidak ada pesanan tercipta. */
        CO.invId = fxInv.id; CO.pkgId = 'signature'; CO.coupon = null; CO._lock = null;
        let storedOrders = 0; try { storedOrders = JSON.parse(store.getItem(K2.orders) || '[]').length; } catch(e){}
        fire({'data-s2':'co-confirm'});
        out.push({name:'Handler penuh — checkout: klik “Konfirmasi Pesanan” (paket Signature untuk template Premium) diproses handler co-confirm asli -> DITOLAK, tidak ada pesanan tercipta di storage', pass: !S2.orders.some(o => o.invitationId === fxInv.id) && S2.orders.length === storedOrders});
        /* (H2) Pembatalan lewat handler order-cancel ASLI + modal asli,
           dengan storage untuk koleksi orders dibuat GAGAL lewat
           override setItem sesaat: status tidak boleh tampil Dibatalkan
           — memori dan storage tetap status asal. */
        const fxOrder = {id:'fx-o-hdl', number:'KI-FX-900', invitationId:fxInv.id, customerId:'cust-1', packageId:'premium', packageName:'Premium', price:59000, discount:0, couponCode:null, total:59000, status:'Menunggu Pembayaran', paymentStatus:'Pending', createdAt:Date.now()};
        S2.orders.unshift(fxOrder); saveColl('orders');
        S2.payments.push({id:'fx-p-hdl', orderId:fxOrder.id, invitationId:fxInv.id, method:'QRIS', status:'Pending', amount:59000, code:'QRIS-SIM-FX', createdAt:Date.now(), paidAt:null}); saveColl('payments');
        fire({'data-s2':'order-cancel', 'data-id':fxOrder.id});
        const modalOk = document.querySelector('#s2-modal-ok');
        let cancelPass = false;
        if (modalOk){
          const origSet = Storage.prototype.setItem;
          Storage.prototype.setItem = function(k, v){ if (k === K2.orders) throw new Error('quota-fixture'); return origSet.call(this, k, v); };
          try { modalOk.click(); } finally { Storage.prototype.setItem = origSet; }
          const memSt = (S2.orders.find(o => o.id === fxOrder.id) || {}).status;
          let stoSt = null; try { stoSt = (JSON.parse(store.getItem(K2.orders) || '[]').find(o => o.id === fxOrder.id) || {}).status; } catch(e){}
          cancelPass = memSt === 'Menunggu Pembayaran' && stoSt === 'Menunggu Pembayaran';
        }
        out.push({name:'Handler penuh — pembatalan: klik “Batalkan” + konfirmasi modal asli dengan penyimpanan orders GAGAL -> handler memulihkan status; memori & storage tetap “Menunggu Pembayaran” (tidak ada status batal palsu)', pass: cancelPass});
        /* (H3) Pembayaran Success lewat handler pay-result ASLI:
           rekonsiliasi di dalam handler yang sama hanya memajukan
           proyek yang order + undangannya sama; proyek lintas undangan
           dengan orderId yang sama TIDAK ikut maju. */
        const svcMatch = {id:'fx-svc-hdl', number:'REQ-FX-1', customerId:'cust-1', title:'Fixture Layanan', status:'New', designerId:null, revisions:[], internalNotes:[], invitationId:fxInv.id, orderId:fxOrder.id, createdAt:Date.now(), updatedAt:Date.now()};
        const svcCross = {id:'fx-svc-hdl2', number:'REQ-FX-2', customerId:'cust-1', title:'Fixture Layanan Silang', status:'New', designerId:null, revisions:[], internalNotes:[], invitationId:'fx-inv-lain', orderId:fxOrder.id, createdAt:Date.now(), updatedAt:Date.now()};
        S2.services.unshift(svcMatch, svcCross); saveColl('services');
        fire({'data-s2':'pay-result', 'data-id':fxOrder.id, 'data-res':'Success'});
        const oAfter = S2.orders.find(o => o.id === fxOrder.id) || {};
        const sM = S2.services.find(s => s.id === svcMatch.id) || {};
        const sC = S2.services.find(s => s.id === svcCross.id) || {};
        out.push({name:'Handler penuh — pembayaran: klik “Pembayaran Berhasil” diproses handler pay-result asli -> pesanan Success, packageId undangan = paket pesanan (premium), proyek se-undangan New -> Paid', pass: oAfter.paymentStatus === 'Success' && fxInv.packageId === 'premium' && sM.status === 'Paid'});
        out.push({name:'Handler penuh — rekonsiliasi: proyek dengan orderId sama tetapi UNDANGAN BERBEDA tetap New pada handler pay-result yang sama (bukti harus tertaut ke order + undangan yang sama)', pass: sC.status === 'New'});
        /* (H4) RSVP lewat listener submit ASLI pada rute publik
           undangan fixture: submit pertama membuat tamu + RSVP dengan
           nama snapshot; submit ulang dari perangkat yang sama
           memperbarui record yang sama (identitas token perangkat),
           bukan duplikat. Hash dipulihkan tanpa event (replaceState). */
        fxInv.status = 'published'; fxInv.publishedAt = Date.now();
        location.hash = '#/u/fx-handler';
        const mkForm = (st, cnt, msg) => { const f = document.createElement('form'); f.setAttribute('data-rsvp-form', ''); f.innerHTML = '<input name="name" value="Nama Uji Handler"><input name="count" value="' + cnt + '"><textarea name="message">' + msg + '</textarea><div data-seg><button type="button" class="on" data-val="' + st + '">x</button></div>'; document.body.appendChild(f); return f; };
        const f1 = mkForm('Hadir', '2', 'Halo dari handler');
        f1.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
        const gH = S2.guests.find(g => g.invitationId === fxInv.id);
        const rH = gH ? S2.rsvps.find(r => r.guestId === gH.id) : null;
        out.push({name:'Handler penuh — RSVP: submit formulir asli di rute publik -> tamu + record RSVP tercipta lewat listener submit asli; nama snapshot, status, jumlah tersimpan', pass: !!gH && !!rH && rH.name === 'Nama Uji Handler' && rH.status === 'Hadir' && rH.count === 2 && gH.rsvpStatus === 'Hadir'});
        const f2 = mkForm('Tidak Hadir', '0', '');
        f2.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
        const guestsFx = S2.guests.filter(g => g.invitationId === fxInv.id);
        const rH2 = guestsFx.length === 1 ? S2.rsvps.find(r => r.guestId === guestsFx[0].id) : null;
        out.push({name:'Handler penuh — RSVP: submit ulang dari perangkat yang sama -> record yang sama diperbarui (tetap 1 tamu & 1 RSVP untuk undangan ini), status baru tersimpan', pass: guestsFx.length === 1 && !!rH2 && rH2.status === 'Tidak Hadir' && S2.rsvps.filter(r => r.invitationId === fxInv.id).length === 1});
        f1.remove(); f2.remove();
        try { history.replaceState(null, '', origHash); } catch(e){ location.hash = origHash; }
        /* (H5) v19 — ORDER LAMA MISMATCH TIER lewat handler pay-result
           ASLI: undangan fixture bertemplate Basic (Confetti Pop v1)
           dengan pesanan Pending Premium (pola pesanan lama sebelum
           checkout dikunci). Klik “Pembayaran Berhasil” -> hasil
           DITAHAN: status pembayaran tetap Pending, packageId undangan
           tetap kosong, record pembayaran tetap Pending, snapshot
           pesanan TIDAK ditulis ulang — pesanan hanya ditandai
           needsNewOrder untuk dibuat ulang dengan paket yang benar. */
        const fxInv2 = {id:'fx-inv-hdl2', templateId:'confetti-pop', templateVersion:1, slug:'fx-handler-2', title:'Fixture Tier Lama', categoryId:'ulang-tahun', status:'draft', ownerId:'cust-1', archived:false, packageId:null, content:{}, design:{}, sections:{}, createdAt:Date.now(), updatedAt:Date.now(), publishedAt:null};
        S.invitations.push(fxInv2);
        const fxOrder2 = {id:'fx-o-hdl2', number:'KI-FX-901', invitationId:fxInv2.id, customerId:'cust-1', packageId:'premium', packageName:'Premium', price:59000, discount:0, couponCode:null, total:59000, status:'Menunggu Pembayaran', paymentStatus:'Pending', createdAt:Date.now()};
        S2.orders.unshift(fxOrder2); saveColl('orders');
        S2.payments.push({id:'fx-p-hdl2', orderId:fxOrder2.id, invitationId:fxInv2.id, method:'Virtual Account', status:'Pending', amount:59000, code:'8808 5555 6666', createdAt:Date.now(), paidAt:null, attempt:1}); saveColl('payments');
        fire({'data-s2':'pay-result', 'data-id':fxOrder2.id, 'data-res':'Success'});
        const oHeld = S2.orders.find(o => o.id === fxOrder2.id) || {};
        const pHeld = S2.payments.find(p => p.id === 'fx-p-hdl2') || {};
        out.push({name:'Handler penuh — gerbang tier order lama: klik “Pembayaran Berhasil” pada pesanan Premium untuk undangan template Basic -> hasil DITAHAN oleh handler pay-result asli (paket salah tidak aktif, histori tidak ditulis ulang)', pass: oHeld.paymentStatus === 'Pending' && fxInv2.packageId === null && oHeld.needsNewOrder === true && oHeld.packageId === 'premium' && oHeld.total === 59000 && pHeld.status === 'Pending', exp:'paymentStatus=Pending; packageId undangan=null; needsNewOrder=true; snapshot pesanan premium/59000 utuh; record pembayaran tetap Pending', act:'paymentStatus=' + oHeld.paymentStatus + '; packageId undangan=' + fxInv2.packageId + '; needsNewOrder=' + oHeld.needsNewOrder + '; snapshot=' + oHeld.packageId + '/' + oHeld.total + '; pembayaran=' + pHeld.status});
        /* (H6) v19 — DUA ORANG, SATU PERAMBAN, tanpa kode tamu, lewat
           handler ASLI: klik tombol “Isi sebagai tamu lain” (handler
           klik yang sama dengan klik pengguna) membuat identitas
           responden baru; submit orang kedua membuat record tamu +
           RSVP SENDIRI dan TIDAK menimpa record orang pertama (H4);
           klik “Ubah Respons” + submit ulang orang kedua memperbarui
           record orang kedua saja. */
        location.hash = '#/u/fx-handler';
        const zone6 = document.createElement('div');
        zone6.setAttribute('data-rsvp-zone', '');
        zone6.innerHTML = rsvpFormHTML({mode:'public', existingRsvp:{name:'Nama Uji Handler', status:'Tidak Hadir', count:0, message:''}, webIdentity:true});
        document.body.appendChild(zone6);
        let secondOk = false, resubOk = false, actSecond = '', actResub = '';
        const newBtn = zone6.querySelector('[data-rsvp-new-person]');
        if (newBtn){
          newBtn.click();
          const form6 = zone6.querySelector('form[data-rsvp-form]');
          if (form6){
            form6.querySelector('input[name="name"]').value = 'Tamu Kedua Handler';
            form6.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
            const gs6 = S2.guests.filter(g => g.invitationId === fxInv.id);
            const gFirst = gs6.find(g => g.name === 'Nama Uji Handler');
            const gSecond = gs6.find(g => g.name === 'Tamu Kedua Handler');
            const rFirst = gFirst ? S2.rsvps.find(r => r.guestId === gFirst.id) : null;
            const rSecond = gSecond ? S2.rsvps.find(r => r.guestId === gSecond.id) : null;
            secondOk = gs6.length === 2 && !!rFirst && rFirst.status === 'Tidak Hadir' && !!rSecond && rSecond.status === 'Hadir';
            actSecond = 'tamu=' + gs6.length + '; rsvp orang1=' + (rFirst ? rFirst.status : 'null') + '; rsvp orang2=' + (rSecond ? rSecond.status : 'null');
            const editBtn = zone6.querySelector('[data-rsvp-edit]');
            if (editBtn){
              editBtn.click();
              const form6b = zone6.querySelector('form[data-rsvp-form]');
              if (form6b){
                const segNo = form6b.querySelector('[data-seg] button[data-val="Tidak Hadir"]');
                if (segNo) segNo.click();
                form6b.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
                const gs6b = S2.guests.filter(g => g.invitationId === fxInv.id);
                const rFirst2 = gFirst ? S2.rsvps.find(r => r.guestId === gFirst.id) : null;
                const rSecond2 = gSecond ? S2.rsvps.find(r => r.guestId === gSecond.id) : null;
                resubOk = gs6b.length === 2 && !!rSecond2 && rSecond2.status === 'Tidak Hadir' && !!rFirst2 && rFirst2.status === 'Tidak Hadir' && S2.rsvps.filter(r => r.invitationId === fxInv.id).length === 2;
                actResub = 'tamu=' + gs6b.length + '; rsvp orang2=' + (rSecond2 ? rSecond2.status : 'null') + '; total rsvp undangan=' + S2.rsvps.filter(r => r.invitationId === fxInv.id).length;
              }
            }
          }
        }
        out.push({name:'Handler penuh — RSVP dua tamu satu peramban: klik “Isi sebagai tamu lain” + submit orang kedua lewat handler asli -> record tamu + RSVP terpisah; record orang pertama TIDAK tertimpa', pass: secondOk, exp:'tamu=2; rsvp orang1=Tidak Hadir (utuh); rsvp orang2=Hadir', act: actSecond || 'tombol/handler tidak ditemukan'});
        out.push({name:'Handler penuh — RSVP dua tamu: “Ubah Respons” + submit ulang orang kedua memperbarui record orang kedua saja (tetap 2 tamu & 2 RSVP)', pass: resubOk, exp:'tamu=2; rsvp orang2=Tidak Hadir; total rsvp undangan=2', act: actResub || 'alur ubah respons tidak ditemukan'});
        zone6.remove();
        try { history.replaceState(null, '', origHash); } catch(e){ location.hash = origHash; }
        /* (H7) v19 — KODE PEMBAYARAN STABIL per percobaan lewat handler
           pay-result ASLI + baca ulang koleksi (simulasi reload): kode
           percobaan aktif tidak berubah; hasil Failed menutup
           percobaan 1; hasil Success berikutnya membuat percobaan 2
           berkode BARU, percobaan 1 tetap Failed sebagai riwayat. */
        const fxOrder3 = {id:'fx-o-hdl3', number:'KI-FX-902', invitationId:fxInv.id, customerId:'cust-1', packageId:'premium', packageName:'Premium', price:59000, discount:0, couponCode:null, total:59000, status:'Menunggu Pembayaran', paymentStatus:'Pending', createdAt:Date.now()};
        S2.orders.unshift(fxOrder3); saveColl('orders');
        S2.payments.push({id:'fx-p-hdl3', orderId:fxOrder3.id, invitationId:fxInv.id, method:'Virtual Account', status:'Pending', amount:59000, code:'8808 1111 2222', createdAt:Date.now(), paidAt:null, attempt:1}); saveColl('payments');
        const codeBefore = (kiActivePayment(fxOrder3.id) || {}).code;
        kiRefreshCollections();
        const codeAfterReload = (kiActivePayment(fxOrder3.id) || {}).code;
        fire({'data-s2':'pay-result', 'data-id':fxOrder3.id, 'data-res':'Failed'});
        fire({'data-s2':'pay-result', 'data-id':fxOrder3.id, 'data-res':'Success'});
        const pays3 = S2.payments.filter(p => p.orderId === fxOrder3.id);
        const att1 = pays3.find(p => p.id === 'fx-p-hdl3') || {};
        const active3 = kiActivePayment(fxOrder3.id) || {};
        const o3 = S2.orders.find(o => o.id === fxOrder3.id) || {};
        out.push({name:'Handler penuh — kode pembayaran: kode percobaan aktif stabil sebelum & sesudah baca ulang koleksi; Failed menutup percobaan 1; Success berikutnya membuat percobaan 2 berkode BARU (percobaan lama tetap Failed)', pass: codeBefore === '8808 1111 2222' && codeAfterReload === codeBefore && att1.status === 'Failed' && pays3.length === 2 && active3.id !== 'fx-p-hdl3' && !!active3.code && active3.code !== '8808 1111 2222' && active3.attempt === 2 && o3.paymentStatus === 'Success', exp:'kode stabil 8808 1111 2222; percobaan1=Failed; percobaan2 aktif berkode baru (attempt=2); pesanan Success', act:'kode=' + codeBefore + ' -> ' + codeAfterReload + '; percobaan1=' + att1.status + '; total record=' + pays3.length + '; aktif attempt=' + active3.attempt + ' kode=' + active3.code + '; pesanan=' + o3.paymentStatus});
      } catch(e){ out.push({name:'Uji handler penuh (event nyata)', pass:false}); }
      S.invitations = S.invitations.filter(i => i.id !== 'fx-inv-hdl' && i.id !== 'fx-inv-hdl2');
      Object.assign(CO, coBak);
      S2.role = roleBak;
      restoreStore();
      kiRefreshCollections();
      const isoOk = store ? Object.keys(dump).every(k => store.getItem(k) === dump[k]) : false;
      out.push({name:'Handler penuh — isolasi: storage pulih byte-per-byte sesudah suite handler; peran & state checkout dipulihkan; tidak ada record fixture tertinggal di koleksi maupun daftar undangan', pass: isoOk && S2.role === roleBak && !S2.orders.some(o => o.id === 'fx-o-hdl' || o.id === 'fx-o-hdl2' || o.id === 'fx-o-hdl3') && !S2.services.some(s => s.id === 'fx-svc-hdl' || s.id === 'fx-svc-hdl2') && !S2.guests.some(g => g.invitationId === 'fx-inv-hdl' || g.invitationId === 'fx-inv-hdl2') && !S.invitations.some(i => i.id === 'fx-inv-hdl' || i.id === 'fx-inv-hdl2')});
      return out;
    }
