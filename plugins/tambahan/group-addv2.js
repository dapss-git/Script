import fetch from 'node-fetch'

// Fungsi Helper untuk Jeda (Delay)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let users = []

    // 1. Logika Pengambilan Nomor
    if (m.quoted) {
        users.push(m.quoted.sender)
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        users = m.mentionedJid
    } else if (text) {
        // Memecah teks berdasarkan karakter "|" seperti di gambar
        let rawNumbers = text.split('|')
        
        for (let num of rawNumbers) {
            let cleanNumber = num.replace(/[^0-9]/g, "")
            
            // Normalisasi 08 ke 62
            if (cleanNumber.startsWith('0')) {
                cleanNumber = '62' + cleanNumber.slice(1)
            }
            
            // Minimal panjang nomor WA yang valid
            if (cleanNumber.length >= 9) {
                users.push(cleanNumber + "@s.whatsapp.net")
            }
        }
    }

    // Jika tidak ada nomor yang ditemukan
    if (users.length === 0) return m.reply(`*Format Salah!*\n\nContoh:\n${usedPrefix + command} nomor|nomor|nomor`);

    // Menghapus duplikat nomor dalam satu input
    users = [...new Set(users)]

    m.reply(`⏳ Sedang menambahkan ${users.length} anggota secara bertahap...`);

    // 2. Proses Penambahan dengan Looping & Jeda
    for (let i = 0; i < users.length; i++) {
        let who = users[i]
        
        try {
            const result = await conn.groupParticipantsUpdate(m.chat, [who], "add")
            const userResult = result?.[0]

            // Respon jika berhasil
            if (userResult?.status === "200") {
                await conn.sendMessage(m.chat, { 
                    text: `✅ Berhasil menambahkan @${who.split("@")[0]}`, 
                    mentions: [who] 
                })
            } 
            // Respon jika nomor memprivasi "Add Group"
            else if (userResult?.status === "403") {
                const groupMetadata = await conn.groupMetadata(m.chat)
                const inviteCode = await conn.groupInviteCode(m.chat)
                const groupName = groupMetadata.subject || "Grup"
                const inviteExpiration = Date.now() + 3 * 24 * 60 * 60 * 1000

                await conn.sendInviteGroup(
                    m.chat, who, inviteCode, inviteExpiration, groupName,
                    `Halo, saya ingin menambahkanmu ke grup ${groupName}, tapi privasimu menghalangi. Klik link ini untuk bergabung!`,
                    null, { mentions: [who] }
                )
                await m.reply(`⚠️ @${who.split("@")[0]} memprivasi akunnya. Undangan telah dikirim ke chat pribadi.`)
            } else {
                await m.reply(`❌ Gagal: @${who.split("@")[0]} (Status: ${userResult?.status || "unknown"})`)
            }

        } catch (e) {
            console.error(e)
        }

        // JEDA KEAMANAN: Memberikan jeda 3-5 detik antar nomor agar tidak terbanned
        if (i < users.length - 1) await delay(3500)
    }

    m.reply(`✅ Semua nomor selesai diproses.`);
}

handler.help = ["addv2"]
handler.tags = ["group"]
handler.command = /^(addv2)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler