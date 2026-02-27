
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*\n\nContoh:\n${usedPrefix + command} 10 + 10\n${usedPrefix + command} 100 x 5\n${usedPrefix + command} 50 / 2`)

    // Bersihkan teks agar simbol x jadi * dan ÷ jadi /
    let format = text
        .replace(/[^0-9\-\+\*\/\%\:\x\÷]/g, '')
        .replace(/x/g, '*')
        .replace(/÷/g, '/')
        .replace(/:/g, '/')

    if (!format) return m.reply('❌ Masukkan angka dan simbol matematika yang valid (+, -, *, /)')

    try {
        // Logika perhitungan otomatis
        let result = eval(format)
        
        let teks = `╔═══━━━━━━━ 🧮 ━━━━━━━═══╗\n`
        teks += `║       *SMART CALCULATOR* \n`
        teks += `╚═══━━━━━━━ 🧮 ━━━━━━━═══╝\n\n`
        teks += `📊 *SOAL:* ${text}\n`
        teks += `✨ *HASIL:* *${result.toLocaleString('id-ID')}*\n`
        teks += `───────────────────\n`
        teks += `_Dihitung otomatis oleh system._`

        await m.reply(teks)
    } catch (e) {
        m.reply('❌ Format matematika salah! Pastikan hanya angka dan simbol (+, -, x, /)')
    }
}

handler.help = ['calc', 'kalkulator']
handler.tags = ['tools']
// Support banyak command biar fleksibel
handler.command = /^(calc|kalkulator|hitung|math)$/i

export default handler
