const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "reloadhelp",
    aliases: ["refreshcmd", "reloadcmds"],
    description: "Reload semua commands (owner only)",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES"],
    cooldown: 10,

    run: async (client, message) => {
        try {
            const ownerId = client.config.OWNER_ID;
            const ownerRoleId = client.config.OWNER_ROLE;

            const isOwnerUser = message.author.id === ownerId;
            const hasOwnerRole = message.member && ownerRoleId && message.member.roles.cache.has(ownerRoleId);

            if (!isOwnerUser && !hasOwnerRole) {
                return message.reply("❌ Command ini hanya bisa digunakan oleh bot owner!");
            }

            const statusMsg = await message.reply("🔄 Reloading commands...");

            const oldCount = client.commands.size;
            
            if (client.reloadCommands) {
                const newCount = await client.reloadCommands();
                
                const embed = new MessageEmbed()
                    .setColor("#00FF00")
                    .setTitle("✅ Commands Reloaded")
                    .addField("📊 Old Count", `${oldCount} commands`, true)
                    .addField("📊 New Count", `${newCount} commands`, true)
                    .addField("📈 Difference", `${newCount - oldCount >= 0 ? '+' : ''}${newCount - oldCount}`, true)
                    .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                    .setTimestamp();

                await statusMsg.edit({ content: null, embeds: [embed] });
                
                console.log(`✅ Commands reloaded by ${message.author.tag}: ${oldCount} -> ${newCount}`);
            } else {
                await statusMsg.edit("❌ Reload function tidak tersedia!");
            }

        } catch (error) {
            console.error("❌ Error di reloadhelp:", error);
            message.reply("❌ Terjadi kesalahan saat reload commands.");
        }
    }
};