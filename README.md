# Chatbot WhatsApp Layanan Bantuan Tanda Tangan Elektronik AMS

Aplikasi chatbot WhatsApp berbasis menu interaktif (*rule-based*) untuk memandu pengguna dalam alur layanan **Aplikasi Manajemen Sertifikat (AMS)** pada layanan **Tanda Tangan Elektronik (TTE)**. Proyek ini dikembangkan dalam rangka kegiatan Praktik Kerja Lapangan (PKL) di **Dinas Komunikasi dan Informatika (Kominfo) Kabupaten Blora**.

> [!NOTE]
> Chatbot ini beroperasi secara terstruktur berbasis menu navigasi angka (bukan AI chatbot berbasis natural language bebas), sehingga setiap alur informasi dan panduan terjamin konsisten sesuai Petunjuk Teknis (Juknis) resmi.

---

## 1. Status Fitur Saat Ini

Saat ini chatbot beroperasi dengan status fitur sebagai berikut:

| Menu | Nama Fitur | Status | Keterangan |
| :---: | :--- | :---: | :--- |
| **1** | **Pengajuan Baru** | **AKTIF** | Pengecekan email dinas, pengiriman dokumen formulir DOCX, pengiriman 8 foto panduan aktivasi Juknis (hal. 7–14), ringkasan SOP 6 langkah, dan kontak Live Agen. |
| **2** | **Pembaharuan / Expired** | **STANDBY** | Menampilkan informasi alur standby dan opsi penghubung ke Live Agen. Implementasi SOP penuh masih menunggu penetapan teknis lanjutan. |
| **3** | **Reset Passphrase** | **STANDBY** | Menampilkan informasi alur standby dan opsi penghubung ke Live Agen. Implementasi SOP penuh masih menunggu penetapan teknis lanjutan. |
| **4** | **Live Agen** | **AKTIF** | Menampilkan daftar kontak petugas/verifikator resmi Dinas Kominfo Blora beserta jam layanan dan tautan chat langsung. |

---

## 2. Fitur Utama

- **Navigasi Berbasis Angka**: Interaksi sederhana menggunakan angka (`1`, `2`, `3`, `4`, dan `0` untuk kembali).
- **Pengecekan Email Dinas**: Memastikan pemohon memiliki email dinas resmi (`@blorakab.go.id`) sebelum melangkah ke proses aktivasi akun AMS.
- **Pengiriman Formulir DOCX Otomatis**: Bot langsung mengirimkan berkas formulir permohonan sertifikat elektronik berformat Microsoft Word (`.docx`).
- **Panduan Visual Berurutan**: Pengiriman 8 gambar tutorial aktivasi akun AMS yang diambil langsung dari Petunjuk Teknis resmi halaman 7 sampai 14.
- **Watermark & Caption Edukatif**: Seluruh gambar panduan dilengkapi label `[SIMULASI / DEMO]` pada caption penjelasnya.
- **Multi-Agent Live Support**: Pengaturan kontak verifikator fleksibel (multi-agent) terpusat dengan tautan chat WhatsApp otomatis.
- **In-Memory Session Management**: State percakapan dicatat per nomor pengirim (JID) tanpa membebani basis data eksternal.
- **Proteksi Anti-Spam (Rate Limiter)**: Pembatasan laju pesan untuk menjaga stabilitas sistem dan nomor WhatsApp bot.
- **Antrean Pemrosesan Pesan (Processing Queue)**: Mencegah kondisi balapan (*race condition*) antar pesan yang masuk bersamaan.
- **Pemulihan Sambungan Otomatis (Auto Reconnect)**: Menghubungkan ulang socket secara mandiri saat terjadi gangguan jaringan.
- **Autentikasi Multi-Device Baileys**: Mendukung login WhatsApp Web modern menggunakan scan kode QR terminal.

---

## 3. Alur Percakapan Bot

```text
               Pengguna WhatsApp
                       │
                       ▼
              [ Menu Utama Bot ]
                       │
   ┌──────────────┬────┴─────────────┬──────────────┐
   ▼              ▼                  ▼              ▼
[1. Pengajuan] [2. Pembaharuan]  [3. Passphrase] [4. Live Agen]
   │             (Standby)          (Standby)       │
   ├─ Cek Email                                     └─ Kontak Petugas
   │   ├─ Belum: Arahan Kominfo + Live Agen
   │   └─ Sudah:
   │       ├─ Kirim Formulir DOCX
   │       ├─ Pilihan Tutorial (Ketik 1)
   │       ├─ Kirim 8 Gambar Juknis Bertahap
   │       ├─ Kirim Ringkasan Alur SOP
   │       └─ Info Kontak Langsung Live Agen
   │
   └─ [0] Kembali ke Menu Utama
```

