import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Mau cari gambar apa Fa? Contoh:\n${usedPrefix + command} Bussid Jetbus 5`)
    
    await m.react('⏳')

    try {
        let res = await axios.get(`https://api.nexray.web.id/search/googleimage?q=${encodeURIComponent(text)}`)
        let json = res.data

        if (!json.status || !json.result.length) return m.reply('❌ Gambar tidak ditemukan, Fa.')

        // Ambil 5 gambar teratas
        let images = json.result.slice(0, 5)

        for (let i = 0; i < images.length; i++) {
            await conn.sendMessage(m.chat, { 
                image: { url: images[i].url }, 
                caption: `📸 Hasil ke-${i + 1} untuk: *${text}*` 
            }, { quoted: m })
            
            // Kasih jeda 1 detik tiap kirim biar gak kena spam
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply('⚠️ Waduh, API-nya lagi error atau limit, Fa. Coba lagi nanti ya!')
    }
}

handler.help = ['gimage']
handler.tags = ['search']
handler.command = /^(gimage|image|img)$/i

export default handler