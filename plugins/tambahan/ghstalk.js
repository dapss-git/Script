import axios from 'axios'
import moment from 'moment-timezone'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`⚠️ *Masukkan Username!*\nContoh: *${usedPrefix + command}* Dafa-Zenn`)
    
    let who = m.sender
    let tag = `@${who.split('@')[0]}`

    let { key } = await conn.sendMessage(m.chat, { 
        text: `*╔═══━━━━━━━ ⚡ ━━━━━━━═══╗*\n*║      DEEP SCAN GITHUB* \n*╚═══━━━━━━━ ⚡ ━━━━━━━═══╝*\n\n〉*TARGET:* ${text}\n〉*STATUS:* ANALYZING REPOSITORIES...\n\n_Sabar, lagi bongkar semua datanya..._`,
        mentions: [who]
    })

    try {
        // 1. DATA USER
        const userRes = await axios.get(`https://api.github.com/users/${encodeURIComponent(text)}`)
        const u = userRes.data
        
        // 2. DATA REPOSITORY (Ambil 100 repo terbaru)
        const repoRes = await axios.get(`https://api.github.com/users/${encodeURIComponent(text)}/repos?per_page=100&sort=updated`)
        const repos = repoRes.data
        
        // 3. PENGOLAHAN DATA REPO
        let totalStars = repos.reduce((prev, curr) => prev + curr.stargazers_count, 0)
        let totalForks = repos.reduce((prev, curr) => prev + curr.forks_count, 0)
        
        // List Nama Repo (Gue limit 15 biar gak kepanjangan di chat, tapi datanya lengkap)
        let repoList = repos.slice(0, 15).map((v, i) => `${i + 1}. ${v.name} (${v.stargazers_count}⭐)`).join('\n')
        if (repos.length > 15) repoList += `\n... dan ${repos.length - 15} repo lainnya.`

        // Cari Bahasa Terbanyak
        let langMap = {}
        repos.forEach(r => {
            if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1
        })
        let topLangs = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(v => v[0]).join(', ')

        let created = moment(u.created_at).tz('Asia/Jakarta').format('DD MMMM YYYY')
        let updated = moment(u.updated_at).tz('Asia/Jakarta').format('DD MMMM YYYY')

        // 4. SUSUN CAPTION FULL DATA
        let caption = `*╔═══━━━━━━━ 🐙 ━━━━━━━═══╗*\n`
        caption += `*║     GITHUB PROFILE DATA* \n`
        caption += `*╚═══━━━━━━━ 🐙 ━━━━━━━═══╝*\n\n`
        
        caption += `*───〔 BIODATA 〕───*\n`
        caption += `〉*Nama:* ${u.name || u.login}\n`
        caption += `〉*Username:* ${u.login}\n`
        caption += `〉*Bio:* ${u.bio || '-'}\n`
        caption += `〉*Lokasi:* ${u.location || '-'}\n`
        caption += `〉*Perusahaan:* ${u.company || '-'}\n`
        caption += `〉*Blog/Web:* ${u.blog || '-'}\n`
        caption += `〉*Twitter:* ${u.twitter_username ? '@' + u.twitter_username : '-'}\n\n`
        
        caption += `*───〔 STATISTIK AKUN 〕───*\n`
        caption += `〉*ID:* ${u.id}\n`
        caption += `〉*Followers:* ${u.followers}\n`
        caption += `〉*Following:* ${u.following}\n`
        caption += `〉*Public Repo:* ${u.public_repos}\n`
        caption += `〉*Public Gist:* ${u.public_gists}\n`
        caption += `〉*Total Stars:* ${totalStars} ⭐\n`
        caption += `〉*Total Forks:* ${totalForks} 🍴\n`
        caption += `〉*Bahasa Utama:* ${topLangs || '-'}\n\n`

        caption += `*───〔 LIST REPOSITORY 〕───*\n`
        caption += `${repoList || 'Tidak ada repo public.'}\n\n`
        
        caption += `*───〔 HISTORY 〕───*\n`
        caption += `〉*Dibuat Pada:* ${created}\n`
        caption += `〉*Update Terakhir:* ${updated}\n\n`
        
        caption += `_Stalked by ${tag}_`

        // 5. KIRIM HASIL
        await conn.sendMessage(m.chat, { 
            image: { url: u.avatar_url }, 
            caption: caption,
            mentions: [who]
        }, { quoted: m })

        await conn.sendMessage(m.chat, { delete: key })

    } catch (e) {
        console.error(e)
        let msg = e.response?.status === 404 ? "Username tersebut ga ada, Fa!" : "Sistem lagi sibuk, coba bentar lagi."
        await conn.sendMessage(m.chat, { text: `❌ *Error:* ${msg}`, edit: key })
    }
}

handler.help = ['githubstalk <user>']
handler.tags = ['stalk']
handler.command = /^(ghstalk|githubstalk|githubstalk2)$/i

export default handler
