/**
 * Perpesanan Service Orchestrator
 * Main service yang mengkoordinasikan operasi perpesanan
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { 
  SearchPerpesananQuery, 
  CreatePerpesanan, 
  UpdatePerpesanan, 
  MarkAsRead,
  Perpesanan,
  PerpesananWithUsers,
  PerpesananStats
} from '../models/PerpesananCore';
import { PerpesananQueryService } from './modules/PerpesananQueryService';
import { PerpesananMutationService } from './modules/PerpesananMutationService';

export class PerpesananService {
  /**
   * Mencari pesan dengan pagination dan filter
   */
  static async searchPerpesanan(
    query: SearchPerpesananQuery,
    accessScope: AccessScope
  ): Promise<{ data: PerpesananWithUsers[]; total: number }> {
    return await PerpesananQueryService.searchPerpesanan(query, accessScope);
  }

  /**
   * Mendapatkan pesan berdasarkan ID
   */
  static async findById(
    id: string,
    accessScope: AccessScope
  ): Promise<PerpesananWithUsers | null> {
    return await PerpesananQueryService.findById(id, accessScope);
  }

  /**
   * Mendapatkan statistik pesan
   */
  static async getStats(accessScope: AccessScope): Promise<PerpesananStats> {
    return await PerpesananQueryService.getStats(accessScope);
  }

  /**
   * Membuat pesan baru
   */
  static async createPerpesanan(
    data: CreatePerpesanan,
    accessScope: AccessScope
  ): Promise<Perpesanan> {
    return await PerpesananMutationService.createPerpesanan(data, accessScope);
  }

  /**
   * Update pesan
   */
  static async updatePerpesanan(
    id: string,
    data: UpdatePerpesanan,
    accessScope: AccessScope
  ): Promise<Perpesanan> {
    return await PerpesananMutationService.updatePerpesanan(id, data, accessScope);
  }

  /**
   * Menandai pesan sebagai dibaca
   */
  static async markAsRead(
    data: MarkAsRead,
    accessScope: AccessScope
  ): Promise<{ updated_count: number }> {
    return await PerpesananMutationService.markAsRead(data, accessScope);
  }

  /**
   * Menghapus pesan
   */
  static async deletePerpesanan(
    id: string,
    accessScope: AccessScope
  ): Promise<{ success: boolean }> {
    return await PerpesananMutationService.deletePerpesanan(id, accessScope);
  }

  /**
   * Membalas pesan
   */
  static async replyPerpesanan(
    originalId: string,
    pesan: string,
    accessScope: AccessScope
  ): Promise<Perpesanan> {
    return await PerpesananMutationService.replyPerpesanan(originalId, pesan, accessScope);
  }

  /**
   * Mendapatkan daftar konversasi (pesan terakhir dengan setiap user)
   */
  static async getConversations(accessScope: AccessScope): Promise<PerpesananWithUsers[]> {
    // Implementasi untuk mendapatkan daftar konversasi
    // Menggunakan query yang kompleks untuk mendapatkan pesan terakhir dengan setiap user
    const query: SearchPerpesananQuery = {
      page: '1',
      limit: '50',
      sort_by: 'dibuat_pada',
      sort_order: 'desc'
    };

    const { data } = await PerpesananQueryService.searchPerpesanan(query, accessScope);
    
    // Group by conversation partner dan ambil pesan terakhir
    const conversationMap = new Map<string, PerpesananWithUsers>();
    
    data.forEach(pesan => {
      const partnerId = pesan.pengirim_id === accessScope.userId 
        ? pesan.penerima_id 
        : pesan.pengirim_id;
      
      if (!conversationMap.has(partnerId) || 
          new Date(pesan.dibuat_pada) > new Date(conversationMap.get(partnerId)!.dibuat_pada)) {
        conversationMap.set(partnerId, pesan);
      }
    });

    return Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.dibuat_pada).getTime() - new Date(a.dibuat_pada).getTime());
  }

  /**
   * Mendapatkan riwayat pesan dengan user tertentu
   */
  static async getConversationHistory(
    partnerId: string,
    accessScope: AccessScope,
    page: string = '1',
    limit: string = '20'
  ): Promise<{ data: PerpesananWithUsers[]; total: number }> {
    const query: SearchPerpesananQuery = {
      page,
      limit,
      sort_by: 'dibuat_pada',
      sort_order: 'desc'
    };

    // Filter untuk mendapatkan pesan antara user saat ini dan partner
    const { data, total } = await PerpesananQueryService.searchPerpesanan(query, accessScope);
    
    const filteredData = data.filter(pesan => 
      (pesan.pengirim_id === accessScope.userId && pesan.penerima_id === partnerId) ||
      (pesan.pengirim_id === partnerId && pesan.penerima_id === accessScope.userId)
    );

    return { 
      data: filteredData.reverse(), // Urutkan dari lama ke baru untuk tampilan chat
      total: filteredData.length 
    };
  }
}