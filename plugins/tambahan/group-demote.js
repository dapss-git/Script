let handler = async (m, { conn, args, participants, usedPrefix, command }) => {
    let target;

    // 1. Deteksi Target (Tag atau Reply)
    if (m.mentionedJid?.[0]) {
        target = m.mentionedJid[0];
    } else if (m.quoted?.sender) {
        target = m.quoted.sender;
    } else if (args[0]) {
        // 2. Deteksi Target via Input Nomor
        let rawNumber = args[0].replace(/[^0-9]/g, "");
        if (rawNumber.length >= 5) {
            target = rawNumber + "@s.whatsapp.net";
        }
    }

    if (!target) return m.reply(`*Format Salah!*\n\nContoh:\n${usedPrefix + command} @user\n${usedPrefix + command} (reply pesan)\n${usedPrefix + command} 628xxxx`);

    try {
        // Cek apakah target ada di grup
        const exists = participants.find(p => p.id === target);
        if (!exists) throw "User tersebut tidak ada di dalam grup ini.";
        
        // Cek apakah dia memang admin (hanya admin yang bisa didemote)
        if (exists.admin === null) throw "User tersebut bukan Admin.";

        // Proses Demote
        await conn.groupParticipantsUpdate(m.chat, [target], "demote");

        await conn.sendMessage(m.chat, {
            text: `✅ Sukses menurunkan jabatan @${target.split("@")[0]} menjadi Member biasa.`,
            mentions: [target]
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`❌ Gagal: ${e.message || e}`);
    }
};

handler.help = ["demote"];
handler.tags = ["group"];
handler.command = /^(demote)$/i;

handler.group = true;
handler.botAdmin = true;
handler.admin = true;

export default handler;
