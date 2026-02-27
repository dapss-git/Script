let handler = async (m, { conn, text, usedPrefix, command }) => {
    
    const guides = {
        'role': `\`Hierarki & Role Black Flag Brotherhood\`

\`1. Captain (Kapten)\`
*Deskripsi: Pemimpin tertinggi Black Flag Brotherhood.* *Mengatur strategi, membuat keputusan besar, dan menjadi simbol kehormatan.*
\`Tugas Rp:\` *Memimpin raid, menentukan misi, mengadakan rapat rahasia.*
\`Kemampuan Khusus Rp:\`
*Tactical Command: Member lain mendapat bonus aksi atau keputusan dalam Rp saat mengikuti perintah.*
\`Shadow Presence:\` *Bisa muncul tiba-tiba di tempat misi (Rp stealth appearance).*

\`2. Quartermaster (Panglima Logistik)\`
*Deskripsi: Penanggung jawab semua senjata, perlengkapan, dan loot. Tidak terlalu bertarung, tapi sangat penting.*
\`Tugas Rp:\` *Mengatur supply, membeli atau menjual loot, memberi perlengkapan khusus.*
\`Kemampuan Khusus Rp:\`
*Resource Allocation: Bisa memberikan bonus item atau perlengkapan tertentu kepada anggota.*
\`Black Market Access:\` *Bisa memperoleh item langka untuk misi.*

\`3. Bladebearer (Pembawa Belati)\`
*Deskripsi: Assassin dan petarung tangan pertama. Ahli belati, stealth, dan pembunuhan cepat.*
\`Tugas Rp:\` *Menyelinap, serangan mendadak, misi eliminasi.*
\`Kemampuan Khusus Rp:\`
*Shadow Strike: Serangan mendadak dalam Rp yang memberi efek dramatis.*
\`Soul Drain (Opsional):\` *Bisa “menyerap” energi atau kekuatan lawan dalam cerita.*

\`4. Gunner (Penembak)\`
*Deskripsi: Ahli senjata api. Menjadi kekuatan berat dalam pertempuran jarak jauh.*
\`Tugas Rp:\` *Mendukung tim dengan tembakan, pertahanan pos.*
\`Kemampuan Khusus Rp:\`
*Precision Shot: Menarget lawan dalam Rp dengan akurat, bisa menentukan efek dramatis.*
\`Cover Fire:\` *Member lain mendapat “bonus pertahanan” saat ditemani Gunner.*

\`5. Scout (Pengintai)\`
*Deskripsi: Mata-mata dan pengintai tim. Ahli penyamaran dan informasi.*
\`Tugas Rp:\` *Mengintai kota, mencari misi baru, memberi informasi strategis.*
\`Kemampuan Khusus Rp:\`
*Eagle Eye: Bisa “membocorkan” rahasia atau pergerakan musuh dalam Rp.*
\`Silent Movement:\` *Bisa melakukan aksi tanpa diketahui anggota lain atau musuh.*

\`6. Enforcer (Penegak)\`
*Deskripsi: Anggota kuat, penegak aturan internal, ahli tangan kosong.*
\`Tugas Rp:\` *Mengatur disiplin, menangani anggota nakal, memimpin pertarungan jarak dekat.*
\`Kemampuan Khusus Rp:\`
*Intimidate: Bisa membuat lawan atau anggota Rp merasa tertekan.*
\`Brawl Master:\` *Keahlian pertarungan tangan kosong.*

\`7. Novice / Initiate (Pemula)\`
*Deskripsi: Anggota baru yang sedang belajar aturan dan budaya Black Flag Brotherhood.*
\`Tugas Rp:\` *Mengikuti misi, belajar dari senior, mulai membangun reputasi.*
\`Kemampuan Khusus Rp:\`
*Learning Curve: Bisa “naik level” ke role lain setelah menyelesaikan misi atau Rp tertentu.*`,

        'ekonomi': `\`Sistem Uang (Ekonomi)\`

\`[Mata uang:]\`
*• Gold Coin (GC)*

\`[Cara dapat:]\`
*• Gaji fraksi (mingguan)*
*• Misi event*
*• Dagang*
*• Rampok di tempat (Blood Reef)*`,

        'kapal': `\`DAFTAR KAPAL & STAT\`

\`Tier I — Small Class\`
*1. Sloop*
_Harga: 500 GC_

*HP    : 100*
*ATK   : 15*
*DEF   : 10*
*SPD   : 20*
*Crew  : 5 orang*
*Cargo : 50 slot*

\`Tier II — Medium Class\`
*2. Brigantine*
_Harga: 1.200 GC_

*HP    : 200*
*ATK   : 30*
*DEF   : 20*
*SPD   : 15*
*Crew  : 10 orang*
*Cargo : 100 slot*

\`Tier III — Heavy Class\`
*3. Frigate*
_Harga: 2.500 GC_

*HP    : 300*
*ATK   : 50*
*DEF   : 35*
*SPD   : 10*
*Crew  : 20 orang*
*Cargo : 150 slot*

\`Tier IV — Legendary Class\`
*4. Galleon*
_Harga: 5.000 GC_

*HP    : 450*
*ATK   : 75*
*DEF   : 60*
*SPD   : 5*
*Crew  : 40 orang*
*Cargo : 250 slot*`,

        'battle': `\`SISTEM DAMAGE KAPAL\`

\`Saat perang:\`
*Damage = ATK penyerang - DEF target*

\`HP kapal habis:\`
*• Kapal tenggelam*
*• Crew injured*

\`Kapal bisa:\`
*• Diselamatkan (bayar 200 GC)*
*• Atau hancur permanen*

\`SISTEM UPGRADE KAPAL\`
*Setiap kapal bisa upgrade 3 kali.*

\`Upgrade Cannon (300 GC)\`
*• +10 ATK*

\`Upgrade Hull (300 GC)\`
*• +50 HP*

\`Upgrade Armor (300 GC)\`
*• +10 DEF*`,

        'buy': `\`SISTEM BELI KAPAL (FORMAT RP)\`

Player tulis di IC tempat/Lokasi (Port Blackwater):
[IC] contoh kalau mau beli kapal brigantine atau kapal apapun itu, penulissannya kayak gini. 
> Kapten Aiden mendatangi galangan kapal Port Blackwater dan menyerahkan 1.200 GC untuk membeli Brigantine.

Admin respon:
\`[SYSTEM]\` 
*"Kapal Brigantine berhasil dibeli.*
*UID BFB-001 kini memiliki Brigantine."*`,

        'chat': `\`TUTORIAL FORMAT CHAT BLACK FLAG\`

1. \`OOC (Out Of Character)\`
*Digunakan saat bicara sebagai diri sendiri (bukan peran).*
Format: \`(Ooc Teks kamu)\`
Contoh: \`(Ooc Ijin off dulu mau makan)\`

2. \`IC (In Character)\`
*Digunakan saat bicara atau beraksi sebagai peran RP.*
Format: Langsung atau pake tanda kutip.
Contoh: \`"Siapkan meriam, kita hancurkan kapal itu!"\`

3. \`ACTION (Aksi Peran)\`
*Digunakan untuk menjelaskan tindakan karakter kamu.*
Format: Pake tanda bintang atau garis samping.
Contoh: \`*Membuka peta dan menunjuk ke arah Blood Reef*\`

4. \`FORMATTING WHATSAPP\`

• \`Cetak Kotak (Monospace)\`
Gunakan backtick ( \` ) di awal dan akhir kalimat.
Contoh: \`Tulisan ini akan masuk kotak\`

• \`Quote (Garis Samping)\`
Gunakan tanda lebih besar ( > ) di awal kalimat.
Contoh:
> Ini pesan yang ada garis di sampingnya

• \`Cetak Tebal (Bold)\`
Gunakan bintang ( * ) di awal dan akhir.
Contoh: *TEKS TEBAL*`
    }

    if (!text) {
        return m.reply(`*— BLACK FLAG GUIDE BOOK —*

Ketik *${usedPrefix + command} [nama_kategori]* untuk membaca:

• *${usedPrefix + command} role*
• *${usedPrefix + command} ekonomi*
• *${usedPrefix + command} kapal*
• *${usedPrefix + command} battle*
• *${usedPrefix + command} buy*
• *${usedPrefix + command} chat*`)
    }

    let result = guides[text.toLowerCase()]
    if (!result) return m.reply(`Kategori tidak ditemukan. Pilih: role, ekonomi, kapal, battle, buy, atau chat.`)

    await m.reply(result)
}

handler.help = ['guide']
handler.tags = ['rpg']
handler.command = /^(guide|bfguide)$/i

export default handler
