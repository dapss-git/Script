import similarity from 'similarity'
const threshold = 0.72 

export async function before(m) {
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/😆 *TEBAK-TEBAKAN RECEH* 😆/i.test(m.quoted.text)) return true
    this.tebaktebakan = this.tebaktebakan ? this.tebaktebakan : {}
    if (!(id in this.tebaktebakan)) return true

    let answer = this.tebaktebakan[id][1].result.jawaban.toLowerCase().trim()
    let userAns = m.text.toLowerCase().trim()

    if (userAns == answer) {
        global.db.data.users[m.sender].exp += this.tebaktebakan[id][2]
        await m.reply(`✅ *BENAR!*\n\nJawabannya: *${this.tebaktebakan[id][1].result.jawaban}*\nHadiah: +${this.tebaktebakan[id][2]} Poin`)
        clearTimeout(this.tebaktebakan[id][3])
        delete this.tebaktebakan[id]
    } else if (similarity(userAns, answer) >= threshold) {
        m.reply(`⭐ *Dikit lagi! Jawaban lo hampir pas.*`)
    }
    return true
}
