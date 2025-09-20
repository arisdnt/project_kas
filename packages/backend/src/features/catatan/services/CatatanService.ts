/**
 * Service orchestrator untuk catatan
 * Menggabungkan CatatanQueryService dan CatatanMutationService
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { 
  SearchCatatanQuery, 
  CreateCatatan, 
  UpdateCatatan, 
  Catatan, 
  CatatanWithUser, 
  CatatanStats 
} from '../models/CatatanCore';
import { CatatanQueryService } from './modules/CatatanQueryService';
import { CatatanMutationService } from './modules/CatatanMutationService';

export class CatatanService {
  /**
   * Pencarian catatan dengan filter dan pagination
   */
  static async searchCatatan(
    query: SearchCatatanQuery,
    accessScope: AccessScope
  ): Promise<{ data: CatatanWithUser[]; total: number }> {
    return await CatatanQueryService.searchCatatan(query, accessScope);
  }

  /**
   * Mendapatkan catatan berdasarkan ID
   */
  static async findById(
    id: string,
    accessScope: AccessScope
  ): Promise<CatatanWithUser | null> {
    return await CatatanQueryService.findById(id, accessScope);
  }

  /**
   * Mendapatkan statistik catatan
   */
  static async getStats(accessScope: AccessScope): Promise<CatatanStats> {
    return await CatatanQueryService.getStats(accessScope);
  }

  /**
   * Membuat catatan baru
   */
  static async createCatatan(
    data: CreateCatatan,
    accessScope: AccessScope
  ): Promise<Catatan> {
    return await CatatanMutationService.createCatatan(data, accessScope);
  }

  /**
   * Update catatan
   */
  static async updateCatatan(
    id: string,
    data: UpdateCatatan,
    accessScope: AccessScope
  ): Promise<Catatan> {
    return await CatatanMutationService.updateCatatan(id, data, accessScope);
  }

  /**
   * Hapus catatan
   */
  static async deleteCatatan(
    id: string,
    accessScope: AccessScope
  ): Promise<boolean> {
    return await CatatanMutationService.deleteCatatan(id, accessScope);
  }

  /**
   * Mendapatkan catatan berdasarkan kategori
   */
  static async getCatatanByKategori(
    kategori: string,
    accessScope: AccessScope,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: CatatanWithUser[]; total: number }> {
    const query: SearchCatatanQuery = {
      page: page.toString(),
      limit: limit.toString(),
      kategori,
      sort_by: 'diperbarui_pada',
      sort_order: 'desc'
    };
    
    return await this.searchCatatan(query, accessScope);
  }

  /**
   * Mendapatkan catatan dengan reminder
   */
  static async getCatatanWithReminder(
    accessScope: AccessScope,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: CatatanWithUser[]; total: number }> {
    const query: SearchCatatanQuery = {
      page: page.toString(),
      limit: limit.toString(),
      has_reminder: 'true',
      sort_by: 'reminder_pada',
      sort_order: 'asc'
    };
    
    return await this.searchCatatan(query, accessScope);
  }

  /**
   * Mendapatkan catatan berdasarkan prioritas
   */
  static async getCatatanByPrioritas(
    prioritas: 'rendah' | 'normal' | 'tinggi',
    accessScope: AccessScope,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: CatatanWithUser[]; total: number }> {
    const query: SearchCatatanQuery = {
      page: page.toString(),
      limit: limit.toString(),
      prioritas,
      sort_by: 'diperbarui_pada',
      sort_order: 'desc'
    };
    
    return await this.searchCatatan(query, accessScope);
  }

  /**
   * Mendapatkan catatan berdasarkan status
   */
  static async getCatatanByStatus(
    status: 'draft' | 'aktif' | 'arsip',
    accessScope: AccessScope,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: CatatanWithUser[]; total: number }> {
    const query: SearchCatatanQuery = {
      page: page.toString(),
      limit: limit.toString(),
      status,
      sort_by: 'diperbarui_pada',
      sort_order: 'desc'
    };
    
    return await this.searchCatatan(query, accessScope);
  }

  /**
   * Mendapatkan catatan berdasarkan visibilitas
   */
  static async getCatatanByVisibilitas(
    visibilitas: 'pribadi' | 'toko' | 'tenant' | 'publik',
    accessScope: AccessScope,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: CatatanWithUser[]; total: number }> {
    const query: SearchCatatanQuery = {
      page: page.toString(),
      limit: limit.toString(),
      visibilitas,
      sort_by: 'diperbarui_pada',
      sort_order: 'desc'
    };
    
    return await this.searchCatatan(query, accessScope);
  }

  /**
   * Pencarian catatan berdasarkan tags
   */
  static async searchByTags(
    tags: string[],
    accessScope: AccessScope,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: CatatanWithUser[]; total: number }> {
    const query: SearchCatatanQuery = {
      page: page.toString(),
      limit: limit.toString(),
      tags: tags.join(','),
      sort_by: 'diperbarui_pada',
      sort_order: 'desc'
    };
    
    return await this.searchCatatan(query, accessScope);
  }

  /**
   * Mendapatkan catatan terbaru
   */
  static async getRecentCatatan(
    accessScope: AccessScope,
    limit: number = 10
  ): Promise<{ data: CatatanWithUser[]; total: number }> {
    const query: SearchCatatanQuery = {
      page: '1',
      limit: limit.toString(),
      sort_by: 'dibuat_pada',
      sort_order: 'desc'
    };
    
    return await this.searchCatatan(query, accessScope);
  }

  /**
   * Mendapatkan catatan yang diupdate hari ini
   */
  static async getTodayUpdatedCatatan(
    accessScope: AccessScope,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: CatatanWithUser[]; total: number }> {
    const today = new Date().toISOString().split('T')[0];
    
    const query: SearchCatatanQuery = {
      page: page.toString(),
      limit: limit.toString(),
      tanggal_mulai: today,
      tanggal_selesai: today,
      sort_by: 'diperbarui_pada',
      sort_order: 'desc'
    };
    
    return await this.searchCatatan(query, accessScope);
  }
}