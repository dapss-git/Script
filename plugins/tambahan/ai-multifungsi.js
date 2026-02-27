import axios from 'axios'
import FormData from 'form-data'
import path from 'path'
import fs from 'fs'

// ============== GEMINI AI FUNCTION ==============
async function geminiAI(text, mode = 'chat') {
  let d = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}))
  let hari = d.toLocaleDateString('id-ID', { weekday: 'long' })
  let tanggal = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  let jam = d.toLocaleTimeString('id-ID')
  
  let realTimeContext = `Kamu adalah AI Gemini yang pintar dan ramah. Hari ini adalah ${hari}, ${tanggal}. Jam sekarang adalah ${jam} WIB.`
  let instruction = ''
  
  if (mode === 'ocr') {
    instruction = `${realTimeContext}
    INGAT! JANGAN sebut kata "OCR" atau "hasil scan" atau "teks dari gambar" atau "berdasarkan teks"! 
    Langsung jawab pertanyaan berdasarkan teks yang diberikan.
    Anggap aja lo emang tau jawabannya.
    
    ❌ SALAH: "Berdasarkan teks dari gambar..."
    ❌ SALAH: "Hasil OCR menunjukkan..."
    
    ✅ BENAR: Langsung jawab!`
  } else if (mode === 'image_detection') {
    instruction = `${realTimeContext}
    Kamu adalah ahli deteksi gambar. User nanya tentang gambar yang dikirim.
    
    TUGAS KAMU:
    1. Deteksi ini gambar apa (anime, kartun, foto, lukisan, dll)
    2. Kalo anime: sebut judul anime, karakter, dan dari season apa
    3. Kalo kartun: sebut judul kartun/film
    4. Kalo foto biasa: deskripsikan aja
    5. Kalo lukisan: sebut judul lukisan & pelukisnya kalo tau
    
    JANGAN ngawur! Kalo ga tau bilang aja "Maaf ga tau"`
  } else if (mode === 'reply_text') {
    instruction = `${realTimeContext}
    User mereply pesan seseorang dan nambahin pertanyaan/pernyataan.
    Konteks pesan yang direply: 
    "${text.split('|||')[0]}"
    
    Pertanyaan/pernyataan user: 
    "${text.split('|||')[1]}"
    
    Pahami konteks pesan yang direply, lalu jawab pertanyaan user dengan relevan.
    JANGAN ngulang-ngulang pesan yang direply, langsung tanggapi aja.
    Kalo user minta dibuatkan sesuatu, buatkan!`
  } else {
    instruction = `${realTimeContext} Jawab dengan ramah, lengkap, dan jelas.`
  }

  const response = await axios.get(`https://api.snowping.my.id/api/aichat/gemini`, {
    params: {
      q: mode === 'reply_text' ? text.split('|||')[1] : text,
      inst: instruction
    }
  })
  
  return response.data.result.text
}

// ============== OCR FUNCTION ==============
async function ocrImage(imageUrl) {
  try {
    const encodedUrl = encodeURIComponent(imageUrl)
    const response = await axios.get(`https://api.deline.web.id/tools/ocr?url=${encodedUrl}`)
    return response.data.Text || response.data.text || ""
  } catch (error) {
    console.error('OCR Error:', error)
    return null
  }
}

// ============== UPLOAD TO TEMP URL ==============
async function uploadToTemp(buffer) {
  const form = new FormData()
  form.append('file', buffer, {
    filename: `image-${Date.now()}.jpg`,
    contentType: 'image/jpeg'
  })
  const response = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
    headers: {
      ...form.getHeaders()
    }
  })
  let url = response.data.data.url
  return url.replace('tmpfiles.org', 'tmpfiles.org/dl')
}

