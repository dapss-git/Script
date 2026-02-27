// 🔥® Rin-Okumura™ 🔥
// 👿 Creator: Dafa & Gemini
// ⚡ Plugin: group-request.mjs

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Ambil list permintaan join
    let requestList = await conn.groupRequestParticipantsList(m.chat)
    
    if (!requestList || requestList.length === 0) {
        return m.reply('✨ *KOSONG* ✨\n\n_Gak ada calon member yang nunggu di antrean._')
    }

    // --- FITUR LIST ---
    if (command === 'listacc') {
        let teks = `╔══ 🎉 *DAFTAR REQUEST* 🎉 ══╗\n║\n`
        teks += `║ 👥 *Total:* ${requestList.length} orang\n`
        teks += `╟───────────────────\n`
        requestList.forEach((v, i) => {
            teks += `║ ${i + 1}. @${v.jid.split('@')[0]}\n`
        })
        teks += `║\n╟───────────────────\n`
        teks += `║ 💡 *Cara Acc:* \n`
        teks += `║ ◦ ${usedPrefix}acc 1 (terima 1 orang)\n`
        teks += `║ ◦ ${usedPrefix}acc all (terima semua)\n`
        teks += `╚═══════════════════╝`
        return conn.reply(m.chat, teks, m, { mentions: requestList.map(v => v.jid) })
    }

    // --- LOGIKA UTAMA (ACC / REJECT) ---
    let action = command === 'acc' ? 'approve' : 'reject'
    let status = command === 'acc' ? '✅ *DISETUJUI*' : '❌ *DITOLAK*'
    let target = args[0]
    let usersToUpdate = []

    // 1. Kasus: ALL
    if (target === 'all') {
        usersToUpdate = requestList.map(v => v.jid)
    } 
    // 2. Kasus: ANGKA (MISAL: .acc 3)
    else if (target && !isNaN(target)) {
        let jumlah = parseInt(target)
        if (jumlah > requestList.length) jumlah = requestList.length
        usersToUpdate = requestList.slice(0, jumlah).map(v => v.jid)
    } 
    // 3. Kasus: TAG / REPLY / NOMOR
    else {
        let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : target ? target.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false
        if (who) {
            let isExist = requestList.find(v => v.jid === who)
            if (isExist) usersToUpdate.push(who)
        }
    }

    // Eksekusi
    if (usersToUpdate.length === 0) {
        return m.reply(`✉️ *Gagal:* Masukkan angka, tag orangnya, atau ketik *all*.\nContoh: *${usedPrefix + command} 2*`)
    }

    await m.react('⏳')
    for (let jid of usersToUpdate) {
        await conn.groupRequestParticipantsUpdate(m.chat, [jid], action)
    }

    let successMsg = `✨ ${status} ✨\n───────────────────\n`
    successMsg += `📦 *Berhasil:* ${usersToUpdate.length} Member\n`
    successMsg += `👤 *Daftar:* \n`
    successMsg += usersToUpdate.map(v => `◦ @${v.split('@')[0]}`).join('\n')
    
    await conn.reply(m.chat, successMsg, m, { mentions: usersToUpdate })
    await m.react('✅')
}

handler.help = ['acc', 'reject', 'listacc']
handler.tags = ['group']
handler.command = /^(acc|reject|listacc)$/i

handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
