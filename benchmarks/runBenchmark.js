/**
 * AUTOMATED RESOURCE BENCHMARK & PERFORMANCE AUDIT (PROJECT FINAL)
 * Path: C:\Users\HP 240\Downloads\chatbot-main
 *
 * Murni READ-ONLY terhadap core project:
 * - Tidak memodifikasi src/**
 * - Tidak memodifikasi config.js (stateTimeout 30m & cleanupInterval 10m tetap asli)
 * - Tidak menyentuh/mereset auth_info/**
 * - Mengukur seluruh fitur final Menu 1 s.d. 4, scaling 1/3/5/10 user,
 *   repeated cycles (stabilitas), dan session cleanup.
 */

const fs = require('fs');
const path = require('path');
const ResourceMonitor = require('./resourceMonitor');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createAuditSocket() {
  const sentMessages = [];
  return {
    sentMessages,
    sendMessage: async (jid, content) => {
      sentMessages.push({
        jid,
        hasText: !!content.text,
        hasImage: !!content.image,
        imageSizeBytes: content.image ? content.image.length : 0,
        hasDoc: !!content.document,
        docSizeBytes: content.document ? content.document.length : 0,
        fileName: content.fileName || null,
        timestamp: Date.now(),
      });
      return { key: { id: 'AUDIT_' + Math.random().toString(36).substring(7), remoteJid: jid } };
    },
    clearSent: () => {
      sentMessages.length = 0;
    },
  };
}

function createWaMsg(jid, text) {
  return {
    key: { remoteJid: jid, fromMe: false },
    message: { conversation: text },
    messageTimestamp: Math.floor(Date.now() / 1000),
  };
}

