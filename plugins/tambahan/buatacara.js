import { promises as fs } from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database', 'acara_grup.json')

async function initDB() {
    const dbDir = path.dirname(dbPath)
    if (!(await fs.stat(dbDir).catch(() => false))) await fs.mkdir(dbDir, { recursive: true })
    if (!(await fs.stat(dbPath).catch(() => false))) await fs.writeFile(dbPath, JSON.stringify({}, null, 2))
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await initDB()
    let data = await fs.readFile(dbPath, 'utf-8')
    let db = JSON.parse(data)
    let groupID = m.chat
    if (!m.isGroup) return m.reply('❌ Khusus di grup, Fa!')

    // --- 1. BUAT ACARA (.cacara Judul|Pesan|Jam|Sampai) ---
    if (command === 'cacara') {
        const groupMetadata = await conn.groupMetadata(groupID)
        const isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
        if (!isAdmin && !m.fromMe) return m.reply('⚠️ Cuma Admin yang bisa buka acara!')
        
        if (!text) return m.reply(`💡 *Cara Pakai:* \n${usedPrefix + command} Judul|Pesan|Jam|Sampai\n\n*Contoh:*\n${usedPrefix + command} Konvoi Bussid|Daftar sebelum penuh ya!|11:00|0`)

        let [judul, pesan, jam, sampai] = text.split('|')
        if (!judul || !pesan || !jam) return m.reply('⚠️ Format salah! Gunakan pemisah | (pipa)')

        // Logika nentuin Waktu (Pagi/Siang/Sore/Malam)
        let jamInt = parseInt(jam.split(':')[0])
        let ketWaktu = 'Malam'
        if (jamInt >= 5 && jamInt < 11) ketWaktu = 'Pagi'
        else if (jamInt >= 11 && jamInt < 15) ketWaktu = 'Siang'
        else if (jamInt >= 15 && jamInt < 18) ketWaktu = 'Sore'
        else if (jamInt >= 18 || jamInt < 5) ketWaktu = 'Malam'

        let waktuSelesai = sampai === '0' ? 'Selesai' : sampai

        db[groupID] = {
            judul: judul.trim(),
            pesan: pesan.trim(),
            waktu: `${jam.trim()} ${ketWaktu} - ${waktuSelesai}`,
            peserta: []
        }
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2))

        let kepsen = `📢 *ACARA BARU DIBUKA*\n\n`
        kepsen += `📌 *Judul:* ${db[groupID].judul}\n`
        kepsen += `📝 *Pesan:* ${db[groupID].pesan}\n`
        kepsen += `⏰ *Waktu:* ${db[groupID].waktu}\n\n`
        kepsen += `Ketik *${usedPrefix}ikut* untuk menghadiri acara!`
        
        m.reply(kepsen)
    }

    // --- 2. DAFTAR / IKUT ---
    if (/ikut|daftar|reg/i.test(command)) {
        if (!db[groupID]) return m.reply('❌ Belum ada acara aktif.')
        if (db[groupID].peserta.includes(m.sender)) return m.reply('⚠️ Sudah daftar, Fa!')

        db[groupID].peserta.push(m.sender)
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2))
        m.reply(`✅ @${m.sender.split('@')[0]} Berhasil bergabung!`, null, { mentions: [m.sender] })
    }

    // --- 3. LIHAT LIST PESERTA (.lpes) ---
    if (/lpes|peserta|liatpeserta/i.test(command)) {
        if (!db[groupID]) return m.reply('❌ Gak ada acara aktif.')
        let { judul, pesan, waktu, peserta } = db[groupID]
        
        let list = `📊 *DAFTAR HADIR ACARA*\n\n`
        list += `📌 *Judul:* ${judul}\n`
        list += `📝 *Pesan:* ${pesan}\n`
        list += `⏰ *Waktu:* ${waktu}\n`
        list += `👥 *Total:* ${peserta.length} Peserta\n\n`
        
        if (peserta.length === 0) {
            list += `_Belum ada peserta._`
        } else {
            peserta.map((v, i) => {
                list += `${i + 1}. @${v.split('@')[0]}\n`
            })
        }
        list += `\nKetik *${usedPrefix}ikut* untuk join!`
        conn.reply(m.chat, list, m, { mentions: peserta })
    }

    // --- 4. HAPUS ACARA ---
    if (command === 'hcacara') {
        if (!db[groupID]) return m.reply('❌ Gak ada acara.')
        delete db[groupID]
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2))
        m.reply('🗑️ Database acara grup ini telah dibersihkan.')
    }
}

handler.help = ['cacara', 'ikut', 'lpes', 'hcacara']
handler.tags = ['group']
handler.command = /^(cacara|ikut|daftar|reg|lpes|peserta|liatpeserta|lipes|hcacara)$/i

export default handler
