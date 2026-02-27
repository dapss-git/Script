let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`💡 *Contoh Pakai:* \n〉${usedPrefix + command} Pilih warna|Merah|Biru|sekali`)

    let a = text.split('|')
    if (a.length < 3) return m.reply('❌ Minimal harus ada pertanyaan dan 2 pilihan jawaban!')

    // Ambil kata paling terakhir buat nentuin tipe
    let tipe = a[a.length - 1].toLowerCase().trim()
    let question = a[0].trim()
    let options = []
    let selectableCount = 1

    if (tipe === 'lebih') {
        // Bisa pilih lebih dari satu (sampai semua opsi)
        options = a.slice(1, -1) 
        selectableCount = options.length 
    } else if (tipe === 'sekali') {
        // Cuma bisa pilih salah satu
        options = a.slice(1, -1)
        selectableCount = 1
    } else {
        // Kalau ga ngetik sekali/lebih, defaultnya cuma bisa pilih satu
        options = a.slice(1)
        selectableCount = 1
    }

    let pollOptions = options.map(v => v.trim()).filter(v => v !== '')

    await conn.sendMessage(m.chat, {
        poll: {
            name: `*📊 [ POLLING ]*\n\n${question}`,
            values: pollOptions,
            selectableCount: selectableCount
        }
    })
}

handler.help = ['polling text|jawab|jawab|tipe']
handler.tags = ['group']
handler.command = /^(poll|polling)$/i
handler.group = true

export default handler
