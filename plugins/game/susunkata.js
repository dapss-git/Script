import axios from 'axios'

let timeout = 60000 
let poin = 4000 // Hadiah poin lumayan gede nih

let handler = async (m, { conn, usedPrefix }) => {
    conn.susunkata = conn.susunkata ? conn.susunkata : {}
    let id = m.chat
    if (id in conn.susunkata) return conn.reply(m.chat, 'Masih ada kata yang belum disusun di grup ini!', conn.susunkata[id][0])

    try {
        let res = await axios.get('https://api.nexray.web.id/games/susunkata')
        let json = res.data

        if (!json.status) return m.reply('❌ API Error!')

        let caption = `
🔠 *SUSUN KATA* 🔠

*Acak:* ${json.result.soal}
*Tipe:* ${json.result.tipe}

⏱️ Waktu: ${(timeout / 1000)} detik
💰 Hadiah: ${poin} Poin

_Balas chat ini untuk menyusun kata!_
        `.trim()

        conn.susunkata[id] = [
            await conn.reply(m.chat, caption, m),
            json, poin,
            setTimeout(() => {
                if (conn.susunkata[id]) conn.reply(m.chat, `⌛ Waktu habis!\nJawabannya adalah: *${json.result.jawaban}*`, conn.susunkata[id][0])
                delete conn.susunkata[id]
            }, timeout)
        ]
    } catch (e) {
        m.reply('⚠️ Gagal mengambil soal susun kata.')
    }
}

handler.help = ['susunkata']
handler.tags = ['game']
handler.command = /^(susunkata|skata)$/i
handler.group = true

export default handler
