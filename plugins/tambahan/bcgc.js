import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'dbbcgc.json');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function readDB() {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch { return { history: [] }; }
}

async function writeDB(data) {
    const dbDir = path.dirname(dbPath);
    if (!(await fs.stat(dbDir).catch(() => false))) { await fs.mkdir(dbDir, { recursive: true }); }
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

let Izumi = async (m, { conn, text, usedPrefix, command, isOwner }) => {
    if (!isOwner) return;

    if (!text && !m.quoted) {
        return m.reply(`📢 *BROADCAST SYSTEM*\n\nUsage:\n${usedPrefix + command} [teks]`);
    }

    let args = text.split(' ');
    let isHide = args[0]?.toLowerCase() === '-hide';
    if (isHide) args.shift();
    let finalPesan = args.join(' ').trim() || m.quoted?.text || '';

    let groups = Object.keys(await conn.groupFetchAllParticipating());
    if (groups.length === 0) return m.reply('❌ Gak ada grup ditemukan.');

    let media = null, type = null;
    if (m.quoted) {
        const mime = (m.quoted.msg || m.quoted).mimetype || '';
        if (/image|video|audio|document/.test(mime)) {
            media = await m.quoted.download();
            type = mime.split('/')[0];
        }
    }

    let statusMsg = await m.reply(`🚀 Memulai BC ke ${groups.length} grup...`);

    let success = 0, failed = 0;
    let startTime = Date.now();
    
    // List angka kemunculan laporan (sesuai request lo)
    let updatePoints = [2, 4, 6, 8, 10, 16, 18, 25, 30, 40, 50, 60, 80, 100];

    for (let i = 0; i < groups.length; i++) {
        let id = groups[i];
        let currentCount = i + 1;
        
        try {
            let mentions = isHide ? (await conn.groupMetadata(id)).participants.map(p => p.id) : [];
            if (media) {
                await conn.sendMessage(id, { [type]: media, caption: finalPesan, mentions }, { quoted: null });
            } else {
                await conn.sendMessage(id, { text: finalPesan, mentions }, { quoted: null });
            }
            success++;
        } catch (e) {
            failed++;
        }

        // --- UPDATE PROGRESS ACAK (Hanya muncul di angka tertentu) ---
        if (updatePoints.includes(currentCount) || currentCount === groups.length) {
            await conn.sendMessage(m.chat, { 
                text: `📊 *PROGRESS BC*\n───────────────────\n✅ Sukses: ${success}\n❌ Gagal: ${failed}\n🎯 Checkpoint: ${currentCount}/${groups.length}`,
                edit: statusMsg.key 
            }).catch(() => null);
        }

        // Delay tipis biar nggak dianggap spam brutal oleh server (1 detik)
        await sleep(1000);
    }

    let db = await readDB();
    db.history.push({
        date: new Date().toLocaleString('id-ID'),
        total_groups: groups.length,
        success: success
    });
    await writeDB(db);

    let final = `✅ *BROADCAST SELESAI*\n───────────────────\n⏱️ Durasi: ${formatDuration(Date.now() - startTime)}\n✨ Sukses: ${success}\n💀 Gagal: ${failed}`;
    await conn.sendMessage(m.chat, { text: final, edit: statusMsg.key });
}

Izumi.help = ['bcgc']
Izumi.tags = ['owner']
Izumi.command = /^(bcgc|broadcastgc)$/i
Izumi.owner = true

export default Izumi;
