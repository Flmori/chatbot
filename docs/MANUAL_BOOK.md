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
16. [BAB 16 — Pengelolaan Foto Tutorial Juknis](#bab-16--pengelolaan-foto-tutorial-juknis)
17. [BAB 17 — Status Menu Pembaharuan / Expired (Menu 2)](#bab-17--status-menu-pembaharuan--expired-menu-2)
18. [BAB 18 — Status Menu Reset Passphrase (Menu 3)](#bab-18--status-menu-reset-passphrase-menu-3)
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
Aplikasi Chatbot WhatsApp Layanan Bantuan Tanda Tangan Elektronik AMS dikembangkan dalam rangka kegiatan Praktik Kerja Lapangan (PKL) di **Dinas Komunikasi dan Informatika (Kominfo) Kabupaten Blora**. Sistem ini dirancang untuk mempermudah Aparatur Sipil Negara (ASN) dan pengguna layanan di lingkungan Pemerintah Kabupaten Blora dalam memahami alur permohonan sertifikat elektronik, aktivasi akun pada Aplikasi Manajemen Sertifikat (AMS), serta mempermudah komunikasi dengan petugas verifikator (Live Agen).

### 1.2 Tujuan Manual Book
Buku manual ini disusun sebagai referensi resmi bagi:
- **Operator Layanan**: Petunjuk operasional harian, prosedur login, penanganan kendala koneksi WhatsApp, dan penggantian akun.
- **Pengembang (Developer) Berikutnya**: Penjelasan arsitektur kode sumber, modul handler, manajemen state, cara mengubah konfigurasi, prosedur pembaruan teks SOP, dan pelaksanaan uji regresi otomatis.
- **Pembimbing PKL & Tim Teknis Kominfo**: Dokumentasi kepatuhan alur sistem terhadap Petunjuk Teknis (Juknis) resmi Balai Sertifikasi Elektronik (BSrE) / Kominfo.

### 1.3 Batasan Sistem
Chatbot ini dirancang secara terstruktur berbasis menu dan angka navigasi (*rule-based / menu-driven*).

> [!NOTE]
> Chatbot ini **BUKAN** chatbot berbasis Artificial Intelligence (AI) atau pemrosesan bahasa alami bebas (*Natural Language Processing*). Interaksi dilakukan melalui input angka navigasi pasti (misalnya `1`, `2`, `3`, `4`, dan `0`) untuk menjamin konsistensi materi informasi hukum dan tata kelola SOP persuratan resmi.

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
                       │
                       ▼
          [ Antrean Processing Queue ]
                       │
                       ▼
            [ Router: messageHandler ]
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
 [ Menu Utama ]  [ Menu 1: Form  ] [ Menu 4: ]
                 [ & Panduan AMS ] [ Live Agen ]
```

### 2.2 Komponen Interaksi Pengguna
1. **Pengguna WhatsApp**: Mengirimkan sapaan teks awal untuk membuka Menu Utama atau mengirimkan angka menu pilihan.
2. **Klien Baileys**: Menjaga koneksi soket jaringan dengan server WhatsApp dan meneruskan pesan masuk ke aplikasi.
3. **Penyaring & Antrean**: Memeriksa laju pengiriman pesan (anti-spam) dan mengantrekan proses secara berurutan (*FIFO*).
4. **Modul Pengendali (Handler)**: Memproses logika percakapan sesuai langkah yang sedang aktif pada pengguna.
5. **Penyaji Respon (Sender)**: Mengirimkan kembali balasan berupa pesan teks, dokumen berkas Microsoft Word (.docx), atau rangkaian gambar panduan beresolusi jelas.

---

## BAB 3 — Fitur dan Status Fitur

Sistem membedakan fitur aktif yang telah siap digunakan secara operasional dengan fitur berstatus *standby* yang disiapkan untuk tahap implementasi berikutnya:

| No | Nama Fitur | Status Sistem | Deskripsi Operasional |
| :---: | :--- | :---: | :--- |
| **1** | **Menu 1 — Pengajuan Baru** | **AKTIF** | Alur lengkap verifikasi email dinas, pengiriman otomatis dokumen formulir permohonan (.docx), pengiriman 8 foto panduan aktivasi Juknis berurutan (halaman 7–14), pesan ringkasan SOP 6 langkah resmi, dan kontak Live Agen. |
| **2** | **Menu 2 — Pembaharuan / Expired** | **STANDBY / SEGERA HADIR** | Menampilkan informasi alur standby dan opsi penghubung ke Live Agen. Implementasi SOP penuh menunggu penetapan regulasi teknis lanjutan. |
| **3** | **Menu 3 — Reset Passphrase** | **STANDBY / SEGERA HADIR** | Menampilkan informasi alur standby dan opsi penghubung ke Live Agen. Implementasi SOP penuh menunggu penetapan regulasi teknis lanjutan. |
| **4** | **Menu 4 — Live Agen** | **AKTIF** | Menampilkan daftar kontak petugas verifikator resmi Dinas Kominfo Blora (Pak Kris & Pak Jaya) beserta jam kerja dan tautan chat langsung. |

> [!IMPORTANT]
> Menu 2 dan Menu 3 saat ini berstatus **STANDBY**. Jangan menganggap kedua alur tersebut sudah selesai secara penuh. File handler terkait tersedia sebagai kerangka kerja awal untuk pengembangan lanjutan setelah SOP disahkan.

---

## BAB 4 — Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan ekosistem Node.js dengan pustaka resmi yang terdaftar pada berkas `package.json`:

- **Node.js**: Lingkungan eksekusi (*runtime environment*) JavaScript asynchronous sisi server.
- **@whiskeysockets/baileys (`^7.0.0-rc14`)**: Pustaka klien soket WebSocket multi-device untuk berkomunikasi langsung dengan protokol WhatsApp Web.
  *(Pernyataan Faktual: Proyek ini menggunakan Baileys melalui koneksi Web Socket WhatsApp multi-device dan BUKAN WhatsApp Business Platform / Cloud API resmi berbayar dari Meta).*
- **pino (`^10.3.1`)**: Pustaka logging performa tinggi yang digunakan internal oleh Baileys.
- **qrcode-terminal (`^0.12.0`)**: Penampil visual kode QR autentikasi langsung pada antarmuka terminal/konsol.
- **docx (`^9.7.1`)**: Pustaka untuk menyusun dan membuat struktur dokumen Microsoft Word (.docx) secara programatik.
- **sharp (`^0.35.4`)**: Pustaka manipulasi citra berkecepatan tinggi.
- **nodemon (`^3.1.14`)**: Perkakas pengembangan untuk melakukan *auto-reload* aplikasi secara otomatis saat file kode sumber disimpan.

---

## BAB 5 — Struktur Folder Project

Struktur direktori proyek pasca-penataan folder adalah sebagai berikut:

```text
chatbot-main/
├── .agents/                                                    # Tooling pendukung agent AI (WAJIB TETAP DI ROOT)
├── auth_info/                                                  # Sesi kredensial WhatsApp Baileys (SANGAT RAHASIA)
├── docs/                                                       # Folder dokumentasi dan dokumen resmi
│   ├── juknis/                                                 # Subfolder berkas Petunjuk Teknis resmi
│   │   └── PETUNJUK-TEKNIS-PENGGUNAAN-APLIKASI-MANAJEMEN-...pdf# Berkas panduan asli AMS (19.642.990 bytes)
│   ├── Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx      # Template formulir DOCX aktif (9.187 bytes)
│   └── MANUAL_BOOK.md                                          # Buku manual teknis dan operasional
├── images/                                                     # Aset visual panduan
│   ├── cover/                                                  # Gambar cover menu
│   ├── passphrase/                                             # Aset standby menu reset passphrase
│   ├── pembaruan/                                              # Aset standby menu pembaruan
│   └── pengajuan/                                              # 8 foto tutorial Juknis halaman 7–14 (.png)
├── node_modules/                                               # Dependensi pustaka hasil npm install
├── scripts/                                                    # Skrip utilitas mandiri
│   ├── generate-dummy-images.js                                # Generator gambar placeholder
│   └── generate-form-docx.js                                   # Skrip pembuat formulir DOCX permohonan
├── src/                                                        # Kode sumber aplikasi utama
│   ├── handler/                                                # Modul penangan percakapan per menu
│   │   ├── liveAgen.js                                         # Handler Menu 4 (Live Agen)
│   │   ├── menuUtama.js                                        # Handler Menu Utama & salam pembuka
│   │   ├── messageHandler.js                                   # Router sentral pesan masuk
│   │   ├── pembaruanExpired.js                                 # Handler Menu 2 (Standby)
│   │   ├── pengajuanBaru.js                                    # Handler Menu 1 (Pengajuan Baru & Juknis)
│   │   └── resetPassphrase.js                                  # Handler Menu 3 (Standby)
│   ├── state/                                                  # Pengelolaan sesi pengguna
│   │   └── sessionState.js                                     # Manajemen state in-memory & auto-cleanup
│   ├── utils/                                                  # Modul utilitas sistem
│   │   ├── processingManager.js                                # Antrean delay pemrosesan pesan masuk
│   │   ├── rateLimiter.js                                      # Pembatas laju pesan anti-spam
│   │   └── sender.js                                           # Helper pengiriman teks, gambar, & dokumen
│   ├── app.js                                                  # Entry point aplikasi bot
│   ├── config.js                                               # File konfigurasi sentral
│   └── connection.js                                           # Manajemen koneksi Baileys & pairing QR
├── tests/                                                      # Kumpulan berkas pengujian otomatis
│   ├── test-tahap2.js                                          # Uji Core Logic (21 skenario)
│   ├── test-tahap3.js                                          # Uji Koneksi WA & Auth (31 skenario)
│   ├── test-tahap4.js                                          # Uji Menu, Sesi & Rate Limit (13 skenario)
│   └── test-tahap7.js                                          # Master Test Menu 1 & Live Agen (75 skenario)
├── .gitignore                                                  # Pengecualian Git (auth_info, node_modules, dll.)
├── package.json                                                # Konfigurasi dependensi dan script npm
├── package-lock.json                                           # Kunci versi dependensi npm
└── README.md                                                   # Ringkasan cepat proyek
```

> [!CAUTION]
> **ATURAN FOLDER KHUSUS:**
> 1. Folder `.agents/`: Merupakan folder *tooling* lingkungan pengembangan Everything Cloud Code. Folder ini **HARUS TETAP BERADA DI ROOT**, tidak boleh dihapus, dan tidak boleh dipindahkan.
> 2. Folder `auth_info/`: Berisi kunci kriptografi dan token sesi login WhatsApp Baileys. Bersifat **SANGAT RAHASIA**, tidak boleh dibagikan, dan tidak boleh dimasukkan ke dalam arsip Git maupun file ZIP publik.
> 3. Folder `node_modules/`: Direktori paket dependensi yang dibuat secara otomatis oleh `npm install`.

---

## BAB 6 — Penjelasan File Utama

### 6.1 Berkas Entry Point & Koneksi
- **`src/app.js`**: Titik masuk (*entry point*) aplikasi. Menginisiasi bot melalui pemanggilan `startBot()`, menangani sinyal pematian (*graceful shutdown*) sistem (`SIGINT`, `SIGTERM`), serta mencegah aplikasi crash mendadak melalui penanganan `uncaughtException` dan `unhandledRejection`.
- **`src/connection.js`**: Menangani soket WhatsApp Baileys, memuat dan menyimpan kredensial multi-file pada `auth_info/`, merender kode QR pada konsol, mengontrol *auto-reconnect* hingga 5 kali percobaan, dan meneruskan pesan baru (`messages.upsert`) ke `messageHandler`.

### 6.2 Berkas Pengendali Alur Percakapan (Handler)
- **`src/handler/messageHandler.js`**: Router sentral untuk setiap pesan masuk. Menyaring pesan dari diri sendiri (`fromMe`), pesan grup, dan pesan non-teks. Mengarahkan pesan ke rate limiter, antrean pemrosesan, pengecekan sesi expired, penanganan navigasi `0`, serta distribusi ke sub-handler menu.
- **`src/handler/menuUtama.js`**: Menyajikan teks sapaan dan daftar 4 menu utama (`MENU_UTAMA_TEXT`). Mengarahkan input angka `1` ke alur pengajuan baru, angka `4` ke kontak Live Agen, serta angka `2` dan `3` ke teks standby (`STANDBY_TEXT`).
- **`src/handler/pengajuanBaru.js`**: Menangani alur Menu 1 secara mendalam: menanyakan kepemilikan email dinas, mengirim formulir DOCX, mengirim 8 foto tutorial Juknis bertahap, dan mengirim pesan ringkasan SOP 6 langkah resmi beserta kontak Live Agen.
- **`src/handler/liveAgen.js`**: Menghasilkan teks daftar kontak petugas resmi secara dinamis dari array `config.liveAgents[]` dengan tautan chat langsung.
- **`src/handler/pembaruanExpired.js` & `src/handler/resetPassphrase.js`**: Kerangka pengendali untuk Menu 2 dan Menu 3 yang saat ini dicegat pada tingkat router dengan respon standby SOP.

### 6.3 Berkas Pengelolaan State & Sesi
- **`src/state/sessionState.js`**: Mengelola sesi in-memory (*RAM*) menggunakan struktur data `Map` berbasis nomor WhatsApp pengirim (JID). Mengontrol batas kedaluwarsa sesi (30 menit) dan menjalankan interval pembersihan memori otomatis (10 menit).

### 6.4 Berkas Utilitas Sistem (Utils)
- **`src/utils/sender.js`**: Fungsi pembantu pengiriman pesan WhatsApp (`sendText`, `sendImage`, `sendDocument`, `sendImagesSequentially`, dan `delay`).
- **`src/utils/rateLimiter.js`**: Modul pencegah spam berbasis algoritma *sliding window* (maksimal 5 pesan per 30 detik per pengguna).
- **`src/utils/processingManager.js`**: Pengatur antrean pemrosesan pesan per-JID dengan penundaan 1,5 detik untuk mencegah tabrakan data (*race condition*).

### 6.5 Berkas Konfigurasi, Skrip, & Dokumen
- **`src/config.js`**: Pusat pengaturan tunggal untuk seluruh variabel aplikasi.
- **`scripts/generate-form-docx.js`**: Skrip pembangun berkas `Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx` menggunakan pustaka `docx`.
- **`docs/Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`**: Dokumen Word fisik formulir permohonan sertifikat yang dikirimkan kepada pengguna.

---

## BAB 7 — Instalasi dan Persiapan Environment

### 7.1 Persyaratan Sistem
- **Sistem Operasi**: Windows 10/11, Linux (Ubuntu/Debian/CentOS), atau macOS.
- **Runtime**: Node.js (Disarankan versi LTS v18.x atau yang lebih baru sesuai kompatibilitas dependensi Baileys).
- **Package Manager**: npm (bawaan Node.js).
- **Koneksi Jaringan**: Akses internet stabil dengan port WebSocket terbuka (tanpa blokir firewall WhatsApp).

### 7.2 Langkah Instalasi Bertahap
1. Buka terminal atau Command Prompt pada komputer server.
2. Arahkan ke direktori proyek:
   ```bash
   cd "C:\Users\HP 240\Downloads\chatbot-main"
   ```
3. Pasang seluruh paket dependensi:
   ```bash
   npm install
   ```
4. Pastikan folder `node_modules/` terbentuk sempurna tanpa pesan error kritis.
5. Jalankan pengujian awal untuk memverifikasi kesiapan modul:
   ```bash
   npm test
   ```

---

## BAB 8 — Menjalankan Bot

Tersedia dua mode penjalanan aplikasi berdasarkan skrip pada `package.json`:

### 8.1 Mode Produksi (Standar)
Gunakan perintah ini untuk pengoperasian stabil di server layanan:
```bash
npm start
```
*Perintah ini mengeksekusi `node src/app.js` secara langsung.*

### 8.2 Mode Pengembangan (Development)
Gunakan perintah ini saat melakukan penyesuaian kode sumber atau pembaruan konfigurasi:
```bash
npm run dev
```
*Perintah ini menjalankan `nodemon src/app.js` yang akan secara otomatis me-restart aplikasi setiap kali ada perubahan file yang disimpan.*

### 8.3 Pemantauan Log Konsol
Saat bot aktif, terminal akan mencetak tanda aktivitas:
- `💬 Pesan dari: 628xxxxxxxxxx@s.whatsapp.net` — Menandakan pesan masuk yang sedang diproses.
- `📄 Dokumen terkirim...` — Menandakan berkas formulir DOCX berhasil dikirimkan.
- `🧹 Sesi dihapus (idle > 30 menit)...` — Menandakan timer pembersihan memori bekerja normal.

---

## BAB 9 — Login WhatsApp Pertama Kali

Untuk menghubungkan nomor WhatsApp yang akan digunakan sebagai akun bot:

1. Pastikan terminal dalam kondisi terbuka dan jalankan `npm start`.
2. Jika belum memiliki sesi aktif di folder `auth_info/`, sistem akan mencetak **Kode QR (QR Code)** di terminal.
3. Buka aplikasi **WhatsApp** pada smartphone yang memegang nomor bot layanan.
4. Buka menu **Pengaturan (Settings)** atau sentuh ikon titik tiga di sudut kanan atas.
5. Pilih menu **Perangkat Tertaut (Linked Devices)**.
6. Tekan tombol **Tautkan Perangkat (Link a Device)**.
7. Arahkan kamera smartphone ke Kode QR yang tampil di layar terminal.
8. Tunggu hingga terminal mencetak pesan konfirmasi:
   ```text
   ✅ Bot terhubung ke WhatsApp!
   📱 Siap menerima pesan...
      (Tekan Ctrl+C untuk menghentikan bot)
   ```
9. Kredensial sesi akan secara otomatis disimpan di dalam folder `auth_info/`. Jika bot di-restart di kemudian hari, bot akan langsung terhubung tanpa meminta scan QR ulang selama sesi belum dicabut dari smartphone.

---

## BAB 10 — Mengganti Akun WhatsApp Bot

Jika nomor layanan WhatsApp bot ingin diganti ke nomor baru, lakukan prosedur berikut:

1. Hentikan jalannya bot pada terminal dengan menekan kombinasi tombol `Ctrl + C`.
2. Pastikan proses bot telah berhenti sepenuhnya.
3. Hapus seluruh isi berkas di dalam folder `auth_info/` (atau hapus foldernya).
4. Jalankan kembali aplikasi:
   ```bash
   npm start
   ```
5. Terminal akan otomatis membentuk folder `auth_info/` baru dan menampilkan Kode QR baru.
6. Pindai Kode QR tersebut menggunakan nomor WhatsApp yang baru melalui menu **Perangkat Tertaut**.
7. Pastikan bot terhubung dan lakukan uji coba pengiriman pesan *"Halo"* dari nomor lain.

> [!WARNING]
> Menghapus folder `auth_info/` hanya akan memutus sesi login WhatsApp sebelumnya. Hal ini **TIDAK AKAN** merusak kode sumber program, dokumen, maupun basis data konfigurasi bot.

---

## BAB 11 — Konfigurasi Bot (src/config.js)

Seluruh parameter operasional dikontrol terpusat pada berkas `src/config.js`. Berikut adalah tabel konfigurasi aktual yang diterapkan:

| Nama Variabel Konfigurasi | Nilai Aktual | Deskripsi Fungsi Operasional |
| :--- | :--- | :--- |
| `botName` | `'Layanan Bantuan Tanda Tangan Elektronik AMS'` | Nama resmi bot yang tampil pada salam pembuka Menu Utama. |
| `liveAgents` | Array of Objects | Daftar data seluruh petugas Live Agen (nama, label, nomor telepon, format display, link chat). |
| `operationalHours` | `'Senin - Jumat, 08:00 - 16:00 WIB'` | Jam kerja resmi pelayanan verifikator dinas. |
| `sendDelay` | `1000` ms (1 detik) | Jeda waktu antar pengiriman berkas gambar tutorial aktivasi. |
| `rateLimitMaxMessages` | `5` pesan | Batas kuota pesan yang diizinkan sebelum peringatan anti-spam. |
| `rateLimitWindow` | `30000` ms (30 detik) | Rentang jendela waktu pemantauan batas frekuensi pesan. |
| `processingDelay` | `1500` ms (1,5 detik) | Waktu tunggu antrean sebelum memproses pesan baru dari pengirim yang sama. |
| `stateTimeout` | `1800000` ms (30 menit) | Batas waktu idle tanpa pesan sebelum status sesi di-reset. |
| `cleanupInterval` | `600000` ms (10 menit) | Interval berkala timer pembersihan sesi idle dari memori RAM. |
| `docPaths.formulirPermohonan` | Path ke berkas DOCX | Jalur absolut ke berkas formulir permohonan Word aktif. |
| `imagePaths.pengajuan` | Path ke folder gambar | Jalur absolut ke direktori 8 foto panduan tutorial Juknis. |

---

## BAB 12 — Pengelolaan Live Agen

Kontak petugas layanan (Live Agen) dikelola secara fleksibel melalui properti `liveAgents` pada berkas `src/config.js`.

### 12.1 Konfigurasi Agen Saat Ini
Saat ini sistem mengonfigurasi dua petugas verifikator resmi:
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

### 12.2 Prosedur Menambah Agen Baru
Jika terdapat penambahan petugas ketiga (misal: Agen 3), cukup tambahkan satu elemen baru ke dalam array `liveAgents` tanpa perlu mengubah file handler:
```javascript
{
  name: 'Nama Petugas',
  label: 'Agen 3',
  phone: '08xxxxxxxxxx',
  displayPhone: '08xx-xxxx-xxxx',
  waLink: 'https://wa.me/628xxxxxxxxxx',
}
```
Seluruh tampilan pesan pada Menu 1, Menu 2, Menu 3, dan Menu 4 akan secara otomatis menyertakan agen baru tersebut.

---

## BAB 13 — Alur Menu Utama

### 13.1 Mekanisme Penerimaan Pengguna
- **Kontak Baru**: Saat pengguna mengirim pesan pertama kali (misal: *"Halo"*, *"P"*, *"Info"*), sistem menginisiasi state default (`menu: 'MAIN'`) dan menampilkan pesan `MENU_UTAMA_TEXT`.
- **Pilihan Layanan**:
  - `1` -> Memulai alur Pengajuan Baru (`startPengajuanBaru`).
  - `2` -> Menampilkan pesan standby SOP Pembaruan Sertifikat (`STANDBY_TEXT`).
  - `3` -> Menampilkan pesan standby SOP Reset Passphrase (`STANDBY_TEXT`).
  - `4` -> Menampilkan informasi kontak Live Agen (`startLiveAgen`).
  - `0` -> Mereset posisi alur kembali ke Menu Utama.
- **Penanganan Input Invalid**: Jika pengguna mengirimkan teks selain opsi angka yang tersedia, bot mengirimkan balasan ramah `INVALID_INPUT_TEXT` yang menampilkan kembali daftar menu.
- **Penyaringan Pesan Non-Interaktif**: Bot secara otomatis mengabaikan pesan dari bot itu sendiri (`fromMe`), pesan dari obrolan grup WhatsApp (`@g.us`), dan pesan non-teks murni (stiker/gambar tanpa caption).

---

## BAB 14 — Panduan Menu Pengajuan Baru (Menu 1)

Alur Menu 1 merupakan fitur operasional utama yang telah terintegrasi penuh sesuai tahapan Petunjuk Teknis AMS.

### 14.1 Diagram Alur Detail
```text
                         [ Menu Utama ]
                               │
                               ▼ (Ketik 1)
                     [ Tanya Email Dinas ]
                               │
             ┌─────────────────┴─────────────────┐
             ▼ (Ketik 2: Belum)                  ▼ (Ketik 1: Sudah)
    [ Arahan Dinas Kominfo ]             [ Kirim Formulir DOCX ]
    [  & Kontak Live Agen  ]             [   & Penjelasan SOP  ]
             │                                   │
             │                                   ▼ (Ketik 1)
             │                         [ Kirim 8 Foto Panduan ]
             │                         [ Juknis Halaman 7–14  ]
             │                                   │
             │                                   ▼
             │                         [ Pesan Penutup SOP 6 Langkah ]
             │                         [   & Kontak Langsung Agen    ]
             │                                   │
             └─────────────────┬─────────────────┘
                               │
                               ▼ (Ketik 0)
                         [ Menu Utama ]
```

### 14.2 Rincian Tahapan Alur Menu 1
1. **Pertanyaan Email Dinas (`CHECK_EMAIL_DINAS`)**:
   Pengguna ditanya: *"Apakah Anda sudah memiliki Email Dinas (@blorakab.go.id)?"*.
2. **Jalur Belum Memiliki Email Dinas (`NO_EMAIL_GUIDE`)**:
   Bot menjelaskan bahwa email dinas merupakan syarat mutlak pembuatan akun AMS. Bot mengarahkan pengajuan email dinas ke Dinas Kominfo Blora serta menyajikan kontak langsung kedua Live Agen dan opsi kembali ke Menu Utama (`0`).
3. **Jalur Sudah Memiliki Email Dinas (`FORM_SENT`)**:
   Bot mengirimkan pesan pengantar tata cara permohonan (`FORM_INTRO_TEXT`), lalu secara otomatis mengirimkan berkas fisik `Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx` ke chat WhatsApp pengguna. Setelah dokumen terkirim, bot menyajikan opsi untuk melihat panduan aktivasi akun AMS (`1`) atau kembali ke Menu Utama (`0`).
4. **Pengiriman 8 Foto Panduan Juknis (`JUKNIS_VIEW`)**:
   Jika pengguna mengetik `1`, bot mengirimkan teks pembuka (`JUKNIS_INTRO_TEXT`) dan menyiarkan 8 gambar tutorial secara bertahap dengan jeda 1 detik per gambar. Seluruh gambar diberi caption penjelas berlabel `[SIMULASI / DEMO]`.
5. **Pesan Penutup SOP Resmi (`TUTORIAL_COMPLETE`)**:
   Setelah seluruh gambar terkirim, bot mengirimkan pesan penutup (`getTutorialCompleteText`) yang berisi:
   - Konfirmasi pengiriman panduan selesai.
   - Ringkasan alur SOP Pengajuan Baru 6 langkah resmi.
   - Penegasan poin 6: Pengguna menunggu verifikasi verifikator, dan link Set Passphrase akan dikirimkan via WhatsApp atau Email Dinas.
   - Kontak langsung kedua Live Agen berikon tautan `🔗`.
   - Tombol navigasi tunggal: `0️⃣ Menu Utama`.

> [!IMPORTANT]
> **BATAS TUTORIAL JUKNIS:**
> Panduan visual bot saat ini **hanya mencakup halaman 7–14 Juknis AMS** (tahap pengisian data oleh pemohon). Bot **TIDAK** mengirimkan tutorial verifikasi internal verifikator (halaman 15–20). Bot juga tidak mengajarkan pembuatan passphrase secara mandiri di chat, karena passphrase dibuat melalui tautan resmi yang diterbitkan setelah verifikasi disetujui.

---

## BAB 15 — Pengelolaan Formulir Permohonan DOCX

### 15.1 Karakteristik Berkas
- **Lokasi Fisik**: `docs/Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`
- **Format**: Microsoft Word Document (.docx)
- **Ukuran Standar**: 9.187 bytes
- **Mekanisme Pengiriman**: Dikirimkan otomatis melalui fungsi `sendDocument` pada `src/utils/sender.js` dengan MIME-type `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.

### 15.2 Anatomi Isi Formulir Aktual
Formulir permohonan yang digunakan mencakup komponen resmi berikut:
1. **Kop Surat Instansi Pemohon**: Format instansi vertikal / dinas / badan.
2. **Tanggal & Tujuan**: Ditujukan kepada *Kepala Dinas Komunikasi dan Informatika di Tempat*.
3. **Perihal**: *Permohonan Tanda Tangan Elektronik*.
4. **Pernyataan Pengajuan**: Opsi pilihan jenis permohonan (*Pembuatan Baru / Pembaharuan / Reset*).
5. **Daftar Field Pemohon (Hanya Field Ini yang Tersedia)**:
   - *Tanda Tangan Elektronik*: `[ ] Pembuatan Baru  [ ] Pembaharuan  [ ] Reset`
   - *Atas Nama*
   - *Nama*
   - *Email Dinas*
   - *No HP User*
   - *No HP Narahubung*
6. **Kalimat Penutup Surat**: Ucapan terima kasih permohonan kerja sama.
7. **Kolom Tanda Tangan**: Area tanda tangan pemohon tunggal di kanan bawah.

*(Catatan Verifikasi: Dokumen formulir aktual tidak memuat field NIK, NIP, Pangkat/Golongan, Jabatan, Unit Kerja, maupun Instansi)*.

### 15.3 Prosedur Mengganti Template Formulir
1. Buka dokumen formulir baru di Microsoft Word, lakukan pembaruan format surat sesuai instruksi dinas.
2. Simpan berkas dengan nama persis: `Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`.
3. Timpa (*replace*) file tersebut ke dalam folder `docs/`.
4. Pastikan file tidak dalam kondisi terbuka (*locked*) oleh aplikasi Microsoft Word di komputer server.

---

## BAB 16 — Pengelolaan Foto Tutorial Juknis

### 16.1 Pemetaan 8 Gambar Panduan
Gambar tutorial tersimpan di dalam direktori:
```text
images/pengajuan/
```
Berikut adalah pemetaan 8 file aktual terhadap halaman buku Petunjuk Teknis resmi:

| No | Nama Berkas Aktual | Rujukan Juknis | Langkah Tutorial | Caption Berlabel |
| :---: | :--- | :---: | :--- | :--- |
| **1** | `01_registrasi_pengguna.png` | Halaman 7 | Langkah 1 | `[SIMULASI / DEMO] Langkah 1 – Registrasi Pengguna` |
| **2** | `02_aktivasi_akun.png` | Halaman 8 | Langkah 2 | `[SIMULASI / DEMO] Langkah 2 – Aktivasi Akun` |
| **3** | `03_lengkapi_data_diri.png` | Halaman 9 | Langkah 3 | `[SIMULASI / DEMO] Langkah 3 – Lengkapi Data Diri` |
| **4** | `04_verifikasi_whatsapp.png` | Halaman 10 | Langkah 4 | `[SIMULASI / DEMO] Langkah 4 – Verifikasi WhatsApp` |
| **5** | `05_data_kedinasan.png` | Halaman 11 | Langkah 5 | `[SIMULASI / DEMO] Langkah 5 – Data Kedinasan` |
| **6** | `06_lengkapi_data.png` | Halaman 12 | Langkah 6 | `[SIMULASI / DEMO] Langkah 6 – Lengkapi Data` |
| **7** | `07_verifikasi_data.png` | Halaman 13 | Langkah 7 | `[SIMULASI / DEMO] Langkah 7 – Verifikasi Data` |
| **8** | `08_persetujuan_submit.png` | Halaman 14 | Langkah 8 | `[SIMULASI / DEMO] Langkah 8 – Persetujuan dan Submit` |

### 16.2 Logika Resolver Format Berkas
Fungsi `getPengajuanImagePaths()` pada `src/handler/pengajuanBaru.js` dilengkapi logika cerdas toleran ekstensi. Jika konfigurasi menyebutkan `.jpg` namun file fisik bertipe `.png`, modul akan otomatis mendeteksi dan menyelesaikan path file yang ada secara transparan tanpa error.

### 16.3 Prosedur Mengganti Tangkapan Layar Tutorial
1. Siapkan 8 gambar baru dengan aspek rasio yang nyaman dibaca di smartphone.
2. Beri nama file urut: `01_registrasi_pengguna.png` s.d. `08_persetujuan_submit.png`.
3. Masukkan ke folder `images/pengajuan/`.
4. Uji pengiriman gambar menggunakan: `npm test`.

---

## BAB 17 — Status Menu Pembaharuan / Expired (Menu 2)

- **Status Sistem**: **STANDBY / SEGERA HADIR** (Belum aktif secara operasional).
- **Perilaku Bot Saat Ini**: Ketika pengguna memilih angka `2` pada Menu Utama, bot mengubah state sesi ke `menu: 'PEMBARUAN_ASK', step: 'STANDBY'` dan mengirimkan pesan:
  ```text
  ⚠️ Layanan ini sedang dalam proses penyiapan SOP terbaru.

  Silakan kembali ke Menu Utama atau hubungi petugas Live Agen kami jika mendesak.

  4️⃣ Hubungi Live Agen
  0️⃣ Menu Utama
  ```
- **Kesiapan Teknis**: Berkas pengendali `src/handler/pembaruanExpired.js` telah tersedia dan memuat draf fungsi `startPembaruanExpired` untuk mempermudah integrasi di masa mendatang setelah SOP pembaharuan disahkan oleh Dinas Kominfo Blora.

---

## BAB 18 — Status Menu Reset Passphrase (Menu 3)

- **Status Sistem**: **STANDBY / SEGERA HADIR** (Belum aktif secara operasional).
- **Perilaku Bot Saat Ini**: Ketika pengguna memilih angka `3` pada Menu Utama, bot mengubah state sesi ke `menu: 'PASSPHRASE_GUIDE', step: 'STANDBY'` dan mengirimkan pesan standby SOP yang sama dengan Menu 2.
- **Kesiapan Teknis**: Berkas pengendali `src/handler/resetPassphrase.js` telah tersedia dan memuat draf fungsi `startResetPassphrase` untuk mempermudah integrasi di masa mendatang setelah SOP reset passphrase disahkan.

---

## BAB 19 — Manajemen Sesi Percakapan

### 19.1 Arsitektur Penyimpanan Sesi In-Memory
Sistem mengelola sesi percakapan menggunakan struktur data JavaScript `Map` di dalam memori RAM server (`src/state/sessionState.js`).
- **Identifier**: WhatsApp JID unik pengguna (contoh: `6281234567890@s.whatsapp.net`).
- **Struktur Objek Sesi**:
  ```javascript
  {
    menu: 'MAIN',        // Menu aktif (MAIN, PENGAJUAN_ASK, dll.)
    step: 0,             // Langkah spesifik di dalam menu
    lastActive: 1726000, // Timestamp interaksi terakhir
    data: {}             // Objek penampung data sementara
  }
  ```

### 19.2 Siklus Kedaluwarsa & Pembersihan Otomatis
- **Batas Waktu Idle (`stateTimeout`)**: 30 menit (1.800.000 ms). Jika pengguna tidak mengirim pesan selama lebih dari 30 menit, sesi dinyatakan kedaluwarsa.
- **Timer Pembersihan (`cleanupInterval`)**: Sistem menjalankan interval otomatis setiap 10 menit (600.000 ms) via `cleanupInactiveSessions()` untuk membebaskan memori RAM.
- **Pemberitahuan Sesi Berakhir**: Pengguna yang sesinya kedaluwarsa akan menerima notifikasi penjelasan saat mengirim pesan kembali, dan posisi alur diarahkan kembali ke Menu Utama.
- **Navigasi Angka 0**: Mengetik angka `0` memanggil fungsi `resetState(jid)`, mereset posisi alur bot ke Menu Utama tanpa menghapus riwayat obrolan WhatsApp pengguna.
- **Efek Restart Aplikasi**: Karena sesi disimpan di RAM, me-restart proses bot (`npm start`) akan mengosongkan seluruh sesi aktif sehingga interaksi berikutnya diperlakukan sebagai sesi baru.

---

## BAB 20 — Anti-Spam dan Processing Queue

Untuk menjaga stabilitas bot dan melindungi nomor WhatsApp layanan dari risiko pemblokiran:

### 20.1 Rate Limiter (`src/utils/rateLimiter.js`)
- Menerapkan algoritma *sliding window* dengan batas kuota **5 pesan per 30 detik** per pengguna.
- **Respon Batasan**:
  - Pesan ke 1 s.d. 5: Diterima dan diproses normal.
  - Pesan ke-6: Ditolak dan memicu 1x pesan peringatan: *"⚠️ Anda mengirim pesan terlalu cepat. Silakan tunggu sebentar sebelum melanjutkan."*
  - Pesan ke-7 dan seterusnya dalam window yang sama: Ditahan secara diam tanpa membalas spam (*silent ignore*).

### 20.2 Antrean Pemrosesan Pesan (`src/utils/processingManager.js`)
- Menggunakan antrean rantai Promise per-JID (*FIFO*).
- Menerapkan penundaan statis sebesar **1,5 detik (1.500 ms)** sebelum mengeksekusi pesan baru dari pengguna yang sama. Hal ini mencegah tabrakan data (*race condition*) apabila pengguna mengetik opsi terlalu cepat.

### 20.3 Perbedaan Parameter Delay
- **`processingDelay` (1.500 ms)**: Delay antrean sebelum bot memproses pesan masuk dari pengguna.
- **`sendDelay` (1.000 ms)**: Jeda waktu antar pengiriman berkas gambar tutorial dari bot ke pengguna.

---

## BAB 21 — Testing dan Validasi

Proyek ini dilengkapi rangkaian pengujian unit dan integrasi otomatis pada folder `tests/`:

### 21.1 Perintah Pengujian Mandiri
```bash
# 1. Uji Logika Alur Dasar & Navigasi (21 Skenario)
node tests/test-tahap2.js

# 2. Uji Koneksi Baileys & Handler Sesi (31 Skenario)
node tests/test-tahap3.js

# 3. Uji Menu Utama, Sesi Idle & Rate Limiter (13 Skenario)
node tests/test-tahap4.js

# 4. Uji Master Komprehensif Menu 1 & Multi-Agent (75 Skenario)
node tests/test-tahap7.js

# 5. Uji Cepat melalui NPM Script (Menjalankan tests/test-tahap7.js)
npm test
```

### 21.2 Hasil Verifikasi Baseline Sistem
Seluruh pengujian mencatatkan hasil **100% LULUS (140 passed, 0 failed)**:
- `test-tahap2.js`: 21 passed
- `test-tahap3.js`: 31 passed
- `test-tahap4.js`: 13 passed
- `test-tahap7.js`: 75 passed

---

## BAB 22 — Troubleshooting

Panduan penanganan masalah umum operasional:

### 22.1 Kode QR Tidak Tampil di Konsol Terminal
- **Penyebab**: Sesi login lama masih tersimpan di folder `auth_info/` atau ukuran jendela terminal terlalu sempit.
- **Solusi**: Perbesar jendela konsol terminal. Jika ingin login ulang, hentikan bot (`Ctrl+C`), hapus folder `auth_info/`, lalu jalankan kembali `npm start`.

### 22.2 Sambungan WhatsApp Sering Terputus (*Disconnect*)
- **Penyebab**: Koneksi internet smartphone atau server tidak stabil, atau perangkat smartphone mengaktifkan mode hemat daya (*battery saver*) yang mematikan background data WhatsApp.
- **Solusi**: Nonaktifkan penghemat daya untuk aplikasi WhatsApp pada smartphone, dan pastikan koneksi internet server stabil. Bot akan otomatis melakukan *reconnect* hingga 5 kali percobaan.

### 22.3 Bot Tidak Membalas Pesan Masuk
- **Penyebab**: Pesan dikirim dari nomor bot itu sendiri (`fromMe`), pesan dikirim melalui grup WhatsApp, atau batas kuota rate limiter pengguna sedang terlampaui.
- **Solusi**: Pastikan pengujian dilakukan dari nomor WhatsApp lain melalui chat pribadi (bukan grup). Tunggu 30 detik jika sebelumnya mengirim pesan terlalu cepat.

### 22.4 Berkas Formulir DOCX Gagal Terkirim
- **Penyebab**: File fisik formulir di folder `docs/` sedang dibuka dan dikunci (*locked*) oleh Microsoft Word di server.
- **Solusi**: Tutup aplikasi Microsoft Word di server, pastikan file `docs/Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx` dapat diakses bebas.

---

## BAB 23 — Keamanan dan Privasi Data

> [!CAUTION]
> **STANDAR KEAMANAN TINGGI:**
> 1. **Kerahasiaan Direktori `auth_info/`**: Berkas di dalam folder ini memuat kunci privat enkripsi sesi WhatsApp. Jangan pernah mengunggah folder ini ke GitHub atau membagikannya kepada siapa pun.
> 2. **Integritas `.gitignore`**: Pastikan berkas `.gitignore` selalu memuat entri `auth_info/` dan `node_modules/`.
> 3. **Perlindungan Kode QR**: Jangan membagikan tangkapan layar terminal yang memuat Kode QR login aktif ke forum publik.
> 4. **Folder `.agents/`**: Merupakan folder konfigurasi pendukung pengembangan AI agent dan bukan kredensial rahasia bot. Pertahankan folder ini di root proyek.

---

## BAB 24 — Backup dan Pemindahan Project

### 24.1 Klasifikasi Berkas untuk Pencadangan (Backup)
Saat membuat arsip cadangan proyek, pisahkan berkas berdasarkan tingkat sensitivitasnya:

| Kategori Berkas | Daftar Berkas / Folder | Kebijakan Cadangan |
| :--- | :--- | :--- |
| **Source Project (Wajib)** | `src/`, `scripts/`, `package.json`, `package-lock.json`, `.gitignore` | Cadangkan secara berkala ke Git repository atau arsip ZIP. |
| **Aset Visual & Dokumen** | `images/`, `docs/`, `README.md`, `docs/MANUAL_BOOK.md` | Cadangkan bersama source code proyek. |
| **Rangkaian Uji** | `tests/` | Cadangkan bersama source code proyek. |
| **Tooling Agent** | `.agents/` | Pertahankan di root proyek. |
| **Sesi WhatsApp (RAHASIA)** | `auth_info/` | **JANGAN** dimasukkan ke dalam arsip publik atau repositori bersama. |
| **Dependensi Eksternal** | `node_modules/` | Tidak perlu dicadangkan (dibuat via `npm install`). |

### 24.2 Prosedur Pemindahan ke Komputer / Server Baru
1. Salin seluruh folder proyek **tanpa menyertakan** `node_modules/` dan `auth_info/`.
2. Buka terminal pada komputer baru, lalu jalankan:
   ```bash
   npm install
   ```
3. Jalankan pengujian otomatis untuk memverifikasi sistem:
   ```bash
   npm test
   ```
4. Jalankan bot dan scan Kode QR baru untuk menghubungkan nomor layanan WhatsApp.

---

## BAB 25 — Checklist Maintenance dan Prosedur Perubahan SOP

### 25.1 Lembar Ceklis Pemeliharaan Rutin

#### A. Ceklis Harian Operator
- [ ] Bot berjalan normal di terminal tanpa pesan error berulang.
- [ ] Status koneksi menunjukkan *"Bot terhubung ke WhatsApp!"*.
- [ ] Uji kirim pesan sapaan dari nomor lain, pastikan Menu Utama membalas cepat.
- [ ] Pastikan smartphone bot tetap terhubung ke internet dan daya baterai cukup.

#### B. Ceklis Mingguan Administrator
- [ ] Jalankan uji otomatis: `npm test` (seluruh 75 skenario wajib lulus).
- [ ] Periksa ukuran log konsol dan sisa ruang penyimpanan harddisk server.
- [ ] Pastikan berkas formulir DOCX di `docs/` dapat dibuka sempurna.
- [ ] Konfirmasi nomor kontak verifikator (Live Agen) masih aktif melayani.

### 25.2 Matriks Panduan Pembaruan SOP Resmi

Jika terdapat perubahan regulasi atau instruksi resmi dari Dinas Kominfo Blora / BSrE, gunakan tabel panduan berikut untuk menentukan file yang harus disesuaikan:

| Kebutuhan Perubahan | Berkas yang Diubah | Fungsi / Bagian Terkait | Prosedur Pengujian |
| :--- | :--- | :--- | :--- |
| Perubahan Salam / Teks Menu Utama | `src/handler/menuUtama.js` | Konstanta `MENU_UTAMA_TEXT` | Jalankan `node tests/test-tahap4.js` |
| Perubahan Nomor / Nama Live Agen | `src/config.js` | Array `config.liveAgents` | Jalankan `node tests/test-tahap7.js` |
| Perubahan Jam Layanan Agen | `src/config.js` | Properti `operationalHours` | Jalankan `node tests/test-tahap7.js` |
| Perubahan Template Formulir Word | `docs/` | Ganti file `Formulir_..._AMS.docx` | Uji pengiriman via alur Menu 1 |
| Perubahan Redaksi SOP Pengajuan | `src/handler/pengajuanBaru.js` | Fungsi `getTutorialCompleteText()` | Jalankan `node tests/test-tahap7.js` |
| Pembaruan Foto Tutorial Juknis | `images/pengajuan/` | Timpa file `01_...png` s.d. `08_...png` | Jalankan `node tests/test-tahap7.js` |
| Penyesuaian Kuota Anti-Spam | `src/config.js` | Variabel `rateLimitMaxMessages` | Jalankan `node tests/test-tahap4.js` |

### 25.3 Prosedur Aman 7 Langkah Pembaruan Kode
1. **Lakukan Pencadangan**: Salin direktori proyek ke tempat aman sebelum melakukan modifikasi.
2. **Kaji Kode Terkait**: Telusuri alur berkas pengendali yang bersangkutan secara mendalam.
3. **Lakukan Perubahan Terisolasi**: Ubah hanya bagian teks atau parameter yang memang ditugaskan.
4. **Jalankan Uji Otomatis**: Eksekusi perintah `npm test` di terminal dan pastikan 100% skenario lulus (*zero failure*).
5. **Jalankan Bot Lokal**: Aktifkan bot dalam mode `npm run dev` di lingkungan pengujian.
6. **Lakukan Uji WhatsApp Nyata**: Kirim pesan langsung dari smartphone untuk mencoba alur yang baru diubah.
7. **Dokumentasikan Perubahan**: Catat tanggal dan rincian perubahan yang telah disahkan oleh pihak berwenang.

---
*Buku Manual Teknis dan Operasional ini disusun secara komprehensif untuk memastikan keandalan, keberlanjutan, dan kemudahan pemeliharaan sistem Layanan Bantuan Tanda Tangan Elektronik AMS Dinas Kominfo Kabupaten Blora.*
