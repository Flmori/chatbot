const config = require('../config');

// ============================================================
// Processing Manager — Mengatur antrean pemrosesan per JID
// ============================================================

// Map<JID, Promise>
const processingQueues = new Map();

/**
 * Menambahkan task (pesan) ke antrean pemrosesan user (JID).
 * Memastikan bahwa satu user hanya memproses satu pesan pada satu waktu.
 * Juga menerapkan delay statis agar pemrosesan tidak terlalu cepat.
 *
 * @param {string} jid - WhatsApp ID
 * @param {Function} taskFn - Fungsi async yang akan dieksekusi
 * @returns {Promise<void>}
 */
function enqueueProcessing(jid, taskFn) {
  // Jika user belum punya antrean, buat Promise yang resolved
  if (!processingQueues.has(jid)) {
    processingQueues.set(jid, Promise.resolve());
  }

  // Tambahkan task baru ke chain
  const queue = processingQueues.get(jid).then(async () => {
    // 1. Terapkan processing delay SEBELUM menjalankan task
    await new Promise((resolve) => setTimeout(resolve, config.processingDelay));
    
    // 2. Jalankan task
    try {
      await taskFn();
    } catch (err) {
      console.error(`Error processing task for ${jid}:`, err);
    }
  });

  // Update map dengan promise terbaru
  processingQueues.set(jid, queue);

  // Hapus dari map jika antrean sudah selesai untuk menghindari memory leak
  queue.finally(() => {
    if (processingQueues.get(jid) === queue) {
      processingQueues.delete(jid);
    }
  });

  return queue;
}

module.exports = {
  enqueueProcessing,
};
