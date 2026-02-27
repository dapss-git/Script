import axios from 'axios'

let timeout = 60000 
let poin = 3500 // Hadiah poin

let handler = async (m, { conn, usedPrefix }) => {
    conn.siapakahaku = conn.siapakahaku ? conn.siapakahaku : {}
    let id = m.chat
    if (id in conn.siapakahaku) return conn.reply(m.chat, 'Masih ada teka-teki yang belum terjawab di grup ini!', conn.siapakahaku[id][0])

    try {
        let res = await axios.get('https://api.nexray.web.id/games/siapakahaku')
        let json = res.data

        if (!json.status) return m.reply('❌ API Error!')

        let caption = `
🤔 *SIAPAKAH AKU?* 🤔

*Soal:* "${json.result.soal}"

⏱️ Waktu: ${(timeout / 1000)} detik
💰 Hadiah: ${poin} Poin

_Balas chat ini untuk menebak!_
        `.trim()

        conn.siapakahaku[id] = [
            await conn.reply(m.chat, caption, m),
            json, poin,
            setTimeout(() => {
                if (conn.siapakahaku[id]) conn.reply(m.chat, `⌛ Waktu habis!\nJawabannya adalah: *${json.result.jawaban}*`, conn.siapakahaku[id][0])
                delete conn.siapakahaku[id]
            }, timeout)
        ]
    } catch (e) {
        m.reply('⚠️ Gagal mengambil soal teka-teki.')
    }
}

handler.help = ['siapakahaku']
handler.tags = ['game']
handler.command = /^(siapakahaku|whoami)$/i
handler.group = true

export default handler
