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
      'pembaruan_belum_expired_01.png',
      'pembaruan_belum_expired_02.png',
      'pembaruan_expired_01.png',
      'pembaruan_expired_02.png',
    ],
    passphrase: [
      'reset_passphrase_01.png',
      'reset_passphrase_02.png',
    ],
  },

  // ============================================================
  // Caption untuk gambar tutorial aktivasi Juknis (Menu 1, 2, 3)
  // Setiap gambar dilengkapi penjelasan singkat
  // mengacu pada urutan langkah Juknis AMS.
  // ============================================================
  imageCaptions: {
    pengajuan: [
      'Langkah 1 — Registrasi Pengguna',
      'Langkah 2 — Aktivasi Akun',
      'Langkah 3 — Lengkapi Data Diri',
      'Langkah 4 — Verifikasi WhatsApp',
      'Langkah 5 — Data Kedinasan',
      'Langkah 6 — Lengkapi Data',
      'Langkah 7 — Verifikasi Data',
      'Langkah 8 — Persetujuan dan Submit',
    ],
    pembaruan: [
      'Langkah 1 — Pembaharuan Sertifikat (Juknis Hlm. 38)',
      'Langkah 2 — Proses Pembaharuan Sertifikat (Juknis Hlm. 39)',
      'Informasi Sertifikat Expired — Pembaharuan Tidak Dapat Dilakukan (Juknis Hlm. 40)',
      'Arahan Pengajuan Sertifikat Baru (Juknis Hlm. 41)',
    ],
    passphrase: [
      'Langkah 1 — Reset Passphrase (Juknis Hlm. 44)',
      'Langkah 2 — Pembuatan Passphrase Baru (Juknis Hlm. 45)',
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
