const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "antilinkviolations",
    aliases: ["linkviolations", "violations"],
    description: "Check user's antilink violations",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    cooldown: 3,

    run: async (client, message, args) => {
        try {
            const ownerId = client.config.OWNER_ID;
            const ownerRoleId = client.config.OWNER_ROLE;
            const adminRoleId = client.config.ROLE_ADMIN;

            const isOwnerUser = message.author.id === ownerId;
            const hasOwnerRole = message.member && ownerRoleId && message.member.roles.cache.has(ownerRoleId);
            const hasAdminRole = message.member && adminRoleId && message.member.roles.cache.has(adminRoleId);

            if (!isOwnerUser && !hasOwnerRole && !hasAdminRole) {
                return message.reply("❌ Command ini hanya bisa digunakan oleh Administrator!");
            }

            const targetUser = message.mentions.members.first() || message.member;

            const configPath = path.join(process.cwd(), 'config', 'antilink.json');
            
            if (!fs.existsSync(configPath)) {
                return message.reply("❌ Antilink system belum di-setup!");
            }

            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const guildConfig = config[message.guild.id];

            if (!guildConfig) {
                return message.reply("❌ Antilink system belum di-setup di server ini!");
            }

            const violations = guildConfig.violations[targetUser.id] || [];

            if (violations.length === 0) {
                const embed = new MessageEmbed()
                    .setColor("#00FF00")
                    .setTitle("✅ Clean Record")
                    .setDescription(`${targetUser} tidak memiliki violation!`)
                    .addFields(
                        { name: "👤 User", value: targetUser.user.tag, inline: true },
                        { name: "📊 Violations", value: "0", inline: true }
                    )
                    .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            const recentViolations = violations.slice(-5).reverse();
            const violationList = recentViolations.map((v, i) => {
                const channel = message.guild.channels.cache.get(v.channel);
                const time = Math.floor(v.timestamp / 1000);
                return `**${violations.length - i}.** <t:${time}:R> - ${channel || 'Unknown Channel'}\n\`${v.link}\``;
            }).join("\n\n");

            const embed = new MessageEmbed()
                .setColor("#FF4444")
                .setTitle("🚫 Antilink Violations")
                .setDescription(`Violation record untuk ${targetUser}`)
                .addFields(
                    { name: "👤 User", value: `${targetUser.user.tag}\n${targetUser}`, inline: true },
                    { name: "📊 Total Violations", value: violations.length.toString(), inline: true },
                    { name: "⚠️ Status", value: violations.length >= 5 ? "🔴 High Risk" : violations.length >= 3 ? "🟡 Medium Risk" : "🟢 Low Risk", inline: true },
                    { name: "📋 Recent Violations", value: violationList, inline: false }
                )
                .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error di antilinkviolations:", error);
            console.error("Stack trace:", error.stack);
            message.reply("❌ Terjadi kesalahan saat check violations.");
        }
    }
};