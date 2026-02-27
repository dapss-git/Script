// 🔥® Rin-Okumura™ 🔥
// 👿 Creator: Dafa & Gemini
// ⚡ Plugin: jam_asia.mjs

let handler = async (m, { conn }) => {
    // Fungsi dapetin waktu + Logika Sapaan per negara
    const getWaktuDetail = (zona) => {
        let options = {
            timeZone: zona,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }
        let formatter = new Intl.DateTimeFormat('id-ID', options)
        let parts = formatter.formatToParts(new Date())
        let jam = parseInt(parts.find(p => p.type === 'hour').value)
        let menit = parts.find(p => p.type === 'minute').value
        let detik = parts.find(p => p.type === 'second').value
        
        // Logika Siang/Malam berdasarkan jam zona tersebut
        let keadaan = "Malam"
        if (jam >= 4 && jam < 11) keadaan = "Pagi"
        if (jam >= 11 && jam < 15) keadaan = "Siang"
        if (jam >= 15 && jam < 18) keadaan = "Sore"
        
        return `${jam}:${menit}:${detik} ${keadaan}`
    }

    const d = new Date()
    const locale = 'id-ID'
    const hari = d.toLocaleDateString(locale, { weekday: 'long' })
    const tanggal = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })

    let teks = `╔═══━━━━━━━ 🌏 ━━━━━━━═══╗\n`
    teks += `║      *ASIAN REALTIME CLOCK* \n`
    teks += `╚═══━━━━━━━ 🌏 ━━━━━━━═══╝\n\n`
    teks += `📅 *${hari.toUpperCase()}, ${tanggal.toUpperCase()}*\n`
    teks += `───────────────────\n\n`
    
    // --- INDONESIA ---
    teks += `🇮🇩 *INDONESIA (WIB):* \n`
    teks += `└─ *${getWaktuDetail("Asia/Jakarta")}*\n\n`
    
    teks += `🇮🇩 *INDONESIA (WITA):* \n`
    teks += `└─ *${getWaktuDetail("Asia/Makassar")}*\n\n`
    
    teks += `🇮🇩 *INDONESIA (WIT):* \n`
    teks += `└─ *${getWaktuDetail("Asia/Jayapura")}*\n\n`
    
    teks += `───────────────────\n\n`

    // --- ASIA LAINNYA ---
    teks += `🇲🇾 *MALAYSIA:* \n`
    teks += `└─ *${getWaktuDetail("Asia/Kuala_Lumpur")}*\n\n`
    
    teks += `🇯🇵 *JEPANG:* \n`
    teks += `└─ *${getWaktuDetail("Asia/Tokyo")}*\n\n`
    
    teks += `🇸🇦 *ARAB SAUDI:* \n`
    teks += `└─ *${getWaktuDetail("Asia/Riyadh")}*\n\n`
    
    teks += `🇵🇸 *PALESTINA:* \n`
    teks += `└─ *${getWaktuDetail("Asia/Gaza")}*\n\n`
    
    teks += `───────────────────\n`
    teks += `_Waktu otomatis terupdate._`

    conn.sendMessage(m.chat, {
        text: teks,
        contextInfo: {
            externalAdReply: {
                title: "ZONA WAKTU REALTIME",
                body: `${hari}, ${tanggal}`,
                thumbnailUrl: "https://telegra.ph/file/24fa902ead26340f3df2c.png",
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: m })
}

// --- LOGIKA MULTI-PREFIX & NO PREFIX ---
handler.all = async function (m) {
    if (!m.text) return
    const commands = ['jam', 'wib', 'wita', 'wit', 'waktu']
    let text = m.text.toLowerCase().trim()
    let isCommand = false

    for (let cmd of commands) {
        let reg = new RegExp(`^[\\.\\/\\!\\#\\, ]?${cmd}$`, 'i')
        if (reg.test(text)) {
            isCommand = true
            break
        }
    }

    if (isCommand) {
        await handler(m, { conn: this })
    }
}

handler.help = ['jam', 'wib', 'wita', 'wit']
handler.tags = ['tools']
handler.command = /^(jam|wib|wita|wit|waktu)$/i

export default handler
