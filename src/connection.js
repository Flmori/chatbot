const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const { handleMessage } = require('./handler/messageHandler');

// ============================================================
// State koneksi — mencegah koneksi ganda saat reconnect
// ============================================================
let activeSock = null;
let isConnecting = false;
let wasConnected = false;   // Apakah pernah berhasil terhubung?
let retryCount = 0;         // Hitung percobaan reconnect
const MAX_RETRY = 5;        // Batas reconnect sebelum menyerah

/**
 * Memulai koneksi WhatsApp.
 *
 * - Menampilkan QR Code di terminal jika belum login.
 * - Menyimpan session di auth_info/.
 * - Reconnect otomatis jika koneksi terputus (bukan logout).
 * - Mencegah koneksi ganda.
 * - Meneruskan pesan masuk ke handleMessage().
 */
async function startBot() {
  // Guard: jangan buat koneksi ganda
  if (isConnecting) {
    console.log('⏳ Koneksi sedang dibuat, menunggu...');
    return;
  }

  isConnecting = true;

  try {
    // Muat sesi yang tersimpan (agar tidak perlu scan QR ulang)
    const { state, saveCreds } = await useMultiFileAuthState(config.authPath);

    // Tutup socket lama jika ada (sebelum buat yang baru)
    if (activeSock) {
      try {
        activeSock.end();
      } catch (_) {
        // Abaikan error saat menutup socket lama
      }
      activeSock = null;
    }

    console.log('🔄 Menghubungkan ke WhatsApp...');

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false, // Kita render QR sendiri via qrcode-terminal
      logger: pino({ level: 'silent' }),
    });

    activeSock = sock;
    isConnecting = false;

    // Simpan kredensial setiap kali di-update oleh Baileys
    sock.ev.on('creds.update', saveCreds);

    // ===========================================================
    // Handle perubahan status koneksi
    // ===========================================================
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      // QR Code muncul — render di terminal
      if (qr) {
        console.log('');
        console.log('📱 Scan QR Code di bawah ini dengan WhatsApp:');
        console.log('   WhatsApp → Perangkat Tertaut → Tautkan Perangkat');
        console.log('');
        qrcode.generate(qr, { small: true });
        console.log('');
      }

      if (connection === 'connecting') {
        console.log('⏳ Menghubungkan...');
      }

      if (connection === 'open') {
        wasConnected = true;
        retryCount = 0; // Reset counter saat berhasil terhubung
        console.log('');
        console.log('✅ Bot terhubung ke WhatsApp!');
        console.log('📱 Siap menerima pesan...');
        console.log('   (Tekan Ctrl+C untuk menghentikan bot)');
        console.log('');
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;

        if (statusCode === DisconnectReason.loggedOut) {
          // User melakukan logout → JANGAN reconnect
          console.log('');
          console.log('❌ Bot di-logout dari WhatsApp.');
          console.log('');
          console.log('   Untuk login ulang:');
          console.log('   1. Hapus folder auth_info/');
          console.log('   2. Jalankan ulang: npm start');
          console.log('');

          activeSock = null;
          // Tidak memanggil startBot() lagi
        } else {
          retryCount++;

          if (retryCount > MAX_RETRY) {
            // Sudah terlalu banyak gagal → berhenti
            console.log('');
            console.log(`❌ Gagal terhubung setelah ${MAX_RETRY} percobaan.`);
            console.log('');
            console.log('   Kemungkinan penyebab:');
            console.log('   - QR Code tidak di-scan tepat waktu');
            console.log('   - Koneksi internet bermasalah');
            console.log('   - Session auth_info/ sudah expired');
            console.log('');
            console.log('   Solusi:');
            console.log('   1. Pastikan koneksi internet stabil');
            console.log('   2. Hapus folder auth_info/ jika perlu');
            console.log('   3. Jalankan ulang: npm start');
            console.log('');

            activeSock = null;
            return;
          }

          // Koneksi terputus sementara → reconnect otomatis
          const delaySeconds = wasConnected ? 3 : 5;
          console.log(
            `⚠️  Koneksi terputus, reconnect dalam ${delaySeconds} detik... (percobaan ${retryCount}/${MAX_RETRY})`
          );

          // Reset state agar bisa reconnect
          activeSock = null;
          isConnecting = false;

          setTimeout(() => {
            startBot();
          }, delaySeconds * 1000);
        }
      }
    });

    // ===========================================================
    // Terima pesan masuk → route ke messageHandler
    // ===========================================================
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      // Hanya proses pesan baru (bukan history sync)
      if (type !== 'notify') return;

      for (const msg of messages) {
        await handleMessage(sock, msg);
      }
    });

    return sock;
  } catch (err) {
    isConnecting = false;
    console.error('❌ Error saat membuat koneksi:', err.message);
    throw err;
  }
}

/**
 * Menutup koneksi WhatsApp dengan aman.
 * Dipanggil saat SIGINT/SIGTERM.
 */
function shutdownBot() {
  console.log('');
  console.log('🛑 Menghentikan bot...');

  if (activeSock) {
    try {
      activeSock.end();
    } catch (_) {
      // Abaikan error saat shutdown
    }
    activeSock = null;
  }

  console.log('👋 Bot dihentikan. Sampai jumpa!');
}

/**
 * Mendapatkan referensi socket aktif (untuk keperluan testing/debugging).
 * @returns {Object|null}
 */
function getActiveSock() {
  return activeSock;
}

module.exports = { startBot, shutdownBot, getActiveSock };
