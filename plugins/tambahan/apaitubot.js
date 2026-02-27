/**
 * Plugin: Edukasi Apa Itu Bot (No Prefix)
 * Deskripsi: Menjelaskan definisi bot menggunakan teks dari user.
 */

let handler = async (m, { conn }) => {
  let penjelasan = `
🤖 *Apa Itu WhatsApp Bot?*
Sederhananya, Bot WhatsApp adalah Robot Virtual atau Pesan Otomatis.
Kalau WhatsApp biasa itu lo yang bales manual, kalau Bot itu ada "robot" yang standby 24 jam di nomor itu buat ngejalanin perintah apa pun yang lo suruh lewat chat.

📝 *Singkatan & Istilah Gampang*
BOT: Berasal dari kata Robot. Artinya sesuatu yang bekerja otomatis tanpa perlu digerakkan manusia terus-menerus.
COMMAND (Perintah): Kata kunci yang lo kirim ke bot. Ini ibarat lo manggil si robot buat kerja.
PREFIX: Tanda awalan sebelum perintah (seperti . atau /). Gunanya biar si robot tahu kalau lo lagi nyuruh dia.

💡 *Ibaratnya Seperti Apa?*
Bayangin Bot WhatsApp itu kayak Pelayan Toko atau Asisten Pribadi:
Lo nggak perlu nyari lagu sendiri di YouTube, tinggal bilang ke si "pelayan" lewat chat. Si pelayan (Bot) langsung lari nyari lagunya, terus nganterin file audionya ke chat lo.

🚀 *Apa Kehebatannya?*
Nggak Pernah Tidur (24 Jam), Serba Bisa (Stiker, Download, Anti-Link), dan Cerdas (Tersambung AI).

📁 *Jadi, Kenapa Orang Pake Bot?*
Buat mempersingkat waktu. Sekali klik, barangnya dateng tanpa ribet buka Chrome atau nunggu iklan.
`.trim()

  await conn.reply(m.chat, penjelasan, m)
}

// Pengaturan agar terpanggil tanpa prefix
handler.customPrefix = /^(apa itu bot|apa itu wa bot|infobot|penjelasan bot)$/i 
handler.command = new RegExp

export default handler
