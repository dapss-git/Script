import similarity from 'similarity'
const threshold = 0.72 

export async function before(m) {
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/🕌 *KUIS ISLAMI* 🕌/i.test(m.quoted.text)) return true
    this.islamic = this.islamic ? this.islamic : {}
    if (!(id in this.islamic)) return true

    let answer = this.islamic[id][1].result.jawaban.toLowerCase().trim()
    let userAns = m.text.toLowerCase().trim()

    if (userAns == answer) {
        global.db.data.users[m.sender].exp += this.islamic[id][2]
        await m.reply(`✅ *BENAR!*\n\nHadiah: +${this.islamic[id][2]} Poin`)
        clearTimeout(this.islamic[id][3])
        delete this.islamic[id]
    } else if (similarity(userAns, answer) >= threshold) {
        m.reply(`⭐ *Dikit lagi, ayo fokus!*`)
    }
    return true
}
