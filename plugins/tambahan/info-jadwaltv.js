import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!text) return m.reply(`Mau cari jadwal TV apa, Bro? \n\nContoh: *${usedPrefix + command} rcti* atau *${usedPrefix + command} sctv*`)

    try {
        await m.react('📺')
        
        const apikey = 'cuki-x'
        const channel = text.toLowerCase().trim()
        const url = `https://api.cuki.biz.id/api/info/jadwaltv?apikey=${apikey}&channel=${channel}`

        // 2. Request ke API Cuki
        let { data: res } = await axios.get(url, {
            headers: { 'x-api-key': apikey }
        })

        if (!res.status || !res.data || res.data.length === 0) {
            return m.reply(`❌ Channel *${channel}* nggak ketemu atau lagi gangguan. Coba channel lain!`)
        }

        // 3. Susun Teks Jadwal
        let caption = `*───〔 JADWAL TV: ${channel.toUpperCase()} 〕───*\n\n`
        
        res.data.forEach((item) => {
            // Kita skip teks promosi web kalau ada di dalam data
            if (!item.acara.includes('JadwalTV.Net')) {
                caption += `🕒 *${item.jam}* - ${item.acara}\n`
            }
        })

        caption += `\n🤖 *By GPT Asistent Ai*\n📅 _Update: ${new Date().toLocaleDateString('id-ID')}_`

        // 4. Kirim ke Chat
        await conn.reply(m.chat, caption, m)
        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply(`❌ Aduh, GPT Asistent Ai gagal ambil jadwal. Pastikan nama channel bener ya!`)
    }
}

handler.help = ['jadwaltv <channel>']
handler.tags = ['info']
handler.command = /^(jadwaltv|jtv)$/i

export default handler
