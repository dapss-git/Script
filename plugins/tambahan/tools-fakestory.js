import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input dengan pemisah |
    let [user, caption, ppurl] = text.split('|')
    
    if (!user || !caption || !ppurl) return m.reply(`*───〔 🎨 FAKE STORY 〕───*

Format: *${usedPrefix + command} Username|Caption|Link_Foto*
💡 *Contoh:* ${usedPrefix + command} dafapratama|Halo dunia!|https://files.cloudkuimages.guru/images/df0ccdd344dd.jpg`)

    try {
        // 2. Susun API URL menggunakan data manual
        let apiUrl = `https://api.zenzxz.my.id/api/maker/fakestory?username=${encodeURIComponent(user.trim())}&caption=${encodeURIComponent(caption.trim())}&ppurl=${encodeURIComponent(ppurl.trim())}`

        // 3. Langsung kirim hasil gambar tanpa loading teks
        await conn.sendMessage(m.chat, { 
            image: { url: apiUrl }, 
            caption: `✅ *Fake Story Selesai*` 
        }, { quoted: m })

    } catch (e) {
        // Monitoring error untuk menjaga Uptime panel
        console.error("Fake Story Error:", e)
        m.reply("⚠️ Gagal memproses gambar. Pastikan link foto benar dan bisa diakses.")
    }
}

handler.help = ['fakestory']
handler.tags = ['tools']
handler.command = /^(fakestory|fs)$/i

export default handler
