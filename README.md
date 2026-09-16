# Layanan Bantuan Tanda Tangan Elektronik AMS
## Chatbot WhatsApp Interaktif Dinas Komunikasi dan Informatika Kabupaten Blora

Chatbot WhatsApp resmi untuk memandu aparatur sipil negara (ASN) dan pengguna layanan di lingkungan Pemerintah Kabupaten Blora dalam pengajuan, pembaruan, pengelolaan sertifikat elektronik, dan bantuan teknis pada **Aplikasi Manajemen Sertifikat (AMS)** Balai Sertifikasi Elektronik (BSrE) - Badan Siber dan Sandi Negara (BSSN).

---

## 1. Ikhtisar Sistem

Sistem ini dirancang sebagai asisten virtual berbasis pesan instan WhatsApp yang menyederhanakan alur birokrasi dan petunjuk teknis (Juknis) menjadi percakapan dua arah yang interaktif, terarah, dan ramah pengguna. Pengguna dapat memperoleh informasi persyaratan, mengunduh dokumen formulir resmi secara langsung, menyimak panduan bergambar langkah-demi-langkah, hingga terhubung langsung dengan petugas verifikator (Live Agen) Dinas Kominfo Blora.

### Fitur Utama (100% Aktif):
1. **Menu 1 — Pengajuan Baru**: Pemeriksaan email dinas (@blorakab.go.id), pengiriman berkas Formulir Permohonan resmi (.docx), dan pengiriman panduan aktivasi akun berbasis Juknis AMS (8 gambar tutorial bertahap).
2. **Menu 2 — Pembaharuan / Expired**: Layanan penanganan sertifikat elektronik menjelang masa kedaluwarsa (H-30) dengan pengiriman Formulir Permohonan (.docx) dan 2 gambar Juknis (Hal. 38–39), serta edukasi sertifikat kedaluwarsa (Expired) dengan 2 gambar Juknis (Hal. 40–41) dan arahan ke Live Agen.
3. **Menu 3 — Reset Passphrase**: Panduan resmi dan pengiriman berkas Formulir Permohonan (.docx) untuk pengajuan reset kata sandi sertifikat yang lupa, disertai 2 gambar Juknis (Hal. 44–45), ringkasan SOP, dan tautan Live Agen dengan batasan keamanan ketat.
4. **Menu 4 — Live Agen**: Direktori kontak resmi petugas verifikator Kominfo (Multi-Agent: Pak Kris & Pak Jaya) yang dapat dihubungi langsung melalui tautan WhatsApp beserta informasi jam operasional resmi.

---

## 2. Batasan Sistem & Keamanan (Security Boundaries)

Untuk menjaga keamanan informasi dan integritas sertifikat elektronik:

> [!IMPORTANT]
> - **Bukan WhatsApp Business Cloud API**: Sistem ini memanfaatkan pustaka Baileys (`@whiskeysockets/baileys`) berbasis protokol soket WhatsApp Web Multi-Device, bukan Meta Cloud API berbayar.
> - **Tanpa Akses Database AMS Langsung**: Chatbot beroperasi sebagai pemandu interaktif dan penyedia dokumen template. Chatbot **TIDAK TERHUBUNG** ke database internal AMS, tidak dapat mengecek masa kedaluwarsa secara otomatis, tidak dapat menghitung periode H-30 secara otomatis, dan tidak melakukan perubahan data pengguna pada sistem AMS.
> - **Tidak Menerima Berkas Balasan via Chat**: Chatbot tidak menerima kiriman formulir yang telah diisi, foto/scan KTP, maupun berkas identitas pribadi. Seluruh pengajuan berkas fisik/digital dilakukan secara mandiri oleh pemohon kepada pihak Kominfo/Verifikator.
> - **Keamanan Kredensial Mutlak (Zero Credential)**: Chatbot **TIDAK PERNAH** meminta, menerima, memvalidasi, maupun menyimpan data sensitif seperti *passphrase* lama/baru, kata sandi (*password*), PIN, maupun kode OTP.
> - **Kerahasiaan Kredensial Sesi Bot**: Folder `auth_info/` berisi token autentikasi kriptografi sesi WhatsApp bot yang bersifat sangat rahasia. Folder ini **DILARANG KERAS** dibagikan atau di-commit ke repositori Git publik.

---

## 3. Diagram & Alur Layanan Chatbot

