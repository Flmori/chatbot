const fs = require('fs');
const path = require('path');
const config = require('../config');
const { sendText, sendDocument, sendImagesSequentially, delay } = require('../utils/sender');
const { getState, updateState } = require('../state/sessionState');

// ============================================================
// Handler Pembaharuan / Expired — Menu 2
//
// Alur SOP:
//   1. Tanya apakah sertifikat sudah Expired
//      → Sudah Expired: Penjelasan tidak dapat diperbaharui + 2 foto SOP
//        arahan pengajuan baru + Live Agen
//      → Belum Expired: Edukasi H-30, tanya konfirmasi H-30
//   2. Jika H-30 terpenuhi:
//      - Kirim Formulir Permohonan (ceklis Pembaharuan)
//      - Tawarkan Panduan Pembaharuan
//   3. Panduan Pembaharuan:
//      - Kirim 2 foto SOP pembaharuan H-30 + Live Agen
//
// ⚠️ Bot TIDAK memiliki akses ke AMS.
//    Bot TIDAK mengecek status sertifikat atau menghitung H-30.
//    Bot hanya memberikan informasi, mengirim form, dan foto SOP.
// ============================================================

// ============================================================
// Konstanta Teks
// ============================================================

const CHECK_EXPIRED_TEXT = `🔄 Menu Pembaharuan

Sebelum melanjutkan, silakan periksa terlebih dahulu status sertifikat Anda pada aplikasi AMS.

Apakah sertifikat Anda sudah Expired?

1️⃣ Sudah Expired
2️⃣ Belum Expired
0️⃣ Menu Utama`;

const EXPIRED_INFO_TEXT = `⚠️ *Sertifikat Expired / Revoke*

Berdasarkan ketentuan Juknis, sertifikat yang sudah *Expired* atau *Revoke* tidak dapat dilakukan pembaharuan.

Untuk mendapatkan sertifikat baru, Anda perlu melakukan *pengajuan/penerbitan sertifikat baru* melalui proses yang berlaku.

Berikut informasi SOP terkait kondisi sertifikat Expired:`;

const CHECK_H30_TEXT = `📋 *Ketentuan Pembaharuan Sertifikat — H-30*

Berdasarkan ketentuan Juknis, pembaharuan sertifikat hanya dapat dilakukan apabila sertifikat masih *aktif* dan sudah memasuki periode *H-30 sebelum masa berlaku berakhir*.

Bot tidak dapat mengecek atau menghitung periode H-30 secara otomatis. Silakan periksa masa berlaku sertifikat Anda pada aplikasi AMS.

Apakah sertifikat Anda sudah masuk H-30?

1️⃣ Ya, Sudah Masuk H-30
0️⃣ Menu Utama`;

const FORM_INTRO_TEXT = `✅ Formulir Permohonan akan dikirimkan.

📄 Petunjuk Pengisian:
1. Isi formulir permohonan yang kami lampirkan berikut.
2. Centang opsi *Pembaharuan* pada formulir.
3. Lengkapi dan tanda tangani sesuai kebutuhan.
4. Ajukan kepada Verifikator Kominfo untuk diproses.`;

const FORM_SENT_TEXT = `📄 Dokumen formulir telah terkirim.

Silakan isi formulir dengan mencantumkan ceklis pada opsi:
☑️ *Pembaharuan*

Setelah formulir diisi dan ditandatangani, ajukan kepada Verifikator Kominfo untuk diproses.

Ketik:
1️⃣ Lihat Panduan Pembaharuan
0️⃣ Menu Utama`;

const INVALID_CHECK_EXPIRED_TEXT = `⚠️ Pilihan tidak valid.

Silakan pilih:

1️⃣ Sudah Expired
2️⃣ Belum Expired
0️⃣ Menu Utama`;

const INVALID_CHECK_H30_TEXT = `⚠️ Pilihan tidak valid.

Silakan pilih:

1️⃣ Ya, Sudah Masuk H-30
0️⃣ Menu Utama`;

const INVALID_FORM_SENT_TEXT = `⚠️ Pilihan tidak valid.

Silakan pilih:

1️⃣ Lihat Panduan Pembaharuan
0️⃣ Menu Utama`;

const INVALID_TERMINAL_TEXT = `Silakan ketik 0️⃣ untuk kembali ke Menu Utama.`;

// ============================================================
// Fungsi helper: format kontak Live Agen dari config
// ============================================================

function getLiveAgenLines() {
  return config.liveAgents
    .map(
      (a) =>
        `👤 ${a.name} (${a.label}): ${a.displayPhone}\n🔗 Chat WA: ${a.waLink}`
    )
    .join('\n\n');
}

