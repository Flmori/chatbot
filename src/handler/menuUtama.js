const { sendText } = require('../utils/sender');
const { startPengajuanBaru } = require('./pengajuanBaru');
const { startPembaruanExpired } = require('./pembaruanExpired');
const { startResetPassphrase } = require('./resetPassphrase');
const { startLiveAgen } = require('./liveAgen');
const config = require('../config');

// ============================================================
// Menu Utama — Menampilkan pilihan layanan dan menangani input
// ============================================================

const MENU_UTAMA_TEXT = `🤖 Halo, selamat datang di Layanan Bantuan Tanda Tangan Elektronik AMS.

Silakan pilih layanan:

1️⃣ Pengajuan Baru
2️⃣ Pembaharuan / Expired
3️⃣ Reset Passphrase
4️⃣ Live Agen

Ketik angka sesuai kebutuhan Anda.`;

const INVALID_INPUT_TEXT = `⚠️ Pilihan tidak valid.

Silakan pilih salah satu menu:

1️⃣ Pengajuan Baru
2️⃣ Pembaharuan / Expired
3️⃣ Reset Passphrase
4️⃣ Live Agen`;

const STANDBY_TEXT = `ℹ️ Layanan ini sedang dalam proses penyiapan SOP terbaru.

Silakan kembali ke Menu Utama atau hubungi petugas Live Agen kami jika mendesak.

4️⃣ Hubungi Live Agen
0️⃣ Menu Utama`;

const MENU_CHOICES = {
  '1': 'PENGAJUAN_ASK',
  '2': 'PEMBARUAN_ASK',
  '3': 'PASSPHRASE_GUIDE',
  '4': 'LIVE_AGEN',
};

async function showMenuUtama(sock, jid) {
  await sendText(sock, jid, MENU_UTAMA_TEXT);
}

async function handleMenuUtama(sock, jid, input, updateState) {
  const targetMenu = MENU_CHOICES[input];

  if (targetMenu) {
    if (targetMenu === 'PENGAJUAN_ASK') {
      await startPengajuanBaru(sock, jid);
    } else if (targetMenu === 'PEMBARUAN_ASK') {
      await startPembaruanExpired(sock, jid);
    } else if (targetMenu === 'PASSPHRASE_GUIDE') {
      await startResetPassphrase(sock, jid);
    } else if (targetMenu === 'LIVE_AGEN') {
      await startLiveAgen(sock, jid);
    }
  } else {
    await sendText(sock, jid, INVALID_INPUT_TEXT);
  }
}

module.exports = {
  showMenuUtama,
  handleMenuUtama,
  MENU_UTAMA_TEXT,
  INVALID_INPUT_TEXT,
  STANDBY_TEXT,
  MENU_CHOICES,
};
