let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
    // 1. Ambil semua JID anggota grup untuk di-tag
    let users = participants.map(u => u.id)
    
    // 2. Tentukan target pesan (pesan yang di-reply atau pesan itu sendiri)
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    // 3. VALIDASI: Jika tidak ada teks DAN tidak ada media yang di-reply
    if (!text && !m.quoted) {
        return m.reply(`*⚠️ Input Kosong!*\n\nSilahkan reply media (stiker/foto/video) atau ketik teks setelah perintah.\n\nContoh:\n*${usedPrefix + command} Halo semuanya* atau reply stiker dengan *${usedPrefix + command}*`)
    }

    try {
        if (/sticker/.test(mime)) {
            // --- LOGIKA STIKER ---
            let media = await q.download()
            if (!media) return m.reply("❌ Gagal mendownload stiker!")
            
            await conn.sendMessage(m.chat, { 
                sticker: media, 
                mentions: users 
            }, { quoted: m })

        } else if (/image|video|audio|document/.test(mime)) {
            // --- LOGIKA MEDIA LAIN (Foto, Video, dll) ---
            let media = await q.download()
            if (!media) return m.reply("❌ Gagal mendownload media!")
            
            await conn.sendMessage(m.chat, { 
                [mime.split('/')[0]]: media, 
                caption: text || q.text || '', 
                mentions: users,
                mimetype: mime 
            }, { quoted: m })

        } else {
            // --- LOGIKA TEKS BIASA ---
            await conn.sendMessage(m.chat, { 
                text: text || q.text || '', 
                mentions: users 
            }, { quoted: m })
        }
    } catch (e) {
        console.error(e)
        m.reply("❌ Terjadi kesalahan saat memproses totag.")
    }
}

handler.help = ['totag']
handler.tags = ['group']
handler.command = /^(totag)$/i
handler.group = true
handler.admin = true 

export default handler
