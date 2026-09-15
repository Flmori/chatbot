const { sendText } = require('../utils/sender');
const { updateState } = require('../state/sessionState');
const config = require('../config');

// ============================================================
// Handler Live Agen — Multi-Agent Kominfo
// Membaca seluruh petugas dari config.liveAgents[] secara dinamis
// ============================================================

/**
 * Menghasilkan teks Live Agen dengan kontak seluruh petugas.
 * @returns {string}
 */
function getLiveAgenText() {
  const agentLines = config.liveAgents
    .map(
      (a) =>
        `👤 ${a.name} (${a.label}):\n📱 ${a.displayPhone}\n🔗 Chat WA: ${a.waLink}`
    )
    .join('\n\n');

  return `📞 Layanan Live Agen Kominfo\n\nSilakan hubungi petugas layanan kami:\n\n${agentLines}\n\n⏰ Jam Operasional:\n${config.operationalHours}\n\nKetik:\n0️⃣ Menu Utama`;
}

/**
 * Entry point Live Agen — dipanggil saat user memilih menu 4 atau shortcut 4.
 * @param {Object} sock - Baileys socket
 * @param {string} jid  - WhatsApp JID
 */
async function startLiveAgen(sock, jid) {
  updateState(jid, { menu: 'LIVE_AGEN', step: 0 });
  await sendText(sock, jid, getLiveAgenText());
}

module.exports = {
  startLiveAgen,
  getLiveAgenText,
};
