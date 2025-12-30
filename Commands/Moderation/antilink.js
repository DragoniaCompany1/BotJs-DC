const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "antilink",
    aliases: ["linkprotection", "nolinks"],
    description: "Toggle antilink system (on/off)",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_MESSAGES", "MODERATE_MEMBERS"],
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

            if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
                const embed = new MessageEmbed()
                    .setColor("#FFA500")
                    .setTitle("⚠️ Invalid Usage")
                    .setDescription("Gunakan: `!antilink on` atau `!antilink off`")
                    .addFields(
                        { name: "📝 Commands", value: "`!antilink on` - Enable antilink\n`!antilink off` - Disable antilink", inline: false },
                        { name: "ℹ️ Info", value: "Setup akan berlaku di channel saat ini", inline: false }
                    )
                    .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            const action = args[0].toLowerCase();
            const configPath = path.join(process.cwd(), 'config', 'antilink.json');
            const configDir = path.dirname(configPath);

            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            let config = {};
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }

            if (!config[message.guild.id]) {
                config[message.guild.id] = {
                    enabled: false,
                    channels: [],
                    whitelistedRoles: [],
                    whitelistedUsers: [],
                    muteTime: 3600000,
                    violations: {}
                };
            }

            const channelId = message.channel.id;
            const guildConfig = config[message.guild.id];

            if (action === 'on') {
                if (!guildConfig.channels.includes(channelId)) {
                    guildConfig.channels.push(channelId);
                }
                guildConfig.enabled = true;

                if (!guildConfig.whitelistedRoles.includes(adminRoleId)) {
                    guildConfig.whitelistedRoles.push(adminRoleId);
                }
                if (ownerRoleId && !guildConfig.whitelistedRoles.includes(ownerRoleId)) {
                    guildConfig.whitelistedRoles.push(ownerRoleId);
                }

                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

                console.log(`✅ ${message.author.tag} enabled antilink di #${message.channel.name}`);

                const embed = new MessageEmbed()
                    .setColor("#00FF00")
                    .setTitle("🛡️ Antilink System Enabled")
                    .setDescription(`Antilink protection telah **DIAKTIFKAN** di channel ini!`)
                    .addFields(
                        { name: "📍 Channel", value: message.channel.toString(), inline: true },
                        { name: "👤 Enabled By", value: message.author.tag, inline: true },
                        { name: "⏱️ Mute Duration", value: "1 Jam", inline: true },
                        { name: "🔒 Protected", value: `Total ${guildConfig.channels.length} channel(s)`, inline: true },
                        { name: "✅ Whitelisted Roles", value: `Admin & Owner roles`, inline: true },
                        { name: "⚙️ Status", value: "✅ AKTIF", inline: true },
                        { name: "🚫 Akan Di-block", value: "• Discord invites\n• HTTP/HTTPS links\n• Short URLs\n• Social media links\n• Any suspicious URLs", inline: false },
                        { name: "⚡ Actions", value: "• Message auto deleted\n• User muted for 1 hour\n• Violation logged\n• Admin notification", inline: false }
                    )
                    .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });

            } else if (action === 'off') {
                const index = guildConfig.channels.indexOf(channelId);
                if (index > -1) {
                    guildConfig.channels.splice(index, 1);
                }

                if (guildConfig.channels.length === 0) {
                    guildConfig.enabled = false;
                }

                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

                console.log(`✅ ${message.author.tag} disabled antilink di #${message.channel.name}`);

                const embed = new MessageEmbed()
                    .setColor("#FF0000")
                    .setTitle("🔓 Antilink System Disabled")
                    .setDescription(`Antilink protection telah **DINONAKTIFKAN** di channel ini!`)
                    .addFields(
                        { name: "📍 Channel", value: message.channel.toString(), inline: true },
                        { name: "👤 Disabled By", value: message.author.tag, inline: true },
                        { name: "🔒 Protected", value: `Total ${guildConfig.channels.length} channel(s)`, inline: true },
                        { name: "⚙️ Status", value: guildConfig.enabled ? "⚠️ Aktif di channel lain" : "❌ NONAKTIF", inline: true }
                    )
                    .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error("❌ Error di antilink command:", error);
            console.error("Stack trace:", error.stack);
            message.reply("❌ Terjadi kesalahan saat setup antilink system.");
        }
    }
};