import similarity from 'similarity'
const threshold = 0.72 

export async function before(m) {
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/🔠 *SUSUN KATA* 🔠/i.test(m.quoted.text)) return true
    this.susunkata = this.susunkata ? this.susunkata : {}
    if (!(id in this.susunkata)) return true

    let answer = this.susunkata[id][1].result.jawaban.toLowerCase().trim()
    let userAns = m.text.toLowerCase().trim()

    if (userAns == answer) {
        global.db.data.users[m.sender].exp += this.susunkata[id][2]
        await m.reply(`✅ *BENAR!*\n\nSusunan kata: *${this.susunkata[id][1].result.jawaban}*\nHadiah: +${this.susunkata[id][2]} Poin`)
        clearTimeout(this.susunkata[id][3])
        delete this.susunkata[id]
    } else if (similarity(userAns, answer) >= threshold) {
        m.reply(`⭐ *Dikit lagi, ayo dikit lagi bener!*`)
    }
    return true
}
