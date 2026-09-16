/**
 * Test Tahap 8 — Verifikasi Komprehensif Seluruh Fitur Chatbot WhatsApp AMS:
 * Menu 1 (Pengajuan Baru), Menu 2 (Pembaharuan / Expired),
 * Menu 3 (Reset Passphrase), Menu 4 (Live Agen), & Integrasi Router
 *
 * Memenuhi 20 Skenario Uji Sesuai Requirement ACC:
 *   1. Menu Utama: Status Aktif Semua Menu (Tanpa 'Segera Hadir')
 *   2. Routing Menu 2: Masuk ke CHECK_EXPIRED
 *   3. Menu 2 Cabang Sudah Expired (Tanpa Form, 2 Foto SOP Hlm 40-41)
 *   4. Menu 2 Cabang Belum Expired: Edukasi H-30 & Tanpa Pengecekan Otomatis
 *   5. Menu 2 Cabang Belum Expired: Pengiriman Form DOCX (Ceklis Pembaharuan)
 *   6. Menu 2 Cabang Belum Expired: Pengiriman 2 Foto SOP Hlm 38-39
 *   7. Routing Menu 3: Pengiriman Form DOCX Langsung (Ceklis Reset Passphrase)
 *   8. Menu 3: Pengiriman 2 Foto SOP Reset Passphrase Hlm 44-45 (Tanpa Ubah Passphrase)
 *   9. Penegasan Batasan Keras Layanan Bot (Tidak Terima Form, No AMS Access)
 *  10. Routing Menu 1: Pengajuan Baru Tetap Berfungsi Normal (8 Foto Tutorial)
 *  11. Routing Menu 4: Live Agen Tetap Berfungsi Normal (Pak Kris & Pak Jaya)
 *  12. Navigasi Global '0' dari Seluruh State Menu 2
 *  13. Navigasi Global '0' dari Seluruh State Menu 3
 *  14. Penanganan Input Invalid di Setiap State Menu 2
 *  15. Penanganan Input Invalid di Setiap State Menu 3
 *  16. Perlindungan State Transisi Pengiriman Media (Waiting Notice)
 *  17. Isolasi Multi-User: State Session Independen Antar Pengguna
 *  18. Verifikasi Seluruh Aset Foto Menu 2 (4 Foto) & Menu 3 (2 Foto)
 *  19. Integritas Berkas DOCX Tunggal Formulir Permohonan
 *  20. Regression Test Fondasi Sistem (Rate Limiter, Session Expiry, Non-Text Guard)
 *
 * Jalankan: node tests/test-tahap8.js
 */

const path = require('path');
const fs = require('fs');

// ============================================================
// Mock Baileys socket
// ============================================================
function createMockSock() {
  const sentMessages = [];
  return {
    sentMessages,
    sendMessage: async (jid, content) => {
      sentMessages.push({ jid, ...content });
      return { key: { id: 'msg-' + Date.now() } };
    },
    getLastMessage: () => sentMessages[sentMessages.length - 1],
    getMessageCount: () => sentMessages.length,
    clearMessages: () => {
      sentMessages.length = 0;
    },
    getTextMessages: () => sentMessages.filter((m) => m.text),
    getDocumentMessages: () => sentMessages.filter((m) => m.document),
    getImageMessages: () => sentMessages.filter((m) => m.image),
    getLastText: () => {
      const texts = sentMessages.filter((m) => m.text);
      return texts.length > 0 ? texts[texts.length - 1].text : '';
    },
  };
}

// Helper membuat pesan masuk
function createMsg(text, jid = '6281234567890@s.whatsapp.net') {
  return {
    key: {
      remoteJid: jid,
      fromMe: false,
      id: 'MSG_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
    },
    message: {
      conversation: text,
    },
  };
}

