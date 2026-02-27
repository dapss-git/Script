// 🔥® Rin-Okumura™ 🔥
// 👿 Creator: Dafa & Gemini
// ⚡ Plugin: out.mjs

let handler = async (m, { conn, usedPrefix, command }) => {
    // --- UI PESAN PAMITAN ---
    let teks = `╔═══━━━━━━━ 👋 ━━━━━━━═══╗\n`
    teks += `║       *BOT LEAVE GROUP* \n`
    teks += `╚═══━━━━━━━ 👋 ━━━━━━━═══╝\n\n`
    teks += `Maaf semuanya, sepertinya tugas\n`
    teks += `saya di grup ini sudah selesai.\n\n`
    teks += `*Dafa* (Owner) memerintahkan saya\n`
    teks += `untuk keluar dari grup ini.\n\n`
    teks += `👋 *SAYONARA MINNA-SAN!* \n`
    teks += `───────────────────\n`
    teks += `_Bot otomatis keluar dalam 3 detik..._`

    await m.reply(teks)
    
    // Kasih delay 3 detik biar member sempet baca pesan pamitannya
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Eksekusi keluar dari grup
    await conn.groupLeave(m.chat)
}

handler.help = ['out', 'leave']
handler.tags = ['owner']
handler.command = /^(out|leave|keluar)$/i

handler.owner = true // ⚠️ WAJIB! Biar cuma lo yang bisa ngusir botnya
handler.group = true // Hanya bisa dijalankan di dalam grup

export default handler
