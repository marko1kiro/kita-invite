    /* ================= BUILDER ================= */
    const SECTION_META = {
      cover:['Sampul','Judul, foto utama, dan sambutan tamu'], quote:['Kutipan Pembuka','Ayat atau kutipan di awal undangan'],
      subjects:['Mempelai / Subjek Utama','Profil orang yang dirayakan'], org:['Profil Penyelenggara','Nama & tagline perusahaan/organisasi'],
      countdown:['Countdown','Hitung mundur ke acara pertama'], events:['Waktu & Tempat','Detail sesi acara dan lokasi'],
      story:['Cerita / Tentang Acara','Narasi kisah atau deskripsi acara'], timeline:['Rangkaian Acara','Susunan acara per jam'],
      dresscode:['Dress Code','Panduan busana tamu'], gallery:['Galeri','Foto-foto pilihan'],
      gift:['Amplop Digital','Rekening & alamat kirim kado'], rsvp:['RSVP & Ucapan','Formulir konfirmasi dan buku ucapan'],
      closing:['Penutup','Kalimat terima kasih penutup']
    };
    const B = { inv:null, tab:'sampul', mob:'edit', readonly:false };
    /* ---------- Kepemilikan undangan (P1) ----------
       Undangan hanya boleh DILIHAT dan DIUBAH oleh pemilik yang sedang
       aktif. Pengecualian satu-satunya: Admin — lewat aksi admin yang
       jelas — boleh MEMBUKA Builder dalam mode hanya-lihat; penulisan
       oleh bukan-pemilik tetap ditolak di handler & jalur simpan, bukan
       sekadar tombol yang disembunyikan. CURRENT_USER/S2 didefinisikan
       Stage 2, jadi aksesnya lewat try/catch (render awal Stage 1
       berjalan sebelum Stage 2 siap, lalu dirender ulang oleh Stage 2). */
    function kiUid(){ try { return CURRENT_USER; } catch(e){ return null; } }
    function kiRole(){ try { return S2 && S2.role; } catch(e){ return null; } }
    /* Kepemilikan diperiksa sebagai ROLE + OWNER sekaligus: persona
       pelanggan aktif (CURRENT_USER) hanya berlaku saat peran aktif
       memang 'customer'. Admin/Desainer TIDAK pernah dianggap pemilik
       lewat CURRENT_USER — Admin menulis hanya lewat grant eksplisit,
       Desainer tidak menulis undangan sama sekali. */
    function kiOwns(inv){ const u = kiUid(); const role = kiRole(); if (role && role !== 'customer') return false; return !!inv && !!u && !!inv.ownerId && inv.ownerId === u; }
    function kiAdmin(){ return kiRole() === 'admin'; }
    /* Izin tulis Admin lintas-pemilik bersifat EKSPLISIT dan hanya berlaku
       sesi ini (tidak disimpan): default-nya Admin hanya MENGINSPEKSI
       (mode hanya-lihat). Admin harus mengaktifkannya lewat tombol
       "Aktifkan Izin Tulis Admin" — tanpa itu semua handler tulis menolak. */
    function kiAdminWrite(){ try { return window.__kiAdminWrite === true; } catch(e){ return false; } }
    function kiGuardWrite(inv){
      if (kiOwns(inv)) return true;
      if (kiAdmin() && kiAdminWrite()) return true;
      toast(kiAdmin() ? 'Mode inspeksi Admin: izin tulis lintas-pemilik belum diaktifkan — perubahan ditolak. Aktifkan izin tulis secara eksplisit dulu.' : 'Akses ditolak: undangan ini milik akun lain — perubahan tidak disimpan.', true);
      return false;
    }
    /* Predikat PERSISTENSI Builder (dipakai scheduleAutosave/flushAutosave):
       pemilik aktif, ATAU Admin dengan grant tulis eksplisit sesi ini.
       Inilah yang membuat grant Admin benar-benar mengaktifkan penulisan
       sampai ke lapisan simpan — tanpa grant, autosave tidak menulis apa
       pun walau editor terlihat terbuka. */
    function kiCanPersist(inv){
      if (!inv) return false;
      if (kiOwns(inv)) return true;
      return kiAdmin() && kiAdminWrite();
    }
    function studioForbidden(){
      return shell(`<div class="wrap" style="padding:70px 20px 100px"><div class="empty"><h3>Akses ditolak</h3><p>Undangan ini milik akun demo lain. Builder hanya dapat dibuka oleh pemilik undangan yang sedang aktif — membuka URL Builder milik akun lain tidak memberi akses lihat maupun ubah. Admin dapat membukanya dalam mode hanya-lihat dari panel Admin.</p><a class="btn gold" href="#/dashboard">Ke Dashboard Saya</a> <a class="btn ghost" href="#/draft-saya">Draft Saya</a></div></div>`, '');
    }

    function viewStart(t){
      const drafts = S.invitations.filter(i => i.templateId === t.id && (kiOwns(i) || kiAdmin()));
      const html = `<div class="wrap" style="padding:38px 20px 90px;max-width:760px">
        <p class="crumbs" style="padding-top:0"><a href="#/template/${t.slug}">← ${esc(t.name)}</a></p>
        <h1 style="font-size:32px;margin-bottom:8px">Mulai membuat undangan</h1>
        <p style="color:var(--ink-2);margin:0 0 24px">Template <b>${esc(t.name)}</b> (v${t.version}.0) akan menjadi fondasi undangan Anda. Konten contoh terisi otomatis — tinggal ganti dengan data acara Anda di Builder, dan Live Preview akan mengikuti setiap perubahan.</p>
        ${drafts.length ? `<h3 style="font-family:var(--font-ui);font-size:15px;margin-bottom:12px">Lanjutkan draft dari template ini</h3>` + drafts.map(inv => `<div class="draft-card"><img src="${mediaById(inv.content.coverPhoto || t.thumb).src}" alt=""><div><b>${esc(inv.title)}</b><span>${inv.status==='published' ? 'Terbit · /u/' + inv.slug : 'Draft'} · diubah ${new Date(inv.updatedAt).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div><a class="btn gold sm" href="#/studio/${inv.id}">Lanjutkan</a></div>`).join('') : ''}
        <button class="btn ${drafts.length ? 'ghost' : 'gold'} block" data-new-draft="${t.slug}" style="margin-top:10px">${ICONS.plus} Buat Undangan Baru dari Template Ini</button>
      </div>`;
      return shell(html, 'template');
    }

    function fld(label, path, val, extra){
      extra = extra || {};
      const id = 'f-' + path.replace(/[^a-z0-9]/gi, '-');
      const input = extra.area
        ? `<textarea class="textarea input" id="${id}" data-bind="${path}" rows="${extra.rows||3}" placeholder="${extra.ph||''}">${esc(val)}</textarea>`
        : `<input class="input" id="${id}" data-bind="${path}" value="${esc(val)}" placeholder="${extra.ph||''}" ${extra.type ? `type="${extra.type}"` : ''}>`;
      return `<div class="field"><label for="${id}">${label}</label>${input}${extra.hint ? `<p class="hint">${extra.hint}</p>` : ''}</div>`;
    }

    function editorPanel(inv){
      const t = TEMPLATES.find(x => x.id === inv.templateId);
      const c = inv.content, tab = B.tab;
      if (tab === 'sampul'){
        let subjectsHTML = '';
        if (inv.categoryId === 'korporat'){
          subjectsHTML = fld('Nama perusahaan / penyelenggara', 'content.orgName', c.orgName) + fld('Tagline acara', 'content.orgTagline', c.orgTagline);
        } else {
          subjectsHTML = c.subjects.map((s, i) => `<div class="ev-edit"><h4>${esc(s.role || 'Subjek ' + (i+1))} ${c.subjects.length > 1 ? `<button class="mini-btn" data-del-subject="${i}">Hapus</button>` : ''}</h4>
            ${fld('Peran / label', 'content.subjects.' + i + '.role', s.role)}
            ${fld('Nama lengkap', 'content.subjects.' + i + '.name', s.name)}
            ${fld('Nama panggilan (untuk sampul)', 'content.subjects.' + i + '.nick', s.nick)}
            ${fld('Keterangan (orang tua / pencapaian)', 'content.subjects.' + i + '.detail', s.detail, {area:true, rows:2})}
            <div class="field"><label>Foto profil</label><div class="media-grid">${DB.media.map(m => `<button type="button" class="media-item ${s.photo===m.id?'on':''}" data-subject-photo="${i}:${m.id}"><img src="${m.src}" alt="${esc(m.name)}"><span class="ck2">${ICONS.check}</span><span class="cap">${esc(m.name)}</span></button>`).join('')}</div></div>
          </div>`).join('') + (c.subjects.length < 2 ? `<button class="btn ghost sm" data-add-subject>${ICONS.plus} Tambah Subjek Kedua</button>` : '');
        }
        return `<div class="b-panel"><h2>Sampul & Subjek</h2><p class="sub">Bagian pertama yang dilihat tamu. Perubahan nama langsung tampil di sampul pratinjau.</p>
          ${fld('Teks pembuka sampul', 'content.coverKicker', c.coverKicker, {ph:'cth. The Wedding Of'})}
          <div class="field"><label>Foto sampul</label><div class="media-grid">${DB.media.map(m => `<button type="button" class="media-item ${(c.coverPhoto||'')===m.id?'on':''}" data-cover-photo="${m.id}"><img src="${m.src}" alt="${esc(m.name)}"><span class="ck2">${ICONS.check}</span><span class="cap">${esc(m.name)}</span></button>`).join('')}</div><p class="hint">Pilih dari pustaka media demo Kita Invite.</p></div>
          ${subjectsHTML}</div>`;
      }
      if (tab === 'cerita'){
        return `<div class="b-panel"><h2>Kutipan & Cerita</h2><p class="sub">Kutipan pembuka dan narasi acara Anda.</p>
          ${fld('Kutipan pembuka', 'content.quote', c.quote, {area:true, rows:3})}
          ${fld('Sumber kutipan', 'content.quoteSource', c.quoteSource, {ph:'cth. QS. Ar-Rum: 21'})}
          ${fld(inv.categoryId==='korporat' ? 'Deskripsi acara' : 'Cerita / kisah', 'content.story', c.story, {area:true, rows:5})}</div>`;
      }
      if (tab === 'acara'){
        const evs = c.events.map((e, i) => `<div class="ev-edit"><h4>Acara ${i+1} ${c.events.length > 1 ? `<button class="mini-btn" data-del-event="${i}">Hapus</button>` : ''}</h4>
          ${fld('Nama sesi', 'content.events.' + i + '.label', e.label, {ph:'cth. Akad Nikah / Resepsi'})}
          <div class="row2">${fld('Tanggal', 'content.events.' + i + '.date', e.date, {type:'date'})}${fld('Tempat / venue', 'content.events.' + i + '.venue', e.venue)}</div>
          <div class="row2">${fld('Jam mulai', 'content.events.' + i + '.timeStart', e.timeStart, {ph:'08.00'})}${fld('Jam selesai', 'content.events.' + i + '.timeEnd', e.timeEnd, {ph:'10.00'})}</div>
          ${fld('Alamat lengkap', 'content.events.' + i + '.address', e.address, {area:true, rows:2, hint:'Tombol peta di undangan membuka pencarian Google Maps dari nama venue + alamat ini.'})}
        </div>`).join('');
        const tls = c.timeline.map((x, i) => `<div class="ev-edit"><h4>Item ${i+1} ${c.timeline.length > 1 ? `<button class="mini-btn" data-del-tl="${i}">Hapus</button>` : ''}</h4>
          <div class="row2">${fld('Jam', 'content.timeline.' + i + '.time', x.time, {ph:'08.00'})}${fld('Judul', 'content.timeline.' + i + '.title', x.title)}</div>
          ${fld('Keterangan', 'content.timeline.' + i + '.desc', x.desc)}</div>`).join('');
        const DC = ['#E8DED0','#B79B72','#93A488','#C49A94','#FFFFFF','#302D29','#3E5C76','#D9638C'];
        return `<div class="b-panel"><h2>Waktu & Tempat</h2><p class="sub">Sesi acara yang tampil sebagai kartu di undangan, lengkap dengan tombol lokasi.</p>${evs}
          <button class="btn ghost sm" data-add-event>${ICONS.plus} Tambah Sesi Acara</button></div>
          <div class="b-panel"><h2>Rangkaian Acara</h2><p class="sub">Timeline rundown untuk tamu.</p>${tls}
          <button class="btn ghost sm" data-add-tl>${ICONS.plus} Tambah Item Timeline</button></div>
          <div class="b-panel"><h2>Dress Code</h2><p class="sub">Panduan busana beserta contoh warnanya.</p>
          ${fld('Catatan dress code', 'content.dressNote', c.dressNote, {area:true, rows:2})}
          <div class="field"><label>Palet warna contoh (ketuk untuk memilih)</label><div style="display:flex;gap:9px;flex-wrap:wrap">${DC.map(hx => `<button type="button" data-dress-color="${hx}" aria-label="Warna ${hx}" style="width:40px;height:40px;border-radius:50%;background:${hx};border:3px solid ${(c.dressColors||[]).includes(hx) ? 'var(--gold-deep)' : 'var(--line)'}"></button>`).join('')}</div></div></div>`;
      }
      if (tab === 'media'){
        return `<div class="b-panel"><h2>Media & Galeri</h2><p class="sub">Ketuk foto untuk menambah atau melepasnya dari galeri undangan. Foto pertama tampil besar di galeri.</p>
          <div class="media-grid">${DB.media.map(m => `<button type="button" class="media-item ${c.gallery.includes(m.id)?'on':''}" data-gal-toggle="${m.id}"><img src="${m.src}" alt="${esc(m.name)}"><span class="ck2">${ICONS.check}</span><span class="cap">${esc(m.name)} · ${esc(m.tag)}</span></button>`).join('')}</div>
          <p class="hint" style="margin-top:12px">${c.gallery.length} foto terpilih. Aset berasal dari pustaka media demo; unggah berkas pribadi tersedia pada tahap penyimpanan nyata.</p></div>`;
      }
      if (tab === 'desain'){
        return `<div class="b-panel"><h2>Warna & Tipografi</h2><p class="sub">Palet dan pasangan huruf milik template ${esc(t.name)} — pratinjau berubah seketika.</p>
          <div class="field"><label>Palet warna</label><div class="pal-row">${t.palettes.map(p => `<button type="button" class="pal-opt ${inv.design.paletteId===p.id?'on':''}" data-pal="${p.id}"><span class="dots"><i style="background:${p.v.bg}"></i><i style="background:${p.v.accent}"></i><i style="background:${p.v.ink}"></i><i style="background:${p.v.surface}"></i></span><b>${esc(p.name)}</b><span>${esc(p.v.bg)} · aksen ${esc(p.v.accent)}</span></button>`).join('')}</div></div>
          <div class="field"><label>Pasangan tipografi</label>${FONT_PAIRS.map(f => `<button type="button" class="font-opt ${inv.design.fontId===f.id?'on':''}" data-font="${f.id}"><span class="big" style="font-family:${f.display}">${esc(f.sample)}</span><span>${esc(f.name)} — judul ${esc(f.display.split(',')[0].replace(/"/g,''))}, isi ${esc(f.body.split(',')[0].replace(/"/g,''))}</span></button>`).join('')}</div>
          <div class="field"><label>Ornamen pemisah seksi</label><div style="display:flex;gap:8px;flex-wrap:wrap">${Object.entries(ORNAMENTS).map(([k, o]) => `<button type="button" class="chip ${inv.design.ornament===k?'on':''}" data-orn="${k}">${o.svg} ${esc(o.name)}</button>`).join('')}</div></div></div>`;
      }
      if (tab === 'seksi'){
        /* Daftar sakelar mengikuti snapshot versi template milik draft ini
           (ditambah kunci seksi yang tersimpan di draft), BUKAN template
           versi terbaru — seksi yang dihapus dari template baru tetap punya
           kontrol edit di draft lama yang memakainya. */
        const snapT = (inv.templateVersion && TPL_VERSIONS[inv.templateId + '@' + inv.templateVersion]) || t;
        const secList = [...new Set([...(snapT.sections || []), ...Object.keys(inv.sections || {})])].filter(s => s !== 'cover' && SECTION_META[s]);
        return `<div class="b-panel"><h2>Visibilitas Seksi</h2><p class="sub">Sembunyikan seksi yang tidak relevan dengan acara Anda. Sampul selalu tampil. Pilihan di sini milik draft Anda (template v${inv.templateVersion}.0) dan tidak berubah walau template diperbarui admin.</p>
          ${secList.map(s => `<div class="vis-row"><div><b>${SECTION_META[s][0]}</b><span>${SECTION_META[s][1]}${t.sections.includes(s) ? '' : ' · Tidak ada di template versi terbaru — pilihan draft Anda tetap dipertahankan.'}</span></div><label class="switch"><input type="checkbox" data-vis="${s}" ${inv.sections[s] !== false ? 'checked' : ''}><i></i></label></div>`).join('')}</div>
          <div class="b-panel"><h2>Amplop Digital & Penutup</h2><p class="sub">Rekening tanda kasih dan kalimat terima kasih. Kosongkan nomor rekening untuk menyembunyikan kartu bank.</p>
          <div class="row2">${fld('Bank / e-wallet', 'content.gift.bank', c.gift.bank, {ph:'cth. BCA'})}${fld('Nomor rekening', 'content.gift.number', c.gift.number)}</div>
          ${fld('Atas nama', 'content.gift.holder', c.gift.holder)}
          ${fld('Alamat kirim kado fisik (opsional)', 'content.gift.address', c.gift.address, {area:true, rows:2})}
          ${fld('Kalimat penutup', 'content.closing', c.closing, {area:true, rows:4})}</div>`;
      }
      if (tab === 'terbit'){
        const checks = validateInvitation(inv);
        const allOk = checks.every(x => x.ok);
        const pub = inv.status === 'published';
        const gateBlock = !pub && typeof publishBlockedByGate === 'function' ? publishBlockedByGate(inv) : null;
        return `<div class="b-panel"><h2>Terbitkan Undangan</h2><p class="sub">Pastikan semua kebutuhan dasar terpenuhi. Undangan terbit mendapat tautan unik yang membuka renderer publik di aplikasi ini.</p>
          <div class="check-list">${checks.map(x => `<div>${x.ok ? `<span class="ic-ok">${ICONS.check}</span>` : `<span class="ic-no">${ICONS.warn}</span>`}<span>${esc(x.label)}</span>${x.ok ? '' : `<button class="fix" data-goto-tab="${x.tab}">Perbaiki</button>`}</div>`).join('')}</div>
          ${pub ? `<div class="slug-box"><div class="url">${esc(publicUrl(inv.slug))}</div><button class="btn soft sm" data-copy="${esc(publicUrl(inv.slug))}">${ICONS.copy} Salin</button><a class="btn gold sm" href="#/u/${inv.slug}">${ICONS.eye} Buka Undangan</a></div>
          <p class="hint" style="margin-top:12px">Undangan sudah terbit sejak ${new Date(inv.publishedAt).toLocaleString('id-ID')}. Perubahan konten yang Anda simpan akan tampil di tautan yang sama.</p>
          ${typeof invAccessEndsAt === 'function' && invAccessEndsAt(inv) ? `<p class="hint" style="margin-top:6px">Masa aktif paket berakhir ${new Date(invAccessEndsAt(inv)).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})} — dihitung sejak terbit sesuai durasi paket undangan ini.</p>` : (`<p class="hint" style="margin-top:6px;color:var(--warn)"><b>Paket belum terselesaikan:</b> undangan terbit ini tidak mempunyai paket yang dapat dibuktikan dari pesanan terkait (packageId kosong atau tidak dikenal, atau tanggal terbit tak terbukti), jadi masa aksesnya belum terhitung dan tidak diklaim di sini.</p>`)}`
          : `<button class="btn gold block" data-publish ${allOk && !gateBlock ? '' : 'disabled'}>${ICONS.send} Terbitkan Undangan</button>
          ${gateBlock ? `<p class="hint" style="margin-top:10px;color:var(--err)">${esc(gateBlockText(gateBlock))}</p>` : allOk ? `<p class="hint" style="margin-top:10px">Tautan akan dibuat dari nama undangan: <b>/u/${slugify(inv.title)}</b></p>` : `<p class="hint" style="margin-top:10px;color:var(--err)">Lengkapi dulu item bertanda seru di atas untuk menerbitkan.</p>`}`}
          </div>
          <div class="b-panel"><h2>Paket Undangan</h2><p class="sub">Template ini berada di paket <b>${esc(t.tier)}</b> (${rp(t.price)}). Pesan paketnya lewat checkout simulasi — pembayaran yang berhasil mengaktifkan paket untuk undangan ini dan tercatat di Dashboard.</p>
          <a class="btn gold sm" href="#/checkout?inv=${inv.id}">Pesan Paket Ini (Simulasi)</a> <a class="btn ghost sm" href="#/dashboard?tab=pesanan">Lihat Pesanan Saya</a></div>`;
      }
      return '';
    }

    function navBtn(tab, icon, label){ return `<button data-btab="${tab}" class="${B.tab===tab?'on':''}">${ICONS[icon]} ${label}</button>`; }
    function viewStudio(inv, readonly){
      B.inv = inv; B.readonly = !!readonly;
      const t = TEMPLATES.find(x => x.id === inv.templateId);
      const previewHTML = renderInvitation(inv, {mode:'preview', envelope:false, wishes: []});
      return `
      <header class="topbar"><div class="topbar-in">
        <a class="brand" href="#/">Kita <em>Invite</em><small>Builder Studio</small></a>
        <nav class="nav"><a href="#/template">Template</a><a href="#/draft-saya">Draft Saya</a><a href="#/template/${t.slug}">Detail Template</a></nav>
        <a class="btn ghost sm desk" href="#/template" style="min-height:44px">Keluar</a>
      </div></header>
      <div class="builder-head"><div class="builder-head-in">
        <a href="#/draft-saya" style="font-weight:800;font-size:14px">←</a>
        <div class="ttl">${esc(inv.title)}<small>Template ${esc(t.name)} v${inv.templateVersion}.0 · paket ${esc(t.tier)}</small></div>
        <span class="status-pill ${inv.status==='published' ? 'pub' : ''}">${inv.status === 'published' ? 'Terbit' : 'Draft'}</span>
        ${readonly ? '<span class="save-status" role="status">Hanya-baca</span><span class="saved-note">Mode lihat Admin — perubahan tidak disimpan</span>' : `<span class="save-status ${SAVE_STATE.status==='error' ? 'error' : SAVE_STATE.status==='saving' ? 'saving' : 'saved'}" id="save-status" role="status">${SAVE_STATE.status==='error' ? 'Gagal menyimpan' : SAVE_STATE.status==='saving' ? 'Menyimpan…' : 'Tersimpan'}</span>
        <span class="saved-note" id="saved-note">${SAVE_STATE.status==='error' ? 'Penyimpanan lokal tidak tersedia — perubahan hanya bertahan selama sesi ini.' : 'Tersimpan otomatis · terakhir diubah ' + new Date(inv.updatedAt).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span>`}
        <span style="margin-left:auto;display:flex;gap:8px">
          ${readonly ? '<span class="status-pill">Mode Admin — Hanya Lihat</span>' : `<button class="btn soft sm" data-save>${ICONS.check} Simpan Draft</button>
          <button class="btn gold sm" data-btab="terbit">Terbitkan</button>`}
        </span>
      </div></div>
      ${readonly ? '<div style="background:#F3E3C8;color:#7A5410;padding:10px 20px;font-size:13.5px;font-weight:700;text-align:center">Mode inspeksi Admin: undangan ini milik akun lain. Isinya dapat diperiksa, tetapi semua perubahan ditolak di handler dan tidak disimpan. <button type="button" class="btn ghost sm" data-admin-write style="margin-left:8px">Aktifkan Izin Tulis Admin (eksplisit, sesi ini saja)</button></div>' : (kiAdmin() && !kiOwns(inv) ? '<div style="background:#F9E9E4;color:var(--err);padding:10px 20px;font-size:13.5px;font-weight:700;text-align:center">Izin tulis Admin lintas-pemilik AKTIF untuk sesi ini — perubahan pada undangan akun lain akan disimpan. <button type="button" class="btn ghost sm" data-admin-write-off style="margin-left:8px">Matikan Izin Tulis</button></div>' : '')}
      <div class="mobile-tabs" role="tablist">
        <button data-mob="edit" class="${B.mob==='edit'?'on':''}">${ICONS.edit} Editor</button>
        <button data-mob="preview" class="${B.mob==='preview'?'on':''}">${ICONS.eye} Live Preview</button>
      </div>
      <div class="builder-grid" id="builder-root">
        <aside class="b-nav">
          <div class="grp">Konten</div>
          ${navBtn('sampul','edit','Sampul & Subjek')}
          ${navBtn('cerita','type','Kutipan & Cerita')}
          ${navBtn('acara','cal','Acara & Waktu')}
          ${navBtn('media','img','Media & Galeri')}
          <div class="grp">Desain</div>
          ${navBtn('desain','palette','Warna & Tipografi')}
          ${navBtn('seksi','layers','Seksi, Amplop & Penutup')}
          <div class="grp">Selesai</div>
          ${navBtn('terbit','send','Terbitkan')}
        </aside>
        <div class="b-main ${B.mob==='preview' ? 'hidden' : ''}" id="b-main">${readonly ? `<fieldset disabled style="border:0;margin:0;padding:0;min-width:0">${editorPanel(inv)}</fieldset>` : editorPanel(inv)}</div>
        <aside class="b-preview ${B.mob==='preview' ? 'mob-show' : ''}" id="b-preview">
          <p style="text-align:center;font-size:12.5px;font-weight:800;letter-spacing:.14em;color:var(--ink-3);margin:0 0 10px">LIVE PREVIEW — BERUBAH SAAT ANDA MENGEDIT</p>
          <div class="phone-shell"><div class="phone-screen" id="b-preview-zone">${previewHTML}</div></div>
        </aside>
      </div>`;
    }
    function updatePreview(){
      const zone = $('#b-preview-zone'); if (!zone || !B.inv) return;
      zone.innerHTML = renderInvitation(B.inv, {mode:'preview', envelope:false, wishes: []});
      scheduleAutosave(B.inv);
    }
    function setPath(obj, path, val){
      const keys = path.split('.'); let cur = obj;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = val;
    }

    /* ================= ROUTER ================= */
    let pendingScroll = null;
    function parseHash(){
      const raw = (location.hash || '#/').slice(1);
      const [path, qs] = raw.split('?');
      return { seg: path.split('/').filter(Boolean), params: Object.fromEntries(new URLSearchParams(qs || '')) };
    }
      function render(){
      const { seg, params } = parseHash();
      /* Rute milik Stage 2 (dashboard/admin/desainer/checkout/bayar/
         faktur/draft-saya) TIDAK pernah dilukis router ini: melukisnya
         di sini hanya menghasilkan kilasan "Halaman tidak ditemukan"
         (router ini tidak mengenal rute-rute itu) sebelum s2Render
         melukis tampilan yang benar — dan pada navigasi hash-yang-sama
         lewat go() kilasan itu MACET sampai reload. s2Render memiliki
         rute-rute ini sepenuhnya (hashchange + render awal Stage 2). */
      if (['dashboard','admin','desainer','checkout','bayar','faktur','draft-saya'].indexOf(seg[0]) >= 0) return;
      let html;
      if (seg.length === 0) html = viewHome();
      else if (seg[0] === 'template' && seg.length === 1) html = viewMarketplace(params);
      else if (seg[0] === 'template' && seg[1]) { const t = templateBySlug(seg[1]); html = t ? viewDetail(t) : notFound(); }
      else if (seg[0] === 'demo' && seg[1]) { const t = templateBySlug(seg[1]); html = t ? viewDemo(t) : notFound(); }
      else if (seg[0] === 'buat' && seg[1]) { const t = templateBySlug(seg[1]); html = t ? viewStart(t) : notFound(); }
      else if (seg[0] === 'studio' && seg[1]) { const inv = S.invitations.find(i => i.id === seg[1]); if (!inv && !window.__kiS2Ready) return; /* data Stage 2 belum siap (render awal berjalan sebelum seed): jangan lukis "tidak ditemukan" untuk undangan yang sebenarnya ada — render ulang di akhir Stage 2 melukisnya dengan benar */ html = !inv ? notFound() : kiOwns(inv) ? viewStudio(inv, false) : kiAdmin() ? viewStudio(inv, !kiAdminWrite()) : studioForbidden(); }
      else if (seg[0] === 'draft-saya') html = viewDrafts();
      else if (seg[0] === 'peta-jalan') html = viewRoadmap();
      else if (seg[0] === 'rencana-cloudflare') html = viewPlan();
      else if (seg[0] === 'u' && seg[1]) { const inv = S.invitations.find(i => i.slug === seg[1]); if (!inv && !window.__kiS2Ready) return; /* sama seperti studio: slug belum termuat bukan berarti tidak ada */ const expired = !!(inv && typeof invStatus === 'function' && invStatus(inv).key === 'expired'); const pub = inv && inv.status === 'published' && !inv.archived && !expired ? inv : null; app.innerHTML = expired ? viewAccessEnded(inv) : viewPublic(pub, pub ? guestNameFor(pub, params.to) : null, params.to); window.scrollTo(0,0); return; }
      else html = notFound();
      app.innerHTML = html;
      if (seg[0] === 'template' && seg.length === 1) renderMktResults();
      if (pendingScroll){
        const target = document.getElementById(pendingScroll); pendingScroll = null;
        if (target) setTimeout(() => target.scrollIntoView({behavior:'smooth'}), 60);
      } else window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', render);

    /* ================= HANDLER GLOBAL ================= */
    document.addEventListener('click', e => {
      const scrollLink = e.target.closest('[data-scroll]');
      if (scrollLink){
        e.preventDefault();
        const id = scrollLink.dataset.scroll;
        if ((location.hash || '#/') === '#/' || location.hash === ''){ const el = document.getElementById(id); if (el) el.scrollIntoView({behavior:'smooth'}); }
        else { pendingScroll = id; location.hash = '#/'; }
        return;
      }
      const burger = e.target.closest('[data-menu]');
      if (burger){
        const old = $('.m-menu'); if (old) { old.remove(); return; }
        const m = document.createElement('div'); m.className = 'm-menu';
        m.innerHTML = `<a href="#/">Beranda</a><a href="#/template">Template</a><a href="#/demo/luxury-ivory">Demo Luxury Ivory</a><a href="#/dashboard">Dashboard</a><a href="#/admin">Admin</a>`;
        m.addEventListener('click', () => m.remove());
        document.body.appendChild(m); return;
      }
      const openBtn = e.target.closest('[data-open-inv]');
      if (openBtn){
        const inv = openBtn.closest('.inv'); const body = inv && inv.querySelector('.inv-body');
        if (body){ body.hidden = false; openBtn.closest('.guestbox').querySelector('.locked-note')?.remove(); openBtn.remove(); body.scrollIntoView({behavior:'smooth', block:'start'}); }
        return;
      }
      /* "Ubah Respons": ganti kotak status terkirim dengan formulir yang
         sudah terisi respons tersimpan tamu itu (dari record persisten). */
      const rsvpEditBtn = e.target.closest('[data-rsvp-edit]');
      if (rsvpEditBtn){
        const zone = rsvpEditBtn.closest('[data-rsvp-zone]');
        const slug = location.hash.slice(4).split('?')[0];
        const inv = S.invitations.find(i => i.slug === slug);
        if (zone && inv && typeof s2ExistingRsvp === 'function'){
          const code = new URLSearchParams((location.hash.split('?')[1] || '')).get('to');
          const ex = s2ExistingRsvp(inv, code);
          if (ex) zone.innerHTML = rsvpFormHTML({mode:'public', guest: guestNameFor(inv, code) || 'Bapak/Ibu/Saudara/i', existingRsvp: ex, rsvpEdit: true});
        }
        return;
      }
      /* "Isi sebagai tamu lain" (v19): perangkat bersama — buat
         identitas responden BARU untuk undangan ini dan jadikan aktif,
         lalu tampilkan formulir kosong. Identitas & respons orang
         sebelumnya tetap utuh pada tokennya sendiri. */
      const rsvpNewBtn = e.target.closest('[data-rsvp-new-person]');
      if (rsvpNewBtn){
        const zone = rsvpNewBtn.closest('[data-rsvp-zone]');
        const slug = location.hash.slice(4).split('?')[0];
        const inv = S.invitations.find(i => i.slug === slug);
        if (zone && inv && typeof kiRespondentNewPerson === 'function'){
          if (kiRespondentNewPerson(inv.id)){
            zone.innerHTML = rsvpFormHTML({mode:'public', guest:'Bapak/Ibu/Saudara/i'});
            toast('Identitas responden baru dibuat di perangkat ini — silakan isi respons Anda sendiri. Respons tamu sebelumnya tidak berubah.');
          } else {
            toast('Gagal membuat identitas responden baru di perangkat ini (penyimpanan tidak tersedia).', true);
          }
        }
        return;
      }
      const cp = e.target.closest('[data-copy]');
      if (cp){
        const txt = cp.dataset.copy;
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => toast('Tersalin: ' + txt)).catch(() => toast('Gagal menyalin otomatis', true));
        else toast('Salin manual: ' + txt);
        return;
      }
      const segBtn = e.target.closest('[data-seg] button');
      if (segBtn){ $$( 'button', segBtn.parentElement).forEach(b => b.classList.remove('on')); segBtn.classList.add('on'); return; }
      const dev = e.target.closest('[data-dev]');
      if (dev){
        $$('[data-dev]').forEach(b => b.classList.remove('on')); dev.classList.add('on');
        const sh = $('#detail-shell'); if (sh) sh.classList.toggle('wide', dev.dataset.dev === 'desktop');
        return;
      }
      /* Marketplace */
      const kat = e.target.closest('[data-kat]');
      if (kat){ MKT.kategori = kat.dataset.kat; $$('[data-kat]').forEach(b => b.classList.toggle('on', b === kat)); renderMktResults(); return; }
      if (e.target.closest('#mkt-go')){ MKT.q = ($('#mkt-q')||{}).value || ''; renderMktResults(); return; }
      /* Builder: buat draft */
      const nd = e.target.closest('[data-new-draft]');
      if (nd){ const t = templateBySlug(nd.dataset.newDraft); const inv = createDraftFromTemplate(t); B.tab = 'sampul'; B.mob = 'edit'; go('#/studio/' + inv.id); toast('Draft baru dibuat dari template ' + t.name); return; }
      /* Builder: tab & mobile */
      const bt = e.target.closest('[data-btab]');
      if (bt && B.inv){ B.tab = bt.dataset.btab; B.mob = 'edit'; render(); return; }
      const mb = e.target.closest('[data-mob]');
      if (mb && B.inv){ B.mob = mb.dataset.mob; render(); return; }
      const aw = e.target.closest('[data-admin-write]');
      if (aw){ window.__kiAdminWrite = true; toast('Izin tulis Admin lintas-pemilik aktif untuk sesi ini — perubahan kini dapat disimpan.'); render(); return; }
      const awo = e.target.closest('[data-admin-write-off]');
      if (awo){ window.__kiAdminWrite = false; toast('Izin tulis Admin dimatikan — kembali ke mode inspeksi hanya-lihat.'); render(); return; }
      if (e.target.closest('[data-save]') && B.inv){
        if (!kiGuardWrite(B.inv)) return; /* P1: simpan draft ditolak untuk bukan-pemilik */
        const okSave = flushAutosave(B.inv);
        toast(okSave ? 'Draft tersimpan di perangkat ini' : 'Gagal menyimpan draft di perangkat ini', !okSave); return;
      }
      const gt = e.target.closest('[data-goto-tab]');
      if (gt && B.inv){ B.tab = ({konten:'sampul', acara:'acara', media:'media', penutup:'seksi'})[gt.dataset.gotoTab] || 'sampul'; render(); return; }
      if (e.target.closest('[data-publish]') && B.inv){
        if (!kiGuardWrite(B.inv)) return; /* P1: penerbitan ditolak untuk bukan-pemilik */
        /* P1 v15: sukses publikasi HANYA bila autosave DAN persistensi
           publikasi sama-sama berhasil — hasil keduanya DIPERIKSA.
           Autosave gagal -> publikasi dibatalkan sebelum status berubah.
           Persistensi publikasi gagal -> kiPublishCore me-rollback state
           dan record persisten, error ditampilkan, dan undangan tidak
           tampak terbit setelah reload. */
        if (!flushAutosave(B.inv)){ toast('Publikasi DIBATALKAN: autosave gagal disimpan di perangkat ini — undangan tidak diterbitkan. Kosongkan ruang penyimpanan lalu coba lagi.', true); render(); return; }
        if (typeof publishBlockedByGate === 'function'){ const blk = publishBlockedByGate(B.inv); if (blk){ toast(typeof gateBlockText === 'function' ? gateBlockText(blk) : 'Publikasi ditahan: pembayaran simulasi belum berhasil (pengaturan “Publikasi wajib pembayaran” aktif).', true); render(); return; } }
        const pub = publishInvitation(B.inv);
        if (!pub.ok){ toast(pub.rollbackOk ? 'Publikasi GAGAL disimpan — perubahan dikembalikan, undangan tetap draft dan tidak akan tampak terbit setelah muat ulang.' : 'Publikasi GAGAL disimpan DAN rollback persisten juga gagal — muat ulang halaman dan periksa status undangan sebelum mencoba lagi.', true); render(); return; }
        render(); toast('Undangan terbit di /u/' + pub.slug); return;
      }
      /* Builder: struktur konten — semua mutasi struktur WAJIB milik
         pemilik aktif; klik dari sesi bukan-pemilik (mis. mode lihat
         Admin) ditolak di handler ini, bukan sekadar disembunyikan. */
      const inv = B.inv;
      if (inv && !kiOwns(inv) && !(kiAdmin() && kiAdminWrite()) && e.target.closest('[data-cover-photo],[data-subject-photo],[data-gal-toggle],[data-add-event],[data-del-event],[data-add-tl],[data-del-tl],[data-add-subject],[data-del-subject],[data-dress-color],[data-pal],[data-font],[data-orn]')){ kiGuardWrite(inv); render(); return; }
      if (inv && (kiOwns(inv) || (kiAdmin() && kiAdminWrite()))){
        const cp2 = e.target.closest('[data-cover-photo]'); if (cp2){ inv.content.coverPhoto = cp2.dataset.coverPhoto; scheduleAutosave(inv); render(); return; }
        const sp = e.target.closest('[data-subject-photo]'); if (sp){ const [i, mid] = sp.dataset.subjectPhoto.split(':'); inv.content.subjects[+i].photo = mid; scheduleAutosave(inv); render(); return; }
        const gtog = e.target.closest('[data-gal-toggle]'); if (gtog){ const id = gtog.dataset.galToggle; const g = inv.content.gallery; const ix = g.indexOf(id); if (ix >= 0) g.splice(ix,1); else g.push(id); scheduleAutosave(inv); render(); return; }
        if (e.target.closest('[data-add-event]')){ inv.content.events.push({label:'Sesi Baru', date: inv.content.events[0]?.date || '2026-12-12', timeStart:'10.00', timeEnd:'12.00', venue:'', address:''}); scheduleAutosave(inv); render(); return; }
        const de = e.target.closest('[data-del-event]'); if (de){ inv.content.events.splice(+de.dataset.delEvent, 1); scheduleAutosave(inv); render(); return; }
        if (e.target.closest('[data-add-tl]')){ inv.content.timeline.push({time:'12.00', title:'Item Baru', desc:''}); scheduleAutosave(inv); render(); return; }
        const dt = e.target.closest('[data-del-tl]'); if (dt){ inv.content.timeline.splice(+dt.dataset.delTl, 1); scheduleAutosave(inv); render(); return; }
        if (e.target.closest('[data-add-subject]')){ inv.content.subjects.push({role:'Subjek Kedua', name:'', nick:'', detail:'', photo:'couple-2'}); scheduleAutosave(inv); render(); return; }
        const ds = e.target.closest('[data-del-subject]'); if (ds){ inv.content.subjects.splice(+ds.dataset.delSubject, 1); scheduleAutosave(inv); render(); return; }
        const dc = e.target.closest('[data-dress-color]'); if (dc){ const hx = dc.dataset.dressColor; const arr = inv.content.dressColors || (inv.content.dressColors = []); const ix = arr.indexOf(hx); if (ix >= 0) arr.splice(ix,1); else arr.push(hx); scheduleAutosave(inv); render(); return; }
        const pal = e.target.closest('[data-pal]'); if (pal){ inv.design.paletteId = pal.dataset.pal; scheduleAutosave(inv); render(); return; }
        const fo = e.target.closest('[data-font]'); if (fo){ inv.design.fontId = fo.dataset.font; scheduleAutosave(inv); render(); return; }
        const orn = e.target.closest('[data-orn]'); if (orn){ inv.design.ornament = orn.dataset.orn; scheduleAutosave(inv); render(); return; }
      }
    });
    document.addEventListener('input', e => {
      if (e.target.id === 'mkt-q'){ MKT.q = e.target.value; renderMktResults(); return; }
      const bind = e.target.closest('[data-bind]');
      if (bind && B.inv && (kiOwns(B.inv) || (kiAdmin() && kiAdminWrite()))){
        setPath(B.inv, bind.dataset.bind, e.target.value);
        if (bind.dataset.bind.startsWith('content.subjects') || bind.dataset.bind === 'content.orgName') B.inv.title = defaultTitle(TEMPLATES.find(x => x.id === B.inv.templateId), B.inv.content);
        B.inv.updatedAt = Date.now(); updatePreview();
      }
      const vis = e.target.closest('[data-vis]');
      if (vis && B.inv && (kiOwns(B.inv) || (kiAdmin() && kiAdminWrite()))){ B.inv.sections[vis.dataset.vis] = vis.checked; B.inv.updatedAt = Date.now(); updatePreview(); }
    });
    document.addEventListener('change', e => {
      if (e.target.id === 'mkt-gaya'){ MKT.gaya = e.target.value; renderMktResults(); }
      if (e.target.id === 'mkt-tier'){ MKT.tier = e.target.value; renderMktResults(); }
      if (e.target.id === 'mkt-urut'){ MKT.urut = e.target.value; renderMktResults(); }
      const vis = e.target.closest && e.target.closest('[data-vis]');
      if (vis && B.inv && (kiOwns(B.inv) || (kiAdmin() && kiAdminWrite()))){ B.inv.sections[vis.dataset.vis] = vis.checked; updatePreview(); }
    });
    document.addEventListener('submit', e => {
      const form = e.target.closest('[data-rsvp-form]');
      if (!form) return;
      e.preventDefault();
      if (form.dataset.kiSent) return; /* pengaman submit ganda: satu formulir, satu pengiriman */
      const fd = new FormData(form);
      const name = (fd.get('name') || '').toString().trim();
      if (!name){ toast('Nama wajib diisi untuk RSVP', true); return; }
      form.dataset.kiSent = '1';
      const sb = form.querySelector('[type="submit"]'); if (sb) sb.disabled = true;
      const status = (form.querySelector('[data-seg] button.on') || {}).dataset?.val || 'Hadir';
      const msg = (fd.get('message') || '').toString().trim();
      const isDemo = !location.hash.startsWith('#/u/');
      const zone = form.closest('[data-rsvp-zone]');
      const demoList = isDemo ? form.closest('.sec')?.querySelector('[data-wish-list]') : null; /* ditangkap sebelum zona diganti (form terlepas dari dokumen sesudahnya) */
      /* SATU jalur RSVP: untuk undangan sungguhan, handler ini TIDAK menulis
         salinan sesi (S.rsvps/S.wishes), TIDAK menyisipkan ucapan langsung
         ke DOM, dan TIDAK menampilkan konfirmasi sukses — konfirmasi hanya
         boleh muncul setelah listener jembatan Stage 2 menulis record
         persisten DAN memeriksa hasil penyimpanannya. Bila simpan gagal,
         jembatan menampilkan error, bukan kotak "tercatat" palsu.
         Jalur sesi di bawah hanya untuk halaman demo template. */
      if (isDemo){
        if (zone) zone.innerHTML = `<div class="ok-box"><b>Terima kasih, ${esc(name)}!</b><p class="muted small" style="margin:4px 0 0">Konfirmasi Anda (${esc(status)}) sudah tercatat pada data demo. Sampai jumpa di hari acara!</p></div>`;
        S.rsvps.push({id:'rsvp-' + (S.seq++), invitationSlug: 'demo', name, status, count: +(fd.get('count') || 1), message: msg, at: Date.now()});
        if (msg){
          const w = {name, status, msg, slug: 'demo'};
          if (demoList){ if (demoList.querySelector('.muted.small') && demoList.children.length === 1) demoList.innerHTML = ''; demoList.insertAdjacentHTML('afterbegin', wishHTML(w)); }
          S.wishes.push(w);
        }
        toast('RSVP terkirim. Terima kasih!');
      }
    });

    render();