// ============== MAIN HANDLER - AI1 ==============
let handler = async (m, { conn, text, usedPrefix }) => {
  let reactionLoop = true
  
  try {
    // Animasi reaction
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

    // Cek quoted message (pesan yang direply)
    let q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    const isImage = /image/.test(mime)
    const isReplyText = !!m.quoted && !isImage // Mereply pesan teks
    
    // ============== MODE 1: REPLY PESAN TEKS ==============
    if (isReplyText) {
      const repliedMessage = m.quoted.text || ''
      const userQuestion = text || ''
      
      if (!userQuestion) {
        reactionLoop = false
        await m.reply(`❌ Kasih pertanyaan atau perintah dulu bro!\nContoh: .ai1 iya buatin dialog`)
        await m.react('❌')
        return
      }
      
      await m.react('💬')
      
      // Gabungin konteks pesan yang direply + pertanyaan user
      const promptText = `${repliedMessage}|||${userQuestion}`
      const aiResponse = await geminiAI(promptText, 'reply_text')
      
      reactionLoop = false
      await m.reply(aiResponse)
      await m.react('✅')
      return
    }
    
    // ============== MODE 2: TANPA GAMBAR & BUKAN REPLY ==============
    if (!isImage) {
      if (!text) {
        reactionLoop = false
        await m.reply(`✨ *AI1 - Multi Fungsi*\n\n` +
          `💬 *REPLY PESAN TEKS:*\n` +
          `➤ Reply pesan + .ai1 iya buatin dialog\n` +
          `➤ Reply pesan + .ai1 ini maksudnya apa?\n` +
          `➤ Reply pesan + .ai1 tolong jelasin\n\n` +
          `📸 *REPLY GAMBAR:*\n` +
          `➤ .ai1 (reply foto) - Baca teks\n` +
          `➤ .ai1 ini anime apa - Deteksi anime\n` +
          `➤ .ai1 judul film ini - Cari judul film\n\n` +
          `💬 *CHAT BIASA:*\n` +
          `➤ .ai1 halo\n` +
          `➤ .ai1 cuaca jakarta\n\n` +
          `🔥 *Otomatis detect mode!*`)
        await m.react('🤖')
        return
      }
      
      // Chat biasa
      const aiResponse = await geminiAI(text, 'chat')
      reactionLoop = false
      await m.reply(aiResponse)
      await m.react('✅')
      return
    }
    
    // ============== MODE 3: REPLY GAMBAR ==============
    await m.react('🔍')
    const buffer = await q.download()
    const imageUrl = await uploadToTemp(buffer)
    
    // Deteksi mode dari teks user
    const lowerText = text ? text.toLowerCase() : ''
    
    // MODE DETEKSI GAMBAR (anime/film/dll)
    if (text && (
      lowerText.includes('anime') || 
      lowerText.includes('film') || 
      lowerText.includes('movie') || 
      lowerText.includes('kartun') || 
      lowerText.includes('judul') || 
      lowerText.includes('karakter') || 
      lowerText.includes('tokoh') || 
      lowerText.includes('gambar apa') || 
      lowerText.includes('ini apa') ||
      lowerText.includes('ini siapa')
    )) {
      await m.react('🎯')
      const aiResponse = await geminiAI(`Lihat gambar ini. Pertanyaan user: ${text}`, 'image_detection')
      
      reactionLoop = false
      await m.reply(aiResponse)
      await m.react('✅')
      return
    }
    
    // MODE OCR (baca teks)
    const ocrText = await ocrImage(imageUrl)
    
    if (ocrText && ocrText.trim() !== '') {
      let promptText
      if (text) {
        promptText = `Teks dari gambar: "${ocrText}"\n\nPertanyaan user: ${text}\n\nJAWAB LANGSUNG! JANGAN sebut OCR!`
      } else {
        promptText = `Teks dari gambar: "${ocrText}"\n\nJelaskan isi teks ini secara singkat. JANGAN sebut OCR!`
      }
      
      const aiResponse = await geminiAI(promptText, 'ocr')
      reactionLoop = false
      await m.reply(aiResponse)
      await m.react('✅')
      
    } else {
      // OCR gagal -> deteksi gambar biasa
      let promptText
      if (text) {
        promptText = `Deskripsikan gambar ini. Pertanyaan user: ${text}`
      } else {
        promptText = `Deskripsikan gambar ini secara detail. Ini gambar apa? Kalo anime sebut judulnya.`
      }
      
      const aiResponse = await geminiAI(promptText, 'image_detection')
      reactionLoop = false
      await m.reply(aiResponse)
      await m.react('✅')
    }

  } catch (e) {
    reactionLoop = false
    console.error(e)
    await m.react('❌')
    m.reply(`❌ *Error:* ${e.message || 'Coba lagi bro!'}`)
  }
}

handler.help = ['ai1']
handler.tags = ['ai']
handler.command = /^(ai1)$/i

export default handler