import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'database', 'userstat.json')

if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

let userStats = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {}

export const saveUserStats = () => {
    fs.writeFileSync(filePath, JSON.stringify(userStats, null, 2))
}

export default userStats
