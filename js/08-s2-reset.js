    /* ---------- Reset fail-closed: inti yang dapat diuji ----------
       Satu fungsi inti dipakai jalur reset nyata DAN uji fixture
       terisolasi (stub storage, bukan data pengguna):
       1) Snapshot tak terbaca (getItem melempar)  -> BERHENTI, tanpa hapus.
       2) Backup gagal ditulis / gagal verifikasi baca-balik -> BERHENTI,
          backup lama dipertahankan utuh, tanpa hapus apa pun.
       3) Penghapusan parsial -> seluruh snapshot dipulihkan dan
          diverifikasi kunci-per-kunci sebelum hasil dilaporkan. */
    const KI_TMP_BK = 'vowora-tmp:backup-next';
    function kiCollectSnapshot(store){
      const snap = {};
      try {
        for (let i = 0; i < store.length; i++){ const k = store.key(i); if (k && k.indexOf('vowora:') === 0 && k !== K2.backup && k !== K2.quarantine){ const v = store.getItem(k); if (v !== null && v !== undefined) snap[k] = v; } }
      } catch(e){ return null; }
      return snap;
    }
    function kiResetCore(store){
      if (!store) return {ok:false, stage:'no-storage'};
      const snap = kiCollectSnapshot(store);
      if (snap === null) return {ok:false, stage:'snapshot-unreadable'};
      const keys = Object.keys(snap);
      /* Verifikasi snapshot SEBELUM backup ditulis dan sebelum apa pun
         dihapus: baca ulang setiap kunci dan cocokkan byte-per-byte
         dengan salinan snapshot. Bila satu kunci berubah di tengah jalan
         (tab lain sedang menulis) atau tak terbaca, reset BERHENTI —
         snapshot yang tidak terverifikasi tidak pernah dipakai sebagai
         dasar penghapusan maupun pemulihan. */
      for (const k of keys){
        let cur = null;
        try { cur = store.getItem(k); } catch(e){ return {ok:false, stage:'snapshot-unreadable'}; }
        if (cur !== snap[k]) return {ok:false, stage:'snapshot-verify'};
      }
      if (keys.length){
        const payload = JSON.stringify({at: Date.now(), reason:'pre-reset', keys: snap});
        /* v21.1 — BACKUP LAMA DIPERTAHANKAN: tangkap backup lama SEBELUM
           menimpa kunci cadangan. Bila penulisan cadangan baru gagal
           terverifikasi (tulis/baca-balik/commit), backup lama dipulihkan
           dan diverifikasi; hasilnya dilaporkan lewat `restored`
           (true = backup lama utuh kembali, false = pemulihan TIDAK
           terverifikasi — pemanggil WAJIB melaporkannya apa adanya,
           jangan klaim "backup lama dipertahankan"). Kunci sementara
           selalu dibersihkan saat gagal dan diverifikasi baca-balik
           (v21.2); bila kunci masih tertinggal, hasilnya melaporkan
           `tmpCleanup:false` — jangan klaim sukses bila key masih ada. */
        let oldBackup = null, hadOldBackup = false;
        try { oldBackup = store.getItem(K2.backup); hadOldBackup = oldBackup !== null && oldBackup !== undefined; } catch(e){ return {ok:false, stage:'backup-read'}; }
        const restoreOldBackup = () => {
          /* Baca dulu: bila penulisan commit gagal SEBELUM menimpa
             (lempar saat tulis), backup lama masih utuh di tempatnya —
             tidak perlu ditulis ulang, cukup diverifikasi. */
          try {
            if (hadOldBackup){ if (store.getItem(K2.backup) === oldBackup) return true; store.setItem(K2.backup, oldBackup); if (store.getItem(K2.backup) !== oldBackup) return false; }
            else { if (store.getItem(K2.backup) === null) return true; try { store.removeItem(K2.backup); } catch(e){} if (store.getItem(K2.backup) !== null) return false; }
            return true;
          } catch(e){ return false; }
        };
        /* v21.2 — BACA-BALIK penghapusan kunci sementara: removeItem
           yang melempar ATAU diam-diam gagal (kunci masih terbaca
           sesudahnya) dilaporkan jujur lewat `tmpCleanup:false` —
           pemanggil WAJIB melaporkannya apa adanya, jangan klaim
           sukses bila key masih tertinggal. */
        const cleanTmp = () => { try { store.removeItem(KI_TMP_BK); } catch(e){ return false; } try { return store.getItem(KI_TMP_BK) === null; } catch(e){ return false; } };
        try { store.setItem(KI_TMP_BK, payload); if (store.getItem(KI_TMP_BK) !== payload){ const tmpCleanup = cleanTmp(); return {ok:false, stage:'backup-verify', restored:true, tmpCleanup}; } }
        catch(e){ const tmpCleanup = cleanTmp(); return {ok:false, stage:'backup-write', restored:true, tmpCleanup}; }
        try { store.setItem(K2.backup, payload); if (store.getItem(K2.backup) !== payload){ const tmpCleanup = cleanTmp(); const restored = restoreOldBackup(); return {ok:false, stage:'backup-commit', restored, tmpCleanup}; } }
        catch(e){ const tmpCleanup = cleanTmp(); const restored = restoreOldBackup(); return {ok:false, stage:'backup-commit', restored, tmpCleanup}; }
        /* v21.2 — kunci sementara HARUS benar-benar hilang sebelum data
           dihapus: bila cleanup gagal (lempar / diam-diam tertinggal),
           reset BERHENTI dengan stage:'backup-cleanup' dan
           tmpCleanup:false; tidak ada data yang dihapus, dan cadangan
           baru sudah terverifikasi di tempatnya (backupValid:true —
           cadangan lama memang sudah diganti oleh salinan baru yang
           valid, jadi tidak ada `restored` di jalur ini). */
        const tmpCleanup = cleanTmp();
        if (!tmpCleanup) return {ok:false, stage:'backup-cleanup', tmpCleanup:false, backupValid:true};
      }
      keys.forEach(k => { try { store.removeItem(k); } catch(e){} });
      const leftover = keys.filter(k => { try { return store.getItem(k) !== null; } catch(e){ return true; } });
      if (leftover.length){
        keys.forEach(k => { try { store.setItem(k, snap[k]); } catch(e){} });
        const verified = keys.every(k => { try { return store.getItem(k) === snap[k]; } catch(e){ return false; } });
        return {ok:false, stage:'partial-delete', leftover:leftover.length, restored:verified};
      }
      return {ok:true, removed:keys.length};
    }
    /* ID tamu impor yang STABIL: hash deterministik dari invitationId +
       nama + grup + kontak ternormalisasi. Menjalankan impor yang sama
       dua kali menghasilkan ID yang sama persis, jadi dedupe cukup
       membandingkan ID — bukan menebak dari kemiripan nama. */
    function kiGuestStableId(invId, v){
      const raw = String(invId) + '|' + String(v.name || '').trim().toLowerCase() + '|' + String(v.group || '').trim().toLowerCase() + '|' + String(v.contact || '').replace(/\D/g, '');
      let h = 5381;
      for (let i = 0; i < raw.length; i++){ h = ((h << 5) + h + raw.charCodeAt(i)) >>> 0; }
      return 'guest-imp-' + h.toString(36);
    }
    /* Terapkan baris impor ke daftar tamu yang ada: baris yang ID
       stabilnya sudah terdaftar (impor ulang, atau baris ganda di dalam
       impor yang sama) DILEWATI sebagai duplikat. Murni — dipakai handler
       impor nyata dan uji fixture dengan logika yang sama persis. */
    function kiImportGuests(existing, invId, rows){
      const seen = new Set((existing || []).filter(g => g.invitationId === invId).map(g => g.id));
      const added = [], skipped = [];
      (rows || []).forEach(v => {
        const sid = kiGuestStableId(invId, v);
        if (seen.has(sid)){ skipped.push(v); return; }
        seen.add(sid);
        let h = 0; for (let i = 0; i < sid.length; i++){ h = ((h << 5) + h + sid.charCodeAt(i)) >>> 0; }
        added.push({id:sid, invitationId:invId, name:v.name, group:v.group, contact:v.contact, rsvpStatus:'Belum Menjawab', attendees:1, code:'T' + (1000 + (h % 9000)), createdAt:Date.now()});
      });
      return {added, skipped};
    }
    /* Pemindai referensi yatim (orphan-reference): tamu/RSVP yang induknya
       sudah tidak ada, dan pembayaran yang order induknya hilang atau
       invitationId-nya tidak cocok dengan pesanan induknya. Referensi
       pesanan/layanan ke undangan yang sudah dihapus dihitung TERPISAH
       sebagai referensi historis (riwayat memang dipertahankan oleh
       desain), bukan yatim keras. Murni — data sintetis di fixture,
       data nyata hanya DIBACA. */
    function kiOrphanScan(cols){
      const invIds = new Set((cols.invitations || []).map(i => i.id));
      const guestIds = new Set((cols.guests || []).map(g => g.id));
      const orderById = {}; (cols.orders || []).forEach(o => { orderById[o.id] = o; });
      const out = {guests:[], rsvps:[], payments:[], services:[], historical:[]};
      (cols.guests || []).forEach(g => { if (!invIds.has(g.invitationId)) out.guests.push(g.id); });
      (cols.rsvps || []).forEach(r => { if (!guestIds.has(r.guestId) || !invIds.has(r.invitationId)) out.rsvps.push(r.id); });
      (cols.payments || []).forEach(p => { const o = orderById[p.orderId]; if (!o || p.invitationId !== o.invitationId) out.payments.push(p.id); });
      (cols.orders || []).forEach(o => { if (o.invitationId && !invIds.has(o.invitationId)) out.historical.push(o.id); });
      (cols.services || []).forEach(s => { if (s.orderId && !orderById[s.orderId]) out.services.push(s.id); else if (s.invitationId && !invIds.has(s.invitationId)) out.historical.push(s.id); });
      return out;
    }
