    /* ================================================================
       Kita Invite — STAGE 2: lapisan data terpusat + modul bisnis.
       Satu sumber data: undangan tetap record Stage 1 yang sama
       (key "vowora:v1:invitation:<id>"); entitas Stage 2 disimpan
       per koleksi dengan key "vowora:v1:<koleksi>" dan selalu
       merujuk invitationId / orderId yang sama.
       ================================================================ */
    const K2 = { users:'vowora:v1:users', guests:'vowora:v1:guests', rsvps:'vowora:v1:rsvps', orders:'vowora:v1:orders', payments:'vowora:v1:payments', services:'vowora:v1:service-requests', notifications:'vowora:v1:notifications', activity:'vowora:v1:activity', coupons:'vowora:v1:coupons', settings:'vowora:v1:settings', templates:'vowora:v1:templates-cms', tplHistory:'vowora:v1:templates-history', taxonomy:'vowora:v1:taxonomy', packages:'vowora:v1:packages', role:'vowora:v1:role', designer:'vowora:v1:designer', seeded:'vowora:v1:seeded2', quarantine:'vowora:v1:quarantine', backup:'vowora:v1:backup:pre-stage2-fix' };
    const CURRENT_USER = 'cust-1';
    function load2(key, fb){ const st = storageBackend(); if (!st) return fb; let v = null; try { v = st.getItem(key); } catch(e){ return fb; } if (v == null) return fb; try { const p = JSON.parse(v); return (p === null || p === undefined) ? fb : p; } catch(e){ /* JSON rusak: karantina isinya (jalur pemulihan), jangan diam-diam hilang */ try { quarantineRaw(key, v, 'json-rusak'); } catch(_){} return fb; } }
    function save2(key, val){ const st = storageBackend(); if (!st) return false; try { st.setItem(key, JSON.stringify(val)); return true; } catch(e){ return false; } }
    function uid2(p){ return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

    const S2 = {
      users: load2(K2.users, []),
      guests: load2(K2.guests, []),
      rsvps: load2(K2.rsvps, []),
      orders: load2(K2.orders, []),
      payments: load2(K2.payments, []),
      services: load2(K2.services, []),
      notifications: load2(K2.notifications, []),
      activity: load2(K2.activity, []),
      coupons: load2(K2.coupons, []),
      settings: Object.assign({storeName:'Kita Invite', supportEmail:'', publishNeedsPayment:true}, load2(K2.settings, {})),
      role: load2(K2.role, 'customer'),
      designerId: load2(K2.designer, 'des-1')
    };
    /* saveColl MENGEMBALIKAN hasil penulisan (true/false): pemanggil yang
       memberi konfirmasi sukses ke pengguna WAJIB memeriksa nilai ini —
       kegagalan simpan tidak boleh berlanjut seolah berhasil. */
    function saveColl(name){ return save2(K2[name], S2[name]); }
    function userById(id){ return S2.users.find(u => u.id === id) || {name:'—', role:'customer'}; }
    function logAct(text, scope, owner){ S2.activity.unshift({id:uid2('act'), text, scope:scope||'customer', owner:owner||null, at:Date.now()}); S2.activity = S2.activity.slice(0, 60); return saveColl('activity'); }
    function notify2(title, body, scope, owner){ S2.notifications.unshift({id:uid2('ntf'), title, body, scope:scope||'customer', owner:owner||null, at:Date.now(), read:false}); return saveColl('notifications'); }

    /* ---------- Sinkronisasi antar-tab (origin yang sama) ----------
       Setiap tab memegang salinan in-memory; tanpa sinkronisasi, tab lain
       menampilkan data basi dan penulisan ulang satu koleksi dari tab basi
       dapat menimpa perubahan terbaru tab lain. kiRefreshCollections()
       membaca ulang seluruh koleksi persisten dari storage — dipanggil
       (a) oleh listener "storage" yang hanya menyala di TAB LAIN saat ada
       penulisan, (b) saat tab kembali terlihat, dan (c) tepat sebelum
       penulisan kritis (RSVP, pembayaran, penugasan, checkout) agar
       mutasi selalu berangkat dari state tersimpan terbaru. */
    const KI_COLLS = ['users','guests','rsvps','orders','payments','services','notifications','activity','coupons'];
    function kiRefreshCollections(){
      KI_COLLS.forEach(n => { S2[n] = load2(K2[n], S2[n]); });
      S2.settings = Object.assign({storeName:'Kita Invite', supportEmail:'', publishNeedsPayment:true}, load2(K2.settings, {}));
    }
    let _kiSyncBusy = false;
    function kiSyncFromStorage(){
      if (_kiSyncBusy) return; _kiSyncBusy = true;
      try {
        /* Draft Builder yang autosave-nya masih tertunda di tab INI tidak
           boleh ditimpa salinan storage: pertahankan salinan lokalnya. */
        const pending = {};
        try { Object.keys(_saveTimers || {}).forEach(id => { const inv = S.invitations.find(i => i.id === id); if (inv) pending[id] = inv; }); } catch(e){}
        kiRefreshCollections();
        hydrateInvitationsFromStorage();
        Object.keys(pending).forEach(id => { const ix = S.invitations.findIndex(i => i.id === id); if (ix >= 0) S.invitations[ix] = pending[id]; else S.invitations.unshift(pending[id]); });
        const seg = parseHash().seg;
        if (['dashboard','admin','desainer','checkout','bayar','faktur'].includes(seg[0])) s2Render(); else render();
      } catch(e){}
      _kiSyncBusy = false;
    }
    window.addEventListener('storage', e => {
      if (e.key === K2.seeded && e.newValue === null){ location.reload(); return; } /* tab lain mereset: muat ulang agar seed konsisten */
      if (e.key === null || (e.key && e.key.indexOf('vowora:') === 0)) kiSyncFromStorage();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      const a = document.activeElement;
      if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName || '')) return; /* jangan ganggu tab yang sedang mengedit */
      /* Hanya rute data (dashboard/admin/desainer/checkout/bayar/faktur)
         yang disegarkan saat tab kembali terlihat — halaman publik tamu
         tidak dirender ulang di sini agar amplop & posisi baca tamu tidak
         tereset; perubahan nyata dari tab lain tetap masuk lewat event
         "storage" di atas. */
      if (!['dashboard','admin','desainer','checkout','bayar','faktur'].includes(parseHash().seg[0])) return;
      kiSyncFromStorage();
    });

    /* ---------- Terapkan override CMS (template, taksonomi, paket) sebelum seed ---------- */
    (function applyCms(){
      const tax = load2(K2.taxonomy, {cats:[], styles:[]});
      (tax.cats||[]).forEach(c => { if (!DB.categories.some(x => x.id === c.id)) DB.categories.push(c); });
      (tax.styles||[]).forEach(s => { if (!DB.styles.some(x => x.id === s.id)) DB.styles.push(s); });
      const pkgOv = load2(K2.packages, {});
      DB.packages.forEach(p => { if (pkgOv[p.id]) { p.price = pkgOv[p.id].price; p.features = pkgOv[p.id].features || p.features; } });
      /* Masa aktif paket SUDAH diputuskan: dihitung sejak undangan
         diterbitkan — Basic 1 bulan, Premium 6 bulan, Signature 12 bulan,
         Exclusive 18 bulan. accessMonths ditegakkan di sini untuk semua
         paket (termasuk yang fiturnya pernah disimpan admin), dan baris
         fitur lama "(belum ditetapkan)" dari override CMS lama diganti
         baris keputusan ini. Idempoten. Harga tidak disentuh di sini. */
      const ACC_LINE = {basic:'Masa aktif 1 bulan sejak diterbitkan', premium:'Masa aktif 6 bulan sejak diterbitkan', signature:'Masa aktif 12 bulan sejak diterbitkan', exclusive:'Masa aktif 18 bulan sejak diterbitkan'};
      const ACC_MONTHS = {basic:1, premium:6, signature:12, exclusive:18};
      DB.packages.forEach(p => { if (ACC_MONTHS[p.id]) p.accessMonths = ACC_MONTHS[p.id]; p.features = (p.features || []).filter(f => !/belum ditetapkan/i.test(f)); if (ACC_LINE[p.id] && !p.features.includes(ACC_LINE[p.id])) p.features = p.features.concat(ACC_LINE[p.id]); });
      /* Snapshot versi bawaan sebelum override CMS: inilah versi immutable
         yang terus dipakai undangan lama (lihat TPL_VERSIONS). */
      const PRISTINE = {}; TEMPLATES.forEach(t => { PRISTINE[t.id] = t; TPL_VERSIONS[t.id + '@' + t.version] = t; });
      const cms = load2(K2.templates, []);
      cms.forEach(rec => {
        const ix = TEMPLATES.findIndex(t => t.id === rec.id);
        if (ix >= 0){
          const base = TEMPLATES[ix];
          TEMPLATES[ix] = Object.assign({}, base, {name:rec.name, desc:rec.desc, price:rec.price, tier:rec.tier, categoryId:rec.categoryId, styleId:rec.styleId, status:rec.status, version:rec.version, thumb:rec.thumb, sections:rec.sections && rec.sections.length ? rec.sections : base.sections, features:rec.features && rec.features.length ? rec.features : base.features});
        } else {
          const base = TEMPLATES.find(t => t.id === rec.baseId) || TEMPLATES[0];
          TEMPLATES.push(tpl({id:rec.id, slug:rec.slug, name:rec.name, categoryId:rec.categoryId, styleId:rec.styleId, tier:rec.tier, price:rec.price, thumb:rec.thumb || base.thumb, ornament:base.ornament, fontId:base.fontId, desc:rec.desc, palettes:base.palettes, sections:rec.sections && rec.sections.length ? rec.sections : base.sections, features:rec.features && rec.features.length ? rec.features : base.features, version:rec.version, status:rec.status}));
        }
      });
      TEMPLATES.forEach(t => { TPL_VERSIONS[t.id + '@' + t.version] = t; });
      /* Snapshot riwayat versi dari CMS (tersimpan saat admin menyimpan versi
         baru) didaftarkan di atas template bawaan asal, agar undangan yang
         menunjuk versi itu dirender persis seperti saat dibuat. */
      const hist = load2(K2.tplHistory, {});
      Object.keys(hist).forEach(tid => {
        const rec = cms.find(x => x.id === tid);
        const base = PRISTINE[tid] || PRISTINE[rec && rec.baseId] || TEMPLATES[0];
        Object.keys(hist[tid] || {}).forEach(vn => { TPL_VERSIONS[tid + '@' + vn] = Object.assign({}, base, hist[tid][vn]); });
      });
      DB.categories.forEach(c => c.count = TEMPLATES.filter(t => t.categoryId === c.id && t.status === 'published').length);
    })();
    /* Template CMS kini sudah diterapkan — muat ulang undangan dari storage.
       Hydration Stage 1 berjalan sebelum CMS, jadi undangan yang template-nya
       dibuat dari CMS akan terlewat tanpa langkah ini. Idempoten: sumbernya
       record persisten yang sama. */
    hydrateInvitationsFromStorage();
    function persistCmsTemplate(rec){
      const all = load2(K2.templates, []);
      const ix = all.findIndex(x => x.id === rec.id);
      if (ix >= 0) all[ix] = rec; else all.push(rec);
      return save2(K2.templates, all);
    }

