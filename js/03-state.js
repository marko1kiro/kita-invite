    /* ---------- State aplikasi (mock repository: Invitations, RSVPs, Wishes) ---------- */
    const S = {
      invitations: [],   // {id, templateId, templateVersion, slug, title, categoryId, status, content, design, sections, createdAt, updatedAt, publishedAt}
      rsvps: [],         // {id, invitationSlug, name, status, count, message, at}
      wishes: [
        {name:'Keluarga Wijaya', status:'Hadir', msg:'Selamat untuk kedua mempelai! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.'},
        {name:'Rani & Dimas', status:'Hadir', msg:'Akhirnya! Turut berbahagia untuk kalian berdua. Sampai jumpa di hari H!'},
        {name:'Bu Tuti (Keluarga Besar)', status:'Insya Allah Hadir', msg:'Barakallahu lakuma wa baraka alaikuma wa jama\u2019a bainakuma fii khair.'}
      ],
      seq: 1
    };

    /* ---------- Persistent draft storage (localStorage, per undangan) ----------
       Mekanisme: setiap undangan disimpan sebagai satu record JSON tersendiri
       dengan key "vowora:v1:invitation:<id>", plus satu index berisi daftar id.
       Autosave memakai debounce 650 ms per undangan. Data kosong/rusak/tidak
       kompatibel dilewati dengan aman (fallback: mulai dari state kosong /
       nilai demo template), tidak pernah membuat aplikasi crash. */
    const STORAGE_VERSION = 1;
    const INV_KEY_PREFIX = 'vowora:v1:invitation:';
    const INV_INDEX_KEY = 'vowora:v1:index';
    const SAVE_STATE = { status:'idle', at:null };
    const _saveTimers = {};
    function storageBackend(){
      try {
        const probe = '__vowora_probe__';
        window.localStorage.setItem(probe, '1');
        window.localStorage.removeItem(probe);
        return window.localStorage;
      } catch(e){ return null; }
    }
    function setSaveStatus(status, at){
      SAVE_STATE.status = status;
      if (at) SAVE_STATE.at = at;
      const pill = document.getElementById('save-status');
      if (pill){
        pill.className = 'save-status ' + (status === 'saving' ? 'saving' : status === 'error' ? 'error' : 'saved');
        pill.textContent = status === 'saving' ? 'Menyimpan…' : status === 'error' ? 'Gagal menyimpan' : 'Tersimpan';
      }
      const note = document.getElementById('saved-note');
      if (note){
        if (status === 'saving') note.textContent = 'Menyimpan perubahan…';
        else if (status === 'error') note.textContent = 'Penyimpanan lokal tidak tersedia — perubahan hanya bertahan selama sesi ini.';
        else if (status === 'saved' && SAVE_STATE.at) note.textContent = 'Tersimpan otomatis · ' + new Date(SAVE_STATE.at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
      }
    }
    /* ---------- Pengaman startup: backup sekali + karantina record rusak ----------
       backupStorageOnce menyalin seluruh key "vowora:" ke satu snapshot sebelum
       migrasi apa pun berjalan (idempoten: hanya snapshot pertama yang disimpan).
       Record JSON rusak tidak lagi dihapus: isinya dipindah ke karantina dan
       dapat dipulihkan dari Dashboard → Pengaturan. */
    const QUARANTINE_KEY = 'vowora:v1:quarantine';
    const BACKUP_KEY = 'vowora:v1:backup:pre-stage2-fix';
    function quarantineRaw(key, raw, reason){
      const store = storageBackend(); if (!store) return;
      try {
        let q = [];
        try { const p = JSON.parse(store.getItem(QUARANTINE_KEY) || '[]'); if (Array.isArray(p)) q = p; } catch(e){}
        q.push({key, raw: String(raw == null ? '' : raw), reason: reason || 'parse-error', at: Date.now()});
        store.setItem(QUARANTINE_KEY, JSON.stringify(q.slice(-50)));
      } catch(e){}
    }
    function backupStorageOnce(){
      const store = storageBackend(); if (!store) return;
      try {
        if (store.getItem(BACKUP_KEY)) return;
        const snap = {};
        for (let i = 0; i < store.length; i++){ const k = store.key(i); if (k && k.indexOf('vowora:') === 0 && k !== BACKUP_KEY && k !== QUARANTINE_KEY) snap[k] = store.getItem(k); }
        if (Object.keys(snap).length) store.setItem(BACKUP_KEY, JSON.stringify({at: Date.now(), keys: snap}));
      } catch(e){}
    }
    function persistInvitationNow(inv){
      if (!inv) return false;
      const store = storageBackend();
      if (!store){ setSaveStatus('error'); return false; }
      try {
        store.setItem(INV_KEY_PREFIX + inv.id, JSON.stringify({ version: STORAGE_VERSION, savedAt: Date.now(), invitation: inv }));
        store.setItem(INV_INDEX_KEY, JSON.stringify(S.invitations.map(i => i.id)));
        setSaveStatus('saved', Date.now());
        return true;
      } catch(e){ setSaveStatus('error'); return false; }
    }
    /* Generasi grant (v17): setiap pencabutan grant / perubahan persona
       menaikkan nomor generasi ini (kiRevokeAdminGrant di Stage 2). Timer
       autosave menangkap generasi saat ia DIJADWALKAN; bila generasi sudah
       berubah saat timer menyala, timer itu gugur — izin tidak cukup dicek
       saat penjadwalan, tetapi dinilai ulang tepat sebelum penulisan. */
    function kiGrantGen(){ try { return window.__kiGrantGen || 0; } catch(e){ return 0; } }
    /* Penembakan autosave tertunda — gerbang yang SAMA dipakai timer nyata
       dan uji fixture. Menulis HANYA bila (a) generasi grant masih sama
       dengan saat timer dijadwalkan, DAN (b) predikat persistensi
       (pemilik aktif / Admin ber-grant) MASIH lolos pada saat penulisan.
       Grant yang dicabut — atau peran yang berganti — di antara
       penjadwalan dan penembakan membatalkan penulisan, walau timernya
       sendiri tidak sempat dibersihkan. */
    function kiFireAutosave(inv, genAtSchedule, persistFn){
      if (!inv) return false;
      if (genAtSchedule !== kiGrantGen()) return false;
      if (!kiCanPersist(inv)) return false;
      return persistFn(inv);
    }
    function scheduleAutosave(inv){
      if (!inv) return;
      if (!kiCanPersist(inv)) return; /* P1: jalur simpan Builder hanya menulis undangan milik pemilik aktif — atau Admin DENGAN grant tulis eksplisit (grant benar-benar mengaktifkan persistensi, bukan hanya membuka UI) */
      inv.updatedAt = Date.now();
      setSaveStatus('saving');
      clearTimeout(_saveTimers[inv.id]);
      const genAtSchedule = kiGrantGen();
      _saveTimers[inv.id] = setTimeout(() => { kiFireAutosave(inv, genAtSchedule, persistInvitationNow); }, 650);
    }
    function flushAutosave(inv){
      if (!inv) return false;
      if (!kiCanPersist(inv)) return false; /* P1: bukan pemilik dan bukan Admin ber-grant — tidak ada penulisan */
      clearTimeout(_saveTimers[inv.id]);
      return persistInvitationNow(inv);
    }
    /* Registrasi snapshot versi template (diisi Stage 2 dari data CMS):
       undangan dirender dengan snapshot versi saat ia dibuat, bukan versi
       template terbaru — versi lama bersifat immutable. */
    const TPL_VERSIONS = {};
    function sanitizeStoredInvitation(raw){
      if (!raw || typeof raw !== 'object') return null;
      if (typeof raw.id !== 'string' || !raw.id) return null;
      const t = TEMPLATES.find(x => x.id === raw.templateId);
      if (!t) return null;
      if (!raw.content || typeof raw.content !== 'object') return null;
      const defaults = demoFor(raw.categoryId || t.categoryId);
      const c = Object.assign({}, defaults, raw.content);
      if (!Array.isArray(c.subjects)) c.subjects = defaults.subjects || [];
      if (!Array.isArray(c.events)) c.events = defaults.events || [];
      if (!Array.isArray(c.timeline)) c.timeline = defaults.timeline || [];
      if (!Array.isArray(c.gallery)) c.gallery = defaults.gallery || [];
      if (!Array.isArray(c.dressColors)) c.dressColors = defaults.dressColors || [];
      if (!c.gift || typeof c.gift !== 'object') c.gift = defaults.gift || {bank:'', number:'', holder:'', address:''};
      if (typeof c.coverKicker !== 'string') c.coverKicker = defaults.coverKicker || '';
      if (typeof c.story !== 'string') c.story = defaults.story || '';
      if (typeof c.closing !== 'string') c.closing = defaults.closing || '';
      const design = Object.assign({ paletteId: t.palettes[0].id, fontId: t.fontId, ornament: t.ornament }, (raw.design && typeof raw.design === 'object') ? raw.design : {});
      if (!t.palettes.some(p => p.id === design.paletteId)) design.paletteId = t.palettes[0].id;
      if (!FONT_PAIRS.some(f => f.id === design.fontId)) design.fontId = t.fontId;
      if (!ORNAMENTS[design.ornament]) design.ornament = t.ornament;
      /* Pilihan seksi draft adalah milik DRAFT, bukan milik template terbaru:
         semua kunci boolean tersimpan dipertahankan apa adanya — termasuk
         seksi yang sudah dihapus dari versi template baru — agar pilihan
         yang sengaja dimatikan (mis. RSVP) tidak menyala lagi. Nilai bawaan
         "menyala" hanya untuk seksi yang dikenal snapshot versi draft atau
         template saat ini dan belum pernah dipilih pengguna. */
      const sections = {};
      const snapT = (typeof raw.templateVersion === 'number' && TPL_VERSIONS[raw.templateId + '@' + raw.templateVersion]) || null;
      (snapT ? snapT.sections : []).concat(t.sections).forEach(s => { if (!(s in sections)) sections[s] = true; });
      if (raw.sections && typeof raw.sections === 'object') Object.keys(raw.sections).forEach(k => { if (typeof raw.sections[k] === 'boolean') sections[k] = raw.sections[k]; });
      return {
        id: raw.id, templateId: raw.templateId,
        templateVersion: typeof raw.templateVersion === 'number' ? raw.templateVersion : t.version,
        slug: typeof raw.slug === 'string' ? raw.slug : null,
        title: (typeof raw.title === 'string' && raw.title) ? raw.title : defaultTitle(t, c),
        categoryId: raw.categoryId || t.categoryId,
        /* Owner TIDAK ditebak: record tanpa ownerId yang valid tetap tanpa
           pemilik (null) — dashboard pelanggan menyaring owner secara ketat
           sehingga record seperti ini tidak masuk daftar/metrik siapa pun;
           admin tetap melihatnya (pemilik tampil "—") untuk ditindaklanjuti. */
        ownerId: (typeof raw.ownerId === 'string' && raw.ownerId) ? raw.ownerId : null,
        archived: raw.archived === true,
        packageId: typeof raw.packageId === 'string' ? raw.packageId : null,
        packageUnresolved: raw.packageUnresolved === true,
        status: raw.status === 'published' ? 'published' : 'draft',
        content: c, design, sections,
        createdAt: raw.createdAt || Date.now(), updatedAt: raw.updatedAt || Date.now(),
        publishedAt: raw.publishedAt || null
      };
    }
    function hydrateInvitationsFromStorage(){
      const store = storageBackend();
      if (!store) return;
      try {
        const found = [], keys = [];
        for (let i = 0; i < store.length; i++){ const k = store.key(i); if (k && k.indexOf(INV_KEY_PREFIX) === 0) keys.push(k); }
        keys.forEach(k => {
          try {
            const parsed = JSON.parse(store.getItem(k));
            if (!parsed || parsed.version !== STORAGE_VERSION) return; /* format tidak kompatibel: lewati */
            const inv = sanitizeStoredInvitation(parsed.invitation);
            if (inv) found.push(inv);
          } catch(e){ quarantineRaw(k, store.getItem(k), 'json-rusak'); try { store.removeItem(k); } catch(_){} } /* record rusak: pindah ke karantina agar bisa dipulihkan, jangan crash */
        });
        found.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        S.invitations = found;
        let maxSeq = 0;
        S.invitations.forEach(inv => { const m = String(inv.id).match(/(\d+)$/); if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10)); });
        S.seq = maxSeq + 1;
        if (found.length){ SAVE_STATE.status = 'saved'; SAVE_STATE.at = Date.now(); }
      } catch(e){ S.invitations = []; }
    }
    backupStorageOnce();
    hydrateInvitationsFromStorage();

    /* Perbaikan record seed lama (jalan sebelum render pertama): undangan seed
       pada build sebelumnya tersimpan dengan sisa konten demo karena seed lama
       hanya mengganti nama subjek — seed-inv-1 "Nadia & Reza" membawa cerita &
       rekening demo Aurelia & Bimo, dan seed-inv-4 "Salsa & Fikri" membawa
       detail orang tua, cerita generik, & rekening demo kategori lamaran.
       Migrasi ini idempoten dan hanya menyentuh record yang ID-nya ID seed
       DAN subjeknya memang pasangan seed itu; nilai hanya diubah bila cocok
       dengan signature konten demo yang dikenal di bawah — nilai lain dianggap
       perubahan pengguna dan tidak pernah ditimpa. Rekening tidak ditebak:
       amplop digital yang cocok signature demo dikosongkan. */
    const DEMO_PARENT_SIGS = ['Bambang Sutrisno', 'Dedi Prasetyo', 'Ratna Dewi', 'Sri Wahyuni', 'Agus Wijaya', 'Maya Wijaya', 'Hendra Pradana', 'Lilis Pradana'];
    const DEMO_GIFT_NUMBER_DIGITS = ['8720445521', '137002118890'];
    const DEMO_ENGAGEMENT_STORY = 'Sebuah pertemuan keluarga yang hangat untuk meresmikan langkah kami menuju jenjang pernikahan. Kehadiran dan doa Bapak/Ibu sangat berarti bagi kami.';
    const NADIA_STORY = 'Berawal dari perkenalan singkat di sebuah acara komunitas pada 2021, Nadia dan Reza menemukan kesamaan dalam hal-hal sederhana: kopi pagi, buku, dan perjalanan akhir pekan. Beberapa tahun kemudian, di tempat yang tenang, Reza melamar — dan Nadia menjawab ya.';
    const SALSA_STORY = 'Dipertemukan lewat komunitas fotografi kampus di Bandung pada 2020, Salsa dan Fikri awalnya hanya saling meminjam lensa. Dari berburu foto matahari terbit sampai berburu kuliner malam, kebersamaan itu tumbuh menjadi rasa. Pada akhir 2025, di tempat pertama mereka memotret bersama, Fikri menyampaikan niatnya melamar — dan Salsa mengangguk sambil tersenyum.';
    function normAcctDigits(v){ return String(v == null ? '' : v).replace(/\D/g, ''); }
    function isDemoGift(g){
      if (!g || typeof g !== 'object') return false;
      const h = typeof g.holder === 'string' ? g.holder : '';
      return h.indexOf('Aurelia') >= 0 || h.indexOf('Nadia Larasati') >= 0 || DEMO_GIFT_NUMBER_DIGITS.indexOf(normAcctDigits(g.number)) >= 0;
    }
    function clearDemoSubjectDetails(c){
      let ch = false;
      c.subjects.forEach(sub => { if (sub && typeof sub.detail === 'string' && DEMO_PARENT_SIGS.some(sig => sub.detail.indexOf(sig) >= 0)){ sub.detail = ''; ch = true; } });
      return ch;
    }
    function repairSeedDemoLeak(id, nickA, nickB, ownStory){
      const inv = S.invitations.find(i => i.id === id);
      if (!inv || !inv.content || !Array.isArray(inv.content.subjects)) return;
      const c = inv.content;
      if (!(c.subjects[0] && c.subjects[0].nick === nickA && c.subjects[1] && c.subjects[1].nick === nickB)) return;
      let changed = false;
      if (typeof c.story === 'string' && (c.story.indexOf('Aurelia') >= 0 || c.story.indexOf('Bimo') >= 0 || c.story === DEMO_ENGAGEMENT_STORY)){ c.story = ownStory; changed = true; }
      if (clearDemoSubjectDetails(c)) changed = true;
      if (isDemoGift(c.gift)){ c.gift = {bank:'', number:'', holder:'', address:''}; changed = true; }
      if (changed) persistInvitationNow(inv);
    }
    (function repairSeedNadiaEarly(){ repairSeedDemoLeak('seed-inv-1', 'Nadia', 'Reza', NADIA_STORY); })();
    (function repairSeedSalsaEarly(){ repairSeedDemoLeak('seed-inv-4', 'Salsa', 'Fikri', SALSA_STORY); })();

    /* Tabrakan slug Salsa & Fikri: pada build lama, record seed pemegang slug
       'salsa-dan-fikri' sempat tersimpan dengan subjek demo lamaran mentah
       (Nadia Larasati & Raka Pradana) karena tweak subjek seed belum ada saat
       record itu dibuat. seedInvitation tidak pernah menimpa record yang
       sudah ada, dan repairSeedDemoLeak di atas tidak menangkap record ini
       karena guard nama panggilannya Salsa/Fikri. Migrasi ini hanya menyentuh
       record yang TERBUKTI puing demo: pemegang slug 'salsa-dan-fikri' yang
       ID-nya 'seed-inv-4' atau pemiliknya 'cust-3' (hanya seed yang membuat
       record cust-3; undangan buatan pengguna selalu pemilik 'cust-1'), DAN
       kedua nama lengkap subjeknya persis nama demo lamaran, DAN ada penanda
       demo pendukung (rekening/cerita/keterangan orang tua demo). Record lain
       — termasuk undangan buatan pengguna — tidak pernah diubah. Rekening
       tidak ditebak: amplop demo dikosongkan, sama seperti seed baru. */
    function isDemoEngagementSubjects(c){
      return !!(c && Array.isArray(c.subjects) && c.subjects[0] && c.subjects[1]
        && c.subjects[0].name === 'Nadia Larasati, S.H.' && c.subjects[1].name === 'Raka Pradana, S.M.'
        && c.subjects[0].nick === 'Nadia' && c.subjects[1].nick === 'Raka');
    }
    function repairSalsaSlugCollision(){
      const inv = S.invitations.find(i => i.slug === 'salsa-dan-fikri' && (i.id === 'seed-inv-4' || i.ownerId === 'cust-3'));
      if (!inv || !inv.content || !isDemoEngagementSubjects(inv.content)) return;
      const c = inv.content;
      const details = ((c.subjects[0].detail || '') + ' ' + (c.subjects[1].detail || ''));
      const corroborated = isDemoGift(c.gift) || c.story === DEMO_ENGAGEMENT_STORY
        || (typeof c.story === 'string' && (c.story.indexOf('Nadia') >= 0 || c.story.indexOf('Raka') >= 0))
        || DEMO_PARENT_SIGS.some(sig => details.indexOf(sig) >= 0);
      if (!corroborated) return;
      c.subjects[0].nick = 'Salsa'; c.subjects[0].name = 'Salsabila Zahra'; c.subjects[0].detail = '';
      c.subjects[1].nick = 'Fikri'; c.subjects[1].name = 'Fikri Ramadhan'; c.subjects[1].detail = '';
      if (typeof c.story === 'string' && (c.story === DEMO_ENGAGEMENT_STORY || c.story.indexOf('Nadia') >= 0 || c.story.indexOf('Raka') >= 0)) c.story = SALSA_STORY;
      if (isDemoGift(c.gift)) c.gift = {bank:'', number:'', holder:'', address:''};
      if (inv.title === 'Nadia & Raka') inv.title = 'Salsa & Fikri';
      if (inv.status !== 'published'){ inv.status = 'published'; if (!inv.publishedAt) inv.publishedAt = inv.createdAt || Date.now(); }
      persistInvitationNow(inv);
    }
    repairSalsaSlugCollision();

    /* ---------- Application Services ---------- */
    function createDraftFromTemplate(t){
      const content = structuredClone(demoFor(t.categoryId));
      const inv = {
        id: 'inv-' + (S.seq++),
        templateId: t.id, templateVersion: t.version, slug: null,
        title: defaultTitle(t, content), categoryId: t.categoryId, status: 'draft',
        ownerId: 'cust-1', archived: false, packageId: null,
        content,
        design: { paletteId: t.palettes[0].id, fontId: t.fontId, ornament: t.ornament },
        sections: Object.fromEntries(t.sections.map(s => [s, true])),
        createdAt: Date.now(), updatedAt: Date.now(), publishedAt: null
      };
      S.invitations.unshift(inv);
      persistInvitationNow(inv);
      return inv;
    }
    function defaultTitle(t, c){
      if (c.subjects && c.subjects.length >= 2) return c.subjects[0].nick + ' & ' + c.subjects[1].nick;
      if (c.subjects && c.subjects.length === 1) return c.subjects[0].nick;
      if (c.orgName) return c.orgName;
      return t.name;
    }
    function validateInvitation(inv){
      const c = inv.content, checks = [];
      const needSubjects = inv.categoryId !== 'korporat';
      checks.push({ok: needSubjects ? (c.subjects.length > 0 && c.subjects.every(s => s.name.trim())) : !!c.orgName, label: needSubjects ? 'Nama subjek/mempelai terisi' : 'Nama perusahaan/penyelenggara terisi', tab:'konten'});
      checks.push({ok: c.events.length > 0 && c.events.every(e => e.date && e.venue.trim()), label:'Minimal satu acara dengan tanggal & tempat', tab:'acara'});
      checks.push({ok: !!mediaById(c.coverPhoto || (c.subjects[0]||{}).photo), label:'Foto sampul dipilih', tab:'media'});
      checks.push({ok: c.closing.trim().length >= 10, label:'Kalimat penutup terisi', tab:'penutup'});
      return checks;
    }
    function slugify(s){ return s.toLowerCase().replace(/&/g,' dan ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40) || 'undangan'; }
    /* Tautan publik undangan: URL lengkap halaman ini + rute hash, agar
       tautan yang disalin bisa langsung ditempel dan membuka undangan.
       Format path /u/<slug> tanpa hash diarahkan ke format ini saat
       dibuka (lihat boot). */
    function publicUrl(slug){ return location.href.split('#')[0] + '#/u/' + slug; }
    /* Inti publikasi yang dapat diuji (dipakai publishInvitation nyata dan
       uji fixture dengan fungsi persistensi stub): status "terbit" HANYA
       sah bila penulisan persistennya berhasil. Bila persistensi gagal,
       state in-memory dikembalikan ke pra-publikasi DAN ditulis kembali
       (rollback persisten); hasil rollback dilaporkan terpisah —
       rollbackOk=false berarti pemulihan persistennya sendiri gagal dan
       pemanggil WAJIB melaporkannya sebagai kegagalan, bukan sukses. */
    function kiPublishCore(inv, persist){
      const prev = {slug:inv.slug, status:inv.status, publishedAt:inv.publishedAt, updatedAt:inv.updatedAt};
      let base = slugify(inv.title), slug = base, n = 2;
      while (S.invitations.some(i => i.slug === slug && i.id !== inv.id)) slug = base + '-' + (n++);
      inv.slug = slug; inv.status = 'published'; inv.publishedAt = Date.now(); inv.updatedAt = Date.now();
      if (persist(inv)) return {ok:true, slug, rollbackOk:true};
      inv.slug = prev.slug; inv.status = prev.status; inv.publishedAt = prev.publishedAt; inv.updatedAt = prev.updatedAt;
      const rollbackOk = !!persist(inv);
      return {ok:false, slug:null, rollbackOk};
    }
    function publishInvitation(inv){
      return kiPublishCore(inv, x => persistInvitationNow(x));
    }

    /* ================================================================
       INVITATION RENDERER — satu-satunya sumber tampilan undangan.
       Dipakai oleh: demo template, Live Preview builder, halaman publik.
       ================================================================ */
    function invVars(t, design){
      const pal = (t.palettes.find(p => p.id === design.paletteId) || t.palettes[0]).v;
      const fp = fontPair(design.fontId);
      return `--i-bg:${pal.bg};--i-surface:${pal.surface};--i-ink:${pal.ink};--i-ink2:${pal.ink2};--i-accent:${pal.accent};--i-accent-ink:${pal.accentInk};--i-line:${pal.line};--i-display:${fp.display};--i-body:${fp.body};--i-radius:${t.radius}px`;
    }
    function ornHTML(design){ const o = ORNAMENTS[design.ornament] || ORNAMENTS.floral; return `<div class="orn">${o.svg}</div>`; }
    function namesLine(c){
      if (c.subjects && c.subjects.length >= 2) return `${esc(c.subjects[0].nick)} <em>&</em> ${esc(c.subjects[1].nick)}`;
      if (c.subjects && c.subjects.length === 1) return esc(c.subjects[0].nick);
      return esc(c.orgName || '');
    }
    function renderInvitation(inv, opts){
      opts = Object.assign({mode:'public', guest:'Bapak/Ibu/Saudara/i', envelope:true}, opts||{});
      const t = (inv.templateVersion && TPL_VERSIONS[inv.templateId + '@' + inv.templateVersion]) || TEMPLATES.find(x => x.id === inv.templateId);
      const c = inv.content, sec = inv.sections, d = inv.design;
      const on = k => sec[k] !== false && t.sections.includes(k);
      const H = [];
      H.push(`<div class="inv" style="${invVars(t, d)}">`);

      /* --- Sampul --- */
      const coverPhoto = mediaById(c.coverPhoto || (c.subjects[0]||{}).photo || t.thumb);
      H.push(`<section class="cover ${d.ornament==='garis'?'':'cover-arch'}">
        <div class="cover-photo"><img src="${coverPhoto.src}" alt="Foto sampul undangan"></div>
        <div class="cover-body">
          <div class="seal">${esc(initials(c))}</div>
          <p class="kick">${esc(c.coverKicker || '')}</p>
          <h1 class="names" style="margin:10px 0 6px">${namesLine(c)}</h1>
          <p class="muted" style="margin:0">${c.events[0] ? fmtDate(c.events[0].date) : ''}</p>
          ${ornHTML(d)}
          <div class="guestbox">
            <p class="small muted" style="margin:0 0 4px">Kepada Yth.</p>
            <b>${esc(opts.guest)}</b>
            ${opts.envelope ? `<br><button class="open-btn" data-open-inv>${ICONS.mail} Buka Undangan</button><p class="locked-note">Klik untuk membuka undangan</p>` : `<p class="locked-note">Tombol “Buka Undangan” aktif di halaman publik.</p>`}
          </div>
        </div>
      </section>`);
      H.push(`<div class="inv-body" ${opts.envelope ? 'hidden' : ''}>`);

      /* --- Kutipan --- */
      if (on('quote') && c.quote) H.push(`<section class="sec"><p class="quote">“${esc(c.quote)}”</p><p class="small" style="color:var(--i-accent-ink);font-weight:700;margin-top:10px">${esc(c.quoteSource)}</p></section>`);

      /* --- Subjek / Mempelai --- */
      if (on('subjects') && c.subjects.length){
        H.push(`<section class="sec tint"><p class="kick">Dengan Memohon Rahmat & Ridha Allah SWT</p>${ornHTML(d)}`);
        c.subjects.forEach((s, i) => {
          if (i > 0) H.push(`<div class="amp">&</div>`);
          H.push(`<div class="person"><div class="ph"><img src="${mediaById(s.photo).src}" alt="Foto ${esc(s.name)}"></div>
            <p class="kick" style="margin-bottom:4px">${esc(s.role)}</p><h3>${esc(s.name)}</h3><p class="muted small" style="margin:0">${esc(s.detail)}</p></div>`);
        });
        H.push(`</section>`);
      }
      /* --- Organisasi (korporat) --- */
      if (on('org') && c.orgName) H.push(`<section class="sec tint"><p class="kick">Diselenggarakan Oleh</p>${ornHTML(d)}<h2 style="font-size:30px">${esc(c.orgName)}</h2><p class="muted" style="max-width:26em;margin:6px auto 0">${esc(c.orgTagline||'')}</p></section>`);

      /* --- Countdown --- */
      if (on('countdown') && c.events[0]) H.push(`<section class="sec"><p class="kick">Menghitung Hari</p><h2 style="font-size:26px;margin-top:8px">Menuju Hari Bahagia</h2><div class="cd" data-cd="${c.events[0].date}T${(c.events[0].timeStart||'08.00').replace('.',':')}:00"><div><b data-d>–</b><span>Hari</span></div><div><b data-h>–</b><span>Jam</span></div><div><b data-m>–</b><span>Menit</span></div><div><b data-s>–</b><span>Detik</span></div></div></section>`);

      /* --- Acara --- */
      if (on('events') && c.events.length){
        H.push(`<section class="sec tint"><p class="kick">Waktu & Tempat</p>${ornHTML(d)}`);
        c.events.forEach(e => {
          const dt = e.date ? new Date(e.date+'T00:00:00') : null;
          H.push(`<div class="ev-card"><h3>${esc(e.label)}</h3>
            <div class="ev-date"><div class="w">${dt ? dt.toLocaleDateString('id-ID',{weekday:'long'}) : ''}<br>${dt ? dt.toLocaleDateString('id-ID',{month:'long', year:'numeric'}) : ''}</div><div class="d">${dt ? dt.getDate() : '–'}</div><div class="w">Pukul<br>${esc(e.timeStart)}${e.timeEnd ? ' – ' + esc(e.timeEnd) : ''} WIB</div></div>
            <b>${esc(e.venue)}</b><p class="muted small" style="margin:4px 0 14px">${esc(e.address)}</p>
            <a class="map-btn" href="https://www.google.com/maps/search/${encodeURIComponent(e.venue + ' ' + e.address)}" target="_blank" rel="noopener">${ICONS.pin} Lihat Lokasi</a></div>`);
        });
        H.push(`</section>`);
      }

      /* --- Cerita --- */
      if (on('story') && c.story) H.push(`<section class="sec"><p class="kick">${inv.categoryId==='korporat' ? 'Tentang Acara' : 'Kisah Kami'}</p>${ornHTML(d)}<p style="max-width:30em;margin:0 auto">${esc(c.story)}</p></section>`);

      /* --- Timeline --- */
      if (on('timeline') && c.timeline.length){
        H.push(`<section class="sec tint"><p class="kick">Rangkaian Acara</p>${ornHTML(d)}<div class="tl">`);
        c.timeline.forEach(x => H.push(`<div><span class="t">${esc(x.time)} WIB</span><br><b>${esc(x.title)}</b><p>${esc(x.desc)}</p></div>`));
        H.push(`</div></section>`);
      }

      /* --- Dress code --- */
      if (on('dresscode') && c.dressNote) H.push(`<section class="sec"><p class="kick">Dress Code</p>${ornHTML(d)}<p style="max-width:28em;margin:0 auto">${esc(c.dressNote)}</p><div class="swatches">${(c.dressColors||[]).map(hx => `<i style="background:${esc(hx)}"></i>`).join('')}</div></section>`);

      /* --- Galeri --- */
      if (on('gallery') && c.gallery.length) H.push(`<section class="sec tint"><p class="kick">Galeri Momen</p>${ornHTML(d)}<div class="gal">${c.gallery.map(id => `<img src="${mediaById(id).src}" alt="Foto galeri ${esc(mediaById(id).name)}" loading="lazy">`).join('')}</div></section>`);

      /* --- Amplop digital --- */
      if (on('gift') && c.gift && (c.gift.number || c.gift.address)){
        H.push(`<section class="sec"><p class="kick">Amplop Digital</p>${ornHTML(d)}<p class="muted" style="max-width:28em;margin:0 auto">Doa restu Anda adalah hadiah terindah. Namun jika berkenan memberikan tanda kasih, kami sediakan dengan terima kasih:</p>`);
        if (c.gift.number) H.push(`<div class="gift-card"><div class="bank">${esc(c.gift.bank || 'Transfer Bank')}</div><div class="num">${esc(c.gift.number)}</div><div class="small" style="opacity:.85">${esc(c.gift.holder)}</div><button data-copy="${esc(c.gift.number.replace(/\s/g,''))}">${ICONS.copy} Salin Nomor</button></div>`);
        if (c.gift.address) H.push(`<div class="gift-card" style="background:var(--i-surface);color:var(--i-ink);border:1px solid var(--i-line)"><div class="bank" style="color:var(--i-accent-ink)">Kirim Kado Fisik</div><p style="margin:6px 0 0;font-size:14.5px">${esc(c.gift.address)}</p></div>`);
        H.push(`</section>`);
      }

      /* --- RSVP & Ucapan --- */
      if (on('rsvp')){
        const wishes = opts.wishes || [];
        H.push(`<section class="sec tint"><p class="kick">RSVP & Ucapan</p>${ornHTML(d)}
          <p class="muted" style="max-width:28em;margin:0 auto">Konfirmasi kehadiran Anda sangat membantu persiapan kami.</p>
          <div data-rsvp-zone>${rsvpFormHTML(opts)}</div>
          <div data-wish-list style="margin-top:26px">${wishes.map(wishHTML).join('') || '<p class="muted small">Belum ada ucapan. Jadilah yang pertama!</p>'}</div>
        </section>`);
      }

      /* --- Penutup --- */
      if (on('closing')) H.push(`<section class="sec"><div class="frame-line"><p style="margin:0">${esc(c.closing)}</p>${ornHTML(d)}<p class="kick" style="margin-bottom:6px">Kami yang berbahagia,</p><h2 class="names" style="font-size:30px">${namesLine(c)}</h2></div></section>`);

      H.push(`<div class="foot-mark"><div class="brand2">Kita Invite</div></div>`);
      H.push(`</div></div>`);
      return H.join('');
    }
    function initials(c){
      if (c.subjects && c.subjects.length >= 2) return (c.subjects[0].nick[0]||'') + (c.subjects[1].nick[0]||'');
      if (c.subjects && c.subjects.length === 1) return (c.subjects[0].nick[0]||'K');
      return (c.orgName || 'K').split(' ').map(w => w[0]).slice(0,2).join('');
    }
    function wishHTML(w){ return `<div class="wish"><b>${esc(w.name)}</b> <span class="st">· ${esc(w.status)}</span><p>${esc(w.msg)}</p></div>`; }
    /* Buku ucapan publik: SATU sumber kebenaran — record RSVP persisten
       (Stage 2) yang moderasinya "approved" dan pesannya tidak kosong.
       Salinan sesi lama (S.wishes) tidak lagi digabungkan: salinan itulah
       yang membuat ucapan tersembunyi/terhapus muncul lagi setelah submit
       atau navigasi SPA. Halaman demo template tetap memakai S.wishes
       slug "demo" lewat jalurnya sendiri di viewDetail/viewDemo. */
    function publicWishesFor(inv){
      try { if (typeof s2GuestbookWishes === 'function') return s2GuestbookWishes(inv); } catch(e){}
      return [];
    }
    /* Nama tamu dari kode pada tautan personal ?to= (data Stage 2). */
    function guestNameFor(inv, code){
      if (!inv || !code) return null;
      try { if (typeof s2GuestByCode === 'function') return s2GuestByCode(inv.id, code); } catch(e){}
      return null;
    }
    function rsvpFormHTML(opts){
      if (opts.mode === 'preview') return `<div class="ok-box"><b>Formulir RSVP</b><p class="muted small" style="margin:4px 0 0">Formulir aktif di halaman publik setelah undangan diterbitkan. Di pratinjau, tampil sebagai contoh tampilan.</p></div>`;
      const ex = opts.existingRsvp || null;
      /* Tamu (lewat tautan personal ?to=) yang sudah punya respons melihat
         status terkirimnya — bukan formulir kosong — setelah muat ulang,
         dengan tombol ubah respons yang jelas. */
      if (ex && !opts.rsvpEdit){
        return `<div class="ok-box"><b>Respons Anda sudah terkirim</b><p class="muted small" style="margin:4px 0 12px">Atas nama <b>${esc(ex.name)}</b> — konfirmasi: <b>${esc(ex.status)}</b>${ex.status !== 'Tidak Hadir' ? ' · ' + (ex.count || 1) + ' orang' : ''}. Terima kasih! Bila ada perubahan, perbarui respons Anda lewat tombol di bawah.</p><button class="submit-btn" type="button" data-rsvp-edit>Ubah Respons</button>${opts.webIdentity ? `<p class="muted small" style="margin:12px 0 8px">Perangkat ini dipakai bersama? Orang lain yang membuka undangan ini dari peramban yang sama adalah responden <b>terpisah</b> — responsnya tidak menimpa respons Anda.</p><button class="submit-btn" type="button" data-rsvp-new-person style="background:var(--i-surface);color:var(--i-ink);border:1px solid var(--i-line)">Isi sebagai tamu lain</button>` : ''}</div>`;
      }
      const cur = ex ? ex.status : 'Hadir';
      const nm = ex ? ex.name : (opts.mode === 'demo' ? '' : (opts.guest === 'Bapak/Ibu/Saudara/i' ? '' : opts.guest));
      const cnt = ex ? Math.max(1, ex.count || 1) : 1;
      return `<form class="rsvp-form" data-rsvp-form>
        <div><label>Nama Anda</label><input name="name" required maxlength="60" placeholder="Tulis nama Anda" value="${esc(nm)}"></div>
        <div><label>Konfirmasi Kehadiran</label><div class="seg" data-seg>
          ${['Hadir','Masih Ragu','Tidak Hadir'].map(v => `<button type="button" class="${cur === v ? 'on' : ''}" data-val="${v}">${v}</button>`).join('')}</div></div>
        <div><label>Jumlah Tamu</label><select name="count">${[1,2,3,4].map(n => `<option value="${n}" ${cnt === n ? 'selected' : ''}>${n} orang</option>`).join('')}</select></div>
        <div><label>Ucapan & Doa (opsional)</label><textarea name="message" rows="3" maxlength="300" placeholder="Tulis ucapan untuk yang berbahagia…">${ex ? esc(ex.message || '') : ''}</textarea>${ex && ex.message ? '<label style="display:flex;gap:8px;align-items:center;font-weight:600;margin-top:8px"><input type="checkbox" name="clear-message" value="1" style="width:auto"> Hapus ucapan saya (respons kehadiran tetap tersimpan)</label><p class="muted small" style="margin:4px 0 0">Mengosongkan kotak ucapan saja <b>tidak</b> menghapus ucapan lama — centang pilihan ini bila Anda memang ingin menghapusnya.</p>' : '<p class="muted small" style="margin:4px 0 0">Boleh dikosongkan — respons tanpa ucapan tetap tercatat; tidak ada pesan kosong yang disimpan.</p>'}</div>
        <button class="submit-btn" type="submit">${ex ? 'Kirim Pembaruan' : 'Kirim Konfirmasi'}</button>
      </form>`;
    }

    /* Countdown global */
    setInterval(() => {
      $$('[data-cd]').forEach(el => {
        const target = new Date(el.dataset.cd).getTime();
        let diff = Math.max(0, target - Date.now());
        const d = Math.floor(diff/864e5), h = Math.floor(diff/36e5)%24, m = Math.floor(diff/6e4)%60, s = Math.floor(diff/1e3)%60;
        const set = (k,v) => { const n = el.querySelector('[data-'+k+']'); if (n) n.textContent = v; };
        set('d', d); set('h', String(h).padStart(2,'0')); set('m', String(m).padStart(2,'0')); set('s', String(s).padStart(2,'0'));
      });
    }, 1000);
