import similarity from 'similarity'
const threshold = 0.72 

export async function before(m) {
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/🎤 *TEBAK LIRIK LAGU* 🎤/i.test(m.quoted.text)) return true
    this.tebaklirik = this.tebaklirik ? this.tebaklirik : {}
    if (!(id in this.tebaklirik)) return true

    let answer = this.tebaklirik[id][1].result.jawaban.toLowerCase().trim()
    let userAns = m.text.toLowerCase().trim()

    if (userAns == answer) {
        global.db.data.users[m.sender].exp += this.tebaklirik[id][2]
        await m.reply(`✅ *BENAR!*\n\nJawabannya: *${this.tebaklirik[id][1].result.jawaban}*\nHadiah: +${this.tebaklirik[id][2]} Poin`)
        clearTimeout(this.tebaklirik[id][3])
        delete this.tebaklirik[id]
    } else if (similarity(userAns, answer) >= threshold) {
        m.reply(`⭐ *Dikit lagi, ayo inget-inget lagi liriknya!*`)
    }
    return true
}
