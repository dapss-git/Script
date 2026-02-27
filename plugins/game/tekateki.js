import axios from 'axios'

let timeout = 60000 
let poin = 3000 // Hadiah poin

let handler = async (m, { conn, usedPrefix }) => {
    conn.tekateki = conn.tekateki ? conn.tekateki : {}
    let id = m.chat
    if (id in conn.tekateki) return conn.reply(m.chat, 'Masih ada teka-teki yang belum terjawab di sini!', conn.tekateki[id][0])

    try {
        let res = await axios.get('https://api.nexray.web.id/games/tekateki')
        let json = res.data

        if (!json.status) return m.reply('❌ API Error!')

        let caption = `
🤣 *TEKA-TEKI LUCU* 🤣

*Soal:* "${json.result.soal}"

⏱️ Waktu: ${(timeout / 1000)} detik
💰 Hadiah: ${poin} Poin

_Balas chat ini untuk menebak!_
        `.trim()

        conn.tekateki[id] = [
            await conn.reply(m.chat, caption, m),
            json, poin,
            setTimeout(() => {
                if (conn.tekateki[id]) conn.reply(m.chat, `⌛ Waktu habis!\nJawabannya adalah: *${json.result.jawaban}*`, conn.tekateki[id][0])
                delete conn.tekateki[id]
            }, timeout)
        ]
    } catch (e) {
        m.reply('⚠️ Gagal mengambil soal teka-teki.')
    }
}

handler.help = ['tekateki']
handler.tags = ['game']
handler.command = /^(tekateki|tt)$/i
handler.group = true

export default handler
