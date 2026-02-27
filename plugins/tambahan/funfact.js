import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Kalau user nggak masukin tanggal lahir
    if (!text) return m.reply(`Contoh penggunaan:\n${usedPrefix + command} 2009-08-28`)

    await m.react('🧬')
    
    try {
        let res = await axios.get(`https://api.nexray.web.id/fun/livefunfact?birthdate=${text}`)
        let json = res.data

        if (!json.status) return m.reply('❌ Format tanggal salah atau API sedang bermasalah. Gunakan YYYY-MM-DD.')

        let f = json.result
        let teks = `🧬 *LIVE FUN FACT KEHIDUPAN* 🧬\n`
        teks += `───────────────────\n`
        teks += `📅 *Lahir:* ${f.birth_date}\n`
        teks += `🎂 *Umur:* ${f.basic_info.age_in_years} Tahun (${f.basic_info.age_in_days} Hari)\n\n`

        teks += `❤️ *KARDIOVASKULAR*\n`
        teks += ` ◦ Detak Jantung: ${f.cardiovascular.heart_beats_total.toLocaleString()} kali\n`
        teks += ` ◦ Darah Dipompa: ${f.cardiovascular.blood_pumped_l.toLocaleString()} Liter\n`
        teks += ` ◦ Jarak Tempuh Darah: ${f.cardiovascular.blood_distance_km.toLocaleString()} KM\n\n`

        teks += `🫁 *RESPIRASI*\n`
        teks += ` ◦ Total Nafas: ${f.respiratory.total_breaths.toLocaleString()} kali\n`
        teks += ` ◦ Oksigen Dikonsumsi: ${f.respiratory.oxygen_consumed_l.toLocaleString()} Liter\n\n`

        teks += `🧠 *NEUROLOGI & SENSORIK*\n`
        teks += ` ◦ Proses Kognitif: ${f.neurological.cognitive_processes.toLocaleString()} kali\n`
        teks += ` ◦ Kedipan Mata: ${f.sensory.eye_blinks.toLocaleString()} kali\n\n`

        teks += `✨ *AMAZING FACT*\n`
        teks += ` ◦ Panjang DNA Kamu: ${f.amazing_facts.total_dna_length_km.toLocaleString()} KM\n`
        teks += ` ◦ Estimasi Sisa Hidup: ${f.life_comparison.estimated_remaining_years} Tahun lagi\n`
        teks += ` ◦ Persentase Hidup: ${f.life_comparison.percentage_of_life_lived}%\n`
        teks += `───────────────────\n`
        teks += `_Tetap bersyukur atas setiap detak jantungmu, Fa!_`

        await m.reply(teks)
        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply('⚠️ Waduh, servernya lagi overload ngitung data sel kamu!')
    }
}

handler.help = ['funfact']
handler.tags = ['fun']
handler.command = /^(funfact|livefact|umur)$/i

export default handler
