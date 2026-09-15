/**
 * Test Tahap 3 — WhatsApp Connection & QR Login
 *
 * Test ini TIDAK memerlukan koneksi WhatsApp sungguhan.
 * Test menggunakan mock/simulasi untuk memverifikasi logic.
 *
 * Untuk test yang memerlukan koneksi nyata (QR scan, pesan sungguhan),
 * gunakan checklist manual di bagian bawah.
 */

// ============================================================
// Helper: Mock untuk menguji connection logic
// ============================================================

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

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST TAHAP 3 — WhatsApp Connection & QR Login');
  console.log('='.repeat(60) + '\n');

  // ----------------------------------------------------------
  // TEST 1: Aplikasi dapat di-require tanpa error
  // ----------------------------------------------------------
  console.log('TEST 1: Module dapat di-require tanpa error');
  {
    let connectionOk = false;
    let appOk = false;
    let handlerOk = false;
    let stateOk = false;
    let senderOk = false;
    let configOk = false;

    try {
      require('../src/connection');
      connectionOk = true;
    } catch (e) {
      console.log(`    connection.js error: ${e.message}`);
    }

    try {
      require('../src/handler/messageHandler');
      handlerOk = true;
    } catch (e) {
      console.log(`    messageHandler.js error: ${e.message}`);
    }

    try {
      require('../src/state/sessionState');
      stateOk = true;
    } catch (e) {
      console.log(`    sessionState.js error: ${e.message}`);
    }

    try {
      require('../src/utils/sender');
      senderOk = true;
    } catch (e) {
      console.log(`    sender.js error: ${e.message}`);
    }

    try {
      require('../src/config');
      configOk = true;
    } catch (e) {
      console.log(`    config.js error: ${e.message}`);
    }

    assert('connection.js require OK', connectionOk);
    assert('messageHandler.js require OK', handlerOk);
    assert('sessionState.js require OK', stateOk);
    assert('sender.js require OK', senderOk);
    assert('config.js require OK', configOk);
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 2: connection.js exports fungsi yang diperlukan
  // ----------------------------------------------------------
  console.log('TEST 2: connection.js exports fungsi yang benar');
  {
    const connection = require('../src/connection');

    assert(
      'startBot adalah function',
      typeof connection.startBot === 'function'
    );
    assert(
      'shutdownBot adalah function',
      typeof connection.shutdownBot === 'function'
    );
    assert(
      'getActiveSock adalah function',
      typeof connection.getActiveSock === 'function'
    );
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 3: auth_info/ ada di .gitignore
  // ----------------------------------------------------------
  console.log('TEST 3: auth_info/ ada di .gitignore');
  {
    const fs = require('fs');
    const path = require('path');
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    let gitignoreContent = '';

    try {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    } catch (e) {
      console.log(`    Tidak bisa baca .gitignore: ${e.message}`);
    }

    assert(
      'auth_info/ tercantum di .gitignore',
      gitignoreContent.includes('auth_info/')
    );
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 4: config.authPath mengarah ke auth_info
  // ----------------------------------------------------------
  console.log('TEST 4: config.authPath mengarah ke auth_info');
  {
    const config = require('../src/config');
    const path = require('path');

    assert(
      'authPath terdefinisi',
      typeof config.authPath === 'string' && config.authPath.length > 0
    );
    assert(
      'authPath berisi "auth_info"',
      config.authPath.includes('auth_info')
    );
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 5: Pesan teks diteruskan ke handleMessage (mock)
  // ----------------------------------------------------------
  console.log('TEST 5: Pesan teks diteruskan ke handleMessage');
  {
    const { handleMessage } = require('../src/handler/messageHandler');
    const sessionState = require('../src/state/sessionState');

    sessionState.clearAllSessions();

    const sentMessages = [];
    const mockSock = {
      sendMessage: async (jid, content) => {
        sentMessages.push({ jid, content });
      },
    };

    // Simulasi pesan teks masuk
    const msg = {
      key: { remoteJid: '628TEST@s.whatsapp.net', fromMe: false },
      message: { conversation: 'halo' },
    };

    await handleMessage(mockSock, msg);

    const hasResponse = sentMessages.some(
      (m) => m.jid === '628TEST@s.whatsapp.net' && m.content.text
    );

    assert('handleMessage merespons pesan teks', hasResponse);

    sessionState.clearAllSessions();
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 6: Pesan dari bot sendiri diabaikan
  // ----------------------------------------------------------
  console.log('TEST 6: Pesan dari bot sendiri diabaikan');
  {
    const { handleMessage } = require('../src/handler/messageHandler');

    const sentMessages = [];
    const mockSock = {
      sendMessage: async (jid, content) => {
        sentMessages.push({ jid, content });
      },
    };

    const msg = {
      key: { remoteJid: '628BOT@s.whatsapp.net', fromMe: true },
      message: { conversation: 'halo' },
    };

    await handleMessage(mockSock, msg);

    assert('Pesan fromMe tidak menghasilkan respons', sentMessages.length === 0);
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 7: Pesan group diabaikan
  // ----------------------------------------------------------
  console.log('TEST 7: Pesan group diabaikan');
  {
    const { handleMessage } = require('../src/handler/messageHandler');

    const sentMessages = [];
    const mockSock = {
      sendMessage: async (jid, content) => {
        sentMessages.push({ jid, content });
      },
    };

    const msg = {
      key: { remoteJid: '120363xxxx@g.us', fromMe: false },
      message: { conversation: 'halo' },
    };

    await handleMessage(mockSock, msg);

    assert('Pesan group tidak menghasilkan respons', sentMessages.length === 0);
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 8: Pesan non-text tidak menyebabkan crash
  // ----------------------------------------------------------
  console.log('TEST 8: Pesan non-text tidak crash');
  {
    const { handleMessage } = require('../src/handler/messageHandler');

    const sentMessages = [];
    const mockSock = {
      sendMessage: async (jid, content) => {
        sentMessages.push({ jid, content });
      },
    };

    let crashedNull = false;
    let crashedImage = false;
    let crashedSticker = false;
    let crashedEmpty = false;

    // Pesan null
    try {
      await handleMessage(mockSock, { key: { remoteJid: '628X@s.whatsapp.net', fromMe: false }, message: null });
    } catch (_) {
      crashedNull = true;
    }

    // Pesan gambar (tanpa teks)
    try {
      await handleMessage(mockSock, {
        key: { remoteJid: '628X@s.whatsapp.net', fromMe: false },
        message: { imageMessage: { url: 'test' } },
      });
    } catch (_) {
      crashedImage = true;
    }

    // Pesan sticker
    try {
      await handleMessage(mockSock, {
        key: { remoteJid: '628X@s.whatsapp.net', fromMe: false },
        message: { stickerMessage: { url: 'test' } },
      });
    } catch (_) {
      crashedSticker = true;
    }

    // Pesan kosong
    try {
      await handleMessage(mockSock, {
        key: { remoteJid: '628X@s.whatsapp.net', fromMe: false },
        message: { conversation: '' },
      });
    } catch (_) {
      crashedEmpty = true;
    }

    assert('Pesan null tidak crash', !crashedNull);
    assert('Pesan gambar (tanpa teks) tidak crash', !crashedImage);
    assert('Pesan sticker tidak crash', !crashedSticker);
    assert('Pesan kosong tidak crash', !crashedEmpty);
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 9: Simulasi disconnect tidak crash
  // ----------------------------------------------------------
  console.log('TEST 9: shutdownBot() tidak crash');
  {
    const connection = require('../src/connection');
    let crashed = false;

    try {
      // Panggil shutdown meskipun tidak ada koneksi aktif
      connection.shutdownBot();
    } catch (_) {
      crashed = true;
    }

    assert('shutdownBot tanpa koneksi aktif tidak crash', !crashed);
    assert(
      'getActiveSock() return null setelah shutdown',
      connection.getActiveSock() === null
    );
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 10: Tidak ada koneksi ganda (guard isConnecting)
  // ----------------------------------------------------------
  console.log('TEST 10: Guard koneksi ganda ada di connection.js');
  {
    const fs = require('fs');
    const path = require('path');
    const connectionCode = fs.readFileSync(
      path.join(__dirname, '..', 'src', 'connection.js'),
      'utf8'
    );

    assert(
      'Variable isConnecting ada',
      connectionCode.includes('isConnecting')
    );
    assert(
      'Guard "if (isConnecting)" ada',
      connectionCode.includes('if (isConnecting)')
    );
    assert(
      'activeSock ditutup sebelum buat baru',
      connectionCode.includes('activeSock.end()')
    );
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 11: Graceful shutdown handler terdaftar di app.js
  // ----------------------------------------------------------
  console.log('TEST 11: Graceful shutdown di app.js');
  {
    const fs = require('fs');
    const path = require('path');
    const appCode = fs.readFileSync(
      path.join(__dirname, '..', 'src', 'app.js'),
      'utf8'
    );

    assert('SIGINT handler ada', appCode.includes('SIGINT'));
    assert('SIGTERM handler ada', appCode.includes('SIGTERM'));
    assert(
      'shutdownBot dipanggil',
      appCode.includes('shutdownBot')
    );
    assert(
      'uncaughtException handler ada',
      appCode.includes('uncaughtException')
    );
    assert(
      'unhandledRejection handler ada',
      appCode.includes('unhandledRejection')
    );
  }
  console.log('');

  // ----------------------------------------------------------
  // TEST 12: Logout tidak melakukan reconnect
  // ----------------------------------------------------------
  console.log('TEST 12: Logout logic di connection.js');
  {
    const fs = require('fs');
    const path = require('path');
    const connectionCode = fs.readFileSync(
      path.join(__dirname, '..', 'src', 'connection.js'),
      'utf8'
    );

    assert(
      'DisconnectReason.loggedOut dicek',
      connectionCode.includes('DisconnectReason.loggedOut')
    );
    assert(
      'Instruksi login ulang ada',
      connectionCode.includes('Hapus folder auth_info/')
    );
    // Verifikasi bahwa startBot() hanya ada di else branch (reconnect),
    // bukan di loggedOut branch.
    // Cara: cek bahwa loggedOut branch menggunakan === (if-true = logout, else = reconnect)
    // dan startBot ada di setTimeout (reconnect), bukan langsung di loggedOut block.
    assert(
      'startBot hanya dipanggil saat reconnect (bukan logout)',
      connectionCode.includes('statusCode === DisconnectReason.loggedOut') &&
      connectionCode.includes('setTimeout') &&
      connectionCode.includes('startBot()')
    );
  }
  console.log('');

  // ----------------------------------------------------------
  // RINGKASAN
  // ----------------------------------------------------------
  console.log('='.repeat(60));
  console.log(`📊 Hasil: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('='.repeat(60));
  console.log('');

  // ----------------------------------------------------------
  // CHECKLIST MANUAL (memerlukan WhatsApp nyata)
  // ----------------------------------------------------------
  console.log('📋 CHECKLIST MANUAL (jalankan dengan "npm start"):');
  console.log('─'.repeat(50));
  console.log('[ ] QR Code muncul di terminal saat pertama kali');
  console.log('[ ] Setelah scan QR, status berubah ke "connected"');
  console.log('[ ] Folder auth_info/ terbuat setelah login');
  console.log('[ ] Restart "npm start" → TIDAK minta QR ulang');
  console.log('[ ] Kirim pesan → Menu Utama muncul');
  console.log('[ ] Ctrl+C → bot berhenti dengan pesan "Bot dihentikan"');
  console.log('');

  if (failed > 0) {
    process.exit(1);
  }
}

// Stop cleanup timer agar test bisa exit
const sessionState = require('../src/state/sessionState');
sessionState.stopCleanupTimer();

runTests().catch((err) => {
  console.error('❌ Test error:', err);
  process.exit(1);
});
