let handler = async (m, { conn, args, participants, usedPrefix, command }) => {
    let target;

    // 1. Deteksi Target (Tag atau Reply)
    if (m.mentionedJid?.[0]) {
        target = m.mentionedJid[0];
    } else if (m.quoted?.sender) {
        target = m.quoted.sender;
    } else if (args[0]) {
        // 2. Deteksi Target via Input Nomor (Clean up characters)
        let rawNumber = args[0].replace(/[^0-9]/g, "");
        if (rawNumber.length >= 5) {
            target = rawNumber + "@s.whatsapp.net";
        }
    }

    if (!target) return m.reply(`*Format Salah!*\n\nContoh:\n${usedPrefix + command} @user\n${usedPrefix + command} (reply pesan)\n${usedPrefix + command} 628xxxx`);

    try {
        // Cek apakah target ada di grup
        const exists = participants.some(p => p.id === target);
        if (!exists) throw "User tersebut tidak ada di dalam grup ini.";

        // Proses Promote
        await conn.groupParticipantsUpdate(m.chat, [target], "promote");

        await conn.sendMessage(m.chat, {
            text: `✅ Sukses menaikkan jabatan @${target.split("@")[0]} menjadi Admin.`,
            mentions: [target]
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        // Jika error berasal dari sistem WhatsApp (misal: sudah admin)
        m.reply(`❌ Gagal: ${e.message || e}`);
    }
};

handler.help = ["promote"];
handler.tags = ["group"];
handler.command = /^(promote)$/i;

handler.group = true;
handler.botAdmin = true;
handler.admin = true;

export default handler;