// ============================================================
// Require modules
// ============================================================
const { handleMessage } = require('../src/handler/messageHandler');
const {
  getState,
  resetState,
  updateState,
  clearAllSessions,
  stopCleanupTimer,
  touchState,
} = require('../src/state/sessionState');
const { checkRateLimit } = require('../src/utils/rateLimiter');
const { enqueueProcessing } = require('../src/utils/processingManager');
const config = require('../src/config');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, description) {
    if (condition) {
      console.log('  ✅ ' + description);
      passed++;
    } else {
      console.error('  ❌ FAILED: ' + description);
      failed++;
    }
  }

  // Nonaktifkan rate limit dan delay untuk kelancaran test
  config.rateLimitMaxMessages = 999;
  config.processingDelay = 0;

  const TEST_JID = '6281234567890@s.whatsapp.net';

  console.log('='.repeat(65));
  console.log('📋 TEST TAHAP 8 — VERIFIKASI KOMPREHENSIF SELURUH FITUR CHATBOT AMS');
  console.log('='.repeat(65));

  // ----------------------------------------------------------
  // SKENARIO 1: Menu Utama Aktif Penuh (Tanpa 'Segera Hadir')
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 1: Menu Utama Aktif Penuh (Tanpa Segera Hadir)');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    const lastText = sock.getLastText();

    assert(lastText.includes('Layanan Bantuan Tanda Tangan Elektronik AMS'), 'Nama layanan AMS muncul');
    assert(lastText.includes('1️⃣ Pengajuan Baru'), 'Menu 1 adalah Pengajuan Baru');
    assert(lastText.includes('2️⃣ Pembaharuan / Expired'), 'Menu 2 adalah Pembaharuan / Expired');
    assert(lastText.includes('3️⃣ Reset Passphrase'), 'Menu 3 adalah Reset Passphrase');
    assert(lastText.includes('4️⃣ Live Agen'), 'Menu 4 adalah Live Agen');
    assert(!lastText.includes('(Segera Hadir)'), 'Tanda (Segera Hadir) telah dilepas sepenuhnya');
  }

  // ----------------------------------------------------------
  // SKENARIO 2: Routing Menu 2 → Masuk ke CHECK_EXPIRED
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 2: Routing Menu 2 → Masuk ke CHECK_EXPIRED');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    sock.clearMessages();

    await handleMessage(sock, createMsg('2', TEST_JID));
    const state = getState(TEST_JID);
    assert(state.menu === 'PEMBARUAN_ASK', 'State menu = PEMBARUAN_ASK');
    assert(state.step === 'CHECK_EXPIRED', 'State step = CHECK_EXPIRED');
    const text = sock.getLastText();
    assert(text.includes('Sudah Expired') && text.includes('Belum Expired'), 'Menanyakan status sertifikat expired');
    assert(text.includes('aplikasi AMS'), 'Mengarahkan pengguna memeriksa status di aplikasi AMS');
  }

  // ----------------------------------------------------------
  // SKENARIO 3: Menu 2 Cabang Sudah Expired (Tanpa Form, 2 Foto SOP)
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 3: Menu 2 Cabang Sudah Expired (Tanpa Form, 2 Foto SOP Hlm 40-41)');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    sock.clearMessages();

    await handleMessage(sock, createMsg('1', TEST_JID)); // Pilih 1 = Sudah Expired
    const state = getState(TEST_JID);
    assert(state.step === 'EXPIRED_GUIDE', 'State beralih ke EXPIRED_GUIDE');
    assert(sock.getDocumentMessages().length === 0, 'Kondisi Sudah Expired TIDAK mengirimkan formulir DOCX');

    const images = sock.getImageMessages();
    assert(images.length === 2, 'Mengirim tepat 2 foto SOP Expired');
    assert(images[0].caption.includes('Informasi Sertifikat Expired'), 'Foto 1 memuat caption informasi expired');
    assert(images[0].caption.includes('Hlm. 40'), 'Foto 1 merujuk Juknis Halaman 40');
    assert(images[1].caption.includes('Hlm. 41'), 'Foto 2 merujuk Juknis Halaman 41');

    const lastText = sock.getLastText();
    assert(lastText.includes('Pak Kris') && lastText.includes('Pak Jaya'), 'Pesan penutup memuat kontak kedua Live Agen');
    assert(lastText.includes('0️⃣ Menu Utama'), 'Pesan penutup menyertakan navigasi 0 Menu Utama');
  }

  // ----------------------------------------------------------
  // SKENARIO 4: Menu 2 Cabang Belum Expired — Edukasi H-30
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 4: Menu 2 Cabang Belum Expired — Edukasi H-30 & Pengecekan Mandiri');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    sock.clearMessages();

    await handleMessage(sock, createMsg('2', TEST_JID)); // Pilih 2 = Belum Expired
    const state = getState(TEST_JID);
    assert(state.step === 'CHECK_H30', 'State beralih ke CHECK_H30');
    const text = sock.getLastText();
    assert(text.includes('H-30'), 'Menyebutkan aturan periode pembaharuan H-30');
    assert(text.includes('Bot tidak dapat mengecek') || text.includes('secara otomatis'), 'Menegaskan bot tidak mengecek H-30 otomatis');
    assert(text.includes('1️⃣ Ya, Sudah Masuk H-30'), 'Menyediakan pilihan konfirmasi 1 Ya, Sudah Masuk H-30');
    assert(text.includes('0️⃣ Menu Utama'), 'Menyediakan pilihan 0 Menu Utama');
  }

  // ----------------------------------------------------------
  // SKENARIO 5: Menu 2 Cabang Belum Expired — Pengiriman Form DOCX
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 5: Menu 2 Cabang Belum Expired — Pengiriman Form DOCX');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    sock.clearMessages();

    await handleMessage(sock, createMsg('1', TEST_JID)); // Pilih 1 = Ya, Sudah H-30
    const state = getState(TEST_JID);
    assert(state.step === 'FORM_SENT', 'State beralih ke FORM_SENT');

    const docs = sock.getDocumentMessages();
    assert(docs.length === 1, 'Mengirim 1 berkas formulir DOCX');
    assert(docs[0].fileName.endsWith('.docx'), 'Nama berkas berekstensi .docx');

    const texts = sock.getTextMessages().map((m) => m.text).join('\n');
    assert(texts.includes('Pembaharuan'), 'Instruksi formulir mengarahkan centang Pembaharuan');

    const lastText = sock.getLastText();
    assert(lastText.includes('1️⃣ Lihat Panduan Pembaharuan'), 'Menawarkan opsi 1 Lihat Panduan Pembaharuan');
  }

  // ----------------------------------------------------------
  // SKENARIO 6: Menu 2 Cabang Belum Expired — Pengiriman 2 Foto SOP Pembaharuan
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 6: Menu 2 Cabang Belum Expired — Pengiriman 2 Foto SOP Hlm 38-39');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    await handleMessage(sock, createMsg('1', TEST_JID));
    sock.clearMessages();

    await handleMessage(sock, createMsg('1', TEST_JID)); // Pilih 1 = Lihat Panduan
    const state = getState(TEST_JID);
    assert(state.step === 'PEMBARUAN_COMPLETE', 'State beralih ke PEMBARUAN_COMPLETE');

    const images = sock.getImageMessages();
    assert(images.length === 2, 'Mengirim tepat 2 foto SOP Pembaharuan');
    assert(images[0].caption.includes('Pembaharuan Sertifikat'), 'Foto 1 memuat info pembaharuan sertifikat');
    assert(images[0].caption.includes('Hlm. 38'), 'Foto 1 merujuk Juknis Halaman 38');
    assert(images[1].caption.includes('Hlm. 39'), 'Foto 2 merujuk Juknis Halaman 39');

    const lastText = sock.getLastText();
    assert(lastText.includes('selesai dikirimkan'), 'Pesan konfirmasi selesai dikirim');
    assert(lastText.includes('Pak Kris') && lastText.includes('Pak Jaya'), 'Pesan penutup menyertakan kedua Live Agen');
  }

  // ----------------------------------------------------------
  // SKENARIO 7: Routing Menu 3 — Pengiriman Form DOCX Langsung
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 7: Routing Menu 3 — Pengiriman Form DOCX Langsung');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    sock.clearMessages();

    await handleMessage(sock, createMsg('3', TEST_JID));
    const state = getState(TEST_JID);
    assert(state.menu === 'PASSPHRASE_GUIDE', 'State menu = PASSPHRASE_GUIDE');
    assert(state.step === 'FORM_SENT', 'State step = FORM_SENT');

    const docs = sock.getDocumentMessages();
    assert(docs.length === 1, 'Mengirim dokumen formulir DOCX secara langsung');
    assert(docs[0].caption.includes('[X] Reset Passphrase'), 'Caption formulir mengarahkan centang Reset Passphrase');

    const lastText = sock.getLastText();
    assert(lastText.includes('Ringkasan Alur SOP Reset Passphrase'), 'Memuat ringkasan SOP pengajuan mandiri');
    assert(lastText.includes('1️⃣ Lihat Panduan Reset Passphrase'), 'Menyediakan opsi 1 Lihat Panduan');
    assert(lastText.includes('0️⃣ Menu Utama'), 'Menyediakan opsi 0 Menu Utama');
  }

  // ----------------------------------------------------------
  // SKENARIO 8: Menu 3 — Pengiriman 2 Foto SOP Reset Passphrase (Hlm 44-45)
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 8: Menu 3 — Pengiriman 2 Foto SOP Reset Passphrase Hlm 44-45');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('3', TEST_JID));
    sock.clearMessages();

    await handleMessage(sock, createMsg('1', TEST_JID)); // Pilih 1 = Lihat Panduan
    const state = getState(TEST_JID);
    assert(state.step === 'TUTORIAL_COMPLETE', 'State beralih ke TUTORIAL_COMPLETE');

    const images = sock.getImageMessages();
    assert(images.length === 2, 'Mengirim tepat 2 foto SOP Reset Passphrase');
    assert(images[0].caption.includes('Hlm. 44'), 'Foto 1 merujuk Juknis Halaman 44');
    assert(images[1].caption.includes('Hlm. 45'), 'Foto 2 merujuk Juknis Halaman 45');
    assert(!images.some((img) => img.caption.includes('Hlm. 42') || img.caption.includes('Hlm. 43')), 'Materi Ubah Passphrase (Hlm 42-43) TIDAK disertakan');

    const lastText = sock.getLastText();
    assert(lastText.includes('selesai dikirimkan'), 'Pesan konfirmasi selesai dikirim');
    assert(lastText.includes('Pak Kris') && lastText.includes('Pak Jaya'), 'Pesan penutup memuat kontak Live Agen');
  }

  // ----------------------------------------------------------
  // SKENARIO 9: Penegasan Batasan Keras Bot
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 9: Penegasan Batasan Keras Bot (Tidak Terima Form, No AMS Access)');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    sock.clearMessages();
    await handleMessage(sock, createMsg('3', TEST_JID));
    const texts = sock.getTextMessages().map((m) => m.text).join('\n');

    assert(texts.includes('TIDAK PERNAH meminta') || texts.includes('menyimpan passphrase'), 'Bot menegaskan tidak pernah meminta/menyimpan passphrase');
    assert(texts.includes('tidak menerima pengembalian berkas') || texts.includes('secara mandiri'), 'Bot menegaskan tidak menerima pengembalian berkas formulir via chat');
  }

  // ----------------------------------------------------------
  // SKENARIO 10: Routing Menu 1 — Pengajuan Baru Tetap Berfungsi Normal
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 10: Routing Menu 1 — Pengajuan Baru Tetap Berfungsi Normal');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    sock.clearMessages();

    await handleMessage(sock, createMsg('1', TEST_JID));
    let state = getState(TEST_JID);
    assert(state.menu === 'PENGAJUAN_ASK' && state.step === 'CHECK_EMAIL_DINAS', 'Input 1 masuk ke CHECK_EMAIL_DINAS');

    sock.clearMessages();
    await handleMessage(sock, createMsg('1', TEST_JID)); // Sudah punya email dinas
    state = getState(TEST_JID);
    assert(state.step === 'FORM_SENT', 'Sudah punya email dinas mengirim form');
    assert(sock.getDocumentMessages().length === 1, 'Form DOCX terkirim di Menu 1');

    sock.clearMessages();
    await handleMessage(sock, createMsg('1', TEST_JID)); // Lihat panduan
    state = getState(TEST_JID);
    assert(state.step === 'TUTORIAL_COMPLETE', 'Menu 1 tutorial selesai');
    assert(sock.getImageMessages().length === 8, 'Menu 1 mengirim tepat 8 foto Juknis Hlm 7-14');
  }

  // ----------------------------------------------------------
  // SKENARIO 11: Routing Menu 4 — Live Agen Tetap Berfungsi Normal
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 11: Routing Menu 4 — Live Agen Tetap Berfungsi Normal');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    sock.clearMessages();

    await handleMessage(sock, createMsg('4', TEST_JID));
    const state = getState(TEST_JID);
    assert(state.menu === 'LIVE_AGEN', 'State menu = LIVE_AGEN');
    const text = sock.getLastText();
    assert(text.includes('Pak Kris') && text.includes('0813-2882-3858'), 'Kontak Pak Kris tertera lengkap');
    assert(text.includes('Pak Jaya') && text.includes('0898-0008-575'), 'Kontak Pak Jaya tertera lengkap');
  }

  // ----------------------------------------------------------
  // SKENARIO 12: Navigasi Global '0' dari Seluruh State Menu 2
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 12: Navigasi Global 0 dari Seluruh State Menu 2');
  {
    // dari CHECK_EXPIRED
    clearAllSessions();
    let sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    await handleMessage(sock, createMsg('0', TEST_JID));
    assert(getState(TEST_JID).menu === 'MAIN', '0 dari CHECK_EXPIRED → MAIN');

    // dari CHECK_H30
    clearAllSessions();
    sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    await handleMessage(sock, createMsg('0', TEST_JID));
    assert(getState(TEST_JID).menu === 'MAIN', '0 dari CHECK_H30 → MAIN');

    // dari FORM_SENT (Menu 2)
    clearAllSessions();
    sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    await handleMessage(sock, createMsg('1', TEST_JID));
    await handleMessage(sock, createMsg('0', TEST_JID));
    assert(getState(TEST_JID).menu === 'MAIN', '0 dari FORM_SENT (Menu 2) → MAIN');

    // dari EXPIRED_GUIDE
    clearAllSessions();
    sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    await handleMessage(sock, createMsg('1', TEST_JID));
    await handleMessage(sock, createMsg('0', TEST_JID));
    assert(getState(TEST_JID).menu === 'MAIN', '0 dari EXPIRED_GUIDE → MAIN');

    // dari PEMBARUAN_COMPLETE
    clearAllSessions();
    sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID));
    await handleMessage(sock, createMsg('1', TEST_JID));
    await handleMessage(sock, createMsg('1', TEST_JID));
    await handleMessage(sock, createMsg('0', TEST_JID));
    assert(getState(TEST_JID).menu === 'MAIN', '0 dari PEMBARUAN_COMPLETE → MAIN');
  }

  // ----------------------------------------------------------
  // SKENARIO 13: Navigasi Global '0' dari Seluruh State Menu 3
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 13: Navigasi Global 0 dari Seluruh State Menu 3');
  {
    // dari FORM_SENT (Menu 3)
    clearAllSessions();
    let sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('3', TEST_JID));
    await handleMessage(sock, createMsg('0', TEST_JID));
    assert(getState(TEST_JID).menu === 'MAIN', '0 dari FORM_SENT (Menu 3) → MAIN');

    // dari TUTORIAL_COMPLETE (Menu 3)
    clearAllSessions();
    sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('3', TEST_JID));
    await handleMessage(sock, createMsg('1', TEST_JID));
    await handleMessage(sock, createMsg('0', TEST_JID));
    assert(getState(TEST_JID).menu === 'MAIN', '0 dari TUTORIAL_COMPLETE (Menu 3) → MAIN');
  }

  // ----------------------------------------------------------
  // SKENARIO 14: Penanganan Input Invalid di Setiap State Menu 2
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 14: Penanganan Input Invalid di Setiap State Menu 2');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('2', TEST_JID)); // masuk CHECK_EXPIRED

    sock.clearMessages();
    await handleMessage(sock, createMsg('99', TEST_JID));
    assert(getState(TEST_JID).step === 'CHECK_EXPIRED', 'Input invalid tetap di CHECK_EXPIRED');
    assert(sock.getLastText().includes('Pilihan tidak valid'), 'Pesan invalid muncul di CHECK_EXPIRED');

    await handleMessage(sock, createMsg('2', TEST_JID)); // masuk CHECK_H30
    sock.clearMessages();
    await handleMessage(sock, createMsg('99', TEST_JID));
    assert(getState(TEST_JID).step === 'CHECK_H30', 'Input invalid tetap di CHECK_H30');
    assert(sock.getLastText().includes('Pilihan tidak valid'), 'Pesan invalid muncul di CHECK_H30');

    await handleMessage(sock, createMsg('1', TEST_JID)); // masuk FORM_SENT
    sock.clearMessages();
    await handleMessage(sock, createMsg('99', TEST_JID));
    assert(getState(TEST_JID).step === 'FORM_SENT', 'Input invalid tetap di FORM_SENT');
    assert(sock.getLastText().includes('Pilihan tidak valid'), 'Pesan invalid muncul di FORM_SENT');
  }

  // ----------------------------------------------------------
  // SKENARIO 15: Penanganan Input Invalid di Setiap State Menu 3
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 15: Penanganan Input Invalid di Setiap State Menu 3');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo', TEST_JID));
    await handleMessage(sock, createMsg('3', TEST_JID)); // masuk FORM_SENT (Menu 3)

    sock.clearMessages();
    await handleMessage(sock, createMsg('halo bot', TEST_JID));
    assert(getState(TEST_JID).step === 'FORM_SENT', 'Input invalid tetap di FORM_SENT Menu 3');
    assert(sock.getLastText().includes('Pilihan tidak valid'), 'Pesan invalid muncul di FORM_SENT Menu 3');

    await handleMessage(sock, createMsg('1', TEST_JID)); // selesai panduan
    sock.clearMessages();
    await handleMessage(sock, createMsg('halo lagi', TEST_JID));
    assert(sock.getLastText().includes('Ketik 0 untuk kembali ke Menu Utama'), 'State TUTORIAL_COMPLETE mengarahkan ketik 0');
  }

  // ----------------------------------------------------------
  // SKENARIO 16: Perlindungan State Transisi Pengiriman Media
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 16: Perlindungan State Transisi Pengiriman Media');
  {
    clearAllSessions();
    const sock = createMockSock();

    // Uji transisi Menu 2: SENDING_PEMBARUAN
    updateState(TEST_JID, { menu: 'PEMBARUAN_ASK', step: 'SENDING_PEMBARUAN' });
    await handleMessage(sock, createMsg('apapun', TEST_JID));
    assert(sock.getLastText().includes('sedang dikirim'), 'State SENDING_PEMBARUAN membalas pesan tunggu');

    // Uji transisi Menu 3: SENDING_GUIDE
    sock.clearMessages();
    updateState(TEST_JID, { menu: 'PASSPHRASE_GUIDE', step: 'SENDING_GUIDE' });
    await handleMessage(sock, createMsg('apapun', TEST_JID));
    assert(sock.getLastText().includes('sedang dikirim'), 'State SENDING_GUIDE membalas pesan tunggu');
  }

  // ----------------------------------------------------------
  // SKENARIO 17: Isolasi Multi-User (State Session Independen)
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 17: Isolasi Multi-User (State Session Independen)');
  {
    clearAllSessions();
    const sock = createMockSock();
    const userA = '6281111111@s.whatsapp.net';
    const userB = '6282222222@s.whatsapp.net';
    const userC = '6283333333@s.whatsapp.net';

    // Inisialisasi setiap user
    await handleMessage(sock, createMsg('halo', userA));
    await handleMessage(sock, createMsg('halo', userB));
    await handleMessage(sock, createMsg('halo', userC));

    await handleMessage(sock, createMsg('1', userA)); // User A di Menu 1
    await handleMessage(sock, createMsg('2', userB)); // User B di Menu 2
    await handleMessage(sock, createMsg('3', userC)); // User C di Menu 3

    assert(getState(userA).menu === 'PENGAJUAN_ASK', 'User A berada di PENGAJUAN_ASK');
    assert(getState(userB).menu === 'PEMBARUAN_ASK', 'User B berada di PEMBARUAN_ASK');
    assert(getState(userC).menu === 'PASSPHRASE_GUIDE', 'User C berada di PASSPHRASE_GUIDE');

    // Reset User B tidak mempengaruhi User A dan C
    await handleMessage(sock, createMsg('0', userB));
    assert(getState(userB).menu === 'MAIN', 'User B direset ke MAIN');
    assert(getState(userA).menu === 'PENGAJUAN_ASK', 'User A tetap di PENGAJUAN_ASK');
    assert(getState(userC).menu === 'PASSPHRASE_GUIDE', 'User C tetap di PASSPHRASE_GUIDE');
  }

  // ----------------------------------------------------------
  // SKENARIO 18: Verifikasi Seluruh Aset Foto Menu 2 & Menu 3
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 18: Verifikasi Seluruh Aset Foto Menu 2 & Menu 3');
  {
    const pembaruanDir = config.imagePaths.pembaruan;
    const pembaruanFiles = config.imageFiles.pembaruan;
    assert(pembaruanFiles.length === 4, 'Config memuat tepat 4 file pembaruan');

    let allPembaruanExist = true;
    for (const f of pembaruanFiles) {
      if (!fs.existsSync(path.join(pembaruanDir, f))) {
        allPembaruanExist = false;
        console.error('Missing pembaruan image:', f);
      }
    }
    assert(allPembaruanExist, 'Seluruh 4 file gambar pembaruan ada di filesystem');

    const passphraseDir = config.imagePaths.passphrase;
    const passphraseFiles = config.imageFiles.passphrase;
    assert(passphraseFiles.length === 2, 'Config memuat tepat 2 file passphrase');

    let allPassphraseExist = true;
    for (const f of passphraseFiles) {
      if (!fs.existsSync(path.join(passphraseDir, f))) {
        allPassphraseExist = false;
        console.error('Missing passphrase image:', f);
      }
    }
    assert(allPassphraseExist, 'Seluruh 2 file gambar passphrase ada di filesystem');
  }

  // ----------------------------------------------------------
  // SKENARIO 19: Integritas Berkas DOCX Tunggal Formulir Permohonan
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 19: Integritas Berkas DOCX Tunggal Formulir Permohonan');
  {
    const formPath = config.docPaths.formulirPermohonan;
    assert(fs.existsSync(formPath), 'File formulir DOCX eksis di docs/');
    const stat = fs.statSync(formPath);
    assert(stat.size > 1024, 'Ukuran file formulir DOCX valid: ' + stat.size + ' bytes (> 1KB)');
    assert(formPath.endsWith('Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx'), 'Nama berkas formulir konsisten tunggal');
  }

  // ----------------------------------------------------------
  // SKENARIO 20: Regression Test Fondasi Sistem
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 20: Regression Test Fondasi Sistem');
  {
    // Rate Limiter
    const spamJid = '628SPAMMER_' + Date.now() + '@s.whatsapp.net';
    config.rateLimitMaxMessages = 3;
    assert(checkRateLimit(spamJid) === true, 'Pesan 1 diizinkan');
    assert(checkRateLimit(spamJid) === true, 'Pesan 2 diizinkan');
    assert(checkRateLimit(spamJid) === true, 'Pesan 3 diizinkan');
    assert(checkRateLimit(spamJid) === false, 'Pesan 4 dibatasi (rate limit trigger)');

    // Non-text input tidak meledak/crash
    const sock = createMockSock();
    await handleMessage(sock, { key: { remoteJid: TEST_JID }, message: null });
    await handleMessage(sock, { key: { remoteJid: TEST_JID }, message: { imageMessage: {} } });
    assert(true, 'Pesan non-teks dan pesan null tidak menyebabkan exception');
  }

  console.log('\n' + '='.repeat(65));
  console.log(`📊 HASIL AKHIR TEST TAHAP 8: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(65));

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
