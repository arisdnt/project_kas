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
   * GET /api/kasir/produk/scan/:barcode
   */
  static async scanBarcode(req: Request, res: Response): Promise<Response> {
    try {
      const scope = req.accessScope as AccessScope;
      const { barcode } = req.params;

      if (!barcode) {
        return res.status(400).json({
          success: false,
          message: 'Barcode diperlukan'
        } as ApiResponse);
      }

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
   * Cari pelanggan berdasarkan nama/telepon
   * GET /api/kasir/pelanggan
   */
  static async searchPelanggan(req: Request, res: Response): Promise<Response> {
    try {
      const scope = req.accessScope as AccessScope;
      const { search, limit = 10 } = req.query;

      if (!search || typeof search !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Parameter search diperlukan'
        } as ApiResponse);
      }

      const pelanggan = await KasirService.searchPelanggan(
        search,
        parseInt(limit as string) || 10,
        scope
      );

      return res.json({
        success: true,
        message: 'Pencarian pelanggan berhasil',
        data: pelanggan
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error searching pelanggan:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mencari pelanggan',
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
      const rawBody = req.body;
      console.info('[Kasir][Cart][Add] Incoming', {
        userId: user?.id,
        tenantId: scope?.tenantId,
        storeId: scope?.storeId,
        body: rawBody
      });
      const validation = AddCartItemSchema.safeParse(rawBody);
      if (!validation.success) {
        console.warn('[Kasir][Cart][Add] Validation failed', {
          errors: validation.error.errors,
          body: rawBody
        });
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
  KasirController.emitToRoom(roomId, 'cart:item_added', {
        session_id: sessionId,
        item: cartItem
      });

      return res.status(201).json({
        success: true,
        message: 'Item berhasil ditambahkan ke cart',
        data: cartItem
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error adding item to cart:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
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
      const rawBody = req.body;
      console.info('[Kasir][Cart][Update] Incoming', {
        userId: user?.id,
        produkId,
        body: rawBody
      });
      const validation = UpdateCartItemSchema.safeParse(rawBody);
      if (!validation.success) {
        console.warn('[Kasir][Cart][Update] Validation failed', {
          errors: validation.error.errors,
          body: rawBody
        });
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
  KasirController.emitToRoom(roomId, 'cart:item_removed', {
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
  KasirController.emitToRoom(roomId, 'cart:item_updated', {
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
      console.error('Error updating cart item:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
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
  KasirController.emitToRoom(roomId, 'cart:item_removed', {
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
  KasirController.emitToRoom(roomId, 'cart:cleared', {
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
      const rawBody = req.body;
      console.info('[Kasir][Bayar] Incoming payment request', {
        tenantId: scope?.tenantId,
        storeId: scope?.storeId,
        userId: user?.id,
        bodyKeys: Object.keys(rawBody || {}),
        metode_bayar: rawBody?.metode_bayar,
        cart_items_length: Array.isArray(rawBody?.cart_items) ? rawBody.cart_items.length : 0
      });

      const validation = PembayaranSchema.safeParse(rawBody);
      if (!validation.success) {
        console.warn('[Kasir][Bayar] Validation failed', {
          errors: validation.error.errors,
          sampleItem: rawBody?.cart_items?.[0]
        });
        return res.status(400).json({
          success: false,
          message: 'Data pembayaran tidak valid',
          error: validation.error.errors.map(e => e.message).join(', ')
        } as ApiResponse);
      }

      const { 
        metode_bayar, 
        jumlah_bayar, 
        cart_items,
        pelanggan_id,
        diskon_persen = 0,
        diskon_nominal = 0,
        catatan 
      } = validation.data;
      
      const sessionId = req.headers['x-kasir-session'] as string || `session_${user.id}`;

      // Convert cart items dari request ke format KasirCartItem
      const kasirCartItems: any[] = [];
      for (const item of cart_items) {
        console.debug('[Kasir][Bayar] Resolving produk for cart item', {
          produk_id: item.produk_id,
          kuantitas: item.kuantitas,
          harga_satuan: item.harga_satuan
        });

        const produkData = await KasirService.getProdukById(item.produk_id, scope);
        if (!produkData) {
          console.warn('[Kasir][Bayar] Produk tidak ditemukan', { produk_id: item.produk_id });
          return res.status(400).json({
            success: false,
            message: `Produk dengan ID ${item.produk_id} tidak ditemukan`
          } as ApiResponse);
        }

        kasirCartItems.push({
          produk_id: produkData.id,
          nama_produk: produkData.nama,
          kode_produk: produkData.kode,
          barcode: produkData.barcode,
          harga_satuan: item.harga_satuan,
          kuantitas: item.kuantitas,
          subtotal: item.harga_satuan * item.kuantitas,
          diskon_persen: item.diskon_persen || 0,
          diskon_nominal: item.diskon_nominal || 0,
          stok_tersedia: produkData.stok_tersedia,
          stok_reserved: produkData.stok_reserved
        });
      }

      console.info('[Kasir][Bayar] Process transaction begin', {
        total_cart_items: kasirCartItems.length,
        metode_bayar,
        jumlah_bayar,
        pelanggan_id,
        diskon_persen,
        diskon_nominal
      });

      const transaksi = await KasirService.prosesTransaksi(
        sessionId,
        user,
        scope,
        kasirCartItems,
        pelanggan_id,
        metode_bayar as MetodeBayar,
        jumlah_bayar,
        diskon_persen,
        diskon_nominal,
        catatan
      );

      // Real-time updates
      const roomId = `kasir_${scope.tenantId}_${scope.storeId}_${user.id}`;

      // Notify transaction completed
  KasirController.emitToRoom(roomId, 'transaction:completed', {
        session_id: sessionId,
        transaksi: transaksi
      });

      // Notify inventory updates
      for (const item of transaksi.items) {
        this.emitToRoom(`inventory_${scope.tenantId}`, 'inventory:stock_updated', {
          produk_id: item.produk_id,
          stok_tersedia: 0, // Will be updated by inventory service
          stok_reserved: 0
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Transaksi berhasil diproses',
        data: {
          transaksi,
          kembalian: transaksi.kembalian
        }
      } as ApiResponse);

    } catch (error: any) {
      console.error('Error processing transaction:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      return res.status(500).json({
        success: false,
        message: 'Gagal memproses transaksi',
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