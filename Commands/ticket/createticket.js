const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "createticket",
    aliases: ["setupticket", "ticketsetup"],
    description: "Setup ticket system dengan button",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_CHANNELS"],
    cooldown: 10,

    run: async (client, message, args) => {
        try {
            const ownerId = client.config.OWNER_ID;
            const ownerRoleId = client.config.OWNER_ROLE;
            const adminRoleId = client.config.ROLE_ADMIN;

            const isOwnerUser = message.author.id === ownerId;
            const hasOwnerRole = message.member && ownerRoleId && message.member.roles.cache.has(ownerRoleId);
            const hasAdminRole = message.member && adminRoleId && message.member.roles.cache.has(adminRoleId);

            if (!isOwnerUser && !hasOwnerRole && !hasAdminRole) {
                return message.reply("❌ Command ini hanya bisa digunakan oleh Administrator!");
            }

            const channel = message.mentions.channels.first() || message.channel;

            const configPath = path.join(process.cwd(), 'config', 'ticket.json');
            const configDir = path.dirname(configPath);

            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            let config = {};
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }

            config.ticketChannelId = channel.id;
            config.guildId = message.guild.id;
            config.categoryId = null;
            config.supportRoleId = adminRoleId;
            config.ticketCounter = config.ticketCounter || 0;
            config.setupBy = message.author.id;
            config.setupAt = new Date().toISOString();

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            const embed = new MessageEmbed()
                .setColor("#00FF00")
                .setTitle("✅ Ticket System Setup Berhasil")
                .setDescription(`Ticket system telah diatur di ${channel}`)
                .addField("📝 Channel", channel.toString(), true)
                .addField("👤 Setup By", message.author.tag, true)
                .addField("⚙️ Status", "✅ Aktif", true)
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

            const ticketEmbed = new MessageEmbed()
                .setColor("#5865F2")
                .setTitle(`🎫 Ticket Support - ${client.config.NAMA_SERVER || 'Server'}`)
                .setDescription("Butuh bantuan? Buat ticket dengan klik tombol di bawah!\n\n**Kapan harus buat ticket?**\n• Ada masalah dengan akun\n• Butuh bantuan dari staff\n• Ingin bertemu dengan staff tertentu\n• Melaporkan bug atau masalah\n• Pertanyaan penting lainnya\n\n**Perhatian:**\n❌ Jangan spam ticket\n❌ Jangan buat ticket untuk hal sepele\n✅ Isi form dengan jelas dan lengkap")
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            const button = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("ticket-create")
                        .setLabel("Open Ticket")
                        .setEmoji("🎫")
                        .setStyle("PRIMARY")
                );

            await channel.send({ embeds: [ticketEmbed], components: [button] });

            console.log(`✅ ${message.author.tag} setup ticket system di #${channel.name}`);

        } catch (error) {
            console.error("❌ Error di createticket:", error);
            console.error("Stack trace:", error.stack);
            message.reply("❌ Terjadi kesalahan saat setup ticket system.");
        }
    }
};