// ============================================================
// Fungsi helper: teks penutup Expired (setelah 2 foto SOP)
// ============================================================

function getExpiredCompleteText() {
  const agentLines = getLiveAgenLines();

  return `⚠️ Sertifikat yang sudah Expired tidak dapat diperbaharui.

Untuk mendapatkan sertifikat baru, silakan lakukan pengajuan/penerbitan sertifikat baru melalui Menu 1 (Pengajuan Baru) atau berkoordinasi dengan Verifikator Kominfo.

Jika membutuhkan informasi atau bantuan lebih lanjut, silakan hubungi Live Agen kami:

${agentLines}

Ketik:
0️⃣ Menu Utama`;
}

// ============================================================
// Fungsi helper: teks penutup Pembaharuan H-30 (setelah 2 foto SOP)
// ============================================================

function getPembaruanCompleteText() {
  const agentLines = getLiveAgenLines();

  return `✅ Panduan pembaharuan telah selesai dikirimkan.

Silakan mengikuti langkah pada SOP dan berkoordinasi dengan Verifikator Kominfo untuk proses selanjutnya.

Jika membutuhkan informasi atau bantuan lebih lanjut, silakan hubungi Live Agen kami:

${agentLines}

Ketik:
0️⃣ Menu Utama`;
}

// ============================================================
// Fungsi helper: path & caption gambar dari config
// ============================================================

function getExpiredImagePaths() {
  const folder = config.imagePaths.pembaruan;
  // Gambar Expired: index 2 dan 3 dari array config
  const files = config.imageFiles.pembaruan.slice(2, 4);
  return files.map((f) => path.join(folder, f));
}

function getExpiredCaptions() {
  // Caption Expired: index 2 dan 3 dari array config
  return config.imageCaptions.pembaruan.slice(2, 4);
}

function getPembaruanImagePaths() {
  const folder = config.imagePaths.pembaruan;
  // Gambar Belum Expired/H-30: index 0 dan 1 dari array config
  const files = config.imageFiles.pembaruan.slice(0, 2);
  return files.map((f) => path.join(folder, f));
}

function getPembaruanCaptions() {
  // Caption Belum Expired/H-30: index 0 dan 1 dari array config
  return config.imageCaptions.pembaruan.slice(0, 2);
}

// ============================================================
// Entry point — dipanggil dari menuUtama saat user pilih "2"
// ============================================================

async function startPembaruanExpired(sock, jid) {
  updateState(jid, { menu: 'PEMBARUAN_ASK', step: 'CHECK_EXPIRED' });
  await sendText(sock, jid, CHECK_EXPIRED_TEXT);
}

// ============================================================
// Handler utama alur Pembaharuan
// ============================================================

