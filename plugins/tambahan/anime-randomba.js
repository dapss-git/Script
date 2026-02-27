import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // 1. Kasih reaksi biar user tau bot lagi proses
        await m.react('🎨')

        const apikey = 'cuki-x'
        const url = `https://api.cuki.biz.id/api/random/bluearchive?apikey=${apikey}`

        // 2. Request ke API Cuki
        // Karena API random image biasanya langsung ngirim file gambar (buffer) atau redirect ke URL gambar
        const response = await axios.get(url, {
            headers: { 'x-api-key': apikey },
            responseType: 'arraybuffer'
        })

        if (!response.data) throw 'Gagal mendapatkan gambar.'

        const buffer = Buffer.from(response.data, 'binary')

        // 3. Kirim ke Chat
        await conn.sendMessage(m.chat, { 
            image: buffer, 
            caption: `Nih, karakter *Blue Archive* buat lo! ✨` 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply(`❌ Aduh, GPT Asistent Ai gagal ambil gambar. API-nya mungkin lagi istirahat, coba lagi nanti ya!`)
    }
}

handler.help = ['bluearchive', 'ba']
handler.tags = ['anime']
handler.command = /^(bluearchive|ba)$/i

export default handler