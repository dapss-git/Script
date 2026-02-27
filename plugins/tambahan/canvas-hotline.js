import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input
    // Kita butuh dua teks yang dipisahkan oleh tanda pemisah, misal "|"
    let [t1, t2] = text.split('|')
    
    if (!t1 || !t2) return m.reply(`Format salah! ⚠️\n\nContoh: *${usedPrefix + command}* rest api abal-abal | api cuki biz id`)

    try {
        await m.react('⏳')
        
        // 2. URL API dengan API Key lo
        // Kita encodeURIComponent biar karakter unik kayak emoji atau spasi gak bikin error
        const apikey = 'cuki-x'
        const url = `https://api.cuki.biz.id/api/canvas/meme/hotline?apikey=${apikey}&text1=${encodeURIComponent(t1.trim())}&text2=${encodeURIComponent(t2.trim())}`

        // 3. Ambil hasil gambar dari API
        // Karena API canvas biasanya langsung ngirim gambar (buffer), kita pake responseType arraybuffer
        const response = await axios.get(url, { 
            headers: { 'x-api-key': apikey },
            responseType: 'arraybuffer' 
        })
        
        const buffer = Buffer.from(response.data, 'binary')

        // 4. Kirim ke Chat
        await conn.sendMessage(m.chat, { 
            image: buffer, 
            caption: `Nih meme pesenan lo, Bro! 😂\n\n🤖 *By GPT Asistent Ai*` 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply('❌ Waduh, GPT Asistent Ai gagal bikin meme. Pastikan teksnya gak kepanjangan ya!')
    }
}

handler.help = ['hotline <teks1> | <teks2>']
handler.tags = ['canvas']
handler.command = /^(hotline|drake)$/i

export default handler
