import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix, command, participants }) => {
    conn.absen = conn.absen ? conn.absen : {}
    let id = m.chat
    let waktu = moment.tz('Asia/Jakarta').format('HH:mm:ss')
    let tanggal = moment.tz('Asia/Jakarta').format('DD/MM/YYYY')

    // Cek Admin
    const isAdmin = participants.some(p => p.id === m.sender && (p.admin === 'admin' || p.admin === 'superadmin'))

    // 1. MULAI / RESET ABSEN
    if (command === 'mulaiabsen' || command === 'resetabsen') {
        if (!isAdmin) return m.reply("🚫 *Akses Ditolak:* Hanya Admin yang dapat memulai sesi absen.")
        conn.absen[id] = []
        let teks = `
✨ *SESI ABSENSI DIMULAI* ✨

📅 *Tanggal:* ${tanggal}
⏰ *Waktu:* ${waktu} WIB

Silahkan ketik *${usedPrefix}absen* untuk mengisi daftar hadir.
Gunakan *${usedPrefix}listabsen* untuk melihat peserta.`.trim()
        
        return conn.reply(m.chat, teks, m)
    }

    // 2. STOP ABSEN
    if (command === 'stopabsen') {
        if (!isAdmin) return m.reply("🚫 *Akses Ditolak:* Hanya Admin yang dapat menghentikan sesi absen.")
        if (!(id in conn.absen)) return m.reply("⚠️ Tidak ada sesi absen yang sedang berjalan.")
        
        let total = conn.absen[id].length
        delete conn.absen[id]
        return m.reply(`✅ *Absensi Ditutup.* Terimakasih kepada *${total}* peserta yang telah hadir hari ini.`)
    }

    // 3. PROSES ABSEN
    if (command === 'absen') {
        if (!(id in conn.absen)) return m.reply(`❌ Sesi absen belum dibuka oleh admin.`)

        let userAbsen = conn.absen[id].find(v => v.id === m.sender)
        if (userAbsen) return m.reply(`📍 *Peringatan:* @${m.sender.split('@')[0]} sudah melakukan absen pada pukul ${userAbsen.jam}!`)

        conn.absen[id].push({
            id: m.sender,
            nama: m.name,
            jam: waktu,
            isAdmin: isAdmin
        })

        m.reply(`✅ *Berhasil hadir* pada pukul ${waktu} WIB.`)
    }

    // 4. LIST ABSEN
    if (command === 'listabsen') {
        if (!(id in conn.absen)) return m.reply("⚠️ Belum ada sesi absen yang aktif.")
        if (conn.absen[id].length === 0) return m.reply("📝 *Daftar Hadir Kosong.* Belum ada peserta yang absen.")

        let daftarAdmin = conn.absen[id].filter(v => v.isAdmin)
        let daftarMember = conn.absen[id].filter(v => v.isAdmin === false)

        let teks = `*───〔 📝 LIST ABSENSI 〕───*\n\n`
        teks += `📅 *Tanggal:* ${tanggal}\n`
        teks += `📊 *Status:* Sedang Berjalan\n\n`

        if (daftarAdmin.length > 0) {
            teks += `*🛡️ ADMIN GRUP*\n`
            teks += daftarAdmin.map((v, i) => `  ${i + 1}. @${v.id.split('@')[0]} [${v.jam}]`).join('\n')
            teks += `\n\n`
        }

        if (daftarMember.length > 0) {
            teks += `*👥 MEMBER GRUP*\n`
            teks += daftarMember.map((v, i) => `  ${i + 1}. @${v.id.split('@')[0]} [${v.jam}]`).join('\n')
            teks += `\n\n`
        }

        teks += `*Total Hadir:* ${conn.absen[id].length} Orang\n`
        teks += `*────────────────────*`

        conn.reply(m.chat, teks, m, {
            contextInfo: {
                mentionedJid: conn.absen[id].map(v => v.id),
                externalAdReply: {
                    title: "ABSENSI KEHADIRAN",
                    body: "Pastikan Anda sudah mengisi daftar hadir",
                    thumbnailUrl: "https://telegra.ph/file/24fa902ead26340f3df2c.png",
                    sourceUrl: "",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        })
    }
}

handler.help = ["absen", "listabsen", "mulaiabsen", "stopabsen"]
handler.tags = ["group"]
handler.command = ["absen", "listabsen", "mulaiabsen", "resetabsen", "stopabsen"]
handler.group = true

export default handler
