/**
 * Controller untuk Produk dan Inventaris
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Request, Response } from 'express';
import { logger } from '@/core/utils/logger';
import pool from '@/core/database/connection';
import { RowDataPacket } from 'mysql2';
import { AccessScope } from '@/core/middleware/accessScope';
import {
  CreateProdukSchema,
  UpdateProdukSchema,
  CreateInventarisSchema,
  ProdukQuerySchema
} from '../models/Produk';

// Import modul-modul produk
import { getAllProduk } from '../services/modules/produk/getAllProduk';
import { getProdukById } from '../services/modules/produk/getProdukById';
import { createProduk } from '../services/modules/produk/createProduk';
import { updateProduk } from '../services/modules/produk/updateProduk';
import { deleteProduk } from '../services/modules/produk/deleteProduk';

// Import modul-modul inventaris
import { getInventarisByToko } from '../services/modules/inventaris/getInventarisByToko';
import { upsertInventaris } from '../services/modules/inventaris/upsertInventaris';
import { updateStok } from '../services/modules/inventaris/updateStok';
import { deleteInventaris } from '../services/modules/inventaris/deleteInventaris';

export class ProdukInventarisController {
  /**
   * Helper function untuk mendapatkan store ID dari tenant ID
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
      const scope = req.accessScope as AccessScope | undefined;
      
      if (!scope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak tersedia'
        });
      }

      // Tentukan storeId: gunakan scope.storeId jika ada; fallback untuk admin/god
      let effectiveScope = scope;
      if (!scope.storeId && !scope.enforceStore) {
        const fallback = await ProdukInventarisController.getStoreIdFromTenant(scope.tenantId);
        if (fallback) effectiveScope = { ...scope, storeId: fallback };
      }
      
      const result = await getAllProduk(query, effectiveScope);
      
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
      const scope = req.accessScope as AccessScope | undefined;
      
      if (!scope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak tersedia'
        });
      }
      
      let effectiveScope = scope;
      if (!scope.storeId && !scope.enforceStore) {
        const fallback = await ProdukInventarisController.getStoreIdFromTenant(scope.tenantId);
        if (fallback) effectiveScope = { ...scope, storeId: fallback };
      }
      
      const produk = await getProdukById(id, effectiveScope);
      
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
      const scope = req.accessScope as AccessScope | undefined;
      
      if (!scope) {
        return res.status(401).json({ 
          success: false, 
          message: 'Access scope tidak tersedia' 
        });
      }
      
      const produk = await createProduk(data, scope);
      
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
      const scope = req.accessScope as AccessScope | undefined;
      
      if (!scope) {
        return res.status(401).json({ 
          success: false, 
          message: 'Access scope tidak tersedia' 
        });
      }
      
      const produk = await updateProduk(data, scope);
      
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
      const scope = req.accessScope as AccessScope | undefined;
      
      if (!scope) {
        return res.status(401).json({ 
          success: false, 
          message: 'Access scope tidak tersedia' 
        });
      }
      
      await deleteProduk(id, scope);
      
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
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const scope = req.accessScope as AccessScope | undefined;
      
      if (!scope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak tersedia'
        });
      }
      
      let effectiveScope = scope;
      if (!scope.storeId && !scope.enforceStore) {
        const fallback = await ProdukInventarisController.getStoreIdFromTenant(scope.tenantId);
        if (fallback) effectiveScope = { ...scope, storeId: fallback };
      }
      
      const result = await getInventarisByToko(effectiveScope, page, limit);
      
      return res.json({
        success: true,
        data: result.inventaris,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNextPage: page < result.totalPages
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
      const data = CreateInventarisSchema.parse(req.body);
      const scope = req.accessScope as AccessScope | undefined;
      
      if (!scope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak tersedia'
        });
      }
      
      const inventaris = await upsertInventaris(data, scope);
      
      return res.json({
        success: true,
        data: inventaris,
        message: 'Inventaris berhasil diperbarui'
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
      const { stok } = req.body;
      const scope = req.accessScope as AccessScope | undefined;
      
      if (!scope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak tersedia'
        });
      }
      
      const inventaris = await updateStok(scope, productId, stok);
      
      return res.json({
        success: true,
        data: inventaris,
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
      const productId = String(req.params.productId);
      const scope = req.accessScope as AccessScope | undefined;
      
      if (!scope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak tersedia'
        });
      }
      
      await deleteInventaris(scope, productId);
      
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