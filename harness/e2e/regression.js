// Modul regresi v25 — pengukuran layout yang sudah ditutup di ronde
// sebelumnya (header tablet + demo Luxury Ivory). Port ringkas dari
// browser-test/measure-brand.js dan measure-demo.js (Playwright nyata).
// v25 (Stage 2 correction): assertion brand TIDAK LAGI memakai lebar
// persis 148,3px — angka itu adalah lebar fallback Liberation Serif di
// runtime tes (Google Fonts tidak termuat: request fonts.googleapis.com
// gagal net::ERR_TUNNEL_CONNECTION_FAILED, document.fonts kosong), BUKAN
// lebar Playfair Display. Syarat visual sekarang: (i) wordmark satu
// baris, (ii) brand sepenuhnya di dalam .topbar (toleransi 0,5px),
// (iii) tanpa overlap dengan anak topbar lain, (iv) tanpa overflow
// horizontal. Font wordmark (Playfair Display 700 + Manrope 700) dicek
// eksplisit per route SEBELUM assertion visual: bila face-nya tidak ada
// di document.fonts dengan status loaded, tes FAIL menyebut nama font
// (document.fonts.check() saja TIDAK cukup — ia mengembalikan true
// bahkan untuk nama font yang tidak ada).
module.exports = {
  id: 'regression',
  name: 'Regresi layout (header tablet + demo)',
  run: async (t) => {
    const r1 = (x) => Math.round(x * 10) / 10;
    // --- Header: brand rect + clipping + overflow, 11 lebar x 2 route ---
    const WIDTHS = [768, 800, 820, 821, 825, 830, 840, 860, 880, 900, 1024];
    const brandEval = () => {
      const r1 = (x) => Math.round(x * 10) / 10;
      const iw = window.innerWidth;
      const de = document.documentElement;
      const rect = (el) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { left: r1(b.left), right: r1(b.right), top: r1(b.top), bottom: r1(b.bottom), width: r1(b.width), height: r1(b.height) };
      };
      const topbar = document.querySelector('.topbar');
      const topbarIn = document.querySelector('.topbar-in');
      const brand = document.querySelector('.topbar .brand');
      const small = brand ? brand.querySelector('small') : null;
      let mainTextLines = null;
      if (brand) {
        try {
          const tn = Array.from(brand.childNodes).find(n => n.nodeType === 3 && n.textContent.trim().length);
          if (tn) {
            const range = document.createRange();
            range.selectNodeContents(tn);
            mainTextLines = range.getClientRects().length;
          }
        } catch (e) { mainTextLines = 'error:' + (e && e.message); }
      }
      const children = [];
      if (topbarIn) {
        for (const el of topbarIn.children) {
          const r = rect(el);
          if (r) children.push({ cls: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 40), rect: r });
        }
      }
      const overlaps = [];
      const vis = children.filter(c => c.rect.width > 0 && c.rect.height > 0);
      for (let i = 0; i < vis.length; i++) {
        for (let j = i + 1; j < vis.length; j++) {
          const a = vis[i].rect, b = vis[j].rect;
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ox > 0.5 && oy > 0.5) overlaps.push({ a: vis[i].cls, b: vis[j].cls, ox: r1(ox), oy: r1(oy) });
        }
      }
      const topbarRect = rect(topbar);
      const brandRect = rect(brand);
      const btn = document.querySelector('.topbar a.btn.gold.sm.desk');
      const btnRect = rect(btn);
      // v25: containment penuh brand di dalam topbar (4 sisi, toleransi
      // 0,5px) — clippedVertically di atas hanya mencakup sisi vertikal.
      const insideTopbar = (topbarRect && brandRect) ? (
        brandRect.left >= topbarRect.left - 0.5 &&
        brandRect.right <= topbarRect.right + 0.5 &&
        brandRect.top >= topbarRect.top - 0.5 &&
        brandRect.bottom <= topbarRect.bottom + 0.5) : null;
      // v25: irisan yang melibatkan brand saja (subset overlaps di atas),
      // supaya pesan kegagalan brand menyebut langsung lawannya.
      const brandOverlaps = overlaps.filter(o => o.a.indexOf('brand') !== -1 || o.b.indexOf('brand') !== -1);
      // v25: ketersediaan font wordmark BERDASARKAN Face yang benar-benar
      // termuat (family + weight 700 + status loaded). document.fonts.check()
      // TIDAK dipakai: ia true bahkan untuk nama font khayalan, dan
      // document.fonts.status 'loaded' meski document.fonts kosong.
      // Brand: teks utama "Kita Invite" = Playfair Display 700 24px
      // (var --font-display); tagline <small> = Manrope 700 9,5px
      // (var --font-ui). Keduanya dimuat via Google Fonts di index.html.
      const faceLoaded = (fam) => {
        let found = false;
        document.fonts.forEach(f => { if (f.family === fam && f.weight === '700' && f.status === 'loaded') found = true; });
        return found;
      };
      let totalFaces = 0;
      document.fonts.forEach(() => { totalFaces++; });
      return {
        innerWidth: iw,
        docScrollWidth: de.scrollWidth,
        clientWidth: de.clientWidth,
        overflowPx: de.scrollWidth - iw,
        topbarRect,
        brand: brandRect ? {
          rect: brandRect,
          clippedVertically: topbarRect ? (brandRect.top < topbarRect.top - 0.5 || brandRect.bottom > topbarRect.bottom + 0.5) : null,
          insideTopbar,
          brandOverlaps,
          mainTextLines,
          smallH: small ? r1(small.getBoundingClientRect().height) : null,
        } : null,
        overlaps,
        btnRight: btnRect ? btnRect.right : null,
        fonts: { playfairLoaded: faceLoaded('Playfair Display'), manropeLoaded: faceLoaded('Manrope'), totalFaces },
      };
    };
    // v25: gate font wordmark — async, menunggu document.fonts.ready
    // dulu supaya face yang sedang diunduh sempat berstatus loaded.
    // Dijalankan sekali per route SEBELUM assertion visual; bila font
    // tidak tersedia, check ini FAIL menyebut nama fontnya.
    const fontEval = async () => {
      await document.fonts.ready;
      const faceLoaded = (fam) => {
        let found = false;
        document.fonts.forEach(f => { if (f.family === fam && f.weight === '700' && f.status === 'loaded') found = true; });
        return found;
      };
      let totalFaces = 0;
      document.fonts.forEach(() => { totalFaces++; });
      return { playfairLoaded: faceLoaded('Playfair Display'), manropeLoaded: faceLoaded('Manrope'), totalFaces };
    };
    for (const route of ['', 'demo/luxury-ivory']) {
      const label = route === '' ? '#/' : '#/' + route;
      t.section('header ' + label);
      // v25: gate font sebelum loop lebar (page-level, bukan per lebar).
      await t.setViewport(768, 844);
      await t.goto(route);
      const f = await t.eval(fontEval);
      const missingFonts = [];
      if (!f.playfairLoaded) missingFonts.push('Playfair Display (700)');
      if (!f.manropeLoaded) missingFonts.push('Manrope (700)');
      t.check(`font wordmark ${label}`, missingFonts.length === 0,
        missingFonts.length === 0
          ? `Playfair Display 700 + Manrope 700 termuat (${f.totalFaces} face di document.fonts)`
          : `FONT WORDMARK TIDAK TERSEDIA di runtime tes: ${missingFonts.join(', ')} — wordmark dirender font fallback, bukan font aslinya (document.fonts berisi ${f.totalFaces} face)`);
      for (const w of WIDTHS) {
        await t.setViewport(w, 844);
        await t.goto(route);
        const m = await t.eval(brandEval);
        const b = m.brand;
        // v25: syarat visual sebenarnya, TANPA lebar persis. (i) satu
        // baris; (ii) sepenuhnya di dalam topbar (insideTopbar, ±0,5px;
        // clippedVertically dipertahankan sebagai komponen vertikalnya);
        // (iii) tidak beririsan dengan anak topbar lain (brandOverlaps).
        const okBrand = b && b.mainTextLines === 1 && b.clippedVertically === false && b.insideTopbar === true && b.brandOverlaps.length === 0;
        t.check(`brand ${w}px ${label}`, okBrand, `top=${b && b.rect.top} bottom=${b && b.rect.bottom} left=${b && b.rect.left} right=${b && b.rect.right} h=${b && b.rect.height} w=${b && b.rect.width} lines=${b && b.mainTextLines} clip=${b && b.clippedVertically} insideTopbar=${b && b.insideTopbar} brandOverlaps=${b ? JSON.stringify(b.brandOverlaps) : null} topbar=${JSON.stringify(m.topbarRect)}`);
        t.check(`overflow horizontal ${w}px ${label}`, m.overflowPx <= 0, `overflowPx=${m.overflowPx} doc=${m.docScrollWidth} client=${m.clientWidth}`);
        t.check(`tumpang tindih ${w}px ${label}`, m.overlaps.length === 0, JSON.stringify(m.overlaps));
      }
      await t.shot('header-' + (route === '' ? 'home' : 'demo') + '-821');
    }
    // --- Demo Luxury Ivory: kolom + urutan + overflow ---
    const demoEval = () => {
      const iw = window.innerWidth;
      const de = document.documentElement;
      const rect = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top * 10) / 10, bottom: Math.round(r.bottom * 10) / 10, left: Math.round(r.left * 10) / 10, right: Math.round(r.right * 10) / 10, width: Math.round(r.width * 10) / 10, height: Math.round(r.height * 10) / 10 };
      };
      const grid = document.querySelector('.detail-grid');
      const preview = rect('.phone-shell');
      const detail = rect('.detail-info');
      const buybox = rect('.buybox');
      return {
        innerWidth: iw,
        overflowPx: de.scrollWidth - iw,
        gridCols: grid ? window.getComputedStyle(grid).gridTemplateColumns : null,
        gridCls: grid ? (grid.className || '') : null,
        orderMobile: preview && detail && buybox
          ? { previewAboveDetail: preview.bottom <= detail.top + 1, buyboxInsideDetail: buybox.top >= detail.top - 1 && buybox.bottom <= detail.bottom + 1 }
          : null,
        twoCol: preview && detail
          ? { previewLeftOfDetail: preview.right <= detail.left + 1, sameRow: Math.abs(preview.top - detail.top) < 200 }
          : null,
      };
    };
    t.section('demo luxury-ivory');
    for (const w of [320, 360, 375, 390, 430, 820]) {
      await t.setViewport(w, 844);
      await t.goto('demo/luxury-ivory');
      const m = await t.eval(demoEval);
      const cols = (m.gridCols || '').trim().split(/\s+/).filter(Boolean).length;
      t.check(`demo ${w}px 1 kolom`, cols === 1, `gridCols=${m.gridCols}`);
      t.check(`demo ${w}px urutan preview->detail->buybox`, !!(m.orderMobile && m.orderMobile.previewAboveDetail && m.orderMobile.buyboxInsideDetail), JSON.stringify(m.orderMobile));
      t.check(`demo ${w}px overflow 0`, m.overflowPx === 0, `overflowPx=${m.overflowPx}`);
    }
    for (const w of [821, 1024]) {
      await t.setViewport(w, 844);
      await t.goto('demo/luxury-ivory');
      const m = await t.eval(demoEval);
      const cols = (m.gridCols || '').trim().split(/\s+/).filter(Boolean).length;
      t.check(`demo ${w}px 2 kolom`, cols === 2, `gridCols=${m.gridCols}`);
      t.check(`demo ${w}px preview kiri dari detail`, !!(m.twoCol && m.twoCol.previewLeftOfDetail && m.twoCol.sameRow), JSON.stringify(m.twoCol));
      t.check(`demo ${w}px overflow 0`, m.overflowPx === 0, `overflowPx=${m.overflowPx}`);
    }
    await t.shot('demo-390');
    await t.shot('demo-1024');
  },
};
