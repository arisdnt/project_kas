import type { KonfigurasiAplikasi } from './schema';

// Catatan: Mengikuti blueprint, konfigurasi didefinisikan dalam TypeScript
// dan diekspor sebagai objek immutable untuk keamanan tipe dan konsistensi.

// Dapat dikembangkan untuk memuat config spesifik environment jika diperlukan.
// Misal dengan Vite env: import.meta.env.MODE
const MODE = (import.meta as any).env?.MODE ?? 'development';

const baseConfig = {
  infoToko: {
    nama: 'KasirPro',
    alamat: 'Jl. Contoh No. 123, Jakarta',
    emailKontak: 'support@kasirpro.local',
    teleponKontak: '+62-812-0000-0000',
  },
  mataUang: {
    kode: 'IDR',
    simbol: 'Rp',
    posisiSimbol: 'prefix',
  },
  pajak: {
    tarifDefault: 0.11,
    termasukDalamHarga: true,
  },
  zonaWaktu: 'Asia/Jakarta',
  printer: {
    nama: 'EPSON-TM-T82',
    tipe: 'network',
    teksHeader: [
      'KasirPro - Struk Resmi',
      'Jl. Contoh No. 123, Jakarta',
      'Telp: +62-812-0000-0000',
    ],
    teksFooter: [
      'Terima kasih atas kunjungan Anda!',
      'Barang yang sudah dibeli tidak dapat ditukar/kembali',
      'Follow kami @kasirpro',
    ],
  },
  ui: {
    login: {
      heading: 'Masuk ke KasirPro',
      subheading: 'Selamat datang, silakan autentikasi untuk melanjutkan',
      welcomeLines: [
        'Identitas Toko:',
        'KasirPro - Point of Sale System',
        'Siap melayani dengan cepat dan akurat',
      ],
      footerText: '© ' + new Date().getFullYear() + ' KasirPro. All rights reserved.',
      showStoreInfo: true,
    },
  },
  api: {
    url: MODE === 'production' ? 'https://api.kasirpro.local' : 'http://localhost',
    port: MODE === 'production' ? 443 : 3000,
  },
  jwt: {
    secret: 'dev-secret-change-me-please-xxxxxxxxxxxxxxxx',
    expiresIn: '1d',
  },
  fileTypes: {
    images: [
      {
        mimeType: 'image/jpeg',
        extensions: ['.jpg', '.jpeg'],
        maxSize: 5 * 1024 * 1024,
        description: 'JPEG Image'
      },
      {
        mimeType: 'image/png',
        extensions: ['.png'],
        maxSize: 5 * 1024 * 1024,
        description: 'PNG Image'
      },
      {
        mimeType: 'image/webp',
        extensions: ['.webp'],
        maxSize: 5 * 1024 * 1024,
        description: 'WebP Image'
      },
      {
        mimeType: 'image/gif',
        extensions: ['.gif'],
        maxSize: 10 * 1024 * 1024,
        description: 'GIF Image'
      },
      {
        mimeType: 'image/svg+xml',
        extensions: ['.svg'],
        maxSize: 1 * 1024 * 1024,
        description: 'SVG Vector Image'
      }
    ],
    documents: [
      {
        mimeType: 'application/pdf',
        extensions: ['.pdf'],
        maxSize: 20 * 1024 * 1024,
        description: 'PDF Document'
      },
      {
        mimeType: 'application/msword',
        extensions: ['.doc'],
        maxSize: 10 * 1024 * 1024,
        description: 'Microsoft Word Document (Legacy)'
      },
      {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extensions: ['.docx'],
        maxSize: 10 * 1024 * 1024,
        description: 'Microsoft Word Document'
      },
      {
        mimeType: 'application/vnd.ms-excel',
        extensions: ['.xls'],
        maxSize: 10 * 1024 * 1024,
        description: 'Microsoft Excel Spreadsheet (Legacy)'
      },
      {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extensions: ['.xlsx'],
        maxSize: 10 * 1024 * 1024,
        description: 'Microsoft Excel Spreadsheet'
      },
      {
        mimeType: 'text/plain',
        extensions: ['.txt'],
        maxSize: 1 * 1024 * 1024,
        description: 'Plain Text File'
      },
      {
        mimeType: 'text/csv',
        extensions: ['.csv'],
        maxSize: 5 * 1024 * 1024,
        description: 'CSV File'
      }
    ],
    archives: [
      {
        mimeType: 'application/zip',
        extensions: ['.zip'],
        maxSize: 50 * 1024 * 1024,
        description: 'ZIP Archive'
      },
      {
        mimeType: 'application/x-rar-compressed',
        extensions: ['.rar'],
        maxSize: 50 * 1024 * 1024,
        description: 'RAR Archive'
      }
    ],
    videos: [
      {
        mimeType: 'video/mp4',
        extensions: ['.mp4'],
        maxSize: 100 * 1024 * 1024,
        description: 'MP4 Video'
      },
      {
        mimeType: 'video/webm',
        extensions: ['.webm'],
        maxSize: 100 * 1024 * 1024,
        description: 'WebM Video'
      }
    ],
    audio: [
      {
        mimeType: 'audio/mpeg',
        extensions: ['.mp3'],
        maxSize: 20 * 1024 * 1024,
        description: 'MP3 Audio'
      },
      {
        mimeType: 'audio/wav',
        extensions: ['.wav'],
        maxSize: 50 * 1024 * 1024,
        description: 'WAV Audio'
      }
    ]
  },
} as const satisfies KonfigurasiAplikasi;

export const config: KonfigurasiAplikasi = baseConfig;

export type { KonfigurasiAplikasi } from './schema';
