export type DateRange = {
  start: Date;
  end: Date;
};

export type LedgerEntry = {
  id: string;
  date: string; // ISO
  nomor: string;
  deskripsi?: string;
  masuk: number;
  keluar: number;
  saldo?: number;
  metode?: string;
};

export type ProfitLoss = {
  pendapatan: number;
  hpp: number; // harga pokok penjualan (COGS)
  labaKotor: number;
};

export type KeuanganFilter = {
  preset: 'hari-ini' | 'minggu-ini' | 'bulan-ini' | 'tahun-ini' | 'kustom';
  range: DateRange;
};

