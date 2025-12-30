const { MessageEmbed } = require("discord.js");

module.exports = {
    id: "ticket-close-cancel",

    run: async (interaction, client) => {
        try {
            const cancelEmbed = new MessageEmbed()
                .setColor("#00FF00")
                .setTitle("✅ Close Cancelled")
                .setDescription("Ticket tetap terbuka. Anda bisa melanjutkan percakapan.")
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            await interaction.update({
                embeds: [cancelEmbed],
                components: []
            });

            setTimeout(() => {
                interaction.deleteReply().catch(() => {});
            }, 5000);

        } catch (error) {
            console.error("❌ Error di ticket-close-cancel:", error);
        }
    }
};