### Detail Alur Menu 1 (Pengajuan Baru)
1. Pengguna mengetik `1` dari Menu Utama.
2. Bot menanyakan kepemilikan Email Dinas (`1. Sudah punya`, `2. Belum punya`).
3. Jika memilih `2` (Belum): Bot memberikan petunjuk pengajuan email dinas ke Dinas Kominfo dan menampilkan kontak Live Agen.
4. Jika memilih `1` (Sudah): Bot mengirimkan berkas `Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx` dan menanyakan apakah ingin melihat tutorial aktivasi.
5. Pengguna mengetik `1` untuk memulai panduan aktivasi.
6. Bot mengirimkan 8 foto tutorial Juknis satu per satu dengan jeda pengiriman yang aman (1 detik per gambar).
7. Bot mengirimkan ringkasan alur SOP 6 langkah pengajuan baru.
8. Bot menyertakan daftar kontak Live Agen sebagai bantuan tambahan jika mengalami kendala.
9. Pengguna dapat mengetik `0` kapan saja untuk kembali ke Menu Utama.

### Detail Alur Menu 4 (Live Agen)
Menampilkan daftar seluruh agen verifikator yang aktif pada konfigurasi, nomor kontak, format tautan langsung (`https://wa.me/...`), dan jam operasional dinas.

---

## 4. Struktur Direktori Proyek

```text
chatbot-main/
├── .agents/                                                    # Tooling pendukung agent AI (TETAP DI ROOT)
├── auth_info/                                                  # Sesi kredensial WhatsApp Baileys (RAHASIA)
├── docs/                                                       # Dokumen formulir dan pedoman resmi
│   ├── juknis/                                                 # Buku Petunjuk Teknis resmi AMS
│   │   └── PETUNJUK-TEKNIS-PENGGUNAAN-APLIKASI-MANAJEMEN-...pdf
│   └── Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx      # Berkas formulir aktif yang dikirim bot
├── images/                                                     # Aset visual dan tangkapan layar panduan
│   ├── cover/                                                  # Gambar sampul menu
│   ├── passphrase/                                             # Aset standby menu reset passphrase
│   ├── pembaruan/                                              # Aset standby menu pembaharuan
│   └── pengajuan/                                              # 8 foto tutorial Juknis halaman 7–14
├── node_modules/                                               # Paket dependensi proyek (hasil npm install)
├── scripts/                                                    # Skrip utilitas mandiri
│   ├── generate-dummy-images.js                                # Generator gambar placeholder lokal
│   └── generate-form-docx.js                                   # Skrip pembuat formulir DOCX
├── src/                                                        # Kode sumber aplikasi utama
│   ├── handler/                                                # Logika alur percakapan per menu
│   │   ├── liveAgen.js                                         # Handler Menu 4 (Live Agen)
│   │   ├── menuUtama.js                                        # Handler pesan pembuka & Menu Utama
│   │   ├── messageHandler.js                                   # Router sentral pesan masuk
│   │   ├── pembaruanExpired.js                                 # Handler Menu 2 (Standby)
│   │   ├── pengajuanBaru.js                                    # Handler Menu 1 (Pengajuan Baru & Juknis)
│   │   └── resetPassphrase.js                                  # Handler Menu 3 (Standby)
│   ├── state/                                                  # Pengelolaan sesi pengguna
│   │   └── sessionState.js                                     # Manajemen state dan auto cleanup sesi
│   ├── utils/                                                  # Modul utilitas sistem
│   │   ├── processingManager.js                                # Antrean delay pemrosesan pesan masuk
│   │   ├── rateLimiter.js                                      # Pembatas frekuensi pesan (anti-spam)
│   │   └── sender.js                                           # Fungsi pengirim teks, media & dokumen
│   ├── app.js                                                  # Entry point aplikasi bot
│   ├── config.js                                               # File konfigurasi terpusat
│   └── connection.js                                           # Manajemen koneksi socket WhatsApp (Baileys)
├── tests/                                                      # Berkas pengujian otomatis (Test Suite)
│   ├── test-tahap2.js                                          # Pengujian Core Logic & Navigasi
│   ├── test-tahap3.js                                          # Pengujian Koneksi Baileys & Handler
│   ├── test-tahap4.js                                          # Pengujian Menu, Session & Rate Limiting
│   └── test-tahap7.js                                          # Pengujian Master Menu 1 & Multi-Agent
├── .gitignore                                                  # Pengecualian berkas Git
├── package.json                                                # Metadata proyek dan daftar dependensi
├── package-lock.json                                           # Catatan versi dependensi terkunci
└── README.md                                                   # Dokumentasi utama proyek
```

