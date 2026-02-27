import axios from 'axios'

let timeout = 60000 // Waktu jawab (1 menit)
let poin = 4999 // Hadiah poin kalau bener

let handler = async (m, { conn, usedPrefix }) => {
    conn.asahotak = conn.asahotak ? conn.asahotak : {}
    let id = m.chat
    if (id in conn.asahotak) return conn.reply(m.chat, 'Masih ada soal yang belum terjawab di grup ini!', conn.asahotak[id][0])

    try {
        let res = await axios.get('https://api.nexray.web.id/games/asahotak')
        let json = res.data

        if (!json.status) return m.reply('❌ Gagal mengambil soal dari server.')

        let caption = `
🧩 *ASAH OTAK* 🧩

*Soal:* ${json.result.soal}

⏱️ Waktu: ${(timeout / 1000)} detik
💰 Hadiah: ${poin} Poin
        `.trim()

        conn.asahotak[id] = [
            await conn.reply(m.chat, caption, m),
            json, poin,
            setTimeout(() => {
                if (conn.asahotak[id]) conn.reply(m.chat, `⌛ Waktu habis!\nJawabannya adalah: *${json.result.jawaban}*`, conn.asahotak[id][0])
                delete conn.asahotak[id]
            }, timeout)
        ]
    } catch (e) {
        console.error(e)
        m.reply('⚠️ Terjadi kesalahan saat memulai game.')
    }
}

handler.help = ['asahotak']
handler.tags = ['game']
handler.command = /^(asahotak)$/i
handler.group = true

export default handler
