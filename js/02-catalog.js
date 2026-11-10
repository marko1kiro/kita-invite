    /* ---------- Pasangan tipografi & ornamen ---------- */
    const FONT_PAIRS = [
      {id:'editorial', name:'Editorial Serif', display:'"Playfair Display", Georgia, serif', body:'"Manrope", sans-serif', sample:'Aurelia & Bimo'},
      {id:'romantis', name:'Romantis Klasik', display:'"Cormorant Garamond", Georgia, serif', body:'"Jost", sans-serif', sample:'Aurelia & Bimo'},
      {id:'modern', name:'Modern Marcellus', display:'"Marcellus", Georgia, serif', body:'"Jost", sans-serif', sample:'AURELIA & BIMO'}
    ];
    const fontPair = id => FONT_PAIRS.find(f => f.id === id) || FONT_PAIRS[0];
    const ORNAMENTS = {
      floral: {name:'Bunga Klasik', svg: ICONS.flower},
      garis: {name:'Garis Art Deco', svg: ICONS.diamond},
      daun: {name:'Daun Tropis', svg: ICONS.leaf},
      hati: {name:'Hati Minimal', svg: ICONS.heart}
    };

    /* ---------- Konten demo per kategori ---------- */
    const DEMO = {
      wedding: () => ({
        coverKicker:'The Wedding Of', quote:'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.', quoteSource:'QS. Ar-Rum: 21',
        subjects:[
          {role:'Mempelai Wanita', name:'Aurelia Saraswati Putri, S.E.', nick:'Aurelia', detail:'Putri dari Bapak H. Bambang Sutrisno & Ibu Hj. Ratna Dewi', photo:'bride'},
          {role:'Mempelai Pria', name:'Bimo Aditama Prasetyo, S.T.', nick:'Bimo', detail:'Putra dari Bapak Ir. H. Dedi Prasetyo & Ibu Dra. Sri Wahyuni', photo:'couple-3'}
        ],
        coverPhoto:'couple-hero',
        events:[
          {label:'Akad Nikah', date:'2026-12-12', timeStart:'08.00', timeEnd:'10.00', venue:'Masjid Agung Al-Azhar', address:'Jl. Sisingamangaraja No. 1, Kebayoran Baru, Jakarta Selatan'},
          {label:'Resepsi', date:'2026-12-12', timeStart:'11.00', timeEnd:'13.00', venue:'The Sultan Ballroom', address:'Jl. Gatot Subroto, Senayan, Jakarta Pusat'}
        ],
        story:'Berawal dari perkenalan singkat di sebuah seminar kampus pada 2019, Aurelia dan Bimo menemukan kesamaan dalam hal-hal sederhana: kopi pagi, buku, dan perjalanan. Enam tahun kemudian, di tempat yang sama, Bimo melamar — dan Aurelia menjawab ya.',
        timeline:[{time:'08.00', title:'Akad Nikah', desc:'Prosesi ijab kabul bersama keluarga inti.'},{time:'11.00', title:'Resepsi & Ramah Tamah', desc:'Sesi foto dan jamuan bersama tamu undangan.'},{time:'12.30', title:'Pemotongan Kue', desc:'Simbol manisnya awal kehidupan baru.'},{time:'13.00', title:'Penutup & Doa', desc:'Doa bersama dipimpin keluarga.'}],
        dressNote:'Mohon berkenan mengenakan busana bernuansa ivory, champagne, atau sage. Hindari putih polos agar mempelai tetap menjadi pusat perhatian.', dressColors:['#E8DED0','#B79B72','#93A488','#C49A94'],
        gallery:['couple-hero','couple-3','couple-2','bride','rings','reception'],
        gift:{bank:'BCA', number:'8720 4455 21', holder:'a.n. Aurelia Saraswati', address:'Jl. Kenanga No. 8, Kebayoran Baru, Jakarta Selatan'},
        closing:'Merupakan suatu kehormatan dan kebahagiaan bagi kami beserta keluarga apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Atas kehadiran serta doa yang tulus, kami mengucapkan terima kasih.'
      }),
      engagement: () => ({
        coverKicker:'The Engagement Of', quote:'Cinta sejati bukan tentang menemukan orang yang sempurna, melainkan belajar melihat orang yang tidak sempurna dengan cara yang sempurna.', quoteSource:'Sam Keen',
        subjects:[
          {role:'Calon Mempelai Wanita', name:'Nadia Larasati, S.H.', nick:'Nadia', detail:'Putri dari Bapak Agus Wijaya & Ibu Maya Wijaya', photo:'bride'},
          {role:'Calon Mempelai Pria', name:'Raka Pradana, S.M.', nick:'Raka', detail:'Putra dari Bapak Hendra Pradana & Ibu Lilis Pradana', photo:'couple-3'}
        ],
        coverPhoto:'rings',
        events:[{label:'Pertunangan', date:'2026-09-19', timeStart:'10.00', timeEnd:'12.00', venue:'Plataran Menteng — Ruang Kaca', address:'Jl. HOS Cokroaminoto No. 42, Menteng, Jakarta Pusat'}],
        story:'Sebuah pertemuan keluarga yang hangat untuk meresmikan langkah kami menuju jenjang pernikahan. Kehadiran dan doa Bapak/Ibu sangat berarti bagi kami.',
        timeline:[{time:'10.00', title:'Pembukaan & Sambutan', desc:'Sambutan dari kedua keluarga.'},{time:'10.45', title:'Tukar Cincin', desc:'Pemasangan cincin sebagai tanda ikatan.'},{time:'11.30', title:'Ramah Tamah', desc:'Jamuan makan siang bersama.'}],
        dressNote:'Nuansa champagne dan emas lembut sangat kami apresiasi.', dressColors:['#E8DED0','#B79B72','#D9C6A5'],
        gallery:['rings','couple-2','reception'],
        gift:{bank:'Mandiri', number:'1370 0211 8890', holder:'a.n. Nadia Larasati', address:''},
        closing:'Terima kasih atas doa dan kehadiran Bapak/Ibu/Saudara/i. Sampai jumpa di hari bahagia kami berikutnya.'
      }),
      birthday: () => ({
        coverKicker:'Birthday Celebration', quote:'', quoteSource:'',
        subjects:[{role:'Yang Berulang Tahun', name:'Kirana Ayu Lestari', nick:'Kirana', detail:'Putri tercinta dari Bapak Andi Lestari & Ibu Dewi Lestari — merayakan usia ke-7', photo:'birthday'}],
        coverPhoto:'birthday',
        events:[{label:'Pesta Ulang Tahun', date:'2026-08-23', timeStart:'15.00', timeEnd:'17.30', venue:'Taman Bermain Kala Ceria', address:'Jl. Ciputat Raya No. 88, Tangerang Selatan'}],
        story:'Kirana genap berusia tujuh tahun! Akan ada permainan seru, pertunjukan sulap, dan kue stroberi favoritnya. Jangan lupa datang dengan kostum warna pastel, ya!',
        timeline:[{time:'15.00', title:'Registrasi & Bermain Bebas', desc:'Tamu kecil dipersilakan bermain.'},{time:'15.45', title:'Pertunjukan Sulap', desc:'Aksi sulap interaktif untuk anak-anak.'},{time:'16.30', title:'Tiup Lilin & Potong Kue', desc:'Momen utama perayaan.'},{time:'17.00', title:'Foto Bersama & Goodie Bag', desc:'Penutup dan pembagian bingkisan.'}],
        dressNote:'Tema pastel party — kenakan pakaian warna pastel favoritmu.', dressColors:['#F2C6C2','#F7DF9B','#A8C3A0','#A9C6DE'],
        gallery:['birthday'],
        gift:{bank:'', number:'', holder:'', address:''},
        closing:'Terima kasih sudah menjadi bagian dari hari istimewa Kirana. Sampai jumpa di pesta!'
      }),
      aqiqah: () => ({
        coverKicker:'Tasyakuran Aqiqah', quote:'Setiap anak tergadai dengan aqiqahnya, maka sembelihlah untuknya dan berilah ia nama yang baik.', quoteSource:'HR. Abu Dawud',
        subjects:[{role:'Buah Hati Kami', name:'Muhammad Arkan Alfarizi', nick:'Arkan', detail:'Putra pertama dari Bapak Fajar Ramadhan & Ibu Salsabila Zahra, lahir 28 Juni 2026', photo:'rings'}],
        coverPhoto:'reception',
        events:[{label:'Aqiqah & Cukur Rambut', date:'2026-08-02', timeStart:'09.00', timeEnd:'11.30', venue:'Kediaman Keluarga Ramadhan', address:'Jl. Melati No. 21, Beji, Depok'}],
        story:'Dengan penuh syukur, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam tasyakuran aqiqah putra pertama kami. Semoga Arkan tumbuh menjadi anak yang saleh dan berbakti.',
        timeline:[{time:'09.00', title:'Pembacaan Ayat Suci', desc:'Tilawah Al-Qur\u2019an.'},{time:'09.30', title:'Prosesi Cukur Rambut', desc:'Dipimpin ustaz dan keluarga.'},{time:'10.15', title:'Tausiyah & Doa', desc:'Ceramah singkat dan doa bersama.'},{time:'11.00', title:'Ramah Tamah', desc:'Jamuan untuk tamu undangan.'}],
        dressNote:'Busana muslim sopan bernuansa putih atau hijau sage.', dressColors:['#FFFFFF','#93A488','#E8DED0'],
        gallery:['reception'],
        gift:{bank:'BSI', number:'7210 8890 44', holder:'a.n. Fajar Ramadhan', address:''},
        closing:'Atas kehadiran dan doa Bapak/Ibu/Saudara/i, kami sekeluarga mengucapkan terima kasih yang sebesar-besarnya.'
      }),
      tasyakuran: () => ({
        coverKicker:'Tasyakuran & Pengajian', quote:'Dan (ingatlah) ketika Tuhanmu memaklumkan: Sesungguhnya jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu.', quoteSource:'QS. Ibrahim: 7',
        subjects:[{role:'Keluarga Pengundang', name:'Keluarga Besar H. Mahmud Syarif', nick:'Keluarga Mahmud', detail:'Syukuran menempati rumah baru dan khataman Al-Qur\u2019an', photo:'reception'}],
        coverPhoto:'reception',
        events:[{label:'Pengajian & Syukuran', date:'2026-08-16', timeStart:'19.30', timeEnd:'21.30', venue:'Kediaman Bapak H. Mahmud Syarif', address:'Jl. Kenanga Raya No. 3, Bekasi'}],
        story:'Sebagai wujud syukur atas nikmat dan karunia Allah SWT, kami bermaksud mengadakan pengajian serta doa bersama. Kehadiran Bapak/Ibu/Saudara/i sangat kami harapkan.',
        timeline:[{time:'19.30', title:'Pembacaan Yasin & Tahlil', desc:'Dipimpin Ust. H. Abdullah Syafiq.'},{time:'20.15', title:'Tausiyah', desc:'Ceramah bertema syukur dan silaturahmi.'},{time:'21.00', title:'Doa Bersama & Ramah Tamah', desc:'Penutup dan jamuan ringan.'}],
        dressNote:'Busana muslim/muslimah yang sopan.', dressColors:['#FFFFFF','#E8DED0','#93A488'],
        gallery:['reception'],
        gift:{bank:'', number:'', holder:'', address:''},
        closing:'Jazakumullah khairan katsiran atas kehadiran dan doa Bapak/Ibu/Saudara/i sekalian.'
      }),
      graduation: () => ({
        coverKicker:'Graduation Celebration', quote:'Pendidikan adalah tiket menuju masa depan. Hari esok dimiliki oleh orang-orang yang mempersiapkannya hari ini.', quoteSource:'Malcolm X',
        subjects:[{role:'Wisudawan', name:'Ghaisani Zahra Ramadhani, S.Kom.', nick:'Ghaisani', detail:'Lulusan Teknik Informatika, Universitas Indonesia — Cum Laude, IPK 3,89', photo:'graduation'}],
        coverPhoto:'graduation',
        events:[
          {label:'Upacara Wisuda', date:'2026-10-24', timeStart:'08.00', timeEnd:'11.00', venue:'Balairung Universitas Indonesia', address:'Kampus UI Depok, Jawa Barat'},
          {label:'Syukuran Kelulusan', date:'2026-10-24', timeStart:'12.30', timeEnd:'15.00', venue:'Aula Serbaguna Fakultas Ilmu Komputer', address:'Kampus UI Depok, Jawa Barat'}
        ],
        story:'Empat tahun perjalanan, satu lembar ijazah, dan begitu banyak cerita. Ghaisani mengundang sahabat dan keluarga untuk merayakan kelulusannya bersama.',
        timeline:[{time:'08.00', title:'Upacara Wisuda', desc:'Prosesi resmi universitas.'},{time:'12.30', title:'Syukuran & Ramah Tamah', desc:'Makan siang bersama keluarga dan sahabat.'},{time:'14.00', title:'Sesi Foto', desc:'Foto bersama di area kampus.'}],
        dressNote:'Smart casual; toga dan selempong disediakan untuk wisudawan.', dressColors:['#302D29','#B79B72','#F8F5EF'],
        gallery:['graduation'],
        gift:{bank:'', number:'', holder:'', address:''},
        closing:'Terima kasih atas dukungan dan doa selama masa studi. Kehadiran Anda adalah hadiah terbaik.'
      }),
      corporate: () => ({
        coverKicker:'Corporate Event', quote:'', quoteSource:'',
        subjects:[],
        orgName:'Nusantara Tech', orgTagline:'Annual Summit 2026 — Building What\u2019s Next',
        coverPhoto:'corporate',
        events:[{label:'Summit & Konferensi', date:'2026-11-05', timeStart:'09.00', timeEnd:'16.00', venue:'Jakarta Convention Center — Plenary Hall', address:'Jl. Gatot Subroto, Senayan, Jakarta Pusat'}],
        story:'Satu hari penuh wawasan bersama para pemimpin industri teknologi Indonesia: keynote, panel diskusi, dan peluncuran produk terbaru Nusantara Tech. Tempat terbatas untuk 500 peserta terdaftar.',
        timeline:[{time:'08.00', title:'Registrasi & Kopi Pagi', desc:'Registrasi ulang dan networking.'},{time:'09.00', title:'Keynote: Building What\u2019s Next', desc:'CEO Nusantara Tech.'},{time:'10.45', title:'Panel: AI untuk Bisnis Indonesia', desc:'Empat pemimpin industri.'},{time:'13.00', title:'Peluncuran Produk', desc:'Perkenalan platform terbaru.'},{time:'15.00', title:'Networking Session', desc:'Sesi jejaring terbuka.'}],
        dressNote:'Business attire. Name tag peserta dibagikan saat registrasi.', dressColors:['#1E2A38','#3E5C76','#B79B72'],
        gallery:['corporate'],
        gift:{bank:'', number:'', holder:'', address:''},
        closing:'Terima kasih atas partisipasi Anda. Sampai jumpa di Nusantara Tech Annual Summit 2026.'
      }),
      community: () => ({
        coverKicker:'Community Gathering', quote:'', quoteSource:'',
        subjects:[{role:'Penyelenggara', name:'Alumni SMAN 8 Jakarta Angkatan 2011', nick:'Alumni 2011', detail:'Reuni 15 tahun — sekali mendayung, tetap bersaudara', photo:'corporate'}],
        coverPhoto:'corporate',
        events:[{label:'Reuni Akbar', date:'2026-09-12', timeStart:'16.00', timeEnd:'20.00', venue:'Aula SMAN 8 Jakarta', address:'Jl. Taman Bukit Duri, Tebet, Jakarta Selatan'}],
        story:'Lima belas tahun berlalu sejak seragam putih abu-abu. Saatnya berkumpul lagi, berbagi kabar, dan mengenang masa sekolah bersama guru-guru tercinta.',
        timeline:[{time:'16.00', title:'Registrasi & Nostalgia Corner', desc:'Pameran foto angkatan.'},{time:'17.00', title:'Sambutan & Video Kilas Balik', desc:'Pemutaran video perjalanan angkatan.'},{time:'18.30', title:'Makan Malam & Hiburan', desc:'Live music dari alumni.'}],
        dressNote:'Atasan putih, bawahan bebas rapi.', dressColors:['#FFFFFF','#302D29'],
        gallery:['corporate'],
        gift:{bank:'', number:'', holder:'', address:''},
        closing:'Sampai bertemu di reuni! Kehadiran teman-teman adalah hal yang paling kami nantikan.'
      })
    };
    const DEMO_KEY = {'pernikahan':'wedding','lamaran':'engagement','ulang-tahun':'birthday','aqiqah':'aqiqah','tasyakuran':'tasyakuran','wisuda':'graduation','korporat':'corporate','komunitas':'community'};
    const demoFor = catId => (DEMO[DEMO_KEY[catId]] || DEMO.wedding)();

    /* ---------- Katalog template ---------- */
    const PAL = {
      ivory:   {bg:'#F8F5EF', surface:'#FFFDF8', ink:'#33302A', ink2:'#6E675C', accent:'#B79B72', accentInk:'#7A5F2E', line:'#E4DAC6'},
      rose:    {bg:'#FAF3F0', surface:'#FFF9F6', ink:'#3A2E2C', ink2:'#7D6A66', accent:'#C08A80', accentInk:'#96604F', line:'#EBD8D2'},
      sage:    {bg:'#F4F6EF', surface:'#FCFDF8', ink:'#2F352C', ink2:'#66705E', accent:'#93A488', accentInk:'#55663F', line:'#DCE3D2'},
      noir:    {bg:'#17150F', surface:'#221F18', ink:'#EFE7D7', ink2:'#B9AF9C', accent:'#C8A96A', accentInk:'#D9BC7E', line:'#3A352A'},
      noirRose:{bg:'#1D1517', surface:'#2A1E21', ink:'#F2E6E4', ink2:'#C2ACA9', accent:'#C08A80', accentInk:'#DCAFA5', line:'#423034'},
      blush:   {bg:'#FBF1EC', surface:'#FFF8F4', ink:'#43302B', ink2:'#846E66', accent:'#D29C8F', accentInk:'#A96A58', line:'#F0DCD2'},
      batik:   {bg:'#F6F1E7', surface:'#FCF8EF', ink:'#33291F', ink2:'#6E6152', accent:'#9A6B3F', accentInk:'#7A4E24', line:'#E3D3B8'},
      forest:  {bg:'#1F2A22', surface:'#28362C', ink:'#EDF1E6', ink2:'#B7C2AC', accent:'#B7C29A', accentInk:'#CEDBB4', line:'#3B4A3E'},
      pastel:  {bg:'#FDF6EC', surface:'#FFFDF8', ink:'#4A3A2C', ink2:'#857262', accent:'#E2A03F', accentInk:'#A96F14', line:'#F2E3C8'},
      candy:   {bg:'#FDF0F4', surface:'#FFF7FA', ink:'#472A38', ink2:'#84616F', accent:'#D9638C', accentInk:'#B03A68', line:'#F4D3DF'},
      slate:   {bg:'#F2F3F5', surface:'#FFFFFF', ink:'#23272E', ink2:'#5D646E', accent:'#3E5C76', accentInk:'#2C4358', line:'#DDE1E6'},
      inkblue: {bg:'#101820', surface:'#182430', ink:'#EAF0F5', ink2:'#A9BAC7', accent:'#7FA8C9', accentInk:'#A9C8E2', line:'#2A3A49'},
      cream:   {bg:'#F7F3EA', surface:'#FDFBF5', ink:'#2E2A23', ink2:'#6B6455', accent:'#8A6D3B', accentInk:'#6E5626', line:'#E6DCC6'}
    };
    function tpl(o){ return Object.assign({version:1, status:'published', radius:18}, o); }
    const TEMPLATES = [
      tpl({id:'luxury-ivory', slug:'luxury-ivory', name:'Luxury Ivory', categoryId:'pernikahan', styleId:'luxury-editorial', tier:'Premium', price:59000, featured:true, thumb:'couple-hero', ornament:'floral', fontId:'editorial',
        desc:'Patokan kualitas Kita Invite: fondasi ivory, aksen champagne-gold, serif editorial, dan ornamen bunga putih. Long-form, mobile-first, dan sangat refined.',
        palettes:[{id:'ivory', name:'Ivory Klasik', v:PAL.ivory},{id:'rose', name:'Dusty Rose', v:PAL.rose},{id:'sage', name:'Sage Lembut', v:PAL.sage}],
        sections:['cover','quote','subjects','countdown','events','story','timeline','dresscode','gallery','gift','rsvp','closing'],
        features:['Segel lilin (wax seal)','Countdown real-time','Galeri editorial','Amplop digital','RSVP & buku ucapan']}),
      tpl({id:'noir-elan', slug:'noir-elan', name:'Noir Élan', categoryId:'pernikahan', styleId:'dark-luxury', tier:'Signature', price:99000, thumb:'rings', ornament:'garis', fontId:'modern',
        desc:'Kemewahan gelap: latar arang pekat, aksen emas metalik, dan kontras dramatis untuk perayaan malam yang elegan.',
        palettes:[{id:'noir', name:'Noir Emas', v:PAL.noir},{id:'noirRose', name:'Noir Rose', v:PAL.noirRose}],
        sections:['cover','subjects','countdown','events','timeline','gallery','gift','rsvp','closing'],
        features:['Tema gelap dramatis','Tipografi Marcellus','Galeri sinematik','Amplop digital']}),
      tpl({id:'blossom-reverie', slug:'blossom-reverie', name:'Blossom Reverie', categoryId:'pernikahan', styleId:'romantic-floral', tier:'Premium', price:59000, thumb:'couple-2', ornament:'floral', fontId:'romantis',
        desc:'Romansa floral yang lembut: blush pink, komposisi foto taman, dan serif Cormorant yang mengalir seperti puisi.',
        palettes:[{id:'blush', name:'Blush Garden', v:PAL.blush},{id:'rose', name:'Rose Pucat', v:PAL.rose}],
        sections:['cover','quote','subjects','countdown','events','story','gallery','rsvp','closing'],
        features:['Nuansa taman bunga','Tipografi romantis','Cerita mempelai','Buku ucapan']}),
      tpl({id:'arunika-nusantara', slug:'arunika-nusantara', name:'Arunika Nusantara', categoryId:'pernikahan', styleId:'nusantara-heritage', tier:'Signature', price:99000, thumb:'reception', ornament:'daun', fontId:'editorial',
        desc:'Warisan Nusantara yang ditata kontemporer: cokelat rempah, aksen daun, dan ritme seksi yang tenang dan berkelas.',
        palettes:[{id:'batik', name:'Rempah Klasik', v:PAL.batik},{id:'forest', name:'Hutan Zamrud', v:PAL.forest}],
        sections:['cover','quote','subjects','countdown','events','story','timeline','dresscode','gallery','gift','rsvp','closing'],
        features:['Motif heritage modern','Dua tema warna','Timeline prosesi adat','Amplop digital']}),
      tpl({id:'champagne-vow', slug:'champagne-vow', name:'Champagne Vow', categoryId:'lamaran', styleId:'luxury-editorial', tier:'Premium', price:59000, thumb:'rings', ornament:'garis', fontId:'editorial',
        desc:'Untuk momen pertunangan yang intim: fokus pada cincin, champagne, dan janji yang diucapkan di hadapan keluarga.',
        palettes:[{id:'ivory', name:'Ivory Klasik', v:PAL.ivory},{id:'cream', name:'Krem Editorial', v:PAL.cream}],
        sections:['cover','subjects','events','story','timeline','gallery','rsvp','closing'],
        features:['Fokus momen tukar cincin','Layout intim','RSVP keluarga']}),
      tpl({id:'confetti-pop', slug:'confetti-pop', name:'Confetti Pop', categoryId:'ulang-tahun', styleId:'playful-creative', tier:'Basic', price:29000, thumb:'birthday', ornament:'hati', fontId:'modern',
        desc:'Ceria dan ekspresif untuk pesta ulang tahun anak maupun remaja: warna permen, bentuk playful, dan agenda yang jelas.',
        palettes:[{id:'candy', name:'Permen Pink', v:PAL.candy},{id:'pastel', name:'Pastel Ceria', v:PAL.pastel}],
        sections:['cover','subjects','events','story','timeline','dresscode','gallery','rsvp','closing'],
        features:['Tema warna ceria','Agenda pesta anak','RSVP orang tua']}),
      tpl({id:'pastel-soiree', slug:'pastel-soiree', name:'Pastel Soirée', categoryId:'ulang-tahun', styleId:'modern-minimalist', tier:'Basic', price:29000, thumb:'birthday', ornament:'garis', fontId:'modern',
        desc:'Ulang tahun dewasa yang bersih dan modern: geometri rapi, whitespace lega, dan palet pastel yang menenangkan.',
        palettes:[{id:'pastel', name:'Pastel Hangat', v:PAL.pastel},{id:'slate', name:'Slate Modern', v:PAL.slate}],
        sections:['cover','subjects','events','timeline','gallery','rsvp','closing'],
        features:['Desain minimal modern','Fokus foto','RSVP simpel']}),
      tpl({id:'noor-blessing', slug:'noor-blessing', name:'Noor Blessing', categoryId:'aqiqah', styleId:'modern-minimalist', tier:'Basic', price:29000, thumb:'reception', ornament:'daun', fontId:'romantis',
        desc:'Tenang dan penuh berkah untuk aqiqah buah hati: sage lembut, kutipan Islami, dan susunan acara yang tertib.',
        palettes:[{id:'sage', name:'Sage Berkah', v:PAL.sage},{id:'ivory', name:'Ivory Suci', v:PAL.ivory}],
        sections:['cover','quote','subjects','events','story','timeline','dresscode','rsvp','closing'],
        features:['Kutipan Islami','Susunan prosesi','RSVP keluarga']}),
      tpl({id:'taman-syukur', slug:'taman-syukur', name:'Taman Syukur', categoryId:'tasyakuran', styleId:'nusantara-heritage', tier:'Premium', price:59000, thumb:'reception', ornament:'daun', fontId:'editorial',
        desc:'Untuk pengajian dan tasyakuran keluarga: nuansa rempah yang hangat dengan tata letak khidmat dan mudah dibaca segala usia.',
        palettes:[{id:'batik', name:'Rempah Hangat', v:PAL.batik},{id:'sage', name:'Sage Teduh', v:PAL.sage}],
        sections:['cover','quote','subjects','events','story','timeline','dresscode','rsvp','closing'],
        features:['Huruf besar terbaca','Susunan pengajian','RSVP tamu']}),
      tpl({id:'laurel-achievement', slug:'laurel-achievement', name:'Laurel Achievement', categoryId:'wisuda', styleId:'contemporary-editorial', tier:'Premium', price:59000, thumb:'graduation', ornament:'garis', fontId:'modern',
        desc:'Grid editorial yang tegas untuk merayakan kelulusan: pencapaian, institusi, dan agenda syukuran dalam satu alur rapi.',
        palettes:[{id:'slate', name:'Slate Kampus', v:PAL.slate},{id:'cream', name:'Krem Klasik', v:PAL.cream}],
        sections:['cover','subjects','events','story','timeline','gallery','rsvp','closing'],
        features:['Profil lulusan','Dua sesi acara','Galeri kampus']}),
      tpl({id:'summit-prime', slug:'summit-prime', name:'Summit Prime', categoryId:'korporat', styleId:'contemporary-editorial', tier:'Signature', price:99000, thumb:'corporate', ornament:'garis', fontId:'modern',
        desc:'Undangan konferensi dan summit perusahaan: agenda terstruktur, profil acara yang meyakinkan, dan registrasi RSVP peserta.',
        palettes:[{id:'inkblue', name:'Midnight Summit', v:PAL.inkblue},{id:'slate', name:'Slate Profesional', v:PAL.slate}],
        sections:['cover','org','events','story','timeline','dresscode','gallery','rsvp','closing'],
        features:['Agenda per sesi','Profil perusahaan','Registrasi peserta']}),
      tpl({id:'monolith-boardroom', slug:'monolith-boardroom', name:'Monolith', categoryId:'korporat', styleId:'modern-minimalist', tier:'Premium', price:59000, thumb:'corporate', ornament:'garis', fontId:'modern',
        desc:'Minimalisme tegas untuk grand opening, launching, dan gathering perusahaan. Tanpa ornamen berlebih, penuh wibawa.',
        palettes:[{id:'slate', name:'Slate Monolit', v:PAL.slate},{id:'noir', name:'Hitam Emas', v:PAL.noir}],
        sections:['cover','org','events','timeline','rsvp','closing'],
        features:['Ultra-minimal','Cocok grand opening','RSVP cepat']}),
      tpl({id:'jejak-alumni', slug:'jejak-alumni', name:'Jejak Alumni', categoryId:'komunitas', styleId:'contemporary-editorial', tier:'Basic', price:29000, thumb:'corporate', ornament:'hati', fontId:'editorial',
        desc:'Untuk reuni dan temu komunitas: hangat, nostalgik, dan rapi — profil penyelenggara, agenda nostalgia, dan RSVP peserta.',
        palettes:[{id:'cream', name:'Krem Nostalgia', v:PAL.cream},{id:'sage', name:'Sage Teduh', v:PAL.sage}],
        sections:['cover','subjects','events','story','timeline','dresscode','rsvp','closing'],
        features:['Profil angkatan/komunitas','Agenda nostalgia','RSVP peserta']})
    ];
    const templateBySlug = slug => TEMPLATES.find(t => t.slug === slug);
    DB.categories.forEach(c => c.count = TEMPLATES.filter(t => t.categoryId === c.id).length);
