const client = require("../bot-dc");
const mongoose = require("mongoose");
const samp = require("samp-query");

// Konfigurasi koneksi ke server SA-MP
const connection = {
    host: client.config.SERVER_IP,
    port: client.config.SERVER_PORT
};

// Fungsi untuk memperbarui status aktivitas bot
function StatusActivityUpdate() {
    samp(connection, function (error, response) {
        if (error) {
            client.user.setActivity('[🌍] Server Online', { type: 'CUSTOM' });
        } else {
            client.user.setActivity(`[🌍] Pemain: ${response.online}`, { type: "CUSTOM" });
        }
    });
}

// Event listener ketika bot siap
client.on("ready", () => {
    console.log(`[BOT]: ${client.user.tag} Telah Aktif!`);
    client.user.setActivity('🔍 Memeriksa Server', { type: 'CUSTOM' });

    // Memperbarui status aktivitas setiap 20 detik
    setInterval(StatusActivityUpdate, 20000);
    
    // Menghubungkan ke MongoDB jika string koneksi ada
    if (client.config.mongooseConnectionString) {
        mongoose.connect(client.config.mongooseConnectionString)
            .then(() => console.log('[MONGODB]: Database MongoDB telah berhasil terhubung!'))
            .catch(err => console.error('[MONGODB]: Gagal menghubungkan ke database MongoDB', err));
    }
});
