const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "categories",
    aliases: ["cats", "category"],
    description: "Lihat semua kategori command",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    cooldown: 5,

    run: async (client, message) => {
        try {
            const categories = {};
            
            client.commands.forEach((cmd) => {
                const category = cmd.directory || "General";
                
                if (!categories[category]) {
                    categories[category] = {
                        commands: [],
                        total: 0
                    };
                }
                
                categories[category].commands.push(cmd.name);
                categories[category].total++;
            });

            const categoryEmojis = {
                "General": "📋",
                "Admin": "👮",
                "System": "⚙️",
                "Utility": "🔧",
                "Fun": "🎮",
                "Moderation": "🛡️",
                "SAMP": "🎯",
                "Economy": "💰",
                "Info": "ℹ️"
            };

            const embed = new MessageEmbed()
                .setColor("#00FF00")
                .setTitle("📂 Command Categories")
                .setDescription(`Total Categories: **${Object.keys(categories).length}**\nTotal Commands: **${client.commands.size}**`)
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            Object.keys(categories).sort().forEach(category => {
                const emoji = categoryEmojis[category] || "📁";
                const info = categories[category];
                
                const preview = info.commands.slice(0, 5).map(c => `\`${c}\``).join(", ");
                const more = info.total > 5 ? ` (+${info.total - 5} more)` : "";
                
                embed.addField(
                    `${emoji} ${category} (${info.total})`,
                    preview + more,
                    false
                );
            });

            embed.addField(
                "💡 Tip",
                `Gunakan \`${client.config.PREFIX_BOT}help\` untuk melihat semua commands`,
                false
            );

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error di categories:", error);
            message.reply("❌ Terjadi kesalahan.");
        }
    }
};