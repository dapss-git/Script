// 🔥® Rin-Okumura™ 🔥
// 👿 Creator: Dafa & Gemini
// ⚡ Plugin: join.js

let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [_, code] = text.match(linkRegex) || []
    if (!code) return m.reply(`*Format salah!* \nContoh: ${usedPrefix + command} https://chat.whatsapp.com/xxxxxx`)

    await m.reply('_Sedang mencoba bergabung ke grup..._')

    try {
        // Cek info grup dulu sebelum join
        let res = await conn.groupGetInviteInfo(code)
        
        // Eksekusi Join
        let joinRes = await conn.groupAcceptInvite(code)
        
        // Logika pengecekan status masuk
        if (joinRes === undefined || joinRes === 'invite_sent') {
            let teksPrivasi = `╔═══━━━━━━━ 🔒 ━━━━━━━═══╗\n`
            teksPrivasi += `║     *WAITING APPROVAL* \n`
            teksPrivasi += `╚═══━━━━━━━ 🔒 ━━━━━━━═══╝\n\n`
            teksPrivasi += `⚠️ *Grup:* ${res.subject}\n`
            teksPrivasi += `📝 *Status:* Grup diprivasi oleh Admin.\n\n`
            teksPrivasi += `Bot telah mengirim permintaan bergabung.\n`
            teksPrivasi += `_Tunggu sampai disetujui atau ditolak._`
            
            return m.reply(teksPrivasi)
        } else {
            let teksSukses = `╔═══━━━━━━━ ✅ ━━━━━━━═══╗\n`
            teksSukses += `║      *JOIN SUCCESS* \n`
            teksSukses += `╚═══━━━━━━━ ✅ ━━━━━━━═══╝\n\n`
            teksSukses += `✅ Berhasil masuk ke grup:\n`
            teksSukses += `┌  ◦ *Nama:* ${res.subject}\n`
            teksSukses += `└  ◦ *ID:* ${res.id}\n\n`
            teksSukses += `_Halo semuanya! Saya adalah bot Rin-Okumura._`
            
            return m.reply(teksSukses)
        }

    } catch (e) {
        console.log(e)
        m.reply('❌ *Gagal bergabung!* \nPastikan link grup benar dan bot tidak di-kick dari grup tersebut sebelumnya.')
    }
}

handler.help = ['join <link>']
handler.tags = ['owner']
handler.command = /^join$/i
handler.rowner = true // Khusus Dafa (Owner)

export default handler
