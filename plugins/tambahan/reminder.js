import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const dbPath = path.join(process.cwd(), 'database', 'reminders.json');
const tempFolder = path.join(process.cwd(), 'database', 'temp_remind');

// Bikin folder buat simpen file media
if (!await fs.stat(tempFolder).catch(() => false)) {
    await fs.mkdir(tempFolder, { recursive: true });
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [waktu, ...pesan] = text.split('|');
    if (!waktu) return m.reply(`⚠️ Contoh: *${usedPrefix + command} 10m|Ingetin tugas* (Sambil reply media)`);

    let ms = parseTime(waktu);
    if (!ms) return m.reply('⚠️ Format waktu salah! Contoh: 10s, 5m, 1h');

    let quoted = m.quoted ? m.quoted : m;
    let mime = (quoted.msg || quoted).mimetype || '';
    let mediaPath = null;
    let fileName = '';

    // Jika ada media yang di-reply
    if (/image|video|audio|document/.test(mime)) {
        let buffer = await quoted.download();
        fileName = `${crypto.randomBytes(6).toString('hex')}.${mime.split('/')[1].split(';')[0]}`;
        mediaPath = path.join(tempFolder, fileName);
        await fs.writeFile(mediaPath, buffer);
    }

    let db = [];
    try {
        db = JSON.parse(await fs.readFile(dbPath, 'utf-8'));
    } catch { db = []; }

    db.push({
        id: m.sender,
        chat: m.chat,
        pesan: pesan.join('|') || (m.quoted ? m.quoted.text : ''),
        time: + new Date() + ms,
        media: fileName, // Simpan nama filenya aja
        mime: mime
    });

    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
    m.reply(`✅ *REMINDER DISIMPAN*\n\n⏳ Dalam: ${waktu}\n📂 Media: ${mime ? 'Ada' : 'Tidak ada'}`);
}

handler.help = ['remind <waktu>|<pesan>']
handler.tags = ['tools']
handler.command = /^(remind|reminder)$/i
export default handler

function parseTime(t) {
    let unit = t.slice(-1);
    let num = parseInt(t);
    if (unit === 's') return num * 1000;
    if (unit === 'm') return num * 60 * 1000;
    if (unit === 'h') return num * 60 * 60 * 1000;
    return null;
}
