import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Cek input user
  if (!text) return m.reply(`Ada yang bisa **GPT Asistent Ai** bantu? \n\nContoh: *${usedPrefix + command} Apa itu Bot WhatsApp?*`)

  try {
    // Reaksi robot
    await m.react('🤖')

    // Prompt dengan nama baru: GPT Asistent Ai
    let personalitas = "Nama lo adalah GPT Asistent Ai. Lo adalah asisten cerdas yang sigap, ramah, dan solutif di WhatsApp. Gunakan gaya bahasa yang mudah dimengerti dan santai."
    
    // Panggil API Cuki
    let res = await fetch(`https://api.cuki.biz.id/api/ai/gpt?apikey=cuki-x&question=${encodeURIComponent(text)}&prompt=${encodeURIComponent(personalitas)}`, {
      headers: { 'x-api-key': 'cuki-x' }
    })
    
    let json = await res.json()

    if (json.statusCode === 200) {
      // Kirim hasil jawaban
      await conn.reply(m.chat, json.results, m)
    } else {
      throw 'API bermasalah'
    }

  } catch (e) {
    console.log(e)
    m.reply('Maaf, GPT Asistent Ai lagi ada gangguan koneksi. Coba lagi bentar ya!')
  }
}

// Pengaturan Trigger (Prefix)
handler.help = ['ai', 'gpt']
handler.tags = ['ai']
handler.command = ['ai', 'gpt', 'tanya'] // Bisa dipanggil pake .ai atau .gpt

export default handler