### Peta Navigasi Menu:
```text
                 [ Pengguna Mengirim Pesan ]
                             │
                             ▼
                    ┌─────────────────┐
                    │   Menu Utama    │
                    └────────┬────────┘
        ┌────────────────────┼────────────────────┬────────────────────┐
        ▼                    ▼                    ▼                    ▼
 [1. Pengajuan]       [2. Pembaharuan]      [3. Passphrase]       [4. Live Agen]
        │                    │                    │                    │
  Cek Email Dinas       Cek Masa Berlaku      Formulir DOCX       Daftar Kontak
  ├─ Belum: Arahan      ├─ Expired:           ├─ Unduh Form       ├─ Pak Kris
  │  Kominfo + Agen     │  Info + 2 Foto      ├─ Centang Reset    ├─ Pak Jaya
  └─ Sudah:             │  (Hal 40–41)        ├─ Ajukan Mandiri   └─ Jam Kerja
     ├─ Formulir DOCX   │  + Live Agen        ├─ Opsi Panduan:       08:00–16:00
     └─ Pilihan Juknis: └─ Belum Expired:        2 Foto Juknis
        8 Foto Panduan     ├─ Edukasi H-30       (Hal 44–45)
        (Hal 7–14)         ├─ Formulir DOCX   └─ Live Agen
                           ├─ 2 Foto Juknis
                           │  (Hal 38–39)
                           └─ Live Agen
        │                    │                    │                    │
        └────────────────────┴────────────────────┴────────────────────┘
                                     │
                             [ Ketik 0 Kapan Saja ]
                                     ▼
                            Kembali ke Menu Utama
```

---

### Detail Alur Menu 1 — Pengajuan Baru
1. Pengguna mengetik `1` dari Menu Utama.
2. Bot menanyakan kepemilikan Email Dinas Pemkab Blora (`1. Sudah`, `2. Belum`).
3. **Jika Belum (`2`)**: Bot memberikan petunjuk pengajuan email dinas resmi ke Dinas Kominfo dan menyertakan kontak Live Agen.
4. **Jika Sudah (`1`)**:
   - Bot mengirimkan pengantar persyaratan.
   - Bot mengirimkan berkas `Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`.
   - Bot menampilkan ringkasan alur pengajuan dan menawarkan tutorial aktivasi (Ketik `1`).
5. **Tutorial Aktivasi (Ketik `1`)**:
   - Bot mengirimkan 8 foto panduan resmi dari **Juknis AMS halaman 7–14** secara bertahap (jeda 1 detik per gambar).
   - Setiap gambar dilengkapi *caption* edukatif berlabel `[SIMULASI / DEMO]`.
   - Bot mengirimkan pesan penutup dengan 6 ringkasan alur SOP dan kontak Live Agen.
6. **Alur Lengkap SOP Pengajuan Baru**:
   - Pengguna mengisi formulir permohonan.
   - Pengguna mengajukan formulir kepada Kominfo / Verifikator.
   - Verifikator melakukan input data pemohon ke sistem AMS.
   - Pengguna menerima link aktivasi melalui Email Dinas.
   - Pengguna melakukan aktivasi akun.
   - Pengguna menunggu proses verifikasi dan persetujuan oleh Verifikator.
   - Setelah diverifikasi/disetujui, link *Set Passphrase* dikirim melalui WhatsApp atau Email Dinas.
   *(Catatan: Chatbot tidak melakukan Set Passphrase secara otomatis dan tidak mengakses sistem AMS).*

---

### Detail Alur Menu 2 — Pembaharuan / Expired
1. Pengguna mengetik `2` dari Menu Utama.
2. Bot menanyakan status masa berlaku sertifikat elektronik:
   - `1` — Sudah Expired
   - `2` — Belum Expired
   - `0` — Menu Utama
3. **Jika Sudah Expired (`1`)**:
   - Bot menginformasikan bahwa sertifikat yang telah kedaluwarsa **tidak dapat diperbarui** secara langsung.
   - Bot mengirimkan 2 foto panduan resmi:
     - `pembaruan_expired_01.png` → Juknis AMS Halaman 40 (Informasi Sertifikat Expired).
     - `pembaruan_expired_02.png` → Juknis AMS Halaman 41 (Arahan Pengajuan Baru).
   - Bot memberikan arahan pengajuan ulang sertifikat baru dan menghubungkan ke Live Agen.
