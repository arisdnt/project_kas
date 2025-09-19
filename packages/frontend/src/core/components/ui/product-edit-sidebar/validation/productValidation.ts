import { ProductFormData, FormErrors } from '../types'

export const validateForm = (data: ProductFormData): FormErrors => {
  const errors: FormErrors = {}

  if (!data.nama.trim()) {
    errors.nama = "Nama produk wajib diisi"
  }

  if (!data.kode.trim()) {
    errors.kode = "Kode produk wajib diisi"
  }

  if (!data.kategori.trim()) {
    errors.kategori = "Kategori wajib dipilih"
  }

  if (!data.brand.trim()) {
    errors.brand = "Brand wajib diisi"
  }

  if (data.hargaBeli <= 0) {
    errors.hargaBeli = "Harga beli harus lebih dari 0"
  }

  if (data.hargaJual <= 0) {
    errors.hargaJual = "Harga jual harus lebih dari 0"
  }

  if (data.hargaJual <= data.hargaBeli) {
    errors.hargaJual = "Harga jual harus lebih tinggi dari harga beli"
  }

  if (data.stok < 0) {
    errors.stok = "Stok tidak boleh negatif"
  }

  if (!data.satuan.trim()) {
    errors.satuan = "Satuan wajib diisi"
  }

  return errors
}