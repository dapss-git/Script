import userStats from '../../lib/userstat.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    const chatId = m.chat
    
    // Tarik Nama Grup secara realtime
    const groupMetadata = await conn.groupMetadata(chatId).catch(e => ({}))
    const groupName = groupMetadata.subject || 'Grup Ini'

    if (!userStats[chatId]) return m.reply('❌ Belum ada data chat yang terekam di grup ini.')

    let sortedUsers = Object.entries(userStats[chatId])
        .sort((a, b) => b[1] - a[1]) 
        .slice(0, 10) 

    let txt = `🏆 *TOP 10 USER BERISIK*\n`
    txt += `📍 Grup: ${groupName}\n`
    txt += `━━━━━━━━━━━━━━━━━━━━\n\n`

    let mentions = []
    sortedUsers.forEach((user, i) => {
        let jid = user[0]
        let count = user[1]
        mentions.push(jid)
        txt += `${i + 1}. @${jid.split('@')[0]}\n`
        txt += `   └ 💬 *${count}* pesan\n\n`
    })

    txt += `━━━━━━━━━━━━━━━━━━━━\n`
    txt += `_Data dihitung sejak bot masuk grup._`

    await conn.sendMessage(chatId, { text: txt, mentions: mentions }, { quoted: m })
}

handler.help = ['topuser', 'rank']
handler.tags = ['group']
handler.command = /^(topuser|rank|berisik)$/i
handler.group = true

export default handler
