import stats from '../../lib/datastat.js'
import moment from 'moment-timezone'
import cron from 'node-cron' // Pastikan sudah install: npm install node-cron

/**
 * AUTO REKAP OWNER (NO COMMAND)
 * Bot akan mengirim laporan ke owner otomatis setiap jam 00:00 WIB
 */

// Simpan status agar tidak mengirim berkali-kali di menit yang sama
let lastSent = ''

export async function before(m, { conn }) {
    const tz = 'Asia/Jakarta'
    const now = moment().tz(tz)
    const timeNow = now.format('HH:mm')
    const today = now.format('YYYY-MM-DD')

    // SETTING: Kirim setiap jam 00:00
    if (timeNow === '00:00' && lastSent !== today) {
        lastSent = today
        
        let allGroups = Object.keys(stats)
        if (allGroups.length === 0) return

        let report = `📊 *AUTO REKAP AKTIVITAS (24 JAM)*\n`
        report += `📅 Tanggal: ${now.clone().subtract(1, 'days').format('DD MMM YYYY')}\n`
        report += `━━━━━━━━━━━━━━━━━━━━\n\n`

        let listGrup = []
        for (let jid of allGroups) {
            try {
                let name = (await conn.groupMetadata(jid).catch(() => ({ subject: 'Grup Tidak Dikenal' }))).subject
                // Ambil data kemarin (karena dikirim jam 00:00, kita rekap data hari yang baru lewat)
                const yesterday = now.clone().subtract(1, 'days').format('YYYY-MM-DD')
                let total = (stats[jid]?.hourly?.[yesterday] || Array(24).fill(0)).reduce((a, b) => a + b, 0)
                
                if (total > 0) listGrup.push({ name, total })
            } catch (e) {}
        }

        // Urutin dari yang paling rame
        listGrup.sort((a, b) => b.total - a.total)
        listGrup.forEach((g, i) => {
            report += `${i + 1}. *${g.name}*\n`
            report += `   └ Total Chat: ${g.total} pesan\n\n`
        })

        if (listGrup.length > 0) {
            report += `━━━━━━━━━━━━━━━━━━━━\n`
            report += `_Laporan otomatis sistem setiap hari 24 jam sekali._`
            
            // Kirim ke nomor lo (Pastikan global.owner[0] di setting)
            let ownerNumber = global.owner[0].split('@')[0] + '@s.whatsapp.net'
            await conn.sendMessage(ownerNumber, { text: report })
            console.log(`[SYSTEM] Laporan rekap harian berhasil dikirim ke Owner.`)
        }
    }
}
