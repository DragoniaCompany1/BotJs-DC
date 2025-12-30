const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "search",
    aliases: ["find", "searchcmd"],
    description: "Cari command berdasarkan keyword",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    cooldown: 5,

    run: async (client, message, args) => {
        try {
            if (!args[0]) {
                return message.reply(`❌ Gunakan: \`${client.config.PREFIX_BOT}search [keyword]\``);
            }

            const keyword = args.join(" ").toLowerCase();
            const results = [];

            client.commands.forEach((cmd) => {
                const matchName = cmd.name.toLowerCase().includes(keyword);
                const matchDescription = cmd.description && cmd.description.toLowerCase().includes(keyword);
                const matchAlias = cmd.aliases && cmd.aliases.some(a => a.toLowerCase().includes(keyword));
                const matchCategory = cmd.directory && cmd.directory.toLowerCase().includes(keyword);

                if (matchName || matchDescription || matchAlias || matchCategory) {
                    results.push(cmd);
                }
            });

            if (results.length === 0) {
                return message.reply(`❌ Tidak ada command yang cocok dengan keyword **"${keyword}"**`);
            }

            const embed = new MessageEmbed()
                .setColor("#0099ff")
                .setTitle(`🔍 Search Results: "${keyword}"`)
                .setDescription(`Ditemukan **${results.length}** command`)
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            let resultText = "";
            results.slice(0, 15).forEach((cmd, index) => {
                const aliases = cmd.aliases && cmd.aliases.length > 0 
                    ? ` (${cmd.aliases.join(", ")})` 
                    : "";
                
                resultText += `**${index + 1}.** \`${client.config.PREFIX_BOT}${cmd.name}\`${aliases}\n`;
                resultText += `   📂 ${cmd.directory || "General"} • ${cmd.description || "No description"}\n\n`;
            });

            if (results.length > 15) {
                resultText += `\n*...dan ${results.length - 15} command lainnya*`;
            }

            embed.setDescription(embed.description + "\n\n" + resultText);

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error di search:", error);
            message.reply("❌ Terjadi kesalahan.");
        }
    }
};