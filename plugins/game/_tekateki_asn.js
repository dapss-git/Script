import similarity from 'similarity'
const threshold = 0.72 

export async function before(m) {
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/🤣 *TEKA-TEKI LUCU* 🤣/i.test(m.quoted.text)) return true
    this.tekateki = this.tekateki ? this.tekateki : {}
    if (!(id in this.tekateki)) return true

    let answer = this.tekateki[id][1].result.jawaban.toLowerCase().trim()
    let userAns = m.text.toLowerCase().trim()

    if (userAns == answer) {
        global.db.data.users[m.sender].exp += this.tekateki[id][2]
        await m.reply(`✅ *BENAR!*\n\nJawabannya: *${this.tekateki[id][1].result.jawaban}*\nHadiah: +${this.tekateki[id][2]} Poin`)
        clearTimeout(this.tekateki[id][3])
        delete this.tekateki[id]
    } else if (similarity(userAns, answer) >= threshold) {
        m.reply(`⭐ *Dikit lagi, hampir bener!*`)
    }
    return true
}
