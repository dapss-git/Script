import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'

const filePath = path.join(process.cwd(), 'database', 'stats-all.json')

if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

let stats = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {}

export const saveStats = () => {
    const tz = 'Asia/Jakarta'
    const today = moment().tz(tz).format('YYYY-MM-DD')
    const currentMonth = moment().tz(tz).format('YYYY-MM')
    
    Object.keys(stats).forEach(chatId => {
        if (stats[chatId].hourly) {
            Object.keys(stats[chatId].hourly).forEach(date => {
                if (date !== today) delete stats[chatId].hourly[date]
            })
        }
        if (stats[chatId].monthly) {
            Object.keys(stats[chatId].monthly).forEach(month => {
                if (month !== currentMonth) delete stats[chatId].monthly[month]
            })
        }
    })

    fs.writeFileSync(filePath, JSON.stringify(stats, null, 2))
}

export default stats
