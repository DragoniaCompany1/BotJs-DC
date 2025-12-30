const { MessageEmbed } = require("discord.js");

module.exports = {
    id: "ticket-claim",

    run: async (interaction, client) => {
        try {
            const channel = interaction.channel;

            if (channel.topic && channel.topic.includes("Claimed by:")) {
                return interaction.reply({
                    content: "❌ Ticket ini sudah di-claim oleh staff lain!",
                    ephemeral: true
                });
            }

            await channel.setTopic(
                `${channel.topic || ''} | Claimed by: ${interaction.user.tag}`
            );

            const claimEmbed = new MessageEmbed()
                .setColor("#00FF00")
                .setTitle("✋ Ticket Claimed")
                .setDescription(`${interaction.user} telah mengambil ticket ini dan akan membantu Anda.`)
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            await interaction.reply({ embeds: [claimEmbed] });

            console.log(`✅ ${interaction.user.tag} claimed ticket #${channel.name}`);

        } catch (error) {
            console.error("❌ Error di ticket-claim:", error);
            interaction.reply({
                content: "❌ Terjadi kesalahan saat claim ticket.",
                ephemeral: true
            });
        }
    }
};