let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('❌ Fitur ini hanya bisa digunakan di dalam grup!')

    try {
        let name = await conn.getName(m.chat)
        let caption = `〆 ━━━[ GROUP ID ]━━━〆\n`
        caption += `々 Name: ${name}\n`
        caption += `々 ID: ${m.chat}\n`
        caption += `〆 ━━━━━━━━━━━━━━━〆`

        const buttons = [{
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
                display_text: "📋 Copy ID Group",
                copy_code: m.chat,
            }),
        }]

        await conn.sendButton(m.chat, {
            text: caption,
            buttons
        }, { quoted: m })

    } catch (e) {
        m.reply("❌ Error saat mengambil ID Group");
        console.error(e);
    }
}

handler.help = ["getidgc", "idgc"]
handler.command = /^(getidgc|idgc)$/i
handler.tags = ["group"]
handler.group = true

export default handler
