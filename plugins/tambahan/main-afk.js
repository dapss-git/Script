import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'dbafk.json');

async function readDB() {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch { return { users: {} }; }
}

async function writeDB(data) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

let handler = async (m, { conn, text }) => {
    let db = await readDB();
    if (!db.users) db.users = {};
    
    let user = db.users[m.sender] || { afk: -1, afkReason: '' };
    user.afk = + new Date();
    user.afkReason = text || 'Lagi ada urusan sebentar';
    db.users[m.sender] = user;
    await writeDB(db);
    
    let ppUrl = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://telegra.ph/file/241d716298febc1d0b998.jpg');

    await conn.sendMessage(m.chat, {
        text: `*───〔 AFK MODE ON 〕───*\n\n💤 *Si @${m.sender.split('@')[0]} izin pamit sebentar!*\n\n📝 *Alasan:* ${user.afkReason}`,
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: `Zzz... Sedang Istirahat`,
                body: user.afkReason,
                thumbnailUrl: ppUrl,
                sourceUrl: null,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}

handler.help = ['afk <alasan>']
handler.tags = ['main']
handler.command = /^afk$/i

export default handler
