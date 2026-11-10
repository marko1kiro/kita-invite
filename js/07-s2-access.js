    /* ---------- Status & helper undangan ---------- */
    /* Masa akses undangan mengikuti masa aktif PAKET, bukan tanggal acara.
       Keputusan masa aktif: dihitung SEJAK UNDANGAN DITERBITKAN —
       Basic 1 bulan, Premium 6 bulan, Signature 12 bulan, Exclusive 18
       bulan (field accessMonths pada paket; accessDays tetap didukung
       sebagai cadangan). Undangan draft dan undangan tanpa paket terkait
       tidak kedaluwarsa. Tanggal acara tidak pernah menutup halaman
       publik; yang menutupnya hanya berakhirnya masa akses paket. */
    /* Helper expiry DETERMINISTIK (v19 — keputusan Marko 10 Nov 2026,
       mengikuti rekomendasi Agent Lora): masa aktif ditambah dalam
       BULAN KALENDER pada zona waktu WIB (UTC+7, tanpa DST), tanggal
       hari DIBATASI (clamp) ke hari terakhir bulan tujuan — 31 Okt +
       6 bulan = 30 April, BUKAN meluap ke 1 Mei seperti overflow
       Date.setMonth — dan batas akhirnya adalah AKHIR HARI pukul
       23:59:59.999 WIB pada tanggal hasil. Perhitungan memakai aritmetika
       UTC di atas waktu dinding WIB, jadi hasilnya sama di perangkat
       mana pun dan tidak bergantung zona waktu peramban. */
    const KI_WIB_MS = 7 * 3600 * 1000;
    function kiAddMonthsClampWIB(ts, months){
      if (typeof ts !== 'number' || !isFinite(ts) || typeof months !== 'number' || !isFinite(months)) return null;
      const wall = new Date(ts + KI_WIB_MS); /* waktu dinding WIB dibaca lewat field UTC */
      const total = wall.getUTCFullYear() * 12 + wall.getUTCMonth() + Math.trunc(months);
      const ty = Math.floor(total / 12), tm = total - ty * 12;
      const lastDay = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
      const day = Math.min(wall.getUTCDate(), lastDay);
      return Date.UTC(ty, tm, day, 23, 59, 59, 999) - KI_WIB_MS;
    }
    function invAccessEndsAt(inv){
      /* Expiry dihitung dari publishedAt + durasi paket di SEMUA status
         (terbit, draft pasca-terbit, maupun arsip) — status tidak pernah
         menunda atau melewati expiry. Yang dibutuhkan hanya publishedAt
         dan paket terkait; tanggal acara tidak terlibat sama sekali.
         Jalur bulan memakai helper clamp deterministik di atas (v19);
         jalur accessDays (cadangan lama) dipertahankan apa adanya. */
      if (!inv || !inv.publishedAt) return null;
      const pkg = inv.packageId ? pkgById(inv.packageId) : null;
      if (!pkg) return null;
      if (typeof pkg.accessMonths === 'number' && isFinite(pkg.accessMonths)) return kiAddMonthsClampWIB(inv.publishedAt, pkg.accessMonths);
      if (typeof pkg.accessDays === 'number' && isFinite(pkg.accessDays)) return inv.publishedAt + pkg.accessDays * 864e5;
      return null;
    }
    function invStatus(inv){
      /* Expiry dicek PERTAMA, sebelum arsip/draft/terbit: undangan yang
         masa paketnya sudah lewat berstatus Kedaluwarsa apa pun status
         simpanannya — status archived TIDAK boleh melewati expiry. */
      const end = invAccessEndsAt(inv);
      if (end && Date.now() > end) return {key:'expired', label:'Kedaluwarsa', cls:'exp', endsAt:end};
      if (inv.archived) return {key:'archived', label:'Arsip', cls:'arc', endsAt:end};
      if (inv.status !== 'published') return {key:'draft', label:'Draft', cls:'draft', endsAt:end};
      return {key:'published', label:'Terbit', cls:'pub', endsAt:end, unresolved: !end}; /* v17: "belum terselesaikan" = masa akses TIDAK terhitung — packageId kosong, packageId tidak dikenal, atau tanggal terbit tak terbukti, semuanya unresolved; tanggal berakhir hanya diklaim bila paket + publishedAt terbukti (endsAt terisi) */
    }
    function invExpired(inv){ return invStatus(inv).key === 'expired'; }
    /* Scope pemilik yang ketat: dashboard pelanggan HANYA memasukkan record
       yang ownerId-nya cocok persis. Record tanpa ownerId ditangani secara
       eksplisit — TIDAK dimasukkan ke daftar/metrik pelanggan mana pun
       (bukan dianggap milik semua orang); admin tetap melihatnya di panel
       Admin untuk ditindaklanjuti. */
    function myInvitations(){ return S.invitations.filter(i => !!i.ownerId && i.ownerId === CURRENT_USER); }
    /* Gerbang kepemilikan untuk handler mutasi Stage 2: undangan — dan
       data yang menempel padanya (tamu, RSVP, pesanan) — hanya boleh
       diubah oleh pemilik yang sedang aktif. Satu-satunya pengecualian
       adalah Admin lewat aksi admin yang jelas (peran demo 'admin').
       Penolakan terjadi DI HANDLER, bukan sekadar tombol disembunyikan:
       data-id yang dibuat manual ke record akun lain tetap ditolak. */
    /* ---------- Gerbang peran (v13) ----------
       Peran diperiksa di ROUTE dan di HANDLER, bukan hanya tampilan:
       - Route #/admin hanya untuk peran admin; #/desainer hanya desainer.
         Membuka URL langsung sebagai pelanggan menampilkan penolakan.
       - Admin memeriksa data lintas-pemilik dalam MODE INSPEKSI yang
         jelas; penulisan lintas-pemilik butuh izin tulis EKSPLISIT
         (window.__kiAdminWrite, sesi ini saja, default mati — diaktifkan
         lewat tombol berlabel jelas di panel Admin / Builder).
       - Desainer hanya boleh menulis proyek yang DITUGASKAN kepadanya
         (designerId terisi des-1/des-2) dan hanya transisi kerjanya. */
    function kiAdminWriteOn(){ try { return window.__kiAdminWrite === true; } catch(e){ return false; } }
    /* Pencabutan grant Admin lintas-pemilik: grant ini berlaku per
       persona — SETIAP perubahan persona/peran (pemilih peran maupun
       pemilih desainer aktif) mencabutnya, tanpa kecuali. Grant tidak
       pernah terbawa ke persona berikutnya; Admin pada persona baru
       harus mengaktifkannya lagi secara eksplisit. Fungsi yang sama
       dipanggil handler ganti persona DAN uji fixture. */
    function kiRevokeAdminGrant(){ try { window.__kiAdminWrite = false; window.__kiGrantGen = (window.__kiGrantGen || 0) + 1; } catch(e){} } /* v17: generasi grant ikut dinaikkan — timer autosave yang dijadwalkan sebelum pencabutan/perubahan persona menjadi gugur dan tidak menulis walau grant diaktifkan lagi sesudahnya */
    /* Desainer yang SEDANG AKTIF (persona demo desainer): workspace dan
       semua handler tulis Desainer dibatasi ke proyek yang assignee-nya
       adalah desainer aktif ini — bukan gabungan semua desainer. */
    function kiActiveDesigner(){ return S2.designerId === 'des-2' ? 'des-2' : 'des-1'; }
    function kiDesignerAllowed(s){ return S2.role === 'designer' && !!s && !!s.designerId && s.designerId === kiActiveDesigner(); }
    function adminGuard(what){
      if (S2.role === 'admin') return true;
      toast('Akses ditolak: aksi ' + (what || 'Admin') + ' hanya untuk peran Admin — peran aktif Anda "' + S2.role + '". Membuka URL langsung tidak memberi izin.', true);
      return false;
    }
    function adminWriteGuard(){
      if (S2.role !== 'admin'){ toast('Akses ditolak: aksi ini hanya untuk peran Admin.', true); return false; }
      if (!kiAdminWriteOn()){ toast('Mode inspeksi Admin: izin tulis lintas-pemilik belum diaktifkan secara eksplisit — perubahan ditolak. Aktifkan "Izin Tulis Admin" di panel Admin dulu.', true); return false; }
      return true;
    }
    function roleForbidden(kind){
      return shell(`<div class="wrap" style="padding:70px 20px 100px"><div class="empty"><h3>Akses ditolak — peran tidak sesuai</h3><p>Halaman ${esc(kind)} hanya dapat dibuka oleh peran <b>${esc(kind)}</b>. Peran demo aktif Anda adalah <b>${esc(S2.role)}</b>; membuka URL ini langsung tidak memberi akses lihat maupun tulis. Ganti peran lewat pemilih peran bila Anda memang berwenang.</p><a class="btn gold" href="#/dashboard">Ke Dashboard</a></div></div>`, '');
    }
    /* Predikat tulis MURNI (tanpa toast): logika yang sama persis dengan
       yang dipakai ownGuard di handler, diekspos agar uji fixture dapat
       memanggil LOGIKA HANDLER secara langsung — bukan menilai tombol
       yang disabled. Pemilik aktif boleh; Admin hanya bila grant
       eksplisit sesi ini aktif; selain itu ditolak. */
    function kiWriteAllowed(inv){
      if (!inv) return false;
      if (S2.role === 'customer') return inv.ownerId === CURRENT_USER;
      if (S2.role === 'admin') return kiAdminWriteOn();
      return false;
    }
    function ownGuard(inv){
      if (!inv) return false;
      if (kiWriteAllowed(inv)) return true;
      if (S2.role === 'admin') return adminWriteGuard();
      toast('Akses ditolak: undangan ini milik akun lain atau peran Anda tidak berwenang — perubahan ditolak di handler.', true);
      return false;
    }
    function orderGuard(o){
      if (!o) return false;
      if (o.customerId === CURRENT_USER && S2.role === 'customer') return true;
      if (S2.role === 'admin') return adminWriteGuard();
      toast('Akses ditolak: pesanan ini milik akun lain atau peran Anda tidak berwenang — perubahan ditolak di handler.', true);
      return false;
    }
    /* Owner check untuk ROUTE pembayaran & faktur: halaman-halaman ini
       menampilkan record pesanan utuh, jadi akses baca pun digerbang —
       pelanggan hanya boleh membuka pesanannya sendiri (customerId cocok
       dengan persona pelanggan aktif DAN peran aktif memang 'customer'),
       Admin boleh memeriksa lintas-pemilik (mode inspeksi), peran lain
       ditolak. Predikat ini juga dipakai uji fixture secara langsung. */
    function kiOrderViewAllowed(o){
      if (!o) return false;
      if (S2.role === 'admin') return true;
      if (S2.role === 'customer') return o.customerId === CURRENT_USER;
      return false;
    }
    function orderForbidden(){
      return shell(`<div class="wrap" style="padding:70px 20px 100px"><div class="empty"><h3>Akses ditolak — pesanan milik akun lain</h3><p>Halaman pembayaran dan faktur hanya dapat dibuka oleh pemilik pesanan yang sedang aktif (atau Admin dalam mode inspeksi). Membuka tautan pesanan akun lain tidak menampilkan isi pesanan apa pun.</p><a class="btn gold" href="#/dashboard?tab=pesanan">Ke Pesanan Saya</a></div></div>`, 'dashboard');
    }
    /* Tabel transisi status layanan yang SAH per peran untuk handler
       progres (svc-progress). Transisi lain DITOLAK di handler walau
       tombolnya dibuat manual: New→Paid hanya lewat pembayaran Success,
       Paid→Assigned hanya lewat penugasan desainer, Review→Approved dan
       Review→Revision hanya lewat aksi pelanggan (svc-approve/revision). */
    const KI_SVC_PROGRESS = {
      designer: {'Assigned':['In Progress'], 'In Progress':['Review'], 'Revision':['Review']},
      admin: {'Approved':['Published'], 'Published':['Completed']}
    };
    function kiSvcTransitionAllowed(from, to, role){
      const m = KI_SVC_PROGRESS[role];
      return !!(m && (m[from] || []).indexOf(to) >= 0);
    }
    /* Keputusan PELEPASAN desainer (unassign) menurut state machine
       layanan (v17) — dipakai handler penugasan DAN uji fixture:
       - 'Assigned' -> boleh dilepas; status kembali ke 'Paid' bila bukti
         pembayaran Success yang tertaut ketat (linkedSuccessPayment)
         terbukti untuk proyek ini, selain itu ke 'New'.
       - 'New'/'Paid' -> boleh dilepas; status tidak berubah (proyek
         memang belum berjalan, belum ada kerja yang kehilangan pemilik).
       - Berjalan ('In Progress'/'Review'/'Revision') dan terminal
         ('Approved'/'Published'/'Completed') -> DITOLAK: melepas desainer
         dari proyek berjalan/terminal meninggalkan status tanpa pemilik
         kerja yang tidak konsisten; ganti desainer lewat penugasan ulang. */
    function kiSvcUnassignDecision(s, orders, pays){
      if (!s) return {ok:false, toStatus:null};
      if (s.status === 'Assigned'){
        const proven = !!kiServicePaidProof(s, orders, pays); /* v19: bukti ketat yang sama — tanpa fallback invitationId dari pesanan */
        return {ok:true, toStatus: proven ? 'Paid' : 'New'};
      }
      if (s.status === 'New' || s.status === 'Paid') return {ok:true, toStatus:s.status};
      return {ok:false, toStatus:null};
    }
    /* Keputusan PENEGAK muat-ulang untuk record pasca-penugasan (v17) —
       dipakai IIFE enforceServicePaidGate DAN uji fixture. Status
       berjalan/terminal TIDAK PERNAH diturunkan diam-diam saat reload.
       Penurunan otomatis hanya berlaku untuk 'Assigned' warisan lama yang
       melewati gerbang pembayaran (kerja belum dimulai): ke 'Paid' bila
       pembayaran terbukti Success, selain itu ke 'New' sambil melepas
       desainer yang penugasannya belum sah. */
    function kiSvcGateDecision(s, orders, pays){
      const POST = ['Assigned','In Progress','Review','Revision','Approved','Published','Completed'];
      if (!s || POST.indexOf(s.status) < 0) return {action:'keep'};
      const paidOk = !!kiServicePaidProof(s, orders, pays); /* v19: bukti ketat yang sama — tanpa fallback invitationId dari pesanan */
      if (paidOk && s.designerId) return {action:'keep'};
      if (s.status !== 'Assigned') return {action:'keep'};
      return {action:'downgrade', toStatus: paidOk ? 'Paid' : 'New', releaseDesigner: !paidOk};
    }
    function svcGuard(s){
      if (!s) return false;
      if (S2.role === 'customer') { if (s.customerId === CURRENT_USER) return true; toast('Akses ditolak: proyek ini milik akun lain — perubahan ditolak.', true); return false; }
      if (S2.role === 'admin') return adminWriteGuard();
      if (S2.role === 'designer') { if (kiDesignerAllowed(s)) return true; toast('Akses ditolak: proyek ini tidak ditugaskan kepada desainer yang sedang aktif (' + userById(kiActiveDesigner()).name + ') — perubahan ditolak di handler.', true); return false; }
      return false;
    }
    function guestsOf(invId){ return S2.guests.filter(g => g.invitationId === invId); }
    function rsvpsOf(invId){ return S2.rsvps.filter(r => r.invitationId === invId); }
    function ordersOf(invId){ return S2.orders.filter(o => !invId || o.invitationId === invId); }
    function tplOf(inv){ return TEMPLATES.find(t => t.id === inv.templateId) || TEMPLATES[0]; }
    function guestLink(inv, g){ return publicUrl(inv.slug || inv.id) + '?to=' + g.code; }
    /* Payment gate: aktif secara bawaan. Bila pengaturan aktif, undangan
       hanya boleh terbit setelah ada pembayaran Success yang terhubung ke
       undangan itu — TANPA pengecualian: undangan yang belum punya pesanan
       sama sekali juga tertahan. Mengembalikan record penghambat (pesanan
       terbaru yang belum Success, atau penanda {noOrder:true} bila belum ada
       pesanan), atau null bila boleh terbit. */
    function publishBlockedByGate(inv){
      if (!inv || !S2.settings.publishNeedsPayment) return null;
      const os = ordersOf(inv.id);
      /* Gate HANYA lolos oleh pesanan yang benar-benar terkait ke undangan
         ini, TIDAK dibatalkan, dan punya record pembayaran Success yang
         terhubung ke pesanan itu. Status "Success" yang menggantung —
         pesanan batal, atau tanpa record pembayaran yang cocok — tidak
         pernah meloloskan publikasi. */
      /* v19: order Success pun TIDAK meloloskan gerbang bila paketnya
         tidak cocok dengan tier template versi undangan ini
         (kiOrderTierGate) — order Pending/Success lama dari sebelum
         checkout dikunci tidak boleh mengaktifkan paket yang salah.
         v21: order Success yang tiernya TAK TERBUKTI juga tidak
         meloloskan gerbang (fail closed — bukan "cocok"). */
      const gatePass = o => { const g = kiOrderTierGate(o, inv); return !g.mismatch && !g.unresolved; };
      if (os.some(o => linkedSuccessPayment(o, inv.id) && gatePass(o))) return null;
      if (!os.length) return { noOrder:true, number:null };
      const held = os.filter(o => o.paymentStatus === 'Success' && kiOrderTierGate(o, inv).mismatch).sort((a, b) => b.createdAt - a.createdAt)[0];
      if (held) return Object.assign({}, held, {tierMismatch:true});
      const heldUnres = os.filter(o => o.paymentStatus === 'Success' && kiOrderTierGate(o, inv).unresolved).sort((a, b) => b.createdAt - a.createdAt)[0];
      if (heldUnres) return Object.assign({}, heldUnres, {tierUnresolved:true});
      return os.slice().sort((a, b) => b.createdAt - a.createdAt)[0];
    }
    /* Record pembayaran Success yang SAH untuk sebuah pesanan: record-nya
       WAJIB menunjuk order itu DAN membawa invitationId yang sama dengan
       undangan pesanan itu. TIDAK ada fallback legacy: record tanpa
       invitationId — atau dengan invitationId undangan lain — TIDAK
       pernah dihitung, walau statusnya Success. (Record lama yang belum
       punya invitationId ditautkan satu kali oleh migrasi deterministik
       backfillPaymentInv dari pesanan induknya; gerbang sendiri tidak
       pernah menebak.) Order Dibatalkan tetap terminal: selalu null. */
    function linkedSuccessPayment(o, invId, pays){
      if (!o || o.paymentStatus !== 'Success' || o.status === 'Dibatalkan') return null;
      if (!o.invitationId) return null;
      if (invId && o.invitationId !== invId) return null;
      const list = pays || S2.payments;
      return list.find(p => p.orderId === o.id && p.status === 'Success' && p.invitationId === o.invitationId) || null;
    }
    /* Resolusi paket undangan terbit TANPA packageId: paket HANYA boleh
       disimpulkan dari order terkait yang DAPAT DIBUKTIKAN — order untuk
       undangan ini yang punya record pembayaran Success tertaut ketat
       (linkedSuccessPayment).
       ATURAN EKSPLISIT untuk beberapa order Success: yang disyaratkan
       adalah TEPAT SATU package ID UNIK yang terbukti, BUKAN tepat satu
       order. Beberapa order Success yang menunjuk package ID yang SAMA
       dihitung sebagai SATU bukti paket yang konsisten — paket itu
       terbukti dan dipakai. Bila tidak ada bukti sama sekali, atau bukti
       yang terbukti menunjuk LEBIH DARI SATU package ID berbeda,
       hasilnya null = BELUM TERSELESAIKAN — paket tidak pernah ditebak,
       tidak dipilih sembarang di antara kandidat, dan masa akses tidak
       pernah diklaim. Order Success yang record pembayarannya tidak
       tertaut ketat (tanpa invitationId yang cocok) TIDAK dihitung
       sebagai bukti sama sekali. */
    function kiResolvePackageId(invId, orders, payments, inv){
      const proven = new Set();
      /* v19: bila record undangan diberikan, hanya order yang paketnya
         COCOK dengan tier template versi undangan itu yang dihitung
         sebagai bukti — order lama bertier salah tidak pernah menjadi
         dasar penetapan packageId, walau statusnya Success. */
      const exp = inv ? kiTemplatePackage(inv) : null;
      /* v21: bila record undangan DIBERIKAN tetapi tiernya tidak dapat
         dibuktikan, hasilnya null = belum terselesaikan — paket tidak
         pernah ditebak dari order mana pun. Bila record undangan TIDAK
         diberikan (pemanggil tidak memilikinya), aturan lama berlaku:
         order Success tertaut apa pun dihitung sebagai bukti. */
      if (inv && !exp) return null;
      (orders || []).forEach(o => { if (o && o.invitationId === invId && o.packageId && linkedSuccessPayment(o, invId, payments) && (!exp || o.packageId === exp.id)) proven.add(o.packageId); });
      return proven.size === 1 ? Array.from(proven)[0] : null;
    }
    /* ---------- v18: kunci paket checkout, inti pembatalan, bukti
       rekonsiliasi layanan, dan semantik nama RSVP ----------
       (1) PAKET CHECKOUT TERKUNCI KE TIER TEMPLATE: paket yang boleh
       dipesan untuk sebuah undangan HANYA paket yang tiernya sama
       dengan tier template undangan itu (Luxury Ivory = Premium, dst.),
       dengan harga katalog paket tier tersebut. Validasi berjalan di
       HANDLER konfirmasi (kiCheckoutValidate) — bukan hanya UI yang
       menonaktifkan pilihan lain — jadi state CO yang dibuat manual /
       basi tetap ditolak dan tidak ada pesanan yang tercipta. Karena
       pesanan hanya bisa lahir dari jalur ini, snapshot pesanan,
       faktur (yang membaca snapshot pesanan), penetapan packageId
       undangan saat pembayaran Success, dan gerbang publikasi semuanya
       memakai paket yang sama dengan tier template. */
    /* Template yang BENAR-BENAR dipakai undangan (v19): snapshot versi
       yang tersimpan pada record undangan (templateId@templateVersion
       di TPL_VERSIONS) — BUKAN template terkini. CMS dapat menaikkan
       versi/tier template kapan pun; undangan lama tetap pada tier
       versinya sendiri untuk checkout, gerbang, dan rekonsiliasi.
       Jatuh kembali ke template terkini hanya bila snapshot versi
       tidak ada (record sangat lama). */
    function kiInvTemplate(inv){
      if (!inv) return null;
      const snap = (typeof inv.templateVersion === 'number' && typeof TPL_VERSIONS !== 'undefined' && TPL_VERSIONS[inv.templateId + '@' + inv.templateVersion]) || null;
      return snap || TEMPLATES.find(t => t.id === inv.templateId) || null;
    }
    function kiTemplatePackage(inv){
      if (!inv) return null;
      const t = kiInvTemplate(inv);
      if (!t || !t.tier) return null;
      return pkgById(String(t.tier).toLowerCase()) || DB.packages.find(p => p.name === t.tier) || null;
    }
    /* Gerbang tier pesanan (v19, diperketat v21) — dipakai handler hasil
       pembayaran, payment gate, resolver paket, dan tampilan penahanan:
       sebuah pesanan MISMATCH bila paket pada snapshot pesanan berbeda
       dari paket tier template VERSI undangan pemiliknya. Snapshot
       pesanan (packageId/harga/total) TIDAK pernah ditulis ulang oleh
       gerbang ini — mismatch hanya menahan aktivasi dan menandai
       pesanan untuk dibuat ulang.
       v21 — FAIL CLOSED: bila paket tier template VERSI undangan TIDAK
       DAPAT DIBUKTIKAN (template tidak dikenal / tanpa tier), hasilnya
       {mismatch:false, expected:null, unresolved:true} — pemanggil
       WAJIB memperlakukannya sebagai DITAHAN, bukan "cocok". Tanpa
       field ini, order dengan tier tak terbukti lolos gerbang begitu
       saja (fail-open). */
    function kiOrderTierGate(o, inv){
      if (!o || !inv) return {mismatch:false, expected:null, unresolved:true};
      const exp = kiTemplatePackage(inv);
      if (!exp) return {mismatch:false, expected:null, unresolved:true};
      return {mismatch: o.packageId !== exp.id, expected:exp, unresolved:false};
    }
    /* Penahanan tier PROAKTIF untuk tampilan (v21) — dihitung dari tier
       template VERSI undangan, BUKAN dari flag needsNewOrder yang baru
       muncul setelah percobaan bayar ditahan. Order yang paketnya tak
       cocok — atau tiernya tak terbukti — dan pembayarannya masih
       mungkin (Pending/Failed/Expired) DITAHAN sebelum pengguna bisa
       membayar: daftar order + halaman bayar menampilkan alasan, CTA
       "Bayar Sekarang" tidak ditampilkan, dan handler menolak
       pembuatan percobaan baru. Order Success sudah lunas (riwayat)
       tidak ditahan di sini — aktivasinya sudah terjadi dan snapshot/
       historinya tidak ditulis ulang. */
    function kiOrderTierHold(o, inv){
      if (!o || !inv) return {held:false, expected:null, unresolved:false};
      const g = kiOrderTierGate(o, inv);
      if (o.paymentStatus === 'Success') return {held:false, expected:g.expected, unresolved:!!g.unresolved};
      if (g.mismatch || g.unresolved) return {held:true, expected:g.expected, unresolved:!!g.unresolved};
      return {held:false, expected:g.expected, unresolved:false};
    }
    /* Record pembayaran AKTIF sebuah pesanan (v19): percobaan terakhir
       dalam urutan pembuatan. Semua permukaan (halaman bayar, faktur,
       handler hasil) membaca record yang sama lewat fungsi ini, dan
       kode pembayaran HANYA hidup pada record ini — tidak pernah
       dibuat ulang saat render atau muat ulang. Kode berubah hanya
       bila percobaan BARU dibuat (percobaan lama sudah Failed/Expired
       dan tetap tersimpan sebagai riwayat). */
    function kiActivePayment(orderId, pays){
      const list = (pays || S2.payments).filter(p => p.orderId === orderId);
      return list.length ? list[list.length - 1] : null;
    }
    function kiCheckoutValidate(inv, pkgId, price){
      const exp = kiTemplatePackage(inv);
      if (!exp) return {ok:false, expected:null, reason:'tier template undangan ini tidak memetakan ke paket mana pun — checkout ditolak.'};
      if (pkgId !== exp.id) return {ok:false, expected:exp, reason:'paket terpilih (“' + pkgId + '”) tidak cocok dengan tier template undangan ini — paket dikunci ke ' + exp.name + ' (' + rp(exp.price) + ').'};
      if (price !== exp.price) return {ok:false, expected:exp, reason:'harga paket (' + rp(price) + ') tidak cocok dengan harga tier ' + exp.name + ' (' + rp(exp.price) + ') — checkout ditolak.'};
      return {ok:true, expected:exp, reason:null};
    }
    /* (2) PEMBATALAN SNAPSHOT-FIRST — inti yang dipakai handler
       order-cancel DAN uji fixture. Status SEBELUM dibatalkan disimpan
       dulu; status hanya berubah permanen bila penyimpanan berhasil.
       Bila simpan gagal: field di MEMORI dikembalikan ke snapshot dan
       ditulis kembali ke storage (hasilnya diperiksa) — tidak ada
       status “Dibatalkan” palsu di layar maupun status sukses palsu;
       rollbackOk=false berarti pemulihan persisten tidak terverifikasi
       dan dilaporkan apa adanya. */
    function kiCancelOrderCore(o, saveFn){
      if (!o) return {ok:false, rollbackOk:false};
      const sv = saveFn || saveColl;
      const prevStatus = o.status;
      o.status = 'Dibatalkan';
      if (sv('orders')) return {ok:true, rollbackOk:true};
      o.status = prevStatus;
      const rbOk = sv('orders');
      return {ok:false, rollbackOk: rbOk === true};
    }
    /* (v21) PEMULIHAN MULTI-KOLEKSI YANG JUJUR — dipakai handler yang
       mengubah ≥2 koleksi sekaligus (hapus undangan, hapus tamu,
       transisi layanan, penugasan, formulir tamu/layanan, checkout).
       Snapshot dipulihkan ke memori, lalu SETIAP koleksi ditulis
       kembali ke storage; hasilnya true HANYA bila SEMUA penulisan
       pemulihan berhasil. Pemanggil WAJIB membedakan toast "pulih"
       dari "rollback tidak terverifikasi — muat ulang dan periksa
       status sebenarnya sebelum mencoba lagi". saveFn dapat disuntikkan
       fixture untuk mensimulasikan kegagalan tulis-balik per koleksi. */
    function kiRollbackCollections(snap, saveFn){
      const sv = saveFn || saveColl;
      let ok = true;
      Object.keys(snap).forEach(name => { S2[name] = snap[name]; ok = sv(name) && ok; });
      return ok;
    }
    /* (3) BUKTI LUNAS UNTUK REKONSILIASI LAYANAN — dipakai SEMUA jalur
       rekonsiliasi status layanan (penyelaras muat-ulang alignServicePaid
       dan penajuan New→Paid di handler pay-result), bukan hanya
       penugasan: proyek hanya terbukti lunas bila pesanannya adalah
       pesanan proyek itu (orderId cocok), pesanan itu tertaut ke
       UNDANGAN YANG SAMA dengan proyek, dan ada record pembayaran
       Success yang tertaut ketat ke order + undangan itu
       (linkedSuccessPayment). Status paymentStatus='Success' yang
       menggantung saja TIDAK pernah cukup. */
    function kiServicePaidProof(s, orders, pays){
      if (!s || !s.orderId) return null;
      /* v19: invitationId proyek WAJIB ada dan WAJIB sama dengan
         invitationId pesanan — TIDAK ada fallback ke invitationId
         pesanan bila proyek tidak membawanya. Proyek tanpa tautan
         undangan yang tegas tidak pernah terbukti lunas. */
      if (!s.invitationId) return null;
      const o = (orders || []).find(x => x.id === s.orderId);
      if (!o) return null;
      if (o.invitationId !== s.invitationId) return null;
      /* v19: Success dari pesanan yang paketnya tidak cocok dengan
         tier template versi undangan ini juga TIDAK menjadi bukti —
         hasil pembayaran pesanan semacam itu ditahan di handler.
         v21: tier yang TAK TERBUKTI juga bukan bukti (fail closed). */
      try { const iv = (typeof S !== 'undefined' && S.invitations || []).find(i => i.id === s.invitationId); if (iv){ const g = kiOrderTierGate(o, iv); if (g.mismatch || g.unresolved) return null; } } catch(e){}
      return linkedSuccessPayment(o, s.invitationId, pays);
    }
    /* (6) KEPUTUSAN NAMA RSVP (v18, ditegaskan): nama pada record RSVP
       adalah SNAPSHOT nama kanonis tamu PADA SAAT SUBMIT — bukan
       referensi hidup. Record tamu adalah master: mengganti nama tamu
       lewat formulir Tamu TIDAK menulis ulang record RSVP yang sudah
       ada (riwayat & buku ucapan mempertahankan nama saat respons
       diberikan); submit berikutnya dari tamu yang sama menyegarkan
       snapshot ke nama kanonis saat itu. Identitas & dedupe TIDAK
       PERNAH berdasarkan nama: keduanya berdasarkan guestId stabil
       (kode tautan personal atau token responden perangkat) — dua tamu
       bernama sama adalah dua record berbeda, dan satu tamu di banyak
       perangkat dengan kode yang sama tetap satu record. Tamu tertaut
       kode: nama yang diketik di formulir publik diabaikan, snapshot
       memakai nama kanonis record tamu. Tamu identitas-perangkat
       (webStable): nama yang diketik MENJADI nama kanonis baru record
       tamunya, dan snapshot memakainya. */
    function kiRsvpSnapshotName(g, typedName, isWebStable){
      if (!g) return typedName;
      if (isWebStable) return typedName;
      return g.name;
    }
    /* Inti rollback pembayaran (v17) — dipakai handler pay-result DAN uji
       fixture. Mengembalikan orders/payments/services/activity/
       notifications ke snapshot pra-tulis dan menulisnya kembali satu per
       satu, lalu memulihkan packageId undangan dari snapshot. Mengembalikan
       true HANYA bila SETIAP penulisan pemulihan berhasil — termasuk
       persistensi packageId; satu kegagalan saja -> false, dan pemanggil
       wajib melaporkannya sebagai rollback gagal (tidak diklaim pulih).
       saveFn dapat disuntikkan fixture untuk mensimulasikan kegagalan
       simpan awal dan kegagalan rollback secara terpisah. */
    function kiRollbackPayment(rbSnap, persistInvFn, saveFn){
      const sv = saveFn || saveColl;
      S2.orders = rbSnap.orders; S2.payments = rbSnap.payments; S2.services = rbSnap.services; S2.activity = rbSnap.activity; S2.notifications = rbSnap.notifications;
      let ok = sv('orders'); ok = sv('payments') && ok; ok = sv('services') && ok; ok = sv('activity') && ok; ok = sv('notifications') && ok;
      const ivRb = S.invitations.find(i => i.id === rbSnap.invId);
      if (ivRb && rbSnap.invPkg !== undefined){ ivRb.packageId = rbSnap.invPkg; ok = persistInvFn(ivRb) && ok; }
      return ok;
    }
    /* Snapshot & pemulihan RSVP (v17) — dipakai handler submit RSVP DAN
       uji fixture. Snapshot mencakup SETIAP field yang dapat berubah di
       jalur submit, TERMASUK nama tamu dan nama pada record RSVP:
       - kiRsvpIsChanged: dedupe hanya untuk respons yang identik PENUH
         (nama + status + jumlah + pesan akhir); perubahan nama saja
         adalah perubahan sah yang WAJIB tersimpan, bukan dedupe.
       - kiRsvpRestoreGuest/kiRsvpRestoreRsvp: rollback mengembalikan
         semua field snapshot, nama termasuk — tidak ada sisa parsial. */
    function kiRsvpIsChanged(gPrev, prev, next){
      if (!prev) return true;
      if (prev.status !== next.status || prev.count !== next.count || prev.message !== next.message) return true;
      if ((prev.name || '') !== (next.name || '')) return true;
      if (gPrev && (gPrev.name || '') !== (next.name || '')) return true;
      return false;
    }
    function kiRsvpRestoreGuest(g, gPrev){ if (!g || !gPrev) return; g.name = gPrev.name; g.rsvpStatus = gPrev.rsvpStatus; g.attendees = gPrev.attendees; }
    function kiRsvpRestoreRsvp(r, prev){ if (!r || !prev) return; r.name = prev.name; r.status = prev.status; r.count = prev.count; r.message = prev.message; r.at = prev.at; }
    /* Jalur publikasi Stage 2 (halaman pembayaran & proyek desain):
       hasil autosave DAN persistensi publikasi diperiksa — sukses hanya
       diklaim bila keduanya berhasil; gagal -> error ditampilkan,
       undangan tetap draft (rollback kiPublishCore), tidak ada navigasi
       ke halaman publik dan tidak ada catatan aktivitas sukses. */
    function publishOrReport(inv){
      if (!flushAutosave(inv)){ toast('Publikasi DIBATALKAN: autosave gagal disimpan di perangkat ini — undangan tidak diterbitkan.', true); return null; }
      const pub = publishInvitation(inv);
      if (!pub.ok){ toast(pub.rollbackOk ? 'Publikasi GAGAL disimpan — undangan tetap draft dan tidak tampak terbit setelah muat ulang.' : 'Publikasi GAGAL disimpan dan rollback persisten juga gagal — muat ulang halaman dan periksa status undangan sebelum mencoba lagi.', true); return null; }
      return pub.slug;
    }
