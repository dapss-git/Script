import { getUIDData, saveUID } from '../../lib/uid_system.js'

let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isOwner }) => {
    let uidData = getUIDData()
    let index = uidData.findIndex(u => u.owner === m.sender)
    let userRecord = uidData[index]

    // --- PROTEKSI: WAJIB PUNYA UID ---
    if (!userRecord && command !== 'setstatus') {
        return m.reply(`⚠️ **ACCESS DENIED**\nBuat UID dulu! Ketik: *${usedPrefix}cuid [Nama]*`)
    }

    // --- 1. FITUR: .setstatus (ADMIN UPDATE) ---
    if (command === 'setstatus') {
        if (!isAdmin && !isOwner) return m.reply('🚫 Khusus Kapten/Panglima!')
        let [targetUID, bagian, isi] = text.split('|')
        if (!targetUID || !bagian || !isi) return m.reply(`*FORMAT ADMIN:*\n${usedPrefix + command} UID|BAGIAN|ISI`)

        let targetIdx = uidData.findIndex(u => u.uid === targetUID.trim())
        if (targetIdx === -1) return m.reply('❌ UID tidak ditemukan.')
        if (!uidData[targetIdx].card) return m.reply('❌ User belum punya kartu.')

        let oldCard = uidData[targetIdx].card
        let regex = new RegExp(`\\*${bagian.toUpperCase()}\\s+: .*`, 'g')
        
        if (!oldCard.match(regex)) return m.reply(`❌ Bagian *${bagian.toUpperCase()}* tidak ditemukan.`)

        let updatedCard = oldCard.replace(regex, `*${bagian.toUpperCase()}     :* ${isi.toUpperCase()}`)
        uidData[targetIdx].card = updatedCard
        saveUID(uidData)
        
        return m.reply(`✅ **DATABASE UPDATED**\n${bagian.toUpperCase()} milik *${uidData[targetIdx].nama}* diubah jadi: *${isi.toUpperCase()}*`)
    }

    // --- 2. FITUR: .mycard (LIHAT KARTU) ---
    if (command === 'mycard') {
        if (!userRecord.card) {
            return m.reply(`⚠️ **CARD NOT FOUND**\n\nIdentity Card kamu belum dibuat atau belum terdaftar di database admin. Silakan buat dengan ketik:\n*${usedPrefix}ccard CODE|FACTION|ROLE|SKILL|PASSIVE*`)
        }
        
        return await conn.sendButton(m.chat, {
            text: userRecord.card,
            footer: "Black Flag Classified Identity",
            buttons: [{
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "Salin Profil Lengkap",
                    copy_code: userRecord.card.replace(/`/g, ''),
                }),
            }]
        }, { quoted: m })
    }

    // --- 3. FITUR: .delcard (HAPUS KARTU) ---
    if (command === 'delcard') {
        if (!userRecord.card) return m.reply('Kamu emang belum punya kartu buat dihapus.')
        
        // Proteksi: Cek apakah yang hapus itu owner-nya atau Admin
        // (index sudah dicari di awal berdasarkan m.sender)
        delete uidData[index].card
        saveUID(uidData)
        
        return m.reply(`🗑️ **CARD DELETED**\nIdentity Card kamu telah dihapus dari database. Kamu bisa membuatnya ulang dengan ketik *${usedPrefix}ccard*.`)
    }

    // --- 4. FITUR: .ccard (BUAT KARTU) ---
    if (command === 'ccard') {
        let [codename, faction, role, skill, passive] = text.split('|')
        
        if (!codename || !faction || !role || !skill || !passive) {
            return m.reply(`*CARA PENGISIAN KARTU:*
Ketik: *${usedPrefix + command} CODENAME|FACTION|ROLE|SKILL|PASSIVE*

_Bounty otomatis di-set 2.000 (Default Member Baru)_`)
        }

        const genStat = () => Math.floor(Math.random() * 100) + 1
        const stats = { hp: 100, atk: genStat(), def: genStat(), spd: genStat() }
        const bar = (p) => "▰".repeat(Math.round(p/10)) + "▱".repeat(10 - Math.round(p/10))

        let caption = `\`███▓▒░   BLACK FLAG IDENTITY   ░▒▓███\`\n\n`
        caption += `\`[ IDENTITY RECORD ]\`\n`
        caption += `*━━━━━━━━━━━━━━━━━━━━━━*\n`
        caption += `*NAME      :* ${userRecord.nama}\n`
        caption += `*UID       :* \`${userRecord.uid}\`\n`
        caption += `*CODE NAME :* ${codename.toUpperCase()}\n`
        caption += `*FACTION   :* ${faction.toUpperCase()}\n`
        caption += `*ROLE      :* ${role.toUpperCase()}\n\n`
        
        caption += `\`[ COMBAT DATA ]\`\n`
        caption += `*━━━━━━━━━━━━━━━━━━━━━━*\n`
        caption += `*HP* *${bar(stats.hp)}* ${stats.hp}%\n`
        caption += `*ATK* *${bar(stats.atk)}* ${stats.atk}%\n`
        caption += `*DEF* *${bar(stats.def)}* ${stats.def}%\n`
        caption += `*SPD* *${bar(stats.spd)}* ${stats.spd}%\n\n`

        caption += `\`[ SPECIAL ]\`\n`
        caption += `*━━━━━━━━━━━━━━━━━━━━━━*\n`
        caption += `*SKILL     :* ${skill.toUpperCase()}\n`
        caption += `*PASSIVE   :* ${passive.toUpperCase()}\n`
        caption += `*BOUNTY    :* 2.000\n`
        caption += `*STATUS    :* ACTIVE\n\n`

        caption += `*"Freedom is earned in blood."*\n`
        caption += `*━━━━━━━━━━━━━━━━━━━━━━*`

        uidData[index].card = caption
        saveUID(uidData)

        await conn.sendButton(m.chat, {
            text: caption,
            footer: "Black Flag Identity Saved",
            buttons: [{
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "Copy My New Card",
                    copy_code: caption.replace(/`/g, ''),
                }),
            }]
        }, { quoted: m })
    }
}

handler.help = ['ccard', 'mycard', 'delcard', 'setstatus']
handler.tags = ['rpg']
handler.command = /^(ccard|mycard|delcard|setstatus)$/i
handler.group = true

export default handler
