let oota = async (m, {
    conn,
    args,
    participants
}) => {

    // 1. Persiapan Thumbnail untuk Pesan (Sesuai kode warn milikmu)
    let num = "13135550002@s.whatsapp.net";
    const url = await conn.profilePictureUrl(num, 'image').catch(_ => 'https://telegra.ph/file/241d7169c375aed10019e.jpg');
    const res = await fetch(url);
    const metre = Buffer.from(await res.arrayBuffer());
    const resize = await conn.resize(metre, 200, 200);

    const floc = {
        key: {
            participant: num,
            ...(m.chat ? {
                remoteJid: 'status@broadcast'
            } : {})
        },
        message: {
            locationMessage: {
                name: "Unwarn System",
                jpegThumbnail: resize
            }
        }
    };

    // 2. Mencari target yang akan di-unwarn
    let target = m.mentionedJid?.[0] || m.quoted?.sender || null;

    // Logika pencarian target berdasarkan input nomor (LID/PN)
    if (!target && args[0]) {
        const pn = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        const lid = await conn.signalRepository.lidMapping.getLIDForPN(pn);
        if (lid) target = lid;
    }

    if (!target && args[0]) {
        const raw = args[0].replace(/[^0-9]/g, "") + "@lid";
        if (participants.some((p) => p.id === raw)) target = raw;
    }

    // 3. Validasi Target
    if (!target) return m.reply("⚠️ Tag atau Reply orang yang ingin dikurangi peringatannya!");

    let users = db.data.users[target];
    
    // Cek apakah user memiliki warn
    if (!users || users.warn <= 0) {
        return m.reply("Target tidak memiliki poin pelanggaran (0 Warn).");
    }

    // 4. Proses Pengurangan Warn
    users.warn -= 1;

    // 5. Kirim Pesan Berhasil
    conn.reply(
        m.chat, 
        ` *– 乂 Unwarn - System*
Peringatan untuk @${target.split("@")[0]} telah dikurangi.
Sisa Peringatan: ${users.warn}/3`, 
        floc, 
        { contextInfo: { mentionedJid: [target] } }
    );
}

// Pengaturan Perintah
oota.help = oota.command = ["unwrn", "unwarning", "unwarn"];
oota.tags = ["group"];
oota.group = true;
oota.admin = true; // Hanya admin yang bisa mengurangi warn
oota.botAdmin = true;

export default oota;
