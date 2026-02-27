import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format Salah!*\n\nContoh: _${usedPrefix + command} https://kiosgamer.co.id/_`);
    
    // Normalisasi URL
    let url = text.trim();
    if (!url.startsWith('http')) url = 'https://' + url;

    await m.reply('⏳ *Processing...*\nSedang mengkloning website dan menyiapkan file ZIP. Mohon tunggu.');

    try {
        const startTime = Date.now();
        
        // Request ke API NekoLabs
        const { data } = await axios.get(`https://rynekoo-api.hf.space/tools/web2zip?url=${encodeURIComponent(url)}`);

        if (!data.success || !data.result.downloadUrl) {
            return m.reply('❌ *Gagal!* API tidak memberikan respon sukses. Pastikan website tidak memiliki proteksi Cloudflare yang ketat.');
        }

        const res = data.result;
        const endTime = Date.now();
        const speed = ((endTime - startTime) / 1000).toFixed(2);

        // Menentukan nama file berdasarkan domain
        const domain = new URL(url).hostname;
        const fileName = `${domain}_clone.zip`;

        let caption = `
✅ *WEB CLONE SUCCESSFUL*

📝 *Information:*
┌  ◦  *Domain:* ${res.url}
│  ◦  *Files:* ${res.copiedFilesAmount}
│  ◦  *Time:* ${speed}s
└  ◦  *URL Result:* ${res.downloadUrl}

📦 *File ZIP sedang dikirim di bawah ini...*
`;

        // 1. Kirim Detail & Link URL
        await conn.reply(m.chat, caption, m);

        // 2. Kirim File ZIP Langsung
        await conn.sendMessage(m.chat, { 
            document: { url: res.downloadUrl }, 
            mimetype: 'application/zip', 
            fileName: fileName
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply('❌ *Error!* Terjadi kesalahan sistem. Pastikan URL benar atau server API sedang tidak down.');
    }
};

handler.help = ['web2zip <url>'];
handler.tags = ['tools'];
handler.command = /^(web2zip|w2z|cloneweb)$/i;

export default handler;