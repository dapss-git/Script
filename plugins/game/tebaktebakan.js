import axios from 'axios'

let timeout = 60000 
let poin = 3200 // Hadiah poin

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebaktebakan = conn.tebaktebakan ? conn.tebaktebakan : {}
    let id = m.chat
    if (id in conn.tebaktebakan) return conn.reply(m.chat, 'Masih ada tebak-tebakan yang belum terjawab di sini!', conn.tebaktebakan[id][0])

    try {
        let res = await axios.get('https://api.nexray.web.id/games/tebaktebakan')
        let json = res.data

        if (!json.status) return m.reply('❌ API Error!')

        let caption = `
😆 *TEBAK-TEBAKAN RECEH* 😆

*Soal:* "${json.result.soal}"

⏱️ Waktu: ${(timeout / 1000)} detik
💰 Hadiah: ${poin} Poin

_Balas chat ini untuk menjawab!_
        `.trim()

        conn.tebaktebakan[id] = [
            await conn.reply(m.chat, caption, m),
            json, poin,
            setTimeout(() => {
                if (conn.tebaktebakan[id]) conn.reply(m.chat, `⌛ Waktu habis!\nJawabannya: *${json.result.jawaban}*`, conn.tebaktebakan[id][0])
                delete conn.tebaktebakan[id]
            }, timeout)
        ]
    } catch (e) {
        m.reply('⚠️ Gagal mengambil soal tebak-tebakan.')
    }
}

handler.help = ['tebaktebakan']
handler.tags = ['game']
handler.command = /^(tebaktebakan|tebak)$/i
handler.group = true

export default handler
