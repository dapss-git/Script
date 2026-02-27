let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // Mengambil kode link grup
        let code = await conn.groupInviteCode(m.chat)
        let groupMetadata = await conn.groupMetadata(m.chat)
        let link = 'https://chat.whatsapp.com/' + code

        // Teks Unik tanpa tag/JID yang mengganggu
        let caption = `
*───〔 GROUP LINK 〕───*

*Nama Grup:* ${groupMetadata.subject}

*Tautan Undangan:*
${link}

*───〔 INFO 〕───*
_Gunakan link ini untuk mengundang teman masuk ke grup. Jangan sembarang sebar agar grup tetap aman!_
`.trim()

        // Mengirim pesan murni teks tanpa mention
        await conn.reply(m.chat, caption, m)

    } catch (e) {
        console.error(e)
        m.reply(`❌ *Gagal!* Pastikan bot sudah jadi Admin agar bisa ambil link.`)
    }
}

handler.help = ['getlink']
handler.tags = ['group']
handler.command = /^(getlink|linkgc|link)$/i
handler.group = true
handler.botAdmin = true

export default handler