> [!IMPORTANT]
> - Folder `.agents/` merupakan folder konfigurasi *tooling* lingkungan pengembangan. **Bukan bagian dari kode sumber runtime chatbot**.
> - Folder `auth_info/` berisi token autentikasi sesi WhatsApp yang bersifat **SANGAT RAHASIA**.
> - Folder `node_modules/` memuat pustaka eksternal hasil instalasi npm dan tidak perlu dipindahkan atau diubah secara manual.

---

## 5. Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan pustaka JavaScript berbasis Node.js:

- **Node.js**: Lingkungan eksekusi (*runtime environment*) JavaScript asynchronous sisi server.
- **@whiskeysockets/baileys** (`^7.0.0-rc14`): Pustaka soket multi-device untuk berkomunikasi langsung dengan protokol WhatsApp Web.
  *(Catatan: Proyek ini menggunakan Baileys melalui koneksi soket Web WhatsApp, bukan WhatsApp Business API resmi Meta).*
- **pino** (`^10.3.1`): Logger berkecepatan tinggi yang digunakan Baileys untuk mencatat aktivitas sistem.
- **qrcode-terminal** (`^0.12.0`): Menampilkan kode QR autentikasi langsung pada jendela terminal / command prompt.
- **docx** (`^9.7.1`): Pustaka untuk membuat dan menyusun struktur berkas dokumen Word (.docx) secara programatik.
- **sharp** (`^0.35.4`): Pustaka pengolahan citra (*image processing*) berkinerja tinggi untuk memproses aset visual.
- **nodemon** (`^3.1.14`): Perkakas pengembang untuk me-restart aplikasi secara otomatis saat berkas kode sumber diubah.

---

## 6. Persyaratan Sistem & Instalasi

### Persyaratan:
- Komputer / Server dengan OS Windows, Linux, atau macOS.
- **Node.js** versi 18.x atau versi LTS yang lebih baru.
- Koneksi internet yang stabil untuk soket WhatsApp.

### Langkah Instalasi:
1. Buka terminal atau Command Prompt pada direktori proyek `chatbot-main/`.
2. Pasang seluruh dependensi dengan menjalankan:
   ```bash
   npm install
   ```
3. Seluruh paket dependensi akan dipasang ke dalam folder `node_modules/`.

---

## 7. Cara Menjalankan Bot

### Mode Produksi / Standar:
Jalankan perintah berikut:
```bash
npm start
```
*(Perintah ini mengeksekusi script `node src/app.js`)*.

### Mode Pengembangan (Development):
Jalankan perintah berikut:
```bash
npm run dev
```
*(Perintah ini mengeksekusi `nodemon src/app.js` yang akan me-reload bot otomatis setiap ada perubahan file)*.

---

## 8. Prosedur Login WhatsApp Pertama Kali

1. Jalankan aplikasi menggunakan `npm start` atau `npm run dev`.
2. Jika belum memiliki sesi aktif di folder `auth_info/`, terminal akan mencetak **Kode QR (QR Code)**.
3. Buka aplikasi **WhatsApp** pada smartphone yang difungsikan sebagai nomor bot.
4. Buka menu **Pengaturan (Settings)** atau ikon titik tiga di sudut kanan atas.
5. Pilih menu **Perangkat Tertaut (Linked Devices)**.
6. Tekan tombol **Tautkan Perangkat (Link a Device)**.
7. Arahkan kamera smartphone ke Kode QR di terminal hingga terpindai.
8. Tunggu beberapa detik hingga terminal menampilkan pesan konfirmasi:
   ```text
   Bot terhubung ke WhatsApp!
   Siap menerima pesan...
   ```
9. Seluruh data sesi masuk akan disimpan secara otomatis di dalam folder `auth_info/`. Pada booting berikutnya, bot tidak akan meminta scan QR ulang selama sesi masih berlaku.

---

## 9. Prosedur Mengganti Nomor / Akun WhatsApp Bot

Jika nomor bot ingin dialihkan ke nomor WhatsApp yang baru:

