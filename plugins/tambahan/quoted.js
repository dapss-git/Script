// 🔥® Rin-Okumura™ 🔥
// 👿 Creator: Dafa & Gemini
// ⚡ Plugin: quoted.js (Fixed Version)

let handler = async (m, { conn }) => {
    // 1. Cek apakah ada pesan yang di-reply
    if (!m.quoted) return m.reply('Reply pesan yang ada quoted-nya (balasan pesan yang sudah dihapus)')

    try {
        // 2. Ambil objek pesan mentah dari quoted
        let q = await m.getQuotedObj()
        
        // 3. Ambil isi pesan asli yang ada di dalam quoted (ini kuncinya)
        let mime = (q.msg || q).mimetype || ''
        let messageContent = q.message.extendedTextMessage?.contextInfo?.quotedMessage || q.message
        
        if (!messageContent) return m.reply('❌ Gagal mengekstrak pesan asli yang dihapus.')

        await m.reply('_Sedang membongkar pesan asli..._')

        // 4. Kirim ulang isi pesan yang ada di dalam quoted tersebut
        await conn.copyNForward(m.chat, { key: q.key, message: messageContent }, true)

    } catch (e) {
        console.error(e)
        m.reply('❌ Waduh, filenya udah nggak ada di server WhatsApp atau database bot udah kehapus.')
    }
}

handler.help = ['q']
handler.tags = ['tools']
handler.command = /^q$/i

export default handler
