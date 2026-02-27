import { promises as fs } from 'fs';
import path from 'path';

// Path database khusus Sider
const dbPath = path.join(process.cwd(), 'database', 'dbsider.json');

async function readDB() {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return { immune: {} };
    }
}

async function writeDB(data) {
    const dbDir = path.dirname(dbPath);
    if (!(await fs.stat(dbDir).catch(() => false))) {
        await fs.mkdir(dbDir, { recursive: true });
    }
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

let Izumi = async (m, { conn, text, command, groupMetadata }) => {
    let db = await readDB();
    if (!db.immune) db.immune = {};

    // --- FITUR BARU: PROTEKSI SIDER ---
    if (command === 'antisider' || command === 'immunesider') {
        let duration = 2 * 24 * 60 * 60 * 1000; // 2 Hari dalam milidetik
        db.immune[m.sender] = Date.now() + duration;
        await writeDB(db);
        return m.reply(`✅ *Sider Protection Aktif!*\n\nNama kamu @${m.sender.split('@')[0]} tidak akan muncul di list sider selama *2 hari* ke depan.`, null, { mentions: [m.sender] });
    }

    // --- LOGIKA UTAMA SIDER ---
    const more = String.fromCharCode(8206)
    const readMore = more.repeat(4001)

    function formatDuration(ms) {
        let d = Math.floor(ms / 86400000)
        let h = Math.floor(ms / 3600000) % 24
        let m = Math.floor(ms / 60000) % 60
        let s = Math.floor(ms / 1000) % 60
        return `${d > 0 ? d + 'D ' : ''}${h > 0 ? h + 'H ' : ''}${m > 0 ? m + 'M ' : ''}${s}S`
    }

    function formatDate(ms) {
        let date = new Date(ms)
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`
    }

    let participants = groupMetadata.participants
    let batasWaktu = 604800000 // 7 Hari
    let now = Date.now()
    let sider = []

    for (let u of participants) {
        // CEK APAKAH USER SEDANG IMMUNE (DIPROTEKSI)
        if (db.immune[u.id] && now < db.immune[u.id]) continue;

        let user = global.db.data.users[u.id]
        if (!u.admin && u.id !== conn.user.jid) {
            if (!user || !user.lastseen) {
                sider.push({ jid: u.id, lastseen: null })
            } else if ((now - user.lastseen) > batasWaktu) {
                sider.push({ jid: u.id, lastseen: user.lastseen })
            }
        }
    }

    if (sider.length === 0) return m.reply('✨ *Grup Bersih!* Semuanya aktif dalam 7 hari terakhir.')

    let teks = `╔═══━━━━━━━ ✨ ━━━━━━━═══╗\n`
    teks += `║       *SIDER DETECTOR* \n`
    teks += `╚═══━━━━━━━ ✨ ━━━━━━━═══╝\n\n`
    teks += `🏢 *GRUP:* ${groupMetadata.subject}\n`
    teks += `📊 *TOTAL SIDER:* *${sider.length}* MEMBER\n`
    teks += `───────────────────\n\n`
    teks += `*DAFTAR ANGGOTA PASIF:*${readMore}\n`
    
    teks += sider.map((v, i) => {
        let status = ''
        if (!v.lastseen) {
            status = `*TIDAK PERNAH CHAT*\n└─ *TERDATA PADA: ${formatDate(now)}*`
        } else {
            status = `*OFF: ${formatDuration(now - v.lastseen)}*\n└─ *TERAKHIR AKTIF: ${formatDate(v.lastseen)}*`
        }
        return `*${i + 1}.* @${v.jid.split('@')[0]}\n${status}`
    }).join("\n\n")

    teks += `\n\n───────────────────\n`
    teks += `_Harap aktif kembali di grup._`

    conn.sendMessage(m.chat, {
        text: teks,
        contextInfo: {
            mentionedJid: sider.map(v => v.jid),
            externalAdReply: {
                title: "SIDER DETECTOR",
                body: `Daftar member pasif di ${groupMetadata.subject}`,
                thumbnailUrl: "https://telegra.ph/file/24fa902ead26340f3df2c.png",
                sourceUrl: "",
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: m })
}

Izumi.help = ['sider', 'antisider']
Izumi.tags = ['group']
Izumi.command = /^(sider|siders|antisider|immunesider)$/i
Izumi.group = true

export default Izumi;