1. Hentikan jalannya bot dengan menekan kombinasi tombol `Ctrl + C` pada terminal.
2. Pastikan proses bot telah berhenti sepenuhnya.
3. Hapus seluruh isi di dalam folder `auth_info/` (atau hapus foldernya).
4. Jalankan kembali aplikasi:
   ```bash
   npm start
   ```
5. Terminal akan membuat folder `auth_info/` baru dan merender Kode QR baru.
6. Lakukan pemindaian QR menggunakan nomor WhatsApp yang baru melalui menu **Perangkat Tertaut**.
7. Tunggu hingga bot terhubung kembali.

---

## 10. Konfigurasi Sistem (`src/config.js`)

Seluruh pengaturan sistem dikontrol secara sentral melalui file [`src/config.js`](src/config.js). Nilai-nilai konfigurasi aktual yang diterapkan meliputi:

| Variabel Konfigurasi | Nilai Aktual | Keterangan Fungsi |
| :--- | :--- | :--- |
| `botName` | `'Layanan Bantuan Tanda Tangan Elektronik AMS'` | Nama identitas resmi bot pada salam pembuka. |
| `liveAgents` | Array multi-agent | Daftar nama, nomor telepon, label, dan link WhatsApp agen. |
| `operationalHours` | `'Senin - Jumat, 08:00 - 16:00 WIB'` | Jam operasional pelayanan verifikator. |
| `sendDelay` | `1000` ms (1 detik) | Jeda waktu pengiriman antar gambar tutorial. |
| `rateLimitMaxMessages`| `5` pesan | Batas maksimal pesan yang dikirim sebelum peringatan anti-spam. |
| `rateLimitWindow` | `30000` ms (30 detik) | Jendela waktu pemantauan batas frekuensi pesan. |
| `processingDelay` | `1500` ms (1,5 detik) | Delay pemrosesan antrean per-pengguna untuk mencegah tabrakan pesan. |
| `stateTimeout` | `1800000` ms (30 menit) | Batas waktu idle percakapan sebelum sesi di-reset. |
| `cleanupInterval` | `600000` ms (10 menit) | Interval berkala pembersihan memori dari sesi kedaluwarsa. |
| `docPaths` | Path formulir DOCX | Lokasi berkas `Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`. |
| `imagePaths` & `imageFiles`| Objek mapping gambar | Lokasi folder dan penamaan 8 foto tutorial Juknis. |
| `imageCaptions` | Array caption | Teks penjelas pada setiap gambar berlabel `[SIMULASI / DEMO]`. |

---

## 11. Pengaturan Live Agen (Multi-Agent)

Kontak petugas verifikator dikonfigurasi melalui properti array `liveAgents` di dalam `src/config.js`:

```javascript
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
]
```

- **Skalabilitas**: Jika di masa mendatang terdapat penambahan petugas (misalnya Agen 3), cukup tambahkan satu objek agen baru ke dalam array `liveAgents`.
- Seluruh tampilan kontak pada Menu 1, Menu 2, Menu 3, maupun Menu 4 akan ter-update secara otomatis tanpa perlu mengubah kode handler.
- Jam operasional resmi agen: **Senin - Jumat, 08:00 - 16:00 WIB**.

---

## 12. Panduan Pembaruan SOP & Teks Pesan

Jika terdapat pembaruan regulasi atau redaksi SOP resmi dari Dinas Kominfo Blora / Balai Sertifikasi Elektronik (BSrE), perbarui file handler terkait:

- **Teks Sambutan & Menu Utama**: Diatur pada [`src/handler/menuUtama.js`](src/handler/menuUtama.js).
- **Alur & Redaksi Menu 1**: Diatur pada [`src/handler/pengajuanBaru.js`](src/handler/pengajuanBaru.js) (fungsi `getTutorialCompleteText` untuk ringkasan 6 langkah alur SOP).
- **Alur & Kontak Menu 4**: Diatur pada [`src/handler/liveAgen.js`](src/handler/liveAgen.js).
- **Routing Input Pesan**: Diatur pada [`src/handler/messageHandler.js`](src/handler/messageHandler.js).
- **Menu Standby (Menu 2 & 3)**: Diatur pada [`src/handler/pembaruanExpired.js`](src/handler/pembaruanExpired.js) dan [`src/handler/resetPassphrase.js`](src/handler/resetPassphrase.js).

> [!CAUTION]
> Jangan mengubah substansi alur SOP berdasarkan asumsi pribadi. Pastikan setiap perubahan teks mengacu pada surat edaran, juknis, atau instruksi resmi verifikator Kominfo Blora.

---

