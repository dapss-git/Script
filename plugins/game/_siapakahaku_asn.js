import similarity from 'similarity'
const threshold = 0.72 

export async function before(m) {
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/🤔 *SIAPAKAH AKU?* 🤔/i.test(m.quoted.text)) return true
    this.siapakahaku = this.siapakahaku ? this.siapakahaku : {}
    if (!(id in this.siapakahaku)) return true

    let answer = this.siapakahaku[id][1].result.jawaban.toLowerCase().trim()
    let userAns = m.text.toLowerCase().trim()

    if (userAns == answer) {
        global.db.data.users[m.sender].exp += this.siapakahaku[id][2]
        await m.reply(`✅ *BENAR!*\n\nJawabannya adalah: *${this.siapakahaku[id][1].result.jawaban}*\nHadiah: +${this.siapakahaku[id][2]} Poin`)
        clearTimeout(this.siapakahaku[id][3])
        delete this.siapakahaku[id]
    } else if (similarity(userAns, answer) >= threshold) {
        m.reply(`⭐ *Dikit lagi, hampir bener!*`)
    }
    return true
}
