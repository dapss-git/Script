let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin }) => {
    // Proteksi: Hanya Kapten/Panglima yang bisa sebar info
    if (!isAdmin && !isOwner) return m.reply('🚫 Fitur ini khusus Kapten atau Panglima!')

    // ID Grup Tujuan (Grup Pengumuman Dafa)
    const idPengumuman = '120363406388421233@g.us'

    if (!text) return m.reply(`*CARA PENGGUNAAN:*

1. *Teks Biasa:*
${usedPrefix + command} Pesan kamu

2. *Teks + Mention All:*
${usedPrefix + command} Pesan kamu|mention

3. *Button (Link/Copy):*
${usedPrefix + command} Judul|Nama Tombol|url|link_nya
${usedPrefix + command} Judul|Nama Tombol|copy|teks_nya`)

    let parts = text.split('|')

    // --- LOGIKA 1 & 2: TEKS BIASA ATAU MENTION ---
    if (parts.length === 1 || (parts.length === 2 && parts[1].trim().toLowerCase() === 'mention')) {
        let pesan = parts[0].trim()
        let options = {}

        if (parts[1] && parts[1].trim().toLowerCase() === 'mention') {
            // Ambil semua JID member grup tujuan untuk mention
            let groupMetadata = await conn.groupMetadata(idPengumuman)
            let participants = groupMetadata.participants.map(u => u.id)
            pesan += '\n\n@everyone' // Tambahan teks pemanis
            options.mentions = participants
        }

        await conn.sendMessage(idPengumuman, { text: pesan, ...options })
        return m.reply(`✅ Pengumuman teks berhasil dikirim ke Grup Pusat.`)
    }

    // --- LOGIKA 3: BUTTON (URL/COPY) ---
    if (parts.length >= 4) {
        let [caption, btnText, type, content] = parts

        let button = []
        if (type.trim().toLowerCase() === 'url' || type.trim().toLowerCase() === 'link') {
            button.push({
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: btnText.trim(),
                    url: content.trim()
                })
            })
        } else if (type.trim().toLowerCase() === 'copy') {
            button.push({
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                    display_text: btnText.trim(),
                    copy_code: content.trim()
                })
            })
        } else {
            return m.reply('❌ Tipe button tidak valid! Gunakan "url" atau "copy".')
        }

        await conn.sendButton(idPengumuman, {
            text: caption.trim(),
            footer: "Black Flag Brotherhood",
            buttons: button,
            hasMediaAttachment: false
        })

        return m.reply(`✅ Pengumuman button berhasil dikirim ke Grup Pusat.`)
    } else {
        return m.reply('❌ Format salah! Jika ingin buat button, pastikan ada 4 bagian dipisah dengan ( | ).')
    }
}

handler.help = ['buatpengumuman', 'ann']
handler.tags = ['rpg']
handler.command = /^(buatpengumuman|ann|announcement|pengumuman)$/i
handler.group = true

export default handler
