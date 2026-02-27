import { getUIDData, saveUID } from '../../lib/uid_system.js'

let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isOwner }) => {
    let uidData = getUIDData()
    let userRecord = uidData.find(u => u.owner === m.sender)

    // --- FITUR: .myuid ---
    if (command === 'myuid') {
        if (!userRecord) {
            return m.reply(`⚠️ **KAMU BELUM TERDAFTAR**\n\nKamu belum memiliki UID di database Black Flag. Silakan buat dulu ya.\n\nKetik: *${usedPrefix}cuid [NamaKamu]*`)
        }

        let myCaption = `🆔 **YOUR IDENTITY UID**\n\n👤 *Nama:* ${userRecord.nama}\n🆔 *UID:* \`${userRecord.uid}\`\n📅 *Terdaftar:* ${userRecord.date || 'Lama'}\n\n_Klik tombol di bawah untuk menyalin UID kamu._`

        const myButtons = [{
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
                display_text: "Salin UID Saya",
                copy_code: userRecord.uid,
            }),
        }]

        return await conn.sendButton(m.chat, {
            text: myCaption,
            footer: "Black Flag Identity System",
            buttons: myButtons
        }, { quoted: m })
    }

    // --- FITUR: .createuid / .cuid ---
    if (command === 'createuid' || command === 'cuid') {
        if (!text) return m.reply(`Masukan Nama!\nContoh: *${usedPrefix + command} DAFA*`)
        
        if (userRecord) {
            let rejectCaption = `🚫 **AKSES DITOLAK**\n\nSatu nomor cuma boleh punya satu identitas! Kamu sudah terdaftar sebelumnya dengan data berikut:\n\n👤 *Nama:* ${userRecord.nama}\n🆔 *UID:* \`${userRecord.uid}\`\n\n_Klik tombol di bawah untuk menyalin UID kamu._`
            
            const rejectButtons = [{
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "Salin UID Lama Kamu",
                    copy_code: userRecord.uid,
                }),
            }]

            return await conn.sendButton(m.chat, {
                text: rejectCaption,
                footer: "Black Flag Identity System",
                buttons: rejectButtons
            }, { quoted: m })
        }

        const genID = () => Math.floor(1000 + Math.random() * 9000) + '-' + Math.random().toString(36).substring(2, 5).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900)
        const newUID = genID()

        uidData.push({
            nama: text.trim().toUpperCase(),
            uid: newUID,
            owner: m.sender,
            date: new Date().toLocaleDateString('id-ID')
        })
        saveUID(uidData)

        let successCaption = `💾 **UID TERDAFTAR**\n\n👤 *Nama:* ${text.toUpperCase()}\n🆔 *UID:* \`${newUID}\`\n\n_ID ini resmi terikat ke nomor kamu. Klik tombol di bawah untuk menyalin._`

        const successButtons = [{
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
                display_text: "Salin UID Baru",
                copy_code: newUID,
            }),
        }]

        await conn.sendButton(m.chat, {
            text: successCaption,
            footer: "Black Flag Identity",
            buttons: successButtons
        }, { quoted: m })
    }

    if (command === 'deluid') {
        if (!text) return m.reply('Mana UID yang mau dihapus?')
        let index = uidData.findIndex(u => u.uid === text.trim())
        
        if (index === -1) return m.reply('❌ UID tidak ditemukan di database.')

        if (uidData[index].owner !== m.sender && !isAdmin && !isOwner) {
            return m.reply('🚫 Kamu bukan pemilik UID ini! Hanya pembuatnya atau Admin yang bisa menghapus.')
        }

        let deleted = uidData.splice(index, 1)
        saveUID(uidData)
        m.reply(`🗑️ **BERHASIL DIHAPUS**\nIdentitas *${deleted[0].nama}* telah dihapus. Kamu sekarang bisa membuat UID baru.`)
    }

    if (command === 'listuid') {
        if (uidData.length === 0) return m.reply('Database masih kosong.')
        
        let txt = `📑 **CLASSIFIED UID LIST**\n`
        txt += `Total Operative: ${uidData.length}\n`
        txt += `━━━━━━━━━━━━━━━━━━━━━━\n\n`

        uidData.forEach((u, i) => {
            let phone = u.owner.split('@')[0]
            // Cek apakah ada data 'card' di objek user tersebut
            let statusCard = u.card ? '✅ Sudah Buat' : '❌ Belum Buat'
            
            txt += `${i + 1}. *${u.nama}*\n   🆔: \`${u.uid}\`\n   📱: @${phone}\n   🃏: *Card:* ${statusCard}\n\n`
        })

        txt += `━━━━━━━━━━━━━━━━━━━━━━\n`
        txt += `_RAHASIA NEGARA - BLACK FLAG_`

        await conn.sendMessage(m.chat, { 
            text: txt, 
            mentions: uidData.map(u => u.owner) 
        }, { quoted: m })
    }
}

handler.help = ['cuid', 'createuid', 'deluid', 'listuid', 'myuid']
handler.tags = ['rpg']
handler.command = /^(cuid|createuid|deluid|listuid|myuid)$/i
handler.group = true

export default handler
