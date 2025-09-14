/**
 * @interface InfoToko
 * @description Menyimpan informasi dasar mengenai toko atau tenant.
 */
export interface InfoToko {
  readonly nama: string;
  readonly alamat: string;
  readonly emailKontak: string;
  readonly teleponKontak: string;
}

/**
 * @interface KonfigurasiMataUang
 * @description Pengaturan terkait format mata uang yang digunakan.
 */
export interface KonfigurasiMataUang {
  readonly kode: string; // ISO code e.g., 'IDR', 'USD'
  readonly simbol: string; // e.g., 'Rp', '$'
  readonly posisiSimbol: 'prefix' | 'suffix';
}

/**
 * @interface KonfigurasiPajak
 * @description Pengaturan terkait pajak penjualan.
 */
export interface KonfigurasiPajak {
  readonly tarifDefault: number; // e.g., 0.11 for 11%
  readonly termasukDalamHarga: boolean;
}

/**
 * @interface KonfigurasiPrinter
 * @description Pengaturan untuk printer termal.
 */
export interface KonfigurasiPrinter {
  readonly nama: string;
  readonly tipe: 'network' | 'local';
  /**
   * Baris-baris teks yang tampil di bagian header struk.
   * Gunakan array untuk mengontrol setiap baris.
   */
  readonly teksHeader: readonly string[];
  /**
   * Baris-baris teks yang tampil di bagian footer struk.
   */
  readonly teksFooter: readonly string[];
}

/**
 * @interface KonfigurasiAplikasi
 * @description Interface utama yang menggabungkan semua konfigurasi aplikasi.
 */
export interface KonfigurasiAplikasi {
  readonly infoToko: InfoToko;
  readonly mataUang: KonfigurasiMataUang;
  readonly pajak: KonfigurasiPajak;
  readonly zonaWaktu: string; // e.g., 'Asia/Jakarta'
  readonly printer: KonfigurasiPrinter;
  readonly tenantId: string; // ID tenant untuk multi-tenancy
  readonly fileTypes?: {
    readonly images: readonly {
      readonly mimeType: string;
      readonly extensions: readonly string[];
      readonly maxSize?: number;
      readonly description: string;
    }[];
    readonly documents: readonly {
      readonly mimeType: string;
      readonly extensions: readonly string[];
      readonly maxSize?: number;
      readonly description: string;
    }[];
    readonly archives: readonly {
      readonly mimeType: string;
      readonly extensions: readonly string[];
      readonly maxSize?: number;
      readonly description: string;
    }[];
    readonly videos: readonly {
      readonly mimeType: string;
      readonly extensions: readonly string[];
      readonly maxSize?: number;
      readonly description: string;
    }[];
    readonly audio: readonly {
      readonly mimeType: string;
      readonly extensions: readonly string[];
      readonly maxSize?: number;
      readonly description: string;
    }[];
  };
  readonly ui?: {
    readonly login?: {
      readonly heading: string;
      readonly subheading: string;
      readonly welcomeLines: readonly string[];
      readonly footerText?: string;
      readonly showStoreInfo?: boolean;
    };
  };
  readonly api: {
    readonly url: string;
    readonly port: number;
  };
  readonly jwt: {
    readonly secret: string;
    readonly expiresIn: string;
  };
}
