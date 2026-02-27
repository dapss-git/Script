import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'reminders.json');
const tempFolder = path.join(process.cwd(), 'database', 'temp_remind');

export async function before(m, { conn }) {
    let db = [];
    try {
        db = JSON.parse(await fs.readFile(dbPath, 'utf-8'));
    } catch { return; }

    if (db.length === 0) return;

    let now = + new Date();
    let trigger = db.filter(v => now >= v.time);

    for (let rem of trigger) {
        let text = `*───〔 REMINDER 〕───*\n\n🔔 @${rem.id.split('@')[0]}\n📝 Pesan: ${rem.pesan || 'Tanpa pesan'}`;
        
        if (rem.media) {
            let filePath = path.join(tempFolder, rem.media);
            if (await fs.stat(filePath).catch(() => false)) {
                await conn.sendMessage(rem.chat, { 
                    [/image/.test(rem.mime) ? 'image' : /video/.test(rem.mime) ? 'video' : /audio/.test(rem.mime) ? 'audio' : 'document']: { url: filePath },
                    caption: text,
                    mimetype: rem.mime,
                    ptt: /audio/.test(rem.mime) ? true : false
                }, { quoted: m });
                
                // Hapus file biar gak menuhin memori Termux
                await fs.unlink(filePath);
            }
        } else {
            await conn.reply(rem.chat, text, null, { mentions: [rem.id] });
        }

        // Hapus dari database
        db = db.filter(v => v !== rem);
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
    }
}
