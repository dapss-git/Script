import similarity from 'similarity'
const threshold = 0.72 // Tingkat kemiripan jawaban

export async function before(m) {
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/🧩 *ASAH OTAK* 🧩/i.test(m.quoted.text)) return true
    this.asahotak = this.asahotak ? this.asahotak : {}
    if (!(id in this.asahotak)) return true

    if (m.text.toLowerCase() == this.asahotak[id][1].result.jawaban.toLowerCase().trim()) {
        global.db.data.users[m.sender].exp += this.asahotak[id][2]
        await m.reply(`✅ *BENAR!*\n\nJawaban: ${this.asahotak[id][1].result.jawaban}\nHadiah: +${this.asahotak[id][2]} Poin`)
        clearTimeout(this.asahotak[id][3])
        delete this.asahotak[id]
    } else if (similarity(m.text.toLowerCase(), this.asahotak[id][1].result.jawaban.toLowerCase().trim()) >= threshold) {
        m.reply(`⭐ *Dikit lagi!*`)
    } else {
        // m.reply('❌ *Salah!*') // Opsional kalau mau bot respon pas salah
    }
    return true
}
