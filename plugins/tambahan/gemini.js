import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // BEBAS AKSES - NO REGISTER
    if (!text) return m.reply(`✨ Contoh: *${usedPrefix + command} Cuaca Jepara hari ini*`)

    let reactionLoop = true
    try {
        // --- ANIMASI REACTION: WAKTU -> DETIK (1-10) ---
        const startReaction = async () => {
            await m.react('⌛')
            await new Promise(r => setTimeout(r, 1000))

            let seconds = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
            let i = 0
            while (reactionLoop) {
                await m.react(seconds[i % seconds.length])
                i++
                await new Promise(r => setTimeout(r, 1000))
            }
        }
        startReaction()

        // --- LOGIKA REAL-TIME (WAKTU SEKARANG) ---
        let d = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}))
        let hari = d.toLocaleDateString('id-ID', { weekday: 'long' })
        let tanggal = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        let jam = d.toLocaleTimeString('id-ID')
        let realTimeContext = `Kamu adalah AI Gemini. Hari ini adalah ${hari}, ${tanggal}. Jam sekarang adalah ${jam} WIB. Gunakan data terbaru tahun 2026.`

        // --- FETCHING DATA API ---
        const response = await axios.get(`https://api.snowping.my.id/api/aichat/gemini`, {
            params: {
                q: text,
                // Kita gabungin instruksi ramah lo dengan konteks waktu sekarang
                inst: `${realTimeContext}. Jawab dengan ramah, lengkap, dan jangan terpotong.`
            }
        })

        reactionLoop = false // Stop animasi angka

        if (!response.data.result || !response.data.result.text) throw new Error("API Error")
        
        let hasil = response.data.result.text

        // --- KIRIM JAWABAN FULL ---
        await m.reply(hasil)
        
        await m.react('✅')

    } catch (e) {
        reactionLoop = false
        console.error(e)
        await m.react('❌')
        m.reply('❌ *( ERROR )* Gagal sinkronisasi waktu real-time. Coba lagi, Bro!')
    }
}

handler.help = ['ai2 <teks>', 'gemini <teks>']
handler.tags = ['ai']
handler.command = /^(ai2|gemini)$/i

export default handler
