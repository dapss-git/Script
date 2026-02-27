import os from "node:os";
import fs from "node:fs";
import path from 'path';
import { fileURLToPath } from 'url';
let num = "13135550002@s.whatsapp.net";
import convert from "@library/toAll.js";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginFolder = path.join(__dirname, '../plugins');
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

let handler = async (m, {
    conn,
    text,
    isROwner,
    usedPrefix,
    command
}) => {

    async function loadPlugins() {
        const fileAll = Object.keys(pg.plugins);

        const pluginFile = []
        for (let fold of fileAll) {
            if (!fold.endsWith('.js')) continue
            const plu = pg.plugins[fold]
            pluginFile.push(plu)
        }

        return pluginFile
    };

    const plugins = await loadPlugins();

    const url = await conn.profilePictureUrl(num, 'image');
    const res = await fetch(url);
    const metre = Buffer.from(await res.arrayBuffer());
    const resize = await conn.resize(metre, 200, 200);

    const floc = {
        key: {
            participant: num,
            ...(m.chat ? {
                remoteJid: 'status@broadcast'
            } : {})
        },
        message: {
            locationMessage: {
                name: botname,
                jpegThumbnail: resize
            }
        }
    };

    function getPluginsByTags(selectedTags = []) {
        const tagHelpMapping = {};
        const selectedTagsLower = selectedTags.map(tag => tag.toLowerCase());

        Object.keys(plugins)
            .filter(pluginName => !plugins[pluginName].disabled)
            .forEach(pluginName => {
                const plugin = plugins[pluginName];
                const tagsArray = Array.isArray(plugin.tags) ? plugin.tags : [];
                const helpArray = Array.isArray(plugin.help) ? plugin.help : [plugin.help];

                tagsArray.forEach(tag => {
                    if (!tag) return;
                    if (selectedTags.length && !selectedTagsLower.includes(tag.toLowerCase())) return;

                    if (!tagHelpMapping[tag]) tagHelpMapping[tag] = [];
                    tagHelpMapping[tag].push(...helpArray);
                });
            });

        if (!Object.keys(tagHelpMapping).length) return "No menu found.";

        return Object.keys(tagHelpMapping).map(tag => {
            const helpList = tagHelpMapping[tag]
                .map(cmd => `┊  ✦  \`${usedPrefix + cmd}\``)
                .join('\n');

            return `┌─〔 *${tag.toUpperCase()}* 〕
${helpList}
└───────────────`;
        }).join('\n\n');
    }

    // === Info User & Bot ===
    const jidsen = await (await conn?.signalRepository?.lidMapping?.getPNForLID(m.sender).catch(() => null))?.replace(/:\d+@/, '@')
    const user = {
        name: m.pushName || 'User',
        number: (jidsen || '').split('@')[0] || '62xxx-xxx-xxx',
        limit: db.data.users[m.sender]?.limit || 0,
        status: isROwner ? '⚡ Owner' : '👤 User'
    };

    const botNumber = Array.isArray(global.owner) ? global.owner[0] : typeof global.owner === 'string' ? global.owner : '62xxx-xxx-xxx';
    const cleanBotNumber = botNumber.replace('@s.whatsapp.net', '').split('@')[0];

    const botInfo = {
        name: global.botname || 'Rin Bot',
        number: cleanBotNumber
    };

    // === MENU HEADER MODERN ===
    const menuHeader = `╭━━━〔 *✨ DAP BOT ✨* 〕━━━╮
┃  🚀 *Version* : 2.0.0
┃  📦 *Library* : Baileys
┃  👑 *Creator* : ${global?.ownername || 'Dxyz'}
╰━━━━━━━━━━━━━━━━━━╯`;

    const userInfoSection = `
┏━〔 *👤 USER INFO* 〕━┓
┃  ✦ *Nama*    : ${m.pushName || "-"}
┃  ✦ *Nomor*   : ${user?.number}
┃  ✦ *Limit*   : ${user?.limit}
┃  ✦ *Status*  : ${user?.status}
┗━━━━━━━━━━━━━━━━━━┛`;

    // === Menu ===
    async function sendAudioFallback() {
        try {
            const { data: bufferAu } = await axios.get(global?.audioUrl, {
                responseType: "arraybuffer"
            });
            await sendWhatsAppVoice(conn, m.chat, bufferAu, {
                contextInfo: {
                    mentionedJid: [m.sender]
                },
                quoted: floc
            })
        } catch (err) {
            console.error("⚠️ Audio fetch failed:", err.message);
        }
    }

    if (text === "all") {
        await conn.delay(2000);
        const allCommands = getPluginsByTags();

        const caption = `${menuHeader}

${getServerSpecs()}
${userInfoSection}

━━━━〔 *📋 ALL MENU* 〕━━━━

${allCommands}

━━━━━━━━━━━━━━━━━━━

💡 *Tips:* Ketik *${usedPrefix}menu list* untuk lihat kategori
✨ *Ketik* *${usedPrefix}menu [kategori]* *untuk lihat per kategori*`;

        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                mentionedJid: [m.sender],
                ...menu
            }
        }, { quoted: floc });
        await sendAudioFallback();
        
    } else if (text === "list") {
        const allTags = [];
        Object.values(plugins).forEach(plugin => {
            if (!plugin.disabled && plugin.tags) {
                plugin.tags.forEach(tag => {
                    if (tag && !allTags.includes(tag.toLowerCase()))
                        allTags.push(tag.toLowerCase());
                });
            }
        });

        const tagsList = allTags
            .map(tag => `┊  ✦  \`${tag}\``)
            .join('\n');

        const caption = `${menuHeader}

${getServerSpecs()}
${userInfoSection}

━━━━〔 *📌 MENU CATEGORIES* 〕━━━━

┌─〔 *AVAILABLE TAGS* 〕
${tagsList}
└───────────────

━━━━━━━━━━━━━━━━━━━

💡 *Cara pakai:* ${usedPrefix}menu [nama tag]
✨ *Contoh:* ${usedPrefix}menu group`;

        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                mentionedJid: [m.sender],
                ...menu
            }
        }, { quoted: floc });
        await sendAudioFallback();
        
    } else if (text) {
        await conn.delay(2000);
        const tags = text.split(/[,\s]+/).filter(t => t);
        const filteredCommands = getPluginsByTags(tags);

        const caption = `${menuHeader}

${getServerSpecs()}
${userInfoSection}

━━━━〔 *📁 MENU: ${tags.join(' + ').toUpperCase()}* 〕━━━━

${filteredCommands}

━━━━━━━━━━━━━━━━━━━

💡 *Ketik* *${usedPrefix}menu all* *untuk semua menu
✨ *Ketik* *${usedPrefix}menu list* *untuk lihat kategori*`;

        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                mentionedJid: [m.sender],
                ...menu
            }
        }, { quoted: floc });
        await sendAudioFallback();
        
    } else {
        const caption = `${menuHeader}

${getServerSpecs()}
${userInfoSection}

━━━━〔 *🎯 QUICK MENU* 〕━━━━

┌─〔 *MAIN COMMANDS* 〕
┊  ✦  \`${usedPrefix}menu all\`   - Semua menu
┊  ✦  \`${usedPrefix}menu list\`  - Daftar kategori
┊  ✦  \`${usedPrefix}help\`       - Bantuan
┊  ✦  \`${usedPrefix}owner\`      - Info owner
└───────────────

━━━━━━━━━━━━━━━━━━━

💡 *Ketik ${usedPrefix}menu all* untuk melihat semua fitur
✨ *Bot siap membantu!*`;

        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                mentionedJid: [m.sender],
                ...menu
            }
        }, { quoted: floc });
        await sendAudioFallback();
    }
};

