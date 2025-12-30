const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "antilinkwhitelist",
    aliases: ["linkwhitelist", "whitelistlink"],
    description: "Add/remove user from antilink whitelist",
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

            if (!args[0] || !['add', 'remove'].includes(args[0].toLowerCase())) {
                const embed = new MessageEmbed()
                    .setColor("#FFA500")
                    .setTitle("⚠️ Invalid Usage")
                    .setDescription("Gunakan: `!antilinkwhitelist add @user` atau `!antilinkwhitelist remove @user`")
                    .addFields(
                        { name: "📝 Examples", value: "`!antilinkwhitelist add @user`\n`!antilinkwhitelist remove @user`", inline: false }
                    )
                    .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            const targetUser = message.mentions.members.first();
            if (!targetUser) {
                return message.reply("❌ Mention user yang ingin di-whitelist!");
            }

            const configPath = path.join(process.cwd(), 'config', 'antilink.json');
            
            if (!fs.existsSync(configPath)) {
                return message.reply("❌ Antilink system belum di-setup!");
            }

            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const guildConfig = config[message.guild.id];

            if (!guildConfig) {
                return message.reply("❌ Antilink system belum di-setup di server ini!");
            }

            const action = args[0].toLowerCase();

            if (action === 'add') {
                if (guildConfig.whitelistedUsers.includes(targetUser.id)) {
                    return message.reply(`⚠️ ${targetUser} sudah ada di whitelist!`);
                }

                guildConfig.whitelistedUsers.push(targetUser.id);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

                console.log(`✅ ${message.author.tag} whitelisted ${targetUser.user.tag} from antilink`);

                const embed = new MessageEmbed()
                    .setColor("#00FF00")
                    .setTitle("✅ User Whitelisted")
                    .setDescription(`${targetUser} telah ditambahkan ke whitelist!`)
                    .addFields(
                        { name: "👤 User", value: targetUser.user.tag, inline: true },
                        { name: "➕ Added By", value: message.author.tag, inline: true },
                        { name: "ℹ️ Info", value: "User ini bisa share link tanpa kena mute", inline: false }
                    )
                    .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });

            } else if (action === 'remove') {
                const index = guildConfig.whitelistedUsers.indexOf(targetUser.id);
                if (index === -1) {
                    return message.reply(`⚠️ ${targetUser} tidak ada di whitelist!`);
                }

                guildConfig.whitelistedUsers.splice(index, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

                console.log(`✅ ${message.author.tag} removed ${targetUser.user.tag} from whitelist`);

                const embed = new MessageEmbed()
                    .setColor("#FF0000")
                    .setTitle("❌ User Removed from Whitelist")
                    .setDescription(`${targetUser} telah dihapus dari whitelist!`)
                    .addFields(
                        { name: "👤 User", value: targetUser.user.tag, inline: true },
                        { name: "➖ Removed By", value: message.author.tag, inline: true },
                        { name: "ℹ️ Info", value: "User ini sekarang akan kena mute jika share link", inline: false }
                    )
                    .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error("❌ Error di antilinkwhitelist:", error);
            console.error("Stack trace:", error.stack);
            message.reply("❌ Terjadi kesalahan saat whitelist user.");
        }
    }
};