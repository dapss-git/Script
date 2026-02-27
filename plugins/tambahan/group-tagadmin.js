let oota = async (m, {
    conn,
    text,
    participants
}) => {

    // 1. Persiapan Thumbnail (Sama persis dengan gaya kodemu)
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
                name: "Admin Call System",
                jpegThumbnail: resize
            }
        }
    };

    // 2. Ambil daftar admin
    const admins = participants.filter(p => p.admin !== null).map(p => p.id);
    if (admins.length === 0) return m.reply("Grup ini tidak memiliki admin.");

    // 3. Custom Pesan
    let pesanUser = text ? text : "Tidak ada pesan.";

    let teks = ` *– 乂 Tag Admin - System*\n\n`;
    teks += `📝 *Pesan:* ${pesanUser}\n`;
    teks += `──────────────────\n`;
    
    for (let admin of admins) {
        teks += `• @${admin.split("@")[0]}\n`;
    }

    teks += `\n_Panggilan dari: @${m.sender.split("@")[0]}_`;

    // 4. Kirim Pesan
    conn.reply(
        m.chat, 
        teks, 
        floc, 
        { 
            contextInfo: { 
                mentionedJid: [...admins, m.sender] 
            } 
        }
    );
}

// Bagian ini harus sama dengan nama variabel di atas (oota)
oota.help = ["tagadmin <pesan>"];
oota.tags = ["group"];
oota.command = ["tagadmin", "admin", "alladmin"];
oota.group = true; 

export default oota;
