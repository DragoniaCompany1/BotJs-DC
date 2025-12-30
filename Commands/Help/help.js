const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "help",
    aliases: ["commands", "cmd", "h"],
    description: "Menampilkan semua command bot",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    cooldown: 5,

    run: async (client, message, args) => {
        try {
            const prefix = client.config.PREFIX_BOT;

            if (args[0]) {
                const commandName = args[0].toLowerCase();
                const command = client.commands.get(commandName) || 
                               client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

                if (!command) {
                    return message.reply(`❌ Command **${commandName}** tidak ditemukan!`);
                }

                const embed = new MessageEmbed()
                    .setColor("#0099ff")
                    .setTitle(`📖 Command: ${command.name}`)
                    .setDescription(command.description || "Tidak ada deskripsi")
                    .addField("📝 Usage", `\`${prefix}${command.name}\``, true)
                    .addField("⏱️ Cooldown", `${command.cooldown || 0} detik`, true)
                    .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                    .setTimestamp();

                if (command.aliases && command.aliases.length > 0) {
                    embed.addField("🔀 Aliases", command.aliases.map(a => `\`${a}\``).join(", "), false);
                }

                if (command.UserPerms && command.UserPerms.length > 0) {
                    embed.addField("🔐 Required Permissions", command.UserPerms.join(", "), false);
                }

                return message.reply({ embeds: [embed] });
            }

            const categories = {};
            
            client.commands.forEach((cmd) => {
                const category = cmd.directory || "General";
                
                if (!categories[category]) {
                    categories[category] = [];
                }
                
                categories[category].push(cmd);
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

            const mainEmbed = new MessageEmbed()
                .setColor("#00FF00")
                .setTitle(`🤖 ${client.user.username} - Help Menu`)
                .setDescription(`Prefix bot: \`${prefix}\`\n\nTotal Commands: **${client.commands.size}**\nTotal Categories: **${Object.keys(categories).length}**\n\n📚 Pilih kategori di bawah untuk melihat commands`)
                .addField("💡 Tips", `• Gunakan \`${prefix}help [command]\` untuk detail command\n• Contoh: \`${prefix}help ban\``, false)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            let overview = "";
            Object.keys(categories).sort().forEach(category => {
                const emoji = categoryEmojis[category] || "📁";
                overview += `${emoji} **${category}** - ${categories[category].length} commands\n`;
            });

            mainEmbed.addField("📂 Categories", overview, false);

            const selectMenu = new MessageSelectMenu()
                .setCustomId("help_category_select")
                .setPlaceholder("📂 Pilih kategori command")
                .addOptions(
                    Object.keys(categories).sort().map(category => {
                        const emoji = categoryEmojis[category] || "📁";
                        return {
                            label: category,
                            description: `${categories[category].length} commands available`,
                            value: category,
                            emoji: emoji
                        };
                    })
                );

            const row1 = new MessageActionRow().addComponents(selectMenu);

            const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel("Home")
                        .setCustomId("help_home")
                        .setStyle("PRIMARY")
                        .setEmoji("🏠"),
                    new MessageButton()
                        .setLabel("All Commands")
                        .setCustomId("help_all")
                        .setStyle("SECONDARY")
                        .setEmoji("📋"),
                    new MessageButton()
                        .setLabel("Delete")
                        .setCustomId("help_delete")
                        .setStyle("DANGER")
                        .setEmoji("🗑️")
                );

            const helpMessage = await message.reply({ 
                embeds: [mainEmbed], 
                components: [row1, buttons]
            });

            const collector = helpMessage.createMessageComponentCollector({ 
                time: 300000 
            });

            collector.on("collect", async (interaction) => {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({ 
                        content: "❌ Ini bukan help menu kamu!", 
                        ephemeral: true 
                    });
                }

                try {
                    if (interaction.customId === "help_category_select") {
                        const category = interaction.values[0];
                        const commands = categories[category];

                        const categoryEmbed = new MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle(`${categoryEmojis[category] || "📁"} ${category} Commands`)
                            .setDescription(`Total: **${commands.length}** commands\n\nGunakan \`${prefix}help [command]\` untuk detail`)
                            .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                            .setTimestamp();

                        let cmdList = "";
                        commands.sort((a, b) => a.name.localeCompare(b.name)).forEach(cmd => {
                            const aliases = cmd.aliases && cmd.aliases.length > 0 
                                ? ` (${cmd.aliases.join(", ")})` 
                                : "";
                            cmdList += `• \`${prefix}${cmd.name}\`${aliases}\n  ${cmd.description || "Tidak ada deskripsi"}\n\n`;
                        });

                        categoryEmbed.setDescription(categoryEmbed.description + "\n\n" + cmdList);

                        await interaction.update({ embeds: [categoryEmbed], components: [row1, buttons] });
                    }

                    if (interaction.customId === "help_home") {
                        await interaction.update({ embeds: [mainEmbed], components: [row1, buttons] });
                    }

                    if (interaction.customId === "help_all") {
                        const allEmbed = new MessageEmbed()
                            .setColor("#FFD700")
                            .setTitle("📋 All Commands")
                            .setDescription(`Total: **${client.commands.size}** commands\n\n`)
                            .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                            .setTimestamp();

                        let allCmds = "";
                        Object.keys(categories).sort().forEach(category => {
                            const emoji = categoryEmojis[category] || "📁";
                            allCmds += `\n${emoji} **${category}**\n`;
                            
                            categories[category].sort((a, b) => a.name.localeCompare(b.name)).forEach(cmd => {
                                allCmds += `\`${cmd.name}\` `;
                            });
                            allCmds += "\n";
                        });

                        allEmbed.setDescription(allEmbed.description + allCmds);

                        await interaction.update({ embeds: [allEmbed], components: [row1, buttons] });
                    }

                    if (interaction.customId === "help_delete") {
                        await interaction.message.delete();
                        collector.stop();
                    }

                } catch (error) {
                    console.error("Error handling help interaction:", error);
                }
            });

            collector.on("end", () => {
                helpMessage.edit({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.error("❌ Error di command help:", error);
            console.error("Stack trace:", error.stack);
            message.reply("❌ Terjadi kesalahan saat menampilkan help menu.");
        }
    }
};