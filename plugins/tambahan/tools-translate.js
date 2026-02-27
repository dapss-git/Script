import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Logika penentuan Target Bahasa dan Teks
    // Format: .tr id hello world (target id, teks hello world)
    // Atau reply chat: .tr id (target id, teks diambil dari chat yang di-reply)
    
    let lang = text.split(' ')[0]
    let input = text.replace(lang, '').trim()
    
    // Jika sedang me-reply chat, ambil teks dari chat tersebut
    if (m.quoted && m.quoted.text) {
        input = m.quoted.text
        if (!lang) lang = 'id' // Default ke Indonesia kalau cuma ketik .tr sambil reply
    }

    if (!lang || !input) return m.reply(`Format salah! ⚠️\n\nContoh: *${usedPrefix + command} id hello world*\nAtau reply chat: *${usedPrefix + command} id*`)

    try {
        await m.react('⏳')
        
        const apikey = 'cuki-x'
        const url = `https://api.cuki.biz.id/api/tools/translate?apikey=${apikey}&text=${encodeURIComponent(input)}&source=auto&target=${lang}`

        // 2. Request ke API Cuki
        let { data: res } = await axios.get(url, {
            headers: { 'x-api-key': apikey }
        })

        if (!res.status || !res.data) {
            return m.reply(`❌ Gagal menerjemahkan. Pastikan kode bahasa bener (id, en, ja, ko, dll).`)
        }

        // 3. Susun Teks Hasil
        let caption = `*───〔 TRANSLATE 〕───*\n\n`
        caption += `📝 *Asal (${res.data.sourceLanguage.name}):* \n_${res.data.originalText}_\n\n`
        caption += `🎯 *Hasil (${res.data.targetLanguage.name}):* \n*${res.data.translatedText}*\n\n`
        caption += `🤖 *GPT Asistent Ai*`

        // 4. Kirim ke Chat
        await conn.reply(m.chat, caption, m)
        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply(`❌ Aduh, GPT Asistent Ai lagi pusing translate-nya. Coba lagi nanti ya!`)
    }
}

handler.help = ['translate <lang> <text>']
handler.tags = ['tools']
handler.command = /^(tr|translate)$/i

export default handler
