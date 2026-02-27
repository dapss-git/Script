import { promises as fs } from 'fs';
import path from 'path';

// Path database khusus Anti TagSW
const dbPath = path.join(process.cwd(), 'database', 'dbtagsw.json');

// Fungsi pembantu baca/tulis database
async function readDB() {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return { chats: {} };
    }
}

async function writeDB(data) {
    const dbDir = path.dirname(dbPath);
    if (!(await fs.stat(dbDir).catch(() => false))) {
        await fs.mkdir(dbDir, { recursive: true });
    }
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

let Izumi = async (m, { conn, args, usedPrefix, command, isBotAdmin, isAdmin }) => {
    if (!m.isGroup) return m.reply('Fitur ini hanya untuk di dalam grup!');
    
    let db = await readDB();
    if (!db.chats) db.chats = {};
    if (!db.chats[m.chat]) db.chats[m.chat] = { antitagsw: false };
    
    let chat = db.chats[m.chat];

    // Logika Pengaktifan
    if (command === 'tagsw' || command === 'antitagsw') {
        if (!isAdmin) return m.reply('Fitur ini khusus untuk Admin grup!');
        if (!isBotAdmin) return m.reply('Jadikan bot admin dulu biar bisa hapus pesan!');

        const arg = (args[0] || '').toLowerCase();

        if (!arg) {
            return m.reply(`⚙️ *Status Anti TagSW:* ${chat.antitagsw ? '✅ ON' : '❌ OFF'}\nGunakan: *${usedPrefix + command} on/off*`);
        }

        if (['on', 'enable', '1', 'true'].includes(arg)) {
            chat.antitagsw = true;
            await writeDB(db);
            m.reply('✅ *Anti TagSW Berhasil di-ON-kan.* Pesan mention status akan otomatis dihapus.');
        } else if (['off', 'disable', '0', 'false'].includes(arg)) {
            chat.antitagsw = false;
            await writeDB(db);
            m.reply('✅ *Anti TagSW Berhasil di-OFF-kan.*');
        } else {
            m.reply(`Gunakan: *${usedPrefix + command} on/off*`);
        }
    }
}

// Logika Deteksi (Auto Delete)
Izumi.before = async function (m, { conn, isBotAdmin }) {
    if (!m.isGroup || !isBotAdmin) return;
    
    let db = await readDB();
    let chat = db.chats?.[m.chat];
    if (!chat || !chat.antitagsw) return;

    // Deteksi mention status grup
    if (m.mtype === 'groupStatusMentionMessage') {
        const participant = m.sender;
        
        // Kirim peringatan santai
        await conn.sendMessage(m.chat, {
            text: `⚠️ Maaf @${participant.split("@")[0]}, mention status dilarang di grup ini. Pesan kamu saya hapus ya!`,
            contextInfo: { mentionedJid: [participant] }
        });

        // Hapus pesan
        return conn.sendMessage(m.chat, { delete: m.key });
    }
}

Izumi.help = ['tagsw on/off']
Izumi.tags = ['group']
Izumi.command = /^(tagsw|antitagsw)$/i

export default Izumi;
