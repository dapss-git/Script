import { createCanvas, loadImage } from 'canvas'
import moment from 'moment-timezone'
import stats from '../../lib/datastat.js'

let handler = async (m, { conn, command }) => {
    const chatId = m.chat
    const tz = 'Asia/Jakarta'
    const now = moment().tz(tz)
    const isHourly = command === 'sh'
    
    await m.react('⏳')
    
    let rawData, title, infoLabel, maxBars, peakDate, peakMessagesDate
    
    if (isHourly) {
        const todayKey = now.format('YYYY-MM-DD')
        rawData = stats[chatId]?.hourly?.[todayKey] || Array(24).fill(0)
        title = "Hourly Report"
        infoLabel = `Realtime: ${now.format('HH:mm:ss')} WIB`
        maxBars = 24
    } else {
        const monthKey = now.format('YYYY-MM')
        rawData = stats[chatId]?.monthly?.[monthKey] || Array(32).fill(0)
        title = "Monthly Report"
        infoLabel = `Update: ${now.format('DD MMM YYYY - HH:mm:ss')} WIB`
        maxBars = now.daysInMonth()
    }

    peakMessagesDate = Math.max(...rawData)
    peakDate = rawData.indexOf(peakMessagesDate)

    let interval = 50
    if (peakMessagesDate > 300) interval = 100
    if (peakMessagesDate > 1000) interval = 250
    if (peakMessagesDate > 2500) interval = 500
    if (peakMessagesDate > 5000) interval = 1000
    if (peakMessagesDate > 10000) interval = 2000

    const currentScale = Math.max(300, Math.ceil(peakMessagesDate / interval) * interval)
    const yLabels = []
    for (let i = 0; i <= currentScale; i += interval) {
        yLabels.push(i)
    }

    const totalChat = rawData.reduce((a, b) => a + b, 0)
    const chatHariIni = isHourly ? totalChat : (rawData[now.date()] || 0)
    const groupMetadata = await conn.groupMetadata(chatId)

    const width = 1000, height = 850 
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, 280) 
    ctx.fillStyle = '#111111'; ctx.fillRect(0, 280, width, height - 280) 

    try {
        let pp = await conn.profilePictureUrl(chatId, 'image').catch(_ => 'https://telegra.ph/file/241d716298febc1d0b998.jpg')
        let imgPP = await loadImage(pp)
        ctx.save(); ctx.beginPath(); ctx.arc(110, 140, 80, 0, Math.PI * 2); ctx.clip()
        ctx.drawImage(imgPP, 30, 60, 160, 160); ctx.restore()
    } catch (e) {}

    ctx.textAlign = 'left'
    ctx.fillStyle = '#000000'; ctx.font = 'bold 38px sans-serif'
    ctx.fillText(groupMetadata.subject.substring(0, 30), 220, 100)
    ctx.font = '22px sans-serif'; ctx.fillStyle = '#666666'
    ctx.fillText(`${groupMetadata.participants.length} Members | ${title}`, 220, 140)
    ctx.fillStyle = '#6c5ce7'; ctx.font = 'bold 26px sans-serif'
    ctx.fillText(`TOTAL CHAT HARI INI: ${chatHariIni}`, 220, 195)
    ctx.fillStyle = '#333'; ctx.font = 'bold 18px sans-serif'
    ctx.fillText(infoLabel, 220, 225)

    const chartX = 100, chartY = 620, chartWidth = 830, maxBarH = 280
    const barW = (chartWidth / maxBars) - 5

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; ctx.lineWidth = 1; ctx.textAlign = 'right'; ctx.font = '14px sans-serif'
    yLabels.forEach(label => {
        const yPos = chartY - (label / currentScale) * maxBarH
        ctx.beginPath(); ctx.moveTo(chartX - 10, yPos); ctx.lineTo(chartX + chartWidth, yPos); ctx.stroke()
        ctx.fillStyle = '#888888'; ctx.fillText(label.toString(), chartX - 20, yPos + 5)
    })

    ctx.beginPath(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(108, 92, 231, 0.5)'
    for (let i = (isHourly ? 0 : 1); i <= (isHourly ? 23 : maxBars); i++) {
        const val = rawData[i] || 0
        const barH = (val / currentScale) * maxBarH
        const idx = isHourly ? i : i - 1
        const x = chartX + (idx * (barW + 5)) + (barW / 2)
        const y = chartY - barH
        if (i === (isHourly ? 0 : 1)) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
    }
    ctx.stroke()

    for (let i = (isHourly ? 0 : 1); i <= (isHourly ? 23 : maxBars); i++) {
        const val = rawData[i] || 0
        const barH = (val / currentScale) * maxBarH
        const idx = isHourly ? i : i - 1
        const xPos = chartX + (idx * (barW + 5))
        const isNow = isHourly ? i === now.hour() : i === now.date()
        
        ctx.fillStyle = isNow ? '#ff4757' : '#6c5ce7'
        ctx.fillRect(xPos, chartY - barH, barW, barH)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; ctx.fillRect(xPos, chartY - barH, barW, 5) 

        if (val > 0) {
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'
            ctx.fillText(val.toString(), xPos + (barW / 2), chartY - barH - 8)
        }
        ctx.fillStyle = isNow ? '#ffffff' : '#888888'
        ctx.font = '10px sans-serif'; ctx.fillText(i.toString(), xPos + (barW / 2), chartY + 25)
    }

    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 24px sans-serif'
    ctx.fillText('DATA REKAP & PEAK', 70, 710)
    ctx.font = '19px sans-serif'; ctx.fillStyle = '#aaaaaa'
    ctx.fillText(`• Peak Terpadat: ${isHourly ? 'Jam ' + peakDate + ':00' : 'Tanggal ' + peakDate} (${peakMessagesDate} Pesan)`, 70, 755)
    ctx.fillText(`• Rata-rata Chat: ${Math.round(totalChat / (isHourly ? 24 : now.date()))} pesan / hari`, 70, 790)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#6c5ce7'; ctx.font = 'bold 28px sans-serif'
    ctx.fillText('GROUP STATISTIC', width - 70, 750)
    ctx.font = '18px sans-serif'; ctx.fillStyle = '#888888'
    ctx.fillText(`Total: ${totalChat} Msg`, width - 70, 785)

    const buffer = canvas.toBuffer('image/png')
    const caption = `📊 *REKAP DATA GRUP*\n\n` +
                    `• *Total Chat Hari Ini:* ${chatHariIni}\n` +
                    `• *Peak:* ${isHourly ? 'Jam ' + peakDate + ':00' : 'Tanggal ' + peakDate} (${peakMessagesDate} Pesan)\n` +
                    `• *Total Chat:* ${totalChat}\n\n` +
                    `_Data diolah otomatis berdasarkan aktivitas grup._`

    await conn.sendMessage(chatId, { image: buffer, caption: caption }, { quoted: m })
    await m.react('✅')
}

handler.help = ['sh', 'sg']
handler.tags = ['group']
handler.command = /^(sg|sh|stat)$/i
handler.group = true

export default handler
