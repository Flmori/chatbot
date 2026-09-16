const fs = require('fs');
const path = require('path');
const config = require('../config');
const { sendText, sendDocument, sendImagesSequentially } = require('../utils/sender');
const { getState, updateState } = require('../state/sessionState');
const { startLiveAgen, getLiveAgenText } = require('./liveAgen');

// ============================================================
// Pengajuan Baru Handler — Menu 1
//
// Alur SOP:
//   1. Tanya apakah user sudah mempunyai Email Dinas
//      → Belum: Penjelasan ajukan pembuatan Email Dinas ke Kominfo + kontak Live Agen
//      → Sudah: Penjelasan pengisian formulir permohonan + kirim DOCX
//   2. Setelah formulir dikirim:
//      - Rincian alur SOP (Isi form → ajukan ke Kominfo/Verifikator → Verifikator
//        input AMS → terima link di email dinas → aktivasi akun → buat passphrase)
//      - Opsi melihat Panduan Aktivasi AMS (Juknis)
//   3. Panduan Aktivasi AMS:
//      - Kirim gambar langkah panduan aktivasi Juknis
//      - Penutup ringkasan SOP + opsi Live Agen (4) & Menu Utama (0)
// ============================================================

const CHECK_EMAIL_DINAS_TEXT = `📋 PENGAJUAN BARU — Tanda Tangan Elektronik AMS

Apakah Anda sudah mempunyai Email Dinas?

1️⃣ Sudah
2️⃣ Belum

0️⃣ Menu Utama`;

function getNoEmailGuideText() {
  const agentLines = config.liveAgents
    .map(
      (a) =>
        `👤 ${a.name} (${a.label}): ${a.displayPhone}\n🔗 Chat WA: ${a.waLink}`
    )
    .join('\n\n');

  return `⚠️ Untuk pembuatan Tanda Tangan Elektronik, Anda wajib memiliki Akun Email Dinas resmi terlebih dahulu.

Silakan mengajukan permohonan pembuatan Email Dinas ke Dinas Komunikasi dan Informatika setempat.

Apabila membutuhkan bantuan atau informasi lebih lanjut, silakan hubungi Live Agen kami:

${agentLines}

⏰ Jam Operasional: ${config.operationalHours}

Ketik:
0️⃣ Menu Utama`;
}

const FORM_INTRO_TEXT = `✅ Persyaratan Email Dinas terpenuhi.

📄 Petunjuk Pengajuan:
1. Anda perlu mengisi Formulir Surat Permohonan yang kami lampirkan berikut.
2. Ajukan formulir yang sudah diisi kepada pihak Kominfo / Verifikator.
3. Verifikator akan menginput data Anda ke sistem aplikasi AMS.
4. Setelah diproses, Anda akan menerima link aktivasi melalui Email Dinas.`;

const FORM_SENT_TEXT = `📄 Dokumen formulir telah terkirim.

Ringkasan Alur SOP:
1. Isi formulir permohonan.
2. Ajukan formulir ke Kominfo / Verifikator.
3. Verifikator menginput data ke AMS.
4. User menerima link aktivasi melalui Email Dinas.
5. User melakukan aktivasi akun.
6. Setelah aktivasi, user membuat Passphrase melalui link yang dikirim melalui email.

Ketik:
1️⃣ Lihat Panduan Aktivasi AMS (Berdasarkan Juknis)
0️⃣ Menu Utama`;

const JUKNIS_INTRO_TEXT = `📋 Panduan Aktivasi Akun AMS (Berdasarkan Juknis)

Setelah Verifikator Kominfo menginput data Anda ke sistem AMS, ikuti langkah-langkah aktivasi berikut ini:`;

function getTutorialCompleteText() {
  const agentLines = config.liveAgents
    .map(
      (a) =>
        `👤 ${a.name} (${a.label}): ${a.displayPhone}\n🔗 Chat WA: ${a.waLink}`
    )
    .join('\n\n');

  return `✅ Panduan aktivasi akun AMS telah selesai dikirimkan.

Ringkasan Alur SOP Pengajuan Baru:
1. Isi formulir permohonan.
2. Ajukan formulir ke Kominfo / Verifikator.
3. Verifikator menginput data ke AMS.
4. Pengguna menerima link aktivasi melalui Email Dinas.
5. Pengguna melakukan aktivasi akun.
6. Setelah proses aktivasi dan pengajuan selesai, pengguna menunggu proses verifikasi oleh Verifikator. Setelah akun diverifikasi dan disetujui, tautan Set Passphrase akan dikirim melalui WhatsApp atau Email Dinas.

Jika membutuhkan bantuan lebih lanjut, silakan hubungi Live Agen kami:

${agentLines}

Ketik:
0️⃣ Menu Utama`;
}

const INVALID_CHECK_EMAIL_TEXT = `⚠️ Pilihan tidak valid.

Silakan pilih:

1️⃣ Sudah
2️⃣ Belum

0️⃣ Menu Utama`;

function getPengajuanImagePaths() {
  const folder = config.imagePaths.pengajuan;
  const configured = config.imageFiles.pengajuan || [];

  // Cari file berdasarkan nama di config, toleransi ekstensi .jpg / .png
  const resolved = [];
  for (const f of configured) {
    const directPath = path.join(folder, f);
    if (fs.existsSync(directPath)) {
      resolved.push(directPath);
      continue;
    }
    const baseName = f.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    let found = false;
    for (const ext of ['.jpg', '.png', '.jpeg', '.webp']) {
      const altPath = path.join(folder, baseName + ext);
      if (fs.existsSync(altPath)) {
        resolved.push(altPath);
        found = true;
        break;
      }
    }
    if (!found) {
      resolved.push(directPath);
    }
  }

  if (resolved.length === configured.length && resolved.every((p) => fs.existsSync(p))) {
    return resolved;
  }

  // Auto-scan folder images/pengajuan urut numerik natural
  if (fs.existsSync(folder)) {
    const files = fs.readdirSync(folder)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    if (files.length > 0) {
      return files.map((f) => path.join(folder, f));
    }
  }

  return configured.map((f) => path.join(folder, f));
}

