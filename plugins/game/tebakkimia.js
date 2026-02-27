import axios from 'axios'

let timeout = 60000 
let poin = 4500 // Hadiah poin Kimia

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakkimia = conn.tebakkimia ? conn.tebakkimia : {}
    let id = m.chat
    if (id in conn.tebakkimia) return conn.reply(m.chat, 'Masih ada soal unsur yang belum terjawab!', conn.tebakkimia[id][0])

    try {
        let res = await axios.get('https://api.nexray.web.id/games/tebakkimia')
        let json = res.data

        if (!json.status) return m.reply('❌ API Error!')

        let caption = `
🧪 *TEBAK KIMIA* 🧪

*Unsur:* ${json.result.unsur}
*Pertanyaan:* Apa lambang dari unsur di atas?

⏱️ Waktu: ${(timeout / 1000)} detik
💰 Hadiah: ${poin} Poin

_Balas chat ini untuk menjawab!_
        `.trim()

        conn.tebakkimia[id] = [
            await conn.reply(m.chat, caption, m),
            json, poin,
            setTimeout(() => {
                if (conn.tebakkimia[id]) conn.reply(m.chat, `⌛ Waktu habis!\nLambang unsur *${json.result.unsur}* adalah: *${json.result.lambang}*`, conn.tebakkimia[id][0])
                delete conn.tebakkimia[id]
            }, timeout)
        ]
    } catch (e) {
        m.reply('⚠️ Gagal mengambil soal kimia.')
    }
}

handler.help = ['tebakkimia']
handler.tags = ['game']
handler.command = /^(tebakkimia|kimia)$/i
handler.group = true

export default handler
