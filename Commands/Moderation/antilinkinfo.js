const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "antilinkinfo",
    aliases: ["linkstatus", "checklink"],
    description: "Check antilink system status",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    cooldown: 3,

    run: async (client, message, args) => {
        try {
            const configPath = path.join(process.cwd(), 'config', 'antilink.json');
            
            if (!fs.existsSync(configPath)) {
                return message.reply("❌ Antilink system belum pernah di-setup!");
            }

            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const guildConfig = config[message.guild.id];

            if (!guildConfig) {
                return message.reply("❌ Antilink system belum pernah di-setup di server ini!");
            }

            const protectedChannels = guildConfig.channels
                .map(chId => message.guild.channels.cache.get(chId))
                .filter(ch => ch)
                .map(ch => ch.toString())
                .join(", ") || "None";

            const whitelistedRoles = guildConfig.whitelistedRoles
                .map(roleId => message.guild.roles.cache.get(roleId))
                .filter(role => role)
                .map(role => role.toString())
                .join(", ") || "None";

            const totalViolations = Object.keys(guildConfig.violations).reduce((sum, userId) => {
                return sum + guildConfig.violations[userId].length;
            }, 0);

            const topViolators = Object.entries(guildConfig.violations)
                .sort((a, b) => b[1].length - a[1].length)
                .slice(0, 5)
                .map(([userId, violations]) => {
                    const user = message.guild.members.cache.get(userId);
                    return `${user ? user.user.tag : userId}: ${violations.length} violation(s)`;
                })
                .join("\n") || "No violations yet";

            const embed = new MessageEmbed()
                .setColor(guildConfig.enabled ? "#00FF00" : "#FF0000")
                .setTitle("🛡️ Antilink System Status")
                .setDescription(`Detailed information about antilink protection`)
                .addFields(
                    { name: "⚙️ Status", value: guildConfig.enabled ? "✅ AKTIF" : "❌ NONAKTIF", inline: true },
                    { name: "🔒 Protected Channels", value: `${guildConfig.channels.length} channel(s)`, inline: true },
                    { name: "⏱️ Mute Duration", value: "1 Hour", inline: true },
                    { name: "📍 Channels", value: protectedChannels, inline: false },
                    { name: "✅ Whitelisted Roles", value: whitelistedRoles, inline: false },
                    { name: "📊 Total Violations", value: totalViolations.toString(), inline: true },
                    { name: "👥 Unique Violators", value: Object.keys(guildConfig.violations).length.toString(), inline: true },
                    { name: "🏆 Top Violators", value: topViolators, inline: false },
                    { name: "🚫 Blocked Content", value: "• Discord invites\n• HTTP/HTTPS links\n• Short URLs\n• Suspicious domains", inline: true },
                    { name: "✅ Allowed Content", value: "• YouTube links\n• Tenor/Giphy GIFs\n• Discord CDN\n• Imgur images", inline: true }
                )
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error di antilinkinfo:", error);
            console.error("Stack trace:", error.stack);
            message.reply("❌ Terjadi kesalahan saat mengecek antilink system.");
        }
    }
};