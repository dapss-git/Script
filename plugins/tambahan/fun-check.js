let handler = async (m, { conn, text, command, usedPrefix }) => {
    // Validasi input nama/tag
    if (!text && !m.quoted) return m.reply(`Tag atau tulis nama seseorang!\nContoh: *${usedPrefix + command}* @user`)

    // Ambil nama target (dari teks, mention, atau reply)
    let target = text ? text : (m.quoted ? (m.quoted.pushName || m.quoted.sender.split('@')[0]) : text)
    
    // Generate angka random 1 - 100%
    const persen = Math.floor(Math.random() * 100) + 1
    
    // Judul biar rapi
    let title = command.toUpperCase()

    if (command === 'charactercheck') {
        const chara = ["Penyayang", "Pemurah", "Pemarah", "Pemaaf", "Penurut", "Baik Hati", "Simp", "Sabar", "UwU", "Keren", "Suka Menolong", "Savage"]
        const hasilChara = chara[Math.floor(Math.random() * chara.length)]
        
        m.reply(`*───〔 CHARACTER CHECK 〕───*

*Name:* ${target}
*Answer:* ${hasilChara} ✨`)

    } else {
        // Gabungan buat Handsome, Beautiful, Gay, Horny, dll
        let emoji = "✨"
        if (command.includes('gay') || command.includes('lesbi')) emoji = "🌈"
        if (command.includes('horny')) emoji = "🥵"
        
        let response = `*───〔 ${title} 〕───*

*Name:* ${target}
*Answer:* ${persen}% ${emoji}`
        
        // Kirim dengan mention jika target adalah user WA
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
        
        if (who) {
            await conn.sendMessage(m.chat, { text: response, mentions: [who] }, { quoted: m })
        } else {
            m.reply(response)
        }
    }
}

handler.help = ['handsomecheck', 'beautifulcheck', 'charactercheck', 'gaycheck', 'hornycheck']
handler.tags = ['fun']
handler.command = /^(handsomecheck|beautifulcheck|charactercheck|awesomecheck|greatcheck|gaycheck|cutecheck|lesbicheck|lesbiancheck|hornycheck|prettycheck|lovelycheck|uglycheck)$/i

export default handler
