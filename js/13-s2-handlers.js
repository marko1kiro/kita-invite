    /* ---------- Handler Stage 2 ---------- */
    function rerender2(){ const { seg } = parseHash(); if (['dashboard','admin','desainer','checkout','bayar','faktur'].includes(seg[0])) s2Render(); else render(); }
    function deleteInvitationCascade(inv){
      /* Hapus undangan = operasi ATOMIK lintas koleksi: snapshot dulu,
         SEMUA penulisan diperiksa hasilnya, dan satu saja gagal ->
         seluruh koleksi (termasuk record undangan di storage)
         dipulihkan dan ditulis kembali sebelum hasil dilaporkan. Tidak
         ada tamu/RSVP yatim dan tidak ada penghapusan parsial yang
         tertinggal sesudah reload. */
      const gSnap = S2.guests.slice(), rSnap = S2.rsvps.slice(), aSnap = S2.activity.slice();
      const ix = S.invitations.findIndex(i => i.id === inv.id);
      if (ix >= 0) S.invitations.splice(ix, 1);
      S2.guests = S2.guests.filter(g => g.invitationId !== inv.id);
      S2.rsvps = S2.rsvps.filter(r => r.invitationId !== inv.id);
      let ok = saveColl('guests'); ok = saveColl('rsvps') && ok;
      const st = storageBackend(); let okInv = false;
      if (st){ try { st.removeItem(INV_KEY_PREFIX + inv.id); st.setItem(INV_INDEX_KEY, JSON.stringify(S.invitations.map(i => i.id))); okInv = st.getItem(INV_KEY_PREFIX + inv.id) === null; } catch(e){ okInv = false; } }
      ok = okInv && ok;
      if (ok) ok = logAct('Undangan “' + inv.title + '” dihapus beserta tamu & RSVP-nya.', 'customer', inv.ownerId || CURRENT_USER);
      if (!ok){
        if (ix >= 0) S.invitations.splice(ix, 0, inv);
        /* v21: pemulihan multi-koleksi ditulis balik dan DIPERIKSA
           (kiRollbackCollections + persistensi record undangan) —
           rollbackOk=false berarti pemulihan tidak terverifikasi dan
           dilaporkan apa adanya oleh pemanggil, bukan diklaim pulih. */
        const rbOk = kiRollbackCollections({guests:gSnap, rsvps:rSnap, activity:aSnap});
        const okInvRb = persistInvitationNow(inv);
        return {ok:false, rollbackOk: rbOk && okInvRb};
      }
      return {ok:true, rollbackOk:true};
    }
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-s2]');
      if (!el) return;
      const act = el.dataset.s2, id = el.dataset.id;
      /* Gerbang peran di handler (v13): aksi Admin hanya untuk peran admin,
         apa pun URL/tombol yang dipakai untuk mencapainya. */
      if (act === 'admin-write-toggle'){
        if (!adminGuard('Izin Tulis Admin')) return;
        if (kiAdminWriteOn()){ window.__kiAdminWrite = false; toast('Izin tulis Admin dimatikan — kembali ke mode inspeksi.'); rerender2(); return; }
        showModal({title:'Aktifkan izin tulis Admin?', confirmLabel:'Ya, Aktifkan Izin Tulis', body:'Dengan izin ini, perubahan Admin pada data <b>milik akun lain</b> akan diizinkan di handler dan disimpan, untuk sesi ini saja. Tanpa izin ini Admin hanya dapat memeriksa (mode inspeksi).', onConfirm:() => { window.__kiAdminWrite = true; toast('Izin tulis Admin aktif untuk sesi ini.'); rerender2(); }});
        return;
      }
      if (['tpl-new','tpl-status','tf-thumb','coupon-toggle'].includes(act) && !adminGuard('Admin')) return;
      /* Undangan */
      if (act === 'inv-filter'){ D2.invFilter = id; rerender2(); return; }
      if (act === 'inv-duplicate'){
        const src = S.invitations.find(i => i.id === id); if (!src) return;
        if (!ownGuard(src)) return;
        const copy = structuredClone(src);
        copy.id = 'inv-' + (S.seq++); copy.title = src.title + ' (Salinan)'; copy.status = 'draft'; copy.slug = null; copy.publishedAt = null; copy.archived = false; copy.createdAt = Date.now(); copy.updatedAt = Date.now();
        S.invitations.unshift(copy);
        if (!persistInvitationNow(copy)){ S.invitations = S.invitations.filter(i => i.id !== copy.id); toast('Duplikat GAGAL disimpan — tidak ada salinan yang dibuat.', true); rerender2(); return; }
        logAct('Undangan diduplikat: ' + copy.title, 'customer', copy.ownerId || CURRENT_USER); toast('Duplikat dibuat: ' + copy.title); rerender2(); return;
      }
      if (act === 'inv-archive' || act === 'inv-unarchive'){
        const inv = S.invitations.find(i => i.id === id); if (!inv) return;
        if (!ownGuard(inv)) return;
        const prevArc = inv.archived, prevUpd = inv.updatedAt;
        inv.archived = act === 'inv-archive'; inv.updatedAt = Date.now();
        if (!persistInvitationNow(inv)){ inv.archived = prevArc; inv.updatedAt = prevUpd; toast('Perubahan arsip GAGAL disimpan — status undangan tidak berubah.', true); rerender2(); return; }
        logAct('Undangan “' + inv.title + '” ' + (inv.archived ? 'diarsipkan.' : 'dikeluarkan dari arsip.'), 'customer', inv.ownerId || CURRENT_USER); toast(inv.archived ? 'Undangan diarsipkan' : 'Arsip dibatalkan'); rerender2(); return;
      }
      if (act === 'inv-delete'){
        const inv = S.invitations.find(i => i.id === id); if (!inv) return;
        if (!ownGuard(inv)) return;
        showModal({title:'Hapus undangan ini?', danger:true, confirmLabel:'Ya, Hapus Permanen', body:'Undangan <b>' + esc(inv.title) + '</b> beserta seluruh tamu dan RSVP-nya akan dihapus permanen dari perangkat ini. Pesanan lama tetap tersimpan sebagai riwayat. Tindakan ini tidak dapat dibatalkan.', onConfirm:() => { if (!ownGuard(inv)) return; const del = deleteInvitationCascade(inv); if (!del.ok){ toast(del.rollbackOk ? 'Penghapusan GAGAL disimpan — seluruh data undangan, tamu, dan RSVP dikembalikan seperti semula (tidak ada penghapusan parsial).' : 'Penghapusan GAGAL disimpan dan rollback persisten TIDAK terverifikasi — muat ulang halaman dan periksa daftar undangan sebelum mencoba lagi.', true); rerender2(); return; } toast('Undangan dihapus'); rerender2(); }});
        return;
      }
      /* Tamu */
      if (act === 'guest-edit'){ D2.guestEdit = id; rerender2(); return; }
      if (act === 'guest-edit-cancel'){ D2.guestEdit = null; rerender2(); return; }
      if (act === 'guest-del'){
        const g = S2.guests.find(x => x.id === id); if (!g) return;
        if (!ownGuard(S.invitations.find(i => i.id === g.invitationId))) return;
        showModal({title:'Hapus tamu ini?', danger:true, confirmLabel:'Ya, Hapus', body:'Tamu <b>' + esc(g.name) + '</b> dan respons RSVP-nya akan dihapus dari undangan ini.', onConfirm:() => {
          /* Guard diuji ulang DI DALAM konfirmasi, dan penghapusan
             bersifat atomik: kedua koleksi diperiksa hasil simpannya —
             satu gagal, keduanya dipulihkan dan ditulis kembali. */
          if (!ownGuard(S.invitations.find(i => i.id === g.invitationId))) return;
          const gSnap = S2.guests.slice(), rSnap = S2.rsvps.slice();
          S2.guests = S2.guests.filter(x => x.id !== id);
          S2.rsvps = S2.rsvps.filter(r => r.guestId !== id);
          let okDel = saveColl('guests'); okDel = saveColl('rsvps') && okDel;
          if (!okDel){ const rbOk = kiRollbackCollections({guests:gSnap, rsvps:rSnap}); toast(rbOk ? 'Penghapusan tamu GAGAL disimpan — tamu dan RSVP-nya dikembalikan seperti semula (tidak ada penghapusan parsial).' : 'Penghapusan tamu GAGAL disimpan dan rollback persisten TIDAK terverifikasi — muat ulang halaman dan periksa daftar tamu sebelum mencoba lagi.', true); rerender2(); return; }
          D2.guestSel.delete(id); toast('Tamu dihapus'); rerender2();
        }}); return;
      }
      if (act === 'guest-bulk-del'){
        if (!D2.guestSel.size) return;
        if (!ownGuard(S.invitations.find(i => i.id === D2.guestInv))) return;
        const n = D2.guestSel.size;
        showModal({title:'Hapus ' + n + ' tamu terpilih?', danger:true, confirmLabel:'Ya, Hapus ' + n + ' Tamu', body:'Hanya tamu yang Anda centang pada undangan ini yang dihapus, beserta RSVP-nya. Tamu undangan lain tidak terpengaruh.', onConfirm:() => {
          const inv2 = S.invitations.find(i => i.id === D2.guestInv); if (!inv2 || !ownGuard(inv2)) return;
          /* Scope keras invitationId: HANYA tamu yang benar-benar milik
             undangan aktif ini yang terhapus. ID tamu undangan lain yang
             terselip di pilihan (state basi / dibuat manual) diabaikan —
             dan penghapusan berjalan atomik dengan rollback persisten. */
          const targetIds = new Set(S2.guests.filter(g => D2.guestSel.has(g.id) && g.invitationId === inv2.id).map(g => g.id));
          if (!targetIds.size){ toast('Tidak ada tamu dari undangan ini yang terpilih — tidak ada yang dihapus.', true); rerender2(); return; }
          const gSnap = S2.guests.slice(), rSnap = S2.rsvps.slice();
          S2.guests = S2.guests.filter(g => !targetIds.has(g.id));
          S2.rsvps = S2.rsvps.filter(r => !targetIds.has(r.guestId));
          let okDel = saveColl('guests'); okDel = saveColl('rsvps') && okDel;
          if (!okDel){ const rbOk = kiRollbackCollections({guests:gSnap, rsvps:rSnap}); toast(rbOk ? 'Penghapusan massal GAGAL disimpan — seluruh tamu dan RSVP dikembalikan (tidak ada penghapusan parsial).' : 'Penghapusan massal GAGAL disimpan dan rollback persisten TIDAK terverifikasi — muat ulang halaman dan periksa daftar tamu sebelum mencoba lagi.', true); rerender2(); return; }
          D2.guestSel.clear(); toast(targetIds.size + ' tamu dihapus'); rerender2();
        }}); return;
      }
      if (act === 'bulk-preview'){
        const txt = ($('#s2-bulk-text') || {}).value || '';
        const valid = [], errors = [];
        txt.split('\n').map(s => s.trim()).filter(Boolean).forEach((line, i) => {
          const parts = line.split(';').map(s => s.trim());
          if (!parts[0]) errors.push('Baris ' + (i + 1) + ': nama kosong.');
          else if (parts[0].length > 80) errors.push('Baris ' + (i + 1) + ': nama terlalu panjang.');
          else valid.push({name:parts[0], group:parts[1] || 'Lainnya', contact:parts[2] || ''});
        });
        if (!valid.length && !errors.length) errors.push('Belum ada baris yang ditulis.');
        D2.bulkPreview = {valid, errors}; rerender2(); return;
      }
      if (act === 'bulk-import'){
        const inv = S.invitations.find(i => i.id === D2.guestInv); if (!inv || !D2.bulkPreview) return;
        if (!ownGuard(inv)) return;
        const beforeIds = new Set(S2.guests.map(x => x.id));
        /* Dedupe dengan ID STABIL: ID tamu impor diturunkan deterministik
           dari undangan + nama + grup + kontak (kiImportGuests). Baris
           yang ID-nya sudah terdaftar — impor yang sama dijalankan ulang
           atau baris ganda dalam satu impor — DILEWATI, jadi impor tidak
           pernah menggandakan tamu. */
        const imp = kiImportGuests(S2.guests, inv.id, D2.bulkPreview.valid);
        imp.added.forEach(g => S2.guests.push(g));
        const n = imp.added.length;
        if (!saveColl('guests')){
          /* Impor gagal tersimpan: cabut kembali baris impor dari state agar
             tampilan tidak menampilkan tamu yang sebenarnya tidak tersimpan. */
          S2.guests = S2.guests.filter(x => beforeIds.has(x.id));
          toast('Impor gagal disimpan — tidak ada tamu yang ditambahkan (penyimpanan penuh?). Pratinjau impor dipertahankan, coba lagi setelah mengosongkan ruang.', true); rerender2(); return;
        }
        D2.bulkPreview = null;
        if (n) logAct(n + ' tamu diimpor massal ke “' + inv.title + '”' + (imp.skipped.length ? ' (' + imp.skipped.length + ' baris duplikat dilewati)' : '') + '.', 'customer', inv.ownerId || CURRENT_USER);
        toast(n ? n + ' tamu berhasil diimpor' + (imp.skipped.length ? ' — ' + imp.skipped.length + ' baris duplikat dilewati (ID stabil sudah terdaftar)' : '') : 'Semua baris adalah duplikat dari tamu yang sudah terdaftar — tidak ada tamu baru (dedupe ID stabil).'); rerender2(); return;
      }
      /* Moderasi ucapan — "Hapus Ucapan" hanya mengosongkan pesan; record
         RSVP dan jawaban kehadiran tamu tetap tersimpan. */
      if (act === 'mod'){
        const r = S2.rsvps.find(x => x.id === id); if (!r) return;
        if (!ownGuard(S.invitations.find(i => i.id === r.invitationId))) return;
        const prevMsg = r.message, prevMod = r.moderation;
        const isDelete = el.dataset.act === 'delete';
        if (isDelete){ r.message = ''; r.moderation = 'approved'; }
        else { r.moderation = el.dataset.act; }
        if (!saveColl('rsvps')){
          /* Simpan gagal: kembalikan record seperti semula dan jangan beri
             konfirmasi sukses — tampilan tidak boleh berbohong soal status
             moderasi yang sebenarnya tersimpan. */
          r.message = prevMsg; r.moderation = prevMod;
          toast('Gagal menyimpan perubahan moderasi — status ucapan tidak berubah.', true); rerender2(); return;
        }
        toast(isDelete ? 'Ucapan dihapus — jawaban kehadiran ' + r.name + ' tetap tersimpan' : el.dataset.act === 'approved' ? 'Ucapan disetujui — tampil di halaman publik' : 'Ucapan disembunyikan dari halaman publik');
        rerender2(); return;
      }
      /* Pesanan & checkout */
      if (act === 'order-cancel'){
        kiRefreshCollections();
        const o = S2.orders.find(x => x.id === id); if (!o) return;
        if (!orderGuard(o)) return;
        /* Transisi pembatalan eksplisit & idempoten: pesanan yang sudah
           Dibatalkan tetap Dibatalkan; pesanan yang pembayarannya sudah
           Success tidak dapat dibatalkan dari jalur ini. */
        if (o.status === 'Dibatalkan'){ toast('Pesanan ' + o.number + ' sudah berstatus Dibatalkan (terminal) — tidak ada perubahan.', true); rerender2(); return; }
        if (o.paymentStatus === 'Success'){ toast('Pesanan ' + o.number + ' sudah lunas (Success) — pembatalan tidak dapat diterapkan pada pesanan yang sudah dibayar.', true); rerender2(); return; }
        showModal({title:'Batalkan pesanan ' + o.number + '?', danger:true, confirmLabel:'Ya, Batalkan Pesanan', body:'Status pesanan berubah menjadi <b>Dibatalkan</b> — status terminal: pembayaran tidak lagi ditawarkan dan hasil pembayaran apa pun tidak dapat menghidupkannya kembali. Record pembayaran simulasi tetap tersimpan sebagai riwayat.', onConfirm:() => { const cr = kiCancelOrderCore(o, saveColl); if (!cr.ok){ toast(cr.rollbackOk ? 'Pembatalan GAGAL disimpan — status pesanan TIDAK berubah: status sebelum pembatalan dipulihkan di memori dan penyimpanan, jadi tidak ada status batal palsu.' : 'Pembatalan GAGAL disimpan dan rollback persisten TIDAK terverifikasi — status yang tampil mungkin belum sama dengan yang tersimpan; muat ulang halaman untuk melihat status sebenarnya sebelum mencoba lagi.', true); rerender2(); return; } logAct('Pesanan ' + o.number + ' dibatalkan.', 'customer', o.customerId); toast('Pesanan dibatalkan'); rerender2(); }});
        return;
      }
      if (act === 'order-done'){ const o = S2.orders.find(x => x.id === id); if (o && orderGuard(o)){ const prevOs = o.status; o.status = 'Selesai'; if (!saveColl('orders')){ o.status = prevOs; saveColl('orders'); toast('Gagal menyimpan — status pesanan tidak berubah.', true); } else toast('Pesanan ' + o.number + ' ditandai selesai'); rerender2(); } return; }
      if (act === 'co-pkg'){ const invPk = S.invitations.find(i => i.id === CO.invId); const lkPk = invPk ? kiTemplatePackage(invPk) : null; if (!lkPk){ toast('Paket tidak dapat dipilih: tier template undangan ini tidak dapat dibuktikan dari versi template yang dipakai — checkout ditahan sampai tier dapat dibuktikan.', true); rerender2(); return; } if (lkPk && id !== lkPk.id){ toast('Paket terkunci ke tier template undangan ini (' + lkPk.name + ') — pilihan paket lain ditolak di handler, bukan hanya di tampilan.', true); rerender2(); return; } CO.pkgId = id; rerender2(); return; }
      if (act === 'co-method'){ CO.method = id; rerender2(); return; }
      if (act === 'co-coupon-apply'){
        const code = (($('#co-coupon') || {}).value || '').trim().toUpperCase();
        CO.couponCode = code;
        const c = S2.coupons.find(x => x.code === code && x.active);
        CO.coupon = c || null;
        toast(c ? 'Kupon ' + code + ' aktif: diskon ' + c.pct + '%' : 'Kupon tidak ditemukan atau sudah nonaktif', !c);
        rerender2(); return;
      }
      if (act === 'co-confirm'){
        kiRefreshCollections(); /* jangan menimpa pesanan terbaru dari tab lain */
        const inv = S.invitations.find(i => i.id === CO.invId); const pkg = pkgById(CO.pkgId); if (!inv || !pkg) return;
        if (!ownGuard(inv)) return;
        /* v18: KUNCI PAKET DI HANDLER — paket & harga yang dikonfirmasi
           WAJIB sama dengan paket tier template undangan ini
           (kiCheckoutValidate). State checkout yang basi/dibuat manual
           dengan paket atau harga lain DITOLAK di sini dan tidak ada
           pesanan yang tercipta; UI yang menonaktifkan pilihan lain
           hanyalah lapisan pertama. */
        const lockChk = kiCheckoutValidate(inv, pkg.id, pkg.price);
        if (!lockChk.ok){ toast('Checkout DITOLAK di handler: ' + lockChk.reason, true); rerender2(); return; }
        const disc = CO.coupon ? Math.round(pkg.price * CO.coupon.pct / 100) : 0;
        /* Idempotensi checkout: konfirmasi ganda (klik dua kali / dua tab)
           untuk undangan + paket + total yang sama dalam waktu singkat
           tidak membuat pesanan kedua. */
        if (CO._lock && Date.now() - CO._lock.t < 5000 && CO._lock.inv === inv.id && CO._lock.pkg === pkg.id && CO._lock.total === pkg.price - disc){
          toast('Pesanan yang sama baru saja dibuat (' + CO._lock.num + ') — konfirmasi ganda diabaikan.', true); go('#/bayar/' + CO._lock.id); return;
        }
        const num = 'KI-2026-' + (1000 + S2.orders.length + 1 + Math.floor(Math.random() * 40));
        const o = {id:uid2('order'), number:num, invitationId:inv.id, customerId:CURRENT_USER, packageId:pkg.id, packageName:pkg.name, price:pkg.price, discount:disc, couponCode:CO.coupon ? CO.coupon.code : null, total:pkg.price - disc, status:'Menunggu Pembayaran', paymentStatus:'Pending', createdAt:Date.now()};
        const actBefore = S2.activity.slice(), ntfBefore = S2.notifications.slice();
        S2.orders.unshift(o);
        S2.payments.push({id:uid2('pay'), orderId:o.id, invitationId:o.invitationId, method:CO.method, status:'Pending', amount:o.total, code: CO.method === 'QRIS' ? 'QRIS-SIM-' + num : '8808 ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000), createdAt:Date.now(), paidAt:null, attempt:1}); /* v19: kode lahir satu kali pada pembuatan percobaan dan sesudah itu hanya dibaca dari record ini (kiActivePayment) — stabil selama percobaan aktif, termasuk setelah muat ulang */
        /* Harga pada pesanan adalah SNAPSHOT saat checkout: tersimpan di
           record pesanan dan tidak berubah walau harga paket diubah admin
           sesudahnya. Semua penulisan diperiksa hasilnya — satu gagal,
           seluruh pesanan dibatalkan dari state dan storage. */
        let okAll = saveColl('orders');
        okAll = saveColl('payments') && okAll;
        okAll = logAct('Pesanan ' + num + ' dibuat: paket ' + pkg.name + ' untuk “' + inv.title + '” (' + rp(o.total) + ', simulasi).', 'customer', inv.ownerId || CURRENT_USER) && okAll;
        okAll = notify2('Pesanan dibuat', num + ' menunggu pembayaran simulasi sebesar ' + rp(o.total) + '.', 'customer', inv.ownerId || CURRENT_USER) && okAll;
        if (!okAll){
          /* v21: pemulihan ditulis balik per koleksi dan HASILNYA
             diperiksa (kiRollbackCollections) — bila tulis-balik gagal,
             laporkan apa adanya, jangan klaim "tidak ada pesanan". */
          const rbOk = kiRollbackCollections({orders:S2.orders.filter(x => x.id !== o.id), payments:S2.payments.filter(x => x.orderId !== o.id), activity:actBefore, notifications:ntfBefore});
          toast(rbOk ? 'Pesanan GAGAL disimpan di perangkat ini — tidak ada pesanan yang dibuat. Kosongkan ruang penyimpanan lalu coba lagi.' : 'Pesanan GAGAL disimpan dan rollback persisten TIDAK terverifikasi — muat ulang halaman dan periksa daftar pesanan sebelum mencoba lagi.', true);
          rerender2(); return;
        }
        CO._lock = {t:Date.now(), inv:inv.id, pkg:pkg.id, total:o.total, num, id:o.id};
        toast('Pesanan ' + num + ' dibuat — lanjutkan pembayaran simulasi');
        go('#/bayar/' + o.id); return;
      }
      if (act === 'pay-result'){
        kiRefreshCollections(); /* transisi selalu dinilai dari state tersimpan terbaru, bukan salinan tab yang basi */
        const o = S2.orders.find(x => x.id === id); if (!o) return;
        if (!orderGuard(o)) return;
        /* Dibatalkan adalah status TERMINAL: hasil pembayaran simulasi apa
           pun — termasuk Success — ditolak dan tidak boleh menghidupkan
           pesanan kembali menjadi Diproses. */
        if (o.status === 'Dibatalkan'){ toast('Pesanan ' + o.number + ' sudah dibatalkan (status terminal) — hasil pembayaran tidak dapat diterapkan. Buat pesanan baru bila masih memerlukan paket ini.', true); rerender2(); return; }
        const res = el.dataset.res;
        /* Transisi pembayaran eksplisit & IDEMPOTEN: callback/hasil yang
           sama dengan status saat ini adalah duplikat — diakui tanpa
           mengubah apa pun dan tanpa aktivitas/notifikasi kedua. Success
           adalah status akhir pembayaran: hasil lain sesudahnya ditolak. */
        if (o.paymentStatus === res){ toast('Hasil “' + res + '” untuk pesanan ' + o.number + ' sudah tercatat sebelumnya — pengiriman ulang hasil yang sama diabaikan (idempoten), tidak ada perubahan atau catatan ganda.', true); rerender2(); return; }
        if (o.paymentStatus === 'Success'){ toast('Pesanan ' + o.number + ' sudah berstatus Success (terminal) — hasil “' + res + '” ditolak dan tidak mengubah apa pun.', true); rerender2(); return; }
        /* Hasil pembayaran hanya boleh memakai record pembayaran yang
           terhubung ke ORDER ini dan UNDANGAN yang sama — ketat, tanpa
           fallback legacy: record tanpa invitationId tidak pernah
           dipakai. Tanpa record yang cocok, hasil ditolak — status
           pesanan tidak ditebak. */
        let pay = S2.payments.filter(p => p.orderId === o.id && p.invitationId === o.invitationId).slice(-1)[0];
        if (!pay){ toast('Hasil pembayaran ditolak: tidak ada record pembayaran yang terhubung ke pesanan ' + o.number + ' dan undangannya. Tidak ada perubahan yang disimpan.', true); rerender2(); return; }
        /* v19 — GERBANG TIER UNTUK ORDER LAMA: hasil Success TIDAK
           boleh mengaktifkan paket yang tidak cocok dengan tier
           template VERSI undangan ini (kasus order Pending lama yang
           dibuat sebelum checkout dikunci, mis. pesanan Premium untuk
           undangan bertemplate Basic). Hasilnya DITAHAN: status
           pembayaran & pesanan tidak berubah, packageId undangan tidak
           ditulis, proyek layanan tidak maju — dan snapshot pesanan
           (paket/harga/total) TIDAK ditulis ulang. Pesanan hanya
           ditandai needsNewOrder agar pengguna membuat pesanan baru
           dengan paket yang benar lewat checkout. */
        if (res === 'Success'){
          const invGate = S.invitations.find(i => i.id === o.invitationId);
          const tg = kiOrderTierGate(o, invGate);
          /* v21: fail closed — tier yang TAK TERBUKTI juga ditahan,
             bukan diloloskan; expected bisa null, jadi teks memakai
             varian "tidak dapat dibuktikan". */
          if (tg.mismatch || tg.unresolved){
            const prevFlag = o.needsNewOrder, prevHold = o.tierHold;
            const expName = tg.expected ? tg.expected.name : null;
            o.needsNewOrder = true;
            o.tierHold = {expectedPackageId: tg.expected ? tg.expected.id : null, expectedPackageName: expName, orderPackageId: o.packageId, at: Date.now()};
            if (!saveColl('orders')){
              o.needsNewOrder = prevFlag; o.tierHold = prevHold; saveColl('orders');
              toast('Hasil pembayaran untuk pesanan ' + o.number + ' ditahan (paket tidak sesuai tier template), tetapi penanda pesanan GAGAL disimpan — tidak ada perubahan yang tercatat. Coba lagi setelah mengosongkan ruang penyimpanan.', true); rerender2(); return;
            }
            logAct('Hasil pembayaran ' + o.number + ' DITAHAN: ' + (expName ? 'paket pesanan (' + o.packageName + ') tidak sesuai tier template undangan (' + expName + ')' : 'tier template undangan tidak dapat dibuktikan') + ' — tidak ada paket yang diaktifkan; pesanan ditandai untuk dibuat ulang.', 'customer', o.customerId);
            toast(expName ? 'Pembayaran DITAHAN: pesanan ' + o.number + ' memakai paket ' + o.packageName + ', tetapi undangan ini memakai template tier ' + expName + '. Paket yang salah TIDAK diaktifkan dan riwayat pesanan tidak diubah — buat pesanan baru dengan paket ' + expName + ' lewat checkout.' : 'Pembayaran DITAHAN: tier template undangan untuk pesanan ' + o.number + ' tidak dapat dibuktikan dari versi template yang dipakai — paket TIDAK diaktifkan dan riwayat pesanan tidak diubah. Buat pesanan baru lewat checkout.', true);
            rerender2(); return;
          }
        }
        /* Snapshot pra-tulis SEMUA koleksi yang disentuh jalur ini: bila
           satu saja penyimpanan gagal, seluruhnya di-rollback dan ditulis
           kembali ke storage — dibuktikan konsisten setelah reload. */
        const rbSnap = { invId: o.invitationId, orders: structuredClone(S2.orders), payments: structuredClone(S2.payments), services: structuredClone(S2.services), activity: S2.activity.slice(), notifications: S2.notifications.slice(), invPkg: (() => { const iv = S.invitations.find(i => i.id === o.invitationId); return iv ? iv.packageId : undefined; })() };
        let okAll = true;
        if (pay && pay.status !== 'Pending'){
          /* v21: order yang paketnya tak cocok / tiernya tak terbukti
             TIDAK mendapat percobaan baru — percobaan pembayaran baru
             DITOLAK di handler (bukan hanya tombol disembunyikan):
             tidak ada record baru, tidak ada status yang berubah.
             Pengguna diarahkan membuat pesanan baru lewat checkout. */
          const invGate2 = S.invitations.find(i => i.id === o.invitationId);
          const tg2 = kiOrderTierGate(o, invGate2);
          if (tg2.mismatch || tg2.unresolved){
            toast('Percobaan pembayaran baru untuk pesanan ' + o.number + ' DITOLAK: ' + (tg2.expected ? 'paket pesanan (' + o.packageName + ') tidak sesuai tier template undangan (' + tg2.expected.name + ')' : 'tier template undangan tidak dapat dibuktikan') + ' — tidak ada percobaan baru yang dibuat dan tidak ada status yang berubah. Buat pesanan baru dengan paket yang benar lewat checkout.', true);
            rerender2(); return;
          }
          /* Perlakuan expiry/gagal yang KONSISTEN di semua jalur: record
             pembayaran yang sudah final (Failed/Expired) TIDAK pernah
             ditulis ulang atau dihidupkan lagi. Percobaan ulang memakai
             record pembayaran BARU (kode baru) untuk pesanan yang sama;
             record lama tetap utuh sebagai riwayat percobaan. */
          const attNo = S2.payments.filter(p => p.orderId === o.id).length + 1;
          const np = {id:uid2('pay'), orderId:o.id, invitationId:o.invitationId, method:pay.method, status:'Pending', amount:o.total, code: pay.method === 'QRIS' ? 'QRIS-SIM-' + o.number + '-A' + attNo : '8808 ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000), createdAt:Date.now(), paidAt:null, attempt: attNo}; /* v21: percobaan BARU mendapat kode BARU — QRIS memakai akhiran -A<nomor percobaan> agar berbeda dari percobaan sebelumnya (percobaan 1 tetap 'QRIS-SIM-<nomor>' seperti semula); percobaan lama sudah Failed/Expired (final) dan tetap tersimpan sebagai riwayat, tidak pernah ditulis ulang */
          S2.payments.push(np); pay = np;
        }
        if (pay){ pay.status = res; pay.paidAt = res === 'Success' ? Date.now() : null; okAll = saveColl('payments') && okAll; }
        o.paymentStatus = res;
        if (res === 'Success'){
          o.status = 'Diproses';
          const inv = S.invitations.find(i => i.id === o.invitationId);
          if (inv){ inv.packageId = o.packageId; okAll = persistInvitationNow(inv) && okAll; }
          const payOwner = (inv && inv.ownerId) || o.customerId;
          /* Proyek desain yang pesanannya baru lunas melewati status Paid
             sebelum boleh ditugaskan (Assigned). Kemajuan ini memakai
             bukti ketat yang sama (v18, kiServicePaidProof): record
             pembayaran Success yang baru tercatat harus tertaut ke order
             ini DAN undangan yang sama dengan proyek — proyek yang
             orderId-nya menunjuk pesanan undangan lain tidak ikut maju. */
          S2.services.forEach(sv => { if (sv.orderId === o.id && sv.status === 'New' && kiServicePaidProof(sv, S2.orders, S2.payments)) sv.status = 'Paid'; });
          okAll = saveColl('services') && okAll;
          okAll = logAct('Pembayaran simulasi ' + o.number + ' BERHASIL — paket ' + o.packageName + ' aktif.', 'customer', payOwner) && okAll;
          okAll = notify2('Pembayaran simulasi berhasil', o.number + ' — paket ' + o.packageName + ' aktif untuk undangan Anda.', 'customer', payOwner) && okAll;
          toast('Pembayaran simulasi berhasil');
        } else {
          logAct('Pembayaran simulasi ' + o.number + ' berakhir ' + res + ' — undangan tidak diterbitkan.', 'customer', o.customerId);
          toast('Pembayaran simulasi ' + (res === 'Failed' ? 'gagal' : 'kedaluwarsa') + ' — tidak ada perubahan pada undangan', true);
        }
        okAll = saveColl('orders') && okAll;
        if (!okAll){
          /* ROLLBACK TOTAL lewat inti yang sama dengan uji fixture
             (kiRollbackPayment): semua koleksi dikembalikan ke snapshot
             pra-tulis dan ditulis kembali ke storage — TERMASUK pemulihan
             packageId undangan, yang hasilnya ikut diperiksa. rbOk=false
             berarti satu saja penulisan pemulihan gagal (koleksi mana pun,
             packageId termasuk) dan dilaporkan apa adanya, supaya setelah
             reload pun tidak ada state parsial yang diklaim pulih. */
          const rbOk = kiRollbackPayment(rbSnap, persistInvitationNow);
          toast(rbOk ? 'Pembayaran GAGAL disimpan di perangkat ini — seluruh perubahan di-rollback, tidak ada state parsial. Muat ulang halaman untuk membuktikan status kembali seperti semula.' : 'Pembayaran GAGAL disimpan dan rollback persisten TIDAK terverifikasi — muat ulang halaman dan periksa status pesanan/pembayaran sebelum mencoba lagi.', true);
        }
        rerender2(); return;
      }
      if (act === 'pay-publish'){
        const o = S2.orders.find(x => x.id === id); if (!o) return;
        const inv = S.invitations.find(i => i.id === o.invitationId); if (!inv) return;
        if (!ownGuard(inv)) return;
        const blk = publishBlockedByGate(inv); if (blk){ toast(gateBlockText(blk), true); return; }
        const slug = publishOrReport(inv); if (!slug){ rerender2(); return; }
        logAct('Undangan “' + inv.title + '” diterbitkan setelah pembayaran ' + o.number + ' berhasil.', 'customer', inv.ownerId || CURRENT_USER);
        toast('Undangan terbit di /u/' + slug); go('#/u/' + slug); return;
      }
      /* Notifikasi */
      if (act === 'notif-read'){ const rdSnap = S2.notifications.map(n => n.read); S2.notifications.forEach(n => { if (n.scope === 'customer' && n.owner === CURRENT_USER) n.read = true; }); if (!saveColl('notifications')){ S2.notifications.forEach((n, i) => { n.read = rdSnap[i]; }); saveColl('notifications'); toast('Gagal menyimpan status baca notifikasi.', true); } rerender2(); return; }
      /* Layanan bantuan */
      if (act === 'svc-approve'){
        const s = S2.services.find(x => x.id === id); if (!s) return;
        if (S2.role !== 'customer'){ toast('Akses ditolak: persetujuan desain adalah aksi pelanggan pemilik proyek.', true); return; }
        if (!svcGuard(s)) return;
        if (s.status !== 'Review'){ toast('Persetujuan ditolak di handler: proyek ' + s.number + ' berstatus ' + s.status + ' — desain hanya dapat disetujui dari status Review (state asal tidak sah).', true); rerender2(); return; }
        const apSnap = {status:s.status, updatedAt:s.updatedAt}, apAct = S2.activity.slice(), apNtf = S2.notifications.slice();
        s.status = 'Approved'; s.updatedAt = Date.now();
        let okAp = saveColl('services');
        if (okAp) okAp = logAct('Desain proyek ' + s.number + ' disetujui pelanggan.', 'customer', s.customerId);
        if (okAp) okAp = notify2('Desain disetujui', 'Proyek ' + s.number + ' disetujui pelanggan dan siap diterbitkan.', 'admin');
        if (!okAp){ s.status = apSnap.status; s.updatedAt = apSnap.updatedAt; const rbOk = kiRollbackCollections({services:S2.services, activity:apAct, notifications:apNtf}); toast(rbOk ? 'Persetujuan GAGAL disimpan — status proyek tidak berubah.' : 'Persetujuan GAGAL disimpan dan rollback persisten TIDAK terverifikasi — muat ulang halaman dan periksa status proyek sebelum mencoba lagi.', true); rerender2(); return; }
        toast('Desain disetujui — terima kasih!'); rerender2(); return;
      }
      if (act === 'svc-revision'){
        const s = S2.services.find(x => x.id === id); if (!s) return;
        if (S2.role !== 'customer'){ toast('Akses ditolak: permintaan revisi adalah aksi pelanggan pemilik proyek.', true); return; }
        if (!svcGuard(s)) return;
        if (s.status !== 'Review'){ toast('Permintaan revisi ditolak di handler: proyek ' + s.number + ' berstatus ' + s.status + ' — revisi hanya dapat diminta dari status Review (state asal tidak sah).', true); return; }
        showModal({title:'Minta revisi desain', textarea:true, textareaLabel:'Catatan revisi untuk desainer', textareaPh:'Jelaskan bagian yang perlu diubah…', confirmLabel:'Kirim Permintaan Revisi', onConfirm:(note) => {
          if (!note){ toast('Catatan revisi wajib diisi', true); return; }
          if (s.status !== 'Review'){ toast('Permintaan revisi dibatalkan: status proyek sudah berubah menjadi ' + s.status + ' sejak formulir dibuka.', true); rerender2(); return; }
          const rvSnap = {status:s.status, updatedAt:s.updatedAt}, rvAct = S2.activity.slice();
          s.revisions.push({note, at:Date.now(), by:'customer'}); s.status = 'Revision'; s.updatedAt = Date.now();
          let okRv = saveColl('services');
          if (okRv) okRv = logAct('Revisi diminta untuk proyek ' + s.number + '.', 'customer', s.customerId);
          if (!okRv){ s.revisions.pop(); s.status = rvSnap.status; s.updatedAt = rvSnap.updatedAt; const rbOk = kiRollbackCollections({services:S2.services, activity:rvAct}); toast(rbOk ? 'Permintaan revisi GAGAL disimpan — tidak ada perubahan yang tercatat.' : 'Permintaan revisi GAGAL disimpan dan rollback persisten TIDAK terverifikasi — muat ulang halaman dan periksa status proyek sebelum mencoba lagi.', true); rerender2(); return; }
          toast('Permintaan revisi terkirim ke desainer'); rerender2();
        }}); return;
      }
      if (act === 'svc-progress'){
        kiRefreshCollections();
        const s = S2.services.find(x => x.id === id); if (!s) return;
        /* Gerbang peran per transisi (v13): pelanggan tidak menjalankan
           aksi Desainer/Admin dari URL/tombol mana pun; Desainer hanya
           transisi kerjanya pada proyek yang ditugaskan kepadanya; Admin
           hanya transisi operasional dan butuh izin tulis eksplisit. */
        const _to = el.dataset.to;
        if (S2.role === 'customer'){ toast('Akses ditolak: perubahan status pengerjaan adalah aksi Desainer/Admin, bukan pelanggan.', true); return; }
        if (S2.role === 'designer'){
          if (!['In Progress','Review'].includes(_to)){ toast('Akses ditolak: transisi "' + _to + '" bukan kewenangan Desainer.', true); return; }
          if (!svcGuard(s)) return;
        }
        if (S2.role === 'admin'){
          if (!['Published','Completed'].includes(_to)){ toast('Akses ditolak: transisi "' + _to + '" dikerjakan Desainer pada proyeknya.', true); return; }
          if (!adminWriteGuard()) return;
        }
        /* Validasi STATE ASAL + ASSIGNEE di handler (v15): transisi hanya
           sah bila pasangan (status asal → status tujuan) ada di tabel
           transisi peran (kiSvcTransitionAllowed) — tombol yang dibuat
           manual atau status yang berubah sejak halaman dirender tidak
           dapat melompat/mengulang tahap. "Assigned" tidak pernah dicapai
           lewat jalur ini — hanya lewat penugasan setelah pembayaran
           Success. svcGuard di atas sudah memastikan Desainer adalah
           assignee yang sedang aktif untuk proyek ini. */
        if (el.dataset.to === 'Assigned'){ toast('Status Assigned hanya dicapai lewat penugasan desainer setelah pembayaran Success — jalur ini tidak dapat melompat ke Assigned.', true); rerender2(); return; }
        if (!kiSvcTransitionAllowed(s.status, el.dataset.to, S2.role)){ toast('Transisi layanan TIDAK SAH di handler: ' + s.status + ' → ' + el.dataset.to + ' untuk peran ' + S2.role + ' — status proyek tidak berubah. Alur sah: New → Paid → Assigned → In Progress → Review → (Revision → Review) → Approved → Published → Completed.', true); rerender2(); return; }
        const progSnap = {status:s.status, updatedAt:s.updatedAt};
        const progAct = S2.activity.slice(), progNtf = S2.notifications.slice();
        s.status = el.dataset.to; s.updatedAt = Date.now();
        /* Semua hasil simpan transisi diperiksa; satu gagal -> rollback
           persisten (status, aktivitas, notifikasi ditulis kembali). */
        let okProg = saveColl('services');
        if (okProg) okProg = logAct('Status proyek ' + s.number + ' menjadi ' + s.status + '.', 'customer', s.customerId);
        if (okProg && s.status === 'Review') okProg = notify2('Desain menunggu ulasan Anda', 'Proyek ' + s.number + ' (' + s.title + ') siap ditinjau.', 'customer', s.customerId);
        if (!okProg){
          s.status = progSnap.status; s.updatedAt = progSnap.updatedAt;
          const rbOk = kiRollbackCollections({services:S2.services, activity:progAct, notifications:progNtf});
          toast(rbOk ? 'Perubahan status GAGAL disimpan — status proyek dikembalikan ke ' + progSnap.status + '.' : 'Perubahan status GAGAL disimpan dan rollback persisten TIDAK terverifikasi — muat ulang halaman dan periksa status proyek sebelum mencoba lagi.', true); rerender2(); return;
        }
        if (s.status === 'Published'){
          /* Status layanan "Published" TIDAK menerbitkan undangan terkait —
             publikasi undangan adalah tindakan terpisah dan eksplisit. */
          const linked = s.invitationId ? S.invitations.find(i => i.id === s.invitationId) : null;
          if (linked && linked.status !== 'published'){ notify2('Hasil desain diterbitkan', 'Proyek ' + s.number + ' selesai di sisi desain. Undangan “' + linked.title + '” masih draft — terbitkan dari kartu proyek di Dashboard → Layanan.', 'customer', s.customerId); toast('Status proyek: Published — undangan terkait masih draft dan perlu diterbitkan terpisah'); rerender2(); return; }
        }
        toast('Status proyek diperbarui: ' + s.status); rerender2(); return;
      }
      if (act === 'svc-publish-inv'){
        const s = S2.services.find(x => x.id === id); if (!s || !s.invitationId) return;
        const inv = S.invitations.find(i => i.id === s.invitationId); if (!inv) return;
        if (!ownGuard(inv)) return;
        const blk = publishBlockedByGate(inv); if (blk){ toast(gateBlockText(blk), true); return; }
        const slug = publishOrReport(inv); if (!slug){ rerender2(); return; }
        logAct('Undangan “' + inv.title + '” diterbitkan dari proyek desain ' + s.number + ' (status layanan tetap ' + s.status + ').', 'customer', inv.ownerId || CURRENT_USER);
        toast('Undangan terbit di /u/' + slug); go('#/u/' + slug); return;
      }
      /* Admin: template */
      if (act === 'tpl-new'){
        const rec = {id:'tpl-' + Date.now().toString(36), baseId:'luxury-ivory', slug:'template-baru-' + Date.now().toString(36), name:'Template Baru', desc:'Deskripsi template baru — ubah saya dari CMS.', price:59000, tier:'Premium', categoryId:'pernikahan', styleId:'luxury-editorial', status:'draft', version:1, thumb:'couple-hero', sections:TEMPLATES[0].sections.slice(), features:['RSVP & buku ucapan']};
        if (!persistCmsTemplate(rec)){ toast('Template draft GAGAL disimpan — tidak ada template baru yang dibuat.', true); rerender2(); return; }
        const base = TEMPLATES[0];
        TEMPLATES.push(tpl({id:rec.id, slug:rec.slug, name:rec.name, categoryId:rec.categoryId, styleId:rec.styleId, tier:rec.tier, price:rec.price, thumb:rec.thumb, ornament:base.ornament, fontId:base.fontId, desc:rec.desc, palettes:base.palettes, sections:rec.sections, features:rec.features, version:1, status:'draft'}));
        toast('Template draft dibuat — lengkapi lalu terbitkan'); go('#/admin?tab=template&edit=' + rec.id); return;
      }
      if (act === 'tpl-status'){
        const t = TEMPLATES.find(x => x.id === id); if (!t) return;
        const prevSt = t.status;
        t.status = el.dataset.st;
        if (!persistCmsTemplate({id:t.id, baseId:t.id, slug:t.slug, name:t.name, desc:t.desc, price:t.price, tier:t.tier, categoryId:t.categoryId, styleId:t.styleId, status:t.status, version:t.version, thumb:t.thumb, sections:t.sections, features:t.features})){
          t.status = prevSt;
          toast('Perubahan status template GAGAL disimpan — status dikembalikan ke ' + prevSt + '.', true); rerender2(); return;
        }
        logAct('Template ' + t.name + ' kini berstatus ' + t.status + '.', 'admin');
        toast(t.status === 'published' ? 'Template terbit — sudah tampil di marketplace' : 'Template diarsipkan dari marketplace'); rerender2(); return;
      }
      if (act === 'tf-thumb'){ $$('#s2-tpl-form .thumb-pick button').forEach(b => b.classList.toggle('on', b === el)); const h = $('#tf-thumb-val'); if (h) h.value = id; return; }
      if (act === 'coupon-toggle'){ const c = S2.coupons.find(x => x.id === id); if (c){ c.active = !c.active; if (!saveColl('coupons')){ c.active = !c.active; saveColl('coupons'); toast('Perubahan kupon GAGAL disimpan — status kupon tidak berubah.', true); rerender2(); return; } toast('Kupon ' + c.code + (c.active ? ' diaktifkan' : ' dinonaktifkan')); rerender2(); } return; }
      /* Pemulihan data lokal */
      if (act === 'backup-download'){
        const bk = load2(K2.backup, null);
        const payload = bk || {at: Date.now(), keys: {}};
        const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'kita-invite-cadangan-lokal.json'; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast('Cadangan lokal diunduh'); return;
      }
      if (act === 'fixture-test'){
        /* Uji fixture memakai stub storage di memori lewat inti reset yang
           sama (kiResetCore) — data nyata di perangkat ini tidak disentuh. */
        const res = kiFixtureTests();
        const zone = document.getElementById('fixture-results');
        if (zone) zone.innerHTML = '<b>Hasil uji fixture terisolasi & disposable (stub storage + data sintetis; data nyata tidak ditulis — hanya dibaca untuk pemindaian orphan terakhir):</b><ul style="margin:8px 0 0;padding-left:18px;font-size:14px">' + res.map(x => '<li><b>' + (x.pass ? 'LOLOS' : 'GAGAL') + '</b> — ' + esc(x.name) + (x.exp !== undefined ? '<br><span style="color:var(--ink-3);font-size:13px">Expected: ' + esc(String(x.exp)) + ' · Actual: ' + esc(String(x.act)) + '</span>' : '') + '</li>').join('') + '</ul>';
        toast('Uji fixture selesai: ' + res.filter(x => x.pass).length + '/' + res.length + ' lolos (data nyata tidak disentuh)');
        return;
      }
      if (act === 'handler-test'){
        /* Uji handler penuh (kiHandlerTests): handler ASLI digerakkan
           lewat event DOM nyata pada record sintetis; storage
           di-snapshot & dipulihkan byte-per-byte oleh suite itu sendiri.
           Hasil dilukis dua kali (segera + setelah render susulan dari
           perubahan hash selama uji RSVP menetap) agar daftar kasus
           tetap terlihat. */
        const res = kiHandlerTests();
        const paintH = () => { const zone = document.getElementById('handler-results'); if (zone) zone.innerHTML = '<b>Hasil uji handler penuh (event nyata pada handler asli; record sintetis disposable; storage dipulihkan byte-per-byte):</b><ul style="margin:8px 0 0;padding-left:18px;font-size:14px">' + res.map(x => '<li><b>' + (x.pass ? 'LOLOS' : 'GAGAL') + '</b> — ' + esc(x.name) + (x.exp !== undefined ? '<br><span style="color:var(--ink-3);font-size:13px">Expected: ' + esc(String(x.exp)) + ' · Actual: ' + esc(String(x.act)) + '</span>' : '') + '</li>').join('') + '</ul>'; };
        paintH(); setTimeout(paintH, 200);
        toast('Uji handler penuh selesai: ' + res.filter(x => x.pass).length + '/' + res.length + ' lolos (data nyata dipulihkan)');
        return;
      }
      if (act === 'quarantine-restore'){
        const q = load2(K2.quarantine, []);
        if (!q.length){ toast('Tidak ada record di karantina'); return; }
        showModal({title:'Pulihkan record karantina?', confirmLabel:'Ya, Pulihkan', body:q.length + ' record di karantina akan ditulis kembali ke kunci aslinya — hanya bila kunci itu sekarang kosong dan penulisannya terverifikasi. Record yang kuncinya sudah terisi (bentrok) atau gagal ditulis <b>tetap tinggal di karantina dan tidak dihapus</b>. Halaman dimuat ulang setelahnya.', onConfirm:() => {
          const st = storageBackend(); let n = 0; const kept = [];
          if (st){ q.forEach(item => { let ok = false; try { if (st.getItem(item.key) == null){ st.setItem(item.key, item.raw); ok = st.getItem(item.key) === item.raw; } } catch(e){ ok = false; } if (ok) n++; else kept.push(item); }); save2(K2.quarantine, kept); }
          toast(n + ' record dipulihkan' + (kept.length ? ' — ' + kept.length + ' tetap di karantina (bentrok/gagal)' : '') + ' — memuat ulang…'); setTimeout(() => location.reload(), 600);
        }}); return;
      }
      /* Reset demo: snapshot cadangan ditulis SEBELUM penghapusan, dan kunci
         cadangan + karantina dipertahankan — reset tidak menghancurkan jalur
         pemulihan. Semua koleksi lain dihapus dalam satu paket lalu seed
         dibangun ulang saat muat ulang, jadi tidak ada referensi yatim. */
      if (act === 'reset-demo'){
        showModal({title:'Reset seluruh data demo?', danger:true, confirmLabel:'Ya, Reset Semua Data Demo', body:'Reset berjalan FAIL-CLOSED lewat inti yang sama dengan uji fixture: (1) snapshot data saat ini dibaca penuh — bila tak terbaca, reset berhenti sebelum apa pun dihapus; (2) cadangan baru ditulis ke kunci sementara dan diverifikasi baca-balik, backup lama hanya diganti setelah salinan baru terbukti utuh — bila gagal, reset berhenti dan backup lama dipulihkan lalu diverifikasi; bila pemulihan itu gagal, statusnya dilaporkan apa adanya; kunci sementara dibersihkan dan diverifikasi hilang sebelum data dihapus — bila kunci masih tertinggal, reset berhenti dan tidak ada data yang dihapus; (3) penghapusan yang tidak tuntas (parsial) memulihkan seluruh snapshot dan memverifikasinya. Record karantina selalu dipertahankan. <b>Draft undangan buatan Anda sendiri ikut terhapus bila reset berhasil.</b> Halaman akan dimuat ulang setelah reset.', onConfirm:() => {
          const r = kiResetCore(storageBackend());
          if (!r.ok){
            if (r.stage === 'snapshot-unreadable') toast('Reset DIBATALKAN: snapshot data saat ini tidak dapat dibaca — tidak ada satu pun record yang dihapus.', true);
            else if (r.stage === 'snapshot-verify') toast('Reset DIBATALKAN: snapshot berubah saat diverifikasi (tab lain mungkin sedang menulis) — snapshot tidak terverifikasi tidak dipakai, dan tidak ada satu pun record yang dihapus. Coba lagi sesaat lagi.', true);
            else if (r.stage === 'backup-cleanup') toast('Reset DIBATALKAN: kunci sementara cadangan tidak dapat dibersihkan dan diverifikasi hilang — tidak ada data yang dihapus; cadangan baru sudah tersimpan dan terverifikasi di tempatnya. Coba lagi sesaat lagi.', true);
            else if (r.stage === 'backup-write' || r.stage === 'backup-verify' || r.stage === 'backup-commit') toast('Reset DIBATALKAN: cadangan pra-reset ' + (r.stage === 'backup-verify' ? 'tidak lolos verifikasi baca-balik' : r.stage === 'backup-commit' ? 'gagal ditulis ke kunci cadangan' : 'gagal ditulis') + (r.stage === 'backup-commit' && r.restored === false ? ' dan pemulihan backup lama TIDAK terverifikasi — periksa cadangan lewat Unduh Cadangan sebelum mencoba lagi. Tidak ada data yang dihapus.' : ' — backup lama dipertahankan utuh dan tidak ada data yang dihapus.') + (r.tmpCleanup === false ? ' Kunci sementara cadangan juga TIDAK terverifikasi bersih — masih tertinggal di penyimpanan.' : ''), true);
            else if (r.stage === 'backup-read') toast('Reset DIBATALKAN: backup lama tidak dapat dibaca — reset berhenti sebelum mengubah apa pun, tidak ada data yang dihapus.', true);
            else if (r.stage === 'partial-delete') toast(r.restored ? 'Reset DIBATALKAN: penghapusan tidak tuntas (' + r.leftover + ' record tertinggal) — seluruh snapshot dipulihkan dan terverifikasi utuh; tidak ada yang berubah.' : 'Reset GAGAL dan pemulihan snapshot tidak lolos verifikasi. Cadangan pra-reset tersimpan — gunakan Unduh Cadangan sebelum mencoba lagi.', true);
            else toast('Reset DIBATALKAN: penyimpanan tidak tersedia — tidak ada data yang dihapus.', true);
            return;
          }
          toast('Cadangan terverifikasi disimpan, data demo direset — memuat ulang…'); setTimeout(() => location.reload(), 500);
        }}); return;
      }
    });
    document.addEventListener('change', e => {
      if (e.target.id === 's2-role'){
        kiRevokeAdminGrant(); /* persona/peran berubah -> grant Admin lintas-pemilik DICABUT, tidak terbawa ke persona baru */
        S2.role = e.target.value; save2(K2.role, S2.role);
        toast('Peran demo: ' + (S2.role === 'admin' ? 'Admin' : S2.role === 'designer' ? 'Desainer' : 'Pelanggan'));
        go(S2.role === 'admin' ? '#/admin' : S2.role === 'designer' ? '#/desainer' : '#/dashboard'); rerender2(); return;
      }
      if (e.target.id === 's2-designer-pick'){
        kiRevokeAdminGrant(); /* persona desainer aktif berubah -> grant Admin (bila ada) ikut dicabut */
        S2.designerId = e.target.value === 'des-2' ? 'des-2' : 'des-1'; save2(K2.designer, S2.designerId);
        toast('Desainer aktif: ' + userById(S2.designerId).name + ' — workspace kini hanya menampilkan proyek yang ditugaskan kepadanya.');
        rerender2(); return;
      }
      if (e.target.id === 's2-inv-pick'){ D2.guestInv = e.target.value; D2.guestSel.clear(); D2.guestEdit = null; location.hash = '#/dashboard?tab=tamu&inv=' + e.target.value; return; }
      if (e.target.id === 's2-rsvp-pick'){ D2.rsvpInv = e.target.value; location.hash = '#/dashboard?tab=rsvp&inv=' + e.target.value; return; }
      if (e.target.id === 's2-ana-pick'){ location.hash = '#/dashboard?tab=analitik&inv=' + e.target.value; return; }
      if (e.target.id === 's2-guest-status'){ D2.guestStatus = e.target.value; rerender2(); return; }
      if (e.target.id === 's2-guest-group'){ D2.guestGroup = e.target.value; rerender2(); return; }
      if (e.target.id === 's2-sel-all'){ const { seg, params } = parseHash(); const invId = params.inv || D2.guestInv; guestsOf(invId).forEach(g => { if (e.target.checked) D2.guestSel.add(g.id); else D2.guestSel.delete(g.id); }); rerender2(); return; }
      const sel = e.target.closest && e.target.closest('[data-s2-sel]');
      if (sel){ if (sel.checked) D2.guestSel.add(sel.dataset.s2Sel); else D2.guestSel.delete(sel.dataset.s2Sel); rerender2(); return; }
      if (e.target.id === 'co-inv'){ CO.invId = e.target.value; CO.ctxMissing = false; const lkInv = S.invitations.find(i => i.id === CO.invId); const lkPkg2 = lkInv ? kiTemplatePackage(lkInv) : null; if (lkPkg2) CO.pkgId = lkPkg2.id; rerender2(); return; }
      const asg = e.target.closest && e.target.closest('[data-s2-assign]');
      if (asg){
        if (!adminWriteGuard()) { rerender2(); return; } /* penugasan = penulisan Admin lintas-pemilik: butuh grant eksplisit, bukan sekadar peran */
        kiRefreshCollections(); /* nilai gerbang dari state tersimpan terbaru, bukan salinan tab yang basi */
        const s = S2.services.find(x => x.id === asg.dataset.s2Assign); if (!s) return;
        const asgSnap = structuredClone(S2.services), asgActSnap = S2.activity.slice();
        if (asg.value){
          /* Gerbang alur New → Paid → Assigned (tanpa pengecualian):
             penugasan HANYA boleh bila ada pesanan yang benar-benar
             terhubung ke proyek ini DAN pembayaran simulasinya berstatus
             Success. Request tanpa order sukses — termasuk yang belum
             punya pesanan sama sekali — TIDAK dapat ditugaskan; tidak ada
             lompat New → Assigned dan tidak ada waiver/gratis yang ditebak. */
          const linkedOrder = s.orderId ? S2.orders.find(x => x.id === s.orderId) : null;
          const isPaid = !!kiServicePaidProof(s, S2.orders, S2.payments); /* v19: bukti ketat yang sama dengan rekonsiliasi — record Success tertaut langsung ke order + invitationId proyek yang sama; tanpa fallback bila invitationId proyek kosong */
          /* Yang digerbang adalah PENUGASAN (dari New/Paid menuju kerja):
             mengganti desainer pada proyek yang sudah berjalan bukan
             penugasan baru dan tidak diblokir di sini. */
          const assigning = (s.status === 'New' || s.status === 'Paid');
          if (!isPaid && assigning){
            /* v24: pesan penolakan dibedakan menurut pemblokir
               sebenarnya — sebelumnya SEMUA penolakan berbunyi
               "pembayaran ... belum Success", padahal bila
               paymentStatus SUDAH Success, pemblokirnya adalah
               tier-mismatch / bukti tak tertaut, bukan pembayaran
               yang belum lunas. Pesan yang menyebut Success
               "belum Success" menyesatkan (terbukti browser:
               KI-2026-1007 Signature Success vs template Premium). */
            let msgAsg;
            if (!linkedOrder){
              msgAsg = 'Proyek ' + s.number + ' belum dapat ditugaskan: belum ada pesanan terkait berstatus Success — alur wajib New → Paid → Assigned.';
            } else if (linkedOrder.paymentStatus !== 'Success'){
              msgAsg = 'Proyek ' + s.number + ' belum dapat ditugaskan: pembayaran pesanan terkait (' + linkedOrder.number + ' · ' + linkedOrder.paymentStatus + ') belum Success — alur wajib New → Paid → Assigned.';
            } else {
              const ivGate = S.invitations.find(i => i.id === s.invitationId);
              if (!ivGate){
                msgAsg = 'Proyek ' + s.number + ' belum dapat ditugaskan: record undangan tertaut tidak ditemukan — alur wajib New → Paid → Assigned.';
              } else {
                const gGate = kiOrderTierGate(linkedOrder, ivGate);
                if (gGate.mismatch){
                  msgAsg = 'Proyek ' + s.number + ' belum dapat ditugaskan: paket pesanan terkait (' + linkedOrder.number + ' · ' + (linkedOrder.packageName || linkedOrder.packageId) + ') tidak sesuai dengan tier template undangan ini (' + (gGate.expected ? gGate.expected.name : 'tidak terbukti') + ') — buat pesanan baru dengan paket yang sesuai tier template, atau pilih pesanan lain. Alur wajib New → Paid → Assigned.';
                } else if (gGate.unresolved){
                  msgAsg = 'Proyek ' + s.number + ' belum dapat ditugaskan: tier template undangan ini tidak dapat dibuktikan untuk pesanan terkait (' + linkedOrder.number + ') — alur wajib New → Paid → Assigned.';
                } else {
                  msgAsg = 'Proyek ' + s.number + ' belum dapat ditugaskan: tidak ditemukan record pembayaran Success yang tertaut ke pesanan terkait (' + linkedOrder.number + ') dan undangan ini — alur wajib New → Paid → Assigned.';
                }
              }
            }
            toast(msgAsg, true);
            rerender2(); return;
          }
          /* Validasi state asal penugasan: proyek yang sudah Approved /
             Published / Completed tidak sah ditugaskan atau diganti
             desainernya — transisi penugasan hanya dari New/Paid (menuju
             Assigned) atau penggantian saat proyek sedang berjalan. */
          if (['Approved','Published','Completed'].indexOf(s.status) >= 0){ toast('Penugasan ditolak di handler: proyek ' + s.number + ' berstatus ' + s.status + ' — penugasan/penggantian desainer tidak sah dari status ini.', true); rerender2(); return; }
          s.designerId = asg.value;
          if (s.status === 'Paid' || (s.status === 'New' && isPaid)) s.status = 'Assigned';
        } else {
          /* Pelepasan desainer mengikuti state machine layanan
             (kiSvcUnassignDecision, fungsi yang sama dengan uji fixture):
             hanya sah dari Assigned — kembali ke Paid bila bukti
             pembayaran Success TERTAUT KETAT terbukti, selain itu ke
             New — atau dari New/Paid tanpa perubahan status. Proyek
             BERJALAN (In Progress/Review/Revision) dan TERMINAL
             (Approved/Published/Completed) DITOLAK di handler: tidak ada
             lagi status berjalan tanpa desainer yang lalu diturunkan
             diam-diam ke Paid/New saat reload. */
          const un = kiSvcUnassignDecision(s, S2.orders, S2.payments);
          if (!un.ok){ toast('Pelepasan desainer ditolak di handler: proyek ' + s.number + ' berstatus ' + s.status + ' — desainer tidak dapat dilepas dari proyek yang sedang berjalan atau sudah selesai. Ganti desainer lewat penugasan ulang bila perlu; status proyek tidak berubah.', true); rerender2(); return; }
          s.designerId = null;
          s.status = un.toStatus;
        }
        s.updatedAt = Date.now();
        /* Hasil simpan assignment DIPERIKSA: satu penulisan gagal ->
           rollback persisten seluruh koleksi yang disentuh (layanan +
           aktivitas ditulis kembali dari snapshot), bukan toast sukses
           palsu dan bukan state parsial setelah reload. */
        let okAsg = saveColl('services');
        if (okAsg) okAsg = logAct('Proyek ' + s.number + ' ditugaskan ke ' + (asg.value ? userById(asg.value).name : '—') + '.', 'admin');
        if (!okAsg){ const rbOk = kiRollbackCollections({services:asgSnap, activity:asgActSnap}); toast(rbOk ? 'Penugasan GAGAL disimpan — status proyek dikembalikan seperti semula.' : 'Penugasan GAGAL disimpan dan rollback persisten TIDAK terverifikasi — muat ulang halaman dan periksa status proyek sebelum mencoba lagi.', true); rerender2(); return; }
        toast(asg.value ? 'Desainer ditugaskan: ' + userById(asg.value).name : 'Penugasan dilepas'); rerender2(); return;
      }
    });
    document.addEventListener('input', e => {
      if (e.target.id === 's2-inv-q'){ D2.invQuery = e.target.value; const pos = e.target.selectionStart; rerender2(); const q = $('#s2-inv-q'); if (q){ q.focus(); q.setSelectionRange(pos, pos); } return; }
      if (e.target.id === 's2-guest-q'){ D2.guestQuery = e.target.value; const pos = e.target.selectionStart; rerender2(); const q = $('#s2-guest-q'); if (q){ q.focus(); q.setSelectionRange(pos, pos); } return; }
    });
    document.addEventListener('submit', e => {
      const gf = e.target.closest('#s2-guest-form');
      if (gf){
        e.preventDefault();
        const inv = S.invitations.find(i => i.id === D2.guestInv); if (!inv) return;
        if (!ownGuard(inv)) return;
        const name = $('#gf-name').value.trim(); if (!name){ toast('Nama tamu wajib diisi', true); return; }
        const data = {name, contact:$('#gf-contact').value.trim(), group:$('#gf-group').value.trim() || 'Lainnya', attendees:Math.max(0, Math.min(20, +$('#gf-att').value || 1))};
        const wasEdit = !!D2.guestEdit;
        const actSnap = S2.activity.slice();
        let editedGuest = null, prevGuest = null, addedGuest = null;
        if (wasEdit){
          const g = S2.guests.find(x => x.id === D2.guestEdit);
          /* Scope invitationId DI HANDLER: tamu yang ID-nya menunjuk
             undangan LAIN tidak boleh diubah lewat formulir undangan
             ini — state edit yang basi atau dibuat manual ditolak,
             bukan diam-diam menulis ke record undangan lain. */
          if (!g || g.invitationId !== inv.id){ D2.guestEdit = null; toast('Gagal: tamu yang dipilih bukan milik undangan ini — pengubahan ditolak di handler.', true); rerender2(); return; }
          editedGuest = g; prevGuest = {name:g.name, contact:g.contact, group:g.group, attendees:g.attendees};
          Object.assign(g, data); /* v18: rename tamu di sini TIDAK menulis ulang record RSVP yang sudah ada — nama RSVP adalah snapshot saat submit (lihat kiRsvpSnapshotName); snapshot tersegar pada submit berikutnya dari tamu itu */
          D2.guestEdit = null;
        } else {
          addedGuest = Object.assign({id:uid2('guest'), invitationId:inv.id, rsvpStatus:'Belum Menjawab', code:'T' + Math.floor(1000 + Math.random() * 9000), createdAt:Date.now()}, data);
          S2.guests.push(addedGuest);
        }
        /* Hasil simpan diperiksa dulu — konfirmasi sukses hanya bila data
           tamu (dan catatan aktivitasnya) benar-benar tersimpan. Satu
           saja gagal -> perubahan di-rollback DAN ditulis kembali ke
           storage, jadi keadaan setelah reload sama dengan sebelum
           submit; tidak ada state parsial. */
        let okAll = saveColl('guests');
        if (okAll && !wasEdit) okAll = logAct('Tamu ' + name + ' ditambahkan ke “' + inv.title + '”.', 'customer', inv.ownerId || CURRENT_USER);
        if (!okAll){
          if (addedGuest) S2.guests = S2.guests.filter(x => x.id !== addedGuest.id);
          if (editedGuest && prevGuest) Object.assign(editedGuest, prevGuest);
          const rbOk = kiRollbackCollections({guests:S2.guests, activity:actSnap});
          toast(rbOk ? 'Gagal menyimpan data tamu — perubahan di-rollback dan belum tersimpan di perangkat ini (penyimpanan penuh?).' : 'Gagal menyimpan data tamu dan rollback persisten TIDAK terverifikasi — muat ulang halaman dan periksa daftar tamu sebelum mencoba lagi.', true); rerender2(); return;
        }
        toast(wasEdit ? 'Tamu diperbarui' : 'Tamu ditambahkan');
        rerender2(); return;
      }
      const sf = e.target.closest('#s2-svc-form');
      if (sf){
        e.preventDefault();
        if (S2.role !== 'customer'){ toast('Akses ditolak: pengajuan Bantuan Desain adalah aksi pelanggan.', true); return; }
        const name = $('#sv-name').value.trim(); if (!name){ toast('Nama acara wajib diisi', true); return; }
        const feats = $$('input[name="sv-feat"]', sf).filter(x => x.checked).map(x => x.value);
        const linkInvId = ($('#sv-inv') || {}).value || null;
        const linkOrder = linkInvId ? S2.orders.filter(o => o.invitationId === linkInvId).slice().sort((a, b) => b.createdAt - a.createdAt)[0] : null;
        const s = {id:uid2('svc'), number:'REQ-2026-' + (200 + S2.services.length + 1), customerId:CURRENT_USER, title:name, category:$('#sv-cat').value, eventName:name, eventDate:$('#sv-date').value || '', style:$('#sv-style').value, features:feats, reference:$('#sv-ref').value, notes:$('#sv-notes').value.trim(), status:'New', designerId:null, revisions:[], internalNotes:[], invitationId:linkInvId, orderId:linkOrder ? linkOrder.id : null, createdAt:Date.now(), updatedAt:Date.now()};
        S2.services.unshift(s);
        const svcActSnap = S2.activity.slice(), svcNtfSnap = S2.notifications.slice();
        let okSvc = saveColl('services');
        if (okSvc) okSvc = logAct('Permintaan desain ' + s.number + ' dibuat: ' + name + '.', 'customer', CURRENT_USER);
        if (okSvc) okSvc = notify2('Permintaan desain baru', s.number + ' — ' + name + ' menunggu penugasan desainer.', 'admin');
        if (!okSvc){ const rbOk = kiRollbackCollections({services:S2.services.filter(x => x.id !== s.id), activity:svcActSnap, notifications:svcNtfSnap}); toast(rbOk ? 'Permintaan GAGAL disimpan — tidak ada permintaan yang tercatat. Coba lagi setelah mengosongkan ruang penyimpanan.' : 'Permintaan GAGAL disimpan dan rollback persisten TIDAK terverifikasi — muat ulang halaman dan periksa daftar layanan sebelum mencoba lagi.', true); rerender2(); return; }
        toast('Permintaan ' + s.number + ' terkirim — tim kami akan menugaskan desainer'); rerender2(); return;
      }
      const nf = e.target.closest('.s2-note-form');
      if (nf){
        e.preventDefault();
        const s = S2.services.find(x => x.id === nf.dataset.id); if (!s) return;
        if (S2.role !== 'designer' || !svcGuard(s)) return; /* catatan internal hanya desainer yang ditugaskan */
        const note = nf.querySelector('input[name="note"]').value.trim(); if (!note) return;
        (s.internalNotes = s.internalNotes || []).push(note); const ntPrev = s.updatedAt; s.updatedAt = Date.now();
        if (!saveColl('services')){ s.internalNotes.pop(); s.updatedAt = ntPrev; saveColl('services'); toast('Catatan GAGAL disimpan — tidak ada perubahan yang tercatat.', true); rerender2(); return; }
        toast('Catatan internal tersimpan'); rerender2(); return;
      }
      const tf = e.target.closest('#s2-tpl-form');
      if (tf){
        e.preventDefault();
        if (!adminGuard('CMS template')) return;
        const t = TEMPLATES.find(x => x.id === tf.dataset.id); if (!t) return;
        const secs = $$('input[name="tf-sec"]', tf).filter(x => x.checked).map(x => x.value);
        if (!secs.includes('cover')) secs.unshift('cover');
        /* Arsipkan versi saat ini SEBELUM naik versi: snapshot ini immutable
           dan terus dipakai undangan yang dibuat pada versi tersebut. */
        const tSnap = {name:t.name, price:t.price, desc:t.desc, categoryId:t.categoryId, styleId:t.styleId, tier:t.tier, status:t.status, thumb:t.thumb, sections:(t.sections || []).slice(), features:(t.features || []).slice(), version:t.version};
        const hist = load2(K2.tplHistory, {});
        (hist[t.id] = hist[t.id] || {})[t.version] = {name:t.name, desc:t.desc, price:t.price, tier:t.tier, categoryId:t.categoryId, styleId:t.styleId, status:t.status, version:t.version, thumb:t.thumb, sections:(t.sections || []).slice(), features:(t.features || []).slice()};
        const okHist = save2(K2.tplHistory, hist);
        TPL_VERSIONS[t.id + '@' + t.version] = Object.assign({}, t);
        Object.assign(t, {name:$('#tf-name').value.trim() || t.name, price:Math.max(0, +$('#tf-price').value || 0), desc:$('#tf-desc').value.trim(), categoryId:$('#tf-cat').value, styleId:$('#tf-style').value, tier:$('#tf-tier').value, status:$('#tf-status').value, thumb:$('#tf-thumb-val').value, sections:secs, features:$('#tf-feats').value.split('\n').map(s => s.trim()).filter(Boolean), version:t.version + 1});
        TPL_VERSIONS[t.id + '@' + t.version] = t;
        const okCms = persistCmsTemplate({id:t.id, baseId:t.id, slug:t.slug, name:t.name, desc:t.desc, price:t.price, tier:t.tier, categoryId:t.categoryId, styleId:t.styleId, status:t.status, version:t.version, thumb:t.thumb, sections:t.sections, features:t.features});
        /* Hasil simpan CMS DIPERIKSA: histori atau record CMS gagal ->
           template di-rollback ke versi & isi sebelumnya, tanpa klaim
           "tersimpan sebagai versi baru". */
        if (!okHist || !okCms){
          delete TPL_VERSIONS[t.id + '@' + (tSnap.version + 1)];
          Object.assign(t, tSnap);
          TPL_VERSIONS[t.id + '@' + tSnap.version] = t;
          toast('Perubahan template GAGAL disimpan — template dikembalikan ke v' + tSnap.version + '.0 seperti semula.', true); rerender2(); return;
        }
        DB.categories.forEach(c => c.count = TEMPLATES.filter(x => x.categoryId === c.id && x.status === 'published').length);
        logAct('Template ' + t.name + ' diperbarui ke v' + t.version + '.0 oleh admin.', 'admin');
        toast('Template tersimpan sebagai v' + t.version + '.0 — undangan lama tetap pada versinya'); go('#/admin?tab=template'); return;
      }
      const tx = e.target.closest('#s2-tax-form');
      if (tx){
        e.preventDefault();
        if (!adminGuard('taksonomi')) return;
        const kind = tx.dataset.kind, name = $('#tax-name').value.trim(); if (!name) return;
        const tax = load2(K2.taxonomy, {cats:[], styles:[]});
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now().toString(36);
        if (kind === 'kategori'){ const c = {id, name, desc:($('#tax-desc') || {}).value || 'Kategori acara baru', icon:'spark', count:0}; DB.categories.push(c); tax.cats.push(c); }
        else { const s = {id, name}; DB.styles.push(s); tax.styles.push(s); }
        if (!save2(K2.taxonomy, tax)){ DB.categories = DB.categories.filter(c => c.id !== id); DB.styles = DB.styles.filter(s => s.id !== id); toast('Gagal menyimpan taksonomi — item tidak ditambahkan.', true); rerender2(); return; }
        toast('Ditambahkan: ' + name + ' — filter marketplace sudah mengenalinya'); rerender2(); return;
      }
      const cf = e.target.closest('#s2-coupon-form');
      if (cf){
        e.preventDefault();
        if (!adminGuard('kupon')) return;
        const code = $('#cp-code').value.trim().toUpperCase(), pct = +$('#cp-pct').value || 0;
        if (!code || pct < 1 || pct > 90){ toast('Kode kupon dan persen (1–90) wajib valid', true); return; }
        if (S2.coupons.some(c => c.code === code)){ toast('Kode kupon sudah ada', true); return; }
        const nc = {id:uid2('cpn'), code, pct, active:true, note:$('#cp-note').value.trim() || 'Kupon admin'}; S2.coupons.push(nc);
        if (!saveColl('coupons')){ S2.coupons = S2.coupons.filter(c => c.id !== nc.id); saveColl('coupons'); toast('Kupon GAGAL disimpan — tidak ada kupon baru yang dibuat.', true); rerender2(); return; }
        toast('Kupon ' + code + ' dibuat dan aktif'); rerender2(); return;
      }
      const pf = e.target.closest('.s2-pkg-form');
      if (pf){
        e.preventDefault();
        if (!adminGuard('paket')) return;
        const p = pkgById(pf.dataset.id); if (!p) return;
        const pkgSnap = {price:p.price, features:(p.features || []).slice()};
        p.price = Math.max(0, +pf.querySelector('input[name="price"]').value || 0);
        p.features = pf.querySelector('textarea[name="features"]').value.split('\n').map(s => s.trim()).filter(Boolean);
        const ov = load2(K2.packages, {}); ov[p.id] = {price:p.price, features:p.features};
        if (!save2(K2.packages, ov)){ p.price = pkgSnap.price; p.features = pkgSnap.features; toast('Perubahan paket GAGAL disimpan — harga & fitur paket tidak berubah.', true); rerender2(); return; }
        toast('Paket ' + p.name + ' diperbarui — berlaku untuk pesanan baru'); rerender2(); return;
      }
      const stf = e.target.closest('#s2-settings-form');
      if (stf){
        e.preventDefault();
        if (!adminGuard('pengaturan platform')) return;
        const setSnap = {storeName:S2.settings.storeName, supportEmail:S2.settings.supportEmail, publishNeedsPayment:S2.settings.publishNeedsPayment};
        S2.settings.storeName = $('#set-name').value.trim() || 'Kita Invite';
        S2.settings.supportEmail = $('#set-email').value.trim();
        S2.settings.publishNeedsPayment = $('#set-gate').checked;
        if (!save2(K2.settings, S2.settings)){ Object.assign(S2.settings, setSnap); toast('Pengaturan GAGAL disimpan — nilai sebelumnya dipertahankan.', true); rerender2(); return; }
        toast('Pengaturan tersimpan'); rerender2(); return;
      }
    });

    /* ---------- 2B/2C: RSVP publik → record Tamu & RSVP yang sama ----------
       Listener ini berjalan setelah handler Stage 1 (yang menampilkan
       ucapan di halaman), lalu menulis respons ke koleksi persisten. */
    document.addEventListener('submit', e => {
      const form = e.target.closest('[data-rsvp-form]');
      if (!form) return;
      if (form.dataset.kiBridged) return; /* pengaman submit ganda di lapisan persisten */
      if (!location.hash.startsWith('#/u/')) return; /* demo template tidak menulis data pelanggan */
      kiRefreshCollections(); /* tulis dari state tersimpan terbaru — tab lain bisa saja baru mengubah record yang sama */
      const slug = location.hash.slice(4).split('?')[0];
      const inv = S.invitations.find(i => i.slug === slug);
      if (!inv) return;
      const fd = new FormData(form);
      const typedName = (fd.get('name') || '').toString().trim(); if (!typedName) return;
      form.dataset.kiBridged = '1';
      const status = (form.querySelector('[data-seg] button.on') || {}).dataset?.val || 'Hadir';
      const count = status === 'Hadir' ? +(fd.get('count') || 1) : status === 'Masih Ragu' ? +(fd.get('count') || 1) : 0;
      const message = (fd.get('message') || '').toString().trim();
      /* Kaitkan RSVP ke tamu HANYA lewat ID stabil: kode tautan personal
         ?to= -> record tamu (guestId). Pencocokan nama TIDAK lagi dipakai
         sebagai identitas — dua tamu bisa bernama sama dan ejaan bisa
         berubah. Tanpa kode yang cocok, submit membuat record tamu BARU
         dengan ID-nya sendiri, bukan menempel ke tamu bernama mirip. */
      const toCode = new URLSearchParams((location.hash.split('?')[1] || '')).get('to');
      let g = toCode ? S2.guests.find(x => x.invitationId === inv.id && x.code === toCode) : null;
      /* Tanpa kode tamu: pakai identitas stabil responden AKTIF
         perangkat ini (kiRespondentToken/kiPublicGuestId) — submit
         ulang oleh orang yang sama menemukan record tamunya dan
         memperbaruinya, jadi tidak ada duplikat; orang LAIN di
         perangkat yang sama memakai identitasnya sendiri lewat
         “Isi sebagai tamu lain” (token terpisah per orang, v19).
         Nama yang diketik tidak pernah dipakai sebagai kunci identitas.
         v19: nilai mentah kunci identitas di-SNAPSHOT sebelum apa pun
         ditulis (respBefore) dan token baru TIDAK dibuat di sini —
         token kandidat hanya digenerate di memori (pendingTok) dan
         baru ditulis sebagai bagian dari penulisan submit yang
         hasilnya diperiksa; rollback memulihkan kunci identitas ke
         respBefore, jadi submit gagal tidak meninggalkan token yatim. */
      const respBefore = kiRespondentRaw(inv.id);
      let webStableId = null;
      let pendingTok = null;
      if (!g){
        const tok = kiRespondentToken(inv.id, false);
        if (tok){ webStableId = kiPublicGuestId(inv.id, tok); g = S2.guests.find(x => x.id === webStableId) || null; }
        else { pendingTok = uid2('web'); webStableId = kiPublicGuestId(inv.id, pendingTok); }
      }
      const clearMsg = fd.get('clear-message') === '1';
      /* Snapshot pra-tulis untuk rollback: SEMUA hasil penyimpanan di jalur
         ini (tamu, RSVP, aktivitas, notifikasi) diperiksa. Bila satu pun
         gagal, perubahan in-memory dibatalkan, error ditampilkan, dan TIDAK
         ada konfirmasi sukses maupun state palsu yang tertinggal. */
      const guestCreated = !g;
      const gPrev = g ? {name:g.name, rsvpStatus:g.rsvpStatus, attendees:g.attendees} : null; /* v17: snapshot tamu mencakup NAMA — field apa pun yang dapat berubah di jalur ini harus dapat dipulihkan rollback */
      const actBefore = S2.activity.slice();
      const ntfBefore = S2.notifications.slice();
      const isWebStableGuest = !!(g && webStableId && g.id === webStableId);
      let name = kiRsvpSnapshotName(g, typedName, isWebStableGuest); /* v18: nama RSVP = SNAPSHOT nama kanonis tamu saat submit (kiRsvpSnapshotName) — tamu tertaut kode memakai nama record tamu (nama ketikan diabaikan); tamu identitas-perangkat memakai nama ketikan sebagai nama kanonis barunya */
      let r = g ? S2.rsvps.find(x => x.guestId === g.id) : null;
      const rsvpCreated = !r;
      const prev = r ? {name:r.name, status:r.status, count:r.count, message:r.message || '', at:r.at} : null; /* v17: snapshot RSVP mencakup NAMA record juga */
      /* Pesan: teks baru menggantikan; kotak kosong TIDAK menghapus ucapan
         lama — penghapusan ucapan hanya lewat centang eksplisit
         "Hapus ucapan saya" (clearMsg), dan itu tercatat sebagai perubahan. */
      const nextMessage = clearMsg ? '' : (message ? message : (prev ? prev.message : ''));
      /* DEDUPE dihitung SEBELUM mutasi apa pun: submit yang identik PENUH
         dengan respons tersimpan (nama akhir, status, jumlah, pesan akhir
         sama — kiRsvpIsChanged) tidak menulis ulang record, TIDAK mengubah
         timestamp r.at, tidak menambah aktivitas/notifikasi, dan tidak
         menyentuh koleksi tamu. Perubahan NAMA saja (lewat identitas stabil
         perangkat) adalah perubahan sah dan TIDAK didedupe (v17). */
      const nextName = name; /* nama akhir snapshot untuk submit ini — dedupe membandingkannya per guestId, tidak pernah berdasarkan nama saja */
      const changed = kiRsvpIsChanged(gPrev, prev, {name:nextName, status, count, message:nextMessage});
      if (!changed){
        const zone0 = form.closest('[data-rsvp-zone]');
        if (zone0) zone0.innerHTML = rsvpFormHTML({mode:'public', existingRsvp:{name, status, count, message: nextMessage}, webIdentity: !toCode});
        toast('Respons yang sama sudah tercatat sebelumnya — tidak ada perubahan (dedupe).');
        return;
      }
      if (!g){
        g = {id: webStableId || uid2('guest'), invitationId:inv.id, name:typedName, group:'Lainnya', contact:'', rsvpStatus:status, attendees:count, code:'T' + Math.floor(1000 + Math.random() * 9000), createdAt:Date.now()};
        S2.guests.push(g);
      } else { g.rsvpStatus = status; g.attendees = count; if (webStableId && g.id === webStableId){ g.name = typedName; name = typedName; } }
      const okGuests = saveColl('guests');
      /* v19: token responden pertama ditulis SEKARANG — sebagai bagian
         dari penulisan submit, hasilnya diperiksa sama seperti koleksi
         lain; bukan dibuat lebih dulu sebelum snapshot/rollback. */
      let okIdentity = true;
      if (pendingTok) okIdentity = kiRespondentActivate(inv.id, pendingTok);
      if (r){
        r.status = status; r.count = count; r.name = name; r.at = Date.now(); r.message = nextMessage;
        /* Status moderasi TIDAK pernah dilonggarkan oleh submit ulang:
           ucapan yang disembunyikan tetap tersembunyi sampai moderator
           menyetujuinya lagi. */
      }
      else { r = {id:uid2('rsvp'), guestId:g.id, invitationId:inv.id, name, status, count, message: nextMessage, at:Date.now(), moderation:'approved'}; S2.rsvps.push(r); }
      const okRsvps = saveColl('rsvps');
      let okAct = true, okNtf = true;
      if (changed){
        /* Label event membedakan respons PERTAMA dari PERUBAHAN respons:
           tamu yang mengubah jawaban yang sudah terkirim dicatat sebagai
           "RSVP diperbarui", bukan "RSVP baru masuk". Submit ulang yang
           identik tetap didedupe penuh oleh flag `changed` di atas —
           tidak ada aktivitas/notifikasi baru untuk isi yang sama. */
        const isUpdate = !!prev;
        okAct = logAct(isUpdate ? 'RSVP diperbarui: ' + name + ' → ' + status + ' untuk “' + inv.title + '”.' : 'RSVP publik: ' + name + ' → ' + status + ' untuk “' + inv.title + '”.', 'customer', inv.ownerId || CURRENT_USER);
        okNtf = notify2(isUpdate ? 'RSVP diperbarui' : 'RSVP baru masuk', isUpdate ? name + ' memperbarui responsnya menjadi ' + status + ' untuk “' + inv.title + '”.' : name + ' merespons ' + status + ' untuk “' + inv.title + '”.', 'customer', inv.ownerId || CURRENT_USER);
      }
      const zone = form.closest('[data-rsvp-zone]');
      /* Gambar ulang buku ucapan dari sumber kebenaran yang sama, supaya
         tampilan sesi ini selalu sama dengan hasil muat ulang — ucapan
         termoderasi tidak bocor lewat sisa tampilan lama. */
      const wl = document.querySelector('[data-wish-list]');
      const drawWishes = () => { if (wl){ const ws = publicWishesFor(inv); wl.innerHTML = ws.length ? ws.map(wishHTML).join('') : '<p class="muted small">Belum ada ucapan. Jadilah yang pertama!</p>'; } };
      if (!(okGuests && okRsvps && okAct && okNtf && okIdentity)){
        /* GAGAL SIMPAN → rollback total ke keadaan sebelum submit. */
        if (guestCreated) S2.guests = S2.guests.filter(x => x.id !== g.id);
        else kiRsvpRestoreGuest(g, gPrev); /* v17: NAMA tamu ikut dipulihkan, bukan hanya status/jumlah */
        if (rsvpCreated) S2.rsvps = S2.rsvps.filter(x => x.id !== r.id);
        else kiRsvpRestoreRsvp(r, prev); /* v17: NAMA record RSVP ikut dipulihkan */
        S2.activity = actBefore; S2.notifications = ntfBefore;
        /* Rollback ditulis kembali ke storage untuk KEEMPAT koleksi —
           bukan hanya in-memory — agar tidak ada state parsial yang
           tersisa setelah halaman dimuat ulang. Hasil rollback DIPERIKSA:
           bila penulisan rollback itu sendiri gagal, kegagalannya
           dilaporkan apa adanya (bukan diklaim pulih) dan tetap TIDAK
           ada status sukses. */
        let rbOk = saveColl('guests'); rbOk = saveColl('rsvps') && rbOk; rbOk = saveColl('activity') && rbOk; rbOk = saveColl('notifications') && rbOk;
        rbOk = kiRespondentRestoreRaw(inv.id, respBefore) && rbOk; /* v19: kunci identitas responden ikut dipulihkan ke snapshot pra-submit — token baru dari submit gagal tidak tertinggal */
        drawWishes();
        if (zone) zone.innerHTML = rbOk
          ? `<div class="ok-box" style="border-color:var(--err)"><b>Respons gagal disimpan</b><p class="muted small" style="margin:4px 0 0">Penyimpanan perangkat tidak menerima data baru (mungkin penuh), jadi konfirmasi Anda <b>belum tercatat</b> — tidak ada respons yang tersimpan atas nama Anda dari percobaan ini. Kosongkan ruang penyimpanan, muat ulang halaman, lalu kirim ulang respons Anda.</p></div>`
          : `<div class="ok-box" style="border-color:var(--err)"><b>Respons gagal disimpan — dan rollback juga gagal</b><p class="muted small" style="margin:4px 0 0">Penyimpanan perangkat menolak penulisan dan pemulihan keadaan sebelumnya tidak dapat ditulis kembali secara terverifikasi. Respons ini <b>tidak</b> ditandai terkirim. Muat ulang halaman untuk melihat keadaan tersimpan yang sebenarnya sebelum mencoba lagi.</p></div>`;
        toast(rbOk ? 'RSVP gagal disimpan — respons belum tercatat. Muat ulang halaman dan coba lagi.' : 'RSVP gagal disimpan dan rollback persisten gagal — muat ulang halaman untuk memeriksa keadaan sebenarnya.', true);
        return;
      }
      /* Simpan terverifikasi — barulah konfirmasi sukses ditampilkan, dan
         tampilannya PERSIS komponen status yang dirender setelah muat
         ulang: "Respons Anda sudah terkirim" + aksi "Ubah Respons".
         Status tidak boleh berbeda (atau hilang) antara sesudah submit
         dan sesudah reload. */
      drawWishes();
      if (zone) zone.innerHTML = rsvpFormHTML({mode:'public', existingRsvp:{name, status, count, message: nextMessage}, webIdentity: !toCode});
      toast('RSVP terkirim. Terima kasih!');
    });

    /* Penanda data Stage 2 selesai dimuat & dimigrasi: sebelum ini,
       router Stage 1 menahan lukisan "tidak ditemukan" untuk rute yang
       datanya berasal dari Stage 2 (lihat render()); sesudah ini,
       record yang benar-benar tidak ada tetap menghasilkan 404. */
    try { window.__kiS2Ready = true; } catch(e){}
    s2Render();
    /* Rute Stage 1 yang bergantung pada data Stage 2 dirender sekali lagi
       setelah data siap: render awal Stage 1 berjalan SEBELUM seed Stage 2,
       jadi pada profil baru rute publik (#/u/) dan rute Builder langsung
       (#/studio/<id>, #/buat/<slug>) sempat "tidak ditemukan"/kosong sampai
       muat ulang kedua. Render ulang ini membuatnya benar sejak buka pertama. */
    if (location.hash.startsWith('#/u/') || location.hash.startsWith('#/studio/') || location.hash.startsWith('#/buat/')) render();
