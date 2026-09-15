const path = require('path');

module.exports = {
  // ============================================================
  // Informasi Live Agen (Multi-Agent Kominfo)
  // Konfigurasi sentral: cukup tambahkan objek ke array ini
  // jika ada agen baru di kemudian hari.
  // ============================================================
  liveAgents: [
    {
      name: 'Pak Kris',
      label: 'Agen 1',
      phone: '081328823858',
      displayPhone: '0813-2882-3858',
      waLink: 'https://wa.me/6281328823858',
    },
    {
      name: 'Pak Jaya',
      label: 'Agen 2',
      phone: '08980008575',
      displayPhone: '0898-0008-575',
      waLink: 'https://wa.me/628980008575',
    },
  ],
  operationalHours: 'Senin - Jumat, 08:00 - 16:00 WIB',

  // ============================================================
  // Identitas Bot
  // ============================================================
  botName: 'Layanan Bantuan Tanda Tangan Elektronik AMS',

  // ============================================================
  // Path Dokumen Formulir Permohonan Word (.docx)
  // ============================================================
  docPaths: {
    formulirPermohonan: path.join(
      __dirname, '..', 'docs',
      'Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx'
    ),
  },

  // ============================================================
  // Path Gambar Panduan
  // ============================================================
  imagePaths: {
    cover: path.join(__dirname, '..', 'images', 'cover'),
    pengajuan: path.join(__dirname, '..', 'images', 'pengajuan'),
    pembaruan: path.join(__dirname, '..', 'images', 'pembaruan'),
    passphrase: path.join(__dirname, '..', 'images', 'passphrase'),
  },

  // ============================================================
  // Daftar file gambar per kategori
  // ============================================================
  imageFiles: {
    cover: ['00_panduan_ams.jpg'],
            pengajuan: [
      '01_registrasi_pengguna.jpg',
      '02_aktivasi_akun.jpg',
      '03_lengkapi_data_diri.jpg',
      '04_verifikasi_whatsapp.jpg',
      '05_data_kedinasan.jpg',
      '06_lengkapi_data.jpg',
      '07_verifikasi_data.jpg',
      '08_persetujuan_submit.jpg',
    ],
    pembaruan: [
      '01_daftar_sertifikat.jpg',
      '02_permohonan_pembaruan.jpg',
      '03_konfirmasi_pembaruan.jpg',
      '04_set_passphrase.jpg',
      '05_pembaruan_selesai.jpg',
    ],
    passphrase: [
      '01_daftar_sertifikat.jpg',
      '02_pilih_reset_passphrase.jpg',
      '03_link_reset_email.jpg',
      '04_pengecekan_foto.jpg',
      '05_buat_passphrase.jpg',
    ],
  },

  // ============================================================
  // Caption untuk gambar tutorial aktivasi Juknis (Menu 1)
  // Setiap gambar ditandai [SIMULASI / DEMO] dengan penjelasan singkat
  // mengacu pada urutan langkah Juknis AMS.
  // ============================================================
  imageCaptions: {
    pengajuan: [
      '[SIMULASI / DEMO] Langkah 1 — Registrasi Pengguna',
      '[SIMULASI / DEMO] Langkah 2 — Aktivasi Akun',
      '[SIMULASI / DEMO] Langkah 3 — Lengkapi Data Diri',
      '[SIMULASI / DEMO] Langkah 4 — Verifikasi WhatsApp',
      '[SIMULASI / DEMO] Langkah 5 — Data Kedinasan',
      '[SIMULASI / DEMO] Langkah 6 — Lengkapi Data',
      '[SIMULASI / DEMO] Langkah 7 — Verifikasi Data',
      '[SIMULASI / DEMO] Langkah 8 — Persetujuan dan Submit',
    ],
    pembaruan: [
      '📌 Langkah 1\nBuka daftar sertifikat pada aplikasi AMS.',
      '📌 Langkah 2\nPilih sertifikat yang akan dilakukan pembaharuan.',
      '📌 Langkah 3\nIkuti proses konfirmasi pembaharuan pada aplikasi AMS.',
      '📌 Langkah 4\nLakukan proses Set Passphrase sesuai instruksi AMS.',
      '📌 Langkah 5\nPastikan proses pembaharuan telah selesai.',
    ],
    passphrase: [
      '🔑 Langkah 1/5: Buka daftar sertifikat',
      '🔑 Langkah 2/5: Pilih Reset Passphrase',
      '🔑 Langkah 3/5: Cek email untuk link reset',
      '🔑 Langkah 4/5: Pengecekan foto',
      '🔑 Langkah 5/5: Buat passphrase baru',
    ],
  },

  // ============================================================
  // Path sesi autentikasi Baileys
  // ============================================================
  authPath: path.join(__dirname, '..', 'auth_info'),

  // ============================================================
  // Pengaturan State Percakapan
  // ============================================================
  stateTimeout: 30 * 60 * 1000,    // 30 menit — hapus state idle
  cleanupInterval: 10 * 60 * 1000, // 10 menit — interval pembersihan

  // ============================================================
  // Pengaturan Pengiriman Gambar
  // ============================================================
  sendDelay: 1000, // 1 detik antar gambar

  // ============================================================
  // Pengaturan Anti-Spam dan Delay Pemrosesan
  // ============================================================
  rateLimitMaxMessages: 5,        // Maksimal pesan sebelum di-rate limit
  rateLimitWindow: 30 * 1000,     // Window rate limit 30 detik
  processingDelay: 1500,          // Delay pemrosesan per pesan per user (1500ms)
};
