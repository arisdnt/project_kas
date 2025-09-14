/**
 * Model Produk dan Validasi
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { z } from 'zod';

// Schema untuk Kategori
export const KategoriSchema = z.object({
  id: z.string().uuid().optional(),
  nama: z.string().min(1, 'Nama kategori harus diisi').max(255, 'Nama kategori terlalu panjang')
});

// Schema untuk Brand
export const BrandSchema = z.object({
  id: z.string().uuid().optional(),
  nama: z.string().min(1, 'Nama brand harus diisi').max(255, 'Nama brand terlalu panjang')
});

// Schema untuk Supplier
export const SupplierSchema = z.object({
  id: z.string().uuid().optional(),
  nama: z.string().min(1, 'Nama supplier harus diisi').max(255, 'Nama supplier terlalu panjang'),
  kontak_person: z.string().max(255, 'Nama kontak terlalu panjang').optional(),
  email: z.string().email('Format email tidak valid').max(255, 'Email terlalu panjang').optional(),
  telepon: z.string().max(50, 'Nomor telepon terlalu panjang').optional(),
  alamat: z.string().optional(),
  dibuat_pada: z.date().optional(),
  diperbarui_pada: z.date().optional()
});

// Schema untuk Produk
export const ProdukSchema = z.object({
  id: z.string().uuid().optional(),
  nama: z.string().min(1, 'Nama produk harus diisi').max(255, 'Nama produk terlalu panjang'),
  satuan: z.string().max(50, 'Satuan terlalu panjang').optional(),
  kategori_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  kode: z.string().max(50, 'Kode terlalu panjang').optional(),
  harga_beli: z.number().min(0, 'Harga beli tidak boleh negatif').optional(),
  harga_jual: z.number().min(0, 'Harga jual tidak boleh negatif').optional(),
  margin_persen: z.number().min(0, 'Margin persen tidak boleh negatif').optional(),
  dibuat_pada: z.date().optional(),
  diperbarui_pada: z.date().optional()
});

// Schema untuk Inventaris
export const InventarisSchema = z.object({
  id_toko: z.string().uuid(),
  id_produk: z.string().uuid(),
  stok_tersedia: z.number().int().min(0, 'Stok tersedia tidak boleh negatif').default(0),
  stok_reserved: z.number().int().min(0, 'Stok reserved tidak boleh negatif').default(0),
  harga_jual_toko: z.number().positive('Harga jual toko harus lebih dari 0').optional(),
  stok_minimum_toko: z.number().int().min(0, 'Stok minimum tidak boleh negatif').default(0).optional(),
  lokasi_rak: z.string().max(50, 'Lokasi rak terlalu panjang').optional(),
  terakhir_update: z.date().optional()
});

// Schema untuk Create Produk (tanpa id dan timestamp)
export const CreateProdukSchema = ProdukSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

// Schema untuk Update Produk (semua field opsional kecuali id)
export const UpdateProdukSchema = ProdukSchema.partial().required({ id: true });

// Schema untuk Create Kategori
export const CreateKategoriSchema = KategoriSchema.omit({ id: true });

// Schema untuk Update Kategori
export const UpdateKategoriSchema = KategoriSchema.partial().required({ id: true });

// Schema untuk Create Brand
export const CreateBrandSchema = BrandSchema.omit({ id: true });

// Schema untuk Update Brand
export const UpdateBrandSchema = BrandSchema.partial().required({ id: true });

// Schema untuk Create Supplier
export const CreateSupplierSchema = SupplierSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

// Schema untuk Update Supplier
export const UpdateSupplierSchema = SupplierSchema.partial().required({ id: true });

// Schema untuk Create/Update Inventaris
export const CreateInventarisSchema = InventarisSchema.omit({ terakhir_update: true });
export const UpdateInventarisSchema = InventarisSchema.partial().required({
  id_toko: true,
  id_produk: true
});

// Schema untuk Query Parameters
export const ProdukQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive().max(1000)).default('10'),
  search: z.string().optional(),
  kategori: z.string().uuid().optional(),
  brand: z.string().uuid().optional(),
  supplier: z.string().uuid().optional()
});

// Types
export type Kategori = z.infer<typeof KategoriSchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type Supplier = z.infer<typeof SupplierSchema>;
export type Produk = z.infer<typeof ProdukSchema>;
export type Inventaris = z.infer<typeof InventarisSchema>;
export type CreateProduk = z.infer<typeof CreateProdukSchema>;
export type UpdateProduk = z.infer<typeof UpdateProdukSchema>;
export type CreateKategori = z.infer<typeof CreateKategoriSchema>;
export type UpdateKategori = z.infer<typeof UpdateKategoriSchema>;
export type CreateBrand = z.infer<typeof CreateBrandSchema>;
export type UpdateBrand = z.infer<typeof UpdateBrandSchema>;
export type CreateSupplier = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplier = z.infer<typeof UpdateSupplierSchema>;
export type CreateInventaris = z.infer<typeof CreateInventarisSchema>;
export type UpdateInventaris = z.infer<typeof UpdateInventarisSchema>;
export type ProdukQuery = z.infer<typeof ProdukQuerySchema>;

// Interface untuk response dengan relasi
export interface ProdukWithRelations extends Produk {
  kategori?: Kategori;
  brand?: Brand;
  supplier?: Supplier;
  inventaris?: Inventaris[];
}

export interface InventarisWithProduk extends Inventaris {
  produk?: ProdukWithRelations;
}
