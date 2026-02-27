import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!text) return m.reply(`✨ *Contoh:* ${usedPrefix + command} Nama|Kelas|Isi Tulisan`)

    // Pisahkan teks menggunakan tanda |
    let [nama, kelas, isi] = text.split('|')
    
    // Jika tidak lengkap, kasih peringatan
    if (!nama || !kelas || !isi) return m.reply(`⚠️ Format salah! Gunakan:\n*${usedPrefix + command} Nama|Kelas|Teks Panjang*`)

    try {
        await m.react('✍️')

        // 2. Tembak ke API Apocalypse
        // Format: https://api.apocalypse.web.id/canvas/nulis?nama=...&kelas=...&text=...
        const resultUrl = `https://api.apocalypse.web.id/canvas/nulis?nama=${encodeURIComponent(nama)}&kelas=${encodeURIComponent(kelas)}&text=${encodeURIComponent(isi)}`

        // 3. Kirim Hasil
        await conn.sendMessage(m.chat, { 
            image: { url: resultUrl }, 
            caption: `✅ *Berhasil!* Tulisan buat *${nama}* kelas *${kelas}* sudah jadi.` 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply(`❌ Gagal membuat tulisan. Pastikan API Apocalypse sedang online!`)
    }
}

handler.help = ['nulis <nama|kelas|teks>']
handler.tags = ['canvas']
handler.command = /^(nulis|tulis)$/i

export default handler
