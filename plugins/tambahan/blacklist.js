import { promises as fs } from 'fs';
import path from 'path';

// Path database khusus Blacklist
const dbPath = path.join(process.cwd(), 'database', 'dbblacklist.json');

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

let Izumi = async (m, { conn, args, usedPrefix, command }) => {
    let db = await readDB();
    if (!db.chats) db.chats = {};
    if (!db.chats[m.chat]) db.chats[m.chat] = { blacklist: [] };
    
    let chat = db.chats[m.chat];
    let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;

    if (command === 'addbl') {
        if (!target) return m.reply(`✉️ Tag orangnya atau reply pesannya!\nContoh: *${usedPrefix + command} @user*`);
        if (chat.blacklist.includes(target)) return m.reply('❌ Orang ini sudah ada di daftar cekal, Daf!');
        
        chat.blacklist.push(target);
        await writeDB(db);
        m.reply(`✅ Berhasil! @${target.split('@')[0]} sekarang masuk daftar blacklist grup ini. Chatnya bakal otomatis dihapus.`, null, { mentions: [target] });
    }

    if (command === 'delbl' || command === 'unbl') {
        if (!target) return m.reply(`✉️ Mana yang mau dihapus? Tag orangnya!\nContoh: *${usedPrefix + command} @user*`);
        if (!chat.blacklist.includes(target)) return m.reply('❌ Orang ini memang tidak ada di daftar blacklist.');
        
        chat.blacklist = chat.blacklist.filter(u => u !== target);
        await writeDB(db);
        m.reply(`✅ Sip! @${target.split('@')[0]} sudah dimaafkan dan dihapus dari blacklist.`, null, { mentions: [target] });
    }

    if (command === 'listbl') {
        if (chat.blacklist.length === 0) return m.reply('📭 Daftar blacklist di grup ini masih kosong.');
        let teks = `🚫 *DAFTAR USER BLACKLIST*\n\n`;
        chat.blacklist.forEach((u, i) => {
            teks += `${i + 1}. @${u.split('@')[0]}\n`;
        });
        teks += `\n> Untuk buka blacklist, silakan hubungi Admin atau Owner bot.`;
        conn.reply(m.chat, teks, m, { mentions: chat.blacklist });
    }
}

// ============== FITUR AUTO DELETE (THE GATEKEEPER) ==============
Izumi.before = async function (m, { conn, isBotAdmin }) {
    if (!m.isGroup || !isBotAdmin || !m.text) return;
    
    let db = await readDB();
    let chat = db.chats?.[m.chat];
    if (!chat || !chat.blacklist || chat.blacklist.length === 0) return;

    // Jika pengirim ada di daftar blacklist, langsung hapus tanpa ampun
    if (chat.blacklist.includes(m.sender)) {
        return await conn.sendMessage(m.chat, { delete: m.key });
    }
}

Izumi.help = ['addbl', 'delbl', 'listbl']
Izumi.tags = ['group']
Izumi.command = /^(addbl|delbl|unbl|listbl)$/i

Izumi.admin = true
Izumi.group = true
Izumi.botAdmin = true

export default Izumi;
