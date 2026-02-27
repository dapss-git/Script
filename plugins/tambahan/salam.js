let handler = m => m

handler.before = async function (m, { conn }) {
    if (m.isBaileys || !m.isGroup || !m.text) return 
    
    let budy = m.text.toLowerCase().trim()

    // 🚩 1. ANTI BOCAH "P" (Auto Delete + Longest Yapping Toxic)
    if (/^(p|pe|pee|p e|p e e|pp|pepe|peeh|peh|p\.|p\.\.|p\.\.\.|p{2,})$/i.test(budy.replace(/\s+/g, ''))) {
        try { await conn.sendMessage(m.chat, { delete: m.key }) } catch (e) {}
        
        let toxic = [`Kak? Salam dong Masa cuma p p kamu kira saya ini apa? pe pa pe pe \nSalam Kak Salam Kalo bingung mau salam apa salam sesuai agama aja kak toleransi jangan cuma p p doang gak sopan tau itu`]
        return m.reply(toxic[Math.floor(Math.random() * toxic.length)])
    }

    // 🚩 2. ISLAM (Assalammualaikum + 10 Hadits Yapping)
    if (/^(a[s]{1,3}alam|as[l]{1,2}m|assalam[u]?[l]?aik[u]?m|as[s]?alammualaikum|aswr|ass|p[u]?napa|mikum|askum)/i.test(budy)) {
        let islam = [
            `*وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ* 🤲\n\nKetahuilah kawan, menjawab salam itu wajib! Rasulullah ﷺ bersabda: _"Hak seorang muslim atas muslim lainnya ada lima: (1) Menjawab salam, (2) Menjenguk yang sakit, (3) Mengantar jenazah, (4) Memenuhi undangan, dan (5) Mendoakan yang bersin."_ (HR. Bukhari & Muslim). Barangkali dengan menjawab salammu, dosa-dosa kita berguguran.`,
            `*وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ* 🌙\n\nRasulullah ﷺ bersabda: _"Kalian tidak akan masuk surga hingga kalian beriman, dan tidaklah kalian beriman hingga kalian saling mencintai. Maukah aku tunjukkan sesuatu yang jika kalian kerjakan kalian akan saling mencintai? Sebarkanlah salam di antara kalian."_ (HR. Muslim). Masya Allah, salam adalah kunci surga dan cinta antar sesama!`,
            `*وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ* ✨\n\nWa'alaikumussalam kawan! Ingat ya, menjawab salam itu sesuai perintah Allah di *QS. An-Nisa: 86*: _"Apabila kamu dihormati dengan suatu penghormatan, maka balaslah penghormatan itu dengan yang lebih baik, atau balaslah dengan yang serupa."_ Semoga keselamatan dan keberkahan selalu melimpah untukmu.`,
            `*وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ* 🕌\n\nSeseorang bertanya kepada Nabi ﷺ: _"Islam manakah yang paling baik?"_ Beliau menjawab: _"Engkau memberi makan dan mengucapkan salam kepada orang yang engkau kenal maupun yang tidak engkau kenal."_ (HR. Bukhari & Muslim). Terima kasih sudah menyapa dengan adab yang mulia!`,
            `*وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ* 🌟\n\nTahukah kamu? Dari Imran bin Husain, pria datang kepada Nabi mengucap salam lengkap, Nabi bersabda: _"Tiga puluh (pahala)."_ (HR. Abu Daud). Dengan salam lengkapmu ini, moga kita dapet 30 poin pahala. Gak kayak si 'P' yang cuma dapet dosa dan makian!`,
            `*وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ* 🌹\n\nRasulullah ﷺ bersabda: _"Sesungguhnya orang yang paling dekat dengan Allah adalah orang yang paling dahulu mengucapkan salam."_ (HR. Abu Daud). Meski aku yang menjawab, semoga kamu dapet posisi paling dekat dengan-Nya karena memulai kebaikan ini.`,
            `*وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ* 🕌\n\nImam Nawawi menjelaskan menjawab salam hukumnya fardhu kifayah. Tapi menjawabnya secara personal membawa keberkahan luar biasa. Rasulullah ﷺ bersabda salam adalah nama di antara nama-nama Allah yang diletakkan di bumi, maka sebarkanlah!`,
            `*وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ* 🌷\n\nSapaanmu menyejukkan hati! Rasulullah ﷺ bersabda: _"Hendaklah yang kecil memberi salam kepada yang besar, yang berjalan kepada yang duduk, dan yang sedikit kepada yang banyak."_ (HR. Bukhari). Siapa pun kamu, salammu sangat dihargai di sini.`,
            `*وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَATUH* 🌻\n\nDari Abu Darda', Rasulullah ﷺ bersabda: _"Perbanyaklah mengucapkan salam, karena ia akan menjadi saksi kebaikanmu di hari kiamat."_ Semoga setiap huruf salammu menjadi timbangan amal berat di yaumil akhir nanti.`,
            `*وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَATUH* 🌼\n\nWa'alaikumussalam! Rasulullah ﷺ bersabda bahwa orang yang bakhil (pelit) adalah orang yang pelit mengucapkan salam. Syukurlah kamu bukan orang pelit. Semoga rezekimu seluas kebaikanmu dalam menebar salam!`
        ]
        return m.reply(islam[Math.floor(Math.random() * islam.length)])
    }

    // 🚩 3. KRISTEN, HINDU, BUDDHA, KEBAJIKAN (Yapping Lengkap)
    if (/^(s[h]?y[a]?l[o]{1,2}m|salom|om[\s]?swast|namo[\s]?bud|rahayu|sampurasun|horas|wei[\s]?de|salam kebajikan)/i.test(budy)) {
        let other = `*Salam Sejahtera & Penuh Berkah!* ✨\n\n`
        if (budy.includes('syalom')) other = `*Shalom Aleichem (Damai Sejahtera Bagimu)* 🕊️\n> Semoga damai sejahtera Kristus yang melampaui segala akal memelihara hati dan pikiranmu. Sebagaimana tertulis dalam Yohanes 14:27, damai-Ku Kuberikan kepadamu. GBU!`
        if (budy.includes('swast')) other = `*Om Swastiastu* ☸️\n> Semoga pikiran baik datang dari segala penjuru. Semoga Ida Sang Hyang Widhi Wasa senantiasa melimpahkan waranugraha-Nya berupa kesehatan dan kedamaian hati. Shanti, Shanti, Shanti Om.`
        if (budy.includes('bud')) other = `*Namo Buddhaya* 🙏\n> Terpujilah Sang Buddha. Semoga semua makhluk hidup selamanya dalam kebahagiaan dan terbebas dari penderitaan. Sabbe Satta Bhavantu Sukhitatta. Sadhu, Sadhu, Sadhu.`
        if (budy.includes('rahayu')) other = `*Rahayu Sagung Dumadi!* 🙏\n> Semoga keselamatan, keberuntungan, dan kebahagiaan senantiasa menyertai semua makhluk di alam semesta ini. Salam damai dari lubuk hati yang terdalam.`
        if (budy.includes('wei') || budy.includes('kebajikan')) other = `*Wei De Dong Tian (Hanya Kebajikan Tuhan Berkenan)* ☯️\n> Salam Kebajikan! Semoga hidup kita selalu dipenuhi dengan moralitas dan integritas tinggi. Kesejahteraan menyertaimu!`
        
        return m.reply(other)
    }

    // 🚩 4. SALAM WAKTU (10 Yapping Motivation)
    if (/^(selamat\s?(pagi|siang|sore|malam|tidur)|pagi|siang|sore|malam)/i.test(budy)) {
        let timeRes = [
            "Semoga harimu penuh kejutan manis dan dijauhkan dari orang toxic kaya si 'P' tadi! 🚀",
            "Fokus pada tujuanmu, abaikan gangguan, dan buktikan lo bisa sukses! 💪",
            "Semoga rezeki mengalir deras buat lo dan keluarga hari ini! 💰",
            "Tetap positif! Pikiran yang sehat akan membawa hasil yang hebat. 😊",
            "Setiap hari adalah kesempatan baru buat memperbaiki kesalahan kemarin. Semangat! 🌅",
            "Semoga harimu asik dan dijauhkan dari segala drama gak penting! 🌸",
            "Lakukan yang terbaik, biar Tuhan yang urus sisanya. 🔥",
            "Nikmati prosesnya, jangan cuma kejar hasilnya. Have a great day! ✨",
            "Semoga harimu penuh tawa dan canda bareng orang tersayang! 😂",
            "Jangan lupa istirahat, kesehatanmu itu aset paling mahal. Tetap jaga kondisi! 💤"
        ]
        return m.reply(`*Halo!* ${timeRes[Math.floor(Math.random() * timeRes.length)]}`)
    }

    return true 
}

export default handler