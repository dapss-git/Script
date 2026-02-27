let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (/image/.test(mime)) {
        try {
            await m.react('⏳')
            let media = await q.download()
            
            // Proses update foto profil Bot
            await conn.updateProfilePicture(conn.user.jid, media)
            
            await m.react('✅')
            m.reply('🚀 *Berhasil!* Foto profil bot sekarang udah ganti, Fa.')
        } catch (e) {
            console.error(e)
            m.reply('❌ Gagal ganti foto profil bot. Coba foto lain yang ukurannya nggak terlalu gede.')
        }
    } else {
        m.reply(`💡 *Cara Pakai:* \n〉Reply foto dengan caption *${usedPrefix + command}*`)
    }
}

handler.help = ['setppbot']
handler.tags = ['owner']
handler.command = /^(setppbot|setpp)$/i
handler.owner = true // KHUSUS DAFA (OWNER)

export default handler
