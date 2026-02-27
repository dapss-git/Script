import { promises as fs } from 'fs';
import path from 'path';

// Path database khusus streak
const dbPath = path.join(process.cwd(), 'database', 'dbapi.json');

// Fungsi pembantu untuk baca/tulis database mandiri
async function readDB() {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return { users: {} };
    }
}

async function writeDB(data) {
    const dbDir = path.dirname(dbPath);
    if (!(await fs.stat(dbDir).catch(() => false))) {
        await fs.mkdir(dbDir, { recursive: true });
    }
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

let Izumi = async (m, { conn, text, command }) => {
    let db = await readDB();
    if (!db.users) db.users = {};
    
    let user = db.users[m.sender];
    if (!user) db.users[m.sender] = {
        streak: 0,
        lastStreakDay: "",
        isStreakActive: false,
        recoveryCount: 0,
        lastRecoveryMonth: 0,
        lastStreakBeforeDeath: 0
    };
    user = db.users[m.sender];
    
    let now = new Date();
    let dateToday = now.toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta' });
    let currentMonth = now.getMonth() + 1;

    // Reset jatah pemulihan bulanan
    if (user.lastRecoveryMonth !== currentMonth) {
        user.recoveryCount = 0;
        user.lastRecoveryMonth = currentMonth;
    }

    if (command === 'bikinstreakbot') {
        if (user.isStreakActive) return m.reply(`Kamu sudah bikin streak! Total: *${user.streak}* 🔥`);
        user.streak = 0;
        user.lastStreakDay = "";
        user.isStreakActive = true;
        await writeDB(db);
        return m.reply(`✅ *Streak Berhasil dibuat!* \n\nSilakan mulai chat di grup untuk memicu api.`);
    }

    if (command === 'pulihkanstreak') {
        if (user.isStreakActive) return m.reply('Masih aktif kok! 😎');
        if (!user.lastStreakBeforeDeath) return m.reply('Gak ada riwayat streak mati.');

        if (user.recoveryCount >= 3) {
            user.streak = 0;
            user.lastStreakBeforeDeath = 0;
            await writeDB(db);
            return m.reply(`❌ *Jatah habis!* Streak di-reset ke *0*.`);
        }

        user.streak = user.lastStreakBeforeDeath;
        user.lastStreakDay = dateToday;
        user.isStreakActive = true;
        user.recoveryCount += 1;
        user.lastStreakBeforeDeath = 0;
        await writeDB(db);

        return m.reply(`✅ *Dipulihkan ke: ${user.streak}* 🔥\nSisa jatah: *${3 - user.recoveryCount}/3*`);
    }

    if (command === 'streakleaderboard' || command === 'topstreak') {
        let sorted = Object.entries(db.users)
            .filter(([_, data]) => data.isStreakActive && data.streak > 0)
            .sort((a, b) => b[1].streak - a[1].streak)
            .slice(0, 10);
        
        if (sorted.length === 0) return m.reply('Belum ada api. 🔥');
        let teks = `*───〔 🔥 TOP STREAK 🔥 〕───*\n\n`;
        sorted.forEach(([id, data], i) => {
            teks += `${i + 1}. *${id.split('@')[0]}* — ${data.streak} 🔥\n`;
        });
        m.reply(teks);
    }
}

Izumi.before = async function (m) {
    if (!m.isGroup || m.fromMe || !m.text) return;
    
    let db = await readDB();
    let user = db.users?.[m.sender];
    if (!user || !user.isStreakActive) return;

    let dateToday = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta' });
    
    if (!user.lastStreakDay || user.lastStreakDay === "") {
        user.streak = 1;
        user.lastStreakDay = dateToday;
        await writeDB(db);
        m.reply(`Kamu Menyalakan Streak Bot 🔥${user.streak}`);
        return;
    }

    let lastDate = new Date(user.lastStreakDay);
    let today = new Date(dateToday);
    let diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays >= 3) {
        user.lastStreakBeforeDeath = user.streak;
        user.isStreakActive = false;
        user.lastStreakDay = "";
        await writeDB(db);
        m.reply(`💀 *PADAM!* Ketik *.pulihkanstreak*`);
        return;
    }

    if (diffDays === 1) {
        user.streak += 1;
        user.lastStreakDay = dateToday;
        await writeDB(db);
        m.reply(`Streak mu menyala 🔥${user.streak}`);
    }
}

Izumi.help = ['bikinstreakbot', 'pulihkanstreak', 'streakleaderboard'];
Izumi.tags = ['main'];
Izumi.command = /^(bikinstreakbot|pulihkanstreak|streakleaderboard|topstreak)$/i;

export default Izumi;
