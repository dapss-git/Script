// 🔥® Rin-Okumura™ 🔥
// 👿 Creator: Dxyz & Gemini
// ⚡ Plugin: npm_all_in_one.mjs

import { spawn } from 'child_process'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // --- MENU UTAMA JIKA TANPA TEKS ---
    if (!text && command !== 'npmls') {
        let menu = `📦 *NPM ALL-IN-ONE MANAGER*\n\n`
        menu += `> *TERMINAL (PANEL)*\n`
        menu += `┌  ◦ ${usedPrefix}npm install <pkg> (Auto-Rollback)\n`
        menu += `├  ◦ ${usedPrefix}npm uninstall <pkg>\n`
        menu += `└  ◦ ${usedPrefix}npmls (Cek Modul Terinstall)\n\n`
        menu += `> *DATABASE (ONLINE)*\n`
        menu += `┌  ◦ ${usedPrefix}npms <keyword> (Cari Paket)\n`
        menu += `└  ◦ ${usedPrefix}npmi <nama_paket> (Detail Paket)\n\n`
        menu += `_Bot akan otomatis menghapus paket jika instalasi gagal._`
        return m.reply(menu)
    }

    const args = text ? text.split(' ') : []
    const packageJsonPath = path.join(process.cwd(), 'package.json')

    // ==========================================================
    // 1. FITUR SEARCH (npms)
    // ==========================================================
    if (command === 'npms') {
        await m.react('🔍')
        try {
            let res = await axios.get(`https://registry.npmjs.org/-/v1/search?text=${text}&size=10`)
            let objects = res.data.objects
            if (!objects.length) return m.reply('❌ Paket tidak ditemukan!')
            let teks = `🔍 *NPM SEARCH RESULT*\n\n`
            objects.forEach((v, i) => {
                teks += `${i + 1}. *${v.package.name}* (v${v.package.version})\n`
                teks += `   📝 ${v.package.description || 'No description'}\n\n`
            })
            return m.reply(teks)
        } catch (e) { return m.reply('❌ Gagal mencari paket.') }
    }

    // ==========================================================
    // 2. FITUR INFO (npmi)
    // ==========================================================
    if (command === 'npmi') {
        await m.react('ℹ️')
        try {
            let res = await axios.get(`https://registry.npmjs.org/${text}`)
            let json = res.data
            let version = json['dist-tags'].latest
            let teks = `📦 *NPM PACKAGE INFO*\n\n`
            teks += `◦ *Nama:* ${json.name}\n`
            teks += `◦ *Versi:* ${version}\n`
            teks += `◦ *Author:* ${json.author?.name || 'Unknown'}\n`
            teks += `◦ *Desc:* ${json.description || '-'}\n\n`
            teks += `*Cara Install:* \`${usedPrefix}npm install ${json.name}\``
            return m.reply(teks)
        } catch (e) { return m.reply('❌ Gagal mengambil detail.') }
    }

    // ==========================================================
    // 3. FITUR LIST (npmls) - CEK PANEL
    // ==========================================================
    if (command === 'npmls') {
        await m.react('📋')
        const ls = spawn('npm', ['list', '--depth=0'], { shell: true })
        let out = ''
        ls.stdout.on('data', (data) => out += data)
        ls.stderr.on('data', (data) => out += data)
        ls.on('close', () => m.reply(`📋 *INSTALLED MODULES*\n\n\`\`\`${out}\`\`\``))
        return
    }

    // ==========================================================
    // 4. FITUR UTAMA: INSTALL & UNINSTALL (TERMINAL ASLI)
    // ==========================================================
    if (command === 'npm') {
        const subCommand = args[0]
        const pkgName = args[1]
        if (!subCommand || !pkgName) return m.reply(`*Contoh:* ${usedPrefix}npm install axios`)

        await m.react('⚙️')
        let { key } = await conn.reply(m.chat, `🖥️ *TERMINAL PANEL*\n───────────────────\n🚀 *Command:* npm ${text}\n⏳ _Status: Running..._`, m)

        let log = ''
        const proc = spawn('npm', args, { shell: true })

        proc.stdout.on('data', (data) => log += data.toString())
        proc.stderr.on('data', (data) => log += data.toString())

        proc.on('close', async (code) => {
            if (code === 0) {
                // BERHASIL
                let finalLog = log.length > 1000 ? log.slice(-1000) : log
                let successText = `✅ *SUCCESS*\n───────────────────\n📦 *Package:* ${pkgName}\n📂 *Status:* Injected & Installed\n\n\`\`\`${finalLog}\`\`\``
                await conn.sendMessage(m.chat, { text: successText, edit: key })
                await m.react('✅')
            } else {
                // ERROR - JIKA INSTALL, MAKA OTOMATIS ROLLBACK (HAPUS)
                if (subCommand === 'install' || subCommand === 'i') {
                    await conn.sendMessage(m.chat, { text: `⚠️ *ERROR DETECTED*\n───────────────────\n❌ Gagal install *${pkgName}*\n🔄 _Status: Melakukan Rollback (Hapus)..._`, edit: key })
                    
                    const rollback = spawn('npm', ['uninstall', pkgName], { shell: true })
                    rollback.on('close', async () => {
                        await conn.sendMessage(m.chat, { text: `🗑️ *ROLLBACK SELESAI*\n───────────────────\n❌ *Paket:* ${pkgName}\n🚫 *Hasil:* Gagal & Sampah dibersihkan.\n\n*Log Error:*\n\`\`\`${log.slice(-500)}\`\`\``, edit: key })
                        await m.react('❌')
                    })
                } else {
                    await conn.sendMessage(m.chat, { text: `❌ *FAILED*\n\`\`\`${log.slice(-500)}\`\`\``, edit: key })
                    await m.react('❌')
                }
            }
        })
    }
}

handler.help = ['npm', 'npms', 'npmi', 'npmls']
handler.tags = ['owner']
handler.command = /^(npm|npms|npmi|npmls)$/i
handler.rowner = true 

export default handler
