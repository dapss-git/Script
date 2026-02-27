let oota = async (m, {
    conn,
    args,
    participants
}) => {

    // 1. Persiapan Thumbnail untuk Pesan
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
                name: "Security System",
                jpegThumbnail: resize
            }
        }
    };

    // 2. Logika Switch On/Off
    let chat = global.db.data.chats[m.chat];
    if (!args[0]) return m.reply("⚠️ Gunakan format: .sekalilihat on atau off");

    if (args[0] === 'on') {
        chat.viewonceOnly = true;
        return m.reply("✅ Fitur *Sekali Lihat Only* (Foto/Video) berhasil diaktifkan.", m.chat, floc);
    }

    if (args[0] === 'off') {
        chat.viewonceOnly = false;
        return m.reply("📴 Fitur *Sekali Lihat Only* berhasil dimatikan.", m.chat, floc);
    }
}

// 3. Fungsi Otomatis (Before) untuk mendeteksi Foto & Video
oota.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return;
    let chat = global.db.data.chats[m.chat];
    
    // Penambahan deteksi videoMessage di sini
    const isMedia = m.mtype === 'imageMessage' || m.mtype === 'videoMessage';
    
    // Cek kondisi: Fitur Aktif & Pesan Foto/Video & BUKAN sekali lihat
    if (chat?.viewonceOnly && isMedia && !m.msg?.viewOnce) {
        if (isAdmin) return; // Admin dikecualikan

        if (isBotAdmin) {
            let num = "13135550002@s.whatsapp.net";
            const url = await conn.profilePictureUrl(num, 'image').catch(_ => 'https://telegra.ph/file/241d7169c375aed10019e.jpg');
            const res = await fetch(url);
            const metre = Buffer.from(await res.arrayBuffer());
            const resize = await conn.resize(metre, 200, 200);

            const floc = {
                key: { participant: num, ...(m.chat ? { remoteJid: 'status@broadcast' } : {}) },
                message: { locationMessage: { name: "Security System", jpegThumbnail: resize } }
            };

            // Hapus pesan pelanggar (Foto atau Video biasa)
            await conn.sendMessage(m.chat, { delete: m.key });

            // Beri peringatan
            conn.reply(
                m.chat, 
                ` *– 乂 Security - System*
⚠️ Peringatan! Foto atau Video yang tidak dikirim dalam mode 'Sekali Lihat' akan dihapus otomatis.
Target: @${m.sender.split("@")[0]}`, 
                floc, 
                { contextInfo: { mentionedJid: [m.sender] } }
            );
        }
    }
}

oota.help = oota.command = ["sekalilihat", "svononly"];
oota.tags = ["group"];
oota.group = true;
oota.admin = true; 
oota.botAdmin = true;

export default oota; 
