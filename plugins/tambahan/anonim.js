import { promises as fs } from 'fs';
import path from 'path';

// Path database khusus Anonymous
const dbPath = path.join(process.cwd(), 'database', 'dbanonymous.json');

// Fungsi pembantu baca/tulis database
async function readDB() {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return { rooms: {} };
    }
}

async function writeDB(data) {
    const dbDir = path.dirname(dbPath);
    if (!(await fs.stat(dbDir).catch(() => false))) {
        await fs.mkdir(dbDir, { recursive: true });
    }
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

let Izumi = async (m, { conn, command, usedPrefix }) => {
    conn.anonymous = conn.anonymous ? conn.anonymous : {};

    if (command === 'start') {
        if (Object.values(conn.anonymous).find(room => room.check(m.sender))) return m.reply('❌ Kamu masih berada di dalam room chat!');
        
        let room = Object.values(conn.anonymous).find(room => room.state === 'WAITING' && !room.check(m.sender));
        
        if (room) {
            room.b = m.sender;
            room.state = 'CHATTING';
            m.reply('✅ *PARTNER DITEMUKAN!*\n\nSilakan mulai mengobrol. Gunakan *.leave* untuk berhenti.');
            await conn.reply(room.a, '✅ *PARTNER DITEMUKAN!*\n\nSilakan mulai mengobrol. Gunakan *.leave* untuk berhenti.', null);
        } else {
            conn.anonymous[m.sender] = {
                id: m.sender,
                a: m.sender,
                b: '',
                state: 'WAITING',
                check: function (who = '') { return [this.a, this.b].includes(who) },
                other: function (who = '') { return who === this.a ? this.b : who === this.b ? this.a : '' },
            };
            m.reply('🔍 *MENCARI PARTNER...*\n\nMohon tunggu sampai ada yang bergabung.');
        }

    } else if (command === 'leave' || command === 'stop') {
        let room = Object.values(conn.anonymous).find(room => room.check(m.sender));
        if (!room) return m.reply('❌ Kamu belum memulai chat anonymous.');
        
        let other = room.other(m.sender);
        if (other) await conn.reply(other, '⚠️ *PARTNER TELAH MENINGGALKAN CHAT*', null);
        
        delete conn.anonymous[room.a];
        if (room.b) delete conn.anonymous[room.b];
        m.reply('✅ *CHAT BERAKHIR*');

    } else if (command === 'listanon' || command === 'anonimactive') {
        let rooms = Object.values(conn.anonymous).filter(room => room.state === 'CHATTING');
        let waiting = Object.values(conn.anonymous).filter(room => room.state === 'WAITING');
        
        if (rooms.length === 0 && waiting.length === 0) return m.reply('📭 Saat ini tidak ada sesi chat yang aktif.');

        let teks = `*───〔 👤 ANONYMOUS STATS 〕───*\n\n`;
        teks += `🟢 *Active Rooms:* ${rooms.length}\n`;
        teks += `⏳ *Waiting User:* ${waiting.length}\n\n`;
        
        if (rooms.length > 0) {
            teks += `*LIST ROOM AKTIF:*\n`;
            rooms.forEach((room, i) => {
                teks += `${i + 1}. Room ID: ${room.a.split('@')[0]}\n`;
            });
        }
        
        teks += `\n_Ingin bergabung? Ketik ${usedPrefix}start_`;
        m.reply(teks);
    }
}

Izumi.before = async function (m, { conn }) {
    if (!m.text || m.isGroup || m.isCommand) return false;
    
    conn.anonymous = conn.anonymous ? conn.anonymous : {};
    let room = Object.values(conn.anonymous).find(room => room.check(m.sender) && room.state === 'CHATTING');
    
    if (room) {
        let other = room.other(m.sender);
        if (other) {
            await conn.copyNForward(other, m, true);
        }
    }
    return false;
}

Izumi.help = ['start', 'leave', 'listanon']
Izumi.tags = ['anonymous']
Izumi.command = /^(start|leave|stop|listanon|anonimactive)$/i
Izumi.private = true

export default Izumi;
