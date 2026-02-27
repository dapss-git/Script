let handler = async (m, { conn, participants, groupMetadata }) => {
    // 1. Ambil data owner grup & semua admin
    const groupAdmins = participants.filter(p => p.admin)
    const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n')
    const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-` [0] + '@s.whatsapp.net'

    // 2. Susun tampilan pesan
    let text = `*╔═══━━━━━━━ 🛡️ ━━━━━━━═══╗*\n`
    text += `*║       LIST ADMIN GRUP* \n`
    text += `*╚═══━━━━━━━ 🛡️ ━━━━━━━═══╝*\n\n`
    
    text += `*👑 RAJANYA GRUP (OWNER):*\n`
    text += `〉 @${owner.split('@')[0]}\n\n`
    
    text += `*👮 DAFTAR ADMIN:* \n`
    text += `${listAdmin}\n\n`
    
    text += `_Total Admin: ${groupAdmins.length}_`

    // 3. Kirim pesan dengan fitur mention (tag otomatis)
    conn.sendMessage(m.chat, {
        text: text,
        mentions: [...groupAdmins.map(v => v.id), owner]
    }, { quoted: m })
}

handler.help = ['listadmin']
handler.tags = ['group']
handler.command = /^(admin|listadmin|admins)$/i
handler.group = true // Hanya bisa di dalam grup

export default handler
