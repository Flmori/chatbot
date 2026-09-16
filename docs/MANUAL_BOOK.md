# Buku Manual Teknis dan Operasional — Chatbot WhatsApp Layanan Bantuan Tanda Tangan Elektronik AMS

Buku panduan teknis dan operasional resmi untuk pengelolaan, pemeliharaan, dan pengembangan aplikasi **Chatbot WhatsApp Layanan Bantuan Tanda Tangan Elektronik (TTE) Aplikasi Manajemen Sertifikat (AMS)** pada **Dinas Komunikasi dan Informatika (Kominfo) Kabupaten Blora**.

---

## DAFTAR ISI

1. [BAB 1 — Pendahuluan](#bab-1--pendahuluan)
2. [BAB 2 — Gambaran Umum Sistem](#bab-2--gambaran-umum-sistem)
3. [BAB 3 — Fitur dan Status Fitur](#bab-3--fitur-dan-status-fitur)
4. [BAB 4 — Teknologi yang Digunakan](#bab-4--teknologi-yang-digunakan)
5. [BAB 5 — Struktur Folder Project](#bab-5--struktur-folder-project)
6. [BAB 6 — Penjelasan File Utama](#bab-6--penjelasan-file-utama)
7. [BAB 7 — Instalasi dan Persiapan Environment](#bab-7--instalasi-dan-persiapan-environment)
8. [BAB 8 — Menjalankan Bot](#bab-8--menjalankan-bot)
9. [BAB 9 — Login WhatsApp Pertama Kali](#bab-9--login-whatsapp-pertama-kali)
10. [BAB 10 — Mengganti Akun WhatsApp Bot](#bab-10--mengganti-akun-whatsapp-bot)
11. [BAB 11 — Konfigurasi Bot (src/config.js)](#bab-11--konfigurasi-bot-srcconfigjs)
12. [BAB 12 — Pengelolaan Live Agen](#bab-12--pengelolaan-live-agen)
13. [BAB 13 — Alur Menu Utama](#bab-13--alur-menu-utama)
14. [BAB 14 — Panduan Menu Pengajuan Baru (Menu 1)](#bab-14--panduan-menu-pengajuan-baru-menu-1)
15. [BAB 15 — Pengelolaan Formulir Permohonan DOCX](#bab-15--pengelolaan-formulir-permohonan-docx)
16. [BAB 16 — Pengelolaan Foto Tutorial Juknis Menu 1](#bab-16--pengelolaan-foto-tutorial-juknis-menu-1)
17. [BAB 17 — Panduan Menu Pembaharuan / Expired (Menu 2)](#bab-17--panduan-menu-pembaharuan--expired-menu-2)
18. [BAB 18 — Panduan Menu Reset Passphrase (Menu 3)](#bab-18--panduan-menu-reset-passphrase-menu-3)
19. [BAB 19 — Manajemen Sesi Percakapan](#bab-19--manajemen-sesi-percakapan)
20. [BAB 20 — Anti-Spam dan Processing Queue](#bab-20--anti-spam-dan-processing-queue)
21. [BAB 21 — Testing dan Validasi](#bab-21--testing-dan-validasi)
22. [BAB 22 — Troubleshooting](#bab-22--troubleshooting)
23. [BAB 23 — Keamanan dan Privasi Data](#bab-23--keamanan-dan-privasi-data)
24. [BAB 24 — Backup dan Pemindahan Project](#bab-24--backup-dan-pemindahan-project)
25. [BAB 25 — Checklist Maintenance dan Prosedur Perubahan SOP](#bab-25--checklist-maintenance-dan-prosedur-perubahan-sop)

---

## BAB 1 — Pendahuluan

### 1.1 Latar Belakang
Aplikasi Chatbot WhatsApp Layanan Bantuan Tanda Tangan Elektronik AMS dikembangkan dalam rangka kegiatan Praktik Kerja Lapangan (PKL) di **Dinas Komunikasi dan Informatika (Kominfo) Kabupaten Blora**. Sistem ini dirancang untuk mempermudah Aparatur Sipil Negara (ASN) dan pengguna layanan di lingkungan Pemerintah Kabupaten Blora dalam memahami alur permohonan sertifikat elektronik, aktivasi akun pada Aplikasi Manajemen Sertifikat (AMS), permohonan pembaruan sertifikat, prosedur reset passphrase, serta mempermudah komunikasi dengan petugas verifikator (Live Agen).

### 1.2 Tujuan Manual Book
Buku manual ini disusun sebagai referensi komprehensif bagi:
- **Operator Layanan**: Petunjuk operasional harian, prosedur login, penanganan kendala koneksi WhatsApp, dan pemantauan pesan.
- **Administrator & Pemelihara Sistem**: Pedoman pelaksanaan checklist pemeliharaan rutin mingguan, audit aset dokumen/gambar, dan pengawasan keamanan sesi.
- **Pengembang (Developer) Berikutnya**: Penjelasan arsitektur kode sumber, modul handler, manajemen state sesi, cara mengubah konfigurasi, prosedur penyesuaian teks SOP resmi, dan pelaksanaan uji regresi otomatis.
- **Pembimbing PKL & Tim Teknis Kominfo**: Dokumentasi kepatuhan alur sistem terhadap Petunjuk Teknis (Juknis) resmi Balai Sertifikasi Elektronik (BSrE) / Kominfo.

### 1.3 Batasan Sistem
Chatbot ini dirancang secara terstruktur berbasis menu dan navigasi pasti (*rule-based / menu-driven*).

> [!IMPORTANT]
> **BATASAN SISTEM & KEAMANAN:**
> 1. **Bukan Chatbot AI Bebas (NLP)**: Interaksi dilakukan melalui input angka navigasi (misalnya `1`, `2`, `3`, `4`, dan `0`) untuk menjamin kepatuhan materi terhadap SOP hukum persuratan resmi dan mencegah kesalahan informasi (*hallucination*).
> 2. **Tanpa Akses Database AMS Langsung**: Chatbot beroperasi sebagai pemandu informasi dan penyedia dokumen permohonan. Chatbot **TIDAK TERHUBUNG** ke basis data internal AMS, tidak dapat mengecek masa kedaluwarsa secara otomatis, tidak dapat menghitung periode H-30 secara otomatis, dan tidak melakukan mutasi data pengguna pada server AMS.
> 3. **Tidak Menerima Berkas Masuk via Chat**: Chatbot tidak menerima kiriman formulir yang telah diisi, scan berkas KTP/SK, maupun dokumen identitas pribadi. Seluruh pengajuan berkas resmi dilakukan secara mandiri oleh pemohon kepada Verifikator Kominfo.
> 4. **Prinsip Keamanan Tanpa Kredensial (Zero Credential)**: Chatbot **TIDAK PERNAH** meminta, menerima, mencatat, maupun menyimpan data rahasia seperti *passphrase* lama/baru, password email dinas, kode PIN, maupun OTP.

---

## BAB 2 — Gambaran Umum Sistem

### 2.1 Arsitektur Alur Interaksi
Chatbot menerima pesan masuk dari aplikasi WhatsApp pengguna, memvalidasi format dan frekuensi pesan, kemudian mencocokkan input dengan status sesi pengguna pada *router* sentral.

```text
               Pengguna WhatsApp
                       │
                       ▼ (Pesan Masuk)
      [ Socket Baileys Multi-Device ]
                       │
                       ▼
            [ Anti-Spam Rate Limiter ]
          (Maks 5 pesan / 30 detik)
                       │
                       ▼
           [ Processing Queue Manager ]
            (Jeda 1500 ms per user)
                       │
                       ▼
        [ Session State Router In-Memory ]
         (Timeout 30m / Auto-clean 10m)
                       │
       ┌───────────────┼───────────────┬───────────────┐
       ▼               ▼               ▼               ▼
   [Menu 1]        [Menu 2]        [Menu 3]        [Menu 4]
Pengajuan Baru    Pembaharuan   Reset Passphrase   Live Agen
  (Juknis Hal     (Juknis Hal     (Juknis Hal    (Pak Kris &
    7–14)           38–41)          44–45)        Pak Jaya)
       │               │               │               │
       └───────────────┴───────┬───────┴───────────────┘
                               ▼
            [ WhatsApp Sender Utility ]
         (Teks, Media Jeda 1s, Dokumen)
```

### 2.2 Komponen Interaksi Pengguna
1. **Menu Utama**: Pesan sambutan dan daftar 4 layanan aktif yang muncul pada kontak pertama atau saat pengguna mengetik angka `0`.
2. **Pengirim Media & Dokumen**: Modul pengirim berkas formulir Word (.docx) dan gambar panduan Juknis AMS secara bertahap dengan jeda waktu aman.
3. **Pemandu Navigasi Global (`0`)**: Pengguna dapat mengetik angka `0` kapan saja dari submenu mana pun untuk kembali ke Menu Utama secara instan tanpa menghapus riwayat obrolan WhatsApp pengguna.

---

## BAB 3 — Fitur dan Status Fitur

Seluruh fitur inti chatbot telah diimplementasikan penuh dan berstatus **AKTIF 100%**:

| No | Nama Fitur | Status Sistem | Deskripsi Operasional |
| :---: | :--- | :---: | :--- |
| **1** | **Menu 1 — Pengajuan Baru** | **AKTIF** | Verifikasi kepemilikan email dinas, pengiriman otomatis dokumen formulir permohonan (.docx), pengiriman 8 foto panduan aktivasi Juknis AMS berurutan (Hal. 7–14), ringkasan alur SOP pengajuan baru, dan kontak Live Agen. |
| **2** | **Menu 2 — Pembaharuan / Expired** | **AKTIF** | Penanganan sertifikat menjelang kedaluwarsa (H-30) dengan pengiriman Formulir Permohonan (.docx) dan 2 foto Juknis (Hal. 38–39), serta edukasi sertifikat kedaluwarsa (Expired) dengan 2 foto Juknis (Hal. 40–41) dan arahan ke Live Agen. |
| **3** | **Menu 3 — Reset Passphrase** | **AKTIF** | Panduan permohonan reset kata sandi sertifikat yang lupa, pengiriman berkas Formulir Permohonan (.docx) langsung, opsi panduan 2 foto Juknis (Hal. 44–45), dan tautan Live Agen dengan batasan keamanan ketat. |
| **4** | **Menu 4 — Live Agen** | **AKTIF** | Menampilkan daftar kontak petugas verifikator resmi Dinas Kominfo Blora (Pak Kris & Pak Jaya) beserta tautan chat WhatsApp langsung dan informasi jam operasional dinas. |

---

## BAB 4 — Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan ekosistem Node.js dengan pustaka resmi yang terdaftar pada berkas `package.json`:

- **Node.js**: Lingkungan eksekusi (*runtime environment*) JavaScript asynchronous sisi server (disarankan versi LTS `>= 18.0.0`).
- **@whiskeysockets/baileys (`^7.0.0-rc14`)**: Pustaka klien soket WebSocket multi-device untuk berkomunikasi langsung dengan protokol WhatsApp Web.
  *(Pernyataan Faktual: Proyek ini menggunakan Baileys melalui koneksi soket Web WhatsApp multi-device dan BUKAN WhatsApp Business Platform / Cloud API resmi berbayar dari Meta).*
- **pino (`^10.3.1`)**: Pustaka logging performa tinggi yang digunakan internal oleh Baileys.
- **qrcode-terminal (`^0.12.0`)**: Penampil visual kode QR autentikasi langsung pada antarmuka terminal/konsol.
- **docx (`^9.7.1`)**: Pustaka untuk menyusun dan membuat struktur dokumen Microsoft Word (.docx) secara programatik.
- **sharp (`^0.35.4`)**: Pustaka manipulasi citra berkecepatan tinggi untuk pemrosesan aset visual.
- **nodemon (`^3.1.14`)**: Utilitas pengembangan untuk me-restart aplikasi secara otomatis saat terjadi perubahan berkas sumber.

---

## BAB 5 — Struktur Folder Project

Susunan folder proyek final:

```text
chatbot-main/
├── .agents/                                                    # Konfigurasi tooling & agent AI (Tetap di root)
├── auth_info/                                                  # Kredensial sesi WhatsApp Baileys (SANGAT RAHASIA)
├── docs/                                                       # Berkas dokumentasi & formulir
│   ├── juknis/                                                 # Buku Petunjuk Teknis resmi AMS
│   │   └── PETUNJUK-TEKNIS-PENGGUNAAN-APLIKASI-MANAJEMEN-...pdf
│   ├── Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx      # Berkas formulir resmi Word aktif
│   └── MANUAL_BOOK.md                                          # Buku Manual Teknis 25 BAB Lengkap
├── images/                                                     # Aset gambar panduan teknis
│   ├── cover/                                                  # Gambar sampul menu (opsional)
│   ├── passphrase/                                             # 2 aset panduan Reset Passphrase (Hal 44–45)
│   │   ├── reset_passphrase_01.png
│   │   └── reset_passphrase_02.png
│   ├── pembaruan/                                              # 4 aset panduan Pembaruan/Expired (Hal 38–41)
│   │   ├── pembaruan_belum_expired_01.png
│   │   ├── pembaruan_belum_expired_02.png
│   │   ├── pembaruan_expired_01.png
│   │   └── pembaruan_expired_02.png
│   └── pengajuan/                                              # 8 aset panduan Pengajuan Baru (Hal 7–14)
│       ├── 01_registrasi_pengguna.jpg
│       ├── ...
│       └── 08_persetujuan_submit.jpg
├── node_modules/                                               # Dependensi paket Node.js
├── scripts/                                                    # Skrip utilitas mandiri
│   ├── generate-dummy-images.js                                # Generator gambar simulasi lokal
│   └── generate-form-docx.js                                   # Skrip pembuat formulir DOCX
├── src/                                                        # Kode sumber aplikasi utama
│   ├── handler/                                                # Logika interaksi per menu
│   │   ├── liveAgen.js                                         # Handler Menu 4 (Live Agen)
│   │   ├── menuUtama.js                                        # Handler pesan pembuka & Menu Utama
│   │   ├── messageHandler.js                                   # Router sentral pesan masuk
│   │   ├── pembaruanExpired.js                                 # Handler Menu 2 (Pembaruan & Expired)
│   │   ├── pengajuanBaru.js                                    # Handler Menu 1 (Pengajuan Baru & Juknis)
│   │   └── resetPassphrase.js                                  # Handler Menu 3 (Reset Passphrase)
│   ├── state/                                                  # Pengelolaan sesi pengguna
│   │   └── sessionState.js                                     # State in-memory & auto-cleanup sesi
│   ├── utils/                                                  # Modul utilitas sistem
│   │   ├── processingManager.js                                # Antrean pemrosesan pesan (1500ms delay)
│   │   ├── rateLimiter.js                                      # Anti-spam (5 pesan/30 detik per user)
│   │   └── sender.js                                           # Fungsi pengirim teks, media, & dokumen
│   ├── app.js                                                  # Entry point aplikasi bot
│   ├── config.js                                               # Konfigurasi terpusat (agen, aset, waktu)
│   └── connection.js                                           # Manajemen koneksi Baileys & QR login
├── tests/                                                      # Rangkaian pengujian otomatis
│   ├── test-tahap2.js                                          # Test Core Logic & Navigasi (21 passed)
│   ├── test-tahap3.js                                          # Test Koneksi Baileys & Session (31 passed)
│   ├── test-tahap4.js                                          # Test Menu, Timeout & Rate Limit (13 passed)
│   ├── test-tahap7.js                                          # Legacy Archive Test (67 passed / 8 failed)
│   └── test-tahap8.js                                          # Active Comprehensive Master Suite (95 passed)
├── .gitignore                                                  # Pengecualian berkas Git
├── package.json                                                # Konfigurasi package & skrip runner
├── package-lock.json                                           # Lockfile dependensi
└── README.md                                                   # Dokumentasi utama proyek
```

---

## BAB 6 — Penjelasan File Utama

### 6.1 Berkas Entry Point & Koneksi
- `src/app.js`: Titik masuk (*entry point*) aplikasi. Menangani siklus hidup proses, inisialisasi koneksi, serta penanganan *graceful shutdown* (`SIGINT`, `SIGTERM`) agar soket terputus bersih.
- `src/connection.js`: Modul pembungkus Baileys WebSocket. Menangani autentikasi multi-device, render Kode QR ke terminal via `qrcode-terminal`, *reconnection loop* jika koneksi terputus, dan penangkapan event pesan masuk `messages.upsert`.

### 6.2 Berkas Pengendali Alur Percakapan (Handler)
- `src/handler/messageHandler.js`: Router sentral yang menerima pesan masuk, menyaring pesan dari bot sendiri (`fromMe`) dan pesan grup (`@g.us`), memanggil pembatas frekuensi (*rate limiter*), mengantrekan pemrosesan (*processing manager*), serta mengarahkan pesan ke handler menu yang sesuai.
- `src/handler/menuUtama.js`: Menyajikan teks pembuka dan pilihan 4 layanan. Menangani routing awal pilihan angka 1–4.
- `src/handler/pengajuanBaru.js`: Mengelola percakapan Menu 1. Memeriksa kepemilikan email dinas, mengirim formulir Word DOCX, dan mengirimkan 8 foto tutorial Juknis AMS halaman 7–14 beserta rangkuman alur SOP.
- `src/handler/pembaruanExpired.js`: Mengelola percakapan Menu 2. Menyajikan alur cabang status sertifikat: Expired (2 foto Hal 40–41 + Live Agen) dan Belum Expired H-30 (Formulir DOCX + 2 foto Hal 38–39 + Live Agen).
- `src/handler/resetPassphrase.js`: Mengelola percakapan Menu 3. Mengirim penjelasan resmi, mengirimkan berkas formulir DOCX secara langsung, menawarkan panduan teknis 2 foto Juknis Hal 44–45, dan kontak Live Agen dengan penegasan batasan keamanan.
- `src/handler/liveAgen.js`: Mengelola Menu 4 dengan membaca seluruh daftar verifikator resmi dari `config.liveAgents[]` secara dinamis.

### 6.3 Berkas Pengelolaan State & Sesi
- `src/state/sessionState.js`: Mengelola status percakapan pengguna secara *in-memory* berbasis JID. Menyediakan fungsi `getState`, `updateState`, `resetState`, `touchState`, dan menjalankan interval otomatis pembersihan sesi kedaluwarsa.

### 6.4 Berkas Utilitas Sistem (Utils)
- `src/utils/rateLimiter.js`: Melacak frekuensi pengiriman pesan per JID dalam jendela 30 detik untuk mencegah spam dan risiko pemblokiran nomor WhatsApp.
- `src/utils/processingManager.js`: Menerapkan antrean pesan berurutan per pengguna dengan jeda 1,5 detik guna mencegah benturan state.
- `src/utils/sender.js`: Antarmuka pengiriman pesan teks, pengiriman media gambar berurutan dengan jeda aman 1 detik, serta pengiriman berkas dokumen.

### 6.5 Berkas Konfigurasi, Skrip, & Dokumen
- `src/config.js`: Pusat konfigurasi aplikasi (daftar agen, jam layanan dinas, path aset gambar, caption, path dokumen, durasi timeout sesi, delay pengiriman, dan kuota rate limit).
- `scripts/generate-form-docx.js`: Skrip otomatis pembangun dokumen template formulir resmi Word (`Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`) menggunakan pustaka `docx`.
- `docs/Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`: Berkas formulir fisik aktif yang dikirimkan kepada pemohon.

---

## BAB 7 — Instalasi dan Persiapan Environment

### 7.1 Persyaratan Sistem
- Komputer Server atau PC Lokal (Windows / Linux / macOS).
- Node.js versi `>= 18.0.0` (LTS direkomendasikan).
- NPM versi `>= 9.0.0`.
- Smartphone dengan nomor WhatsApp aktif yang terhubung ke jaringan internet stabil.

### 7.2 Langkah Instalasi Bertahap
1. **Buka Terminal / Command Prompt** pada direktori tujuan.
2. **Klon Repositori atau Ekstrak Berkas Proyek**:
   ```bash
   cd chatbot-main
   ```
3. **Instal Seluruh Dependensi**:
   ```bash
   npm install
   ```
4. **Verifikasi Keutuhan Sistem**:
   ```bash
   npm test
   ```
   Pastikan pengujian menghasilkan **95 passed, 0 failed**.

---

## BAB 8 — Menjalankan Bot

### 8.1 Mode Produksi (Standar)
Jalankan bot menggunakan perintah:
```bash
npm start
```
Perintah ini mengeksekusi `node src/app.js` yang akan memulai koneksi soket Baileys.

### 8.2 Mode Pengembangan (Development)
Jalankan bot menggunakan nodemon:
```bash
npm run dev
```
Nodemon akan memantau perubahan berkas JavaScript pada folder `src/` dan melakukan restart bot secara otomatis saat berkas disimpan.

### 8.3 Pemantauan Log Konsol
Saat bot beroperasi, terminal akan menampilkan log aktivitas:
- `🕐 Cleanup timer aktif — cek setiap 10 menit`: Timer auto-cleanup sesi aktif.
- `🤖 Memulai koneksi WhatsApp...`: Proses inisialisasi soket Baileys.
- `✅ Bot terhubung ke WhatsApp!`: Sesi aktif berhasil terhubung ke server WhatsApp.
- `📩 Pesan dari: [JID]`: Notifikasi pesan masuk dari pengguna.
- `📄 Dokumen terkirim ke [JID]`: Notifikasi keberhasilan pengiriman berkas formulir DOCX.

---

## BAB 9 — Login WhatsApp Pertama Kali

1. Jalankan perintah `npm start` pada terminal interaktif.
2. Terminal akan menampilkan representasi visual **Kode QR**.
3. Buka aplikasi WhatsApp pada ponsel resmi layanan Kominfo Blora.
4. Masuk ke menu **Perangkat Tertaut** (*Linked Devices*) → Ketuk **Tautkan Perangkat** (*Link a Device*).
5. Arahkan pemindai kamera WhatsApp ke Kode QR pada layar monitor/terminal.
6. Setelah pemindaian berhasil:
   - Konsol terminal akan mencetak: `✅ Bot terhubung ke WhatsApp!`.
   - Folder kredensial `auth_info/` akan terbuat secara otomatis di direktori utama proyek.
7. Pada eksekusi berikutnya, bot akan menggunakan kredensial yang tersimpan di `auth_info/` sehingga **tidak perlu memindai Kode QR ulang**.

---

## BAB 10 — Mengganti Akun WhatsApp Bot

Jika nomor layanan dinas berpindah perangkat atau diganti:
1. Hentikan aplikasi bot pada terminal menggunakan pintasan keyboard `Ctrl + C`.
2. Hapus seluruh folder `auth_info/`:
   - Pada Windows PowerShell: `Remove-Item -Recurse -Force auth_info`
   - Pada Linux/macOS: `rm -rf auth_info`
3. Jalankan kembali aplikasi: `npm start`.
4. Kode QR baru akan muncul di terminal dan siap dipindai oleh nomor WhatsApp baru.

---

## BAB 11 — Konfigurasi Bot (src/config.js)

Berkas `src/config.js` mengelola seluruh parameter operasional:

```javascript
module.exports = {
  // Informasi Multi-Agent Kominfo
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

  // Identitas Bot
  botName: 'Layanan Bantuan Tanda Tangan Elektronik AMS',

  // Path Dokumen & Aset Gambar
  docPaths: {
    formulirPermohonan: path.join(__dirname, '..', 'docs', 'Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx'),
  },
  imageFiles: {
    pengajuan: [ /* 8 gambar Juknis Hal 7–14 */ ],
    pembaruan: [
      'pembaruan_belum_expired_01.png', // Halaman 38
      'pembaruan_belum_expired_02.png', // Halaman 39
      'pembaruan_expired_01.png',       // Halaman 40
      'pembaruan_expired_02.png',       // Halaman 41
    ],
    passphrase: [
      'reset_passphrase_01.png',        // Halaman 44
      'reset_passphrase_02.png',        // Halaman 45
    ],
  },

  // Parameter Waktu & Kuota
  stateTimeout: 30 * 60 * 1000,    // 30 menit timeout sesi idle
  cleanupInterval: 10 * 60 * 1000, // 10 menit interval pembersihan
  sendDelay: 1000,                 // Jeda 1 detik antar pengiriman gambar
  rateLimitMaxMessages: 5,         // Maksimal 5 pesan per window
  rateLimitWindow: 30 * 1000,      // Jendela waktu 30 detik
  processingDelay: 1500,           // Jeda antrean 1500 ms per user
};
```

---

## BAB 12 — Pengelolaan Live Agen

### 12.1 Konfigurasi Agen Saat Ini
Saat ini sistem mengonfigurasi dua petugas verifikator resmi:
1. **Pak Kris (Agen 1)**: `0813-2882-3858` — `https://wa.me/6281328823858`
2. **Pak Jaya (Agen 2)**: `0898-0008-575` — `https://wa.me/628980008575`
- Jam Operasional: **Senin – Jumat, 08:00 – 16:00 WIB**.

### 12.2 Prosedur Menambah Agen Baru
Struktur `liveAgents` dirancang secara *multi-agent scalable*. Untuk menambahkan petugas baru:
1. Buka berkas `src/config.js`.
2. Tambahkan objek petugas baru ke dalam array `liveAgents`:
   ```javascript
   {
     name: 'Ibu Siti',
     label: 'Agen 3',
     phone: '081234567890',
     displayPhone: '0812-3456-7890',
     waLink: 'https://wa.me/6281234567890',
   },
   ```
3. Simpan berkas. Handler `liveAgen.js`, `pengajuanBaru.js`, `pembaruanExpired.js`, dan `resetPassphrase.js` akan merender data agen baru secara otomatis tanpa perlu memodifikasi logika handler.

---

## BAB 13 — Alur Menu Utama

### 13.1 Mekanisme Penerimaan Pengguna
Ketika pengguna pertama kali menyapa bot (misal: *"Halo"*, *"Pagi"*), bot mengenali pengguna sebagai sesi baru dan menyajikan sambutan Menu Utama:

```text
Halo, selamat datang di Layanan Bantuan Tanda Tangan Elektronik AMS.

Silakan pilih layanan:

1. Pengajuan Baru
2. Pembaharuan / Expired
3. Reset Passphrase
4. Live Agen

Ketik angka sesuai kebutuhan Anda.
```

- **Pilihan 1**: Masuk ke alur Pengajuan Baru (`PENGAJUAN_ASK`).
- **Pilihan 2**: Masuk ke alur Pembaharuan / Expired (`PEMBARUAN_ASK`).
- **Pilihan 3**: Masuk ke alur Reset Passphrase (`PASSPHRASE_GUIDE`).
- **Pilihan 4**: Menampilkan kontak Live Agen (`LIVE_AGEN`).
- **Input Tidak Dikenal**: Bot membalas dengan peringatan ramah dan menyajikan kembali pilihan menu 1–4.
- **Navigasi 0**: Mengembalikan pengguna ke Menu Utama dari alur mana pun tanpa menghapus riwayat chat.

---

## BAB 14 — Panduan Menu Pengajuan Baru (Menu 1)

### 14.1 Diagram Alur Detail
```text
                   [ Pengguna Pilih 1 ]
                            │
                            ▼
              [ Pertanyaan Email Dinas ]
               1. Sudah       2. Belum
                   │              │
       ┌───────────┴───────┐      └──────────────────────────┐
       ▼                   ▼                                 ▼
[ Kirim Form DOCX ]  [ Input 0: Menu Utama ]     [ Petunjuk Email Dinas ]
       │                                         + Kontak Live Agen
       ▼
 [ Pilihan Tutorial ]
   1. Lihat Panduan
   0. Menu Utama
       │
       ▼ (Input 1)
[ Kirim 8 Foto Panduan Juknis (Hal 7–14) ]
       │
       ▼
[ Ringkasan Alur SOP Pengajuan Baru ]
+ Kontak Live Agen Kominfo
```

### 14.2 Rincian Tahapan Alur Menu 1 (10 Langkah SOP)
1. Bot menanyakan apakah pengguna telah memiliki Email Dinas (@blorakab.go.id).
2. Jika belum memiliki, diarahkan untuk mengajukan email dinas ke Dinas Kominfo Blora.
3. Jika sudah memiliki, bot mengirimkan pengantar formulir dan mengirim berkas `Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`.
4. Pengguna mengisi berkas formulir permohonan tersebut secara mandiri.
5. Pengguna mengajukan formulir kepada pihak Kominfo / Verifikator.
6. Verifikator melakukan input data pemohon ke aplikasi AMS.
7. Pengguna menerima tautan aktivasi akun melalui Email Dinas.
8. Pengguna melakukan aktivasi akun secara mandiri.
9. Pengguna menunggu proses verifikasi dan persetujuan akun oleh Verifikator.
10. Setelah diverifikasi dan disetujui, tautan *Set Passphrase* dikirim melalui WhatsApp atau Email Dinas.

---

## BAB 15 — Pengelolaan Formulir Permohonan DOCX

### 15.1 Karakteristik Berkas
- **Nama Berkas Fisik**: `docs/Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`
- **Ukuran Berkas**: 9.187 bytes (~9 KB).
- Berkas ini berformat Microsoft Word standar (.docx) yang valid dan dapat dibuka serta diedit menggunakan Microsoft Office, WPS Office, maupun Google Docs.

### 15.2 Anatomi Isi Formulir Aktual (7 Komponen)
Sesuai format resmi dinas, dokumen formulir memuat:
1. **Kop Surat**:
   - `PEMERINTAH KABUPATEN / KOTA ....................`
   - `DINAS / BADAN / INSTANSI ....................`
   - `Alamat: Jl. ................................. Telp. (0XXX) XXXXXXX`
2. **Tanggal & Alamat Tujuan**:
   - `.................., .... .................. 20....`
   - `Kepada Yth. Kepala Dinas Komunikasi dan Informatika di Tempat`
3. **Perihal Surat**:
   - `Perihal: Permohonan Tanda Tangan Elektronik`
4. **Isi Pernyataan Permohonan**:
   - *"Dengan ini kami mengajukan pembuatan baru / pembaharuan / reset, coret yang tidak perlu."*
5. **Data Permohonan**:
   - `Tanda Tangan Elektronik :  [  ] Pembuatan Baru     [  ] Pembaharuan     [  ] Reset`
   - `Atas Nama                 :  ....................................................`
   - `Nama                      :  ....................................................`
   - `Email Dinas               :  ....................................................`
   - `No HP User                :  ....................................................`
   - `No HP Narahubung          :  ....................................................`
6. **Kalimat Penutup**:
   - *"Demikian surat permohonan dibuat atas kerja samanya, sekian terima kasih."*
7. **Area Tanda Tangan**:
   - Kolom tanda tangan pemohon tunggal (`Pemohon, ( ............................ )`).

*(Catatan: Formulir resmi tidak memuat field NIK, NIP, Pangkat/Golongan, Jabatan, Unit Kerja, atau Instansi tambahan di luar struktur di atas).*

### 15.3 Prosedur Mengganti Template Formulir
Jika dinas menerbitkan format formulir baru:
1. Siapkan berkas `.docx` baru dengan tata letak resmi yang disahkan.
2. Beri nama berkas tepat sama: `Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`.
3. Timpa (*overwrite*) berkas pada folder `docs/`.
4. Jalankan `npm test` untuk memastikan integritas berkas DOCX lulus uji otomatis.

---

## BAB 16 — Pengelolaan Foto Tutorial Juknis Menu 1

### 16.1 Pemetaan 8 Gambar Panduan
Folder: `images/pengajuan/`
1. `01_registrasi_pengguna.jpg` → Juknis Hal. 7 (Registrasi Pengguna)
2. `02_aktivasi_akun.jpg` → Juknis Hal. 8 (Aktivasi Akun)
3. `03_lengkapi_data_diri.jpg` → Juknis Hal. 9 (Lengkapi Data Diri)
4. `04_verifikasi_whatsapp.jpg` → Juknis Hal. 10 (Verifikasi WhatsApp)
5. `05_data_kedinasan.jpg` → Juknis Hal. 11 (Data Kedinasan)
6. `06_lengkapi_data.jpg` → Juknis Hal. 12 (Lengkapi Data)
7. `07_verifikasi_data.jpg` → Juknis Hal. 13 (Verifikasi Data)
8. `08_persetujuan_submit.jpg` → Juknis Hal. 14 (Persetujuan dan Submit)

Seluruh caption gambar dilengkapi penanda `[SIMULASI / DEMO]` untuk tujuan edukatif.

---

## BAB 17 — Panduan Menu Pembaharuan / Expired (Menu 2)

### 17.1 Konsep Alur
Menu 2 melayani ASN atau pengguna yang sertifikat elektroniknya mendekati masa kedaluwarsa atau telah kedaluwarsa. Sistem membagi alur menjadi dua cabang penanganan:

```text
                  [ Pengguna Pilih 2 ]
                           │
                           ▼
             [ Cek Masa Berlaku Sertifikat ]
            1. Sudah Expired   2. Belum Expired
                   │                  │
        ┌──────────┘                  └───────────────────┐
        ▼                                                 ▼
[ Edukasi Sertifikat Expired ]                   [ Edukasi Periode H-30 ]
(Tidak dapat diperbarui langsung)                (Konfirmasi apakah sudah H-30)
        │                                                 │
        ▼                                                 ▼ (Pilih 1: Ya, H-30)
[ Kirim 2 Foto Juknis ]                          [ Kirim Formulir Permohonan DOCX ]
- Hal 40: Info Expired                                    │
- Hal 41: Arahan Baru                                     ▼
        │                                        [ Pilihan Lihat Panduan ]
        ▼                                                 │
[ Kontak Live Agen Kominfo ]                              ▼ (Pilih 1)
                                                 [ Kirim 2 Foto Juknis ]
                                                 - Hal 38: Menu Pembaruan
                                                 - Hal 39: Proses Pembaruan
                                                          │
                                                          ▼
                                                 [ Kontak Live Agen Kominfo ]
```

### 17.2 Rincian Cabang Alur Menu 2
1. **Cabang Sudah Expired (`1`)**:
   - Bot menginformasikan bahwa sertifikat yang telah melewati masa kedaluwarsa **tidak dapat diperbarui**.
   - Bot mengirimkan 2 foto panduan Juknis:
     - `pembaruan_expired_01.png` → Juknis Halaman 40
     - `pembaruan_expired_02.png` → Juknis Halaman 41
   - Pengguna diarahkan menghubungi Live Agen untuk proses pengajuan sertifikat baru.
2. **Cabang Belum Expired (`2`)**:
   - Bot menginformasikan bahwa pembaruan hanya dapat dilakukan saat sertifikat berada pada periode **H-30 sebelum kedaluwarsa**.
   - Bot menanyakan konfirmasi apakah sertifikat sudah berada dalam periode H-30.
   - Jika pengguna memilih `1` (Ya, Sudah H-30):
     - Bot mengirimkan berkas `Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`.
     - Pengguna diarahkan mengisi formulir dan dapat memilih melihat panduan teknis (Ketik `1`).
     - Bot mengirimkan 2 foto panduan Juknis:
       - `pembaruan_belum_expired_01.png` → Juknis Halaman 38
       - `pembaruan_belum_expired_02.png` → Juknis Halaman 39
     - Bot memberikan pesan penutup dan kontak Live Agen untuk koordinasi dengan Verifikator Kominfo.

### 17.3 Pemetaan Aset Foto Menu 2
Folder: `images/pembaruan/`
- `pembaruan_belum_expired_01.png` → Juknis Halaman 38
- `pembaruan_belum_expired_02.png` → Juknis Halaman 39
- `pembaruan_expired_01.png` → Juknis Halaman 40
- `pembaruan_expired_02.png` → Juknis Halaman 41

### 17.4 Batasan Sistem Menu 2
- Chatbot **TIDAK DAPAT** memeriksa masa berlaku sertifikat secara otomatis.
- Chatbot **TIDAK TERHUBUNG** ke AMS dan tidak menghitung periode H-30 secara otomatis. Pengecekan masa berlaku dilakukan sendiri oleh pengguna pada aplikasi AMS atau melalui email pengingat dari BSrE.

---

## BAB 18 — Panduan Menu Reset Passphrase (Menu 3)

### 18.1 Konsep Alur
Menu 3 memandu pemohon yang lupa kata sandi (*passphrase*) sertifikat elektronik AMS. Pola alur Menu 3 mengikuti pola Menu 1:

```text
                  [ Pengguna Pilih 3 ]
                           │
                           ▼
          [ Penjelasan SOP Reset Passphrase ]
                           │
                           ▼
         [ Kirim Formulir Permohonan DOCX ]
     (Instruksi centang opsi: [X] Reset Passphrase)
                           │
                           ▼
               [ Pilihan Panduan Teknis ]
             1. Lihat Panduan   0. Menu Utama
                           │
                           ▼ (Input 1)
              [ Kirim 2 Foto Juknis ]
              - Hal 44: Reset Passphrase
              - Hal 45: Buat Passphrase Baru
                           │
                           ▼
        [ Ringkasan SOP & Kontak Live Agen ]
```

### 18.2 Rincian Tahapan Alur Menu 3
1. Pengguna mengetik `3` dari Menu Utama.
2. Bot menyajikan penjelasan mengenai ketentuan permohonan reset passphrase bagi pemohon yang lupa kata sandi sertifikat.
3. Bot langsung mengirimkan berkas resmi `Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`.
4. Bot menginstruksikan pengguna untuk mengisi formulir permohonan dan memberi tanda centang pada opsi: `[X] Reset Passphrase`, menandatanganinya, dan mengajukannya secara mandiri kepada pihak Kominfo / Verifikator / Live Agen.
5. Pengguna dapat memilih melihat panduan teknis pada aplikasi AMS (Ketik `1`).
6. Jika pengguna memilih `1`, bot mengirimkan tepat 2 foto Juknis resmi:
   - `reset_passphrase_01.png` → Juknis Halaman 44 (Permohonan Reset Passphrase)
   - `reset_passphrase_02.png` → Juknis Halaman 45 (Pembuatan Passphrase Baru)
7. Bot mengirimkan ringkasan SOP penutup dan kontak Live Agen Kominfo.

> [!CAUTION]
> **PENEGASAN PANDUAN JUKNIS HALAMAN 42–43:**
> Panduan pada Juknis AMS Halaman 42–43 merupakan prosedur **Ubah Passphrase** (bagi pengguna yang masih ingat passphrase lama dan ingin menggantinya di menu profil), **BUKAN** Reset Passphrase. Oleh karena itu, materi Halaman 42–43 **SECARA TEGAS TIDAK DISERTAKAN** pada Menu 3 demi mencegah kebingungan pemohon.

### 18.3 Batasan Keamanan Ketat Menu 3 (Zero Credential)
Untuk menjaga integritas hukum dan keamanan sertifikat elektronik:
- Chatbot **TIDAK PERNAH** meminta passphrase lama maupun passphrase baru.
- Chatbot **TIDAK PERNAH** meminta password email dinas, PIN, maupun OTP.
- Chatbot **TIDAK** memeriksa atau memvalidasi isi passphrase pemohon.
- Chatbot **TIDAK** melakukan eksekusi reset pada aplikasi/database AMS.
- Chatbot **TIDAK** menerima formulir yang telah diisi via chat.
- Chatbot **TIDAK** meneruskan berkas pemohon ke sistem AMS.
- Seluruh eksekusi reset dilakukan oleh Verifikator resmi Kominfo pada sistem AMS, dan tautan pembuatan passphrase baru dikirim langsung oleh sistem AMS ke Email Dinas pemohon.

---

## BAB 19 — Manajemen Sesi Percakapan

### 19.1 Arsitektur Penyimpanan Sesi In-Memory
Sistem mengelola sesi percakapan menggunakan struktur data JavaScript `Map` di dalam memori RAM server (`src/state/sessionState.js`).
- **Identifier**: WhatsApp JID unik pengguna (contoh: `6281234567890@s.whatsapp.net`).
- **Struktur Objek Sesi**:
  ```javascript
  {
    menu: 'MAIN',        // Menu aktif (MAIN, PENGAJUAN_ASK, PEMBARUAN_ASK, PASSPHRASE_GUIDE, LIVE_AGEN)
    step: 'FORM_SENT',   // Langkah spesifik di dalam menu
    lastActive: Date.now(), // Waktu interaksi terakhir
    data: {}             // Objek penampung data sementara
  }
  ```

### 19.2 Siklus Kedaluwarsa & Pembersihan Otomatis
- **State Timeout (30 Menit)**: Sesi percakapan dianggap kedaluwarsa (*idle*) setelah 30 menit (`1800000` ms) tanpa aktivitas dari pengguna.
- **Pembersihan Otomatis (10 Menit)**: Timer `setInterval` otomatis berjalan setiap 10 menit (`600000` ms) untuk menghapus sesi yang melewati batas waktu.
- **Perilaku Sesi Kedaluwarsa**: Ketika pengguna mengirim pesan setelah sesi kedaluwarsa:
  - Posisi state bot di-reset ke awal.
  - Bot mengirimkan pemberitahuan sopan bahwa sesi sebelumnya telah berakhir karena tidak ada aktivitas.
  - Bot menyajikan kembali Menu Utama.
  - **PENTING**: Kedaluwarsa sesi **TIDAK MENGHAPUS** riwayat pesan obrolan WhatsApp pengguna pada aplikasi ponsel mereka.

### 19.3 Navigasi Global Angka `0`
Pengguna dapat mengetik angka `0` dari alur mana pun. Tindakan ini mereset posisi menu bot ke `MAIN` dan menampilkan Menu Utama tanpa mengganggu riwayat percakapan.

---

## BAB 20 — Anti-Spam dan Processing Queue

### 20.1 Rate Limiter (`src/utils/rateLimiter.js`)
Mencegah potensi pemblokiran nomor bot oleh sistem WhatsApp akibat pengiriman pesan terlalu cepat:
- **Batas Maksimal**: **5 pesan dalam rentang waktu 30 detik** per pengguna.
- **Pesan ke-6**: Bot mengirimkan 1 kali peringatan: *"⚠️ Anda mengirim pesan terlalu cepat. Silakan tunggu sebentar sebelum melanjutkan."*
- **Pesan ke-7 dan seterusnya**: Ditahan secara hening (*silent discard*) hingga jendela waktu 30 detik berakhir.

### 20.2 Antrean Pemrosesan Pesan (`src/utils/processingManager.js`)
- Menerapkan antrean (*queue*) dengan jeda pemrosesan **1500 ms (1,5 detik)** untuk pesan beruntun dari pengguna yang sama.
- Hal ini mencegah benturan *race condition* pada state sesi pengguna saat mengetik pesan ganda dengan cepat.

### 20.3 Media Send Delay (`src/utils/sender.js`)
- Menerapkan jeda waktu **1000 ms (1 detik)** antar pengiriman gambar berurutan (misal: 8 gambar Menu 1, 2 gambar Menu 2/3).
- Memberikan waktu bagi perangkat ponsel penerima untuk mengunduh gambar secara teratur tanpa membebani memori (*buffer overflow*).

---

## BAB 21 — Testing dan Validasi

Proyek ini dilengkapi rangkaian pengujian unit dan integrasi otomatis yang tersentralisasi di dalam folder `tests/`:

### 21.1 Perintah Pengujian Mandiri
```bash
# 1. Menjalankan Master Test Suite Aktif (Direkomendasikan)
npm test

# Atau menjalankan langsung skrip pengujian per modul:
node tests/test-tahap2.js   # Uji Core Logic & Navigasi (21 skenario)
node tests/test-tahap3.js   # Uji Koneksi Baileys & Sesi (31 skenario)
node tests/test-tahap4.js   # Uji Menu Utama, Idle & Rate Limit (13 skenario)
node tests/test-tahap8.js   # Uji Master Komprehensif Seluruh Menu (95 skenario)
```

### 21.2 Hasil Verifikasi Baseline Sistem
Seluruh pengujian aktif mencatatkan hasil **100% LULUS (160 passed, 0 failed)**:
- `test-tahap2.js`: 21 passed / 0 failed
- `test-tahap3.js`: 31 passed / 0 failed
- `test-tahap4.js`: 13 passed / 0 failed
- `test-tahap8.js`: 95 passed / 0 failed
- **TOTAL ACTIVE TEST**: **160 PASSED / 0 FAILED** (Zero Defect).

*(Catatan: Jangan mencantumkan angka 170 sebagai total pengujian aktif karena angka 160 adalah hasil verifikasi deterministik dari 4 test suite permanen di atas).*

### 21.3 Dokumentasi Legacy Archive Test (`tests/test-tahap7.js`)
- Berkas `tests/test-tahap7.js` adalah **arsip historis** pengujian masa transisi Tahap 7 saat Menu 2 dan Menu 3 masih berstatus "(Segera Hadir)".
- Status historis mencatat **67 passed / 8 failed**. Kedelapan kegagalan tersebut terjadi karena assertion lama yang menuntut label standby pada Menu 2 & 3.
- Berkas ini **SENGAJA DIPERTAHANKAN** sebagai arsip jejak audit pengujian dan **TIDAK DIUBAH / DIHAPUS**.
- Skrip `npm test` secara resmi telah diarahkan untuk mengeksekusi suite aktif `tests/test-tahap8.js`.

---

## BAB 22 — Troubleshooting

### 22.1 Kode QR Tidak Tampil di Konsol Terminal
- Pastikan aplikasi dijalankan pada terminal interaktif (CMD, PowerShell, atau Terminal VSCode).
- Periksa folder `auth_info/`. Jika berkas sesi rusak atau tidak lengkap, hapus folder `auth_info/` lalu jalankan ulang bot.

### 22.2 Sambungan WhatsApp Sering Terputus (*Disconnect*)
- Pastikan ponsel nomor bot terhubung ke internet stabil (Wi-Fi disarankan).
- Pastikan pengaturan baterai aplikasi WhatsApp pada ponsel diatur ke *Unrestricted / Tidak Dibatasi* agar background socket tidak dimatikan oleh sistem operasi ponsel.

### 22.3 Bot Tidak Membalas Pesan Masuk
- Pastikan terminal menampilkan log: `✅ Bot terhubung ke WhatsApp!`.
- Pastikan pesan dikirim dari akun pribadi pengguna (bukan pesan grup WhatsApp).
- Pastikan pesan bukan berasal dari nomor bot itu sendiri (`fromMe` diabaikan).

### 22.4 Berkas Formulir DOCX Gagal Terkirim
- Pastikan berkas fisik `docs/Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx` ada dan tidak terhapus.
- Pastikan berkas tidak sedang dikunci atau dibuka oleh aplikasi lain seperti Microsoft Word pada server.

---

## BAB 23 — Keamanan dan Privasi Data

> [!CAUTION]
> **PERINGATAN KEAMANAN TINGGI:**
> 1. **Kerahasiaan Folder `auth_info/`**: Memuat token autentikasi sesi dan kunci kriptografi WhatsApp bot. Pihak yang memperoleh folder ini dapat mengambil alih nomor WhatsApp bot. Folder ini **DILARANG KERAS** diunggah ke Git atau dibagikan ke pihak ketiga.
> 2. **Perlindungan Data Pribadi Pengguna**: Chatbot tidak mencatat data pribadi sensitif ke dalam berkas log permanen. Sesi disimpan di RAM dan terhapus otomatis setelah 30 menit *idle*.
> 3. **Prinsip Zero Credential**: Jangan pernah memodifikasi handler untuk meminta data sensitif (passphrase/PIN/password/OTP) dari pengguna.

---

## BAB 24 — Backup dan Pemindahan Project

### 24.1 Klasifikasi Berkas untuk Pencadangan (Backup)
Saat membuat arsip cadangan proyek (ZIP / RAR), pastikan:
- **Wajib Dicadangkan**: Folder `src/`, `docs/`, `images/`, `tests/`, `scripts/`, `package.json`, `package-lock.json`, `README.md`, dan `.gitignore`.
- **Dilarang Dicadangkan**: Folder `node_modules/` (dapat diinstal ulang via `npm install`) dan folder `auth_info/` (bersifat rahasia).

### 24.2 Prosedur Pemindahan ke Komputer / Server Baru
1. Salin berkas arsip proyek ke komputer baru.
2. Ekstrak arsip tersebut.
3. Jalankan `npm install` untuk mengunduh modul dependensi.
4. Jalankan `npm test` untuk memverifikasi keutuhan logika sistem.
5. Jalankan `npm start` dan lakukan pemindaian Kode QR melalui WhatsApp nomor dinas.

---

## BAB 25 — Checklist Maintenance dan Prosedur Perubahan SOP

### 25.1 Lembar Ceklis Maintenance Mingguan (10 Langkah Rutin)
Setiap minggu, administrator sistem wajib melaksanakan 10 langkah pemeliharaan berikut:

1. **Jalankan Test Otomatis**:
   Buka terminal proyek dan jalankan: `npm test`.
2. **Verifikasi Output Test Suite**:
   Pastikan seluruh 95 skenario pada `test-tahap8.js` menghasilkan status **95 passed, 0 failed**.
3. **Lakukan Smoke Test WhatsApp Manual**:
   Kirim pesan dari smartphone penguji ke nomor bot:
   - Ketik pesan awal → Menu Utama muncul sempurna.
   - Pilih `1` (Pengajuan Baru) → Verifikasi alur email dinas.
   - Pilih `2` (Pembaharuan) → Verifikasi alur Expired dan Belum Expired.
   - Pilih `3` (Reset Passphrase) → Verifikasi alur form dan opsi panduan.
   - Pilih `4` (Live Agen) → Verifikasi daftar kontak verifikator.
   - Ketik `0` → Bot kembali ke Menu Utama secara mulus.
   - Kirim karakter sembarang → Bot memberikan respons penanganan invalid ramah.
4. **Cek Keberhasilan Pengiriman Dokumen & Media**:
   - Pastikan berkas formulir DOCX terkirim dan dapat dibuka.
   - Pastikan gambar Menu 1 (8 foto) terkirim bertahap dengan jelas.
   - Pastikan gambar Menu 2 (4 foto) dan Menu 3 (2 foto) terkirim utuh.
5. **Cek Stabilitas Koneksi WhatsApp**:
   Pastikan koneksi soket Baileys stabil dan tidak mengalami *reconnection loop*.
6. **Cek Log Terminal / Konsol Server**:
   Pastikan tidak ada galat fatal (*unhandledRejection* atau pesan error berulang).
7. **Periksa Konfigurasi Terpusat (`src/config.js`)**:
   - Pastikan nomor telepon dan tautan wa.me Pak Kris dan Pak Jaya masih aktif.
   - Pastikan teks jam operasional dinas sesuai.
   - Pastikan path berkas dokumen dan aset gambar valid.
8. **Audit Keutuhan Aset Fisik**:
   - Direktori `images/pengajuan/` (8 berkas gambar Juknis Hal 7–14).
   - Direktori `images/pembaruan/` (4 berkas gambar Juknis Hal 38–41).
   - Direktori `images/passphrase/` (2 berkas gambar Juknis Hal 44–45).
   - Direktori `docs/` (`Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`).
9. **Audit Keamanan & Kerahasiaan Direktori**:
   - Pastikan folder `auth_info/` tidak dibagikan dan tidak masuk ke repositori Git.
   - Pastikan berkas `.gitignore` tetap mencantumkan `auth_info/` dan `node_modules/`.
10. **Pencatatan Insiden (Log Pemeliharaan)**:
    Jika ditemukan kendala selama operasional mingguan, catat pada log pemeliharaan:
    - Tanggal Kejadian
    - Uraian Masalah
    - Penyebab Masalah
    - Tindakan Perbaikan yang Dilakukan
    - Hasil Akhir Evaluasi

> [!CAUTION]
> **Peringatan Operasional**: Jangan pernah menguji mekanisme rate limiter secara agresif (mengirim puluhan/ratusan pesan per detik) pada nomor WhatsApp produksi resmi, karena dapat memicu pemblokiran otomatis oleh WhatsApp/Meta.

### 25.2 Matriks Panduan Pembaruan SOP Resmi

Jika terdapat pembaruan regulasi atau instruksi resmi dari Dinas Kominfo Blora / BSrE, gunakan tabel panduan berikut untuk menentukan file yang harus disesuaikan:

| Kebutuhan Perubahan | Berkas yang Diubah | Fungsi / Bagian Terkait | Prosedur Pengujian |
| :--- | :--- | :--- | :--- |
| Perubahan Salam / Teks Menu Utama | `src/handler/menuUtama.js` | Konstanta `MENU_UTAMA_TEXT` | Jalankan `npm test` |
| Perubahan Kontak / Nama Live Agen | `src/config.js` | Array `config.liveAgents` | Jalankan `npm test` |
| Perubahan Jam Layanan Agen | `src/config.js` | Properti `operationalHours` | Jalankan `npm test` |
| Perubahan Template Formulir Word | `docs/` | Ganti file `Formulir_..._AMS.docx` | Uji alur Menu 1, 2, 3 |
| Perubahan Redaksi SOP Pengajuan | `src/handler/pengajuanBaru.js` | Fungsi `getTutorialCompleteText()` | Jalankan `npm test` |
| Perubahan Redaksi SOP Pembaruan | `src/handler/pembaruanExpired.js` | Fungsi `getPembaruanCompleteText()` | Jalankan `npm test` |
| Perubahan Redaksi SOP Passphrase | `src/handler/resetPassphrase.js` | Fungsi `getPassphraseCompleteText()` | Jalankan `npm test` |
| Pembaruan Foto Tutorial Menu 1 | `images/pengajuan/` | Timpa file `01_...png` s.d. `08_...png` | Jalankan `npm test` |
| Pembaruan Foto Tutorial Menu 2 | `images/pembaruan/` | Timpa 4 file `pembaruan_...png` | Jalankan `npm test` |
| Pembaruan Foto Tutorial Menu 3 | `images/passphrase/` | Timpa 2 file `reset_passphrase_...png` | Jalankan `npm test` |
| Penyesuaian Kuota Anti-Spam | `src/config.js` | Variabel `rateLimitMaxMessages` | Jalankan `node tests/test-tahap4.js` |

### 25.3 Prosedur Aman 7 Langkah Pembaruan Kode
1. **Lakukan Pencadangan**: Salin direktori proyek ke tempat penyimpanan aman sebelum melakukan modifikasi.
2. **Kaji Kode Terkait**: Telusuri alur berkas pengendali yang bersangkutan secara mendalam.
3. **Lakukan Perubahan Terisolasi**: Ubah hanya bagian teks atau parameter konfigurasi yang diperlukan.
4. **Jalankan Uji Otomatis**: Eksekusi perintah `npm test` di terminal dan pastikan 100% skenario lulus (*zero failure*).
5. **Jalankan Bot Lokal**: Aktifkan bot dalam mode `npm run dev` di lingkungan pengujian lokal.
6. **Lakukan Uji WhatsApp Nyata**: Kirim pesan langsung dari smartphone penguji untuk mencoba alur yang baru diubah.
7. **Dokumentasikan Perubahan**: Catat tanggal dan rincian perubahan yang telah disahkan oleh pihak berwenang pada log pemeliharaan.

---
*Buku Manual Teknis dan Operasional ini disusun secara komprehensif untuk memastikan keandalan, keberlanjutan, dan kemudahan pemeliharaan sistem Layanan Bantuan Tanda Tangan Elektronik AMS Dinas Kominfo Kabupaten Blora.*
