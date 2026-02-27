import axios from 'axios'
import moment from 'moment-timezone'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let target = text ? text : 'rempa13' // Default ke username lo kalau gak ada input
    await m.react('🔍')

    try {
        let res = await axios.get(`https://api.nexray.web.id/stalker/roblox?username=${target}`)
        let json = res.data

        if (!json.status) return m.reply('Username gak ketemu, Fa!')

        let d = json.result
        let basic = d.basic
        let social = d.social
        
        // Format teks hasil stalk
        let teks = `📊 *ROBLOX STALKER*\n\n`
        teks += ` ◦  *Name:* ${basic.name}\n`
        teks += ` ◦  *Display Name:* ${basic.displayName}\n`
        teks += ` ◦  *User ID:* ${basic.id}\n`
        teks += ` ◦  *Status Akun:* ${basic.isBanned ? '❌ BANNED' : '✅ Aktif'}\n`
        teks += ` ◦  *Dibuat pada:* ${moment(basic.created).tz('Asia/Jakarta').format('DD MMMM YYYY')}\n`
        teks += ` ◦  *Verified Badge:* ${basic.hasVerifiedBadge ? '✔️ Yes' : '❌ No'}\n\n`
        
        teks += `📈 *SOCIAL STATS*\n`
        teks += ` ◦  *Friends:* ${social.friends.count}\n`
        teks += ` ◦  *Followers:* ${social.followers.count}\n`
        teks += ` ◦  *Following:* ${social.following.count}\n\n`
        
        teks += `🏘️ *TOP GROUPS*\n`
        // Ambil 3 grup teratas aja biar gak kepanjangan
        let groups = d.groups.list.data.slice(0, 3).map(g => ` • ${g.group.name} (${g.role.name})`).join('\n')
        teks += groups + `\n\n`
        
        teks += `_Stalked by Dafa-Bot_`

        // Kirim dengan foto profil Roblox-nya
        let image = d.avatar.headshot.data[0].imageUrl
        await conn.sendMessage(m.chat, { 
            image: { url: image }, 
            caption: teks 
        }, { quoted: m })
        
        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply('Error pas ngambil data API, Fa. Coba lagi nanti.')
    }
}

handler.help = ['robloxstalk']
handler.tags = ['tools']
handler.command = /^(robloxstalk|rbxstalk|roblox)$/i

export default handler
