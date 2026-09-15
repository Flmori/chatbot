/**
 * Test Tahap 2 — Core Logic
 *
 * Menguji:
 * 1. Menu Utama muncul saat pesan pertama
 * 2. Pilihan "1" masuk state PENGAJUAN_ASK
 * 3. Input "0" dari submenu kembali ke MAIN
 * 4. Input "abc" menampilkan pesan tidak valid
 * 5. State User A dan User B terpisah
 * 6. Cleanup sesi idle > 30 menit
 */

// ============================================================
// Mock sock — simulasikan sendMessage dari Baileys
// ============================================================
function createMockSock() {
  const sentMessages = [];

  return {
    sentMessages,
    sendMessage: async (jid, content) => {
      sentMessages.push({ jid, content });
    },
    // Helper: ambil teks terakhir yang dikirim ke jid tertentu
    getLastTextTo(jid) {
      const msgs = sentMessages.filter(
        (m) => m.jid === jid && m.content.text
      );
      return msgs.length > 0 ? msgs[msgs.length - 1].content.text : null;
    },
    // Helper: ambil semua teks yang dikirim ke jid tertentu
    getAllTextsTo(jid) {
      return sentMessages
        .filter((m) => m.jid === jid && m.content.text)
        .map((m) => m.content.text);
    },
    clearMessages() {
      sentMessages.length = 0;
    },
  };
}

// ============================================================
// Helper: buat objek msg tiruan
// ============================================================
function createMsg(jid, text, fromMe = false) {
  return {
    key: {
      remoteJid: jid,
      fromMe,
    },
    message: {
      conversation: text,
    },
  };
}

