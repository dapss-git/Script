import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'database', 'uid_list.json')

if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

// Fungsi Export harus pake nama 'getUIDData'
export const getUIDData = () => {
    try {
        if (!fs.existsSync(filePath)) return []
        let data = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(data)
    } catch (e) {
        return []
    }
}

export const saveUID = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}
