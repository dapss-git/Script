import axios from 'axios'

let timeout = 60000 
let poin = 3500 // Hadiah poin

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebaklirik = conn.tebaklirik ? conn.tebaklirik : {}
    let id = m.chat
    if (id in conn.tebaklirik) return conn.reply(m.chat, 'Masih ada soal lirik yang belum terjawab di sini!', conn.tebaklirik[id][0])

    try {
        let res = await axios.get('https://api.nexray.web.id/games/tebaklirik')
        let json = res.data

        if (!json.status) return m.reply('❌ API Error!')

        let caption = `
🎤 *TEBAK LIRIK LAGU* 🎤

" ${json.result.soal} "

*Pertanyaan:* Lanjutkan potongan lirik di atas!

⏱️ Waktu: ${(timeout / 1000)} detik
💰 Hadiah: ${poin} Poin

_Balas chat ini untuk menjawab!_
        `.trim()

        conn.tebaklirik[id] = [
            await conn.reply(m.chat, caption, m),
            json, poin,
            setTimeout(() => {
                if (conn.tebaklirik[id]) conn.reply(m.chat, `⌛ Waktu habis!\nLirik yang benar adalah: *${json.result.jawaban}*`, conn.tebaklirik[id][0])
                delete conn.tebaklirik[id]
            }, timeout)
        ]
    } catch (e) {
        m.reply('⚠️ Gagal mengambil soal tebak lirik.')
    }
}

handler.help = ['tebaklirik']
handler.tags = ['game']
handler.command = /^(tebaklirik|lirik)$/i
handler.group = true

export default handler
