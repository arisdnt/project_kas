import { StokItem, StokSummary, StokMutasi, StokMovementData } from '../types/stok'

export const sampleStokData: StokItem[] = [
  {
    id: 1,
    produkId: 101,
    namaProduk: 'Indomie Goreng',
    sku: 'IND-001',
    kategori: 'Makanan',
    brand: 'Indomie',
    supplier: 'PT. Indofood',
    jumlahStok: 150,
    nilaiStok: 750000,
    hargaBeli: 2500,
    hargaJual: 3500,
    satuan: 'pcs',
    lokasi: 'Rak A-1',
    statusStok: 'tersedia',
    terakhirDiperbarui: new Date('2024-01-15'),
    dipindahPada: null
  },
  {
    id: 2,
    produkId: 102,
    namaProduk: 'Teh Botol Sosro',
    sku: 'TEH-001',
    kategori: 'Minuman',
    brand: 'Sosro',
    supplier: 'PT. Sinar Sosro',
    jumlahStok: 25,
    nilaiStok: 250000,
    hargaBeli: 8000,
    hargaJual: 10000,
    satuan: 'botol',
    lokasi: 'Rak B-2',
    statusStok: 'sedikit',
    terakhirDiperbarui: new Date('2024-01-14'),
    dipindahPada: new Date('2024-01-10')
  },
  {
    id: 3,
    produkId: 103,
    namaProduk: 'Sabun Lifebuoy',
    sku: 'SAB-001',
    kategori: 'Perawatan Tubuh',
    brand: 'Lifebuoy',
    supplier: 'PT. Unilever',
    jumlahStok: 0,
    nilaiStok: 0,
    hargaBeli: 15000,
    hargaJual: 20000,
    satuan: 'pcs',
    lokasi: 'Rak C-3',
    statusStok: 'habis',
    terakhirDiperbarui: new Date('2024-01-13'),
    dipindahPada: null
  },
  {
    id: 4,
    produkId: 104,
    namaProduk: 'Beras 5kg',
    sku: 'BER-001',
    kategori: 'Sembako',
    brand: 'Raja Lele',
    supplier: 'PT. Raja Lele',
    jumlahStok: 85,
    nilaiStok: 1275000,
    hargaBeli: 12000,
    hargaJual: 15000,
    satuan: 'kg',
    lokasi: 'Gudang 1',
    statusStok: 'tersedia',
    terakhirDiperbarui: new Date('2024-01-15'),
    dipindahPada: new Date('2024-01-12')
  },
  {
    id: 5,
    produkId: 105,
    namaProduk: 'Minyak Goreng',
    sku: 'MIN-001',
    kategori: 'Sembako',
    brand: 'Bimoli',
    supplier: 'PT. Salim Ivomas',
    jumlahStok: 200,
    nilaiStok: 4000000,
    hargaBeli: 18000,
    hargaJual: 22000,
    satuan: 'ml',
    lokasi: 'Rak D-1',
    statusStok: 'berlebih',
    terakhirDiperbarui: new Date('2024-01-15'),
    dipindahPada: null
  },
  {
    id: 6,
    produkId: 106,
    namaProduk: 'Kecap ABC',
    sku: 'KEC-001',
    kategori: 'Bumbu Dapur',
    brand: 'ABC',
    supplier: 'PT. Heinz ABC',
    jumlahStok: 8,
    nilaiStok: 80000,
    hargaBeli: 9500,
    hargaJual: 12000,
    satuan: 'botol',
    lokasi: 'Rak E-2',
    statusStok: 'sedikit',
    terakhirDiperbarui: new Date('2024-01-14'),
    dipindahPada: null
  }
]

export const sampleStokSummary: StokSummary = {
  totalProduk: 6,
  totalNilaiStok: 6355000,
  produkHabis: 1,
  produkSedikit: 2,
  produkBerlebih: 1,
  kategoriTersering: ['Sembako', 'Makanan'],
  brandTersering: ['Indomie', 'Sosro']
}

export const sampleStokMutasi: StokMutasi[] = [
  {
    id: 1,
    produkId: 101,
    namaProduk: 'Indomie Goreng',
    jenisMutasi: 'masuk',
    jumlah: 50,
    keterangan: 'Pembelian dari supplier',
    tanggal: new Date('2024-01-15'),
    pengguna: 'Admin',
    referensi: 'PO-2024-001'
  },
  {
    id: 2,
    produkId: 102,
    namaProduk: 'Teh Botol Sosro',
    jenisMutasi: 'keluar',
    jumlah: 5,
    keterangan: 'Penjualan kepada pelanggan',
    tanggal: new Date('2024-01-14'),
    pengguna: 'Kasir',
    referensi: 'TRX-2024-001'
  },
  {
    id: 3,
    produkId: 103,
    namaProduk: 'Sabun Lifebuoy',
    jenisMutasi: 'penyesuaian',
    jumlah: -10,
    keterangan: 'Penyesuaian stok karena kerusakan',
    tanggal: new Date('2024-01-13'),
    pengguna: 'Gudang',
    referensi: 'ADJ-2024-001'
  }
]