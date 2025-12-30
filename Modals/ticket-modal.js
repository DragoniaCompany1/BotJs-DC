const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    id: "ticket-modal",

    run: async (interaction, client) => {
        let hasReplied = false;
        
        try {
            if (interaction.deferred || interaction.replied) {
                console.log("⚠️ Interaction already handled, skipping...");
                return;
            }

            await interaction.deferReply({ ephemeral: true });
            hasReplied = true;

            const reason = interaction.fields.getTextInputValue("ticket-reason");
            const target = interaction.fields.getTextInputValue("ticket-target");

            const configPath = path.join(process.cwd(), 'config', 'ticket.json');
            
            if (!fs.existsSync(configPath)) {
                return interaction.editReply({
                    content: "❌ Ticket system belum di-setup! Hubungi admin.",
                    ephemeral: true
                });
            }

            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            const existingTicket = interaction.guild.channels.cache.find(
                ch => ch.topic && ch.topic.includes(`User ID: ${interaction.user.id}`) && ch.name.startsWith("ticket-")
            );

            if (existingTicket) {
                return interaction.editReply({
                    content: `❌ Anda sudah memiliki ticket aktif di ${existingTicket}!`,
                    ephemeral: true
                });
            }

            config.ticketCounter = (config.ticketCounter || 0) + 1;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            const ticketNumber = String(config.ticketCounter).padStart(4, '0');
            const channelName = `ticket-${ticketNumber}`;

            let category = null;
            if (config.categoryId) {
                category = interaction.guild.channels.cache.get(config.categoryId);
            }

            const ticketChannel = await interaction.guild.channels.create(channelName, {
                type: "GUILD_TEXT",
                topic: `Ticket by ${interaction.user.tag} | User ID: ${interaction.user.id}`,
                parent: category ? category.id : null,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [Permissions.FLAGS.VIEW_CHANNEL]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            Permissions.FLAGS.VIEW_CHANNEL,
                            Permissions.FLAGS.SEND_MESSAGES,
                            Permissions.FLAGS.READ_MESSAGE_HISTORY,
                            Permissions.FLAGS.ATTACH_FILES
                        ]
                    },
                    {
                        id: client.user.id,
                        allow: [
                            Permissions.FLAGS.VIEW_CHANNEL,
                            Permissions.FLAGS.SEND_MESSAGES,
                            Permissions.FLAGS.MANAGE_CHANNELS,
                            Permissions.FLAGS.MANAGE_MESSAGES
                        ]
                    }
                ]
            });

            if (config.supportRoleId) {
                await ticketChannel.permissionOverwrites.create(config.supportRoleId, {
                    VIEW_CHANNEL: true,
                    SEND_MESSAGES: true,
                    READ_MESSAGE_HISTORY: true,
                    ATTACH_FILES: true,
                    MANAGE_MESSAGES: true
                });
            }

            const ticketEmbed = new MessageEmbed()
                .setColor("#5865F2")
                .setTitle(`🎫 Ticket #${ticketNumber}`)
                .setDescription(`Terima kasih telah membuat ticket, ${interaction.user}!\n\nStaff akan segera membantu Anda.`)
                .addFields(
                    { name: "👤 Dibuat Oleh", value: interaction.user.tag, inline: true },
                    { name: "🎯 Target Staff", value: target, inline: true },
                    { name: "📅 Dibuat Pada", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
                    { name: "📝 Alasan", value: reason, inline: false },
                    { name: "ℹ️ Informasi", value: "• Staff akan merespons secepatnya\n• Jangan spam pesan\n• Gunakan tombol Close untuk menutup ticket", inline: false }
                )
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("ticket-close")
                        .setLabel("Close Ticket")
                        .setEmoji("🔒")
                        .setStyle("DANGER"),
                    new MessageButton()
                        .setCustomId("ticket-claim")
                        .setLabel("Claim Ticket")
                        .setEmoji("✋")
                        .setStyle("SUCCESS")
                );

            await ticketChannel.send({
                content: `${interaction.user} ${config.supportRoleId ? `<@&${config.supportRoleId}>` : ''}`,
                embeds: [ticketEmbed],
                components: [buttons]
            });

            await interaction.editReply({
                content: `✅ Ticket berhasil dibuat! ${ticketChannel}`,
                ephemeral: true
            });

            console.log(`✅ ${interaction.user.tag} created ticket #${ticketNumber}`);

        } catch (error) {
            console.error("Error handling modal submit:", error);
            
            try {
                if (!hasReplied && !interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: "❌ Terjadi kesalahan saat membuat ticket.",
                        ephemeral: true
                    });
                } else if (hasReplied || interaction.deferred) {
                    await interaction.editReply({
                        content: "❌ Terjadi kesalahan saat membuat ticket."
                    });
                }
            } catch (replyError) {
                console.error("Failed to send error message:", replyError);
            }
        }
    }
};