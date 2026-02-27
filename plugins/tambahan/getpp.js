// 🔥® Rin-Okumura™ 🔥
// 👿 Creator: Dxyz & Gemini
// ⚡ Plugin: getpp.mjs

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let who
    
    // 1. Logika Deteksi Target
    if (m.isGroup) {
        // Jika ada mention
        if (m.mentionedJid[0]) {
            who = m.mentionedJid[0]
        } 
        // Jika reply pesan
        else if (m.quoted) {
            who = m.quoted.sender
        }
    } else {
        who = m.chat
    }

    // 2. Logika Deteksi Nomor Manual (08/62/pake spasi)
    if (!who && args[0]) {
        let number = args[0].replace(/[^0-9]/g, '') // Buang spasi/karakter aneh
        if (number.startsWith('0')) {
            number = '62' + number.slice(1) // Ubah 08xxx jadi 628xxx
        }
        who = number + '@s.whatsapp.net'
    }

    if (!who) return m.reply(`✉️ *Target mana?*\nTag orangnya, reply pesannya, atau ketik nomornya.\nContoh: *${usedPrefix + command} 0812xxxx*`)

    try {
        // Ambil URL Foto Profil (High Res)
        let pp = await conn.profilePictureUrl(who, 'image').catch(_ => null)
        
        if (!pp) {
            return m.reply('❌ *Profil Terkunci*\nUser tersebut tidak memasang foto profil atau membatasi privasinya.')
        }

        await conn.sendMessage(m.chat, { 
            image: { url: pp }, 
            caption: `📸 *Profile Picture* dari @${who.split('@')[0]}`,
            mentions: [who]
        }, { quoted: m })

    } catch (e) {
        m.reply('❌ Terjadi kesalahan saat mengambil foto profil.')
    }
}

handler.help = ['getpp']
handler.tags = ['tools']
handler.command = /^(getpp|getprofile)$/i

export default handler
