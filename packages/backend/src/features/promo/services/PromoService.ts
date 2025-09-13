/**
 * Service untuk Promo
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Promo, CreatePromoRequest, UpdatePromoRequest, PromoStats } from '../models/Promo';
import { logger } from '@/core/utils/logger';

export class PromoService {
  // Get all promos for a store
  static async getAllPromos(storeId: number): Promise<Promo[]> {
    try {
      // TODO: Implement database query
      // For now, return mock data to fix the JSON error
      const mockPromos: Promo[] = [
        {
          id: 1,
          nama: 'Diskon Hari Raya',
          deskripsi: 'Diskon spesial untuk hari raya',
          tipe: 'diskon_persen',
          nilai: 10,
          syarat_minimum: 50000,
          kuota: 100,
          kuota_terpakai: 25,
          produk_ids: [1, 2, 3],
          kategori_ids: [1],
          mulai_tanggal: new Date('2024-01-01'),
          selesai_tanggal: new Date('2024-12-31'),
          aktif: true,
          id_toko: storeId,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      return mockPromos;
    } catch (error) {
      logger.error({ error, storeId }, 'Error getting all promos');
      throw new Error('Failed to fetch promos');
    }
  }

  // Get promo by ID
  static async getPromoById(id: number, storeId: number): Promise<Promo | null> {
    try {
      // TODO: Implement database query
      // For now, return mock data
      if (id === 1) {
        return {
          id: 1,
          nama: 'Diskon Hari Raya',
          deskripsi: 'Diskon spesial untuk hari raya',
          tipe: 'diskon_persen',
          nilai: 10,
          syarat_minimum: 50000,
          kuota: 100,
          kuota_terpakai: 25,
          produk_ids: [1, 2, 3],
          kategori_ids: [1],
          mulai_tanggal: new Date('2024-01-01'),
          selesai_tanggal: new Date('2024-12-31'),
          aktif: true,
          id_toko: storeId,
          created_at: new Date(),
          updated_at: new Date()
        };
      }
      return null;
    } catch (error) {
      logger.error({ error, id, storeId }, 'Error getting promo by ID');
      throw new Error('Failed to fetch promo');
    }
  }

  // Create new promo
  static async createPromo(data: CreatePromoRequest, storeId: number): Promise<Promo> {
    try {
      // TODO: Implement database insert
      // For now, return mock created promo
      const newPromo: Promo = {
        id: Date.now(), // Mock ID
        nama: data.nama,
        deskripsi: data.deskripsi,
        tipe: data.tipe,
        nilai: data.nilai,
        syarat_minimum: data.syarat_minimum,
        kuota: data.kuota,
        kuota_terpakai: 0,
        produk_ids: data.produk_ids,
        kategori_ids: data.kategori_ids,
        mulai_tanggal: new Date(data.mulai_tanggal),
        selesai_tanggal: new Date(data.selesai_tanggal),
        aktif: true,
        id_toko: storeId,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      return newPromo;
    } catch (error) {
      logger.error({ error, data, storeId }, 'Error creating promo');
      throw new Error('Failed to create promo');
    }
  }

  // Update promo
  static async updatePromo(id: number, data: UpdatePromoRequest, storeId: number): Promise<Promo | null> {
    try {
      // TODO: Implement database update
      // For now, return mock updated promo
      if (id === 1) {
        return {
          id: 1,
          nama: data.nama || 'Diskon Hari Raya',
          deskripsi: data.deskripsi || 'Diskon spesial untuk hari raya',
          tipe: data.tipe || 'diskon_persen',
          nilai: data.nilai || 10,
          syarat_minimum: data.syarat_minimum,
          kuota: data.kuota,
          kuota_terpakai: 25,
          produk_ids: data.produk_ids,
          kategori_ids: data.kategori_ids,
          mulai_tanggal: data.mulai_tanggal ? new Date(data.mulai_tanggal) : new Date('2024-01-01'),
          selesai_tanggal: data.selesai_tanggal ? new Date(data.selesai_tanggal) : new Date('2024-12-31'),
          aktif: data.aktif !== undefined ? data.aktif : true,
          id_toko: storeId,
          created_at: new Date(),
          updated_at: new Date()
        };
      }
      return null;
    } catch (error) {
      logger.error({ error, id, data, storeId }, 'Error updating promo');
      throw new Error('Failed to update promo');
    }
  }

  // Delete promo
  static async deletePromo(id: number, storeId: number): Promise<boolean> {
    try {
      // TODO: Implement database delete
      // For now, return success for existing mock data
      return id === 1;
    } catch (error) {
      logger.error({ error, id, storeId }, 'Error deleting promo');
      throw new Error('Failed to delete promo');
    }
  }

  // Toggle promo status
  static async togglePromoStatus(id: number, storeId: number): Promise<Promo | null> {
    try {
      // TODO: Implement database toggle
      // For now, return mock toggled promo
      if (id === 1) {
        return {
          id: 1,
          nama: 'Diskon Hari Raya',
          deskripsi: 'Diskon spesial untuk hari raya',
          tipe: 'diskon_persen',
          nilai: 10,
          syarat_minimum: 50000,
          kuota: 100,
          kuota_terpakai: 25,
          produk_ids: [1, 2, 3],
          kategori_ids: [1],
          mulai_tanggal: new Date('2024-01-01'),
          selesai_tanggal: new Date('2024-12-31'),
          aktif: false, // Toggled
          id_toko: storeId,
          created_at: new Date(),
          updated_at: new Date()
        };
      }
      return null;
    } catch (error) {
      logger.error({ error, id, storeId }, 'Error toggling promo status');
      throw new Error('Failed to toggle promo status');
    }
  }

  // Get promo stats
  static async getPromoStats(storeId: number): Promise<PromoStats> {
    try {
      // TODO: Implement database aggregation
      // For now, return mock stats
      return {
        total_promo: 1,
        promo_aktif: 1,
        promo_nonaktif: 0,
        total_penggunaan: 25,
        total_nilai_diskon: 125000
      };
    } catch (error) {
      logger.error({ error, storeId }, 'Error getting promo stats');
      throw new Error('Failed to fetch promo stats');
    }
  }

  // Get active promos
  static async getActivePromos(storeId: number): Promise<Promo[]> {
    try {
      // TODO: Implement database query with active filter
      const allPromos = await this.getAllPromos(storeId);
      return allPromos.filter(promo => promo.aktif);
    } catch (error) {
      logger.error({ error, storeId }, 'Error getting active promos');
      throw new Error('Failed to fetch active promos');
    }
  }

  // Get promos by date range
  static async getPromosByDateRange(startDate: string, endDate: string, storeId: number): Promise<Promo[]> {
    try {
      // TODO: Implement database query with date filter
      const allPromos = await this.getAllPromos(storeId);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return allPromos.filter(promo => 
        promo.mulai_tanggal >= start && promo.selesai_tanggal <= end
      );
    } catch (error) {
      logger.error({ error, startDate, endDate, storeId }, 'Error getting promos by date range');
      throw new Error('Failed to fetch promos by date range');
    }
  }
}