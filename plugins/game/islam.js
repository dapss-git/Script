import axios from 'axios'

let timeout = 60000 
let poin = 2500 // Hadiah poin

let handler = async (m, { conn, usedPrefix }) => {
    conn.islamic = conn.islamic ? conn.islamic : {}
    let id = m.chat
    if (id in conn.islamic) return conn.reply(m.chat, 'Masih ada soal kuis yang belum terjawab!', conn.islamic[id][0])

    try {
        let res = await axios.get('https://api.nexray.web.id/games/islamic')
        let json = res.data

        if (!json.status) return m.reply('❌ API Error!')

        let caption = `
🕌 *KUIS ISLAMI* 🕌

*Soal:* ${json.result.soal}
*Bantuan:* ${json.result.hint}

⏱️ Waktu: ${(timeout / 1000)} detik
💰 Hadiah: ${poin} Poin

_Balas chat ini untuk menjawab!_
        `.trim()

        conn.islamic[id] = [
            await conn.reply(m.chat, caption, m),
            json, poin,
            setTimeout(() => {
                if (conn.islamic[id]) conn.reply(m.chat, `⌛ Waktu habis!\nJawabannya adalah: *${json.result.jawaban}*`, conn.islamic[id][0])
                delete conn.islamic[id]
            }, timeout)
        ]
    } catch (e) {
        m.reply('⚠️ Gagal mengambil soal.')
    }
}

handler.help = ['kuisislam']
handler.tags = ['game']
handler.command = /^(kuisislam|islamic)$/i
handler.group = true

export default handler
