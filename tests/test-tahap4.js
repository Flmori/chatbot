/**
 * Test Tahap 4 — Main Menu, Session Management, Processing Delay, Anti-Spam
 */

function createMockSock() {
  const sentMessages = [];
  return {
    sentMessages,
    sendMessage: async (jid, content) => {
      sentMessages.push({ jid, content });
    },
    getLastTextTo(jid) {
      const msgs = sentMessages.filter((m) => m.jid === jid && m.content.text);
      return msgs.length > 0 ? msgs[msgs.length - 1].content.text : null;
    },
    clearMessages() {
      sentMessages.length = 0;
    },
  };
}

function createMsg(jid, text) {
  return {
    key: {
      remoteJid: jid,
      fromMe: false,
      id: 'MSG_' + Date.now() + '_' + Math.random(),
    },
    message: {
      conversation: text,
    },
  };
}

async function runTests() {
  const { handleMessage } = require('../src/handler/messageHandler');
  const sessionState = require('../src/state/sessionState');
  const rateLimiter = require('../src/utils/rateLimiter');
  const config = require('../src/config');

  let passed = 0;
  let failed = 0;

  function assert(name, condition) {
    if (condition) {
      console.log(`  ✅ ${name}`);
      passed++;
    } else {
      console.log(`  ❌ ${name}`);
      failed++;
    }
  }

  const sock = createMockSock();

  console.log('='.repeat(60));
  console.log('🧪 TEST TAHAP 4 — MAIN MENU & SESSION & RATE LIMIT');
  console.log('='.repeat(60));

  // ==========================================================
  // MAIN MENU & NAVIGATION
  // ==========================================================
  console.log('\n--- MAIN MENU & SESSION ---');
  {
    config.rateLimitMaxMessages = 999;
    config.processingDelay = 0;
    sessionState.clearAllSessions();
    const jid = '628TESTMAIN@s.whatsapp.net';

    // 1. First contact -> Main Menu
    await handleMessage(sock, createMsg(jid, 'Halo'));
    let text = sock.getLastTextTo(jid);
    assert('First contact → Main Menu', text.includes('1️⃣') && text.includes('Pengajuan Baru'));

    // Input 1 -> Pengajuan
    sock.clearMessages();
    await handleMessage(sock, createMsg(jid, '1'));
    text = sock.getLastTextTo(jid);
    assert('Input 1 → PENGAJUAN (Email Dinas)', text.toLowerCase().includes('pengajuan baru'));

    // Input 0 -> Back to Main
    sock.clearMessages();
    await handleMessage(sock, createMsg(jid, '0'));
    text = sock.getLastTextTo(jid);
    assert('Input 0 → MAIN', text.includes('Kembali ke Menu Utama'));

    // Input 2 -> Pembaruan (Standby)
    sock.clearMessages();
    await handleMessage(sock, createMsg(jid, '2'));
    text = sock.getLastTextTo(jid);
    assert('Input 2 → PEMBARUAN (Standby)', text.includes('Pembaharuan') || text.includes('penyiapan SOP'));

    // Input 0 -> Back to Main
    sock.clearMessages();
    await handleMessage(sock, createMsg(jid, '0'));

    // Input 3 -> Passphrase (Standby)
    sock.clearMessages();
    await handleMessage(sock, createMsg(jid, '3'));
    text = sock.getLastTextTo(jid);
    assert('Input 3 → PASSPHRASE (Standby)', text.includes('Reset Passphrase') || text.includes('penyiapan SOP'));

    // Input 0 -> Back to Main
    sock.clearMessages();
    await handleMessage(sock, createMsg(jid, '0'));

    // Input 4 -> Live Agen
    sock.clearMessages();
    await handleMessage(sock, createMsg(jid, '4'));
    text = sock.getLastTextTo(jid);
    const agentPhone = config.liveAgents ? config.liveAgents[0].displayPhone : config.liveAgent.displayPhone;
    assert('Input 4 → LIVE_AGENT config', text && text.includes(agentPhone));

    // Invalid input
    sock.clearMessages();
    await handleMessage(sock, createMsg(jid, '0')); // back to main
    sock.clearMessages();
    await handleMessage(sock, createMsg(jid, 'abc'));
    text = sock.getLastTextTo(jid);
    assert('Invalid input → warning', text.includes('Pilihan tidak valid'));
  }

  // ==========================================================
  // SESSION EXPIRED
  // ==========================================================
  console.log('\n--- SESSION EXPIRED ---');
  {
    sessionState.clearAllSessions();
    const jid1 = '628EXP1@s.whatsapp.net';
    await handleMessage(sock, createMsg(jid1, 'halo')); // Create session

    // Simulate expired
    const state1 = sessionState.getState(jid1);
    state1.lastActive = 0; // sangat lampau
    sessionState.cleanupInactiveSessions(); // ini akan memindahkan ke expiredSessions

    sock.clearMessages();
    await handleMessage(sock, createMsg(jid1, '1'));
    let text = sock.getLastTextTo(jid1);
    assert('Expired + Input Angka → Expired Notice + Main Menu', 
           text && text.includes('Sesi sebelumnya telah berakhir') && text.includes('Mari kita mulai kembali'));

    // Second message after expired notice should be processed normally
    sock.clearMessages();
    await handleMessage(sock, createMsg(jid1, '1'));
    text = sock.getLastTextTo(jid1);
    assert('Pesan kedua setelah expired → Diproses normal', text && text.toLowerCase().includes('pengajuan baru'));

    // Test text message after expired
    const jid2 = '628EXP2@s.whatsapp.net';
    await handleMessage(sock, createMsg(jid2, 'halo')); 

    const state2 = sessionState.getState(jid2);
    state2.lastActive = 0;
    sessionState.cleanupInactiveSessions();

    sock.clearMessages();
    await handleMessage(sock, createMsg(jid2, 'halo lagi'));
    text = sock.getLastTextTo(jid2);
    assert('Expired + Teks Bebas → Expired Notice + Penjelasan hanya angka', 
           text && text.includes('Sesi sebelumnya telah berakhir') && text.includes('silakan pilih menu'));
  }

  // ==========================================================
  // PROCESSING DELAY
  // ==========================================================
  console.log('\n--- PROCESSING DELAY ---');
  {
    config.processingDelay = 100; // 100ms
    const jid = '628DELAY@s.whatsapp.net';
    const start = Date.now();
    await handleMessage(sock, createMsg(jid, 'halo'));
    const end = Date.now();
    assert('Delay diaplikasikan per pesan (>=100ms)', end - start >= 100);
    config.processingDelay = 0; // reset
  }

  // ==========================================================
  // RATE LIMITER
  // ==========================================================
  console.log('\n--- RATE LIMITER ---');
  {
    const jid = '628SPAM@s.whatsapp.net';
    config.rateLimitMaxMessages = 5;
    config.rateLimitWindow = 30000;
    rateLimiter.cleanupRateLimits(); // clear map

    sock.clearMessages();
    for(let i=0; i<5; i++) {
      await handleMessage(sock, createMsg(jid, 'halo'));
    }

    // Pesan ke 6 -> kena spam warning
    sock.clearMessages();
    await handleMessage(sock, createMsg(jid, 'halo'));
    let text = sock.getLastTextTo(jid);
    assert('Pesan ke-6 dibatasi → Peringatan dikirim', text && text.includes('terlalu cepat'));

    // Pesan ke 7 -> diblokir tapi tanpa warning lagi
    sock.clearMessages();
    await handleMessage(sock, createMsg(jid, 'halo'));
    assert('Pesan spam selanjutnya diblokir tanpa spamming peringatan', sock.sentMessages.length === 0);
  }

  // ----------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Hasil: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('='.repeat(60));

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
