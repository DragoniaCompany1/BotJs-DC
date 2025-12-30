const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    name: "createverifikasi",
    aliases: ["setupverif", "verifikasi"],
    description: "Setup panel verifikasi untuk mendapatkan role Non-Warga dan auto rename nickname",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "MANAGE_ROLES", "MANAGE_NICKNAMES"],
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
                console.log(`⚠️ ${message.author.tag} mencoba createverifikasi tanpa permission`);
                return message.reply("❌ Command ini hanya bisa digunakan oleh Owner atau Admin!");
            }

            let targetChannel = message.channel;

            if (args[0]) {
                const channelMention = args[0].match(/^<#(\d+)>$/);
                const channelId = channelMention ? channelMention[1] : args[0];
                
                targetChannel = message.guild.channels.cache.get(channelId);
                
                if (!targetChannel) {
                    return message.reply("❌ Channel tidak ditemukan! Gunakan: `!createverifikasi` atau `!createverifikasi #channel`");
                }
            }

            const nonWargaRoleId = client.config.ROLE_NON_WARGA;
            if (!nonWargaRoleId) {
                return message.reply("❌ ROLE_NON_WARGA belum di-setup di `.env`!");
            }

            const nonWargaRole = message.guild.roles.cache.get(nonWargaRoleId);
            if (!nonWargaRole) {
                return message.reply("❌ Role Non-Warga tidak ditemukan di server! Pastikan ROLE_NON_WARGA di `.env` sudah benar.");
            }

            const botMember = message.guild.members.cache.get(client.user.id);
            const canManageRoles = botMember.permissions.has("MANAGE_ROLES");
            const canManageNicknames = botMember.permissions.has("MANAGE_NICKNAMES");
            const botHighestRole = botMember.roles.highest;
            const roleHierarchyOK = botHighestRole.position > nonWargaRole.position;

            const embed = new MessageEmbed()
                .setColor("#3498db")
                .setTitle("🔐 VERIFIKASI MEMBER")
                .setDescription(
                    `Selamat datang di **${client.config.NAMA_SERVER}**!\n\n` +
                    `Untuk mengakses server, klik tombol **"Verifikasi"** di bawah ini.\n\n` +
                    `**Setelah verifikasi:**\n` +
                    `✅ Kamu akan mendapat role ${nonWargaRole}\n` +
                    `✅ Nickname akan otomatis berubah menjadi: **NON WARGA | NamaKamu**\n` +
                    `✅ Akses channel-channel tertentu\n` +
                    `✅ Bisa membuat ticket support\n\n` +
                    `**Untuk akses penuh:**\n` +
                    `📝 Silakan daftar UCP terlebih dahulu\n` +
                    `🎮 Setelah daftar, nickname akan berubah menjadi: **IC_Name | NamaKamu**\n` +
                    `🎭 Kamu akan mendapat role Warga dengan akses penuh`
                )
                .setThumbnail(client.config.ICON_URL || message.guild.iconURL({ dynamic: true }))
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            if (!canManageRoles) {
                embed.addFields({
                    name: "⚠️ Peringatan", 
                    value: "Bot tidak memiliki permission MANAGE_ROLES! Role tidak akan ter-assign!", 
                    inline: false
                });
            }

            if (!canManageNicknames) {
                embed.addFields({
                    name: "⚠️ Peringatan", 
                    value: "Bot tidak memiliki permission MANAGE_NICKNAMES! Nickname tidak akan otomatis berubah!", 
                    inline: false
                });
            }

            if (!roleHierarchyOK) {
                embed.addFields({
                    name: "⚠️ Peringatan Kritis!", 
                    value: `Bot role **${botHighestRole.name}** harus lebih tinggi dari **${nonWargaRole.name}**!\nRole tidak akan ter-assign sampai ini diperbaiki!`, 
                    inline: false
                });
            }

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("button-verifikasi")
                        .setLabel("✅ Verifikasi")
                        .setStyle("SUCCESS")
                        .setEmoji("🔐")
                );

            await targetChannel.send({
                embeds: [embed],
                components: [row]
            });

            console.log(`✅ Panel verifikasi dibuat di ${targetChannel.name} oleh ${message.author.tag}`);

            const successEmbed = new MessageEmbed()
                .setColor("#00FF00")
                .setTitle("✅ Panel Verifikasi Berhasil Dibuat")
                .setDescription(`Panel verifikasi telah dibuat di ${targetChannel}`)
                .addFields(
                    { name: "📍 Channel", value: targetChannel.toString(), inline: true },
                    { name: "🎭 Role", value: nonWargaRole.toString(), inline: true },
                    { name: "👤 Dibuat Oleh", value: message.author.tag, inline: true },
                    { name: "🔧 Fitur", value: "✅ Auto role assignment\n✅ Auto nickname change", inline: false },
                    { name: "📝 Format Nickname", value: "`NON WARGA | Username`", inline: true },
                    { name: "🔐 MANAGE_ROLES", value: canManageRoles ? "✅ OK" : "❌ Missing!", inline: true },
                    { name: "✏️ MANAGE_NICKNAMES", value: canManageNicknames ? "✅ OK" : "❌ Missing!", inline: true },
                    { name: "📊 Role Hierarchy", value: roleHierarchyOK ? `✅ OK (Bot: ${botHighestRole.position} > Role: ${nonWargaRole.position})` : `❌ FAIL! Bot role harus lebih tinggi!`, inline: false }
                )
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

        } catch (err) {
            console.error("❌ CREATEVERIFIKASI ERROR:", err);
            console.error("Stack trace:", err.stack);
            message.reply("❌ Terjadi kesalahan saat membuat panel verifikasi!");
        }
    }
};