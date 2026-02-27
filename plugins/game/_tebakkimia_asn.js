export async function before(m) {
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/🧪 *TEBAK KIMIA* 🧪/i.test(m.quoted.text)) return true
    this.tebakkimia = this.tebakkimia ? this.tebakkimia : {}
    if (!(id in this.tebakkimia)) return true

    let answer = this.tebakkimia[id][1].result.lambang.toLowerCase().trim()
    let userAns = m.text.toLowerCase().trim()

    if (userAns == answer) {
        global.db.data.users[m.sender].exp += this.tebakkimia[id][2]
        await m.reply(`✅ *BENAR!*\n\nLambang unsur *${this.tebakkimia[id][1].result.unsur}* adalah *${this.tebakkimia[id][1].result.lambang}*\nHadiah: +${this.tebakkimia[id][2]} Poin`)
        clearTimeout(this.tebakkimia[id][3])
        delete this.tebakkimia[id]
    } else {
        // Biarin aja biar user lain bisa nebak kalau salah
    }
    return true
}
