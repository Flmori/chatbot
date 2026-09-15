const fs = require('fs');
const path = require('path');
const config = require('../config');

// ============================================================
// Sender Utility — Helper pengiriman pesan WhatsApp
// ============================================================

/**
 * Mengirim pesan teks ke JID.
 * @param {Object} sock - Baileys socket
 * @param {string} jid  - WhatsApp JID penerima
 * @param {string} text - Isi pesan
 */
async function sendText(sock, jid, text) {
  try {
    await sock.sendMessage(jid, { text });
  } catch (err) {
    console.error(`❌ Gagal kirim teks ke ${jid}:`, err.message);
  }
}

/**
 * Mengirim satu gambar dengan caption opsional.
 * @param {Object} sock    - Baileys socket
 * @param {string} jid     - WhatsApp JID penerima
 * @param {string} imagePath - Path absolut ke file gambar
 * @param {string} [caption] - Caption gambar (opsional)
 * @returns {Promise<boolean>} - true jika berhasil, false jika gagal
 */
async function sendImage(sock, jid, imagePath, caption = '') {
  try {
    // Periksa apakah file gambar ada
    if (!fs.existsSync(imagePath)) {
      console.error(`⚠️  File gambar tidak ditemukan: ${imagePath}`);
      await sendText(sock, jid, `⚠️ Maaf, gambar panduan tidak tersedia saat ini.`);
      return false;
    }

    const imageBuffer = fs.readFileSync(imagePath);

    await sock.sendMessage(jid, {
      image: imageBuffer,
      caption: caption || undefined,
    });
    
    return true;
  } catch (err) {
    console.error(`❌ Gagal kirim gambar ke ${jid}:`, err.message);
    // Jangan crash — kirim pesan fallback
    try {
      await sendText(sock, jid, `⚠️ Maaf, terjadi kesalahan saat mengirim gambar.`);
    } catch (_) {
      // Jika fallback juga gagal, cukup log saja
      console.error(`❌ Gagal kirim fallback ke ${jid}`);
    }
    return false;
  }
}

/**
 * Mengirim dokumen (file .docx, .pdf, dll) ke JID.
 * @param {Object}  sock     - Baileys socket
 * @param {string}  jid      - WhatsApp JID penerima
 * @param {string}  filePath - Path absolut ke file dokumen
 * @param {string}  fileName - Nama file yang ditampilkan di WhatsApp
 * @param {string}  [caption] - Caption dokumen (opsional)
 * @returns {Promise<boolean>} - true jika berhasil, false jika gagal
 */
async function sendDocument(sock, jid, filePath, fileName, caption = '') {
  try {
    // Periksa apakah file dokumen ada
    if (!fs.existsSync(filePath)) {
      console.error(`⚠️  File dokumen tidak ditemukan: ${filePath}`);
      await sendText(sock, jid, `⚠️ Maaf, dokumen tidak tersedia saat ini.`);
      return false;
    }

    const docBuffer = fs.readFileSync(filePath);

    // Tentukan mimetype berdasarkan ekstensi
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.pdf': 'application/pdf',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    const mimetype = mimeTypes[ext] || 'application/octet-stream';

    await sock.sendMessage(jid, {
      document: docBuffer,
      mimetype,
      fileName: fileName || path.basename(filePath),
      caption: caption || undefined,
    });

    console.log(`📄 Dokumen terkirim ke ${jid}: ${fileName}`);
    return true;
  } catch (err) {
    console.error(`❌ Gagal kirim dokumen ke ${jid}:`, err.message);
    // Jangan crash — kirim pesan fallback
    try {
      await sendText(sock, jid, `⚠️ Maaf, terjadi kesalahan saat mengirim dokumen.`);
    } catch (_) {
      console.error(`❌ Gagal kirim fallback ke ${jid}`);
    }
    return false;
  }
}

/**
 * Helper: delay/tunggu selama ms milidetik.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mengirim beberapa gambar secara berurutan (sequential) dengan delay.
 *
 * Urutan pengiriman:
 *   gambar 1 → delay → gambar 2 → delay → gambar 3 → ...
 *
 * Jika satu gambar gagal (misal koneksi terputus), proses pengiriman dihentikan
 * agar state tidak menggantung dan pesan error tidak berulang kali dikirim.
 *
 * @param {Object}   sock     - Baileys socket
 * @param {string}   jid      - WhatsApp JID penerima
 * @param {string[]} images   - Array path absolut ke file gambar
 * @param {string[]} [captions] - Array caption, index sejajar dengan images
 * @returns {Promise<boolean>} - true jika SEMUA gambar berhasil, false jika ada yang gagal
 */
async function sendImagesSequentially(sock, jid, images, captions = []) {
  for (let i = 0; i < images.length; i++) {
    const imagePath = images[i];
    const caption = captions[i] || '';

    const success = await sendImage(sock, jid, imagePath, caption);
    
    // Jika gagal mengirim (contoh: koneksi putus), hentikan pengiriman sisa gambar
    if (!success) {
      console.error(`⚠️ Pengiriman gambar sekuensial dihentikan pada langkah ${i + 1} karena error.`);
      return false;
    }

    // Tambahkan delay antar gambar (kecuali gambar terakhir)
    if (i < images.length - 1) {
      await delay(config.sendDelay);
    }
  }
  
  return true;
}

module.exports = {
  sendText,
  sendImage,
  sendDocument,
  sendImagesSequentially,
  delay,
};
