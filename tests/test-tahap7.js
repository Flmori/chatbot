/**
 * Test Tahap 7 — Verifikasi Komprehensif Menu 1 (Pengajuan Baru) & Multi-Agent
 * Memenuhi 18 Skenario Uji Sesuai Requirement ACC Client:
 *
 *  1. Menu Utama
 *  2. Menu 1
 *  3. Sudah punya Email Dinas
 *  4. Belum punya Email Dinas
 *  5. Pengiriman DOCX
 *  6. Struktur/path DOCX
 *  7. Tutorial aktivasi
 *  8. Urutan gambar tutorial
 *  9. Caption gambar mengandung SIMULASI/DEMO
 * 10. Penjelasan singkat setiap langkah
 * 11. Flow setelah aktivasi menuju Passphrase
 * 12. Live Agen
 * 13. Multi-agent
 * 14. Menu 2 standby
 * 15. Menu 3 standby
 * 16. 0 kembali Menu Utama
 * 17. Invalid input
 * 18. Regression test foundation
 *
 * Jalankan: node test-tahap7.js
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
    },
    getLastMessage: () => sentMessages[sentMessages.length - 1],
    getMessageCount: () => sentMessages.length,
    clearMessages: () => {
      sentMessages.length = 0;
    },
    getTextMessages: () => sentMessages.filter((m) => m.text),
    getDocumentMessages: () => sentMessages.filter((m) => m.document),
    getImageMessages: () => sentMessages.filter((m) => m.image),
  };
}

// ============================================================
// Require modules
// ============================================================
const { handleMessage } = require('../src/handler/messageHandler');
const {
  getState,
  resetState,
  clearAllSessions,
  stopCleanupTimer,
  touchState,
} = require('../src/state/sessionState');
const { checkRateLimit } = require('../src/utils/rateLimiter');
const { enqueueProcessing } = require('../src/utils/processingManager');
const sender = require('../src/utils/sender');
const config = require('../src/config');

// ============================================================
// Test Infrastructure
// ============================================================
let testPassed = 0;
let testFailed = 0;
const TEST_JID = '6281234567890@s.whatsapp.net';

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ ${testName}`);
    testPassed++;
  } else {
    console.log(`  ❌ ${testName}`);
    testFailed++;
  }
}

function createMsg(text) {
  return {
    key: {
      remoteJid: TEST_JID,
      fromMe: false,
    },
    message: { conversation: text },
    messageTimestamp: Math.floor(Date.now() / 1000) + 10,
  };
}

async function runTests() {
  // Override config untuk pengujian cepat
  config.processingDelay = 0;
  config.rateLimitMaxMessages = 9999;
  config.sendDelay = 0;

  console.log('');
  console.log('='.repeat(65));
  console.log('📋 TEST KOMPREHENSIF MENU 1 & MULTI-AGENT (18 SKENARIO UJI)');
  console.log('='.repeat(65));

  // ----------------------------------------------------------
  // SKENARIO 1: Menu Utama
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 1: Menu Utama');
  {
    clearAllSessions();
    const sock = createMockSock();

    await handleMessage(sock, createMsg('halo'));
    const msgs = sock.getTextMessages();
    assert(msgs.length > 0, 'User baru menerima sambutan Menu Utama');
    assert(
      msgs[0].text.includes('Layanan Bantuan Tanda Tangan Elektronik AMS'),
      'Nama bot memuat "Layanan Bantuan Tanda Tangan Elektronik AMS"'
    );
    assert(
      msgs[0].text.includes('1️⃣') && msgs[0].text.includes('Pengajuan Baru'),
      'Menu 1 adalah Pengajuan Baru'
    );
    assert(
      msgs[0].text.includes('2️⃣ Pembaharuan / Expired (Segera Hadir)'),
      'Menu 2 bertanda "(Segera Hadir)"'
    );
    assert(
      msgs[0].text.includes('3️⃣ Reset Passphrase (Segera Hadir)'),
      'Menu 3 bertanda "(Segera Hadir)"'
    );
    assert(
      msgs[0].text.includes('4️⃣') && msgs[0].text.includes('Live Agen'),
      'Menu 4 adalah Live Agen'
    );
  }

  // ----------------------------------------------------------
  // SKENARIO 2: Menu 1 — Pertanyaan Email Dinas
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 2: Menu 1 — Pertanyaan Email Dinas');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo'));
    sock.clearMessages();

    await handleMessage(sock, createMsg('1'));
    const state = getState(TEST_JID);
    assert(state.menu === 'PENGAJUAN_ASK', 'State menu = PENGAJUAN_ASK');
    assert(state.step === 'CHECK_EMAIL_DINAS', 'State step = CHECK_EMAIL_DINAS');

    const msgs = sock.getTextMessages();
    assert(
      msgs[0].text.includes('Apakah Anda sudah mempunyai Email Dinas?'),
      'Pertanyaan kepemilikan Email Dinas muncul'
    );
    assert(
      msgs[0].text.includes('1️⃣ Sudah') && msgs[0].text.includes('2️⃣ Belum'),
      'Pilihan 1. Sudah dan 2. Belum tersedia'
    );
    assert(msgs[0].text.includes('0️⃣ Menu Utama'), 'Pilihan 0. Menu Utama tersedia');
  }

  // ----------------------------------------------------------
  // SKENARIO 3 & 4: Belum Memiliki Email Dinas (Opsi 2)
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 3 & 4: Belum Memiliki Email Dinas → Arahan Kominfo + Multi Live Agen');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo'));
    await handleMessage(sock, createMsg('1'));
    sock.clearMessages();

    await handleMessage(sock, createMsg('2'));
    const state = getState(TEST_JID);
    assert(state.step === 'NO_EMAIL_GUIDE', 'State beralih ke NO_EMAIL_GUIDE');

    const msgs = sock.getTextMessages();
    assert(
      msgs[0].text.includes('Dinas Komunikasi dan Informatika'),
      'Menyebut arahan pengajuan Email Dinas ke Dinas Kominfo'
    );
    assert(
      msgs[0].text.includes('Pak Kris') && msgs[0].text.includes('Pak Jaya'),
      'Menampilkan kontak kedua agen sekaligus (Pak Kris & Pak Jaya)'
    );
    assert(
      msgs[0].text.includes('wa.me/6281328823858') && msgs[0].text.includes('wa.me/628980008575'),
      'Memuat tautan chat WhatsApp aktif untuk kedua agen'
    );
  }

  // ----------------------------------------------------------
  // SKENARIO 5 & 6: Sudah Memiliki Email Dinas → Kirim DOCX & Struktur File
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 5 & 6: Sudah Memiliki Email Dinas → Pengiriman DOCX & Struktur');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo'));
    await handleMessage(sock, createMsg('1'));
    sock.clearMessages();

    await handleMessage(sock, createMsg('1'));
    const state = getState(TEST_JID);
    assert(state.step === 'FORM_SENT', 'State beralih ke FORM_SENT');

    // Cek pengantar & alur SOP verifikator
    const textMsgs = sock.getTextMessages();
    assert(
      textMsgs.some((m) => m.text.includes('Formulir Surat Permohonan')),
      'Menjelaskan kewajiban mengisi Formulir Surat Permohonan'
    );
    assert(
      textMsgs.some((m) => m.text.includes('Verifikator')),
      'Menjelaskan bahwa berkas diajukan kepada Verifikator Kominfo'
    );
    assert(
      textMsgs.some((m) => m.text.includes('link aktivasi melalui Email Dinas')),
      'Menjelaskan bahwa link aktivasi akan diterima melalui Email Dinas'
    );

    // Cek pengiriman berkas DOCX
    const docMsgs = sock.getDocumentMessages();
    assert(docMsgs.length > 0, 'Dokumen formulir terkirim melalui Baileys sendDocument');
    if (docMsgs.length > 0) {
      assert(
        docMsgs[0].fileName.endsWith('.docx'),
        'Nama berkas berformat .docx'
      );
    }

    // Cek keberadaan file di disk dan generator script
    const formPath = config.docPaths.formulirPermohonan;
    assert(fs.existsSync(formPath), 'File DOCX ada di folder docs/');
    const stats = fs.statSync(formPath);
    assert(stats.size > 1000, `Ukuran file DOCX valid: ${stats.size} bytes (> 1KB)`);

    const generatorPath = path.join(__dirname, '..', 'scripts', 'generate-form-docx.js');
    assert(fs.existsSync(generatorPath), 'Script generate-form-docx.js tersedia di scripts/');
  }

  // ----------------------------------------------------------
    // ----------------------------------------------------------
  // SKENARIO 7, 8, 9, 10, 11: Tutorial Aktivasi Juknis (8 Foto) & Penutup SOP
  // ----------------------------------------------------------
  console.log('\n📋 Skenario 7, 8, 9, 10, 11: Tutorial Aktivasi Juknis (8 Foto), Caption [SIMULASI / DEMO], & Penutup SOP');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo'));
    await handleMessage(sock, createMsg('1'));
    await handleMessage(sock, createMsg('1'));
    sock.clearMessages();

    // Pilih 1 untuk melihat panduan aktivasi
    await handleMessage(sock, createMsg('1'));
    const state = getState(TEST_JID);
    assert(state.step === 'TUTORIAL_COMPLETE', 'State beralih ke TUTORIAL_COMPLETE');

    // 8. Urutan gambar tutorial (Tepat 8 gambar Juknis)
    const imgMsgs = sock.getImageMessages();
    assert(imgMsgs.length === 8, 'Mengirim tepat 8 gambar tutorial Juknis');

    // 9. Caption mengandung [SIMULASI / DEMO]
    const allCaptionsHaveDemo = imgMsgs.every(
      (img) => img.caption && img.caption.includes('[SIMULASI / DEMO]')
    );
    assert(allCaptionsHaveDemo, 'Semua caption gambar memuat penanda [SIMULASI / DEMO]');

    // 10. Validasi setiap caption langkah 1 sampai 8
    assert(imgMsgs[0].caption === '[SIMULASI / DEMO] Langkah 1 — Registrasi Pengguna', 'Caption Foto 1 valid');
    assert(imgMsgs[1].caption === '[SIMULASI / DEMO] Langkah 2 — Aktivasi Akun', 'Caption Foto 2 valid');
    assert(imgMsgs[2].caption === '[SIMULASI / DEMO] Langkah 3 — Lengkapi Data Diri', 'Caption Foto 3 valid');
    assert(imgMsgs[3].caption === '[SIMULASI / DEMO] Langkah 4 — Verifikasi WhatsApp', 'Caption Foto 4 valid');
    assert(imgMsgs[4].caption === '[SIMULASI / DEMO] Langkah 5 — Data Kedinasan', 'Caption Foto 5 valid');
    assert(imgMsgs[5].caption === '[SIMULASI / DEMO] Langkah 6 — Lengkapi Data', 'Caption Foto 6 valid');
    assert(imgMsgs[6].caption === '[SIMULASI / DEMO] Langkah 7 — Verifikasi Data', 'Caption Foto 7 valid');
    assert(imgMsgs[7].caption === '[SIMULASI / DEMO] Langkah 8 — Persetujuan dan Submit', 'Caption Foto 8 valid');

        // 11. Pesan Penutup SOP Pengajuan Baru (6 Langkah, 2 Live Agen, hanya 0 Menu Utama)
    const textMsgs = sock.getTextMessages();
    const completeMsg = textMsgs.find((m) => m.text.includes('Panduan aktivasi akun AMS telah selesai dikirimkan'));
    assert(completeMsg, 'Pesan penutup "Panduan aktivasi akun AMS telah selesai dikirimkan" terkirim');
    assert(
      completeMsg.text.includes('Ringkasan Alur SOP Pengajuan Baru:'),
      'Penutup memuat judul Ringkasan Alur SOP Pengajuan Baru'
    );
    assert(
      completeMsg.text.includes('1. Isi formulir permohonan.') &&
      completeMsg.text.includes('2. Ajukan formulir ke Kominfo / Verifikator.') &&
      completeMsg.text.includes('3. Verifikator menginput data ke AMS.') &&
      completeMsg.text.includes('4. Pengguna menerima link aktivasi melalui Email Dinas.') &&
      completeMsg.text.includes('5. Pengguna melakukan aktivasi akun.'),
      'Penutup memuat langkah 1 sampai 5 dengan kata Pengguna'
    );
    assert(
      completeMsg.text.includes('6. Setelah proses aktivasi dan pengajuan selesai, pengguna menunggu proses verifikasi oleh Verifikator. Setelah akun diverifikasi dan disetujui, tautan Set Passphrase akan dikirim melalui WhatsApp atau Email Dinas.'),
      'Poin 6 menggunakan rumusan SOP verifikasi Verifikator & kirim link Passphrase tanpa klaim tutorial chatbot'
    );
    assert(
      completeMsg.text.includes('Pak Kris (Agen 1): 0813-2882-3858') &&
      completeMsg.text.includes('Pak Jaya (Agen 2): 0898-0008-575'),
      'Menampilkan kontak langsung kedua Live Agen (Pak Kris & Pak Jaya)'
    );
    assert(
      completeMsg.text.includes('🔗 Chat WA: https://wa.me/6281328823858') &&
      completeMsg.text.includes('🔗 Chat WA: https://wa.me/628980008575'),
      'Memuat tautan link WhatsApp berikon 🔗 untuk kedua agen'
    );
    assert(
      completeMsg.text.includes('0️⃣ Menu Utama'),
      'Penutup menyertakan opsi navigasi 0️⃣ Menu Utama'
    );
    assert(
      !completeMsg.text.includes('4️⃣ Live Agen') && !completeMsg.text.includes('4. Live Agen'),
      'Penutup TIDAK memuat opsi redundan 4 Live Agen karena info agen sudah dicantumkan di atas'
    );
  }

  // ----------------------------------------------------------
  // SKENARIO 12 & 13: Live Agen & Multi-Agent Scalability
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 12 & 13: Live Agen & Multi-Agent Scalability');
  {
    clearAllSessions();
    const sock = createMockSock();
    await handleMessage(sock, createMsg('halo'));
    sock.clearMessages();

    // Menu 4
    await handleMessage(sock, createMsg('4'));
    const state = getState(TEST_JID);
    assert(state.menu === 'LIVE_AGEN', 'State menu = LIVE_AGEN');

    const msgs = sock.getTextMessages();
    assert(
      msgs[0].text.includes('Pak Kris') && msgs[0].text.includes('Pak Jaya'),
      'Live Agen menampilkan Pak Kris dan Pak Jaya'
    );

    // Verifikasi bahwa liveAgent legacy sudah dihapus
    assert(config.liveAgent === undefined, 'Legacy config.liveAgent singular telah dihapus');

    // Verifikasi skalabilitas multi-agent: jika ada agen ke-3, otomatis tampil
    config.liveAgents.push({
      name: 'Bu Maya',
      label: 'Agen 3',
      phone: '081299998888',
      displayPhone: '0812-9999-8888',
      waLink: 'https://wa.me/6281299998888',
    });

    sock.clearMessages();
    const { getLiveAgenText } = require('../src/handler/liveAgen');
    const dynamicText = getLiveAgenText();
    assert(
      dynamicText.includes('Bu Maya') && dynamicText.includes('0812-9999-8888'),
      'Handler otomatis mendukung Agen ke-3 tanpa perubahan logika'
    );

    // Kembalikan ke 2 agen
    config.liveAgents.pop();
  }

  // ----------------------------------------------------------
  // SKENARIO 14 & 15: Menu 2 & 3 Standby (Segera Hadir)
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 14 & 15: Menu 2 & 3 Standby (Segera Hadir)');
  {
    // Test Menu 2
    clearAllSessions();
    let sock = createMockSock();
    await handleMessage(sock, createMsg('halo'));
    sock.clearMessages();

    await handleMessage(sock, createMsg('2'));
    let state = getState(TEST_JID);
    assert(state.menu === 'PEMBARUAN_ASK', 'Menu 2 masuk ke state PEMBARUAN_ASK');
    assert(state.step === 'STANDBY', 'Step Menu 2 = STANDBY');
    let msgs = sock.getTextMessages();
    assert(msgs[0].text.includes('penyiapan SOP'), 'Menu 2 mengirim pesan standby SOP');
    assert(msgs[0].text.includes('4️⃣ Hubungi Live Agen'), 'Menu 2 menyediakan opsi Live Agen (4)');

    // Dari Menu 2 standby ketik 4 -> Live Agen
    sock.clearMessages();
    await handleMessage(sock, createMsg('4'));
    state = getState(TEST_JID);
    assert(state.menu === 'LIVE_AGEN', 'Dari standby input 4 beralih ke LIVE_AGEN');

    // Test Menu 3
    clearAllSessions();
    sock = createMockSock();
    await handleMessage(sock, createMsg('halo'));
    sock.clearMessages();

    await handleMessage(sock, createMsg('3'));
    state = getState(TEST_JID);
    assert(state.menu === 'PASSPHRASE_GUIDE', 'Menu 3 masuk ke state PASSPHRASE_GUIDE');
    assert(state.step === 'STANDBY', 'Step Menu 3 = STANDBY');
    msgs = sock.getTextMessages();
    assert(msgs[0].text.includes('penyiapan SOP'), 'Menu 3 mengirim pesan standby SOP');
  }

  // ----------------------------------------------------------
  // SKENARIO 16: Navigasi 0 Kembali ke Menu Utama
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 16: Navigasi 0 Kembali ke Menu Utama (Tanpa Menghapus Chat)');
  {
    // Dari CHECK_EMAIL_DINAS
    clearAllSessions();
    let sock = createMockSock();
    await handleMessage(sock, createMsg('halo'));
    await handleMessage(sock, createMsg('1'));
    sock.clearMessages();
    await handleMessage(sock, createMsg('0'));
    let state = getState(TEST_JID);
    assert(state.menu === 'MAIN', '0 dari CHECK_EMAIL_DINAS → MAIN');

    // Dari NO_EMAIL_GUIDE
    clearAllSessions();
    await handleMessage(sock, createMsg('halo'));
    await handleMessage(sock, createMsg('1'));
    await handleMessage(sock, createMsg('2'));
    sock.clearMessages();
    await handleMessage(sock, createMsg('0'));
    state = getState(TEST_JID);
    assert(state.menu === 'MAIN', '0 dari NO_EMAIL_GUIDE → MAIN');

    // Dari FORM_SENT
    clearAllSessions();
    await handleMessage(sock, createMsg('halo'));
    await handleMessage(sock, createMsg('1'));
    await handleMessage(sock, createMsg('1'));
    sock.clearMessages();
    await handleMessage(sock, createMsg('0'));
    state = getState(TEST_JID);
    assert(state.menu === 'MAIN', '0 dari FORM_SENT → MAIN');

    // Dari LIVE_AGEN
    clearAllSessions();
    await handleMessage(sock, createMsg('halo'));
    await handleMessage(sock, createMsg('4'));
    sock.clearMessages();
    await handleMessage(sock, createMsg('0'));
    state = getState(TEST_JID);
    assert(state.menu === 'MAIN', '0 dari LIVE_AGEN → MAIN');

    // Dari STANDBY
    clearAllSessions();
    await handleMessage(sock, createMsg('halo'));
    await handleMessage(sock, createMsg('2'));
    sock.clearMessages();
    await handleMessage(sock, createMsg('0'));
    state = getState(TEST_JID);
    assert(state.menu === 'MAIN', '0 dari STANDBY → MAIN');
  }

  // ----------------------------------------------------------
  // SKENARIO 17: Penanganan Input Invalid
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 17: Penanganan Input Invalid (Aman & Tidak Crash)');
  {
    clearAllSessions();
    const sock = createMockSock();

    // Invalid di Menu Utama
    await handleMessage(sock, createMsg('halo'));
    sock.clearMessages();
    await handleMessage(sock, createMsg('9'));
    let msgs = sock.getTextMessages();
    assert(msgs[0].text.includes('Pilihan tidak valid'), 'Input 9 di Menu Utama ditangani ramah');

    // Invalid di CHECK_EMAIL_DINAS
    await handleMessage(sock, createMsg('1'));
    sock.clearMessages();
    await handleMessage(sock, createMsg('abc'));
    msgs = sock.getTextMessages();
    assert(msgs[0].text.includes('Pilihan tidak valid'), 'Input teks di CHECK_EMAIL_DINAS ditangani ramah');

    // Invalid di LIVE_AGEN
    clearAllSessions();
    await handleMessage(sock, createMsg('halo'));
    await handleMessage(sock, createMsg('4'));
    sock.clearMessages();
    await handleMessage(sock, createMsg('halo bot'));
    msgs = sock.getTextMessages();
    assert(msgs[0].text.includes('Ketik *0*'), 'Pesan teks di LIVE_AGEN diarahkan kembali ke Menu Utama');
  }

  // ----------------------------------------------------------
  // SKENARIO 18: Regression Test Foundation
  // ----------------------------------------------------------
  console.log('\n📝 Skenario 18: Regression Test Foundation (State, Queue, Rate Limiter, Sender)');
  {
    clearAllSessions();

    // 1. Session State
    assert(typeof getState === 'function', 'sessionState.getState tersedia');
    assert(typeof resetState === 'function', 'sessionState.resetState tersedia');

    // 2. Sender functions
    assert(typeof sender.sendText === 'function', 'sender.sendText tersedia');
    assert(typeof sender.sendImage === 'function', 'sender.sendImage tersedia');
    assert(typeof sender.sendDocument === 'function', 'sender.sendDocument tersedia');
    assert(typeof sender.sendImagesSequentially === 'function', 'sender.sendImagesSequentially tersedia');

    // 3. Queue & Rate limiter
    assert(typeof checkRateLimit === 'function', 'rateLimiter.checkRateLimit tersedia');
    assert(typeof enqueueProcessing === 'function', 'processingManager.enqueueProcessing tersedia');

    // 4. Rate limiter functionality
    const spamJid = '62899999999@s.whatsapp.net';
    config.rateLimitMaxMessages = 3;
    config.rateLimitWindow = 10000;
    assert(checkRateLimit(spamJid) === true, 'Pesan 1 diizinkan');
    assert(checkRateLimit(spamJid) === true, 'Pesan 2 diizinkan');
    assert(checkRateLimit(spamJid) === true, 'Pesan 3 diizinkan');
    assert(checkRateLimit(spamJid) === false, 'Pesan 4 dibatasi (rate limit aktif)');
  }

  // ----------------------------------------------------------
  // Hasil Akhir
  // ----------------------------------------------------------
  console.log('');
  console.log('='.repeat(65));
  console.log(`📊 HASIL AKHIR: ${testPassed} passed, ${testFailed} failed`);
  console.log('='.repeat(65));
  console.log('');

  stopCleanupTimer();

  if (testFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('❌ Test runner error:', err);
  process.exit(1);
});
