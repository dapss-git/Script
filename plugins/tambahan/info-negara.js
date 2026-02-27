import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!text) return m.reply(`Mau cari info negara apa, Bro? \n\nContoh: *${usedPrefix + command} Indonesia* atau *${usedPrefix + command} Japan*`)

    try {
        await m.react('🌏')
        
        const apikey = 'cuki-x'
        const url = `https://api.cuki.biz.id/api/tools/infonegara?apikey=${apikey}&name=${encodeURIComponent(text)}`

        // 2. Request ke API Cuki
        let { data: res } = await axios.get(url, {
            headers: { 'x-api-key': apikey }
        })

        if (!res.status || !res.data) {
            return m.reply(`❌ Negara *${text}* nggak ketemu. Coba pake bahasa Inggris atau cek ejaannya!`)
        }

        const d = res.data

        // 3. Susun Teks Informasi Negara
        let caption = `*───〔 INFO NEGARA: ${d.name.toUpperCase()} 〕───*\n\n`
        caption += `🏛️ *Ibukota:* ${d.capital}\n`
        caption += `🌍 *Benua:* ${d.continent.name} ${d.continent.emoji}\n`
        caption += `💰 *Mata Uang:* ${d.currency}\n`
        caption += `📞 *Kode Telepon:* ${d.phoneCode}\n`
        caption += `🗣️ *Bahasa:* ${d.languages.native.join(', ')}\n`
        caption += `📏 *Luas Wilayah:* ${d.area.squareKilometers.toLocaleString()} km²\n`
        caption += `🚗 *Sisi Setir:* ${d.drivingSide === 'left' ? 'Kiri' : 'Kanan'}\n`
        caption += `🌐 *Domain Internet:* ${d.internetTLD}\n`
        caption += `📍 *Koordinat:* ${d.coordinates.latitude}, ${d.coordinates.longitude}\n`
        
        if (d.neighbors && d.neighbors.length > 0) {
            caption += `👥 *Tetangga:* ${d.neighbors.map(n => n.name).join(', ')}\n`
        }

        caption += `\n🤖 *GPT Asistent Ai*`

        // 4. Kirim Gambar Bendera + Caption Detail
        await conn.sendMessage(m.chat, { 
            image: { url: d.flag }, 
            caption: caption 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply(`❌ Aduh, GPT Asistent Ai gagal dapet data negaranya. Coba lagi nanti ya!`)
    }
}

handler.help = ['negara <nama negara>', 'infonegara']
handler.tags = ['info']
handler.command = /^(negara|infonegara)$/i

export default handler