async function handlePembaruanExpired(sock, jid, input, state) {
  const step = state?.step || 'CHECK_EXPIRED';

  switch (step) {
    // ----------------------------------------------------------
    // STEP 1: Cek apakah sertifikat sudah Expired
    // ----------------------------------------------------------
    case 'CHECK_EXPIRED': {
      if (input === '1') {
        // SUDAH EXPIRED → kirim info + 2 foto SOP Expired + Live Agen
        updateState(jid, { menu: 'PEMBARUAN_ASK', step: 'SENDING_EXPIRED' });
        await sendText(sock, jid, EXPIRED_INFO_TEXT);
        await delay(800);

        const images = getExpiredImagePaths();
        const captions = getExpiredCaptions();
        const success = await sendImagesSequentially(sock, jid, images, captions);

        const curState = getState(jid);
        if (curState && curState.menu === 'PEMBARUAN_ASK' && curState.step === 'SENDING_EXPIRED') {
          if (success) {
            updateState(jid, { menu: 'PEMBARUAN_ASK', step: 'EXPIRED_GUIDE' });
            await sendText(sock, jid, getExpiredCompleteText());
          } else {
            updateState(jid, { menu: 'PEMBARUAN_ASK', step: 'CHECK_EXPIRED' });
            await sendText(sock, jid, '⚠️ Gagal mengirim panduan. Silakan coba pilih "1" lagi nanti.');
          }
        }
      } else if (input === '2') {
        // BELUM EXPIRED → edukasi H-30 + tanya konfirmasi
        updateState(jid, { menu: 'PEMBARUAN_ASK', step: 'CHECK_H30' });
        await sendText(sock, jid, CHECK_H30_TEXT);
      } else {
        await sendText(sock, jid, INVALID_CHECK_EXPIRED_TEXT);
      }
      break;
    }

    // ----------------------------------------------------------
    // STEP 2a: Konfirmasi H-30
    // ----------------------------------------------------------
    case 'CHECK_H30': {
      if (input === '1') {
        // YA, SUDAH H-30 → kirim Formulir Permohonan
        updateState(jid, { menu: 'PEMBARUAN_ASK', step: 'FORM_SENT' });
        await sendText(sock, jid, FORM_INTRO_TEXT);

        const formPath = config.docPaths.formulirPermohonan;
        const formSuccess = await sendDocument(
          sock,
          jid,
          formPath,
          'Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx',
          '📋 Formulir Surat Permohonan Tanda Tangan Elektronik'
        );

        const curState = getState(jid);
        if (curState && curState.menu === 'PEMBARUAN_ASK' && curState.step === 'FORM_SENT') {
          if (formSuccess) {
            await sendText(sock, jid, FORM_SENT_TEXT);
          } else {
            updateState(jid, { menu: 'PEMBARUAN_ASK', step: 'CHECK_H30' });
            await sendText(sock, jid, '⚠️ Gagal mengirim formulir. Silakan coba pilih "1" lagi nanti.');
          }
        }
      } else {
        await sendText(sock, jid, INVALID_CHECK_H30_TEXT);
      }
      break;
    }

    // ----------------------------------------------------------
    // STEP 2b: Form sudah dikirim → tawarkan panduan
    // ----------------------------------------------------------
    case 'FORM_SENT': {
      if (input === '1') {
        // Lihat Panduan Pembaharuan → kirim 2 foto SOP H-30
        updateState(jid, { menu: 'PEMBARUAN_ASK', step: 'SENDING_PEMBARUAN' });
        await sendText(sock, jid, '📖 Berikut panduan pembaharuan sertifikat di aplikasi AMS.\nGambar panduan akan dikirim satu per satu.');
        await delay(800);

        const images = getPembaruanImagePaths();
        const captions = getPembaruanCaptions();
        const success = await sendImagesSequentially(sock, jid, images, captions);

        const curState = getState(jid);
        if (curState && curState.menu === 'PEMBARUAN_ASK' && curState.step === 'SENDING_PEMBARUAN') {
          if (success) {
            updateState(jid, { menu: 'PEMBARUAN_ASK', step: 'PEMBARUAN_COMPLETE' });
            await sendText(sock, jid, getPembaruanCompleteText());
          } else {
            updateState(jid, { menu: 'PEMBARUAN_ASK', step: 'FORM_SENT' });
            await sendText(sock, jid, '⚠️ Gagal mengirim panduan. Silakan coba pilih "1" lagi nanti.');
          }
        }
      } else {
        await sendText(sock, jid, INVALID_FORM_SENT_TEXT);
      }
      break;
    }

    // ----------------------------------------------------------
    // State pengiriman gambar sedang berlangsung
    // ----------------------------------------------------------
    case 'SENDING_EXPIRED':
    case 'SENDING_PEMBARUAN': {
      await sendText(sock, jid, '⏳ Panduan sedang dikirim, silakan tunggu.\n\nKetik:\n0️⃣ Menu Utama');
      break;
    }

    // ----------------------------------------------------------
    // Terminal state: Expired selesai
    // ----------------------------------------------------------
    case 'EXPIRED_GUIDE': {
      await sendText(sock, jid, INVALID_TERMINAL_TEXT);
      break;
    }

    // ----------------------------------------------------------
    // Terminal state: Pembaharuan selesai
    // ----------------------------------------------------------
    case 'PEMBARUAN_COMPLETE': {
      await sendText(sock, jid, INVALID_TERMINAL_TEXT);
      break;
    }

    // ----------------------------------------------------------
    // Default: fallback ke CHECK_EXPIRED
    // ----------------------------------------------------------
    default: {
      updateState(jid, { menu: 'PEMBARUAN_ASK', step: 'CHECK_EXPIRED' });
      await sendText(sock, jid, CHECK_EXPIRED_TEXT);
      break;
    }
  }
}

module.exports = {
  startPembaruanExpired,
  handlePembaruanExpired,
  CHECK_EXPIRED_TEXT,
  CHECK_H30_TEXT,
  FORM_INTRO_TEXT,
  FORM_SENT_TEXT,
  EXPIRED_INFO_TEXT,
  INVALID_CHECK_EXPIRED_TEXT,
  INVALID_CHECK_H30_TEXT,
  INVALID_FORM_SENT_TEXT,
  getExpiredCompleteText,
  getPembaruanCompleteText,
  getExpiredImagePaths,
  getExpiredCaptions,
  getPembaruanImagePaths,
  getPembaruanCaptions,
};
