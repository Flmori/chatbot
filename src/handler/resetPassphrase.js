const path = require('path');
const config = require('../config');
const { sendText, sendDocument, sendImagesSequentially, delay } = require('../utils/sender');
const { getState, updateState } = require('../state/sessionState');

// ============================================================
// Handler Reset Passphrase — Menu 3
//
// Alur Pelayanan (mengikuti pola Menu 1):
//   1. Entry (startResetPassphrase):
//      - Set state ke { menu: 'PASSPHRASE_GUIDE', step: 'FORM_SENT' }
//      - Kirim penjelasan permohonan Reset Passphrase & catatan keamanan
//      - Kirim template Formulir Surat Permohonan resmi (DOCX) via sendDocument
//      - Kirim ringkasan alur SOP pengajuan mandiri + opsi panduan
//   2. Step FORM_SENT:
//      - Pilihan 1: Kirim panduan teknis Juknis AMS (2 foto)
//      - Pilihan 0: Kembali ke Menu Utama (handled globally by messageHandler)
//   3. Panduan Teknis (2 foto):
//      - Foto 1: reset_passphrase_01.png (Halaman 44)
//      - Foto 2: reset_passphrase_02.png (Halaman 45)
//      - Ditutup dengan ringkasan alur SOP + kontak Live Agen + opsi Menu Utama
//
// ⚠️ Batasan Penting:
//   - Bot hanya mengirim formulir resmi sebagai template.
//   - Bot TIDAK menerima kembali formulir yang sudah diisi oleh user.
//   - Bot TIDAK memeriksa apakah formulir sudah diisi.
//   - Bot TIDAK menerima scan/foto formulir.
//   - Bot TIDAK mengirim formulir user ke Verifikator.
//   - Pengisian dan pengiriman formulir dilakukan sendiri oleh user
//     secara mandiri kepada pihak Verifikator Kominfo / Live Agen.
//   - Bot TIDAK memiliki akses ke aplikasi/database AMS.
//   - Bot TIDAK melakukan reset passphrase secara otomatis.
//   - Bot TIDAK pernah meminta, menerima, atau menyimpan passphrase,
//     password, PIN, maupun OTP.
//   - Panduan "Ubah Passphrase" Halaman 42–43 TIDAK DISERTAKAN.
// ============================================================

const PASSPHRASE_INTRO_TEXT = `🔐 RESET PASSPHRASE — Tanda Tangan Elektronik AMS

Layanan ini memandu prosedur permohonan reset passphrase bagi pengguna yang lupa kata sandi sertifikat elektronik AMS.

📄 Ketentuan Pengajuan:
1. Permohonan resmi wajib menggunakan Formulir Surat Permohonan yang kami lampirkan berikut.
2. Pada formulir, silakan beri tanda centang pada opsi: [X] Reset Passphrase.
3. Formulir yang telah diisi dan ditandatangani diajukan secara mandiri kepada pihak Verifikator Kominfo / Live Agen untuk diproses pada aplikasi AMS.

⚠️ Catatan Keamanan:
Bot ini TIDAK PERNAH meminta, menerima, maupun menyimpan passphrase, password, PIN, atau OTP Anda. Bot juga tidak menerima pengembalian berkas formulir via chat ini.`;

const FORM_SENT_TEXT = `📄 Dokumen formulir telah terkirim.

Ringkasan Alur SOP Reset Passphrase:
1. Isi formulir permohonan dan centang opsi [X] Reset Passphrase.
2. Tanda tangani formulir permohonan tersebut.
3. Ajukan formulir secara mandiri kepada pihak Kominfo / Verifikator / Live Agen.
4. Verifikator memproses permohonan reset pada aplikasi AMS.
5. Pengguna menerima notifikasi tautan (link) reset melalui Email Dinas.
6. Pengguna membuka tautan dan membuat passphrase baru sesuai petunjuk.

Ketik:
1️⃣ Lihat Panduan Reset Passphrase (Berdasarkan Juknis)
0️⃣ Menu Utama`;

const JUKNIS_INTRO_TEXT = `📖 Panduan Teknis Reset Passphrase (Berdasarkan Juknis AMS Halaman 44–45)

Berikut langkah-langkah teknis reset passphrase pada aplikasi AMS. Gambar panduan akan dikirim satu per satu:`;

const INVALID_FORM_SENT_TEXT = `⚠️ Pilihan tidak valid.

Ketik:
1️⃣ Lihat Panduan Reset Passphrase (Berdasarkan Juknis)
0️⃣ Menu Utama`;

const INVALID_TERMINAL_TEXT = `⚠️ Ketik 0 untuk kembali ke Menu Utama.`;

// ============================================================
// Fungsi helper: kontak Live Agen dari config.liveAgents
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
// Fungsi helper: teks penutup alur Reset Passphrase
// ============================================================

