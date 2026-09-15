const config = require('../config');

// ============================================================
// Rate Limiter — Mencegah spam per user
// ============================================================

// Map<JID, { timestamps: number[], warned: boolean }>
const rateLimits = new Map();

/**
 * Mengecek apakah user melampaui batas rate limit.
 * Mengembalikan true jika diperbolehkan, false jika spam.
 *
 * @param {string} jid - WhatsApp ID
 * @returns {boolean} - true jika OK, false jika limit
 */
function checkRateLimit(jid) {
  const now = Date.now();
  const windowMs = config.rateLimitWindow;
  const maxMessages = config.rateLimitMaxMessages;

  if (!rateLimits.has(jid)) {
    rateLimits.set(jid, { timestamps: [now], warned: false });
    return true;
  }

  const record = rateLimits.get(jid);
  
  // Hapus timestamp yang sudah lebih dari windowMs
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
  
  // Cek apakah melampaui batas
  if (record.timestamps.length >= maxMessages) {
    if (!record.warned) {
      record.warned = true; // Tandai sudah diperingatkan
      return false; // Jangan diizinkan, dan bot harus mengirim warning
    }
    // Sudah pernah diperingatkan dalam window ini
    return null; // Return null menandakan "spam tapi diam saja"
  }

  // Masih dalam batas, tambahkan timestamp baru
  record.timestamps.push(now);
  
  // Jika sebelumnya spam dan sekarang sudah OK (meskipun logikanya ini tidak akan terjadi
  // kecuali timestamps.length kembali di bawah maxMessages karena filter), kita reset warned
  if (record.warned && record.timestamps.length < maxMessages) {
     record.warned = false;
  }
  
  return true;
}

/**
 * Membersihkan record rate limit yang sudah usang (bisa dipanggil periodik jika diperlukan)
 */
function cleanupRateLimits() {
  const now = Date.now();
  const windowMs = config.rateLimitWindow;
  
  for (const [jid, record] of rateLimits.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      rateLimits.delete(jid);
    }
  }
}

// Jalankan cleanup tiap menit untuk mencegah memory leak
const cleanupTimer = setInterval(cleanupRateLimits, 60000);
if (cleanupTimer.unref) cleanupTimer.unref();

module.exports = {
  checkRateLimit,
  cleanupRateLimits, // diekspor untuk testing
};