## 13. Panduan Penggantian Gambar Tutorial

Aset gambar tutorial aktivasi tersimpan pada folder:
```text
images/pengajuan/
```
Terdapat 8 gambar tutorial yang memetakan langkah pada **Juknis AMS halaman 7 s.d. 14**:
1. `01_registrasi_pengguna.png` — Juknis Hal. 7 (Registrasi Pengguna)
2. `02_aktivasi_akun.png` — Juknis Hal. 8 (Aktivasi Akun)
3. `03_lengkapi_data_diri.png` — Juknis Hal. 9 (Lengkapi Data Diri)
4. `04_verifikasi_whatsapp.png` — Juknis Hal. 10 (Verifikasi WhatsApp)
5. `05_data_kedinasan.png` — Juknis Hal. 11 (Data Kedinasan)
6. `06_lengkapi_data.png` — Juknis Hal. 12 (Lengkapi Data)
7. `07_verifikasi_data.png` — Juknis Hal. 13 (Verifikasi Data)
8. `08_persetujuan_submit.png` — Juknis Hal. 14 (Persetujuan dan Submit)

Jika ingin mengganti tangkapan layar dengan resolusi baru:
- Gunakan nama dan format file yang sesuai (`.png` atau `.jpg`).
- Pastikan gambar terbaca dengan jelas pada layar smartphone.
- Pastikan seluruh caption edukatif tetap menyertakan tag `[SIMULASI / DEMO]`.
- Jika nama atau format berkas berubah, sesuaikan pemetaannya pada properti `imageFiles.pengajuan` di `src/config.js`.

---

## 14. Pembaruan Formulir Permohonan DOCX

- Berkas formulir permohonan tersimpan pada:
  ```text
  docs/Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx
  ```
- File ini dikirim secara otomatis oleh bot melalui metode `sendDocument` Baileys saat pengguna mengonfirmasi telah memiliki email dinas pada alur Menu 1.
- Jika ada pembaruan format surat permohonan dari dinas:
  - Ganti file fisik tersebut dengan tetap mempertahankan nama file yang sama.
  - Pastikan berkas berformat `.docx` yang valid dan dapat dibuka sempurna menggunakan Microsoft Word maupun WPS Office.
  - Jika nama file diubah, perbarui path referensi pada `config.docPaths.formulirPermohonan` di `src/config.js`.

---

## 15. Pengujian Otomatis (Testing)

Proyek ini dilengkapi rangkaian pengujian unit dan integrasi otomatis yang tersentralisasi di dalam folder `tests/`.

### Perintah Pengujian:
```bash
# 1. Uji Core Logic & Navigasi State (21 Skenario)
node tests/test-tahap2.js

# 2. Uji Koneksi Baileys & Handler Pesan (31 Skenario)
node tests/test-tahap3.js

# 3. Uji Menu Utama, Sesi Idle & Rate Limiter (13 Skenario)
node tests/test-tahap4.js

# 4. Uji Master Komprehensif Menu 1, Juknis & Multi-Agent (75 Skenario)
node tests/test-tahap7.js

# 5. Uji Cepat melalui NPM Script (Menjalankan tests/test-tahap7.js)
npm test
```

### Hasil Verifikasi Terakhir:
Seluruh pengujian mencatatkan hasil **100% LULUS (140 passed, 0 failed)**:
- `test-tahap2.js`: 21 passed, 0 failed
- `test-tahap3.js`: 31 passed, 0 failed
- `test-tahap4.js`: 13 passed, 0 failed
- `test-tahap7.js`: 75 passed, 0 failed

*(Catatan: Perintah `npm test` menjalankan master test `tests/test-tahap7.js` yang memverifikasi 75 skenario regresi alur Menu 1 dan Multi-Agent)*.

---

## 16. Manajemen Sesi Percakapan (Session Management)

- **Penyimpanan Sesi**: Sesi disimpan secara *in-memory* (RAM) berbasis JID (nomor WhatsApp) masing-masing pengguna melalui modul `src/state/sessionState.js`. Sesi bersifat sementara dan tidak disimpan permanen di database.
- **Waktu Kedaluwarsa (State Timeout)**: 30 menit (`1800000` ms). Jika pengguna tidak mengirim pesan selama 30 menit, status sesi akan otomatis di-reset.
- **Pembersihan Rutin (Auto Cleanup)**: Sistem menjalankan timer berkala setiap 10 menit (`600000` ms) untuk membersihkan sesi yang telah melewati batas timeout.
- **Reset Navigasi**: Pengguna dapat mengetik angka `0` kapan saja dari submenu untuk kembali ke Menu Utama tanpa menghapus riwayat chat.

