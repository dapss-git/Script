import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!text) return m.reply(`Mau tanya apa ke Venice AI? \n\nContoh: *${usedPrefix + command} Siapa pahlawan dari Jawa Barat?*`)

    try {
        await m.react('🔍')
        
        const apikey = 'cuki-x'
        const url = `https://api.cuki.biz.id/api/ai/venice?apikey=${apikey}&prompt=${encodeURIComponent(text)}`

        // 2. Request ke API Cuki (Venice AI)
        let { data: res } = await axios.get(url, {
            headers: { 'x-api-key': apikey }
        })

        if (res.statusCode !== 200 || !res.results) {
            return m.reply(`❌ Aduh, Venice AI lagi nggak bisa jawab. Coba tanya hal lain!`)
        }

        const hasil = res.results

        // 3. Susun Teks Jawaban
        let caption = `*───〔 VENICE AI RESEARCH 〕───*\n\n`
        caption += `${hasil.result}\n\n`
        
        // Tambahkan referensi jika ada
        if (hasil.references && hasil.references.length > 0) {
            caption += `📚 *Sumber Referensi:*\n`
            hasil.references.slice(0, 3).forEach((ref, i) => {
                caption += `${i + 1}. ${ref.title}\n🔗 _${ref.url}_\n\n`
            })
        }

        caption += `🤖 *Venice Ai*`

        // 4. Kirim ke Chat
        await conn.reply(m.chat, caption, m)
        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply(`❌ Gagal terhubung ke Venice AI. Mungkin otak robotnya lagi kepanasan!`)
    }
}

handler.help = ['venice <pertanyaan>']
handler.tags = ['ai']
handler.command = /^(venice|tanyaai|riset)$/i

export default handler
