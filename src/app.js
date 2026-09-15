const { startBot, shutdownBot } = require('./connection');

// ============================================================
// Chatbot AMS — Entry Point
// ============================================================

console.log('');
console.log('='.repeat(50));
console.log('🤖 Chatbot AMS — Layanan Bantuan WhatsApp');
console.log('='.repeat(50));
console.log('');
console.log('Memulai bot...');
console.log('Jika belum login, scan QR Code di bawah ini dengan WhatsApp Anda.');
console.log('(Buka WhatsApp → Perangkat Tertaut → Tautkan Perangkat)');
console.log('');

// ============================================================
// Graceful Shutdown — SIGINT (Ctrl+C) dan SIGTERM
// ============================================================
function handleShutdown(signal) {
  console.log(`\n📡 Sinyal ${signal} diterima.`);
  shutdownBot();
  process.exit(0);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Tangkap uncaught exception agar proses tidak crash tanpa pesan
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  // Jangan exit — biarkan bot tetap berjalan
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  // Jangan exit — biarkan bot tetap berjalan
});

// ============================================================
// Start Bot
// ============================================================
startBot().catch((err) => {
  console.error('❌ Gagal memulai bot:', err);
  process.exit(1);
});
