/**
 * Kasir Controller - HTTP Request Handlers untuk Point of Sales
 * Mendukung operasi real-time, cart management, dan transaksi
 */

import { Request, Response } from 'express';
import { AuthenticatedUser } from '@/features/auth/models/User';
import { AccessScope } from '@/core/middleware/accessScope';
import { KasirService } from '../services/KasirService';
import {
  AddCartItemSchema,
  UpdateCartItemSchema,
  SetPelangganSchema,
  SetDiskonSchema,
  PembayaranSchema,
  SearchProdukSchema,
  ScanBarcodeSchema,
  ApiResponse,
  KasirSession,
  MetodeBayar
} from '../models/KasirCore';
import { Server } from 'socket.io';

export class KasirController {
  private static io: Server;

  /**
   * Set Socket.IO instance untuk real-time features
   */
  static setSocketIO(io: Server) {
    this.io = io;
  }

  /**
   * Emit event ke socket room tertentu
   */
  private static emitToRoom(roomId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(roomId).emit(event, data);
    }
  }

  /**
   * Membuat session kasir baru atau mendapatkan yang sudah ada
   * GET /api/kasir/session
   */
  // Catatan: Semua handler mengembalikan Promise<Response> agar konsisten & hindari TS7030
  static async createSession(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as AuthenticatedUser;
      const scope = req.accessScope as AccessScope;

      if (!scope.storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID diperlukan untuk operasi kasir'
        } as ApiResponse);
      }

      const session = await KasirService.createOrGetSession(user, scope);

      // Join socket room untuk real-time updates
      const roomId = `kasir_${scope.tenantId}_${scope.storeId}_${user.id}`;

      return res.json({
        success: true,
        message: 'Session kasir berhasil dibuat',
        data: {
          session,
          socket_room: roomId
        }
      } as ApiResponse<{ session: KasirSession; socket_room: string }>);

    } catch (error: any) {
      console.error('Error creating kasir session:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal membuat session kasir',
        error: error.message
      } as ApiResponse);
    }
  }

  /**
   * Pencarian produk untuk kasir
   * GET /api/kasir/produk/search
   */
  static async searchProduk(req: Request, res: Response): Promise<Response> {
    try {
      const scope = req.accessScope as AccessScope;

      // Validasi query parameters
      const validation = SearchProdukSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Parameter pencarian tidak valid',
          error: validation.error.errors.map(e => e.message).join(', ')
        } as ApiResponse);
      }

      const searchParams = validation.data;
      const result = await KasirService.searchProduk(searchParams, scope);

      return res.json({
        success: true,
        message: `Ditemukan ${result.total} produk`,
        data: result
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error searching products:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mencari produk',
        error: error.message
      } as ApiResponse);
    }
  }

  /**
   * Scan barcode produk
   * POST /api/kasir/produk/scan
   */
  static async scanBarcode(req: Request, res: Response): Promise<Response> {
    try {
      const scope = req.accessScope as AccessScope;

      // Validasi request body
      const validation = ScanBarcodeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Data scan barcode tidak valid',
          error: validation.error.errors.map(e => e.message).join(', ')
        } as ApiResponse);
      }

      const { barcode } = validation.data;
      const produk = await KasirService.getProdukByBarcode(barcode, scope);

      if (!produk) {
        return res.status(404).json({
          success: false,
          message: `Produk dengan barcode "${barcode}" tidak ditemukan`
        } as ApiResponse);
      }

      // Cek stok tersedia
      if (produk.stok_tersedia <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Produk tidak tersedia (stok habis)',
          data: produk
        } as ApiResponse);
      }

      return res.json({
        success: true,
        message: 'Produk ditemukan',
        data: produk
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error scanning barcode:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal scan barcode',
        error: error.message
      } as ApiResponse);
    }
  }

  /**
   * Tambah item ke cart
   * POST /api/kasir/cart/add
   */
  static async addItemToCart(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as AuthenticatedUser;
      const scope = req.accessScope as AccessScope;

      // Validasi request body
      const validation = AddCartItemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Data item tidak valid',
          error: validation.error.errors.map(e => e.message).join(', ')
        } as ApiResponse);
      }

      const {
        produk_id,
        kuantitas,
        harga_satuan,
        diskon_persen,
        diskon_nominal,
        catatan
      } = validation.data;

      const sessionId = req.headers['x-kasir-session'] as string || `session_${user.id}`;

      const cartItem = await KasirService.addItemToCart(
        sessionId,
        produk_id,
        kuantitas,
        scope,
        harga_satuan,
        diskon_persen,
        diskon_nominal,
        catatan
      );

      // Real-time update ke socket room
      const roomId = `kasir_${scope.tenantId}_${scope.storeId}_${user.id}`;
      this.emitToRoom(roomId, 'cart:item_added', {
        session_id: sessionId,
        item: cartItem
      });

      return res.status(201).json({
        success: true,
        message: 'Item berhasil ditambahkan ke cart',
        data: cartItem
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error adding item to cart:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Gagal menambah item ke cart',
        error: error.message
      } as ApiResponse);
    }
  }

  /**
   * Update item di cart
   * PUT /api/kasir/cart/:produkId
   */
  static async updateCartItem(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as AuthenticatedUser;
      const scope = req.accessScope as AccessScope;
      const { produkId } = req.params;

      // Validasi request body
      const validation = UpdateCartItemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Data update item tidak valid',
          error: validation.error.errors.map(e => e.message).join(', ')
        } as ApiResponse);
      }

      const { kuantitas } = validation.data;
      const sessionId = req.headers['x-kasir-session'] as string || `session_${user.id}`;

      if (kuantitas === 0) {
        // Remove item if quantity is 0
        await KasirService.removeItemFromCart(sessionId, produkId, scope);

        // Real-time update
        const roomId = `kasir_${scope.tenantId}_${scope.storeId}_${user.id}`;
        this.emitToRoom(roomId, 'cart:item_removed', {
          session_id: sessionId,
          produk_id: produkId
        });

        return res.json({
          success: true,
          message: 'Item berhasil dihapus dari cart'
        } as ApiResponse);
      }

      const updatedItem = await KasirService.updateCartItem(
        sessionId,
        produkId,
        kuantitas,
        scope
      );

      // Real-time update
      const roomId = `kasir_${scope.tenantId}_${scope.storeId}_${user.id}`;
      this.emitToRoom(roomId, 'cart:item_updated', {
        session_id: sessionId,
        produk_id: produkId,
        item: updatedItem
      });

      return res.json({
        success: true,
        message: 'Item berhasil diupdate',
        data: updatedItem
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error updating cart item:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Gagal update item',
        error: error.message
      } as ApiResponse);
    }
  }

  /**
   * Hapus item dari cart
   * DELETE /api/kasir/cart/:produkId
   */
  static async removeItemFromCart(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as AuthenticatedUser;
      const scope = req.accessScope as AccessScope;
      const { produkId } = req.params;
      const sessionId = req.headers['x-kasir-session'] as string || `session_${user.id}`;

      await KasirService.removeItemFromCart(sessionId, produkId, scope);

      // Real-time update
      const roomId = `kasir_${scope.tenantId}_${scope.storeId}_${user.id}`;
      this.emitToRoom(roomId, 'cart:item_removed', {
        session_id: sessionId,
        produk_id: produkId
      });

      return res.json({
        success: true,
        message: 'Item berhasil dihapus dari cart'
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error removing cart item:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal hapus item',
        error: error.message
      } as ApiResponse);
    }
  }

  /**
   * Kosongkan cart
   * DELETE /api/kasir/cart
   */
  static async clearCart(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as AuthenticatedUser;
      const scope = req.accessScope as AccessScope;
      const sessionId = req.headers['x-kasir-session'] as string || `session_${user.id}`;

      await KasirService.clearCart(sessionId, scope);

      // Real-time update
      const roomId = `kasir_${scope.tenantId}_${scope.storeId}_${user.id}`;
      this.emitToRoom(roomId, 'cart:cleared', {
        session_id: sessionId
      });

      return res.json({
        success: true,
        message: 'Cart berhasil dikosongkan'
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error clearing cart:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal kosongkan cart',
        error: error.message
      } as ApiResponse);
    }
  }

  /**
   * Set pelanggan untuk transaksi
   * POST /api/kasir/pelanggan
   */
  static async setPelanggan(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as AuthenticatedUser;
      const scope = req.accessScope as AccessScope;

      // Validasi request body
      const validation = SetPelangganSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Data pelanggan tidak valid',
          error: validation.error.errors.map(e => e.message).join(', ')
        } as ApiResponse);
      }

      const { pelanggan_id } = validation.data;
      const sessionId = req.headers['x-kasir-session'] as string || `session_${user.id}`;

      if (!pelanggan_id) {
        return res.json({
          success: true,
          message: 'Pelanggan dihapus dari transaksi',
          data: null
        } as ApiResponse);
      }

      const pelanggan = await KasirService.setPelanggan(sessionId, pelanggan_id, scope);

      return res.json({
        success: true,
        message: 'Pelanggan berhasil diset',
        data: pelanggan
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error setting customer:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Gagal set pelanggan',
        error: error.message
      } as ApiResponse);
    }
  }

  /**
   * Proses pembayaran dan selesaikan transaksi
   * POST /api/kasir/bayar
   */
  static async prosesTransaksi(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as AuthenticatedUser;
      const scope = req.accessScope as AccessScope;

      // Validasi request body
      const validation = PembayaranSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Data pembayaran tidak valid',
          error: validation.error.errors.map(e => e.message).join(', ')
        } as ApiResponse);
      }

      const { metode_bayar, jumlah_bayar, catatan } = validation.data;
      const sessionId = req.headers['x-kasir-session'] as string || `session_${user.id}`;

      // Get additional data from headers or body
      const cartItems = req.body.cart_items || [];
      const pelangganId = req.body.pelanggan_id;
      const diskonPersen = Number(req.body.diskon_persen || 0);
      const diskonNominal = Number(req.body.diskon_nominal || 0);

      if (cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Keranjang kosong, tidak dapat melakukan transaksi'
        } as ApiResponse);
      }

      const transaksi = await KasirService.prosesTransaksi(
        sessionId,
        user,
        scope,
        cartItems,
        pelangganId,
        metode_bayar as MetodeBayar,
        jumlah_bayar,
        diskonPersen,
        diskonNominal,
        catatan
      );

      // Real-time updates
      const roomId = `kasir_${scope.tenantId}_${scope.storeId}_${user.id}`;

      // Notify transaction completed
      this.emitToRoom(roomId, 'transaction:completed', {
        session_id: sessionId,
        transaksi: transaksi
      });

      // Notify inventory updates
      for (const item of transaksi.items) {
        this.emitToRoom(`inventory_${scope.tenantId}`, 'inventory:stock_updated', {
          produk_id: item.produk_id,
          // Would need actual stock values from updated inventory
          stok_tersedia: 0, // Get from inventory after update
          stok_reserved: 0
        });
      }

      // Clear cart after successful transaction
      this.emitToRoom(roomId, 'cart:cleared', {
        session_id: sessionId
      });

      return res.status(201).json({
        success: true,
        message: `Transaksi berhasil. Nomor: ${transaksi.nomor_transaksi}`,
        data: transaksi
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error processing transaction:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Gagal memproses transaksi',
        error: error.message
      } as ApiResponse);
    }
  }

  /**
   * Get detail transaksi
   * GET /api/kasir/transaksi/:transaksiId
   */
  static async getTransaksi(req: Request, res: Response): Promise<Response> {
    try {
      const scope = req.accessScope as AccessScope;
      const { transaksiId } = req.params;

      const transaksi = await KasirService.getTransaksiById(transaksiId, scope);

      if (!transaksi) {
        return res.status(404).json({
          success: false,
          message: 'Transaksi tidak ditemukan'
        } as ApiResponse);
      }

      return res.json({
        success: true,
        message: 'Detail transaksi',
        data: transaksi
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error getting transaction:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mendapatkan detail transaksi',
        error: error.message
      } as ApiResponse);
    }
  }

  /**
   * Get summary penjualan kasir hari ini
   * GET /api/kasir/summary
   */
  static async getSummary(req: Request, res: Response): Promise<Response> {
    try {
      const scope = req.accessScope as AccessScope;

      const summary = await KasirService.getSummaryHariIni(scope);

      return res.json({
        success: true,
        message: 'Summary penjualan hari ini',
        data: summary
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error getting summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mendapatkan summary',
        error: error.message
      } as ApiResponse);
    }
  }

  /**
   * Health check untuk kasir system
   * GET /api/kasir/health
   */
  static async healthCheck(req: Request, res: Response): Promise<Response> {
    try {
      const scope = req.accessScope as AccessScope;

      // Basic connectivity test
      const testResult = await KasirService.searchProduk(
        { limit: 1, aktif_only: true },
        scope
      );

      return res.json({
        success: true,
        message: 'Kasir system is healthy',
        data: {
          timestamp: new Date().toISOString(),
          tenant_id: scope.tenantId,
          store_id: scope.storeId,
          products_available: testResult.total > 0
        }
      } as ApiResponse);

    } catch (error: any) {
      console.error('Kasir health check failed:', error);
      return res.status(503).json({
        success: false,
        message: 'Kasir system is not healthy',
        error: error.message
      } as ApiResponse);
    }
  }
}