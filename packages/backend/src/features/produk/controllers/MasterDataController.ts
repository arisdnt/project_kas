/**
 * Controller untuk Master Data (Kategori, Brand, Supplier)
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Request, Response } from 'express';
import { 
  getAllKategori,
  createKategori,
  updateKategori,
  deleteKategori,
  getAllBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  getAllSupplier,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../services/modules';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';
import {
  CreateKategoriSchema,
  UpdateKategoriSchema,
  CreateBrandSchema,
  UpdateBrandSchema,
  CreateSupplierSchema,
  UpdateSupplierSchema
} from '../models/Produk';

export class MasterDataController {
  // ===== KATEGORI ENDPOINTS =====
  
  static async getAllKategori(req: Request, res: Response) {
    try {
      const scope = req.accessScope as AccessScope;
      const kategori = await getAllKategori(scope);
      return res.json({
        success: true,
        data: kategori,
        message: 'Data kategori berhasil diambil'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in getAllKategori');
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async createKategori(req: Request, res: Response) {
    try {
      const data = CreateKategoriSchema.parse(req.body);
      const scope = req.accessScope as AccessScope;
      const kategori = await createKategori(data, scope);
      
      return res.status(201).json({
        success: true,
        data: kategori,
        message: 'Kategori berhasil dibuat'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in createKategori');
      
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

  static async updateKategori(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const data = UpdateKategoriSchema.parse({ ...req.body, id });
      const scope = req.accessScope as AccessScope;
      const kategori = await updateKategori(data, scope);
      
      return res.json({
        success: true,
        data: kategori,
        message: 'Kategori berhasil diperbarui'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in updateKategori');
      
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

  static async deleteKategori(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const scope = req.accessScope as AccessScope;
      await deleteKategori(id, scope);
      
      return res.json({
        success: true,
        message: 'Kategori berhasil dihapus'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in deleteKategori');
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  // ===== BRAND ENDPOINTS =====
  
  static async getAllBrand(req: Request, res: Response) {
    try {
      const scope = req.accessScope as AccessScope;
      const brand = await getAllBrand(scope);
      return res.json({
        success: true,
        data: brand,
        message: 'Data brand berhasil diambil'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in getAllBrand');
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async createBrand(req: Request, res: Response) {
    try {
      const data = CreateBrandSchema.parse(req.body);
      const scope = req.accessScope as AccessScope;
      const brand = await createBrand(data, scope);
      
      return res.status(201).json({
        success: true,
        data: brand,
        message: 'Brand berhasil dibuat'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in createBrand');
      
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

  static async updateBrand(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const data = UpdateBrandSchema.parse({ ...req.body, id });
      const scope = req.accessScope as AccessScope;
      const brand = await updateBrand(data, scope);
      
      return res.json({
        success: true,
        data: brand,
        message: 'Brand berhasil diperbarui'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in updateBrand');
      
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

  static async deleteBrand(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const scope = req.accessScope as AccessScope;
      await deleteBrand(id, scope);
      
      return res.json({
        success: true,
        message: 'Brand berhasil dihapus'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in deleteBrand');
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  // ===== SUPPLIER ENDPOINTS =====
  
  static async getAllSupplier(req: Request, res: Response) {
    try {
      const scope = req.accessScope as AccessScope;
      const supplier = await getAllSupplier(scope);
      return res.json({
        success: true,
        data: supplier,
        message: 'Data supplier berhasil diambil'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in getAllSupplier');
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async createSupplier(req: Request, res: Response) {
    try {
      const data = CreateSupplierSchema.parse(req.body);
      const scope = req.accessScope as AccessScope;
      const supplier = await createSupplier(data, scope);
      
      return res.status(201).json({
        success: true,
        data: supplier,
        message: 'Supplier berhasil dibuat'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in createSupplier');
      
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

  static async updateSupplier(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const data = UpdateSupplierSchema.parse({ ...req.body, id });
      const scope = req.accessScope as AccessScope;
      const supplier = await updateSupplier(data, scope);
      
      return res.json({
        success: true,
        data: supplier,
        message: 'Supplier berhasil diperbarui'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in updateSupplier');
      
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

  static async deleteSupplier(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const scope = req.accessScope as AccessScope;
      await deleteSupplier(id, scope);
      
      return res.json({
        success: true,
        message: 'Supplier berhasil dihapus'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in deleteSupplier');
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async getSupplierById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const scope = req.accessScope as AccessScope;
      const supplier = await getSupplierById(id, scope);
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier tidak ditemukan'
        });
      }
      
      return res.json({
        success: true,
        data: supplier,
        message: 'Data supplier berhasil diambil'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in getSupplierById');
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }
}
