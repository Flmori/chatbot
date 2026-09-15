const config = require('../config');

// ============================================================
// In-Memory Session State Manager
// Setiap user WhatsApp (JID) memiliki state sendiri yang terpisah.
// State disimpan di Map, bukan database (sesuai kebutuhan PKL).
// ============================================================

/**
 * @typedef {Object} UserState
 * @property {string} menu   - Menu aktif: 'MAIN', 'PENGAJUAN_ASK', dll.
 * @property {number} step   - Langkah saat ini di dalam menu (0 = awal).
 * @property {number} lastActive - Timestamp terakhir user aktif.
 * @property {Object} [data] - Data sementara per-sesi (opsional, untuk tahap selanjutnya).
 */

/** @type {Map<string, UserState>} */
const sessions = new Map();

/** @type {Set<string>} */
const expiredSessions = new Set();

// ============================================================
// Fungsi-fungsi State Manager
// ============================================================

/**
 * Mengecek apakah sesi user sebelumnya pernah expired.
 * @param {string} jid
 * @returns {boolean}
 */
function isSessionExpired(jid) {
  return expiredSessions.has(jid);
}

/**
 * Menghapus status expired untuk JID.
 * @param {string} jid
 */
function clearExpiredStatus(jid) {
  expiredSessions.delete(jid);
}

/**
 * Membuat state default untuk user baru.
 * @returns {UserState}
 */
function createDefaultState() {
  return {
    menu: 'MAIN',
    step: 0,
    lastActive: Date.now(),
    data: {},
  };
}

/**
 * Mengambil state user. Jika belum ada, return null.
 * @param {string} jid - WhatsApp JID
 * @returns {UserState|null}
 */
function getState(jid) {
  return sessions.get(jid) || null;
}

/**
 * Mengganti seluruh state user.
 * @param {string} jid - WhatsApp JID
 * @param {UserState} state - State baru
 */
function setState(jid, state) {
  sessions.set(jid, { ...state, lastActive: Date.now() });
}

/**
 * Update sebagian field dari state user.
 * Jika user belum punya state, buat default dulu lalu update.
 * @param {string} jid - WhatsApp JID
 * @param {Partial<UserState>} updates - Field yang ingin di-update
 */
function updateState(jid, updates) {
  const current = sessions.get(jid) || createDefaultState();
  sessions.set(jid, { ...current, ...updates, lastActive: Date.now() });
}

/**
 * Reset state user kembali ke MAIN (menu utama).
 * Menghapus juga status expired jika ada.
 * @param {string} jid - WhatsApp JID
 */
function resetState(jid) {
  clearExpiredStatus(jid);
  sessions.set(jid, createDefaultState());
}

/**
 * Update lastActive tanpa mengubah state lainnya.
 * Berguna untuk menandai user masih aktif.
 * @param {string} jid - WhatsApp JID
 */
function touchState(jid) {
  const current = sessions.get(jid);
  if (current) {
    current.lastActive = Date.now();
  }
}

/**
 * Bersihkan sesi yang sudah tidak aktif lebih dari stateTimeout (30 menit).
 * Dipanggil secara berkala oleh interval di startCleanupTimer().
 * @returns {number} Jumlah sesi yang dihapus
 */
function cleanupInactiveSessions() {
  const now = Date.now();
  let cleaned = 0;

  for (const [jid, state] of sessions) {
    if (now - state.lastActive > config.stateTimeout) {
      sessions.delete(jid);
      expiredSessions.add(jid);
      cleaned++;
      console.log(`🧹 Sesi dihapus (idle > 30 menit): ${jid}`);
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Total sesi dibersihkan: ${cleaned}`);
  }

  return cleaned;
}

// ============================================================
// Cleanup Timer — dijalankan sekali saat modul di-load
// ============================================================

let cleanupTimer = null;

/**
 * Memulai interval pembersihan sesi idle.
 */
function startCleanupTimer() {
  if (cleanupTimer) return; // Jangan buat duplikat

  cleanupTimer = setInterval(() => {
    cleanupInactiveSessions();
  }, config.cleanupInterval);

  // Jangan mencegah proses Node.js keluar karena timer ini
  cleanupTimer.unref();

  console.log(
    `🕐 Cleanup timer aktif — cek setiap ${config.cleanupInterval / 1000 / 60} menit`
  );
}

/**
 * Menghentikan interval pembersihan (untuk testing).
 */
function stopCleanupTimer() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

/**
 * Mengembalikan jumlah sesi aktif (untuk debugging/testing).
 * @returns {number}
 */
function getSessionCount() {
  return sessions.size;
}

/**
 * Menghapus seluruh sesi (untuk testing).
 */
function clearAllSessions() {
  sessions.clear();
  expiredSessions.clear();
}

// Mulai cleanup timer secara otomatis
startCleanupTimer();

module.exports = {
  getState,
  setState,
  updateState,
  resetState,
  touchState,
  cleanupInactiveSessions,
  startCleanupTimer,
  stopCleanupTimer,
  getSessionCount,
  clearAllSessions,
  isSessionExpired,
  clearExpiredStatus,
  // Untuk testing: expose internal
  _sessions: sessions,
  _createDefaultState: createDefaultState,
};
