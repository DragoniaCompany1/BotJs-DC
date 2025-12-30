const { MessageEmbed } = require("discord.js");

module.exports = {
    id: "ticket-close-confirm",

    run: async (interaction, client) => {
        try {
            const channel = interaction.channel;

            const closeEmbed = new MessageEmbed()
                .setColor("#FF0000")
                .setTitle("🔒 Ticket Closing...")
                .setDescription("Ticket akan dihapus dalam 5 detik...")
                .addField("👤 Closed By", interaction.user.tag, true)
                .addField("📅 Closed At", `<t:${Math.floor(Date.now() / 1000)}:F>`, true)
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            await interaction.update({
                embeds: [closeEmbed],
                components: []
            });

            console.log(`✅ ${interaction.user.tag} closed ticket #${channel.name}`);

            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (error) {
                    console.error("❌ Error deleting ticket channel:", error);
                }
            }, 5000);

        } catch (error) {
            console.error("❌ Error di ticket-close-confirm:", error);
        }
    }
};