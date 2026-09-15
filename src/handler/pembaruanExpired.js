const { sendText, sendImagesSequentially, delay } = require('../utils/sender');
const { updateState } = require('../state/sessionState');
const config = require('../config');
const path = require('path');

// ============================================================
// Handler Pembaruan / Expired
//
// Alur (sesuai dokumen desain):
//   Entry : Tampilkan catatan H-30, lalu langsung kirim
//           5 gambar panduan pembaruan sertifikat.
//
// Catatan: Jika sertifikat sudah expired, tidak dapat diperbarui
// melalui alur ini — user perlu mengajukan sertifikat baru.
// ============================================================

const CATATAN_H30_TEXT = `🔄 *Pembaruan / Expired Sertifikat*

⚠️ *Catatan Penting — H-30:*
Pembaruan sertifikat hanya dapat dilakukan ketika masa berlaku sertifikat sudah memasuki *H-30 sebelum kedaluwarsa*.

Jika sertifikat Anda *sudah expired*, pembaruan tidak dapat dilakukan melalui alur ini. Anda perlu mengajukan *sertifikat baru* melalui menu Pengajuan Baru.

─────────────────────────
📋 Berikut panduan pembaruan sertifikat di aplikasi AMS.
Gambar panduan akan dikirim satu per satu.`;

const SELESAI_TEXT = `✅ *Panduan pembaruan selesai dikirimkan!*

Ikuti langkah-langkah pada gambar di atas untuk memperbarui sertifikat Anda di aplikasi AMS.

Jika masih mengalami kendala, silakan hubungi Live Agen kami.

Ketik:
2️⃣ Pembaruan / Expired (ulangi)
4️⃣ Live Agen
0️⃣ Menu Utama`;

// ============================================================
// Entry point — dipanggil dari menuUtama saat user pilih "2"
// ============================================================

async function startPembaruanExpired(sock, jid) {
  // Langsung kirim — tidak butuh state tambahan
  updateState(jid, { menu: 'MAIN', step: 0, data: {} });
  await sendText(sock, jid, CATATAN_H30_TEXT);
  await delay(800);
  await kirimPanduanPembaruan(sock, jid);
  await sendText(sock, jid, SELESAI_TEXT);
}

// ============================================================
// Fungsi bantu: kirim 5 gambar panduan pembaruan berurutan
// ============================================================

async function kirimPanduanPembaruan(sock, jid) {
  const folder = config.imagePaths.pembaruan;
  const files = config.imageFiles.pembaruan;
  const captions = config.imageCaptions.pembaruan;

  const imagePaths = files.map((f) => path.join(folder, f));
  await sendImagesSequentially(sock, jid, imagePaths, captions);
}

module.exports = {
  startPembaruanExpired,
};
