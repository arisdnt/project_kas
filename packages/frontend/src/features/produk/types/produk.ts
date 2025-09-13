export interface Kategori {
  id: number;
  nama: string;
}

export interface Brand {
  id: number;
  nama: string;
}

export interface Supplier {
  id: number;
  nama: string;
  kontakPerson?: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface Produk {
  id: number;
  nama: string;
  deskripsi?: string;
  sku?: string;
  idKategori?: number;
  idBrand?: number;
  idSupplier?: number;
  dibuatPada: string;
  diperbaruiPada: string;
  kategori?: Kategori;
  brand?: Brand;
  supplier?: Supplier;
}

export interface Inventaris {
  idToko: number;
  idProduk: number;
  jumlah: number;
  harga: number;
  hargaBeli?: number;
  diperbaruiPada: string;
  produk?: Produk;
}

export interface CreateProdukRequest {
  nama: string;
  deskripsi?: string;
  sku?: string;
  idKategori?: number;
  idBrand?: number;
  idSupplier?: number;
}

export interface UpdateProdukRequest extends Partial<CreateProdukRequest> {
  id: number;
}

export interface ProdukResponse {
  success: boolean;
  data: Produk | Produk[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}