function getPassphraseCompleteText() {
  const agentLines = getLiveAgenLines();

  return `✅ Panduan reset passphrase telah selesai dikirimkan.

Ringkasan Alur SOP Reset Passphrase:
1. Isi formulir permohonan dengan mencentang opsi [X] Reset Passphrase lalu tanda tangani.
2. Ajukan formulir secara mandiri kepada pihak Kominfo / Verifikator / Live Agen.
3. Verifikator memproses dan menyetujui permohonan reset pada aplikasi AMS.
4. Pengguna menerima notifikasi tautan (link) reset melalui Email Dinas.
5. Pengguna mengakses tautan tersebut untuk membuat passphrase baru sesuai petunjuk.

Jika membutuhkan informasi lebih lanjut atau ingin mengajukan formulir, silakan hubungi Live Agen kami:

${agentLines}

Ketik:
0️⃣ Menu Utama`;
}

// ============================================================
// Fungsi helper: path & caption gambar dari config
// ============================================================

function getPassphraseImagePaths() {
  const folder = config.imagePaths.passphrase;
  const files = config.imageFiles.passphrase;
  return files.map((f) => path.join(folder, f));
}

function getPassphraseCaptions() {
  return config.imageCaptions.passphrase;
}

// ============================================================
// Entry point — dipanggil saat user pilih "3" di Menu Utama
// ============================================================

async function startResetPassphrase(sock, jid) {
  updateState(jid, { menu: 'PASSPHRASE_GUIDE', step: 'FORM_SENT' });
  await sendText(sock, jid, PASSPHRASE_INTRO_TEXT);

  const formPath = config.docPaths.formulirPermohonan;
  const formSuccess = await sendDocument(
    sock,
    jid,
    formPath,
    'Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx',
    '📋 Formulir Permohonan Sertifikat Elektronik AMS\nSilakan centang opsi: [X] Reset Passphrase'
  );

  const curState = getState(jid);
  if (curState && curState.menu === 'PASSPHRASE_GUIDE' && curState.step === 'FORM_SENT') {
    if (formSuccess) {
      await sendText(sock, jid, FORM_SENT_TEXT);
    } else {
      await sendText(sock, jid, '⚠️ Gagal mengirim formulir permohonan. Silakan coba kembali nanti.\n\nKetik:\n0️⃣ Menu Utama');
    }
  }
}

// ============================================================
// Handler utama alur Reset Passphrase
// ============================================================

async function handleResetPassphrase(sock, jid, input, state) {
  const step = state?.step || 'FORM_SENT';

  switch (step) {
    // ----------------------------------------------------------
    // STEP 1: Formulir telah dikirim → tawarkan panduan Juknis
    // ----------------------------------------------------------
    case 'FORM_SENT': {
      if (input === '1') {
        // User pilih 1: Kirim panduan teknis 2 foto SOP Juknis
        updateState(jid, { menu: 'PASSPHRASE_GUIDE', step: 'SENDING_GUIDE' });
        await sendText(sock, jid, JUKNIS_INTRO_TEXT);
        await delay(800);

        const images = getPassphraseImagePaths();
        const captions = getPassphraseCaptions();
        const success = await sendImagesSequentially(sock, jid, images, captions);

        const curState = getState(jid);
        if (curState && curState.menu === 'PASSPHRASE_GUIDE' && curState.step === 'SENDING_GUIDE') {
          if (success) {
            updateState(jid, { menu: 'PASSPHRASE_GUIDE', step: 'TUTORIAL_COMPLETE' });
            await sendText(sock, jid, getPassphraseCompleteText());
          } else {
            updateState(jid, { menu: 'PASSPHRASE_GUIDE', step: 'FORM_SENT' });
            await sendText(sock, jid, '⚠️ Gagal mengirim panduan gambar. Silakan coba pilih "1" lagi nanti.\n\nKetik:\n1️⃣ Coba Lagi\n0️⃣ Menu Utama');
          }
        }
      } else {
        await sendText(sock, jid, INVALID_FORM_SENT_TEXT);
      }
      break;
    }

    // ----------------------------------------------------------
    // State transisi: sedang mengirim gambar
    // ----------------------------------------------------------
    case 'SENDING_GUIDE': {
      await sendText(sock, jid, '⏳ Panduan sedang dikirim, silakan tunggu.\n\nKetik:\n0️⃣ Menu Utama');
      break;
    }

    // ----------------------------------------------------------
    // Terminal state: panduan selesai dikirim
    // ----------------------------------------------------------
    case 'TUTORIAL_COMPLETE': {
      await sendText(sock, jid, INVALID_TERMINAL_TEXT);
      break;
    }

    // ----------------------------------------------------------
    // Default fallback
    // ----------------------------------------------------------
    default: {
      updateState(jid, { menu: 'PASSPHRASE_GUIDE', step: 'FORM_SENT' });
      await sendText(sock, jid, FORM_SENT_TEXT);
      break;
    }
  }
}

module.exports = {
  startResetPassphrase,
  handleResetPassphrase,
  PASSPHRASE_INTRO_TEXT,
  FORM_SENT_TEXT,
  JUKNIS_INTRO_TEXT,
  INVALID_FORM_SENT_TEXT,
  INVALID_TERMINAL_TEXT,
  getPassphraseCompleteText,
  getPassphraseImagePaths,
  getPassphraseCaptions,
  getLiveAgenLines,
};
