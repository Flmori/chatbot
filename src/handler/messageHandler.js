const { getState, resetState, updateState, touchState, isSessionExpired, clearExpiredStatus } = require('../state/sessionState');
const { showMenuUtama, handleMenuUtama, MENU_UTAMA_TEXT, STANDBY_TEXT } = require('./menuUtama');
const { handlePengajuanBaru } = require('./pengajuanBaru');
const { handlePembaruanExpired } = require('./pembaruanExpired');
const { handleResetPassphrase } = require('./resetPassphrase');
const { startLiveAgen } = require('./liveAgen');
const { sendText } = require('../utils/sender');
const { checkRateLimit } = require('../utils/rateLimiter');
const { enqueueProcessing } = require('../utils/processingManager');
const config = require('../config');

// ============================================================
// Message Handler — Router utama untuk semua pesan masuk
// ============================================================

async function handleMessage(sock, msg) {
  try {
    if (!msg?.message) return;
    if (msg.key.fromMe) return;

    const jid = msg.key.remoteJid;
    if (jid.endsWith('@g.us')) return;

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      '';

    if (!text) return;
    const input = text.trim();
    if (!input) return;

    console.log(`📩 Pesan dari: ${jid}`);
    console.log(`   Isi: ${input}`);

    const isAllowed = checkRateLimit(jid);
    if (isAllowed === false) {
      await sendText(sock, jid, '⚠️ Anda mengirim pesan terlalu cepat.\n\nSilakan tunggu sebentar sebelum melanjutkan.');
      return;
    } else if (isAllowed === null) {
      return;
    }

    await enqueueProcessing(jid, async () => {
      const state = getState(jid);

      if (!state && isSessionExpired(jid)) {
        clearExpiredStatus(jid);
        resetState(jid);

        const isMenuChoice = ['1', '2', '3', '4'].includes(input);
        if (isMenuChoice) {
          await sendText(sock, jid, `⏰ Sesi sebelumnya telah berakhir karena tidak ada\naktivitas selama beberapa waktu.\n\nMari kita mulai kembali.\n\n${MENU_UTAMA_TEXT}`);
        } else {
          await sendText(sock, jid, `⏰ Sesi sebelumnya telah berakhir karena tidak ada\naktivitas selama beberapa waktu.\n\nUntuk menggunakan layanan AMS, silakan pilih menu\ndengan mengetik angka 1–4.\n\n${MENU_UTAMA_TEXT}`);
        }
        return;
      }

      if (!state) {
        resetState(jid);
        console.log(`   → User baru, tampilkan Menu Utama`);
        await showMenuUtama(sock, jid);
        return;
      }

      touchState(jid);

      // Navigasi 0: Kembali ke Menu Utama dari state mana pun
      // Mereset state sesi bot tanpa menghapus riwayat obrolan WhatsApp user
      if (input === '0') {
        resetState(jid);
        console.log(`   → Kembali ke Menu Utama`);
        await sendText(sock, jid, '↩️ Kembali ke Menu Utama.\n\n' + MENU_UTAMA_TEXT);
        return;
      }

      switch (state.menu) {
        case 'MAIN':
          await handleMenuUtama(sock, jid, input, updateState);
          break;

        case 'PENGAJUAN_ASK':
        case 'PENGAJUAN':
          await handlePengajuanBaru(sock, jid, input, state);
          break;

        case 'PEMBARUAN_ASK':
        case 'PEMBARUAN':
          await handlePembaruanExpired(sock, jid, input, state);
          break;

        case 'PASSPHRASE_GUIDE':
          await handleResetPassphrase(sock, jid, input, state);
          break;

        case 'LIVE_AGEN':
          await sendText(
            sock,
            jid,
            '⚠️ Pilihan tidak valid.\n\nKetik *0* untuk kembali ke Menu Utama.'
          );
          break;

        default:
          console.log(`   ⚠️ State tidak dikenal: ${state.menu}, reset ke MAIN`);
          resetState(jid);
          await showMenuUtama(sock, jid);
          break;
      }
    });
  } catch (err) {
    console.error('❌ Error di messageHandler:', err);
    try {
      const jid = msg?.key?.remoteJid;
      if (jid) {
        await sendText(
          sock,
          jid,
          '⚠️ Maaf, terjadi kesalahan. Silakan coba lagi.'
        );
      }
    } catch (_) {}
  }
}

module.exports = { handleMessage };
