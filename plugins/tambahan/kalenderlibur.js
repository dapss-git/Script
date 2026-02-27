import axios from 'axios'

let handler = async (m, { conn }) => {
    await m.react('🗓️')
    
    try {
        let res = await axios.get('https://api.nexray.web.id/information/hari-libur')
        let json = res.data

        if (!json.status) return m.reply('⚠️ Gagal mengambil data kalender.')

        const { hari_ini, mendatang, statistik } = json.result
        
        let teks = `🇮🇩 *INFORMASI KALENDER 2026*\n`
        teks += `───────────────────\n\n`

        // 1. EVENT HARI INI
        teks += `📌 *HARI INI (${hari_ini.tanggal})*\n`
        if (hari_ini.events.length > 0) {
            hari_ini.events.forEach(ev => {
                teks += ` • ${ev.event}\n`
            })
        } else {
            teks += ` • Tidak ada hari peringatan khusus.\n`
        }
        teks += `\n`

        // 2. DAFTAR HARI LIBUR NASIONAL (2026)
        teks += `🚩 *LIBUR NASIONAL MENDATANG*\n`
        mendatang.hari_libur.slice(0, 5).forEach(hl => {
            teks += ` • ${hl.date}: ${hl.event} (*${hl.daysUntil} Hari Lagi*)\n`
        })
        teks += `\n`

        // 3. STATISTIK TAHUNAN
        teks += `📊 *RINGKASAN TAHUN 2026*\n`
        teks += ` ◦ Total Hari Libur: ${statistik.total_hari_libur}\n`
        teks += ` ◦ Total Hari Nasional: ${statistik.total_hari_nasional}\n`
        teks += ` ◦ Total Seluruh Event: ${statistik.total_event}\n\n`
        
        teks += `_Source: NexRay API Information_`

        await conn.reply(m.chat, teks, m)
        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply('❌ Terjadi kesalahan pada server data kalender.')
    }
}

handler.help = ['kalender', 'libur']
handler.tags = ['info']
handler.command = /^(kalender|libur|harilibur)$/i

export default handler
