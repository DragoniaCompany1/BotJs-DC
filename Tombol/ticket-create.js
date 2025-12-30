const { Modal, TextInputComponent, showModal } = require("discord-modals");

module.exports = {
    id: "ticket-create",

    run: async (interaction, client) => {
        try {
            const modal = new Modal()
                .setCustomId("ticket-modal")
                .setTitle("🎫 Buat Ticket Support");

            const reasonInput = new TextInputComponent()
                .setCustomId("ticket-reason")
                .setLabel("Alasan Anda Open Ticket")
                .setStyle("LONG")
                .setPlaceholder("Jelaskan masalah atau keperluan Anda secara detail...")
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(500);

            const targetInput = new TextInputComponent()
                .setCustomId("ticket-target")
                .setLabel("Dengan Siapa Anda Mau Berurusan?")
                .setStyle("SHORT")
                .setPlaceholder("Contoh: Founder / Admin / Axel / Ozi / Developer")
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(100);

            modal.addComponents(reasonInput, targetInput);

            showModal(modal, {
                client: client,
                interaction: interaction
            });

        } catch (error) {
            console.error("❌ Error di ticket-create button:", error);
        }
    }
};