async function runFinalBenchmark() {
  const monitor = new ResourceMonitor();
  console.log('='.repeat(75));
  console.log('🚀 RESOURCE BENCHMARK AKTUAL — PROJECT FINAL (chatbot-main)');
  console.log('='.repeat(75));
  console.log('Project Path    : C:\\Users\\HP 240\\Downloads\\chatbot-main');
  console.log('Node.js Version : ' + process.version);
  console.log('Platform        : ' + process.platform + ' (' + process.arch + ')');
  console.log('PID             : ' + process.pid);
  console.log('');

  // 1. STARTUP STAGE
  console.log('[1/10] Mengukur Fase Startup & Loading Dependencies Final...');
  monitor.sample('COLD_START');

  const { handleMessage } = require('../src/handler/messageHandler');
  const sessionState = require('../src/state/sessionState');
  const config = require('../src/config');
  const sender = require('../src/utils/sender');
  const processingManager = require('../src/utils/processingManager');
  const rateLimiter = require('../src/utils/rateLimiter');

  const startupSnap = monitor.sample('STARTUP_COMPLETE');
  console.log('   → RSS Startup     : ' + startupSnap.rssMB + ' MB');
  console.log('   → Heap Used       : ' + startupSnap.heapUsedMB + ' MB / Heap Total: ' + startupSnap.heapTotalMB + ' MB');
  console.log('   → External Memory : ' + startupSnap.externalMB + ' MB');
  console.log('');

  // 2. IDLE BASELINE
  console.log('[2/10] Mengukur Fase Idle Baseline (Standby 5 detik)...');
  monitor.resetCpuBaseline();
  for (let i = 0; i < 5; i++) {
    await sleep(1000);
    monitor.sample('IDLE_BASELINE');
  }
  const idleAgg = monitor.getAggregate('IDLE_BASELINE');
  console.log('   → Idle RSS Avg    : ' + idleAgg.avgRssMB + ' MB (Peak: ' + idleAgg.maxRssMB + ' MB)');
  console.log('   → Idle Heap Used  : ' + idleAgg.avgHeapUsedMB + ' MB');
  console.log('   → Idle CPU Avg    : ' + idleAgg.avgCpuPercent + '%');
  console.log('');

  const sock = createAuditSocket();

  // 3. MENU 1 — PENGAJUAN BARU (DOCX + 8 GAMBAR JUKNIS)
  console.log('[3/10] Mengukur Menu 1 Final (Pengajuan Baru: DOCX + 8 Foto Juknis)...');
  const u1 = '628111000001@s.whatsapp.net';
  monitor.resetCpuBaseline();

  await handleMessage(sock, createWaMsg(u1, 'halo'));
  await sleep(100);
  await handleMessage(sock, createWaMsg(u1, '1')); // Check email dinas
  await sleep(100);
  await handleMessage(sock, createWaMsg(u1, '1')); // Sudah punya email -> kirim DOCX
  await sleep(200);
  await handleMessage(sock, createWaMsg(u1, '1')); // Lanjut juknis -> kirim 8 gambar
  await sleep(8500); // Tunggu delay 8 gambar (1000ms delay per gambar)
  const m1Peak = monitor.sample('MENU1_COMPLETE');

  console.log('   → Menu 1 Peak RSS : ' + m1Peak.rssMB + ' MB');
  console.log('   → Menu 1 Heap Used: ' + m1Peak.heapUsedMB + ' MB');
  console.log('   → Menu 1 External : ' + m1Peak.externalMB + ' MB');
  console.log('   → Menu 1 CPU      : ' + m1Peak.totalCpuPercent + '%');
  console.log('');

  // 4. MENU 2 — PEMBAHARUAN (CABANG EXPIRED & BELUM EXPIRED)
  console.log('[4/10] Mengukur Menu 2 Final (Pembaharuan: Cabang Expired & H-30)...');
  const u2 = '628111000002@s.whatsapp.net';
  monitor.resetCpuBaseline();

  await handleMessage(sock, createWaMsg(u2, 'halo'));
  await sleep(100);
  await handleMessage(sock, createWaMsg(u2, '2')); // Menu 2 -> CHECK_EXPIRED
  await sleep(100);
  await handleMessage(sock, createWaMsg(u2, '2')); // Cabang 2: Sudah Expired -> kirim 2 foto expired
  await sleep(2500);
  const m2Peak = monitor.sample('MENU2_COMPLETE');

  console.log('   → Menu 2 Peak RSS : ' + m2Peak.rssMB + ' MB');
  console.log('   → Menu 2 Heap Used: ' + m2Peak.heapUsedMB + ' MB');
  console.log('');

  // 5. MENU 3 — RESET PASSPHRASE (DOCX + 2 FOTO JUKNIS)
  console.log('[5/10] Mengukur Menu 3 Final (Reset Passphrase: DOCX + 2 Foto Juknis)...');
  const u3 = '628111000003@s.whatsapp.net';
  monitor.resetCpuBaseline();

  await handleMessage(sock, createWaMsg(u3, 'halo'));
  await sleep(100);
  await handleMessage(sock, createWaMsg(u3, '3')); // Menu 3 -> kirim DOCX
  await sleep(200);
  await handleMessage(sock, createWaMsg(u3, '1')); // Lanjut panduan -> kirim 2 foto
  await sleep(2500);
  const m3Peak = monitor.sample('MENU3_COMPLETE');

  console.log('   → Menu 3 Peak RSS : ' + m3Peak.rssMB + ' MB');
  console.log('   → Menu 3 Heap Used: ' + m3Peak.heapUsedMB + ' MB');
  console.log('');

  // 6. MENU 4 — LIVE AGEN & NAVIGASI 0
  console.log('[6/10] Mengukur Menu 4 Final (Live Agen) & Navigasi Global 0...');
  const u4 = '628111000004@s.whatsapp.net';
  monitor.resetCpuBaseline();

  await handleMessage(sock, createWaMsg(u4, 'halo'));
  await sleep(100);
  await handleMessage(sock, createWaMsg(u4, '4')); // Live Agen
  await sleep(100);
  await handleMessage(sock, createWaMsg(u4, '0')); // Kembali ke menu utama via 0
  await sleep(100);
  const m4Peak = monitor.sample('MENU4_COMPLETE');

  console.log('   → Menu 4 Peak RSS : ' + m4Peak.rssMB + ' MB');
  console.log('   → Menu 4 Heap Used: ' + m4Peak.heapUsedMB + ' MB');
  console.log('');

  // 7. SETTLED POST-MEDIA STATE
  console.log('[7/10] Mengukur Settled State (5 detik pasca seluruh media selesai)...');
  monitor.resetCpuBaseline();
  for (let i = 0; i < 5; i++) {
    await sleep(1000);
    monitor.sample('SETTLED_POST_MEDIA');
  }
  const settledAgg = monitor.getAggregate('SETTLED_POST_MEDIA');
  console.log('   → Settled RSS     : ' + settledAgg.avgRssMB + ' MB');
  console.log('   → Settled Heap    : ' + settledAgg.avgHeapUsedMB + ' MB');
  console.log('   → Settled CPU Avg : ' + settledAgg.avgCpuPercent + '%');
  console.log('');

  // 8. SCALING MULTI-SESSION (1, 3, 5, 10 USER KONKUREN)
  console.log('[8/10] Mengukur Scaling Multi-User Konkuren (1, 3, 5, 10 Sesi)...');
  sessionState.clearAllSessions();
  sock.clearSent();

  async function simulateUserFlow(uid) {
    const jid = '62899111' + String(uid).padStart(4, '0') + '@s.whatsapp.net';
    await handleMessage(sock, createWaMsg(jid, 'halo'));
    await handleMessage(sock, createWaMsg(jid, '1'));
    await handleMessage(sock, createWaMsg(jid, '1'));
  }

  const scalingResults = [];

  console.log('   - Testing Scaling: 1 User...');
  monitor.resetCpuBaseline();
  await simulateUserFlow(1);
  await sleep(500);
  const scale1 = monitor.sample('SCALE_1_USER');
  scalingResults.push({ users: 1, ...scale1 });

  console.log('   - Testing Scaling: 3 Users Konkuren...');
  monitor.resetCpuBaseline();
  await Promise.all([simulateUserFlow(2), simulateUserFlow(3)]);
  await sleep(500);
  const scale3 = monitor.sample('SCALE_3_USERS');
  scalingResults.push({ users: 3, ...scale3 });

  console.log('   - Testing Scaling: 5 Users Konkuren...');
  monitor.resetCpuBaseline();
  await Promise.all([simulateUserFlow(4), simulateUserFlow(5)]);
  await sleep(500);
  const scale5 = monitor.sample('SCALE_5_USERS');
  scalingResults.push({ users: 5, ...scale5 });

  console.log('   - Testing Scaling: 10 Users Konkuren...');
  monitor.resetCpuBaseline();
  await Promise.all([
    simulateUserFlow(6),
    simulateUserFlow(7),
    simulateUserFlow(8),
    simulateUserFlow(9),
    simulateUserFlow(10),
  ]);
  await sleep(1000);
  const scale10 = monitor.sample('SCALE_10_USERS');
  scalingResults.push({ users: 10, ...scale10 });

  for (const sr of scalingResults) {
    console.log('     [' + sr.users + ' Users] RSS: ' + sr.rssMB + ' MB | Heap: ' + sr.heapUsedMB + ' MB | Active Sessions: ' + sr.activeSessions);
  }
  console.log('');

  // 9. REPEATED CYCLES (DETEKSI INDIKASI MEMORY LEAK)
  console.log('[9/10] Menguji 10 Siklus Interaksi Berulang (Evaluasi Stabilitas / Indikasi Leak)...');
  const cycleResults = [];
  for (let c = 1; c <= 10; c++) {
    const cycleJid = '628777111' + String(c).padStart(3, '0') + '@s.whatsapp.net';
    await handleMessage(sock, createWaMsg(cycleJid, 'halo'));
    await handleMessage(sock, createWaMsg(cycleJid, '1'));
    await sleep(150);
    const snap = monitor.sample('CYCLE_' + c);
    cycleResults.push({ cycle: c, rssMB: snap.rssMB, heapUsedMB: snap.heapUsedMB, extMB: snap.externalMB });
  }

  const firstCycle = cycleResults[0];
  const lastCycle = cycleResults[cycleResults.length - 1];
  const cycleDeltaRss = +(lastCycle.rssMB - firstCycle.rssMB).toFixed(2);
  const cycleDeltaHeap = +(lastCycle.heapUsedMB - firstCycle.heapUsedMB).toFixed(2);

  console.log('   → Siklus 1  : RSS ' + firstCycle.rssMB + ' MB | Heap ' + firstCycle.heapUsedMB + ' MB');
  console.log('   → Siklus 5  : RSS ' + cycleResults[4].rssMB + ' MB | Heap ' + cycleResults[4].heapUsedMB + ' MB');
  console.log('   → Siklus 10 : RSS ' + lastCycle.rssMB + ' MB | Heap ' + lastCycle.heapUsedMB + ' MB');
  console.log('   → Delta Siklus 1 s.d. 10: RSS Δ ' + (cycleDeltaRss > 0 ? '+' : '') + cycleDeltaRss + ' MB | Heap Δ ' + (cycleDeltaHeap > 0 ? '+' : '') + cycleDeltaHeap + ' MB');
  console.log('');

  // 10. SESSION CLEANUP RECOVERY
  console.log('[10/10] Mengukur Efek Session Expiry & Cleanup (Konfigurasi Asli)...');
  const beforeCleanupSessions = sessionState.getSessionCount();
  const preCleanupSnap = monitor.sample('PRE_CLEANUP');
  console.log('   → Active Sessions Sebelum Cleanup : ' + beforeCleanupSessions);
  console.log('   → Pre-Cleanup Heap Used           : ' + preCleanupSnap.heapUsedMB + ' MB');
  console.log('   [Info Konfigurasi Aktual]:');
  console.log('   - stateTimeout   : ' + config.stateTimeout + ' ms (' + (config.stateTimeout / 1000 / 60) + ' menit)');
  console.log('   - cleanupInterval: ' + config.cleanupInterval + ' ms (' + (config.cleanupInterval / 1000 / 60) + ' menit)');

  // Simulasikan berlalunya waktu > 30 menit pada lastActive tanpa mengubah config
  const THIRTY_ONE_MINS = 31 * 60 * 1000;
  for (const [jid, state] of sessionState._sessions) {
    state.lastActive = Date.now() - THIRTY_ONE_MINS;
  }

  const cleanedCount = sessionState.cleanupInactiveSessions();
  await sleep(1000);
  const postCleanupSnap = monitor.sample('POST_CLEANUP');

  console.log('   → Sesi yang Dihapus Oleh Cleanup : ' + cleanedCount);
  console.log('   → Active Sessions Sesudah Cleanup: ' + sessionState.getSessionCount());
  console.log('   → Post-Cleanup Heap Used          : ' + postCleanupSnap.heapUsedMB + ' MB');
  console.log('   → Post-Cleanup RSS                : ' + postCleanupSnap.rssMB + ' MB');
  console.log('');

  // SUMMARY & ARTIFACT GENERATION
  const overallAgg = monitor.getAggregate();

  const auditReport = {
    metadata: {
      generatedAt: new Date().toISOString(),
      projectPath: 'C:\\Users\\HP 240\\Downloads\\chatbot-main',
      nodeVersion: process.version,
      platform: process.platform + ' ' + process.arch,
      pid: process.pid,
      projectVersion: '1.0.0 (Tahap 1-6 Final)',
    },
    metrics: {
      startup: startupSnap,
      idle: idleAgg,
      menu1: m1Peak,
      menu2: m2Peak,
      menu3: m3Peak,
      menu4: m4Peak,
      settled: settledAgg,
      scaling: scalingResults,
      cycleStability: {
        firstCycle,
        lastCycle,
        deltaRssMB: cycleDeltaRss,
        deltaHeapMB: cycleDeltaHeap,
        allCycles: cycleResults,
      },
      cleanup: {
        beforeSessions: beforeCleanupSessions,
        afterSessions: sessionState.getSessionCount(),
        cleanedCount,
        preCleanupHeapUsedMB: preCleanupSnap.heapUsedMB,
        postCleanupHeapUsedMB: postCleanupSnap.heapUsedMB,
        postCleanupRssMB: postCleanupSnap.rssMB,
      },
      overall: {
        peakRssMB: overallAgg.maxRssMB,
        peakHeapUsedMB: overallAgg.maxHeapUsedMB,
        peakExternalMB: overallAgg.maxExternalMB,
        peakCpuPercent: overallAgg.maxCpuPercent,
        avgCpuPercent: overallAgg.avgCpuPercent,
      },
    },
  };

  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
  const jsonPath = path.join(resultsDir, 'benchmark_actual_results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(auditReport, null, 2), 'utf8');

  console.log('='.repeat(75));
  console.log('✅ BENCHMARK PROJECT FINAL SELESAI — DATA AKTUAL BERHASIL DISIMPAN');
  console.log('   File Hasil: ' + jsonPath);
  console.log('='.repeat(75));

  return auditReport;
}

runFinalBenchmark().catch((err) => {
  console.error('❌ Error saat eksekusi benchmark final:', err);
  process.exit(1);
});
