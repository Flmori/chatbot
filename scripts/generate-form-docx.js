/**
 * Script: generate-form-docx.js
 *
 * Menghasilkan Formulir Surat Permohonan Tanda Tangan Elektronik AMS
 * Sesuai requirement client (sederhana & tanpa field berlebih).
 *
 * Jalankan: node scripts/generate-form-docx.js
 */

const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  UnderlineType,
} = require('docx');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'Formulir_Permohonan_Sertifikat_Elektronik_AMS.docx');

async function generateForm() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134,
              bottom: 1134,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // 1. KOP SURAT
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [
              new TextRun({
                text: 'PEMERINTAH KABUPATEN / KOTA ....................',
                bold: true,
                size: 26,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [
              new TextRun({
                text: 'DINAS / BADAN / INSTANSI ....................',
                bold: true,
                size: 26,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [
              new TextRun({
                text: 'Alamat: Jl. ................................................. Telp. (0XXX) XXXXXXX',
                size: 20,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 80, after: 200 },
            border: {
              bottom: {
                style: BorderStyle.SINGLE,
                size: 12,
                color: '000000',
              },
            },
            children: [],
          }),

          // 2. TANGGAL & KEPADA
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: '.................., .... .................. 20....',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 0 },
            children: [
              new TextRun({
                text: 'Kepada Yth.',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 0 },
            children: [
              new TextRun({
                text: 'Kepala Dinas Komunikasi dan Informatika',
                bold: true,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'di Tempat',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),

          // PERIHAL
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Perihal: Permohonan Tanda Tangan Elektronik',
                bold: true,
                size: 24,
                font: 'Times New Roman',
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
          }),

          // 3. ISI SURAT
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: 'Dengan hormat,',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Dengan ini kami mengajukan pembuatan baru / pembaharuan / reset, coret yang tidak perlu.',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),

          // 4. DATA PEMOHON
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: 'Adapun data permohonan sebagai berikut:',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            indent: { left: 360 },
            children: [
              new TextRun({
                text: 'Tanda Tangan Elektronik :  [  ] Pembuatan Baru     [  ] Pembaharuan     [  ] Reset',
                bold: true,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            indent: { left: 360 },
            children: [
              new TextRun({
                text: 'Atas Nama                 :  ....................................................................................',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            indent: { left: 360 },
            children: [
              new TextRun({
                text: 'Nama                      :  ....................................................................................',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            indent: { left: 360 },
            children: [
              new TextRun({
                text: 'Email Dinas               :  ....................................................................................',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            indent: { left: 360 },
            children: [
              new TextRun({
                text: 'No HP User                :  ....................................................................................',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 250 },
            indent: { left: 360 },
            children: [
              new TextRun({
                text: 'No HP Narahubung          :  ....................................................................................',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),

          // 5. PENUTUP
          new Paragraph({
            spacing: { after: 350 },
            children: [
              new TextRun({
                text: 'Demikian surat permohonan dibuat atas kerja samanya, sekian terima kasih.',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),

          // 6. AREA TANDA TANGAN PEMOHON TUNGGAL
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: 'Pemohon,',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 0 }, children: [] }),
          new Paragraph({ spacing: { after: 0 }, children: [] }),
          new Paragraph({ spacing: { after: 0 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 700, after: 0 },
            children: [
              new TextRun({
                text: '( .............................................................. )',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_FILE, buffer);
  console.log('✅ Formulir berhasil dibuat:', OUTPUT_FILE);
}

generateForm().catch(console.error);
