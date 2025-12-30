const { Collection, MessageEmbed, WebhookClient } = require("discord.js");
const client = require("../bot-dc");
const commandCooldown = new Map(); // Menyimpan waktu cooldown untuk setiap command

client.on("messageCreate", async (message) => {
    // Mengabaikan pesan dari bot, pesan yang bukan dari guild, atau pesan yang tidak dimulai dengan prefix bot
    if (
        message.author.bot ||
        !message.guild ||
        !message.content.toLowerCase().startsWith(client.config.PREFIX_BOT)
    ) return;

    // Memisahkan command dan argumen dari pesan
    const [cmd, ...args] = message.content
        .slice(client.config.PREFIX_BOT.length)
        .trim()
        .split(/ +/g);

    // Mencari command dari koleksi commands atau dari alias
    const command = client.commands.get(cmd.toLowerCase()) || client.commands.find(c => c.aliases?.includes(cmd.toLowerCase()));
    if (!command) return;

    // Logika cooldown
    if (!commandCooldown.has(command.name)) {
        commandCooldown.set(command.name, new Collection());
    }

    const currentTime = Date.now();
    const timeStamps = commandCooldown.get(command.name);
    const cooldownAmount = (command.cooldown || 0) * 1000;

    // Memeriksa apakah pengguna masih dalam periode cooldown
    if (timeStamps.has(message.author.id)) {
        const expTime = timeStamps.get(message.author.id) + cooldownAmount;

        if (currentTime < expTime) {
            const timeLeft = (expTime - currentTime) / 1000;

            // Mengirim pesan bahwa pengguna harus menunggu
            const cooldownEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription(`Harap tunggu ${timeLeft.toFixed(1)} detik untuk kembali menggunakan command \`${client.config.PREFIX_BOT}${command.name}\``);
            return message.channel.send({ embeds: [cooldownEmbed] }).then(msg => {
                setTimeout(() => msg.delete(), timeLeft * 1000);
                if (message.guild.members.me.permissions.has("MANAGE_MESSAGES")) {
                    message.delete().catch(() => {});
                }
            });
        }
    }

    // Menambahkan waktu sekarang ke dalam timestamps
    timeStamps.set(message.author.id, currentTime);
    setTimeout(() => timeStamps.delete(message.author.id), cooldownAmount);

    // Memeriksa permissions bot
    if (!message.guild.members.me.permissions.has(["SEND_MESSAGES", "EMBED_LINKS"])) {
        return errorEmbed(message, "Bot tidak memiliki akses ke `SEND MESSAGES` dan `EMBED LINKS`.");
    }
    // Memeriksa permissions pengguna
    if (command.UserPerms && !message.member.permissions.has(command.UserPerms)) {
        return errorEmbed(message, "Anda tidak memiliki akses untuk menggunakan command ini!");
    }
    // Memeriksa permissions bot yang dibutuhkan oleh command
    if (command.BotPerms && !message.guild.members.me.permissions.has(command.BotPerms)) {
        return errorEmbed(message, `Bot tidak memiliki akses permissions \`${command.BotPerms.join(', ')}\`.`);
    }

    // Menjalankan command
    await command.run(client, message, args);
});

// Fungsi untuk mengirim pesan error
function errorEmbed(message, description) {
    const embed = new MessageEmbed()
        .setColor("RED")
        .setDescription(description);
    message.channel.send({ embeds: [embed] }).then(msg => {
        setTimeout(() => msg.delete(), 5000);
    });
}