---

## 17. Mekanisme Rate Limiter & Processing Queue

Untuk menjaga keandalan bot dan nomor WhatsApp dari risiko spam atau pemblokiran:

1. **Anti-Spam Rate Limiter (`src/utils/rateLimiter.js`)**:
   - Membatasi maksimal **5 pesan dalam jendela waktu 30 detik** per pengguna.
   - Pesan ke-6 akan memicu 1x pesan peringatan ramah, dan pesan spam berikutnya pada jendela waktu yang sama akan ditahan secara hening tanpa membanjiri chat.
2. **Processing Queue (`src/utils/processingManager.js`)**:
   - Menerapkan antrean antarpengguna dengan jeda **1,5 detik (1500 ms)** sebelum memproses pesan baru dari pengirim yang sama. Hal ini memastikan pesan diproses teratur dan mencegah benturan state percakapan.
3. **Send Delay (`src/utils/sender.js`)**:
   - Memberikan jeda **1 detik (1000 ms)** saat bot mengirimkan beberapa berkas media/gambar secara berurutan, sehingga seluruh gambar diterima berurutan dan tidak membebani memori perangkat penerima.

---

## 18. Panduan Mengatasi Masalah (Troubleshooting)

### Kode QR Tidak Muncul di Terminal
- Pastikan bot dijalankan melalui terminal interaktif (`npm start` atau `npm run dev`).
- Periksa folder `auth_info/`. Jika file sesi sebelumnya rusak atau tidak lengkap, hapus folder `auth_info/` lalu jalankan ulang bot.

### Bot Tidak Merespons Pesan Masuk
- Periksa terminal untuk memastikan status koneksi adalah `Bot terhubung ke WhatsApp!`.
- Pastikan ponsel nomor bot tetap memiliki koneksi internet aktif.
- Pastikan pesan tidak dikirim dari nomor bot itu sendiri (pesan `fromMe` diabaikan).
- Pastikan pesan dikirim melalui chat pribadi (personal chat), bukan pesan grup WhatsApp.

### Gambar Tutorial Tidak Terkirim
- Pastikan 8 berkas gambar tersedia di direktori `images/pengajuan/`.
- Periksa kesesuaian nama berkas fisik dengan daftar nama file pada properti `imageFiles.pengajuan` di `src/config.js`.

### Berkas DOCX Formulir Gagal Terkirim
- Pastikan berkas `docs/Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx` tersedia secara fisik di folder `docs/`.
- Pastikan berkas tidak sedang dibuka atau dikunci oleh aplikasi lain (seperti Microsoft Word).

---

## 19. Keamanan & Kerahasiaan Data (Security)

> [!CAUTION]
> **PERINGATAN KEAMANAN TINGGI:**
> - **Folder `auth_info/` memuat token sesi dan kunci kriptografi WhatsApp bot**. Siapa pun yang memperoleh salinan folder ini dapat menggunakan nomor WhatsApp bot tanpa izin.
> - **JANGAN PERNAH** mengunggah folder `auth_info/` ke repositori Git (folder ini telah didaftarkan dalam `.gitignore`).
> - **JANGAN PERNAH** membagikan tangkapan layar terminal yang memuat Kode QR login aktif kepada pihak lain.
> - **JANGAN PERNAH** menyertakan folder `auth_info/` atau `node_modules/` saat membuat arsip ZIP/RAR proyek untuk dibagikan.

---

## 20. Catatan Pengembangan & Pemeliharaan

- **Menu 2 dan Menu 3**: Saat ini berstatus *standby*. Jika SOP pembaharuan sertifikat dan reset passphrase sudah disahkan oleh pihak berwenang, alur logika dapat diimplementasikan pada `src/handler/pembaruanExpired.js` dan `src/handler/resetPassphrase.js`.
- **Integritas Pengujian**: Selalu jalankan `npm test` setelah melakukan modifikasi pada kode handler maupun konfigurasi untuk memastikan tidak ada alur yang mengalami kerusakan (*regression*).
- **Pengembangan Bertahap**: Lakukan pengujian pada lingkungan lokal sebelum memublikasikan pembaruan ke nomor WhatsApp layanan publik resmi.

---
*Dokumentasi ini disusun untuk pemeliharaan dan keberlanjutan sistem Layanan Bantuan Tanda Tangan Elektronik AMS Dinas Kominfo Kabupaten Blora.*