4. **Jika Belum Expired (`2`)**:
   - Bot mengedukasi bahwa pembaruan hanya dapat diproses saat sertifikat memasuki periode **H-30 sebelum kedaluwarsa**.
   - Bot menanyakan konfirmasi apakah masa berlaku sertifikat sudah berada dalam periode H-30 (`1. Ya, Sudah H-30`, `0. Menu Utama`).
   - Jika pengguna memilih `1`:
     - Bot mengirimkan berkas `Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`.
     - Pengguna diarahkan untuk mengisi formulir dan dapat memilih melihat panduan (Ketik `1`).
     - Bot mengirimkan 2 foto panduan resmi:
       - `pembaruan_belum_expired_01.png` → Juknis AMS Halaman 38 (Menu Pembaruan AMS).
       - `pembaruan_belum_expired_02.png` → Juknis AMS Halaman 39 (Proses Pembaruan AMS).
     - Bot mengarahkan pengguna untuk menyerahkan formulir ke Verifikator dan menyediakan kontak Live Agen.

---

### Detail Alur Menu 3 — Reset Passphrase
1. Pengguna mengetik `3` dari Menu Utama.
2. Bot menyajikan penjelasan mengenai ketentuan permohonan reset passphrase bagi pemohon yang lupa kata sandi sertifikat.
3. Bot langsung mengirimkan berkas resmi `Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx`.
4. Bot menginstruksikan pengguna untuk:
   - Mengisi formulir permohonan dan memberi tanda centang pada opsi: `[X] Reset Passphrase`.
   - Menandatangani formulir tersebut.
   - Mengajukan formulir secara mandiri kepada pihak Verifikator Kominfo / Live Agen.
5. Bot menawarkan panduan teknis pada aplikasi AMS (Ketik `1`).
6. Jika pengguna memilih `1`:
   - Bot mengirimkan tepat 2 foto panduan resmi:
     - `reset_passphrase_01.png` → Juknis AMS Halaman 44 (Permohonan Reset Passphrase).
     - `reset_passphrase_02.png` → Juknis AMS Halaman 45 (Pembuatan Passphrase Baru).
   - *(PENTING: Juknis Halaman 42–43 mengenai Ubah Passphrase TIDAK DISERTAKAN karena berbeda prosedur dengan Reset Passphrase).*
   - Bot mengirimkan ringkasan SOP penutup dan kontak Live Agen.

---

