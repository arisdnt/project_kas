/**
 * Controller untuk Stok Opname
 * Menangani HTTP request dan response untuk stok opname
 */

import { Request, Response } from 'express';
import { StokOpnameService } from '../services/StokOpnameService';
import { createErrorResponse, createSuccessResponse } from '../models/StokOpnameCore';

export class StokOpnameController {
  /**
   * Mendapatkan daftar stok opname dengan filter dan pagination
   */
  static async getStokOpname(req: Request, res: Response): Promise<Response> {
    try {
      const {
        search,
        kategori,
        brand,
        supplier,
        status,
        page = '1',
        limit = '25'
      } = req.query;

      const filters = {
        search: search as string,
        kategori: kategori ? parseInt(kategori as string) : undefined,
        brand: brand ? parseInt(brand as string) : undefined,
        supplier: supplier ? parseInt(supplier as string) : undefined,
        status: status as 'all' | 'pending' | 'completed' | 'cancelled',
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await StokOpnameService.searchStokOpname(req.accessScope!, filters);
      return res.json(result);
    } catch (error) {
      console.error('Error getting stok opname:', error);
      return res.status(500).json(createErrorResponse('Gagal mengambil data stok opname'));
    }
  }

  /**
   * Mendapatkan detail stok opname berdasarkan ID
   */
  static async getStokOpnameById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      
      if (!id) {
        return res.status(400).json(createErrorResponse('ID stok opname diperlukan'));
      }

      const stokOpname = await StokOpnameService.findById(req.accessScope!, id);
      
      if (!stokOpname) {
        return res.status(404).json(createErrorResponse('Stok opname tidak ditemukan'));
      }

      return res.json(createSuccessResponse(stokOpname));
    } catch (error) {
      console.error('Error getting stok opname by ID:', error);
      return res.status(500).json(createErrorResponse('Gagal mengambil detail stok opname'));
    }
  }

  /**
   * Membuat stok opname baru dengan struktur header-detail
   */
  static async createStokOpname(req: Request, res: Response): Promise<Response> {
    try {
      const { items, catatan, tanggal_opname } = req.body;

      // Validasi input
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json(createErrorResponse('Items stok opname wajib diisi'));
      }

      // Validasi setiap item
      for (const item of items) {
        if (!item.id_produk) {
          return res.status(400).json(createErrorResponse('ID produk wajib diisi untuk setiap item'));
        }

        if (typeof item.id_produk !== 'string' || item.id_produk.trim().length === 0) {
          return res.status(400).json(createErrorResponse('ID produk tidak valid'));
        }

        if (item.stok_fisik !== undefined && (typeof item.stok_fisik !== 'number' || item.stok_fisik < 0)) {
          return res.status(400).json(createErrorResponse('Stok fisik tidak valid'));
        }
      }

      const createData = {
        items,
        catatan,
        tanggal_opname
      };

      const newStokOpname = await StokOpnameService.create(
        req.accessScope!,
        createData,
        req.user!.id
      );

      return res.status(201).json(createSuccessResponse(newStokOpname, 'Stok opname berhasil dibuat'));
    } catch (error) {
      console.error('Error creating stok opname:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Duplicate entry')) {
          return res.status(409).json(createErrorResponse('Stok opname untuk produk ini sudah ada'));
        }
        if (error.message.includes('foreign key constraint')) {
          return res.status(400).json(createErrorResponse('Produk tidak ditemukan'));
        }
      }

      return res.status(500).json(createErrorResponse('Gagal membuat stok opname'));
    }
  }

  /**
   * Mengupdate stok opname (method ini akan dihapus karena tidak sesuai dengan struktur baru)
   */
  static async updateStokOpname(req: Request, res: Response): Promise<Response> {
    return res.status(501).json(createErrorResponse('Method update tidak tersedia untuk struktur stok opname baru'));
  }

  /**
   * Menghapus stok opname (method ini akan dihapus karena tidak sesuai dengan struktur baru)
   */
  static async deleteStokOpname(req: Request, res: Response): Promise<Response> {
    return res.status(501).json(createErrorResponse('Method delete tidak tersedia untuk struktur stok opname baru'));
  }

  /**
   * Menyelesaikan stok opname (method ini akan dihapus karena tidak sesuai dengan struktur baru)
   */
  static async completeStokOpname(req: Request, res: Response): Promise<Response> {
    return res.status(501).json(createErrorResponse('Method complete tidak tersedia untuk struktur stok opname baru'));
  }

  /**
   * Membatalkan stok opname (method ini akan dihapus karena tidak sesuai dengan struktur baru)
   */
  static async cancelStokOpname(req: Request, res: Response): Promise<Response> {
    return res.status(501).json(createErrorResponse('Method cancel tidak tersedia untuk struktur stok opname baru'));
  }
}