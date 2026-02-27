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

export async function before(m, { conn }) {
    let db = await readDB();
    if (!db.users) return;

    // 1. CEK USER BALIK (Hapus AFK)
    if (db.users[m.sender] && db.users[m.sender].afk > -1) {
        if (m.text && !m.text.startsWith('.') && !m.isBaileys) { // Jangan kehapus kalo cuma ngetik bot/command
            let user = db.users[m.sender];
            let duration = + new Date() - user.afk;
            
            await conn.reply(m.chat, `*───〔 BACK FROM AFK 〕───*\n\n👋 @${m.sender.split('@')[0]} sudah muncul lagi!\n⏳ Istirahat selama: *${formatDuration(duration)}*`, m, { mentions: [m.sender] });
            
            user.afk = -1;
            user.afkReason = '';
            await writeDB(db);
        }
    }

    // 2. CEK MENTION (Ada yang nge-tag orang AFK)
    let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])];
    for (let jid of jids) {
        if (jid === m.sender) continue;
        let target = db.users[jid];
        if (target && target.afk > -1) {
            let duration = + new Date() - target.afk;
            await conn.reply(m.chat, `⚠️ *ORANGNYA LAGI AFK!*\n\n👤 @${jid.split('@')[0]} lagi AFK.\n📝 Alasan: ${target.afkReason}\n⏳ Sudah dari: ${formatDuration(duration)} yang lalu`, m, { mentions: [jid] });
        }
    }
    return true;
}

function formatDuration(ms) {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds %= 60; minutes %= 60;
    return `${hours > 0 ? hours + ' jam ' : ''}${minutes > 0 ? minutes + ' menit ' : ''}${seconds} detik`;
}
