import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    // 1. Cek quoted message
    const msg = m.quoted;
    if (!msg) return m.reply('⚠️ Harap reply ke pesan media view once-nya.');

    // 2. Deteksi tipe pesan (VO V2 atau VO Biasa)
    let type = msg.mtype;
    if (type === 'viewOnceMessageV2' || type === 'viewOnceMessage') {
        const inner = msg.msg || msg.message;
        if (inner?.imageMessage) {
            type = 'imageMessage';
            msg.msg = inner.imageMessage;
        } else if (inner?.videoMessage) {
            type = 'videoMessage';
            msg.msg = inner.videoMessage;
        } else if (inner?.audioMessage) {
            type = 'audioMessage';
            msg.msg = inner.audioMessage;
        }
    }

    const kind = 
        type === 'imageMessage' ? 'image' : 
        type === 'videoMessage' ? 'video' : 
        type === 'audioMessage' ? 'audio' : null;

    if (!kind) return m.reply('❌ Jenis pesan tidak didukung. Gunakan hanya untuk gambar, video, atau audio.');

    // ===== Helper Functions =====
    const pad = (n) => n.toString().padStart(2, '0');
    const formatBytes = (n) => {
        if (!n && n !== 0) return '-';
        const units = ['B','KB','MB','GB','TB'];
        let i = 0, v = Number(n);
        while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
        return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[i]}`;
    };
    const formatDuration = (sec) => {
        if (!sec && sec !== 0) return '-';
        const h = Math.floor(sec / 3600);
        const mnt = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        return h ? `${h}:${pad(mnt)}:${pad(s)}` : `${mnt}:${pad(s)}`;
    };
    const formatDateID = (d = new Date()) => {
        const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                       hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' };
        return new Intl.DateTimeFormat('id-ID', opts).format(d) + ' WIB';
    };
    const safe = (v) => (v === undefined || v === null || v === '' ? '-' : String(v));

    // 3. Ambil Metadata
    let groupLine = 'Private Chat';
    try {
        if (m.isGroup) {
            let groupMeta = await conn.groupMetadata(m.chat);
            groupLine = `${safe(groupMeta.subject)} (${groupMeta.participants?.length || 0} member)`;
        }
    } catch {}

    const senderJid = msg?.sender || msg?.key?.participant || m?.sender || '-';
    const senderName = msg?.pushName || m?.pushName || senderJid?.split('@')[0] || '-';

    const base = msg.msg || {};
    const mime = base.mimetype || '-';
    const size = base.fileLength || base.fileLengthLow || null;
    const seconds = base.seconds || base.pttDuration || base.audioLength || null;
    const width  = base.width  || base.jpegThumbnailWidth  || null;
    const height = base.height || base.jpegThumbnailHeight || null;
    const sha256 = base?.fileSha256 ? Buffer.from(base.fileSha256, 'base64').toString('hex') : null;

    try {
        await m.react('⏳');
        
        // 4. Download Media
        const stream = await downloadContentFromMessage(msg, kind);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const captionOri = msg.caption || '';
        const isV2 = command.includes('2'); // Jika rvo2, kirim ke pribadi
        const targetJid = isV2 ? m.sender : m.chat;

        const lines = [
            `🔒 *ViewOnce ${isV2 ? 'V2 ' : ''}• Media Protection*`,
            '',
            `🎯 *Type* : ${kind.toUpperCase()}`,
            `🆔 *Message ID* : ${safe(msg?.key?.id)}`,
            `👤 *Dari* : ${safe(senderName)} (${safe(senderJid)})`,
            `👥 *Asal* : ${groupLine}`,
            `📅 *Waktu* : ${formatDateID(new Date())}`,
            `📝 *Caption* : ${safe(captionOri)}`,
            '',
            '— *Info Berkas* —',
            `📄 *MIME* : ${safe(mime)}`,
            `📦 *Ukuran* : ${formatBytes(size)}`,
            `⏱️ *Durasi* : ${['audio', 'video'].includes(kind) ? formatDuration(seconds) : '-'}`,
            `🖼️ *Resolusi* : ${['image', 'video'].includes(kind) ? (width && height ? `${width}×${height}` : '-') : '-'}`,
            `🔐 *SHA-256* : ${sha256 ? sha256.slice(0, 16) + '…' : '-'}`,
            '',
            `✅ *Status* : Berhasil diproses & disimpan`,
        ];
        const detailCaption = lines.join('\n');

        // 5. Eksekusi Pengiriman
        if (kind === 'image') {
            await conn.sendMessage(targetJid, { image: buffer, caption: detailCaption }, { quoted: isV2 ? null : m });
        } else if (kind === 'video') {
            await conn.sendMessage(targetJid, { video: buffer, caption: detailCaption }, { quoted: isV2 ? null : m });
        } else if (kind === 'audio') {
            await conn.sendMessage(targetJid, { audio: buffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: isV2 ? null : m });
            await conn.sendMessage(targetJid, { text: detailCaption }, { quoted: isV2 ? null : m });
        }

        if (isV2) {
            await m.reply(`✅ ${kind.toUpperCase()} view once berhasil diproses.\n📩 Hasil telah dikirim ke chat pribadi kamu.`);
        }
        await m.react('✅');

    } catch (err) {
        console.error('rvo-error:', err);
        m.reply('❌ Gagal memproses media. Coba lagi atau kirim ulang tanpa kompresi.');
    }
}

handler.help = ['rvo', 'rvo2']
handler.tags = ['tools']
handler.command = /^(rvo|readvo|readviewonce|rvo2|readvo2|readviewonce2)$/i

export default handler
