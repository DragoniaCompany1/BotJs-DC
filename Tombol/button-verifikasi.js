const { MessageEmbed } = require("discord.js");

module.exports = {
    id: "button-verifikasi",
    description: "Handle verifikasi member untuk mendapat role Non-Warga dan auto rename nickname",

    run: async (interaction, client) => {
        try {
            await interaction.deferReply({ ephemeral: true });

            const member = interaction.member;
            const guild = interaction.guild;
            const nonWargaRoleId = client.config.ROLE_NON_WARGA;

            if (!nonWargaRoleId) {
                return interaction.editReply({
                    content: "❌ Role Non-Warga belum di-setup di sistem!",
                    ephemeral: true
                });
            }

            const nonWargaRole = guild.roles.cache.get(nonWargaRoleId);
            if (!nonWargaRole) {
                return interaction.editReply({
                    content: "❌ Role Non-Warga tidak ditemukan di server!",
                    ephemeral: true
                });
            }

            if (member.roles.cache.has(nonWargaRoleId)) {
                const alreadyEmbed = new MessageEmbed()
                    .setColor("#FFA500")
                    .setTitle("⚠️ Sudah Terverifikasi")
                    .setDescription(
                        `Kamu sudah memiliki role ${nonWargaRole}!\n\n` +
                        `**Nickname kamu:** ${member.displayName}\n\n` +
                        `**Untuk akses penuh:**\n` +
                        `📝 Silakan daftar UCP untuk mendapat role Warga`
                    )
                    .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                    .setTimestamp();

                return interaction.editReply({
                    embeds: [alreadyEmbed],
                    ephemeral: true
                });
            }

            const botMember = guild.members.cache.get(client.user.id);
            const botHighestRole = botMember.roles.highest;
            
            if (botHighestRole.position <= nonWargaRole.position) {
                console.error(`❌ Bot role position (${botHighestRole.position}) <= Non-Warga role position (${nonWargaRole.position})`);
                return interaction.editReply({
                    content: `❌ Bot role **${botHighestRole.name}** harus **lebih tinggi** dari role **${nonWargaRole.name}**!\n\nSilakan hubungi Admin untuk memperbaiki role hierarchy.`,
                    ephemeral: true
                });
            }

            if (!botMember.permissions.has("MANAGE_ROLES")) {
                console.error("❌ Bot tidak memiliki permission MANAGE_ROLES");
                return interaction.editReply({
                    content: "❌ Bot tidak memiliki permission **MANAGE_ROLES**!\n\nSilakan hubungi Admin untuk memberikan permission.",
                    ephemeral: true
                });
            }

            const originalUsername = member.user.username;
            const newNickname = `NON WARGA | ${originalUsername}`;

            let nicknameChanged = false;
            let nicknameError = null;

            try {
                await member.setNickname(newNickname);
                nicknameChanged = true;
                console.log(`✅ Nickname ${member.user.tag} diubah menjadi: ${newNickname}`);
            } catch (err) {
                nicknameError = err.message;
                console.error(`⚠️ Gagal mengubah nickname ${member.user.tag}:`, err.message);
            }

            try {
                await member.roles.add(nonWargaRole);
                console.log(`✅ ${member.user.tag} berhasil verifikasi dan mendapat role Non-Warga`);
            } catch (err) {
                console.error(`❌ Gagal memberikan role ${member.user.tag}:`, err);
                
                if (nicknameChanged) {
                    try {
                        await member.setNickname(originalUsername);
                        console.log(`🔄 Nickname ${member.user.tag} di-rollback ke: ${originalUsername}`);
                    } catch (rollbackErr) {
                        console.error(`⚠️ Gagal rollback nickname:`, rollbackErr.message);
                    }
                }

                return interaction.editReply({
                    content: `❌ Gagal memberikan role!\n\n**Error:** ${err.message}\n\nSilakan hubungi Admin.`,
                    ephemeral: true
                });
            }

            const successEmbed = new MessageEmbed()
                .setColor("#00FF00")
                .setTitle("✅ Verifikasi Berhasil!")
                .setDescription(
                    `Selamat datang di **${client.config.NAMA_SERVER}**!\n\n` +
                    `✅ Kamu telah mendapat role ${nonWargaRole}\n` +
                    (nicknameChanged 
                        ? `✅ Nickname berhasil diubah menjadi: **${newNickname}**\n` 
                        : `⚠️ Nickname tidak dapat diubah (${nicknameError || 'Permission denied'})\n`) +
                    `✅ Sekarang kamu bisa mengakses channel-channel tertentu\n\n` +
                    `**Langkah Selanjutnya:**\n` +
                    `📝 Daftar UCP untuk mendapat role Warga\n` +
                    `🎮 Nikmati pengalaman roleplay di server!\n` +
                    `🎫 Buat ticket jika ada pertanyaan`
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            await interaction.editReply({
                embeds: [successEmbed],
                ephemeral: true
            });

        } catch (err) {
            console.error("❌ BUTTON VERIFIKASI ERROR:", err);
            console.error("Stack trace:", err.stack);
            
            try {
                await interaction.editReply({
                    content: "❌ Terjadi kesalahan saat verifikasi!",
                    ephemeral: true
                });
            } catch (replyErr) {
                console.error("❌ Error sending error message:", replyErr);
            }
        }
    }
};