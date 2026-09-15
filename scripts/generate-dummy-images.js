/**
 * Script untuk generate 16 gambar dummy placeholder.
 *
 * Setiap gambar memiliki:
 * - Warna background berbeda (agar mudah dibedakan saat testing)
 * - Teks "DEMO / SIMULASI" dan "BUKAN TAMPILAN RESMI AMS"
 * - Nama langkah yang jelas
 *
 * Jalankan: npm run generate-images
 *
 * Nantinya file-file ini diganti dengan screenshot resmi AMS
 * tanpa mengubah nama file atau logic chatbot.
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// ============================================================
// Definisi 16 gambar dummy
// Setiap gambar punya warna unik agar mudah dibedakan
// ============================================================
const images = [
  // --- Cover ---
  {
    dir: 'cover',
    file: '00_panduan_ams.jpg',
    label: 'Cover Panduan AMS',
    sublabel: 'Selamat datang di Layanan Bantuan AMS',
    bgColor: '#1A1A2E',
    accentColor: '#E94560',
  },

  // --- Pengajuan Baru (5 gambar, nuansa biru) ---
  {
    dir: 'pengajuan',
    file: '01_menu_permohonan_baru.jpg',
    label: 'Langkah 1: Menu Permohonan Baru',
    sublabel: 'Sertifikat Saya → Permohonan Baru → eSign',
    bgColor: '#0A2647',
    accentColor: '#2E86DE',
  },
  {
    dir: 'pengajuan',
    file: '02_konfirmasi_data.jpg',
    label: 'Langkah 2: Konfirmasi Data',
    sublabel: 'Periksa dan konfirmasi data pemohon',
    bgColor: '#0D3B66',
    accentColor: '#48AAFF',
  },
  {
    dir: 'pengajuan',
    file: '03_pengecekan_foto.jpg',
    label: 'Langkah 3: Pengecekan Foto',
    sublabel: 'Upload dan verifikasi foto pemohon',
    bgColor: '#144D7F',
    accentColor: '#54B4FF',
  },
  {
    dir: 'pengajuan',
    file: '04_buat_passphrase.jpg',
    label: 'Langkah 4: Buat Passphrase',
    sublabel: 'Buat passphrase untuk sertifikat digital',
    bgColor: '#1B5F98',
    accentColor: '#6EC6FF',
  },
  {
    dir: 'pengajuan',
    file: '05_submit_pengajuan.jpg',
    label: 'Langkah 5: Submit Pengajuan',
    sublabel: 'Kirim pengajuan sertifikat baru',
    bgColor: '#2271B1',
    accentColor: '#84D2FF',
  },

  // --- Pembaruan (5 gambar, nuansa hijau) ---
  {
    dir: 'pembaruan',
    file: '01_daftar_sertifikat.jpg',
    label: 'Langkah 1: Daftar Sertifikat',
    sublabel: 'Buka daftar sertifikat Anda',
    bgColor: '#0B3D0B',
    accentColor: '#27AE60',
  },
  {
    dir: 'pembaruan',
    file: '02_permohonan_pembaruan.jpg',
    label: 'Langkah 2: Permohonan Pembaruan',
    sublabel: 'Pilih sertifikat yang akan diperbarui',
    bgColor: '#0F4F0F',
    accentColor: '#2ECC71',
  },
  {
    dir: 'pembaruan',
    file: '03_konfirmasi_pembaruan.jpg',
    label: 'Langkah 3: Konfirmasi Pembaruan',
    sublabel: 'Konfirmasi data pembaruan sertifikat',
    bgColor: '#136113',
    accentColor: '#55D98D',
  },
  {
    dir: 'pembaruan',
    file: '04_set_passphrase.jpg',
    label: 'Langkah 4: Set Passphrase',
    sublabel: 'Buat passphrase baru untuk sertifikat',
    bgColor: '#177317',
    accentColor: '#7CE5A9',
  },
  {
    dir: 'pembaruan',
    file: '05_pembaruan_selesai.jpg',
    label: 'Langkah 5: Pembaruan Selesai',
    sublabel: 'Proses pembaruan sertifikat berhasil',
    bgColor: '#1B851B',
    accentColor: '#A3F0C5',
  },

  // --- Reset Passphrase (5 gambar, nuansa ungu) ---
  {
    dir: 'passphrase',
    file: '01_daftar_sertifikat.jpg',
    label: 'Langkah 1: Daftar Sertifikat',
    sublabel: 'Buka daftar sertifikat Anda',
    bgColor: '#2D1B4E',
    accentColor: '#9B59B6',
  },
  {
    dir: 'passphrase',
    file: '02_pilih_reset_passphrase.jpg',
    label: 'Langkah 2: Pilih Reset Passphrase',
    sublabel: 'Pilih opsi Reset Passphrase pada sertifikat',
    bgColor: '#3A2266',
    accentColor: '#AF6FCF',
  },
  {
    dir: 'passphrase',
    file: '03_link_reset_email.jpg',
    label: 'Langkah 3: Link Reset via Email',
    sublabel: 'Cek email untuk link reset passphrase',
    bgColor: '#47297E',
    accentColor: '#C385E8',
  },
  {
    dir: 'passphrase',
    file: '04_pengecekan_foto.jpg',
    label: 'Langkah 4: Pengecekan Foto',
    sublabel: 'Upload dan verifikasi foto pemohon',
    bgColor: '#543096',
    accentColor: '#D79BFF',
  },
  {
    dir: 'passphrase',
    file: '05_buat_passphrase.jpg',
    label: 'Langkah 5: Buat Passphrase Baru',
    sublabel: 'Buat passphrase baru untuk sertifikat',
    bgColor: '#6137AE',
    accentColor: '#EBB1FF',
  },
];

// ============================================================
// Fungsi untuk membuat satu gambar dummy menggunakan Sharp + SVG
// ============================================================
async function createDummyImage(imgDef) {
  const width = 800;
  const height = 600;

  // Escape karakter khusus XML untuk teks
  const escapeXml = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const label = escapeXml(imgDef.label);
  const sublabel = escapeXml(imgDef.sublabel);
  const filename = escapeXml(imgDef.file);
  const category = escapeXml(imgDef.dir.toUpperCase());

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="${imgDef.bgColor}"/>

      <!-- Border frame -->
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}"
            rx="16" fill="none" stroke="${imgDef.accentColor}" stroke-width="2"
            opacity="0.5"/>

      <!-- Inner card -->
      <rect x="50" y="50" width="${width - 100}" height="${height - 100}"
            rx="12" fill="rgba(0,0,0,0.35)"/>

      <!-- Category badge -->
      <rect x="300" y="80" width="200" height="30" rx="15"
            fill="${imgDef.accentColor}" opacity="0.8"/>
      <text x="400" y="101" text-anchor="middle"
            font-family="Arial, Helvetica, sans-serif" font-size="14"
            font-weight="bold" fill="white">${category}</text>

      <!-- Main title -->
      <text x="400" y="190" text-anchor="middle"
            font-family="Arial, Helvetica, sans-serif" font-size="40"
            font-weight="bold" fill="white">DEMO / SIMULASI</text>

      <!-- Subtitle -->
      <text x="400" y="235" text-anchor="middle"
            font-family="Arial, Helvetica, sans-serif" font-size="18"
            fill="rgba(255,255,255,0.7)">BUKAN TAMPILAN RESMI AMS</text>

      <!-- Divider line -->
      <line x1="200" y1="275" x2="600" y2="275"
            stroke="${imgDef.accentColor}" stroke-width="2" opacity="0.6"/>

      <!-- Step label -->
      <text x="400" y="340" text-anchor="middle"
            font-family="Arial, Helvetica, sans-serif" font-size="24"
            font-weight="bold" fill="${imgDef.accentColor}">${label}</text>

      <!-- Step description -->
      <text x="400" y="380" text-anchor="middle"
            font-family="Arial, Helvetica, sans-serif" font-size="16"
            fill="rgba(255,255,255,0.6)">${sublabel}</text>

      <!-- Placeholder icon area -->
      <rect x="300" y="410" width="200" height="80" rx="8"
            fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)"
            stroke-width="1" stroke-dasharray="8,4"/>
      <text x="400" y="458" text-anchor="middle"
            font-family="Arial, Helvetica, sans-serif" font-size="14"
            fill="rgba(255,255,255,0.3)">[ Screenshot AMS ]</text>

      <!-- Filename footer -->
      <text x="400" y="530" text-anchor="middle"
            font-family="monospace" font-size="12"
            fill="rgba(255,255,255,0.35)">${filename}</text>
    </svg>
  `;

  // Buat direktori jika belum ada
  const outputDir = path.join(__dirname, '..', 'images', imgDef.dir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, imgDef.file);

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 85 })
    .toFile(outputPath);

  return outputPath;
}

// ============================================================
// Main — generate semua gambar
// ============================================================
async function main() {
  console.log('');
  console.log('='.repeat(50));
  console.log('🖼️  Generating Dummy Images untuk Chatbot AMS');
  console.log('='.repeat(50));
  console.log('');

  let success = 0;
  let failed = 0;

  for (const imgDef of images) {
    try {
      const outputPath = await createDummyImage(imgDef);
      console.log(`  ✅ ${imgDef.dir}/${imgDef.file}`);
      success++;
    } catch (err) {
      console.error(`  ❌ ${imgDef.dir}/${imgDef.file} — ${err.message}`);
      failed++;
    }
  }

  console.log('');
  console.log('-'.repeat(50));
  console.log(`📊 Hasil: ${success} berhasil, ${failed} gagal (total: ${images.length})`);
  console.log('');

  if (failed === 0) {
    console.log('✅ Semua gambar dummy berhasil dibuat!');
    console.log('   Gambar tersimpan di folder: images/');
    console.log('');
    console.log('💡 Untuk mengganti dengan screenshot resmi AMS:');
    console.log('   1. Replace file di folder images/ dengan nama yang sama');
    console.log('   2. Tidak perlu mengubah kode chatbot');
  } else {
    console.log('⚠️  Beberapa gambar gagal dibuat. Periksa error di atas.');
  }
  console.log('');
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