handler.help = [];
handler.command = ["menu", "rinmenu", "help", "?"];
handler.tags = ["main"];

/**
 * Convert audio buffer ke WhatsApp voice note + waveform
 */
async function toWhatsAppVoice(inputBuffer) {
    const audioBuffer = await convert.toVN(inputBuffer)
    const waveform = await convert.generateWaveform(audioBuffer)
    return {
        audio: audioBuffer,
        waveform
    }
}

/**
 * Kirim WhatsApp PTT dan auto-play
 */
async function sendWhatsAppVoice(conn, chatId, inputBuffer, options = {}) {
    try {
        const { audio, waveform } = await toWhatsAppVoice(inputBuffer)

        // Kirim ke WhatsApp
        await conn.sendMessage(chatId, {
            audio: audio,
            waveform: waveform,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
            ...options,
        }, {
            ...options
        })

    } catch (err) {
        console.error("Failed to send voice:", err)
    }
}

// === Server Specs Function ===
function getServerSpecs() {
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const cpu = os.cpus()[0];
    const cpuModel = cpu.model;
    const cpuSpeed = cpu.speed;
    const cpuCores = os.cpus().length;
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    return `┏━〔 *💻 SERVER INFO* 〕━┓
┃  ✦ *CPU*     : ${cpuModel}
┃  ✦ *RAM*     : ${freeMem} GB / ${totalMem} GB
┃  ✦ *Speed*   : ${cpuSpeed} MHz
┃  ✦ *Cores*   : ${cpuCores}
┃  ✦ *Uptime*  : ${days}d ${hours}h ${minutes}m
┗━━━━━━━━━━━━━━━━━━┛`;
}

export default handler;