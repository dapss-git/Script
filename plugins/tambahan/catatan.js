import { promises as fs } from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database', 'catatan.json')

// Fungsi Inisialisasi Database
async function initDB() {
    const dbDir = path.dirname(dbPath)
    if (!(await fs.stat(dbDir).catch(() => false))) await fs.mkdir(dbDir, { recursive: true })
    if (!(await fs.stat(dbPath).catch(() => false))) await fs.writeFile(dbPath, JSON.stringify({}, null, 2))
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await initDB()
    let db = JSON.parse(await fs.readFile(dbPath, 'utf-8'))
    let user = m.sender // ID Unik per nomor WA

    // --- 1. BUAT CATATAN (.catatan Judul|Isi) ---
    if (command === 'catatan') {
        if (!text) return m.reply(`💡 *Cara Pakai:*\n${usedPrefix + command} Judul|Isi Catatan\n\n*Contoh:*\n${usedPrefix + command} Tugas|Ngerjain Matematika hal 10`)
        
        let [judul, ...isi] = text.split('|')
        if (!judul || isi.length === 0) return m.reply('⚠️ Format salah! Gunakan pemisah | (pipa)')

        if (!db[user]) db[user] = []
        db[user].push({
            judul: judul.trim(),
            isi: isi.join('|').trim(),
            waktu: new Date().toLocaleString('id-ID')
        })

        await fs.writeFile(dbPath, JSON.stringify(db, null, 2))
        m.reply(`✅ Catatan *"${judul.trim()}"* berhasil disimpan!`)
    }

    // --- 2. LIHAT SEMUA CATATAN (.catatansaya) ---
    if (command === 'catatansaya') {
        if (!db[user] || db[user].length === 0) return m.reply('📭 Lo belum punya catatan apa-apa, Fa.')

        let list = `🗒️ *DAFTAR CATATAN LO*\n\n`
        db[user].forEach((v, i) => {
            list += `*${i + 1}.* ${v.judul}\n`
        })
        list += `\nKetik *${usedPrefix}baca [nomor]* buat liat isinya.`
        m.reply(list)
    }

    // --- 3. BACA ISI CATATAN (.baca [nomor]) ---
    if (command === 'baca') {
        if (!db[user] || !text) return m.reply(`💡 Contoh: ${usedPrefix}baca 1`)
        let index = parseInt(text) - 1
        if (!db[user][index]) return m.reply('❌ Catatan nggak ketemu.')

        let note = db[user][index]
        let txt = `🗒️ *JUDUL:* ${note.judul}\n`
        txt += `⏰ *Dibuat:* ${note.waktu}\n`
        txt += `\n${note.isi}`
        m.reply(txt)
    }

    // --- 4. EDIT CATATAN (.editcatatan Nomor|IsiBaru) ---
    if (command === 'editcatatan') {
        if (!text) return m.reply(`💡 Contoh: ${usedPrefix}editcatatan 1|Isi yang baru`)
        let [indexStr, ...isiBaru] = text.split('|')
        let index = parseInt(indexStr) - 1
        
        if (!db[user] || !db[user][index]) return m.reply('❌ Catatan nomor itu gak ada.')
        
        db[user][index].isi = isiBaru.join('|').trim()
        db[user][index].waktu = new Date().toLocaleString('id-ID') + ' (Edited)'
        
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2))
        m.reply(`✅ Catatan nomor ${index + 1} berhasil diupdate!`)
    }

    // --- 5. HAPUS CATATAN (.hapuscatatan Nomor) ---
    if (command === 'hapuscatatan') {
        if (!text) return m.reply(`💡 Contoh: ${usedPrefix}hapuscatatan 1`)
        let index = parseInt(text) - 1
        
        if (!db[user] || !db[user][index]) return m.reply('❌ Catatan nomor itu gak ada.')
        
        let judulHapus = db[user][index].judul
        db[user].splice(index, 1)
        
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2))
        m.reply(`🗑️ Catatan *"${judulHapus}"* berhasil dihapus.`)
    }
}

handler.help = ['catatan', 'catatansaya', 'editcatatan', 'hapuscatatan']
handler.tags = ['tools']
handler.command = /^(catatan|catatansaya|baca|editcatatan|hapuscatatan)$/i

export default handler
