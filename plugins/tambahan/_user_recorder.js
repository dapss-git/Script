import userStats, { saveUserStats } from '../../lib/userstat.js'

export async function before(m) {
    if (!m.isGroup || m.fromMe || m.isBaileys) return 

    const chatId = m.chat
    const userId = m.sender

    if (!userStats[chatId]) userStats[chatId] = {}
    if (!userStats[chatId][userId]) userStats[chatId][userId] = 0

    userStats[chatId][userId] += 1
    
    saveUserStats()
    return true
}
