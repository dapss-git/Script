import { createCanvas, loadImage } from 'canvas'
import moment from 'moment-timezone'
import stats from '../../lib/datastat.js'

let handler = async (m, { conn, command }) => {
    const chatId = m.chat
    const tz = 'Asia/Jakarta'
    const now = moment().tz(tz)
    const isHourly = command === 'shg'
    
    await m.react('📉')
    
    let rawData, title, infoLabel, maxBars, peakDate, peakMessagesDate
    
    if (isHourly) {
        const todayKey = now.format('YYYY-MM-DD')
        rawData = stats[chatId]?.hourly?.[todayKey] || Array(24).fill(0)
        title = "Hourly Line Graphic"
        infoLabel = `Realtime: ${now.format('HH:mm:ss')} WIB`
        maxBars = 24
    } else {
        const monthKey = now.format('YYYY-MM')
        rawData = stats[chatId]?.monthly?.[monthKey] || Array(32).fill(0)
        title = "Group Line Graphic"
        infoLabel = `Update: ${now.format('DD MMM YYYY')} WIB`
        maxBars = now.daysInMonth()
    }

    peakMessagesDate = Math.max(...rawData)
    peakDate = rawData.indexOf(peakMessagesDate)
    const totalChat = rawData.reduce((a, b) => a + b, 0)

    let interval = 50
    if (peakMessagesDate > 300) interval = 100
    if (peakMessagesDate > 1000) interval = 250
    const currentScale = Math.max(300, Math.ceil(peakMessagesDate / interval) * interval)
    const yLabels = []
    for (let i = 0; i <= currentScale; i += interval) yLabels.push(i)

    const width = 1000, height = 800 
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#0a0a0f'; ctx.fillRect(0, 0, width, height)

    const chartX = 100, chartY = 600, chartWidth = 830, maxBarH = 400
    const barSpacing = chartWidth / (maxBars - 1)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'; ctx.lineWidth = 1; ctx.textAlign = 'right'; ctx.font = '13px monospace'
    yLabels.forEach(label => {
        const yPos = chartY - (label / currentScale) * maxBarH
        ctx.beginPath(); ctx.moveTo(chartX, yPos); ctx.lineTo(chartX + chartWidth, yPos); ctx.stroke()
        ctx.fillStyle = '#444'; ctx.fillText(label.toString(), chartX - 15, yPos + 5)
    })

    ctx.beginPath()
    let grd = ctx.createLinearGradient(0, chartY - maxBarH, 0, chartY)
    grd.addColorStop(0, 'rgba(108, 92, 231, 0.15)')
    grd.addColorStop(1, 'rgba(108, 92, 231, 0)')
    ctx.fillStyle = grd
    for (let i = 0; i < maxBars; i++) {
        const val = rawData[isHourly ? i : i + 1] || 0
        const x = chartX + (i * barSpacing)
        const y = chartY - (val / currentScale) * maxBarH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
    }
    ctx.lineTo(chartX + chartWidth, chartY); ctx.lineTo(chartX, chartY); ctx.closePath(); ctx.fill()

    ctx.beginPath()
    ctx.lineWidth = 3 
    ctx.strokeStyle = '#8271ff' 
    ctx.lineJoin = 'round'
    for (let i = 0; i < maxBars; i++) {
        const val = rawData[isHourly ? i : i + 1] || 0
        const x = chartX + (i * barSpacing)
        const y = chartY - (val / currentScale) * maxBarH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
    }
    ctx.stroke()

    for (let i = 0; i < maxBars; i++) {
        const val = rawData[isHourly ? i : i + 1] || 0
        const x = chartX + (i * barSpacing)
        const y = chartY - (val / currentScale) * maxBarH
        const isNow = isHourly ? i === now.hour() : (i + 1) === now.date()
        
        ctx.save()
        ctx.fillStyle = isNow ? '#ff4757' : '#8271ff'
        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, Math.PI * 2) 
        ctx.fill()
        if (isNow || val === peakMessagesDate) {
            ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle; ctx.fill()
        }
        ctx.restore()
    }

    ctx.textAlign = 'center'; ctx.fillStyle = '#666'; ctx.font = '11px monospace'
    for (let i = 0; i < maxBars; i += (isHourly ? 2 : 3)) {
        ctx.fillText((isHourly ? i : i + 1).toString(), chartX + (i * barSpacing), chartY + 30)
    }

    ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = 'bold 28px sans-serif'
    ctx.fillText(title, 100, 100)
    ctx.font = '15px monospace'; ctx.fillStyle = '#8271ff'
    ctx.fillText(infoLabel, 100, 130)

    ctx.textAlign = 'right'; ctx.font = 'bold 18px sans-serif'; ctx.fillStyle = '#ff4757'
    ctx.fillText(`PEAK: ${peakMessagesDate} MSG`, width - 70, 100)

    const buffer = canvas.toBuffer('image/png')

    // --- CAPTION NYA DISINI FA ---
    const caption = `📈 *STATISTIK GRAFIK LINE*\n\n` +
                    `• *Total Chat:* ${totalChat.toLocaleString()} pesan\n` +
                    `• *Puncak:* ${peakMessagesDate} chat pada ${isHourly ? 'Jam ' + peakDate + ':00' : 'Tanggal ' + peakDate}\n` +
                    `• *Waktu:* ${infoLabel}\n\n` +
                    `_Data divisualisasikan secara otomatis._`

    await conn.sendMessage(chatId, { image: buffer, caption: caption }, { quoted: m })
}

handler.help = ['shg', 'sgg']
handler.tags = ['group']
handler.command = /^(shg|sgg)$/i
handler.group = true

export default handler
