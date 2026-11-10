    function gateBlockText(blk){
      if (blk && blk.noOrder) return 'Publikasi ditahan (pengaturan “Publikasi wajib pembayaran” aktif): belum ada pembayaran simulasi berstatus Success yang terhubung ke undangan ini. Buat pesanan lewat checkout simulasi dan selesaikan pembayaran simulasinya terlebih dahulu.';
      if (blk && blk.tierMismatch) return 'Publikasi ditahan (pengaturan “Publikasi wajib pembayaran” aktif): pesanan ' + blk.number + ' memang Success, tetapi paketnya (' + blk.packageName + ') tidak sesuai tier template undangan ini — Success dari pesanan lama itu TIDAK membuka publikasi. Buat pesanan baru dengan paket yang sesuai tier template lewat checkout.';
      if (blk && blk.tierUnresolved) return 'Publikasi ditahan (pengaturan “Publikasi wajib pembayaran” aktif): tier template undangan ini tidak dapat dibuktikan dari versi template yang dipakai, jadi Success pesanan ' + blk.number + ' tidak dapat dipakai sebagai bukti paket — publikasi ditahan sampai ada pesanan dengan paket yang terbukti cocok. Buat pesanan baru lewat checkout.';
      return 'Publikasi ditahan (pengaturan “Publikasi wajib pembayaran” aktif): pembayaran simulasi pesanan ' + (blk ? blk.number : 'terkait') + ' belum berstatus Success.';
    }
    function s2GuestbookWishes(inv){
      return rsvpsOf(inv.id).filter(r => r.moderation === 'approved' && r.message).map(r => ({name:r.name, status:r.status, msg:r.message}));
    }
    /* Kunci ucapan yang termoderasi BUKAN approved — dipakai jalur tampilan
       publik lain agar ucapan tersembunyi tidak bocor lewat jalur mana pun. */
    function s2BlockedWishKeys(inv){
      return new Set(rsvpsOf(inv.id).filter(r => r.message && r.moderation !== 'approved').map(r => r.name + '|' + r.message));
    }
    function s2GuestByCode(invId, code){
      const g = S2.guests.find(x => x.invitationId === invId && x.code === code);
      return g ? g.name : null;
    }
    /* Respons tersimpan milik tamu pemilik tautan ?to= — dipakai halaman
       publik untuk menampilkan status "sudah terkirim" setelah muat ulang
       alih-alih formulir kosong. */
    /* Identitas stabil responden PUBLIK tanpa kode tamu: token responden
       dibuat SATU KALI per undangan per penyimpanan perangkat ini dan
       dipakai ulang pada setiap submit — ID tamu diturunkan deterministik
       dari invitationId + token (kiPublicGuestId). Identitas TIDAK
       diturunkan dari nama: nama dapat sama antarorang dan dapat berubah
       ejaan; token inilah yang membuat submit ulang (termasuk setelah
       reload) memperbarui record yang sama, bukan membuat duplikat. */
    function kiPublicGuestId(invId, token){
      const raw = String(invId) + '|web|' + String(token || '');
      let h = 5381; for (let i = 0; i < raw.length; i++){ h = ((h << 5) + h + raw.charCodeAt(i)) >>> 0; }
      return 'guest-web-' + h.toString(36);
    }
    /* Model identitas responden (v19): SATU undangan dapat memiliki
       BANYAK token responden di perangkat yang sama — SATU PER ORANG.
       Nilai tersimpan adalah JSON {tokens:[...], active:<indeks>};
       nilai lama berupa token polos tunggal tetap dibaca sebagai
       daftar satu token (kompatibel ke belakang). Token AKTIF menentukan
       record tamu yang sedang diisi/diedit orang yang sedang memegang
       perangkat; tombol “Isi sebagai tamu lain” membuat token baru dan
       mengaktifkannya, sehingga dua orang yang berbagi satu peramban
       TIDAK pernah dianggap satu orang dan tidak saling menimpa —
       tanpa dedupe berdasarkan nama sama sekali. */
    function kiRespondentKey(invId){ return 'vowora:v1:respondent:' + invId; }
    function kiRespondentRaw(invId){
      const st = storageBackend(); if (!st) return null;
      try { return st.getItem(kiRespondentKey(invId)); } catch(e){ return null; }
    }
    function kiRespondentList(invId){
      const raw = kiRespondentRaw(invId);
      if (!raw) return {tokens:[], active:-1};
      try { const j = JSON.parse(raw); if (j && Array.isArray(j.tokens) && j.tokens.length) return {tokens:j.tokens.slice(), active: Math.min(Math.max(0, j.active | 0), j.tokens.length - 1)}; } catch(e){}
      return {tokens:[raw], active:0}; /* nilai warisan: satu token polos */
    }
    function kiRespondentWrite(invId, list){
      const st = storageBackend(); if (!st) return false;
      const payload = JSON.stringify({tokens:list.tokens, active:list.active});
      try { st.setItem(kiRespondentKey(invId), payload); } catch(e){ return false; }
      return kiRespondentRaw(invId) === payload;
    }
    function kiRespondentToken(invId, create){
      const l = kiRespondentList(invId);
      if (l.tokens.length) return l.tokens[l.active];
      if (!create) return null;
      const t = uid2('web');
      return kiRespondentWrite(invId, {tokens:[t], active:0}) ? t : null;
    }
    /* Jadikan token ini identitas aktif undangan (dipakai submit
       pertama seseorang dan tombol “tamu lain”); token orang lain yang
       sudah ada di daftar TIDAK dihapus. */
    function kiRespondentActivate(invId, tok){
      if (!tok) return false;
      const l = kiRespondentList(invId);
      if (l.tokens.indexOf(tok) < 0) l.tokens.push(tok);
      l.active = l.tokens.indexOf(tok);
      return kiRespondentWrite(invId, l);
    }
    function kiRespondentNewPerson(invId){
      const t = uid2('web');
      return kiRespondentActivate(invId, t) ? t : null;
    }
    /* Pulihkan nilai mentah kunci identitas PERSIS seperti snapshot —
       bagian dari rollback submit RSVP (v19): token yang baru dibuat
       pada submit yang gagal tidak boleh tertinggal sebagai identitas. */
    function kiRespondentRestoreRaw(invId, raw){
      const st = storageBackend(); if (!st) return false;
      try { if (raw === null || raw === undefined) st.removeItem(kiRespondentKey(invId)); else st.setItem(kiRespondentKey(invId), raw); } catch(e){ return false; }
      return kiRespondentRaw(invId) === (raw === undefined ? null : raw);
    }
    function s2ExistingRsvp(inv, code){
      if (!inv) return null;
      let g = code ? S2.guests.find(x => x.invitationId === inv.id && x.code === code) : null;
      let viaWeb = false;
      if (!g){ const tok = kiRespondentToken(inv.id, false); if (tok){ g = S2.guests.find(x => x.id === kiPublicGuestId(inv.id, tok)) || null; viaWeb = !!g; } }
      if (!g) return null;
      const r = S2.rsvps.find(x => x.guestId === g.id);
      if (!r) return null;
      /* viaWeb menandai respons milik identitas perangkat aktif (tanpa
         kode): permukaan publik menawarkan “Isi sebagai tamu lain”
         untuk orang berikutnya pada perangkat yang sama (v19). */
      return {name: g.name, status: r.status, count: r.count || 0, message: r.message || '', viaWeb};
    }

