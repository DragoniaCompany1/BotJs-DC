const { Modal } = require("discord-modals");
const client = require("../bot-dc");

client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isContextMenu()) {
            await interaction.deferReply({ ephemeral: false });
            const command = client.slashCommands.get(interaction.commandName);
            if (command) {
                command.run(client, interaction);
            }
        }

        if (interaction.isButton()) {
            const Buttons = client.buttons.get(interaction.customId);
            if (Buttons) {
                try {
                    await Buttons.run(interaction, client);
                } catch (error) {
                    console.error(`❌ Error handling button ${interaction.customId}:`, error);
                    
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: "❌ Terjadi kesalahan saat memproses button.",
                            ephemeral: true
                        }).catch(() => {});
                    }
                }
            }
        }

        if (interaction.isModalSubmit()) {
            const Modals = client.modals.get(interaction.customId);
            
            if (Modals) {
                try {
                    await Modals.run(interaction, client);
                } catch (error) {
                    console.error(`❌ Error handling modal ${interaction.customId}:`, error);
                    
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: "❌ Terjadi kesalahan saat memproses form.",
                            ephemeral: true
                        }).catch(() => {});
                    } else if (interaction.deferred) {
                        await interaction.editReply({
                            content: "❌ Terjadi kesalahan saat memproses form."
                        }).catch(() => {});
                    }
                }
            } else {
                console.error(`⚠️ Modal handler tidak ditemukan: ${interaction.customId}`);
                
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: "❌ Modal handler tidak ditemukan.",
                        ephemeral: true
                    }).catch(() => {});
                }
            }
        }
    } catch (error) {
        console.error("❌ Error in interactionCreate:", error);
    }
});