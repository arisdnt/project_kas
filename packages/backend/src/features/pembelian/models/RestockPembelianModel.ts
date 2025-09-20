import { z } from 'zod';

/**
 * Schema dan tipe untuk permintaan restok cepat (tanpa dokumen transaksi lengkap)
 */
export const RestockItemSchema = z.object({
  produkId: z.string({ required_error: 'Produk ID wajib diisi' }).uuid('Produk ID harus berupa UUID yang valid'),
  qty: z
    .number({ required_error: 'Kuantitas wajib diisi' })
    .int('Kuantitas harus bilangan bulat')
    .positive('Kuantitas harus lebih dari 0'),
  hargaBeli: z
    .number({ invalid_type_error: 'Harga beli harus berupa angka' })
    .min(0, 'Harga beli tidak boleh kurang dari 0')
    .optional(),
});

export const RestockPembelianRequestSchema = z.object({
  items: z.array(RestockItemSchema).min(1, 'Minimal satu produk diperlukan untuk restok'),
  supplierId: z.string().uuid('Supplier ID harus berupa UUID yang valid').optional(),
  catatan: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
});

export type RestockItem = z.infer<typeof RestockItemSchema>;
export type RestockPembelianRequest = z.infer<typeof RestockPembelianRequestSchema>;
