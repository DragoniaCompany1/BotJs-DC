const { MessageEmbed } = require("discord.js")
const { createConnection } = require("mysql")

MsgSucces = async (message, args) => {
    const msgEmbed = new MessageEmbed()
    .setDescription(args)
    .setColor("GREEN")
    return message.reply({ embeds: [msgEmbed] })
}

MsgError = async (message, args) => {
    const msgEmbed = new MessageEmbed()
    .setDescription(args)
    .setColor("RED")
    return message.reply({ embeds: [msgEmbed] })
}

MsgUsage = async (message, args) => {
    const msgEmbed = new MessageEmbed()
    .setDescription(args)
    .setColor("YELLOW")
    return message.reply({ embeds: [msgEmbed] })
}

IntSucces = async (interaction, args) => {
    try {
        const msgEmbed = new MessageEmbed()
            .setDescription(args)
            .setColor("GREEN");
        return await interaction.reply({ embeds: [msgEmbed], ephemeral: true });
    } catch (error) {
        console.error(`Terjadi kesalahan saat mengirim pesan sukses interaksi: ${error.message}`);
    }
};

IntError = async(interaction, args) => {
    const msgEmbed = new MessageEmbed()
    .setDescription(args)
    .setColor("RED")
    return interaction.reply({ embeds: [msgEmbed], ephemeral: true })
}

IntUsage = async(interaction, args) => {
    const msgEmbed = new MessageEmbed()
    .setDescription(args)
    .setColor("YELLOW")
    return interaction.reply({ embeds: [msgEmbed], ephemeral: true })
}

IntAdmin = async(interaction, args) => {
    const msgEmbed = new MessageEmbed()
    .setDescription(args)
    .setColor("#800000")
    return interaction.reply({ embeds: [msgEmbed], ephemeral: false })
}

IntPerms = async(interaction, args) => {
    const msgEmbed = new MessageEmbed()
    .setDescription(`Maaf! Anda bukan bagian dari admin server ${client.config.NAMA_SERVER}!`)
    .setColor("RED")
    return interaction.reply({ embeds: [msgEmbed], ephemeral: false })
}