// ============================================================
// Test Runner
// ============================================================
async function runTests() {
  // Fresh import — pastikan state bersih
  const { handleMessage } = require('../src/handler/messageHandler');
  const sessionState = require('../src/state/sessionState');
  const config = require('../src/config');
  
  // Disable rate limit and delay for testing core logic
  config.rateLimitMaxMessages = 999;
  config.processingDelay = 0;

  // Bersihkan state dan timer sebelum test
  sessionState.clearAllSessions();
  sessionState.stopCleanupTimer();

  const sock = createMockSock();
  let passed = 0;
  let failed = 0;

  function assert(testName, condition, detail = '') {
    if (condition) {
      console.log(`  ✅ ${testName}`);
      passed++;
    } else {
      console.log(`  ❌ ${testName}${detail ? ` — ${detail}` : ''}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST TAHAP 2 — CORE LOGIC');
  console.log('='.repeat(60) + '\n');

  // ----------------------------------------------------------
  // TEST 1: Pesan pertama "Halo" → Menu Utama muncul
  // ----------------------------------------------------------
  console.log('TEST 1: Pesan pertama "Halo" → Menu Utama');
  {
    sessionState.clearAllSessions();
    sock.clearMessages();

    await handleMessage(sock, createMsg('6281111111111@s.whatsapp.net', 'Halo'));

    const texts = sock.getAllTextsTo('6281111111111@s.whatsapp.net');
    const hasMenu = texts.some((t) => t.includes('Layanan Bantuan') && t.includes('AMS'));
    const hasChoices = texts.some((t) => t.includes('1️⃣') && t.includes('4️⃣'));
    const state = sessionState.getState('6281111111111@s.whatsapp.net');

    assert('Menu Utama dikirim', hasMenu);
    assert('Pilihan 1-4 ada', hasChoices);
    assert('State = MAIN', state?.menu === 'MAIN');
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 2: Pesan pertama "1" → Masuk state PENGAJUAN_ASK
  // ----------------------------------------------------------
  console.log('TEST 2: Pesan "1" dari MAIN → PENGAJUAN_ASK');
  {
    sessionState.clearAllSessions();
    sock.clearMessages();

    // Pertama, user harus dapat state MAIN
    await handleMessage(sock, createMsg('6282222222222@s.whatsapp.net', 'hi'));
    sock.clearMessages();

    // Lalu ketik "1"
    await handleMessage(sock, createMsg('6282222222222@s.whatsapp.net', '1'));

    const texts = sock.getAllTextsTo('6282222222222@s.whatsapp.net');
    const hasPlaceholder = texts.some((t) => t.toLowerCase().includes('pengajuan baru'));
    const state = sessionState.getState('6282222222222@s.whatsapp.net');

    assert('Placeholder pengajuan dikirim', hasPlaceholder);
    assert('State = PENGAJUAN_ASK', state?.menu === 'PENGAJUAN_ASK');
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 3: Dari submenu → ketik 0 → kembali MAIN
  // ----------------------------------------------------------
  console.log('TEST 3: Dari submenu → ketik "0" → MAIN');
  {
    // Lanjut dari TEST 2, user di PENGAJUAN_ASK
    sock.clearMessages();

    await handleMessage(sock, createMsg('6282222222222@s.whatsapp.net', '0'));

    const texts = sock.getAllTextsTo('6282222222222@s.whatsapp.net');
    const hasMenu = texts.some((t) => t.includes('Layanan Bantuan') && t.includes('AMS'));
    const state = sessionState.getState('6282222222222@s.whatsapp.net');

    assert('Menu Utama muncul kembali', hasMenu);
    assert('State reset ke MAIN', state?.menu === 'MAIN');
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 4: Input "abc" → pesan pilihan tidak dikenali
  // ----------------------------------------------------------
  console.log('TEST 4: Input "abc" → pilihan tidak dikenali');
  {
    sessionState.clearAllSessions();
    sock.clearMessages();

    // Buat state MAIN dulu
    await handleMessage(sock, createMsg('6283333333333@s.whatsapp.net', 'x'));
    sock.clearMessages();

    // Ketik "abc"
    await handleMessage(sock, createMsg('6283333333333@s.whatsapp.net', 'abc'));

    const texts = sock.getAllTextsTo('6283333333333@s.whatsapp.net');
    const hasWarning = texts.some((t) =>
      t.includes('Pilihan tidak valid')
    );

    assert('Pesan warning muncul', hasWarning);
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 5: User A dan User B — state terpisah
  // ----------------------------------------------------------
  console.log('TEST 5: User A dan User B — state terpisah');
  {
    sessionState.clearAllSessions();
    sock.clearMessages();

    const jidA = '628AAAA@s.whatsapp.net';
    const jidB = '628BBBB@s.whatsapp.net';

    // User A masuk → Menu Utama
    await handleMessage(sock, createMsg(jidA, 'halo'));
    // User B masuk → Menu Utama
    await handleMessage(sock, createMsg(jidB, 'hai'));

    // User A pilih 1 → PENGAJUAN_ASK
    await handleMessage(sock, createMsg(jidA, '1'));
    // User B pilih 3 → PASSPHRASE_GUIDE
    await handleMessage(sock, createMsg(jidB, '3'));

    const stateA = sessionState.getState(jidA);
    const stateB = sessionState.getState(jidB);

    assert('User A → PENGAJUAN_ASK', stateA?.menu === 'PENGAJUAN_ASK');
    assert('User B → PASSPHRASE_GUIDE', stateB?.menu === 'PASSPHRASE_GUIDE');
    assert(
      'State A ≠ State B',
      stateA?.menu !== stateB?.menu
    );
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 6: Cleanup sesi idle > 30 menit
  // ----------------------------------------------------------
  console.log('TEST 6: Cleanup sesi idle > 30 menit');
  {
    sessionState.clearAllSessions();

    const jidOld = '628OLD@s.whatsapp.net';
    const jidNew = '628NEW@s.whatsapp.net';

    // Buat 2 sesi
    sessionState.resetState(jidOld);
    sessionState.resetState(jidNew);

    assert('2 sesi aktif', sessionState.getSessionCount() === 2);

    // Manipulasi lastActive agar jidOld terlihat idle > 30 menit
    const oldState = sessionState.getState(jidOld);
    oldState.lastActive = Date.now() - (31 * 60 * 1000); // 31 menit lalu

    // Jalankan cleanup
    const cleaned = sessionState.cleanupInactiveSessions();

    assert('1 sesi dibersihkan', cleaned === 1);
    assert('Sesi lama hilang', sessionState.getState(jidOld) === null);
    assert('Sesi baru masih ada', sessionState.getState(jidNew) !== null);
    assert('Total sesi = 1', sessionState.getSessionCount() === 1);
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST TAMBAHAN: Pilihan 2, 3, 4
  // ----------------------------------------------------------
  console.log('TEST EXTRA: Pilihan 2, 3, 4 dari Menu Utama');
  {
    sessionState.clearAllSessions();
    sock.clearMessages();

    const jid = '628EXTRA@s.whatsapp.net';

    // Buat state MAIN
    await handleMessage(sock, createMsg(jid, 'halo'));
    sock.clearMessages();

    // Pilih 2
    await handleMessage(sock, createMsg(jid, '2'));
    let state = sessionState.getState(jid);
    assert('Pilihan 2 → PEMBARUAN_ASK', state?.menu === 'PEMBARUAN_ASK');

    // Kembali ke MAIN
    await handleMessage(sock, createMsg(jid, '0'));
    sock.clearMessages();

    // Pilih 3
    await handleMessage(sock, createMsg(jid, '3'));
    state = sessionState.getState(jid);
    assert('Pilihan 3 → PASSPHRASE_GUIDE', state?.menu === 'PASSPHRASE_GUIDE');

    // Kembali ke MAIN
    await handleMessage(sock, createMsg(jid, '0'));
    sock.clearMessages();

    // Pilih 4
    await handleMessage(sock, createMsg(jid, '4'));
    state = sessionState.getState(jid);
    assert('Pilihan 4 → LIVE_AGEN', state?.menu === 'LIVE_AGEN');
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST TAMBAHAN: Abaikan pesan bot sendiri dan grup
  // ----------------------------------------------------------
  console.log('TEST EXTRA: Abaikan pesan bot sendiri & grup');
  {
    sessionState.clearAllSessions();
    sock.clearMessages();

    // Pesan dari bot sendiri (fromMe = true)
    await handleMessage(sock, createMsg('628SELF@s.whatsapp.net', 'halo', true));
    assert(
      'Pesan fromMe diabaikan',
      sock.sentMessages.length === 0
    );

    // Pesan dari grup
    await handleMessage(sock, createMsg('120363xxxx@g.us', 'halo'));
    assert(
      'Pesan grup diabaikan',
      sock.sentMessages.length === 0
    );
  }
  console.log('');

  // ----------------------------------------------------------
  // RINGKASAN
  // ----------------------------------------------------------
  console.log('='.repeat(60));
  console.log(`📊 Hasil: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('='.repeat(60));

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('❌ Test error:', err);
  process.exit(1);
});
