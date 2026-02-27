import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'

const handler = async (m, { conn, isOwner }) => {
    // Proteksi: Cuma lo (Owner) yang bisa backup script
    if (!isOwner) return 

    const ROOT = process.cwd()
    const TMP_DIR = path.join(ROOT, 'tmp')
    const skrg = new Date().toISOString().replace(/[:.]/g, '-')
    const ZIP_NAME = `Kashiwada-MD-${skrg}.zip`
    const ZIP_PATH = path.join(TMP_DIR, ZIP_NAME)

    // Daftar file yang mau dibackup
    const files = [
        'LICENSE', 'README.md', 'index.js', 'config.js',
        'package.json', 'package-lock.json', 'handler.js',
        'cookies.txt', 'main.js', 'speed.py', 'database.json'
    ]

    // Daftar folder yang mau dibackup
    const dirs = [
        'database', 'lib', 'plugins', 'src'
    ]

    try {
        m.reply('🔄 Sedang mengompres file script, tunggu bentar ya Dafa...')

        if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR)
        
        const zip = new AdmZip()

        // Input File ke Zip
        for (const file of files) {
            const p = path.join(ROOT, file)
            if (fs.existsSync(p)) {
                zip.addLocalFile(p)
            }
        }

        // Input Folder ke Zip
        for (const dir of dirs) {
            const p = path.join(ROOT, dir)
            if (fs.existsSync(p)) {
                zip.addLocalFolder(p, dir)
            }
        }

        // Tulis ZIP secara Sinkron (Lebih stabil)
        zip.writeZip(ZIP_PATH)

        // Baca file yang baru dibuat
        const fileBuffer = fs.readFileSync(ZIP_PATH)

        // Kirim dokumen ke nomor si pengirim (Private Chat)
        await conn.sendMessage(m.sender, {
            document: fileBuffer,
            fileName: ZIP_NAME,
            mimetype: 'application/zip',
            caption: 'Ini backup script lo ya, semangat ngembanginnya! ✨'
        }, { quoted: m })

        // Notif di grup/chat asal
        if (m.chat !== m.sender) {
            m.reply('✅ Backup sukses! File sudah dikirim ke chat pribadi lo.')
        }

        // 🔥 Pembersihan: Hapus file zip & folder tmp setelah dikirim
        setTimeout(() => {
            if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH)
        }, 5000)

    } catch (e) {
        console.error(e)
        m.reply(`❌ Gagal backup: ${e.message}`)
    }
}

handler.help = ['backup']
handler.tags = ['owner']
handler.command = /^backup$/i
handler.owner = true // Menggunakan pengaman bawaan handler

export default handler