function getPengajuanCaptions(images = []) {
  const captions = config.imageCaptions.pengajuan || [];
  const list = images.length > 0 ? images : getPengajuanImagePaths();
  return list.map((imgPath, i) => {
    if (captions[i]) {
      return captions[i];
    }
    return `Langkah ${i + 1}`;
  });
}

/**
 * Memulai alur Pengajuan Baru: tampilkan pertanyaan Email Dinas
 */
async function startPengajuanBaru(sock, jid) {
  updateState(jid, { menu: 'PENGAJUAN_ASK', step: 'CHECK_EMAIL_DINAS' });
  await sendText(sock, jid, CHECK_EMAIL_DINAS_TEXT);
}

/**
 * Handler utama alur Pengajuan Baru
 */
async function handlePengajuanBaru(sock, jid, input, state) {
  const step = state?.step || 'CHECK_EMAIL_DINAS';

  switch (step) {
    case 'CHECK_EMAIL_DINAS':
    case 1: {
      if (input === '1') {
        // SUDAH ada email dinas → kirim formulir Word + penjelasan SOP
        updateState(jid, { menu: 'PENGAJUAN_ASK', step: 'FORM_SENT' });
        await sendText(sock, jid, FORM_INTRO_TEXT);

        const formPath = config.docPaths.formulirPermohonan;
        const formSuccess = await sendDocument(
          sock,
          jid,
          formPath,
          'Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx',
          '📎 Formulir Surat Permohonan Tanda Tangan Elektronik'
        );

        const curState = getState(jid);
        if (curState && (curState.menu === 'PENGAJUAN_ASK' || curState.menu === 'PENGAJUAN') && curState.step === 'FORM_SENT') {
          if (formSuccess) {
            await sendText(sock, jid, FORM_SENT_TEXT);
          } else {
            updateState(jid, { menu: 'PENGAJUAN_ASK', step: 'CHECK_EMAIL_DINAS' });
            await sendText(sock, jid, '⚠️ Gagal mengirim formulir. Silakan coba pilih "1" lagi nanti.');
          }
        }
      } else if (input === '2') {
        // BELUM ada email dinas → arahkan ke Kominfo + kontak Live Agen
        updateState(jid, { menu: 'PENGAJUAN_ASK', step: 'NO_EMAIL_GUIDE' });
        await sendText(sock, jid, getNoEmailGuideText());
      } else {
        await sendText(sock, jid, INVALID_CHECK_EMAIL_TEXT);
      }
      break;
    }

    case 'NO_EMAIL_GUIDE': {
      await sendText(sock, jid, '⚠️ Pilihan tidak valid.\n\nKetik:\n0️⃣ Menu Utama');
      break;
    }

    case 'FORM_SENT': {
      if (input === '1') {
        // User ingin melihat panduan aktivasi AMS
        updateState(jid, { menu: 'PENGAJUAN_ASK', step: 'JUKNIS_VIEW' });
        await sendText(sock, jid, JUKNIS_INTRO_TEXT);

        const images = getPengajuanImagePaths();
        const captions = getPengajuanCaptions(images);

        const success = await sendImagesSequentially(sock, jid, images, captions);

        const curState = getState(jid);
        if (curState && (curState.menu === 'PENGAJUAN_ASK' || curState.menu === 'PENGAJUAN') && curState.step === 'JUKNIS_VIEW') {
          if (success) {
            updateState(jid, { menu: 'PENGAJUAN_ASK', step: 'TUTORIAL_COMPLETE' });
            await sendText(sock, jid, getTutorialCompleteText());
          } else {
            updateState(jid, { menu: 'PENGAJUAN_ASK', step: 'FORM_SENT' });
            await sendText(sock, jid, '⚠️ Gagal mengirim panduan karena gangguan koneksi. Silakan coba pilih "1" lagi nanti.');
          }
        }
      } else {
        await sendText(sock, jid, '⚠️ Pilihan tidak valid.\n\nKetik:\n1️⃣ Lihat Panduan Aktivasi AMS (Berdasarkan Juknis)\n0️⃣ Menu Utama');
      }
      break;
    }

    case 'JUKNIS_VIEW': {
      await sendText(sock, jid, '⏳ Panduan sedang dikirim, silakan tunggu.\n\nKetik:\n0️⃣ Menu Utama');
      break;
    }

                case 'TUTORIAL_COMPLETE': {
        if (input === '4') {
          await startLiveAgen(sock, jid);
        } else {
          await sendText(
            sock,
            jid,
            '⚠️ Pilihan tidak valid.\n\nKetik:\n0️⃣ Menu Utama'
          );
        }
        break;
      }

    default: {
      updateState(jid, { menu: 'PENGAJUAN_ASK', step: 'CHECK_EMAIL_DINAS' });
      await sendText(sock, jid, CHECK_EMAIL_DINAS_TEXT);
      break;
    }
  }
}

module.exports = {
  handlePengajuanBaru,
  startPengajuanBaru,
  CHECK_EMAIL_DINAS_TEXT,
  FORM_INTRO_TEXT,
  FORM_SENT_TEXT,
  JUKNIS_INTRO_TEXT,
  INVALID_CHECK_EMAIL_TEXT,
  getNoEmailGuideText,
  getTutorialCompleteText,
  getPengajuanImagePaths,
  getPengajuanCaptions,
};
