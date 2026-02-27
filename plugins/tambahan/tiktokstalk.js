import axios from 'axios'
import moment from 'moment-timezone'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let target = text ? text.replace('@', '') : 'dapss_06' // Default ke user lo kalau gak ada input
    await m.react('📱')

    try {
        let res = await axios.get(`https://api.kiracloud.my.id/api/discovery/st-tiktok?user=${target}`)
        let json = res.data

        if (json.status !== 200) return m.reply('Username gak ketemu, Fa! Pastiin tulisannya bener.')

        let u = json.data.user
        let s = json.data.stats
        
        let teks = `📱 *TIKTOK STALKER*\n\n`
        teks += ` ◦  *Nickname:* ${u.nickname}\n`
        teks += ` ◦  *Username:* @${u.uniqueId}\n`
        teks += ` ◦  *ID:* ${u.id}\n`
        teks += ` ◦  *Verified:* ${u.verified ? '✅ Verified' : '❌ No'}\n`
        teks += ` ◦  *Private:* ${u.privateAccount ? '🔒 Yes' : '🔓 No'}\n`
        teks += ` ◦  *Dibuat:* ${moment(u.createTime * 1000).tz('Asia/Jakarta').format('DD MMMM YYYY')}\n\n`
        
        teks += `📈 *STATISTICS*\n`
        teks += ` ◦  *Followers:* ${s.followerCount.toLocaleString()}\n`
        teks += ` ◦  *Following:* ${s.followingCount.toLocaleString()}\n`
        teks += ` ◦  *Hearts/Likes:* ${s.heartCount.toLocaleString()}\n`
        teks += ` ◦  *Videos:* ${s.videoCount}\n`
        teks += ` ◦  *Friends:* ${s.friendCount}\n\n`
        
        teks += `_Stalked by Dafa-Zenn Bot_`

        // Kirim dengan foto profil TikTok-nya (pake AvatarMedium biar jernih)
        await conn.sendMessage(m.chat, { 
            image: { url: u.avatarMedium }, 
            caption: teks 
        }, { quoted: m })
        
        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply('Error pas nyambung ke API, Fa. Mungkin API-nya lagi libur.')
    }
}

handler.help = ['ttstalk']
handler.tags = ['tools']
handler.command = /^(ttstalk|tiktokstalk|tiktok)$/i

export default handler
