const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");
const client = require("../bot-dc");

const linkPatterns = [
    /discord\.gg\/[a-zA-Z0-9]+/gi,
    /discord\.com\/invite\/[a-zA-Z0-9]+/gi,
    /discordapp\.com\/invite\/[a-zA-Z0-9]+/gi,
    /https?:\/\/[^\s]+/gi,
    /www\.[^\s]+/gi,
    /bit\.ly\/[^\s]+/gi,
    /tinyurl\.com\/[^\s]+/gi,
    /t\.co\/[^\s]+/gi,
    /goo\.gl\/[^\s]+/gi,
    /ow\.ly\/[^\s]+/gi,
    /[a-zA-Z0-9-]+\.(com|net|org|io|gg|me|co|xyz|tk|ml|ga|cf|gq)[^\s]*/gi
];

const trustedDomains = [
    'youtube.com',
    'youtu.be',
    'tenor.com',
    'giphy.com',
    'imgur.com',
    'cdn.discordapp.com',
    'media.discordapp.net'
];

function containsLink(content) {
    for (const pattern of linkPatterns) {
        if (pattern.test(content)) {
            const matches = content.match(pattern);
            if (matches) {
                for (const match of matches) {
                    let isTrusted = false;
                    for (const domain of trustedDomains) {
                        if (match.toLowerCase().includes(domain)) {
                            isTrusted = true;
                            break;
                        }
                    }
                    if (!isTrusted) {
                        return { detected: true, link: match };
                    }
                }
            }
        }
    }
    return { detected: false, link: null };
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.member) return;

    try {
        const configPath = path.join(process.cwd(), 'config', 'antilink.json');
        
        if (!fs.existsSync(configPath)) return;

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const guildConfig = config[message.guild.id];

        if (!guildConfig || !guildConfig.enabled) return;
        if (!guildConfig.channels.includes(message.channel.id)) return;

        const isWhitelistedRole = guildConfig.whitelistedRoles.some(roleId => 
            message.member.roles.cache.has(roleId)
        );
        
        if (isWhitelistedRole) return;

        const isWhitelistedUser = guildConfig.whitelistedUsers.includes(message.author.id);
        if (isWhitelistedUser) return;

        if (message.member.permissions.has("ADMINISTRATOR")) return;

        const linkCheck = containsLink(message.content);

        if (linkCheck.detected) {
            try {
                await message.delete();
                console.log(`🗑️ Deleted message with link from ${message.author.tag} in #${message.channel.name}`);
            } catch (err) {
                console.error("❌ Failed to delete message:", err.message);
            }

            if (!guildConfig.violations[message.author.id]) {
                guildConfig.violations[message.author.id] = [];
            }

            guildConfig.violations[message.author.id].push({
                timestamp: Date.now(),
                channel: message.channel.id,
                link: linkCheck.link
            });

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            const violationCount = guildConfig.violations[message.author.id].length;

            try {
                const muteTime = guildConfig.muteTime || 3600000;
                const muteUntil = new Date(Date.now() + muteTime);

                await message.member.timeout(muteTime, `Antilink: Posted link in protected channel (Violation #${violationCount})`);
                
                console.log(`🔇 Muted ${message.author.tag} for 1 hour (Violation #${violationCount})`);

                const dmEmbed = new MessageEmbed()
                    .setColor("#FF0000")
                    .setTitle("🚫 Antilink System - Muted")
                    .setDescription(`You have been **muted** for posting links in a protected channel!`)
                    .addFields(
                        { name: "⏱️ Mute Duration", value: "1 Hour", inline: true },
                        { name: "📊 Violation Count", value: `#${violationCount}`, inline: true },
                        { name: "🔓 Unmute Time", value: `<t:${Math.floor(muteUntil.getTime() / 1000)}:R>`, inline: true },
                        { name: "📍 Channel", value: `#${message.channel.name}`, inline: true },
                        { name: "🔗 Detected Link", value: `\`${linkCheck.link}\``, inline: false },
                        { name: "⚠️ Warning", value: "Repeated violations may result in permanent ban!", inline: false }
                    )
                    .setFooter({ text: `Server: ${message.guild.name} • Created by: Axel (Drgxel), Ozi (Mozi)` })
                    .setTimestamp();

                await message.author.send({ embeds: [dmEmbed] }).catch(() => {
                    console.log(`⚠️ Could not DM ${message.author.tag}`);
                });

            } catch (muteErr) {
                console.error("❌ Failed to mute user:", muteErr.message);
            }

            const alertEmbed = new MessageEmbed()
                .setColor("#FF4444")
                .setTitle("🚫 Antilink Alert")
                .setDescription(`${message.author} posted a link and has been **muted for 1 hour**!`)
                .addFields(
                    { name: "👤 User", value: `${message.author.tag}\n${message.author}`, inline: true },
                    { name: "📊 Violation", value: `#${violationCount}`, inline: true },
                    { name: "📍 Channel", value: message.channel.toString(), inline: true },
                    { name: "🔗 Link Detected", value: `\`${linkCheck.link}\``, inline: false },
                    { name: "⚡ Actions Taken", value: "✅ Message deleted\n✅ User muted (1 hour)\n✅ Violation logged", inline: false }
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            const notifMessage = await message.channel.send({ embeds: [alertEmbed] });

            setTimeout(() => {
                notifMessage.delete().catch(() => {});
            }, 10000);

        }

    } catch (error) {
        console.error("❌ Error in antilink handler:", error);
        console.error("Stack trace:", error.stack);
    }
});