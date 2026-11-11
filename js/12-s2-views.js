    /* ---------- Modal konfirmasi in-page ---------- */
    let _modalCb = null;
    function showModal(o){
      closeModal();
      const bg = document.createElement('div'); bg.className = 'modal-bg'; bg.id = 's2-modal';
      bg.innerHTML = `<div class="modal-card"><h3>${esc(o.title)}</h3><p>${o.body || ''}</p>
        ${o.textarea ? `<div class="field" style="margin-top:12px"><label>${esc(o.textareaLabel || 'Catatan')}</label><textarea class="textarea input" id="s2-modal-text" rows="3" placeholder="${esc(o.textareaPh || '')}"></textarea></div>` : ''}
        <div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:18px">
          <button class="btn ${o.danger ? '' : 'gold'}" id="s2-modal-ok" style="${o.danger ? 'background:var(--err);color:#FFF' : ''}">${esc(o.confirmLabel || 'Ya, Lanjutkan')}</button>
          <button class="btn ghost" id="s2-modal-cancel">Batal</button>
        </div></div>`;
      document.body.appendChild(bg);
      _modalCb = o.onConfirm;
      bg.querySelector('#s2-modal-cancel').addEventListener('click', closeModal);
      bg.addEventListener('click', e => { if (e.target === bg) closeModal(); });
      bg.querySelector('#s2-modal-ok').addEventListener('click', () => { const v = o.textarea ? (bg.querySelector('#s2-modal-text').value || '').trim() : true; const cb = _modalCb; closeModal(); if (cb) cb(v); });
    }
    function closeModal(){ const m = document.getElementById('s2-modal'); if (m) m.remove(); _modalCb = null; }

    /* ---------- State tampilan Stage 2 ---------- */
    const D2 = { invFilter:'semua', invQuery:'', guestInv:null, guestQuery:'', guestStatus:'semua', guestGroup:'semua', guestSel:new Set(), guestEdit:null, bulkPreview:null, rsvpInv:null, svcEdit:null };
    const GROUPS = ['Keluarga','Teman','Rekan Kerja','VIP','Lainnya'];
    function payPill(st){ return st === 'Success' ? '<span class="pill pay-ok">Success</span>' : st === 'Pending' ? '<span class="pill pay-pend">Pending</span>' : st === 'Failed' ? '<span class="pill pay-bad">Failed</span>' : '<span class="pill pay-bad">Expired</span>'; }
    function roleBar(){
      return `<div class="rolebar"><b>Mode demo:</b><span>Anda masuk sebagai <b>${esc(userById(CURRENT_USER).name)}</b>. Ganti peran untuk melihat sisi lain platform — ini simulasi peran, bukan login produksi.</span>
      <span style="margin-left:auto;display:flex;gap:7px;align-items:center"><label for="s2-role" style="font-weight:700">Peran</label>
      <select id="s2-role"><option value="customer" ${S2.role==='customer'?'selected':''}>Pelanggan</option><option value="admin" ${S2.role==='admin'?'selected':''}>Admin</option><option value="designer" ${S2.role==='designer'?'selected':''}>Desainer</option></select></span></div>`;
    }
    function s2Tabs(active){
      const tabs = [['ringkasan','Ringkasan'],['undangan','Undangan Saya'],['tamu','Tamu'],['rsvp','RSVP & Ucapan'],['pesanan','Pesanan'],['layanan','Bantuan Desain'],['analitik','Analitik'],['notifikasi','Notifikasi'],['pengaturan','Pengaturan']];
      return `<div class="s2-tabs">${tabs.map(t => `<a class="chip ${active===t[0]?'on':''}" href="#/dashboard?tab=${t[0]}">${t[1]}</a>`).join('')}</div>`;
    }
    function dashShell(active, inner){
      return shell(`<div class="wrap" style="padding-bottom:90px"><div class="s2-head"><div class="rule"><span>Dashboard Pelanggan</span></div><h1>Halo, ${esc(userById(CURRENT_USER).name.split(' ')[0])}</h1><p>Semua angka di halaman ini dihitung dari data undangan, tamu, RSVP, dan pesanan Anda yang sebenarnya di aplikasi ini.</p></div>${roleBar()}${s2Tabs(active)}${inner}</div>`, 'dashboard');
    }

    /* ---------- 2A: Ringkasan ---------- */
    function dashOverview(){
      const mine = myInvitations();
      const gCount = mine.reduce((a, i) => a + guestsOf(i.id).length, 0);
      const rCount = mine.reduce((a, i) => a + rsvpsOf(i.id).length, 0);
      const pend = S2.orders.filter(o => o.customerId === CURRENT_USER && o.paymentStatus === 'Pending').length;
      /* Scope ketat per pemilik: hanya aktivitas milik pelanggan ini yang
         tampil. Event tanpa owner TIDAK ditampilkan ke pelanggan mana pun
         (tidak bocor lintas akun); admin tetap melihat semuanya di panelnya. */
      const recent = S2.activity.filter(a => a.scope === 'customer' && a.owner === CURRENT_USER).slice().sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 6);
      return `<div class="stat-grid">
        <div class="stat"><b>${mine.length}</b><span>Total undangan</span><small>${mine.filter(i => invStatus(i).key==='draft').length} draft · ${mine.filter(i => invStatus(i).key==='published').length} terbit</small></div>
        <div class="stat"><b>${gCount}</b><span>Total tamu</span><small>dari semua undangan Anda</small></div>
        <div class="stat"><b>${rCount}</b><span>Respons RSVP</span><small>${mine.reduce((a,i)=>a+rsvpsOf(i.id).filter(r=>r.status==='Hadir').reduce((x,r)=>x+(r.count||0),0),0)} tamu terkonfirmasi hadir</small></div>
        <div class="stat"><b>${pend}</b><span>Pesanan menunggu pembayaran</span><small>status pembayaran simulasi: Pending</small></div>
      </div>
      <div class="card"><h2>Aktivitas Terbaru</h2><p class="sub">Jejak perubahan nyata di akun Anda.</p>
      ${recent.length ? `<div class="list-rows">${recent.map(a => `<div class="lrow"><div class="grow"><b style="font-weight:600">${esc(a.text)}</b><div class="mut">${new Date(a.at).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div></div></div>`).join('')}</div>` : '<p style="color:var(--ink-2)">Belum ada aktivitas tercatat.</p>'}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn gold" href="#/template">${ICONS.plus} Buat Undangan Baru</a><a class="btn ghost" href="#/dashboard?tab=undangan">Kelola Undangan Saya</a></div>`;
    }

    /* ---------- 2A: Undangan Saya ---------- */
    function dashInvitations(){
      let list = myInvitations().slice();
      if (D2.invFilter !== 'semua') list = list.filter(i => invStatus(i).key === D2.invFilter);
      if (D2.invQuery.trim()){ const q = D2.invQuery.toLowerCase(); list = list.filter(i => (i.title + ' ' + tplOf(i).name + ' ' + (catById(i.categoryId)||{}).name).toLowerCase().includes(q)); }
      const F = [['semua','Semua'],['draft','Draft'],['published','Terbit'],['expired','Kedaluwarsa'],['archived','Arsip']];
      const cards = list.map(inv => {
        const t = tplOf(inv), st = invStatus(inv), cat = catById(inv.categoryId) || {name:''};
        const gc = guestsOf(inv.id).length, rc = rsvpsOf(inv.id).length;
        return `<article class="inv-card"><div class="top"><img class="thumb" src="${mediaById(inv.content.coverPhoto || t.thumb).src}" alt="Sampul ${esc(inv.title)}">
          <div style="min-width:0"><span class="pill ${st.cls}">${st.label}</span><h3 style="margin-top:7px">${esc(inv.title)}</h3>
          <div class="meta">${esc(cat.name)} · ${esc(t.name)} v${inv.templateVersion}.0</div>
          <div class="meta">Diubah ${new Date(inv.updatedAt).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})} · ${gc} tamu · ${rc} RSVP</div>
          ${inv.slug ? `<div class="meta" style="color:var(--gold-ink);font-weight:700">/u/${esc(inv.slug)}</div>` : ''}
          ${st.unresolved ? `<div class="meta" style="color:var(--warn);font-weight:700">Paket belum terselesaikan — masa akses belum terhitung (tidak ada paket yang terbukti dari pesanan terkait)</div>` : ''}
          </div></div>
          <div class="acts">
            <a class="btn gold sm" href="#/studio/${inv.id}">Buka Builder</a>
            ${inv.status==='published' && inv.slug ? `<a class="btn ghost sm" href="#/u/${inv.slug}">Pratinjau Publik</a>` : `<a class="btn ghost sm" href="#/studio/${inv.id}">Pratinjau</a>`}
            <a class="btn ghost sm" href="#/dashboard?tab=tamu&inv=${inv.id}">Kelola Tamu</a>
            <a class="btn ghost sm" href="#/dashboard?tab=analitik&inv=${inv.id}">Analitik</a>
            <button class="btn ghost sm" data-s2="inv-duplicate" data-id="${inv.id}">Duplikat</button>
            ${inv.archived ? `<button class="btn ghost sm" data-s2="inv-unarchive" data-id="${inv.id}">Batal Arsip</button>` : `<button class="btn ghost sm" data-s2="inv-archive" data-id="${inv.id}">Arsipkan</button>`}
            <button class="btn ghost sm" data-s2="inv-delete" data-id="${inv.id}" style="color:var(--err)">Hapus</button>
          </div></article>`;
      }).join('');
      return `<div class="toolbar2"><input class="input" id="s2-inv-q" type="search" placeholder="Cari undangan…" value="${esc(D2.invQuery)}" aria-label="Cari undangan">
        ${F.map(f => `<button class="chip ${D2.invFilter===f[0]?'on':''}" data-s2="inv-filter" data-id="${f[0]}">${f[1]}</button>`).join('')}
        <a class="btn gold sm" href="#/template" style="margin-left:auto">${ICONS.plus} Buat Undangan</a></div>
      ${list.length ? `<div class="inv-grid">${cards}</div>` : `<div class="empty"><h3>Tidak ada undangan pada filter ini</h3><p>Coba filter lain, atau buat undangan baru dari marketplace template.</p><a class="btn gold" href="#/template">Jelajahi Template</a></div>`}`;
    }

    /* ---------- 2B: Tamu ---------- */
    function invPicker(selected, param){
      const mine = myInvitations();
      return `<select class="input" id="s2-inv-pick" aria-label="Pilih undangan">${mine.map(i => `<option value="${i.id}" ${i.id===selected?'selected':''}>${esc(i.title)} (${invStatus(i).label})</option>`).join('')}</select>`;
    }
    function dashGuests(params){
      const mine = myInvitations();
      if (!mine.length) return `<div class="empty"><h3>Belum ada undangan</h3><p>Buat undangan dulu, lalu kelola tamunya di sini.</p><a class="btn gold" href="#/template">Buat Undangan</a></div>`;
      const invId = params.inv || D2.guestInv || mine[0].id;
      D2.guestInv = invId;
      const inv = mine.find(i => i.id === invId) || mine[0];
      let list = guestsOf(inv.id);
      const groups = [...new Set([...GROUPS, ...list.map(g => g.group)])];
      if (D2.guestStatus !== 'semua') list = list.filter(g => g.rsvpStatus === D2.guestStatus);
      if (D2.guestGroup !== 'semua') list = list.filter(g => g.group === D2.guestGroup);
      if (D2.guestQuery.trim()){ const q = D2.guestQuery.toLowerCase(); list = list.filter(g => (g.name + ' ' + g.contact).toLowerCase().includes(q)); }
      const ed = D2.guestEdit ? guestsOf(inv.id).find(g => g.id === D2.guestEdit) : null;
      const formVals = ed || {name:'', group:'Keluarga', contact:'', attendees:1};
      const rows = list.map(g => `<div class="lrow">
        <label class="checkline" style="padding-top:2px"><input type="checkbox" data-s2-sel="${g.id}" ${D2.guestSel.has(g.id)?'checked':''} aria-label="Pilih ${esc(g.name)}"></label>
        <div class="grow"><b>${esc(g.name)}</b> <span class="pill ${g.rsvpStatus==='Hadir'?'pub':g.rsvpStatus==='Tidak Hadir'?'pay-bad':g.rsvpStatus==='Masih Ragu'?'exp':'draft'}">${esc(g.rsvpStatus)}</span>
          <div class="mut">${esc(g.group)} · ${esc(g.contact || 'Tanpa kontak')} · ${g.attendees} orang · kode tamu ${esc(g.code)}</div>
          <div class="mut">Tautan tamu (simulasi, tidak mengirim pesan apa pun): <b style="color:var(--gold-ink)">${esc(guestLink(inv, g))}</b></div></div>
        <span style="display:flex;gap:7px;flex-wrap:wrap">
          <button class="btn ghost sm" data-copy="${esc(guestLink(inv, g))}">${ICONS.copy} Salin Tautan</button>
          <button class="btn ghost sm" data-s2="guest-edit" data-id="${g.id}">Ubah</button>
          <button class="btn ghost sm" data-s2="guest-del" data-id="${g.id}" style="color:var(--err)">Hapus</button>
        </span></div>`).join('');
      return `<div class="card"><h2>Tamu — ${esc(inv.title)}</h2><p class="sub">${guestsOf(inv.id).length} tamu terdaftar untuk undangan ini. Tamu selalu terikat pada satu undangan; daftar undangan lain tidak ikut berubah.</p>
        <div class="toolbar2"><label style="font-weight:700;font-size:14px">Undangan</label>${invPicker(inv.id)}</div>
        <form id="s2-guest-form" style="background:var(--ivory);border:1px solid var(--line-soft);border-radius:var(--r-md);padding:18px;margin-bottom:18px">
          <b style="display:block;margin-bottom:12px">${ed ? 'Ubah Tamu' : 'Tambah Tamu'}</b>
          <div class="row2">
            <div class="field"><label for="gf-name">Nama tamu *</label><input class="input" id="gf-name" required maxlength="80" value="${esc(formVals.name)}" placeholder="cth. Keluarga Wijaya"></div>
            <div class="field"><label for="gf-contact">Kontak (HP / email)</label><input class="input" id="gf-contact" maxlength="60" value="${esc(formVals.contact)}" placeholder="08xx…"></div>
          </div>
          <div class="row2">
            <div class="field"><label for="gf-group">Grup</label><input class="input" id="gf-group" list="gf-groups" value="${esc(formVals.group)}"><datalist id="gf-groups">${groups.map(g => `<option value="${esc(g)}">`).join('')}</datalist><p class="hint">Pilih grup contoh atau ketik grup kustom Anda sendiri.</p></div>
            <div class="field"><label for="gf-att">Jumlah orang</label><input class="input" id="gf-att" type="number" min="0" max="20" value="${formVals.attendees}"></div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn gold sm" type="submit">${ed ? 'Simpan Perubahan' : 'Tambah Tamu'}</button>${ed ? '<button class="btn ghost sm" type="button" data-s2="guest-edit-cancel">Batal Ubah</button>' : ''}</div>
        </form>
        <div class="toolbar2">
          <input class="input" id="s2-guest-q" type="search" placeholder="Cari nama / kontak…" value="${esc(D2.guestQuery)}" aria-label="Cari tamu">
          <select class="input" id="s2-guest-status" aria-label="Filter status RSVP"><option value="semua">Semua Status</option>${['Hadir','Tidak Hadir','Masih Ragu','Belum Menjawab'].map(s => `<option ${D2.guestStatus===s?'selected':''}>${s}</option>`).join('')}</select>
          <select class="input" id="s2-guest-group" aria-label="Filter grup"><option value="semua">Semua Grup</option>${groups.map(g => `<option ${D2.guestGroup===g?'selected':''}>${esc(g)}</option>`).join('')}</select>
        </div>
        <div class="toolbar2">
          <label class="checkline"><input type="checkbox" id="s2-sel-all"> Pilih semua yang tampil</label>
          <span style="font-size:13.5px;color:var(--ink-3);font-weight:700">${D2.guestSel.size} terpilih</span>
          <button class="btn ghost sm" data-s2="guest-bulk-del" ${D2.guestSel.size?'':'disabled'} style="color:var(--err)">Hapus Terpilih</button>
        </div>
        ${list.length ? `<div class="list-rows">${rows}</div>` : `<div class="empty"><h3>Tidak ada tamu yang cocok</h3><p>Longgarkan filter atau tambah tamu baru di formulir di atas.</p></div>`}
      </div>
      <div class="card"><h2>Tambah Banyak Tamu Sekaligus</h2><p class="sub">Satu tamu per baris. Format: <b>Nama; Grup; Kontak</b> — grup dan kontak boleh dikosongkan. Sistem memvalidasi dan menampilkan pratinjau sebelum benar-benar mengimpor.</p>
        <div class="field"><label for="s2-bulk-text">Daftar tamu</label><textarea class="textarea input" id="s2-bulk-text" rows="5" placeholder="Keluarga Hartono; Keluarga; 0812 3456 7890&#10;Rani Amelia; Teman&#10;Dimas Prasetyo"></textarea></div>
        <button class="btn ghost" data-s2="bulk-preview">Validasi & Pratinjau</button>
        <div id="s2-bulk-zone" style="margin-top:14px">${D2.bulkPreview ? bulkPreviewHTML(inv) : ''}</div>
      </div>`;
    }
    function bulkPreviewHTML(inv){
      const p = D2.bulkPreview;
      return `<div style="background:var(--ivory);border:1px solid var(--line);border-radius:var(--r-md);padding:16px">
        <b>Pratinjau impor:</b> ${p.valid.length} baris valid, ${p.errors.length} baris bermasalah.
        ${p.errors.length ? `<ul style="margin:8px 0;color:var(--err);font-size:13.5px">${p.errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul>` : ''}
        ${p.valid.length ? `<ul style="margin:8px 0;font-size:14px">${p.valid.slice(0, 12).map(v => `<li>${esc(v.name)} — ${esc(v.group)}${v.contact ? ' · ' + esc(v.contact) : ''}</li>`).join('')}${p.valid.length > 12 ? `<li>…dan ${p.valid.length - 12} lainnya</li>` : ''}</ul>
        <button class="btn gold sm" data-s2="bulk-import">Impor ${p.valid.length} Tamu ke “${esc(inv.title)}”</button>` : '<p style="margin:6px 0 0">Perbaiki dulu baris yang bermasalah, lalu validasi ulang.</p>'}
      </div>`;
    }

    /* ---------- 2B/2C: RSVP & Buku Ucapan ---------- */
    function dashRsvp(params){
      const mine = myInvitations();
      if (!mine.length) return `<div class="empty"><h3>Belum ada undangan</h3><p>RSVP akan muncul setelah undangan Anda dibuat dan dibagikan.</p></div>`;
      const invId = params.inv || D2.rsvpInv || D2.guestInv || mine[0].id;
      D2.rsvpInv = invId;
      const inv = mine.find(i => i.id === invId) || mine[0];
      const gs = guestsOf(inv.id), rs = rsvpsOf(inv.id);
      const hadir = rs.filter(r => r.status === 'Hadir'), tidak = rs.filter(r => r.status === 'Tidak Hadir');
      const pending = gs.filter(g => g.rsvpStatus === 'Belum Menjawab').length;
      const attendees = hadir.reduce((a, r) => a + (r.count || 0), 0);
      const modList = rs.filter(r => r.message);
      return `<div class="toolbar2"><label style="font-weight:700;font-size:14px">Undangan</label>${invPicker(inv.id).replace('s2-inv-pick','s2-rsvp-pick')}</div>
      <div class="stat-grid">
        <div class="stat"><b>${gs.length}</b><span>Total tamu diundang</span></div>
        <div class="stat"><b>${hadir.length}</b><span>Konfirmasi hadir</span><small>${attendees} total orang</small></div>
        <div class="stat"><b>${tidak.length}</b><span>Tidak hadir</span></div>
        <div class="stat"><b>${pending}</b><span>Belum menjawab</span></div>
      </div>
      <div class="card"><h2>Respons RSVP — ${esc(inv.title)}</h2><p class="sub">Data ini berasal dari formulir RSVP di halaman publik undangan yang sama, dan dari status tamu yang Anda kelola.</p>
      ${rs.length ? `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Tamu</th><th>Respons</th><th>Jumlah</th><th>Pesan</th><th>Tanggal</th></tr></thead><tbody>
        ${rs.slice().sort((a,b) => b.at - a.at).map(r => `<tr><td data-l="Tamu"><b>${esc(r.name)}</b></td><td data-l="Respons">${esc(r.status)}</td><td data-l="Jumlah">${r.count} orang</td><td data-l="Pesan">${esc(r.message || '—')}</td><td data-l="Tanggal">${new Date(r.at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</td></tr>`).join('')}
      </tbody></table></div>` : '<p style="color:var(--ink-2)">Belum ada respons RSVP untuk undangan ini.</p>'}
      </div>
      <div class="card"><h2>Moderasi Buku Ucapan</h2><p class="sub">Hanya ucapan berstatus <b>Disetujui</b> yang tampil di buku ucapan halaman publik undangan.</p>
      ${modList.length ? `<div class="list-rows">${modList.map(r => `<div class="lrow"><div class="grow"><b>${esc(r.name)}</b> <span class="pill ${r.moderation==='approved'?'pub':r.moderation==='hidden'?'arc':'exp'}">${r.moderation==='approved'?'Disetujui':r.moderation==='hidden'?'Disembunyikan':'Menunggu'}</span><div style="font-size:14.5px;margin-top:3px">“${esc(r.message)}”</div><div class="mut">${esc(r.status)} · ${new Date(r.at).toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</div></div>
        <span style="display:flex;gap:7px;flex-wrap:wrap"><button class="btn ghost sm" data-s2="mod" data-act="approved" data-id="${r.id}">Setujui</button><button class="btn ghost sm" data-s2="mod" data-act="hidden" data-id="${r.id}">Sembunyikan</button><button class="btn ghost sm" data-s2="mod" data-act="delete" data-id="${r.id}" style="color:var(--err)">Hapus Ucapan</button></span></div>`).join('')}</div>` : '<p style="color:var(--ink-2)">Belum ada ucapan untuk dimoderasi.</p>'}
      </div>`;
    }
    /* ---------- 2C: Pesanan, Checkout, Pembayaran, Faktur ---------- */
    function orderCard(o, adminMode){
      const inv = S.invitations.find(i => i.id === o.invitationId);
      const pays = S2.payments.filter(p => p.orderId === o.id);
      /* v21: penahanan tier DITAMPILKAN di sini — dihitung proaktif dari
         tier template VERSI undangan (kiOrderTierHold), bukan menunggu
         flag needsNewOrder yang baru muncul setelah percobaan bayar
         ditahan. Order yang ditahan: alasan mismatch terlihat, CTA
         bayar TIDAK ditampilkan, dan pengguna diarahkan ke checkout
         untuk pesanan baru dengan paket yang benar. Snapshot/histori
         pesanan tidak diubah. */
      const hold21 = inv ? kiOrderTierHold(o, inv) : {held:false, expected:null, unresolved:false};
      const held21 = hold21.held;
      const holdReason = held21 ? (hold21.unresolved ? 'tier template undangan ini tidak dapat dibuktikan dari versi template yang dipakai' : 'pesanan memakai paket ' + o.packageName + ', tetapi undangan memakai template tier ' + (hold21.expected ? hold21.expected.name : '')) : '';
      return `<div class="lrow"><div class="grow"><b>${esc(o.number)}</b> ${payPill(o.paymentStatus)} <span class="pill draft">${esc(o.status)}</span>${o.needsNewOrder || held21 ? ' <span class="pill exp wrap">Perlu pesanan baru — paket tidak sesuai tier template</span>' : ''}
        <div class="mut">${esc(inv ? inv.title : 'Undangan terhapus')} · Paket ${esc(o.packageName)} · ${new Date(o.createdAt).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</div>
        <div class="mut">Subtotal ${rp(o.price)}${o.discount ? ' · Diskon ' + esc(o.couponCode||'') + ' −' + rp(o.discount) : ''} · <b style="color:var(--ink)">Total ${rp(o.total)}</b> (harga paket tersimpan saat pesanan dibuat)</div>
        ${pays.length ? `<div class="mut">Pembayaran: ${pays.map(p => esc(p.method) + ' — ' + p.status).join(' · ')}</div>` : ''}
        ${held21 ? `<div class="mut" style="color:var(--err);font-weight:700">Pembayaran ditahan: ${esc(holdReason)} — paket yang salah tidak diaktifkan dan riwayat pesanan tidak diubah. Buat pesanan baru dengan paket yang benar lewat checkout.</div>` : ''}
        </div>
        <span style="display:flex;gap:7px;flex-wrap:wrap">
        ${!held21 && o.status === 'Menunggu Pembayaran' && (o.paymentStatus === 'Pending' || o.paymentStatus === 'Failed' || o.paymentStatus === 'Expired') ? `<a class="btn gold sm" href="#/bayar/${o.id}">${o.paymentStatus==='Pending' ? 'Bayar Sekarang' : 'Coba Bayar Lagi'}</a>` : ''}
        ${held21 ? `<a class="btn gold sm" href="#/checkout?inv=${o.invitationId}">Buat Pesanan Baru</a>` : ''}
        <a class="btn ghost sm" href="#/faktur/${o.id}">Faktur</a>
        ${o.status === 'Menunggu Pembayaran' ? `<button class="btn ghost sm" data-s2="order-cancel" data-id="${o.id}" style="color:var(--err)">Batalkan</button>` : ''}
        ${adminMode && o.paymentStatus === 'Success' && o.status === 'Diproses' ? `<button class="btn ghost sm" data-s2="order-done" data-id="${o.id}">Tandai Selesai</button>` : ''}
        </span></div>`;
    }
    function dashOrders(){
      const mine = S2.orders.filter(o => o.customerId === CURRENT_USER).slice().sort((a, b) => b.createdAt - a.createdAt);
      return `<div class="sim-banner">Seluruh pembayaran di Kita Invite adalah <b>simulasi prototipe</b> — tidak ada gerbang pembayaran nyata dan tidak ada uang yang berpindah.</div>
      <div class="card"><h2>Paket Undangan</h2><p class="sub">Bandingkan paket, lalu checkout untuk undangan pilihan Anda. Harga yang tercatat di pesanan tidak berubah walau harga paket diperbarui admin di kemudian hari.</p>
      <div class="pkg-pick">${DB.packages.map(p => `<div class="pkg-opt"><b>${esc(p.name)}</b><span class="amt2">${p.from ? '<small style="font-size:13px;font-family:var(--font-ui)">Mulai </small>' : ''}${rp(p.price)}</span><ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>`).join('')}</div>
      <a class="btn gold" href="#/checkout" style="margin-top:16px">Mulai Checkout ${ICONS.arrow}</a></div>
      <div class="card"><h2>Riwayat Pesanan</h2><p class="sub">Status pesanan dan status pembayaran sengaja dipisah: pesanan bisa “Diproses” sementara pembayaran “Success”, dan seterusnya.</p>
      ${mine.length ? `<div class="list-rows">${mine.map(o => orderCard(o, false)).join('')}</div>` : '<p style="color:var(--ink-2)">Belum ada pesanan. Mulai checkout pertama Anda di atas.</p>'}
      </div>`;
    }
    const CO = { invId:null, pkgId:'premium', coupon:null, couponCode:'', method:'Virtual Account', ctxHash:null, ctxMissing:false };
    function viewCheckout(params){
      const mine = myInvitations().filter(i => !i.archived);
      if (!mine.length) return shell(`<div class="wrap" style="padding:40px 20px 90px"><div class="empty"><h3>Belum ada undangan untuk dipesan</h3><p>Buat undangan dari marketplace, lalu kembali ke sini untuk memilih paketnya.</p><a class="btn gold" href="#/template">Jelajahi Template</a></div></div>`, 'dashboard');
      /* v21.2 — KONTEKS UNDANGAN dari URL (?inv=<id>, diparse parseHash
         seperti ?tab=): diterapkan saat HASH BERUBAH (bukan tiap render —
         pilihan manual di dropdown tidak boleh ditimpa render ulang).
         Bila ID tidak ditemukan di undangan milik pengguna -> checkout
         DITAHAN dengan penjelasan (ctxMissing); bila tier versinya tak
         terbukti -> UI tierUnresolved v21.1. Tanpa ?inv=, perilaku lama
         (default undangan pertama) dipertahankan.
         v22 — param ?inv= yang HADIR tapi kosong/tidak dapat dipetakan
         diperlakukan sebagai konteks eksplisit yang GAGAL (fail-closed),
         bukan default diam-diam ke undangan pertama: tautan checkout
         yang rusak harus meminta pengguna memilih undangan secara
         eksplisit, bukan menebak. */
      const hasInvParam = !!(params && Object.prototype.hasOwnProperty.call(params, 'inv'));
      const ctxId = hasInvParam ? params.inv : null;
      const ctxHash = location.hash || '';
      if (hasInvParam){
        if (CO.ctxHash !== ctxHash){
          CO.ctxHash = ctxHash;
          const ctx = ctxId ? mine.find(i => i.id === ctxId) : null;
          if (ctx){ CO.invId = ctxId; CO.ctxMissing = false; }
          else { CO.invId = null; CO.ctxMissing = true; }
        }
      } else { CO.ctxHash = null; CO.ctxMissing = false; }
      if (!CO.ctxMissing && (!CO.invId || !mine.some(i => i.id === CO.invId))) CO.invId = mine[0].id;
      /* v18: paket checkout TERKUNCI ke tier template undangan terpilih —
         pilihan paket diselaraskan ke paket tier itu setiap render, dan
         handler konfirmasi memvalidasi ulang (kiCheckoutValidate), jadi
         kunci ini bukan sekadar tampilan. */
      const selInv = mine.find(i => i.id === CO.invId);
      const lockPkg = selInv ? kiTemplatePackage(selInv) : null;
      /* v21.1 — FAIL CLOSED di tampilan: bila tier tidak terbukti
         (lockPkg null), checkout TIDAK menampilkan paket seolah-olah
         bisa dipesan — semua pilihan paket off, ringkasan "—", tombol
         konfirmasi disabled. Handler co-confirm sudah menolak lewat
         kiCheckoutValidate; ini lapisan tampilan yang sama. */
      const tierUnresolved = !lockPkg;
      /* v21.2 — pesan penahanan dibedakan: undangan tidak ditemukan
         (ctxMissing) vs tier tidak terbukti (tierUnresolved). */
      const holdNote = CO.ctxMissing ? 'Undangan tidak ditemukan — pilih undangan yang valid dari daftar di atas' : 'Tier template tidak dapat dibuktikan — checkout ditahan';
      const holdTitle = CO.ctxMissing ? 'Checkout Ditahan — Undangan Tidak Ditemukan' : 'Checkout Ditahan — Tier Template Tidak Dapat Dibuktikan';
      if (lockPkg && CO.pkgId !== lockPkg.id) CO.pkgId = lockPkg.id;
      const pkg = pkgById(CO.pkgId) || DB.packages[1];
      const disc = CO.coupon ? Math.round(pkg.price * CO.coupon.pct / 100) : 0;
      const METHODS = [['Virtual Account','Nomor VA dibuat otomatis untuk simulasi'],['QRIS','Kode QR simulasi di layar pembayaran'],['E-Wallet','Saldo dompet elektronik (simulasi)'],['Bank Transfer','Transfer manual dengan kode unik (simulasi)']];
      const inner = `<div class="wrap" style="padding-bottom:90px"><div class="s2-head"><div class="rule"><span>Checkout — Simulasi</span></div><h1>Pesan Paket Undangan</h1><p>Alur: pilih undangan → pilih paket → kupon → ringkasan → metode pembayaran → konfirmasi pesanan simulasi.</p></div>
      <div class="sim-banner">Ini <b>checkout simulasi</b>. Tidak ada pembayaran nyata yang diproses.</div>
      <div class="card"><h2>1 · Pilih Undangan & Paket</h2><p class="sub">Pesanan selalu terikat pada satu undangan yang sama dengan yang Anda edit di Builder. <b>Paket terkunci ke tier template undangan ini</b>${CO.ctxMissing ? ' — <b style="color:var(--err)">undangan yang dituju lewat tautan ini tidak ditemukan (mungkin sudah dihapus atau bukan milik Anda) — checkout DITAHAN. Pilih undangan dari daftar di bawah untuk melanjutkan.</b>' : lockPkg ? ' — ' + esc((kiInvTemplate(selInv) || {}).name || '') + ' (versi yang dipakai undangan ini) adalah template ' + esc(lockPkg.name) + ' (' + rp(lockPkg.price) + '), jadi hanya paket itu yang dapat dipesan untuk undangan ini' : ' — <b style="color:var(--err)">tier template undangan ini tidak dapat dibuktikan dari versi template yang dipakai, jadi checkout DITAHAN sampai tier dapat dibuktikan.</b>'}. Untuk paket lain, buat undangan dari template tier tersebut.</p>
        <div class="field"><label for="co-inv">Undangan</label><select class="input" id="co-inv">${CO.ctxMissing ? '<option value="" selected disabled>— pilih undangan —</option>' : ''}${mine.map(i => `<option value="${i.id}" ${i.id===CO.invId?'selected':''}>${esc(i.title)} — ${esc(tplOf(i).name)}</option>`).join('')}</select></div>
        <div class="pkg-pick">${DB.packages.map(p => { const off = tierUnresolved || (lockPkg && p.id !== lockPkg.id); const body = `<b>${esc(p.name)}</b><span class="amt2">${p.from ? '<small style="font-size:13px;font-family:var(--font-ui)">Mulai </small>' : ''}${rp(p.price)}</span><span style="font-size:13px;color:var(--ink-2)">${esc(p.note)}</span><ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>${off ? '<span style="font-size:12.5px;font-weight:700;color:var(--ink-3)">' + (tierUnresolved ? holdNote : 'Tidak tersedia untuk tier template undangan ini') + '</span>' : ''}`; return off ? `<div class="pkg-opt" style="opacity:.45" aria-disabled="true">${body}</div>` : `<button type="button" class="pkg-opt ${CO.pkgId===p.id?'on':''}" data-s2="co-pkg" data-id="${p.id}">${body}</button>`; }).join('')}</div>
      </div>
      <div class="card"><h2>2 · Kupon & Ringkasan</h2>
        <div class="toolbar2"><input class="input" id="co-coupon" placeholder="Kode kupon, cth. HEMAT10" value="${esc(CO.couponCode)}" style="text-transform:uppercase"><button class="btn ghost" data-s2="co-coupon-apply">Pakai Kupon</button></div>
        ${CO.coupon ? `<p style="color:var(--ok);font-weight:700;font-size:14px">Kupon ${esc(CO.coupon.code)} aktif — diskon ${CO.coupon.pct}%.</p>` : '<p style="font-size:13.5px;color:var(--ink-3)">Kupon demo yang valid: HEMAT10 dan LAUNCH20.</p>'}
        ${tierUnresolved ? `<div class="sum-row"><span>Paket belum dapat ditentukan — ${CO.ctxMissing ? 'undangan tidak ditemukan' : 'tier template tidak terbukti'}</span><span>—</span></div>` : `<div class="sum-row"><span>Paket ${esc(pkg.name)} untuk “${esc((mine.find(i => i.id === CO.invId) || {}).title || '')}”</span><span>${rp(pkg.price)}</span></div>`}
        <div class="sum-row"><span>Diskon kupon</span><span>${tierUnresolved ? '—' : '−' + rp(disc)}</span></div>
        <div class="sum-row total"><span>Total bayar (simulasi)</span><span>${tierUnresolved ? '—' : rp(pkg.price - disc)}</span></div>
      </div>
      <div class="card"><h2>3 · Metode Pembayaran (Simulasi)</h2>
        ${METHODS.map(m => `<button type="button" class="meth-opt ${CO.method===m[0]?'on':''}" data-s2="co-method" data-id="${esc(m[0])}"><span>${esc(m[0])}<small>${esc(m[1])}</small></span></button>`).join('')}
        <button class="btn gold block" data-s2="co-confirm" style="margin-top:8px"${tierUnresolved ? ' disabled' : ''}>${tierUnresolved ? holdTitle : 'Konfirmasi Pesanan Simulasi — ' + rp(pkg.price - disc)}</button>
        <p class="hint" style="margin-top:10px">Setelah konfirmasi, Anda masuk ke layar pembayaran simulasi dengan status awal <b>Pending</b>. Dari sana Anda dapat mensimulasikan pembayaran berhasil, gagal, atau kedaluwarsa.</p>
      </div></div>`;
      return shell(inner, 'dashboard');
    }
    function viewPay(order){
      if (!order) return shell(`<div class="wrap" style="padding:50px 20px 90px"><div class="empty"><h3>Pesanan tidak ditemukan</h3><a class="btn gold" href="#/dashboard?tab=pesanan">Ke Pesanan Saya</a></div></div>`, 'dashboard');
      const pay = kiActivePayment(order.id); /* v19: satu-satunya record yang dibaca permukaan ini — kode pembayaran berasal dari record percobaan aktif dan tidak pernah dibuat ulang saat render/muat ulang */
      const attemptNo = pay ? (pay.attempt || (S2.payments.filter(p => p.orderId === order.id).indexOf(pay) + 1)) : 0;
      const inv = S.invitations.find(i => i.id === order.invitationId);
      const done = order.paymentStatus === 'Success';
      const cancelled = order.status === 'Dibatalkan';
      /* v21: penahanan tier dihitung PROAKTIF di halaman ini juga
         (kiOrderTierHold) — kartu hold tampil sebelum pengguna sempat
         mencoba membayar, bukan hanya setelah flag needsNewOrder
         ditulis handler. */
      const hold21 = inv ? kiOrderTierHold(order, inv) : {held:false, expected:null, unresolved:false};
      const holdExpectedName = (order.tierHold && order.tierHold.expectedPackageName) || (hold21.expected && hold21.expected.name) || '';
      const inner = `<div class="wrap" style="padding-bottom:90px;max-width:760px"><div class="s2-head"><div class="rule"><span>Pembayaran Simulasi</span></div><h1>${esc(order.number)}</h1><p>${esc(inv ? inv.title : '')} · Paket ${esc(order.packageName)}</p></div>
      <div class="sim-banner">Layar ini adalah <b>simulasi pembayaran prototipe</b>. Tombol di bawah hanya mengubah status data demo — tidak ada transaksi, gerbang pembayaran, atau uang nyata.</div>
      <div class="pay-box"><div style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;opacity:.75">${esc(pay ? pay.method : '')} — Kode Pembayaran Simulasi${cancelled ? ' · Tidak Aktif' : ''}</div>
        ${cancelled ? `<div class="va" style="text-decoration:line-through;opacity:.45" aria-label="Kode pembayaran dinonaktifkan">${esc(pay ? pay.code : '—')}</div><div style="font-size:13.5px;font-weight:800;margin-top:2px">Kode ini sudah dinonaktifkan — jangan gunakan untuk membayar.</div>` : pay && pay.method === 'QRIS' ? '<div class="qr-fake" role="img" aria-label="Kode QR simulasi"></div>' : `<div class="va"${pay && (pay.status === 'Failed' || pay.status === 'Expired') ? ' style="text-decoration:line-through;opacity:.45"' : ''}>${esc(pay ? pay.code : '—')}</div>`}
        ${pay && (pay.status === 'Failed' || pay.status === 'Expired') ? `<div style="font-size:13.5px;font-weight:800;margin-top:2px">Kode percobaan ini sudah tidak aktif — percobaan baru mendapat kode baru.</div>` : ''}
        <div style="font-family:var(--font-display);font-size:26px">${rp(order.total)}</div>
        <div style="margin-top:8px">Status pembayaran: ${payPill(order.paymentStatus)} &nbsp;Status pesanan: <span class="pill draft" style="background:rgba(255,255,255,.18);color:inherit">${esc(order.status)}</span>${pay ? `<div style="font-size:12.5px;opacity:.8;margin-top:4px">Percobaan pembayaran ke-${attemptNo} — kode di atas tetap sama selama percobaan ini aktif, termasuk setelah halaman dimuat ulang. Kode baru hanya dibuat untuk percobaan baru, setelah percobaan lama berakhir Failed/Expired.</div>` : ''}</div>
      </div>
      ${!cancelled && !done && pay && pay.status !== 'Pending' ? `<div class="card" style="text-align:center"><p class="sub" style="margin:0">Percobaan pembayaran terakhir berstatus <b>${esc(pay.status)}</b> dan record-nya sudah final — record pembayaran yang sudah final tidak pernah ditulis ulang di jalur mana pun. Mensimulasikan hasil baru di bawah akan membuat <b>record pembayaran baru</b> untuk pesanan ini; kode di atas adalah kode percobaan terakhir.</p></div>` : ''}
      ${cancelled ? `<div class="card" style="text-align:center"><h2>Pesanan Dibatalkan</h2><p class="sub" style="margin-bottom:14px">Pesanan ini berstatus <b>Dibatalkan</b> — status terminal. Pembayaran tidak lagi ditawarkan untuk pesanan ini dan hasil pembayaran apa pun tidak dapat mengubahnya. Bila masih memerlukan paket ini, buat pesanan baru lewat checkout simulasi.</p>
        <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap"><a class="btn gold" href="#/checkout?inv=${order.invitationId}">Buat Pesanan Baru</a><a class="btn ghost" href="#/dashboard?tab=pesanan">Ke Pesanan Saya</a></div></div>`
      : done ? `<div class="card" style="text-align:center"><h2>Pembayaran Simulasi Berhasil</h2><p class="sub" style="margin-bottom:14px">Paket ${esc(order.packageName)} kini aktif untuk undangan “${esc(inv ? inv.title : '')}”. Pesanan dan dashboard Anda sudah diperbarui dari record yang sama.</p>
        <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap"><a class="btn gold" href="#/faktur/${order.id}">Lihat Faktur</a>${inv && inv.status !== 'published' ? `<button class="btn" data-s2="pay-publish" data-id="${order.id}">Publikasikan Undangan Sekarang</button>` : ''}<a class="btn ghost" href="#/dashboard">Ke Dashboard</a></div></div>`
      /* v25 F1 — GERBANG KEDUA di render: pesanan yang sudah Selesai /
         Diproses (tanpa Success — done=false) tidak lagi menawarkan
         tombol simulasi; handler pay-result tetap jadi backstop. */
      : order.status !== 'Menunggu Pembayaran' ? `<div class="card" style="text-align:center"><h2>Pesanan ${esc(order.status)}</h2><p class="sub" style="margin-bottom:14px">Pesanan ini berstatus <b>${esc(order.status)}</b> — pembayaran tidak lagi ditawarkan untuk pesanan ini dan percobaan pembayaran baru tidak dapat membukanya kembali. Bila masih memerlukan paket ini, buat pesanan baru lewat checkout simulasi.</p>
        <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap"><a class="btn gold" href="#/checkout?inv=${order.invitationId}">Buat Pesanan Baru</a><a class="btn ghost" href="#/dashboard?tab=pesanan">Ke Pesanan Saya</a></div></div>`
      : (order.needsNewOrder || hold21.held) ? `<div class="card" style="text-align:center"><h2>Pembayaran Ditahan — Paket Tidak Sesuai Tier Template</h2><p class="sub" style="margin-bottom:14px">${hold21.unresolved && !order.tierHold ? 'Tier template undangan “' + esc(inv ? inv.title : '') + '” tidak dapat dibuktikan dari versi template yang dipakai, jadi pembayaran untuk pesanan ini <b>ditahan</b>.' : 'Pesanan ini memakai paket <b>' + esc(order.packageName) + '</b>, tetapi undangan “' + esc(inv ? inv.title : '') + '” memakai template tier <b>' + esc(holdExpectedName) + '</b>.'} Hasil pembayaran untuk pesanan ini <b>ditahan</b>: paket yang salah tidak diaktifkan, dan snapshot pesanan ini (paket, harga, total) <b>tidak diubah</b> sebagai riwayat. Buat pesanan baru dengan paket yang benar lewat checkout — checkout kini terkunci ke tier template undangan.</p>
        <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap"><a class="btn gold" href="#/checkout?inv=${order.invitationId}">Buat Pesanan Baru yang Sesuai</a><a class="btn ghost" href="#/dashboard?tab=pesanan">Ke Pesanan Saya</a></div></div>`
      : `<div class="card"><h2>Simulasikan Hasil Pembayaran</h2><p class="sub">Pilih skenario untuk melihat bagaimana status pesanan, undangan, dan dashboard bereaksi. Pembayaran gagal atau kedaluwarsa <b>tidak</b> menerbitkan undangan.</p>
        <div style="display:grid;gap:9px">
          <button class="btn gold block" data-s2="pay-result" data-id="${order.id}" data-res="Success">Simulasikan: Pembayaran Berhasil</button>
          <button class="btn ghost block" data-s2="pay-result" data-id="${order.id}" data-res="Failed">Simulasikan: Pembayaran Gagal</button>
          <button class="btn ghost block" data-s2="pay-result" data-id="${order.id}" data-res="Expired">Simulasikan: Kedaluwarsa</button>
        </div>
        ${order.paymentStatus === 'Failed' || order.paymentStatus === 'Expired' ? '<p style="color:var(--err);font-weight:700;font-size:14px;margin:14px 0 0">Percobaan terakhir berakhir ' + esc(order.paymentStatus) + '. Anda dapat mencoba lagi dari tombol di atas.</p>' : ''}
      </div>`}
      <p style="text-align:center"><a href="#/dashboard?tab=pesanan" style="font-weight:800;color:var(--gold-ink)">← Kembali ke riwayat pesanan</a></p></div>`;
      return shell(inner, 'dashboard');
    }
    function viewInvoice(order){
      if (!order) return shell(`<div class="wrap" style="padding:50px 20px 90px"><div class="empty"><h3>Faktur tidak ditemukan</h3></div></div>`, 'dashboard');
      const inv = S.invitations.find(i => i.id === order.invitationId);
      const pay = kiActivePayment(order.id); /* v19: faktur membaca record percobaan aktif yang sama dengan halaman bayar */
      return shell(`<div class="wrap" style="padding:36px 20px 90px;max-width:720px">
        <p style="margin-bottom:14px"><a href="#/dashboard?tab=pesanan" style="font-weight:800;color:var(--gold-ink)">← Pesanan Saya</a></p>
        <div class="card"><div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap"><div><div class="brand" style="font-size:22px">Kita <em>Invite</em></div><span style="font-size:13px;color:var(--ink-3)">Faktur simulasi — bukan dokumen pajak</span></div><div style="text-align:right"><b>FAKTUR ${esc(order.number)}</b><div style="font-size:13px;color:var(--ink-3)">${new Date(order.createdAt).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</div></div></div>
        <div style="margin-top:18px">
          <div class="sum-row"><span>Ditagihkan kepada</span><span>${esc(userById(order.customerId).name)}</span></div>
          <div class="sum-row"><span>Undangan</span><span>${esc(inv ? inv.title : '—')}</span></div>
          <div class="sum-row"><span>Paket</span><span>${esc(order.packageName)}</span></div>
          <div class="sum-row"><span>Subtotal (harga saat pemesanan)</span><span>${rp(order.price)}</span></div>
          <div class="sum-row"><span>Diskon ${order.couponCode ? '(' + esc(order.couponCode) + ')' : ''}</span><span>−${rp(order.discount)}</span></div>
          <div class="sum-row total"><span>Total</span><span>${rp(order.total)}</span></div>
          <div class="sum-row"><span>Metode (simulasi)</span><span>${esc(pay ? pay.method : '—')}</span></div>
          <div class="sum-row"><span>Status pembayaran</span><span>${esc(order.paymentStatus)}</span></div>
          <div class="sum-row"><span>Status pesanan</span><span>${esc(order.status)}</span></div>
        </div></div>
        <p style="font-size:13.5px;color:var(--ink-3)">Untuk menyimpan faktur ini, gunakan fitur cetak / simpan PDF dari menu browser Anda.</p></div>`, 'dashboard');
    }

    /* ---------- Analitik, Notifikasi, Pengaturan ---------- */
    function dashAnalytics(params){
      const mine = myInvitations();
      if (!mine.length) return `<div class="empty"><h3>Belum ada undangan</h3></div>`;
      const inv = mine.find(i => i.id === (params.inv || D2.rsvpInv)) || mine[0];
      const gs = guestsOf(inv.id), rs = rsvpsOf(inv.id);
      const cnt = s => gs.filter(g => g.rsvpStatus === s).length;
      const max = Math.max(1, gs.length);
      const bar = (label, n, color) => `<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(n / max * 100)}%;${color ? 'background:' + color : ''}"></div></div><span>${n}</span></div>`;
      const revenue = S2.orders.filter(o => o.invitationId === inv.id && o.paymentStatus === 'Success').reduce((a, o) => a + o.total, 0);
      return `<div class="toolbar2"><label style="font-weight:700;font-size:14px">Undangan</label>${invPicker(inv.id).replace('s2-inv-pick','s2-ana-pick')}</div>
      <div class="stat-grid">
        <div class="stat"><b>${gs.length}</b><span>Tamu terdaftar</span></div>
        <div class="stat"><b>${rs.length}</b><span>Respons RSVP</span></div>
        <div class="stat"><b>${rs.filter(r => r.status==='Hadir').reduce((a,r) => a + (r.count||0), 0)}</b><span>Orang terkonfirmasi</span></div>
        <div class="stat"><b>${rp(revenue)}</b><span>Pendapatan simulasi undangan ini</span></div>
      </div>
      <div class="card"><h2>Komposisi RSVP Tamu</h2><p class="sub">Dihitung dari daftar tamu undangan “${esc(inv.title)}”.</p>
      ${bar('Hadir', cnt('Hadir'), 'var(--ok)')}${bar('Masih Ragu', cnt('Masih Ragu'), 'var(--warn)')}${bar('Tidak Hadir', cnt('Tidak Hadir'), 'var(--err)')}${bar('Belum Menjawab', cnt('Belum Menjawab'), 'var(--ink-3)')}
      <p style="font-size:13.5px;color:var(--ink-3);margin:14px 0 0">Grup terbesar: ${esc((() => { const m = {}; gs.forEach(g => m[g.group] = (m[g.group]||0) + 1); const top = Object.entries(m).sort((a,b) => b[1] - a[1])[0]; return top ? top[0] + ' (' + top[1] + ' tamu)' : '—'; })())}</p></div>`;
    }
    function dashNotifications(){
      const list = S2.notifications.filter(n => n.scope === 'customer' && n.owner === CURRENT_USER);
      return `<div class="card"><h2>Notifikasi</h2><p class="sub">Pembaruan dari RSVP, pembayaran simulasi, dan proyek desain Anda.</p>
      ${list.length ? `<div class="list-rows">${list.map(n => `<div class="lrow"><div class="grow"><b>${esc(n.title)}</b><div style="font-size:14.5px">${esc(n.body)}</div><div class="mut">${new Date(n.at).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div></div>${n.read ? '' : '<span class="pill exp">Baru</span>'}</div>`).join('')}</div>` : '<p style="color:var(--ink-2)">Belum ada notifikasi.</p>'}
      ${list.some(n => !n.read) ? '<button class="btn ghost sm" data-s2="notif-read" style="margin-top:14px">Tandai Semua Dibaca</button>' : ''}</div>`;
    }
    function storageHealthHTML(){
      const q = load2(K2.quarantine, []);
      const bk = load2(K2.backup, null);
      return `<div class="card"><h2>Keamanan & Pemulihan Data Lokal</h2><p class="sub">Sebelum migrasi apa pun berjalan, aplikasi menyimpan satu snapshot cadangan seluruh data lokal di perangkat ini${bk && bk.at ? ' (terakhir: ' + new Date(bk.at).toLocaleString('id-ID') + ')' : ''}. Record yang rusak tidak dihapus — isinya dipindah ke karantina dan dapat dipulihkan.</p>
      <p style="font-size:14.5px;margin:0 0 14px">Record di karantina: <b>${q.length}</b>${q.length ? ' — ' + q.map(x => esc(x.key)).join(', ') : ''}</p>
      <p style="font-size:14px;margin:0 0 12px"><b>Reproduksi uji:</b> klik kedua tombol uji di bawah pada halaman ini — hasil tampil per kasus (LOLOS/GAGAL) dengan <i>expected</i> vs <i>actual</i> untuk kasus-kasus v19. Kedua suite berjalan pada stub/record sintetis disposable dan memulihkan seluruh storage &amp; state sesi sesudahnya (kasus isolasi + snapshot seluruh key memverifikasinya).</p>
      <div style="display:flex;gap:9px;flex-wrap:wrap"><button class="btn ghost sm" data-s2="backup-download">Unduh Cadangan (JSON)</button><button class="btn ghost sm" data-s2="fixture-test">Jalankan Uji Fixture Terisolasi (Reset · Handler · Payment Gate · Impor · Orphan · Publish · Owner · RSVP · Layanan · Seed · Grant · Autosave · Rollback · Unassign · Badge · Checkout Terkunci · Batal · Rekonsiliasi · Nama RSVP · Tier Order Lama · Versi Template · Expiry Clamp · Identitas RSVP · Kode Bayar · Isolasi · Snapshot Key · v21: Tier Ditahan Tampil · Fail-Closed · Bukti Silang · Kode Baru QRIS · RSVP Multi-Tamu · Rollback Jujur · State Machine · Badge Nusantara · v21.2: Konteks Checkout · Reset Kunci Sementara · Demo Layout · v22: CTA Order Batal · Alias Bantuan · Header 821px)</button><button class="btn ghost sm" data-s2="handler-test">Jalankan Uji Handler Penuh (Event Nyata: Checkout · Batal · Bayar/Rekonsiliasi · RSVP · Tier Ditahan · RSVP Dua Tamu · Kode Bayar · v21: Hold Tampil · Tolak Percobaan Baru · Kode Baru QRIS · RSVP Nama Sama · Rollback Gagal · Assign/Unassign · Batal Terminal · v21.2: Konteks Checkout · Reset Kunci Sementara · v22: CTA Order Batal · Alias Bantuan)</button>${q.length ? '<button class="btn gold sm" data-s2="quarantine-restore">Pulihkan Record Karantina</button>' : ''}</div><div id="fixture-results" style="margin-top:12px"></div><div id="handler-results" style="margin-top:12px"></div></div>`;
    }
    function dashSettings(){
      return storageHealthHTML() + `<div class="card"><h2>Reset Data Demo</h2><p class="sub">Mengembalikan seluruh lingkungan demo ke data awal bawaan Stage 2: undangan demo, 22 tamu, respons RSVP, 8 pesanan & pembayaran, 4 permintaan desain, kupon, notifikasi, dan aktivitas. Tepat sebelum reset berjalan, snapshot cadangan data saat ini disimpan dan record karantina dipertahankan — jalur pemulihan tidak ikut terhapus. Bila cadangan gagal ditulis (mis. penyimpanan penuh), reset berhenti dan tidak ada data yang dihapus.</p>
      <p style="background:#F9E9E4;border:1px solid #EBC5B8;color:var(--err);border-radius:var(--r-md);padding:13px 16px;font-size:14px;font-weight:600">Perhatian: reset juga <b>menghapus draft undangan yang Anda buat sendiri</b> selama sesi demo ini, karena semuanya tersimpan di perangkat yang sama. Reset tidak pernah berjalan tanpa konfirmasi.</p>
      <button class="btn" data-s2="reset-demo" style="background:var(--err);color:#FFF">Reset Data Demo…</button></div>
      <div class="card"><h2>Tentang Penyimpanan</h2><p class="sub">Undangan tersimpan per record dengan key <b>vowora:v1:invitation:&lt;id&gt;</b>; tamu, RSVP, pesanan, pembayaran, layanan, dan notifikasi tersimpan per koleksi (vowora:v1:guests, vowora:v1:rsvps, vowora:v1:orders, vowora:v1:payments, vowora:v1:service-requests, vowora:v1:notifications) di localStorage perangkat ini.</p></div>`;
    }

    /* ---------- 2E: Bantuan Desain (sisi pelanggan) ---------- */
    const SVC_FLOW = ['New','Paid','Assigned','In Progress','Review','Revision','Approved','Published','Completed'];
    function svcSteps(status){
      const ix = SVC_FLOW.indexOf(status);
      return `<div class="step-flow">${SVC_FLOW.map((s, i) => `<span class="${s===status?'on':i<ix?'done':''}">${s}</span>`).join('')}</div>`;
    }
    function dashServices(){
      const mine = S2.services.filter(s => s.customerId === CURRENT_USER).slice().sort((a, b) => b.updatedAt - a.updatedAt);
      return `<div class="card"><h2>Ajukan Bantuan Desain</h2><p class="sub">Ceritakan kebutuhan acara Anda; tim Kita Invite menugaskan desainer dan Anda meninjau hasilnya di sini. Pengajuan membuat record proyek nyata yang sama dengan yang dilihat admin & desainer.</p>
      <form id="s2-svc-form">
        <div class="row2">
          <div class="field"><label for="sv-cat">Kategori acara *</label><select class="input" id="sv-cat">${DB.categories.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('')}</select></div>
          <div class="field"><label for="sv-name">Nama acara *</label><input class="input" id="sv-name" required maxlength="90" placeholder="cth. Pernikahan Nadia & Reza"></div>
        </div>
        <div class="row2">
          <div class="field"><label for="sv-date">Tanggal acara</label><input class="input" id="sv-date" type="date"></div>
          <div class="field"><label for="sv-style">Gaya yang diinginkan</label><select class="input" id="sv-style">${DB.styles.map(s => `<option>${esc(s.name)}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label>Fitur yang diinginkan</label><div style="display:flex;gap:8px;flex-wrap:wrap">${['Countdown','Galeri','Amplop Digital','RSVP & Buku Ucapan','Musik Latar','Dress Code','Timeline Acara'].map(f => `<label class="checkline" style="border:1px solid var(--line);border-radius:999px;padding:8px 13px"><input type="checkbox" name="sv-feat" value="${f}"> ${f}</label>`).join('')}</div></div>
        <div class="field"><label for="sv-inv">Tautkan ke undangan saya (opsional)</label><select class="input" id="sv-inv"><option value="">— Tidak ditautkan —</option>${myInvitations().map(i => `<option value="${i.id}">${esc(i.title)} (${invStatus(i).label})</option>`).join('')}</select><p class="hint">Proyek tertaut berbagi record yang sama dengan undangan & pesanannya. Status proyek dan publikasi undangan tetap dua hal terpisah.</p></div>
        <div class="field"><label for="sv-ref">Referensi visual (dari pustaka media demo)</label><select class="input" id="sv-ref">${DB.media.map(m => `<option value="${m.id}">${esc(m.name)} — ${esc(m.tag)}</option>`).join('')}</select></div>
        <div class="field"><label for="sv-notes">Catatan tambahan</label><textarea class="textarea input" id="sv-notes" rows="3" placeholder="Warna favorit, hal yang dihindari, tenggat, dan sebagainya"></textarea></div>
        <button class="btn gold" type="submit">Kirim Permintaan Desain</button>
      </form></div>
      <div class="card"><h2>Proyek Saya</h2><p class="sub">${mine.length} proyek bantuan desain atas nama Anda.</p>
      ${mine.length ? mine.map(s => svcCardCustomer(s)).join('') : '<p style="color:var(--ink-2)">Belum ada proyek. Kirim brief pertama Anda lewat formulir di atas.</p>'}
      </div>`;
    }
    function svcCardCustomer(s){
      const des = s.designerId ? userById(s.designerId).name : 'Belum ditugaskan';
      const linked = s.invitationId ? S.invitations.find(i => i.id === s.invitationId) : null;
      const linkedOrder = s.orderId ? S2.orders.find(o => o.id === s.orderId) : null;
      return `<div style="border:1px solid var(--line-soft);border-radius:var(--r-md);padding:18px;margin-bottom:14px">
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:baseline"><b style="font-size:16.5px">${esc(s.title)}</b><span class="pill gold" style="background:var(--champagne);color:var(--gold-ink)">${esc(s.number)}</span><span class="pill ${s.status==='Completed'?'pub':s.status==='Review'?'exp':'draft'}">${esc(s.status)}</span></div>
        <div style="font-size:13.5px;color:var(--ink-3);margin:5px 0 12px">Desainer: ${esc(des)} · Revisi: ${s.revisions.length} · Diperbarui ${new Date(s.updatedAt).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})} · Acara: ${esc(s.eventDate || '—')}</div>
        ${linked ? `<div style="font-size:13.5px;margin:0 0 12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span style="color:var(--ink-3)">Undangan terkait:</span><b>${esc(linked.title)}</b><span class="pill ${invStatus(linked).cls}">${invStatus(linked).label}</span>${linkedOrder ? `<span style="color:var(--ink-3)">Pesanan ${esc(linkedOrder.number)} · ${esc(linkedOrder.paymentStatus)}</span>` : ''}<a class="btn ghost sm" href="#/studio/${linked.id}">Buka Builder</a>${linked.status === 'published' ? `<a class="btn ghost sm" href="#/u/${linked.slug}">Halaman Publik</a>` : (s.status === 'Published' || s.status === 'Completed' || s.status === 'Approved') ? `<button class="btn gold sm" data-s2="svc-publish-inv" data-id="${s.id}">Terbitkan Undangan Terkait</button>` : ''}</div>` : ''}
        ${svcSteps(s.status)}
        ${s.status === 'Review' ? `<div style="background:var(--ivory);border:1px solid var(--line-soft);border-radius:var(--r-md);padding:14px;margin-bottom:12px"><b>Pratinjau desain dari desainer</b><div style="display:flex;gap:12px;align-items:center;margin-top:8px;flex-wrap:wrap"><img src="${mediaById(s.reference || 'reception').src}" alt="Pratinjau desain" style="width:86px;height:86px;object-fit:cover;border-radius:10px"><p style="font-size:14px;color:var(--ink-2);margin:0;flex:1;min-width:200px">Konsep “${esc(s.style)}” untuk ${esc(s.eventName)} sudah siap ditinjau. Setujui untuk lanjut ke publikasi, atau minta revisi dengan catatan.</p></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn gold sm" data-s2="svc-approve" data-id="${s.id}">Setujui Desain</button><button class="btn ghost sm" data-s2="svc-revision" data-id="${s.id}">Minta Revisi…</button></div></div>` : ''}
        ${s.revisions.length ? `<div style="font-size:13.5px;color:var(--ink-2)"><b>Riwayat revisi:</b><ul style="margin:6px 0 0;padding-left:18px">${s.revisions.map(r => `<li>${esc(r.note)} <span style="color:var(--ink-3)">(${new Date(r.at).toLocaleDateString('id-ID',{day:'numeric',month:'short'})})</span></li>`).join('')}</ul></div>` : ''}
      </div>`;
    }
    /* ---------- 2E: Ruang Kerja Desainer ---------- */
    function viewDesigner(){
      const me = userById(kiActiveDesigner());
      /* Workspace DIBATASI ke assignee yang sedang aktif: hanya proyek
         yang designerId-nya desainer aktif ini yang tampil dan dapat
         ditulis — proyek desainer lain tidak muncul di sini sama sekali,
         dan handler tulisnya (svcGuard) menolak desainer non-aktif. */
      const mine = S2.services.filter(s => s.designerId === kiActiveDesigner()).slice().sort((a, b) => b.updatedAt - a.updatedAt);
      const inner = `<div class="wrap" style="padding-bottom:90px"><div class="s2-head"><div class="rule"><span>Ruang Kerja Desainer</span></div><h1>Proyek yang Ditugaskan</h1><p>Anda masuk sebagai desainer <b>${esc(me.name)}</b>. Workspace ini hanya menampilkan proyek yang ditugaskan kepada Anda; proyek desainer lain tidak tampil dan tidak dapat diubah dari sini. Setiap perubahan status tersimpan ke record proyek yang sama dengan yang dilihat pelanggan dan admin.</p>
      <div class="toolbar2" style="margin-top:12px"><label style="font-weight:700;font-size:14px" for="s2-designer-pick">Desainer aktif (demo)</label><select class="input" id="s2-designer-pick" style="width:auto">${S2.users.filter(u => u.role === 'designer').map(u => `<option value="${u.id}" ${u.id===kiActiveDesigner()?'selected':''}>${esc(u.name)}</option>`).join('')}</select></div></div>${roleBar()}
      ${mine.length ? mine.map(s => `<div class="card"><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:baseline"><h2 style="font-size:20px">${esc(s.title)}</h2><span class="pill gold" style="background:var(--champagne);color:var(--gold-ink)">${esc(s.number)}</span><span class="pill exp">${esc(s.status)}</span></div>
        <p class="sub">Pelanggan: ${esc(userById(s.customerId).name)} · Desainer: ${esc(userById(s.designerId).name)} · Gaya: ${esc(s.style)} · Fitur: ${esc((s.features||[]).join(', ') || '—')} · Referensi: ${esc((mediaById(s.reference || 'reception') || {}).name || '—')}<br>Catatan pelanggan: ${esc(s.notes || '—')}</p>
        ${svcSteps(s.status)}
        <form class="s2-note-form" data-id="${s.id}" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><input class="input" name="note" required maxlength="200" placeholder="Tambah catatan internal untuk tim…" style="flex:1;min-width:220px"><button class="btn ghost sm" type="submit">Simpan Catatan</button></form>
        ${(s.internalNotes||[]).length ? `<ul style="font-size:13.5px;color:var(--ink-2);margin:0 0 12px;padding-left:18px">${s.internalNotes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
        ${s.revisions.length ? `<p style="font-size:13.5px"><b>Permintaan revisi pelanggan:</b> ${esc(s.revisions[s.revisions.length - 1].note)}</p>` : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${s.status === 'Assigned' ? `<button class="btn gold sm" data-s2="svc-progress" data-id="${s.id}" data-to="In Progress">Mulai Kerjakan</button>` : ''}
          ${s.status === 'In Progress' || s.status === 'Revision' ? `<button class="btn gold sm" data-s2="svc-progress" data-id="${s.id}" data-to="Review">Kirim untuk Ulasan Pelanggan</button>` : ''}
          ${s.status === 'Review' ? '<span style="font-size:13.5px;color:var(--ink-3);font-weight:700">Menunggu keputusan pelanggan…</span>' : ''}
        </div></div>`).join('') : '<div class="empty"><h3>Belum ada proyek yang ditugaskan</h3><p>Admin menugaskan desainer dari panel Admin → Layanan Bantuan.</p></div>'}
      </div>`;
      return shell(inner, 'admin');
    }

    /* ---------- 2D: Admin ---------- */
    const ADMIN_TABS = [['ringkasan','Ringkasan'],['template','Template'],['kategori','Kategori'],['gaya','Gaya'],['pelanggan','Pelanggan'],['undangan','Undangan'],['pesanan','Pesanan'],['pembayaran','Pembayaran'],['layanan','Layanan Bantuan'],['media','Pustaka Media'],['paket','Paket'],['kupon','Kupon'],['notifikasi','Notifikasi'],['pengaturan','Pengaturan']];
    function adminShell(tab, inner){
      return shell(`<div class="wrap" style="padding-bottom:40px"><div class="s2-head"><div class="rule"><span>Admin Kita Invite — Mode Demo</span></div><h1>Panel Admin</h1><p>Seluruh angka dan daftar berasal dari data aplikasi yang sama dengan dashboard pelanggan, Builder, dan halaman publik.</p></div>${roleBar()}
      <div class="card" style="padding:14px 18px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;${kiAdminWriteOn() ? 'border-color:var(--err)' : ''}"><b>${kiAdminWriteOn() ? 'Izin Tulis Admin: AKTIF (sesi ini)' : 'Mode Inspeksi Admin: hanya-lihat lintas-pemilik'}</b><span style="font-size:13.5px;color:var(--ink-2);flex:1;min-width:220px">${kiAdminWriteOn() ? 'Perubahan pada data milik akun lain kini diizinkan di handler dan akan disimpan.' : 'Data lintas-pemilik dapat diperiksa, tetapi semua penulisan ditolak di handler sampai izin tulis diaktifkan secara eksplisit.'}</span><button class="btn ${kiAdminWriteOn() ? 'ghost' : 'gold'} sm" data-s2="admin-write-toggle">${kiAdminWriteOn() ? 'Matikan Izin Tulis' : 'Aktifkan Izin Tulis Admin'}</button></div>
      <div class="admin-grid"><nav class="admin-nav">${ADMIN_TABS.map(t => `<a href="#/admin?tab=${t[0]}" class="${tab===t[0]?'on':''}">${t[1]}</a>`).join('')}</nav><div>${inner}</div></div></div>`, 'admin');
    }
    function adminOverview(){
      const rev = S2.payments.filter(p => p.status === 'Success').reduce((a, p) => a + p.amount, 0);
      return `<div class="stat-grid">
        <div class="stat"><b>${S2.users.filter(u => u.role === 'customer').length}</b><span>Pelanggan</span></div>
        <div class="stat"><b>${S.invitations.length}</b><span>Total undangan</span><small>${S.invitations.filter(i => invStatus(i).key==='published').length} terbit</small></div>
        <div class="stat"><b>${S2.orders.length}</b><span>Total pesanan</span><small>${S2.orders.filter(o => o.paymentStatus === 'Pending').length} pembayaran pending</small></div>
        <div class="stat"><b>${rp(rev)}</b><span>Pendapatan simulasi</span><small>dari pembayaran berstatus Success</small></div>
        <div class="stat"><b>${S2.services.filter(s => s.status === 'New').length}</b><span>Permintaan desain baru</span></div>
        <div class="stat"><b>${TEMPLATES.filter(t => t.status === 'published').length}</b><span>Template terbit</span><small>${TEMPLATES.length} total di CMS</small></div>
        <div class="stat"><b>${S2.guests.length}</b><span>Total tamu</span></div>
        <div class="stat"><b>${S2.rsvps.length}</b><span>Total RSVP</span></div>
      </div>
      <div class="card"><h2>Aktivitas Platform</h2><p class="sub">Jejak terbaru lintas modul.</p><div class="list-rows">${S2.activity.slice().sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 8).map(a => `<div class="lrow"><div class="grow"><b style="font-weight:600">${esc(a.text)}</b><div class="mut">${new Date(a.at).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div></div></div>`).join('')}</div></div>`;
    }
    function adminTemplates(params){
      if (params.edit){
        const rec = TEMPLATES.find(t => t.id === params.edit);
        if (!rec) return `<div class="empty"><h3>Template tidak ditemukan</h3></div>`;
        return `<div class="card"><h2>${params.edit === 'baru' ? 'Buat Template Baru' : 'Ubah Template — ' + esc(rec.name)}</h2><p class="sub">Menyimpan perubahan menaikkan versi template. Undangan pelanggan yang sudah dibuat <b>tetap memakai versi saat mereka membuatnya</b> dan kontennya tidak pernah ditimpa CMS.</p>
        <form id="s2-tpl-form" data-id="${rec.id}">
          <div class="row2"><div class="field"><label>Nama template *</label><input class="input" id="tf-name" required value="${esc(rec.name)}"></div>
          <div class="field"><label>Harga (Rp) *</label><input class="input" id="tf-price" type="number" min="0" step="1000" required value="${rec.price}"></div></div>
          <div class="field"><label>Deskripsi *</label><textarea class="textarea input" id="tf-desc" rows="3" required>${esc(rec.desc)}</textarea></div>
          <div class="row2">
            <div class="field"><label>Kategori</label><select class="input" id="tf-cat">${DB.categories.map(c => `<option value="${c.id}" ${rec.categoryId===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
            <div class="field"><label>Gaya visual</label><select class="input" id="tf-style">${DB.styles.map(s => `<option value="${s.id}" ${rec.styleId===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select></div>
          </div>
          <div class="row2">
            <div class="field"><label>Paket yang memenuhi syarat</label><select class="input" id="tf-tier">${['Basic','Premium','Signature','Exclusive'].map(x => `<option ${rec.tier===x?'selected':''}>${x}</option>`).join('')}</select></div>
            <div class="field"><label>Status publikasi</label><select class="input" id="tf-status">${[['published','Terbit'],['draft','Draft'],['archived','Arsip']].map(x => `<option value="${x[0]}" ${rec.status===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></div>
          </div>
          <div class="field"><label>Foto sampul (thumbnail)</label><div class="thumb-pick">${DB.media.map(m => `<button type="button" data-s2="tf-thumb" data-id="${m.id}" class="${rec.thumb===m.id?'on':''}"><img src="${m.src}" alt="${esc(m.name)}"></button>`).join('')}</div><input type="hidden" id="tf-thumb-val" value="${rec.thumb}"></div>
          <div class="field"><label>Seksi yang didukung</label><div style="display:flex;gap:8px;flex-wrap:wrap">${['cover','quote','subjects','countdown','events','story','timeline','dresscode','gallery','gift','rsvp','closing'].map(s => `<label class="checkline" style="border:1px solid var(--line);border-radius:999px;padding:8px 13px"><input type="checkbox" name="tf-sec" value="${s}" ${rec.sections.includes(s)?'checked':''}> ${(SECTION_META[s]||[s])[0]}</label>`).join('')}</div><p class="hint">Kolom yang dapat diubah pelanggan mengikuti seksi ini di Builder.</p></div>
          <div class="field"><label>Fitur unggulan (satu per baris)</label><textarea class="textarea input" id="tf-feats" rows="3">${esc((rec.features||[]).join('\n'))}</textarea></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn gold" type="submit">Simpan Template (versi naik)</button><a class="btn ghost" href="#/admin?tab=template">Kembali</a></div>
        </form></div>`;
      }
      return `<div class="card"><h2>Template CMS</h2><p class="sub">${TEMPLATES.length} template. Template berstatus <b>Terbit</b> langsung tampil di marketplace beserta filter kategori & gayanya.</p>
      <button class="btn gold sm" data-s2="tpl-new" style="margin-bottom:16px">${ICONS.plus} Buat Template Baru</button>
      <div class="list-rows">${TEMPLATES.map(t => `<div class="lrow"><img src="${mediaById(t.thumb).src}" alt="" style="width:52px;height:64px;object-fit:cover;border-radius:8px">
        <div class="grow"><b>${esc(t.name)}</b> <span class="pill ${t.status==='published'?'pub':t.status==='archived'?'arc':'draft'}">${t.status==='published'?'Terbit':t.status==='archived'?'Arsip':'Draft'}</span>
        <div class="mut">${esc((catById(t.categoryId)||{}).name || '')} · ${esc((styleById(t.styleId)||{}).name || '')} · ${esc(t.tier)} · ${rp(t.price)} · v${t.version}.0</div></div>
        <span style="display:flex;gap:7px;flex-wrap:wrap"><a class="btn ghost sm" href="#/demo/${t.slug}">Pratinjau</a><a class="btn ghost sm" href="#/admin?tab=template&edit=${t.id}">Ubah</a>
        ${t.status !== 'published' ? `<button class="btn ghost sm" data-s2="tpl-status" data-id="${t.id}" data-st="published">Terbitkan</button>` : `<button class="btn ghost sm" data-s2="tpl-status" data-id="${t.id}" data-st="archived">Arsipkan</button>`}
        </span></div>`).join('')}</div></div>`;
    }
    function adminTaxonomy(kind){
      const isCat = kind === 'kategori';
      const items = isCat ? DB.categories.map(c => ({id:c.id, name:c.name, extra:c.desc + ' · ' + TEMPLATES.filter(t => t.categoryId === c.id).length + ' template'})) : DB.styles.map(s => ({id:s.id, name:s.name, extra:TEMPLATES.filter(t => t.styleId === s.id).length + ' template'}));
      return `<div class="card"><h2>${isCat ? 'Kategori Acara' : 'Gaya Visual'}</h2><p class="sub">${isCat ? 'Kategori dipakai marketplace, Builder, dan formulir Bantuan Desain.' : 'Gaya dipakai filter marketplace dan CMS template.'} Item baru langsung dikenali filter marketplace.</p>
      <form id="s2-tax-form" data-kind="${kind}" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px"><input class="input" id="tax-name" required maxlength="40" placeholder="Nama ${isCat ? 'kategori' : 'gaya'} baru…" style="flex:1;min-width:200px">${isCat ? '<input class="input" id="tax-desc" maxlength="70" placeholder="Deskripsi singkat…" style="flex:1;min-width:200px">' : ''}<button class="btn gold sm" type="submit">Tambah</button></form>
      <div class="list-rows">${items.map(x => `<div class="lrow"><div class="grow"><b>${esc(x.name)}</b><div class="mut">${esc(x.extra || '')}</div></div></div>`).join('')}</div></div>`;
    }
    function adminSimple(tab){
      if (tab === 'pelanggan') return `<div class="card"><h2>Pelanggan & Akun Demo</h2><p class="sub">Akun-akun demo platform, termasuk peran admin dan desainer.</p><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Nama</th><th>Email</th><th>Peran</th><th>Undangan</th><th>Pesanan</th><th>Bergabung</th></tr></thead><tbody>${S2.users.map(u => `<tr><td data-l="Nama"><b>${esc(u.name)}</b></td><td data-l="Email">${esc(u.email)}</td><td data-l="Peran">${esc(u.role)}</td><td data-l="Undangan">${S.invitations.filter(i => i.ownerId === u.id).length}</td><td data-l="Pesanan">${S2.orders.filter(o => o.customerId === u.id).length}</td><td data-l="Bergabung">${new Date(u.joined).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</td></tr>`).join('')}</tbody></table></div></div>`;
      if (tab === 'undangan') return `<div class="card"><h2>Semua Undangan</h2><p class="sub">Record yang sama dengan milik pelanggan — perubahan di Builder pelanggan langsung tercermin di sini.</p><div class="list-rows">${S.invitations.map(inv => { const st = invStatus(inv); const unres = inv.status === 'published' && !!st.unresolved; return `<div class="lrow"><div class="grow"><b>${esc(inv.title)}</b> <span class="pill ${st.cls}">${st.label}</span>${unres ? ' <span class="pill unres">Paket belum terselesaikan</span>' : ''}<div class="mut">${esc(userById(inv.ownerId).name)} · ${esc(tplOf(inv).name)} v${inv.templateVersion}.0 · ${guestsOf(inv.id).length} tamu · ${rsvpsOf(inv.id).length} RSVP${inv.slug ? ' · /u/' + esc(inv.slug) : ''}${unres ? ' · masa akses belum terhitung — tidak ada paket yang terbukti dari pesanan terkait' : (inv.status === 'published' && st.endsAt ? ' · masa aktif paket berakhir ' + new Date(st.endsAt).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '')}</div></div><a class="btn ghost sm" href="#/studio/${inv.id}">Lihat Builder (Admin)</a></div>`; }).join('')}</div></div>`;
      if (tab === 'pesanan') return `<div class="card"><h2>Semua Pesanan</h2><p class="sub">Kelola status pesanan lintas pelanggan. Status pembayaran tetap terpisah dan hanya berubah lewat simulasi pembayaran.</p><div class="list-rows">${S2.orders.slice().sort((a,b) => b.createdAt - a.createdAt).map(o => orderCard(o, true)).join('')}</div></div>`;
      if (tab === 'pembayaran') return `<div class="card"><h2>Pembayaran (Simulasi)</h2><p class="sub">Semua record pembayaran simulasi beserta pesanan induknya.</p><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Kode</th><th>Pesanan</th><th>Metode</th><th>Jumlah</th><th>Status</th><th>Waktu</th></tr></thead><tbody>${S2.payments.slice().sort((a,b) => b.createdAt - a.createdAt).map(p => { const o = S2.orders.find(x => x.id === p.orderId); return `<tr><td data-l="Kode">${esc(p.code)}</td><td data-l="Pesanan">${esc(o ? o.number : '—')}</td><td data-l="Metode">${esc(p.method)}</td><td data-l="Jumlah">${rp(p.amount)}</td><td data-l="Status">${payPill(p.status)}</td><td data-l="Waktu">${new Date(p.createdAt).toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</td></tr>`; }).join('')}</tbody></table></div></div>`;
      if (tab === 'layanan') return `<div class="card"><h2>Antrean Layanan Bantuan</h2><p class="sub">Tugaskan desainer dan pantau alur New → Paid → Assigned → In Progress → Review → Revision → Approved → Published → Completed pada record yang sama dengan milik pelanggan.</p>
      <div class="list-rows">${S2.services.slice().sort((a,b) => b.updatedAt - a.updatedAt).map(s => { const li = s.invitationId ? S.invitations.find(i => i.id === s.invitationId) : null; const lo = s.orderId ? S2.orders.find(x => x.id === s.orderId) : null; return `<div class="lrow"><div class="grow"><b>${esc(s.title)}</b> <span class="pill exp">${esc(s.status)}</span><div class="mut">${esc(s.number)} · ${esc(userById(s.customerId).name)} · revisi ${s.revisions.length} · diperbarui ${new Date(s.updatedAt).toLocaleDateString('id-ID',{day:'numeric',month:'short'})}${li ? ' · Undangan: ' + esc(li.title) + ' (' + invStatus(li).label + ')' : ''}${lo ? ' · Pesanan ' + esc(lo.number) + ' · ' + esc(lo.paymentStatus) : ''}</div></div>
        <span style="display:flex;gap:7px;flex-wrap:wrap;align-items:center"><label style="font-size:13px;font-weight:700">Desainer</label>
        <select class="input" data-s2-assign="${s.id}" style="width:auto;min-height:42px"><option value="">Lepas desainer</option>${S2.users.filter(u => u.role === 'designer').map(u => `<option value="${u.id}" ${s.designerId===u.id?'selected':''}>${esc(u.name)}</option>`).join('')}</select>
        ${s.status === 'Approved' ? `<button class="btn gold sm" data-s2="svc-progress" data-id="${s.id}" data-to="Published">Terbitkan Hasil</button>` : ''}
        ${s.status === 'Published' ? `<button class="btn gold sm" data-s2="svc-progress" data-id="${s.id}" data-to="Completed">Selesaikan Proyek</button>` : ''}
        </span></div>`; }).join('')}</div></div>`;
      if (tab === 'media') return `<div class="card"><h2>Pustaka Media</h2><p class="sub">Aset demo yang dipakai Builder, CMS, dan referensi Bantuan Desain.</p><div class="media-grid">${DB.media.map(m => `<div class="media-item" style="cursor:default"><img src="${m.src}" alt="${esc(m.name)}"><span class="cap">${esc(m.name)} · ${esc(m.tag)}</span></div>`).join('')}</div></div>`;
      if (tab === 'paket') return `<div class="card"><h2>Paket & Harga</h2><p class="sub">Perubahan harga hanya berlaku untuk pesanan baru — pesanan lama menyimpan snapshot harganya sendiri.</p>
      <div style="background:var(--ivory);border:1px solid var(--line);border-radius:var(--r-md);padding:13px 16px;font-size:14px;margin-bottom:16px"><b>Kebijakan masa akses paket — masa aktif dihitung sejak undangan diterbitkan:</b> Basic 1 bulan · Premium 6 bulan · Signature 12 bulan · Exclusive 18 bulan. Undangan yang sudah terbit tetap publik sampai masa akses paketnya berakhir; sesudah itu halaman publiknya menampilkan pemberitahuan masa akses berakhir. Tanggal acara <b>tidak</b> menutup halaman publik. Paket Free: semua template dapat diedit dan draft/simpan gratis — batas jumlah draft dan lama simpan draft <b>belum ditetapkan</b> (menunggu keputusan), jadi belum ada batas yang diterapkan.</div>
      ${DB.packages.map(p => `<form class="s2-pkg-form" data-id="${p.id}" style="border:1px solid var(--line-soft);border-radius:var(--r-md);padding:16px;margin-bottom:12px"><b>${esc(p.name)}</b><div class="row2" style="margin-top:10px"><div class="field" style="margin:0"><label>Harga (Rp)</label><input class="input" name="price" type="number" min="0" step="1000" value="${p.price}"></div><div class="field" style="margin:0"><label>Fitur (satu per baris)</label><textarea class="textarea input" name="features" rows="3">${esc(p.features.join('\n'))}</textarea></div></div><button class="btn gold sm" type="submit" style="margin-top:10px">Simpan Paket ${esc(p.name)}</button></form>`).join('')}</div>`;
      if (tab === 'kupon') return `<div class="card"><h2>Kupon</h2><p class="sub">Kupon aktif dapat dipakai pelanggan di checkout.</p>
      <form id="s2-coupon-form" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px"><input class="input" id="cp-code" required maxlength="16" placeholder="KODEBARU" style="flex:1;min-width:140px;text-transform:uppercase"><input class="input" id="cp-pct" required type="number" min="1" max="90" placeholder="%" style="width:100px"><input class="input" id="cp-note" maxlength="50" placeholder="Catatan…" style="flex:1;min-width:160px"><button class="btn gold sm" type="submit">Tambah Kupon</button></form>
      <div class="list-rows">${S2.coupons.map(c => `<div class="lrow"><div class="grow"><b>${esc(c.code)}</b> — ${c.pct}%<div class="mut">${esc(c.note)}</div></div><span class="pill ${c.active?'pub':'arc'}">${c.active?'Aktif':'Nonaktif'}</span><button class="btn ghost sm" data-s2="coupon-toggle" data-id="${c.id}">${c.active?'Nonaktifkan':'Aktifkan'}</button></div>`).join('')}</div></div>`;
      if (tab === 'notifikasi') return `<div class="card"><h2>Notifikasi Platform</h2><div class="list-rows">${S2.notifications.map(n => `<div class="lrow"><div class="grow"><b>${esc(n.title)}</b> <span class="pill draft">${esc(n.scope)}</span><div style="font-size:14.5px">${esc(n.body)}</div><div class="mut">${new Date(n.at).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div></div></div>`).join('')}</div></div>`;
      if (tab === 'pengaturan') return `<div class="card"><h2>Pengaturan Platform (Demo)</h2><form id="s2-settings-form">
        <div class="field"><label>Nama platform</label><input class="input" id="set-name" value="${esc(S2.settings.storeName)}"></div>
        <div class="field"><label>Email dukungan</label><input class="input" id="set-email" value="${esc(S2.settings.supportEmail)}"></div>
        <div class="vis-row"><div><b>Publikasi wajib pembayaran</b><span>Pengaturan ini <b>aktif secara bawaan</b>. Jika aktif, undangan hanya bisa terbit setelah ada pembayaran simulasi berstatus Success yang terhubung ke undangan itu — undangan yang belum punya pesanan sama sekali juga tertahan, tanpa pengecualian. Gate ini ditegakkan di semua jalur publikasi: Builder, halaman pembayaran, dan proyek Bantuan Desain.</span></div><label class="switch"><input type="checkbox" id="set-gate" ${S2.settings.publishNeedsPayment?'checked':''}><i></i></label></div>
        <button class="btn gold" type="submit" style="margin-top:14px">Simpan Pengaturan</button></form></div>
        <div class="card"><h2>Reset Data Demo</h2><p class="sub">Mengembalikan seed awal Stage 2 dan menghapus seluruh record buatan sesi ini — termasuk draft undangan buatan sendiri. Selalu dengan konfirmasi.</p><button class="btn" data-s2="reset-demo" style="background:var(--err);color:#FFF">Reset Data Demo…</button></div>`;
      return '';
    }
    function viewAdmin(params){
      /* v22 — alias tab 'bantuan' -> 'layanan' (Antrean Layanan Bantuan,
         tab yang benar); tab tak dikenal -> kembali ke tab default
         'ringkasan' DENGAN pesan yang jelas (bukan panel kosong tanpa
         penjelasan). */
      let tab = params.tab || 'ringkasan';
      if (tab === 'bantuan') tab = 'layanan';
      const unknownTab = ADMIN_TABS.some(t => t[0] === tab) ? null : tab;
      if (unknownTab) tab = 'ringkasan';
      let inner = '';
      if (tab === 'ringkasan') inner = adminOverview();
      else if (tab === 'template') inner = adminTemplates(params);
      else if (tab === 'kategori' || tab === 'gaya') inner = adminTaxonomy(tab);
      else inner = adminSimple(tab);
      if (unknownTab) inner = `<div class="card" style="border-color:var(--err)"><h2>Tab tidak dikenal</h2><p class="sub">Tab “${esc(unknownTab)}” tidak ada di Panel Admin — menampilkan Ringkasan. Gunakan navigasi di samping untuk membuka tab yang tersedia.</p></div>` + inner;
      return adminShell(tab === 'template' && params.edit ? 'template' : tab, inner);
    }

    /* ---------- Router Stage 2 (berjalan setelah router Stage 1) ---------- */
    function viewDashboard(params){
      const tab = params.tab || 'ringkasan';
      let inner = '';
      if (tab === 'ringkasan') inner = dashOverview();
      else if (tab === 'undangan') inner = dashInvitations();
      else if (tab === 'tamu') inner = dashGuests(params);
      else if (tab === 'rsvp') inner = dashRsvp(params);
      else if (tab === 'pesanan') inner = dashOrders();
      else if (tab === 'layanan') inner = dashServices();
      else if (tab === 'analitik') inner = dashAnalytics(params);
      else if (tab === 'notifikasi') inner = dashNotifications();
      else if (tab === 'pengaturan') inner = dashSettings();
      return dashShell(tab, inner);
    }
    function s2Render(){
      const { seg, params } = parseHash();
      if (!seg.length || seg[0] === 'u' || seg[0] === 'studio' || seg[0] === 'template' || seg[0] === 'demo' || seg[0] === 'buat') return;
      let html = null;
      if (seg[0] === 'dashboard') html = viewDashboard(params);
      else if (seg[0] === 'checkout') html = viewCheckout(params);
      else if (seg[0] === 'bayar' && seg[1]){ const o = S2.orders.find(x => x.id === seg[1]); html = o && !kiOrderViewAllowed(o) ? orderForbidden() : viewPay(o); }
      else if (seg[0] === 'faktur' && seg[1]){ const o = S2.orders.find(x => x.id === seg[1]); html = o && !kiOrderViewAllowed(o) ? orderForbidden() : viewInvoice(o); }
      else if (seg[0] === 'admin') html = S2.role === 'admin' ? viewAdmin(params) : roleForbidden('Admin');
      else if (seg[0] === 'desainer') html = S2.role === 'designer' ? viewDesigner() : roleForbidden('Desainer');
      else if (seg[0] === 'draft-saya'){ html = viewDashboard({tab:'undangan'}); }
      if (html !== null){ app.innerHTML = html; window.scrollTo(0, 0); }
    }
    window.addEventListener('hashchange', s2Render);

