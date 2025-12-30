const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "cmdinfo",
    aliases: ["commandinfo", "ci"],
    description: "Informasi detail tentang command tertentu",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    cooldown: 3,

    run: async (client, message, args) => {
        try {
            if (!args[0]) {
                return message.reply(`❌ Gunakan: \`${client.config.PREFIX_BOT}cmdinfo [command_name]\``);
            }

            const commandName = args[0].toLowerCase();
            const command = client.commands.get(commandName) || 
                           client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) {
                return message.reply(`❌ Command **${commandName}** tidak ditemukan!`);
            }

            const embed = new MessageEmbed()
                .setColor("#5865F2")
                .setTitle(`ℹ️ Command Information: ${command.name}`)
                .addField("📝 Name", `\`${command.name}\``, true)
                .addField("📂 Category", command.directory || "General", true)
                .addField("⏱️ Cooldown", `${command.cooldown || 0} seconds`, true)
                .addField("📖 Description", command.description || "No description available", false)
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            if (command.aliases && command.aliases.length > 0) {
                embed.addField("🔀 Aliases", command.aliases.map(a => `\`${a}\``).join(", "), false);
            }

            if (command.UserPerms && command.UserPerms.length > 0) {
                embed.addField("🔐 User Permissions", command.UserPerms.map(p => `\`${p}\``).join(", "), false);
            }

            if (command.BotPerms && command.BotPerms.length > 0) {
                embed.addField("🤖 Bot Permissions", command.BotPerms.map(p => `\`${p}\``).join(", "), false);
            }

            embed.addField("💡 Usage", `\`${client.config.PREFIX_BOT}${command.name}\``, false);

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error di cmdinfo:", error);
            message.reply("❌ Terjadi kesalahan.");
        }
    }
};