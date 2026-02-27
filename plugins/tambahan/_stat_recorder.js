import stats, { saveStats } from '../../lib/datastat.js'
import moment from 'moment-timezone'

export async function before(m) {
    if (!m.isGroup || m.fromMe || m.isBaileys) return   

    const chatId = m.chat
    const tz = 'Asia/Jakarta'
    const today = moment().tz(tz).format('YYYY-MM-DD')
    const month = moment().tz(tz).format('YYYY-MM')
    const hour = moment().tz(tz).hour()
    const date = moment().tz(tz).date()

    if (!stats[chatId]) stats[chatId] = { hourly: {}, monthly: {} }
    
    if (!stats[chatId].hourly[today]) stats[chatId].hourly[today] = Array(24).fill(0)
    stats[chatId].hourly[today][hour] += 1

    if (!stats[chatId].monthly[month]) stats[chatId].monthly[month] = Array(32).fill(0)
    stats[chatId].monthly[month][date] += 1
    
    saveStats() 
    return true
}
