// 🔥® Rin-Okumura™ 🔥
// 👿 Creator: Dafa & Gemini
// ⚡ Plugin: tagall.mjs

let handler = async (m, { conn, text, participants, isAdmin, isOwner }) => {
    // Hanya bisa dipakai di grup
    if (!m.isGroup) return global.dfail('group', m, conn)
    
    // Hanya admin atau owner yang bisa tagall (biar nggak disalahgunakan member iseng)
    if (!(isAdmin || isOwner)) return global.dfail('admin', m, conn)

    let teks = `╔═══━━━━━━━ 📢 ━━━━━━━═══╗\n`
    teks += `║           *TAG ALL MEMBERS* \n`
    teks += `╚═══━━━━━━━ 📢 ━━━━━━━═══╝\n\n`
    
    // Jika ada pesan tambahan dari lo (misal: .tagall bangun woi)
    teks += `💬 *PESAN:* ${text ? text : 'Tanpa Pesan'}\n\n`
    teks += `┌───────────────────\n`

    // Logika mengambil semua JID member
    for (let mem of participants) {
        teks += `│ ◦ @${mem.id.split('@')[0]}\n`
    }
    
    teks += `└───────────────────\n\n`
    teks += `_Total: ${participants.length} Member_`

    // Mengirim pesan dengan mention aktif (tag biru)
    await conn.sendMessage(m.chat, {
        text: teks,
        mentions: participants.map(a => a.id)
    }, { quoted: m })
}

handler.help = ['tagall <pesan>']
handler.tags = ['group']
handler.command = /^(tagall|everyone|semua)$/i

handler.group = true // Pastikan hanya di grup
handler.admin = true // Batasi hanya untuk admin

export default handler
