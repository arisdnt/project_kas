/**
 * Product Service Orchestrator
 * Main service that coordinates product operations across modules
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchProdukQuery, CreateProduk, UpdateProduk } from '../models/ProdukCore';
import { InventarisQuery, CreateInventaris, UpdateInventaris } from '../models/InventarisModel';
import { ProdukQueryService } from './modules/ProdukQueryService';
import { ProdukMutationService } from './modules/ProdukMutationService';
import { InventarisService } from './modules/InventarisService';
import { MasterDataService } from './modules/MasterDataService';

export class ProdukService {
  // Product query operations
  static async search(scope: AccessScope, query: SearchProdukQuery) {
    return ProdukQueryService.search(scope, query);
  }

  static async findById(scope: AccessScope, id: string) {
    const product = await ProdukQueryService.findById(scope, id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  // Product mutation operations
  static async create(scope: AccessScope, data: CreateProduk) {
    // Validate unique code
    const codeExists = await ProdukMutationService.checkCodeExists(scope, data.kode);
    if (codeExists) {
      throw new Error('Product code already exists');
    }

    const product = await ProdukMutationService.create(scope, data);

    // Initialize inventory if store is specified
    if (scope.storeId || data.toko_id) {
      const inventoryData: CreateInventaris = {
        produk_id: product.id,
        toko_id: scope.storeId || data.toko_id!,
        stok_tersedia: 0,
        stok_reserved: 0,
        stok_minimum_toko: data.stok_minimum || 0
      };
      await InventarisService.createStock(scope, inventoryData);
    }

    return product;
  }

  static async update(scope: AccessScope, id: string, data: UpdateProduk) {
    // Validate unique code if being updated
    if (data.kode) {
      const codeExists = await ProdukMutationService.checkCodeExists(scope, data.kode, id);
      if (codeExists) {
        throw new Error('Product code already exists');
      }
    }

    return ProdukMutationService.update(scope, id, data);
  }

  static async delete(scope: AccessScope, id: string) {
    return ProdukMutationService.delete(scope, id);
  }

  // Inventory operations
  static async getInventory(scope: AccessScope, query: InventarisQuery) {
    return InventarisService.search(scope, query);
  }

  static async createInventory(scope: AccessScope, data: CreateInventaris) {
    return InventarisService.createStock(scope, data);
  }

  static async updateInventory(scope: AccessScope, produkId: string, tokoId: string, data: UpdateInventaris) {
    return InventarisService.updateStock(scope, produkId, tokoId, data);
  }

  static async getProductInventory(scope: AccessScope, produkId: string, tokoId: string) {
    return InventarisService.getByProductAndStore(scope, produkId, tokoId);
  }

  // Master data operations
  static async getCategories(scope: AccessScope) {
    return MasterDataService.getCategories(scope);
  }

  static async createCategory(scope: AccessScope, data: {
    nama: string;
    deskripsi?: string;
    icon_url?: string;
    urutan?: number;
  }) {
    return MasterDataService.createCategory(scope, data);
  }

  static async updateCategory(scope: AccessScope, id: string, data: {
    nama?: string;
    deskripsi?: string;
    icon_url?: string;
    urutan?: number;
    status?: string;
  }) {
    return MasterDataService.updateCategory(scope, id, data);
  }

  static async deleteCategory(scope: AccessScope, id: string) {
    return MasterDataService.deleteCategory(scope, id);
  }

  static async getBrands(scope: AccessScope) {
    return MasterDataService.getBrands(scope);
  }

  static async createBrand(scope: AccessScope, data: {
    nama: string;
    deskripsi?: string;
    logo_url?: string;
    website?: string;
  }) {
    return MasterDataService.createBrand(scope, data);
  }

  static async updateBrand(scope: AccessScope, id: string, data: {
    nama?: string;
    deskripsi?: string;
    logo_url?: string;
    website?: string;
  }) {
    return MasterDataService.updateBrand(scope, id, data);
  }

  static async deleteBrand(scope: AccessScope, id: string) {
    return MasterDataService.deleteBrand(scope, id);
  }

  static async getSuppliers(scope: AccessScope) {
    return MasterDataService.getSuppliers(scope);
  }

  static async createSupplier(scope: AccessScope, data: {
    nama: string;
    kontak_person?: string;
    telepon?: string;
    email?: string;
    alamat?: string;
  }) {
    return MasterDataService.createSupplier(scope, data);
  }
}