/**
 * Extended Controller untuk API Produk dan Inventaris
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Request, Response } from 'express';
import { ProdukServiceExtended } from '../services/ProdukServiceExtended';
import { logger } from '@/core/utils/logger';
import pool from '@/core/database/connection';
import { RowDataPacket } from 'mysql2';
import {
  CreateProdukSchema,
  UpdateProdukSchema,
  CreateInventarisSchema,
  ProdukQuerySchema
} from '../models/Produk';

export class ProdukControllerExtended {
  /**
   * Helper function to get store ID from tenant ID
   */
  private static async getStoreIdFromTenant(tenantId: string): Promise<string | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM toko WHERE tenant_id = ? AND status = "aktif" LIMIT 1',
        [tenantId]
      );
      return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
      logger.error({ error }, 'Error getting store ID from tenant');
      return null;
    }
  }
  // ===== PRODUK ENDPOINTS =====
  
  static async getAllProduk(req: Request, res: Response) {
    try {
      // Validasi query parameters
      const query = ProdukQuerySchema.parse(req.query);
      
      // Ambil ID toko dari konteks user yang terautentikasi
      // Di sistem ini, tenantId pada token merepresentasikan id_toko
      const storeId = (req as any).user?.tenantId;
      if (!storeId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }
      
      const result = await ProdukServiceExtended.getAllProduk(query, storeId);
      
      return res.json({
        success: true,
        data: result.produk,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage
        },
        message: 'Data produk berhasil diambil'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in getAllProduk');
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Parameter query tidak valid',
          errors: error.errors
        });
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async getProdukById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      
      const storeId = (req as any).user?.tenantId;
      if (!storeId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }
      const produk = await ProdukServiceExtended.getProdukById(id, storeId);
      
      if (!produk) {
        return res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan'
        });
      }
      
      return res.json({
        success: true,
        data: produk,
        message: 'Data produk berhasil diambil'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in getProdukById');
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async createProduk(req: Request, res: Response) {
    try {
      const data = CreateProdukSchema.parse(req.body);
      const produk = await ProdukServiceExtended.createProduk(data);
      
      return res.status(201).json({
        success: true,
        data: produk,
        message: 'Produk berhasil dibuat'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in createProduk');
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Data tidak valid',
          errors: error.errors
        });
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async updateProduk(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      
      const data = UpdateProdukSchema.parse({ ...req.body, id });
      const produk = await ProdukServiceExtended.updateProduk(data);
      
      return res.json({
        success: true,
        data: produk,
        message: 'Produk berhasil diperbarui'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in updateProduk');
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Data tidak valid',
          errors: error.errors
        });
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async deleteProduk(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      
      await ProdukServiceExtended.deleteProduk(id);
      
      return res.json({
        success: true,
        message: 'Produk berhasil dihapus'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in deleteProduk');
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  // ===== INVENTARIS ENDPOINTS =====
  
  static async getInventarisByToko(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }
      
      const storeId = await ProdukControllerExtended.getStoreIdFromTenant(tenantId);
      if (!storeId) {
        return res.status(404).json({
          success: false,
          message: 'Toko tidak ditemukan untuk tenant ini'
        });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await ProdukServiceExtended.getInventarisByToko(storeId, page, limit);
      
      return res.json({
        success: true,
        data: result.inventaris,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        },
        message: 'Data inventaris berhasil diambil'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in getInventarisByToko');
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async upsertInventaris(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }
      
      const storeId = await ProdukControllerExtended.getStoreIdFromTenant(tenantId);
      if (!storeId) {
        return res.status(404).json({
          success: false,
          message: 'Toko tidak ditemukan untuk tenant ini'
        });
      }
      
      const data = CreateInventarisSchema.parse({
        ...req.body,
        id_toko: storeId
      });
      
      const inventaris = await ProdukServiceExtended.upsertInventaris(data);
      
      return res.json({
        success: true,
        data: inventaris,
        message: 'Inventaris berhasil disimpan'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in upsertInventaris');
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Data tidak valid',
          errors: error.errors
        });
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async updateStok(req: Request, res: Response) {
    try {
      const productId = String(req.params.productId);
      const { jumlah } = req.body;
      
      if (typeof jumlah !== 'number' || jumlah < 0) {
        return res.status(400).json({
          success: false,
          message: 'Parameter tidak valid'
        });
      }
      
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }
      
      const storeId = await ProdukControllerExtended.getStoreIdFromTenant(tenantId);
      if (!storeId) {
        return res.status(404).json({
          success: false,
          message: 'Toko tidak ditemukan untuk tenant ini'
        });
      }
      
      await ProdukServiceExtended.updateStok(storeId, productId, jumlah);
      
      return res.json({
        success: true,
        message: 'Stok berhasil diperbarui'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in updateStok');
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async deleteInventaris(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }
      
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }
      
      const storeId = await ProdukControllerExtended.getStoreIdFromTenant(tenantId);
      if (!storeId) {
        return res.status(404).json({
          success: false,
          message: 'Toko tidak ditemukan untuk tenant ini'
        });
      }
      
      logger.info({ storeId, productId }, 'Attempting to delete inventaris');
      await ProdukServiceExtended.deleteInventaris(storeId, productId);
      
      return res.json({
        success: true,
        message: 'Inventaris berhasil dihapus'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in deleteInventaris');
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }
}
