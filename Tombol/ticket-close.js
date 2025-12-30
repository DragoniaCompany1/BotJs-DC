const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    id: "ticket-close",

    run: async (interaction, client) => {
        try {
            const channel = interaction.channel;

            if (!channel.name.startsWith("ticket-")) {
                return interaction.reply({
                    content: "❌ Command ini hanya bisa digunakan di channel ticket!",
                    ephemeral: true
                });
            }

            const confirmEmbed = new MessageEmbed()
                .setColor("#FFA500")
                .setTitle("⚠️ Konfirmasi Close Ticket")
                .setDescription("Apakah Anda yakin ingin menutup ticket ini?\n\nTicket akan dihapus dalam 5 detik setelah konfirmasi.")
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            const confirmButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("ticket-close-confirm")
                        .setLabel("Yes, Close")
                        .setEmoji("✅")
                        .setStyle("DANGER"),
                    new MessageButton()
                        .setCustomId("ticket-close-cancel")
                        .setLabel("Cancel")
                        .setEmoji("❌")
                        .setStyle("SECONDARY")
                );

            await interaction.reply({
                embeds: [confirmEmbed],
                components: [confirmButtons]
            });

        } catch (error) {
            console.error("❌ Error di ticket-close:", error);
        }
    }
};