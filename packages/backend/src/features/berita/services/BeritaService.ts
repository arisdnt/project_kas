/**
 * Service orchestrator untuk berita
 * Menggabungkan BeritaQueryService dan BeritaMutationService
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { BeritaQueryService } from './modules/BeritaQueryService';
import { BeritaMutationService } from './modules/BeritaMutationService';
import { 
  CreateBerita, 
  UpdateBerita, 
  SearchBeritaQuery,
  BeritaWithUser,
  BeritaStats,
  TipeBerita,
  PrioritasBerita,
  StatusBerita
} from '../models/BeritaCore';

export class BeritaService {
  // ==================== QUERY OPERATIONS ====================

  /**
   * Pencarian berita dengan filter dan pagination
   */
  static async searchBerita(
    query: SearchBeritaQuery, 
    accessScope: AccessScope
  ): Promise<{ data: BeritaWithUser[]; total: number; }> {
    return BeritaQueryService.searchBerita(query, accessScope);
  }

  /**
   * Mendapatkan berita berdasarkan ID
   */
  static async findById(id: string, accessScope: AccessScope): Promise<BeritaWithUser | null> {
    return BeritaQueryService.findById(id, accessScope);
  }

  /**
   * Mendapatkan statistik berita
   */
  static async getStats(accessScope: AccessScope): Promise<BeritaStats> {
    return BeritaQueryService.getStats(accessScope);
  }

  /**
   * Mendapatkan berita aktif untuk ditampilkan
   */
  static async getActiveNews(accessScope: AccessScope): Promise<BeritaWithUser[]> {
    return BeritaQueryService.getActiveNews(accessScope);
  }

  // ==================== MUTATION OPERATIONS ====================

  /**
   * Membuat berita baru
   */
  static async createBerita(
    data: CreateBerita, 
    accessScope: AccessScope
  ): Promise<BeritaWithUser> {
    return BeritaMutationService.createBerita(data, accessScope);
  }

  /**
   * Update berita
   */
  static async updateBerita(
    id: string, 
    data: UpdateBerita, 
    accessScope: AccessScope
  ): Promise<BeritaWithUser> {
    return BeritaMutationService.updateBerita(id, data, accessScope);
  }

  /**
   * Hapus berita
   */
  static async deleteBerita(id: string, accessScope: AccessScope): Promise<void> {
    return BeritaMutationService.deleteBerita(id, accessScope);
  }

  // ==================== EXTENDED OPERATIONS ====================

  /**
   * Mendapatkan berita berdasarkan tipe
   */
  static async getBeritaByTipe(
    tipe: TipeBerita, 
    accessScope: AccessScope, 
    limit: number = 20
  ): Promise<BeritaWithUser[]> {
    const query: SearchBeritaQuery = {
      tipeBerita: tipe,
      limit,
      page: 1,
      sortBy: 'dibuat_pada',
      sortOrder: 'desc'
    };
    
    const result = await BeritaQueryService.searchBerita(query, accessScope);
    return result.data;
  }

  /**
   * Mendapatkan berita berdasarkan prioritas
   */
  static async getBeritaByPrioritas(
    prioritas: PrioritasBerita, 
    accessScope: AccessScope, 
    limit: number = 20
  ): Promise<BeritaWithUser[]> {
    const query: SearchBeritaQuery = {
      prioritas,
      limit,
      page: 1,
      sortBy: 'dibuat_pada',
      sortOrder: 'desc'
    };
    
    const result = await BeritaQueryService.searchBerita(query, accessScope);
    return result.data;
  }

  /**
   * Mendapatkan berita berdasarkan status
   */
  static async getBeritaByStatus(
    status: StatusBerita, 
    accessScope: AccessScope, 
    limit: number = 20
  ): Promise<BeritaWithUser[]> {
    const query: SearchBeritaQuery = {
      status,
      limit,
      page: 1,
      sortBy: 'dibuat_pada',
      sortOrder: 'desc'
    };
    
    const result = await BeritaQueryService.searchBerita(query, accessScope);
    return result.data;
  }

  /**
   * Mendapatkan berita terbaru
   */
  static async getRecentBerita(
    accessScope: AccessScope, 
    limit: number = 10
  ): Promise<BeritaWithUser[]> {
    const query: SearchBeritaQuery = {
      sortBy: 'dibuat_pada',
      sortOrder: 'desc',
      limit,
      page: 1
    };
    
    const result = await BeritaQueryService.searchBerita(query, accessScope);
    return result.data;
  }

  /**
   * Mendapatkan berita yang dijadwalkan
   */
  static async getScheduledBerita(
    accessScope: AccessScope, 
    limit: number = 20
  ): Promise<BeritaWithUser[]> {
    const query: SearchBeritaQuery = {
      status: StatusBerita.DRAFT,
      sortBy: 'jadwal_mulai',
      sortOrder: 'asc',
      limit,
      page: 1
    };
    
    const result = await BeritaQueryService.searchBerita(query, accessScope);
    return result.data;
  }

  /**
   * Pencarian berita berdasarkan konten
   */
  static async searchByContent(
    searchTerm: string, 
    accessScope: AccessScope, 
    limit: number = 20
  ): Promise<BeritaWithUser[]> {
    const query: SearchBeritaQuery = {
      q: searchTerm,
      limit,
      page: 1,
      sortBy: 'dibuat_pada',
      sortOrder: 'desc'
    };
    
    const result = await BeritaQueryService.searchBerita(query, accessScope);
    return result.data;
  }

  /**
   * Mendapatkan berita untuk dashboard (ringkasan)
   */
  static async getDashboardBerita(accessScope: AccessScope): Promise<{
    recent: BeritaWithUser[];
    active: BeritaWithUser[];
    scheduled: BeritaWithUser[];
    stats: BeritaStats;
  }> {
    const [recent, active, scheduled, stats] = await Promise.all([
      this.getRecentBerita(accessScope, 5),
      this.getBeritaByStatus(StatusBerita.AKTIF, accessScope, 5),
      this.getScheduledBerita(accessScope, 5),
      this.getStats(accessScope)
    ]);

    return {
      recent,
      active,
      scheduled,
      stats
    };
  }
}