### Detail Alur Menu 4 — Live Agen
Menampilkan daftar verifikator resmi yang terkonfigurasi pada `src/config.js`:
- **Pak Kris (Agen 1)**: Telp `0813-2882-3858` — [Chat WhatsApp](https://wa.me/6281328823858)
- **Pak Jaya (Agen 2)**: Telp `0898-0008-575` — [Chat WhatsApp](https://wa.me/628980008575)
- **Jam Operasional**: Senin – Jumat, 08:00 – 16:00 WIB.

---

## 4. Struktur Direktori Proyek

```text
chatbot-main/
├── .agents/                                                    # Konfigurasi tooling & agent AI
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

## 5. Anatomi Formulir Permohonan DOCX

Berkas resmi yang dikirimkan bot adalah:
`docs/Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx` (Ukuran: 9.187 bytes).

Sesuai format resmi dinas, dokumen ini memuat 7 komponen utama:
1. **Kop Surat**: Nama Pemerintah Kabupaten/Kota, Dinas/Badan/Instansi, Alamat & Telepon.
2. **Tanggal & Tempat**: Titik mangsa surat permohonan.
3. **Tujuan Surat**: Kepada Yth. Kepala Dinas Komunikasi dan Informatika.
4. **Perihal & Pernyataan Permohonan**: "Dengan ini kami mengajukan pembuatan baru / pembaharuan / reset, coret yang tidak perlu."
5. **Data Permohonan**:
   - Tanda Tangan Elektronik: `[  ] Pembuatan Baru     [  ] Pembaharuan     [  ] Reset`
   - Atas Nama: `.......................................................`
   - Nama: `.......................................................`
   - Email Dinas: `.......................................................`
   - No HP User: `.......................................................`
   - No HP Narahubung: `.......................................................`
6. **Kalimat Penutup**: "Demikian surat permohonan dibuat atas kerja samanya, sekian terima kasih."
7. **Area Tanda Tangan**: Kolom tanda tangan pemohon tunggal.

*(Catatan: Formulir resmi tidak memuat field NIK, NIP, Jabatan, atau Unit Kerja tambahan di luar daftar di atas).*

---

## 6. Manajemen Sesi, Anti-Spam, dan Queue

### Sesi Percakapan (`src/state/sessionState.js`)
- **Penyimpanan In-Memory**: Sesi pengguna disimpan dalam RAM berbasis JID pengguna untuk performa tinggi tanpa dependensi database eksternal.
- **State Timeout (30 Menit)**: Sesi percakapan aktif selama 30 menit (1.800.000 ms) sejak pesan terakhir.
- **Pembersihan Otomatis (10 Menit)**: Timer otomatis dijalankan setiap 10 menit (600.000 ms) untuk membersihkan sesi yang kedaluwarsa.
- **Reset Navigasi (`0`)**: Pengguna dapat mengetik angka `0` dari submenu mana pun untuk kembali ke Menu Utama. Tindakan ini mereset posisi state menu pada bot **tanpa menghapus riwayat obrolan WhatsApp pengguna**.
- **Perlakuan Sesi Kedaluwarsa**: Jika sesi telah kedaluwarsa dan pengguna mengirim pesan baru, bot akan mereset state dan menampilkan pesan bahwa sesi telah berakhir lalu menyajikan Menu Utama kembali.

### Anti-Spam Rate Limiter (`src/utils/rateLimiter.js`)
- Menjaga nomor bot dari risiko pemblokiran WhatsApp akibat pengiriman pesan massal.
- Maksimal **5 pesan dalam jendela waktu 30 detik** per pengguna.
- Pesan ke-6 akan memicu 1 kali pesan peringatan ramah. Pesan ke-7 dan seterusnya dalam rentang 30 detik tersebut akan diabaikan secara hening (*silent discard*).

### Processing Queue & Delay Pengiriman
- **Processing Delay (`src/utils/processingManager.js`)**: Pesan beruntun dari pengguna yang sama diproses melalui antrean dengan jeda **1500 ms (1,5 detik)** untuk mencegah *race condition* dan benturan state navigasi.
- **Media Send Delay (`src/utils/sender.js`)**: Pengiriman media/gambar berurutan diberikan jeda **1000 ms (1 detik)** per gambar agar seluruh media diterima urut dan tidak membebani memori perangkat pengguna.

---

## 7. Rangkaian Pengujian Otomatis (Testing)

Proyek ini memiliki rangkaian uji otomatis yang memvalidasi seluruh fungsionalitas logika, handler, sesi, koneksi, hingga integrasi multi-agen.

### Perintah Pengujian:
```bash
# 1. Menjalankan Master Test Suite Aktif (Direkomendasikan)
npm test

# Atau menjalankan langsung skrip pengujian per tahap:
node tests/test-tahap2.js   # Uji Core Logic & Navigasi (21 skenario)
node tests/test-tahap3.js   # Uji Koneksi Baileys & Session (31 skenario)
node tests/test-tahap4.js   # Uji Menu Utama, Idle & Rate Limit (13 skenario)
node tests/test-tahap8.js   # Uji Master Komprehensif Seluruh Menu (95 skenario)
```

### Status Pengujian Aktif Sistem:
```text
-----------------------------------------------------------------
Test Suite                Status     Passed   Failed   Cakupan
-----------------------------------------------------------------
tests/test-tahap2.js      AKTIF        21        0     Core Logic, Navigasi 0, State Isolasi
tests/test-tahap3.js      AKTIF        31        0     Baileys Socket, QR, Lifecycle, Guards
tests/test-tahap4.js      AKTIF        13        0     Menu 1-4, Session Timeout, Rate Limiter
tests/test-tahap8.js      AKTIF        95        0     Master Suite 20 Skenario (Menu 1,2,3,4)
-----------------------------------------------------------------
TOTAL ACTIVE TEST                      160       0     100% LULUS (ZERO DEFECT)
-----------------------------------------------------------------
```

### Catatan Khusus Legacy Test (`tests/test-tahap7.js`):
- Berkas `tests/test-tahap7.js` adalah **arsip historis** dari Tahap 7 masa transisi saat Menu 2 dan Menu 3 masih berstatus "(Segera Hadir)".
- Hasil eksekusi historis mencatat **67 passed / 8 failed**. Kedelapan kegagalan tersebut murni disebabkan oleh assertion lama yang menuntut Menu 2 & 3 berstatus standby.
- Berkas ini **SENGAJA DIPERTAHANKAN** sebagai arsip jejak audit dan **TIDAK DIUBAH / DIHAPUS**.
- Skrip `npm test` telah dikonfigurasi resmi untuk mengeksekusi `tests/test-tahap8.js`.

---

## 8. Panduan Maintenance Mingguan

Administrator atau operator layanan wajib menjalankan pemeliharaan rutin mingguan untuk memastikan keandalan operasional chatbot:

### 📋 Checklist Pemeliharaan Mingguan (10 Langkah):

1. **Jalankan Test Otomatis**:
   Eksekusi perintah `npm test` pada terminal.
2. **Verifikasi Hasil Test**:
   Pastikan `test-tahap8.js` menghasilkan output **95 passed, 0 failed**.
3. **Lakukan Smoke Test WhatsApp Manual**:
   Kirim pesan dari nomor uji coba ke bot:
   - Pilih `1` (Pengajuan Baru) → Cek respons alur email dinas.
   - Pilih `2` (Pembaharuan) → Cek respons alur Expired dan Belum Expired.
   - Pilih `3` (Reset Passphrase) → Cek respons pembuka dan opsi panduan.
   - Pilih `4` (Live Agen) → Cek daftar nama kontak dan tautan wa.me.
   - Ketik `0` → Pastikan kembali ke Menu Utama secara mulus.
   - Kirim karakter acak (misal: `xyz`) → Pastikan bot merespons dengan pesan ramah.
4. **Verifikasi Pengiriman Media Dokumen & Gambar**:
   - Pastikan berkas formulir DOCX dapat diunduh dan dibuka.
   - Pastikan 8 gambar Menu 1 terkirim bertahap dengan jelas.
   - Pastikan gambar Menu 2 (4 foto) dan Menu 3 (2 foto) terkirim utuh.
5. **Periksa Stabilitas Koneksi Baileys**:
   Pastikan status koneksi terminal konsisten (`Bot terhubung ke WhatsApp!`) dan tidak mengalami perputaran koneksi (*reconnect loop*).
6. **Periksa Log Terminal Konsol**:
   Pastikan tidak ada galat yang berulang (*unhandled exceptions* atau log error merah).
7. **Periksa Validitas Konfigurasi (`src/config.js`)**:
   - Periksa apakah nomor dan tautan WhatsApp Pak Kris & Pak Jaya masih aktif.
   - Pastikan jam operasional dinas belum berubah.
   - Pastikan path dokumen dan berkas aset valid.
8. **Audit Integritas File Aset Fisik**:
   - Direktori `images/pengajuan/` (8 berkas).
   - Direktori `images/pembaruan/` (4 berkas).
   - Direktori `images/passphrase/` (2 berkas).
   - Direktori `docs/` (1 berkas DOCX formulir).
9. **Audit Keamanan & Kerahasiaan Sistem**:
   - Pastikan folder `auth_info/` tidak pernah diunggah ke repositori Git publik.
   - Pastikan folder `auth_info/` dan `node_modules/` tetap tercantum di `.gitignore`.
10. **Pencatatan Insiden (Log Insiden)**:
    Jika ditemukan kendala selama operasional mingguan, lakukan pencatatan ringkas mencakup:
    - Tanggal & Waktu Kejadian
    - Gejala / Masalah yang Terjadi
    - Akar Penyebab (*Root Cause*)
    - Tindakan Perbaikan (*Action Taken*)
    - Hasil Akhir Evaluasi

> [!CAUTION]
> **Peringatan Penting**: JANGAN PERNAH menguji mekanisme rate limiter secara agresif (mengirim spam ratusan pesan) menggunakan nomor pribadi maupun nomor resmi dinas di WhatsApp produksi, karena berisiko memicu sanksi pembatasan akun otomatis oleh pihak WhatsApp/Meta.

---

## 9. Panduan Instalasi & Menjalankan Bot

### Kebutuhan Sistem:
- **Node.js**: Versi `>= 18.0.0` (disarankan versi LTS).
- **NPM**: Versi `>= 9.0.0`.
- **Aplikasi WhatsApp**: Terinstal pada smartphone dengan nomor telepon dinas yang aktif.

### Langkah Instalasi:
```bash
# 1. Clone repositori ke komputer lokal / server
git clone https://github.com/Flmori/chatbot.git
cd chatbot-main

# 2. Instal seluruh dependensi
npm install

# 3. Jalankan pengujian verifikasi sistem
npm test

# 4. Jalankan bot WhatsApp
npm start
```

### Prosedur Login Pertama Kali:
1. Saat perintah `npm start` dijalankan pertama kali, terminal akan merender sebuah **Kode QR**.
2. Buka WhatsApp pada smartphone layanan Kominfo.
3. Buka **Perangkat Tertaut** (*Linked Devices*) → Ketuk **Tautkan Perangkat** (*Link a Device*).
4. Arahkan kamera smartphone ke Kode QR di layar terminal.
5. Setelah terhubung, kredensial sesi tersimpan otomatis pada folder `auth_info/`.
6. Untuk restart selanjutnya, bot akan login otomatis tanpa meminta pemindaian Kode QR ulang selama sesi masih aktif.

---
*Dokumentasi Resmi Sistem Layanan Bantuan Tanda Tangan Elektronik AMS — Dinas Komunikasi dan Informatika Kabupaten Blora.*
