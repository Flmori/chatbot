const { sendText, sendImagesSequentially, delay } = require('../utils/sender');
const { updateState } = require('../state/sessionState');
const config = require('../config');
const path = require('path');

// ============================================================
// Handler Reset Passphrase
//
// Alur (sesuai dokumen desain):
//   Entry : Tampilkan panduan reset passphrase, lalu kirim
//           5 gambar langkah-langkah:
//             1. Buka daftar sertifikat
//             2. Pilih Aksi → Reset Passphrase
//             3. Link reset dikirim ke email pengguna
//             4. User buka link → Pengecekan Foto
//             5. Buat Passphrase Baru → Selesai
//
// ⚠️ Bot hanya memberikan panduan. Bot tidak meminta atau
//    menyimpan passphrase, password, maupun OTP pengguna.
// ============================================================

const PANDUAN_INTRO_TEXT = `🔐 *Reset Passphrase*

Berikut panduan untuk mereset passphrase sertifikat Anda di aplikasi AMS.

⚠️ *Catatan Keamanan:*
Bot ini hanya memberikan panduan. Bot tidak pernah meminta atau menyimpan passphrase, password, maupun OTP Anda.

─────────────────────────
Gambar panduan akan dikirim satu per satu.`;

const SELESAI_TEXT = `✅ *Panduan reset passphrase selesai dikirimkan!*

Ikuti langkah-langkah pada gambar di atas untuk mereset passphrase sertifikat Anda.

Jika masih mengalami kendala, silakan hubungi Live Agen kami.

Ketik:
3️⃣ Reset Passphrase (ulangi)
4️⃣ Live Agen
0️⃣ Menu Utama`;

// ============================================================
// Entry point — dipanggil dari menuUtama saat user pilih "3"
// ============================================================

async function startResetPassphrase(sock, jid) {
  // Langsung kirim panduan — tidak butuh state tambahan
  updateState(jid, { menu: 'MAIN', step: 0, data: {} });
  await sendText(sock, jid, PANDUAN_INTRO_TEXT);
  await delay(800);
  await kirimPanduanPassphrase(sock, jid);
  await sendText(sock, jid, SELESAI_TEXT);
}

// ============================================================
// Fungsi bantu: kirim 5 gambar panduan reset passphrase
// ============================================================

async function kirimPanduanPassphrase(sock, jid) {
  const folder = config.imagePaths.passphrase;
  const files = config.imageFiles.passphrase;
  const captions = config.imageCaptions.passphrase;

  const imagePaths = files.map((f) => path.join(folder, f));
  await sendImagesSequentially(sock, jid, imagePaths, captions);
}

module.exports = {
  startResetPassphrase,
};
