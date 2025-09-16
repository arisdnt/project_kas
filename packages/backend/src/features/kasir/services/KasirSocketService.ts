/**
 * Kasir Socket Service - Real-time WebSocket Management untuk POS System
 * Menangani Socket.IO events, room management, dan real-time notifications
 */

import { Server, Socket } from 'socket.io';
import { AuthenticatedUser } from '@/features/auth/models/User';
import { KasirSocketEvents } from '../models/KasirCore';

export class KasirSocketService {
  private static io: Server;

  /**
   * Initialize Socket.IO server untuk kasir
   */
  static initialize(io: Server) {
    this.io = io;

    // Setup kasir namespace atau use default
    const kasirNamespace = io.of('/kasir');

    kasirNamespace.on('connection', (socket: Socket) => {
      console.log(`Kasir client connected: ${socket.id}`);

      // Handle kasir-specific events
      this.setupKasirEventHandlers(socket);

      socket.on('disconnect', (reason) => {
        console.log(`Kasir client disconnected: ${socket.id}, reason: ${reason}`);
        this.handleClientDisconnect(socket);
      });
    });

    // Setup main namespace untuk global events
    io.on('connection', (socket: Socket) => {
      this.setupGlobalEventHandlers(socket);
    });
  }

  /**
   * Setup event handlers khusus kasir
   */
  private static setupKasirEventHandlers(socket: Socket) {
    // Join kasir room berdasarkan user dan store
    socket.on('kasir:join_room', (data: {
      user_id: string;
      tenant_id: string;
      store_id: string;
      session_id?: string;
    }) => {
      const roomId = `kasir_${data.tenant_id}_${data.store_id}_${data.user_id}`;
      socket.join(roomId);

      console.log(`User ${data.user_id} joined kasir room: ${roomId}`);

      socket.emit('kasir:room_joined', {
        room_id: roomId,
        message: 'Successfully joined kasir room'
      });
    });

    // Leave kasir room
    socket.on('kasir:leave_room', (data: { room_id: string }) => {
      socket.leave(data.room_id);
      console.log(`Socket ${socket.id} left kasir room: ${data.room_id}`);
    });

    // Handle kasir session events
    socket.on('kasir:session_start', (data: {
      session_id: string;
      user_id: string;
    }) => {
      // Store session info in socket
      (socket as any).kasirSession = data;

      socket.emit('kasir:session_started', {
        session_id: data.session_id,
        timestamp: new Date().toISOString()
      });
    });

    // Handle cart synchronization request
    socket.on('kasir:sync_cart', (data: { session_id: string }) => {
      // In production, get cart state from database/cache
      socket.emit('kasir:cart_synced', {
        session_id: data.session_id,
        cart_items: [], // Would fetch from database
        timestamp: new Date().toISOString()
      });
    });

    // Handle offline mode toggle
    socket.on('kasir:toggle_offline', (data: { enabled: boolean }) => {
      const user = (socket as any).user as AuthenticatedUser;
      if (user) {
        const roomId = `kasir_${user.tenantId}_${user.tokoId}_${user.id}`;
        this.io.to(roomId).emit('kasir:offline_mode', {
          enabled: data.enabled,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle barcode scan events
    socket.on('kasir:barcode_scanned', (data: {
      barcode: string;
      session_id: string;
    }) => {
      // Broadcast to other devices in same session
      const user = (socket as any).user as AuthenticatedUser;
      if (user) {
        const roomId = `kasir_${user.tenantId}_${user.tokoId}_${user.id}`;
        socket.to(roomId).emit('kasir:barcode_received', {
          barcode: data.barcode,
          session_id: data.session_id,
          scanned_by: socket.id,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle cash drawer events
    socket.on('kasir:open_cash_drawer', (data: { reason: string }) => {
      console.log(`Cash drawer opened by ${socket.id}, reason: ${data.reason}`);

      socket.emit('kasir:cash_drawer_opened', {
        timestamp: new Date().toISOString(),
        reason: data.reason
      });
    });

    // Handle printer events
    socket.on('kasir:print_receipt', (data: {
      transaction_id: string;
      receipt_type: 'customer' | 'merchant' | 'duplicate';
    }) => {
      console.log(`Print request from ${socket.id}:`, data);

      // In production, integrate with printer service
      socket.emit('kasir:receipt_printed', {
        transaction_id: data.transaction_id,
        receipt_type: data.receipt_type,
        status: 'success',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Setup global event handlers
   */
  private static setupGlobalEventHandlers(socket: Socket) {
    // Join inventory room untuk real-time stock updates
    socket.on('inventory:join', (data: { tenant_id: string }) => {
      const inventoryRoom = `inventory_${data.tenant_id}`;
      socket.join(inventoryRoom);
      console.log(`Socket ${socket.id} joined inventory room: ${inventoryRoom}`);
    });

    // Join store room untuk store-wide notifications
    socket.on('store:join', (data: { tenant_id: string; store_id: string }) => {
      const storeRoom = `store_${data.tenant_id}_${data.store_id}`;
      socket.join(storeRoom);
      console.log(`Socket ${socket.id} joined store room: ${storeRoom}`);
    });
  }

  /**
   * Handle client disconnect
   */
  private static handleClientDisconnect(socket: Socket) {
    const session = (socket as any).kasirSession;
    if (session) {
      // Notify other clients in same room about disconnect
      const user = (socket as any).user as AuthenticatedUser;
      if (user) {
        const roomId = `kasir_${user.tenantId}_${user.tokoId}_${user.id}`;
        socket.to(roomId).emit('kasir:user_disconnected', {
          session_id: session.session_id,
          user_id: session.user_id,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Emit cart item added event
   */
  static emitCartItemAdded(
    roomId: string,
    sessionId: string,
    item: any
  ) {
    if (this.io) {
      this.io.to(roomId).emit('cart:item_added', {
        session_id: sessionId,
        item,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit cart item updated event
   */
  static emitCartItemUpdated(
    roomId: string,
    sessionId: string,
    produkId: string,
    updatedItem: any
  ) {
    if (this.io) {
      this.io.to(roomId).emit('cart:item_updated', {
        session_id: sessionId,
        produk_id: produkId,
        item: updatedItem,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit cart item removed event
   */
  static emitCartItemRemoved(
    roomId: string,
    sessionId: string,
    produkId: string
  ) {
    if (this.io) {
      this.io.to(roomId).emit('cart:item_removed', {
        session_id: sessionId,
        produk_id: produkId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit cart cleared event
   */
  static emitCartCleared(roomId: string, sessionId: string) {
    if (this.io) {
      this.io.to(roomId).emit('cart:cleared', {
        session_id: sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit transaction completed event
   */
  static emitTransactionCompleted(
    roomId: string,
    sessionId: string,
    transaksi: any
  ) {
    if (this.io) {
      this.io.to(roomId).emit('transaction:completed', {
        session_id: sessionId,
        transaksi,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit transaction cancelled event
   */
  static emitTransactionCancelled(
    roomId: string,
    sessionId: string,
    reason: string
  ) {
    if (this.io) {
      this.io.to(roomId).emit('transaction:cancelled', {
        session_id: sessionId,
        reason,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit inventory stock updated event
   */
  static emitInventoryUpdated(
    tenantId: string,
    produkId: string,
    stokTersedia: number,
    stokReserved: number
  ) {
    if (this.io) {
      const inventoryRoom = `inventory_${tenantId}`;
      this.io.to(inventoryRoom).emit('inventory:stock_updated', {
        produk_id: produkId,
        stok_tersedia: stokTersedia,
        stok_reserved: stokReserved,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit low stock alert
   */
  static emitLowStockAlert(
    tenantId: string,
    produkId: string,
    namaProduk: string,
    stokTersedia: number,
    stokMinimum: number
  ) {
    if (this.io) {
      const inventoryRoom = `inventory_${tenantId}`;
      this.io.to(inventoryRoom).emit('inventory:low_stock_alert', {
        produk_id: produkId,
        nama_produk: namaProduk,
        stok_tersedia: stokTersedia,
        stok_minimum: stokMinimum,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit session expired event
   */
  static emitSessionExpired(roomId: string, sessionId: string) {
    if (this.io) {
      this.io.to(roomId).emit('kasir:session_expired', {
        session_id: sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Broadcast store announcement
   */
  static broadcastStoreAnnouncement(
    tenantId: string,
    storeId: string,
    message: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info'
  ) {
    if (this.io) {
      const storeRoom = `store_${tenantId}_${storeId}`;
      this.io.to(storeRoom).emit('store:announcement', {
        message,
        type,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get active kasir sessions count
   */
  static getActiveSessionsCount(tenantId: string, storeId: string): number {
    if (!this.io) return 0;

    const roomId = `kasir_${tenantId}_${storeId}`;
    const room = this.io.sockets.adapter.rooms.get(roomId);
    return room ? room.size : 0;
  }

  /**
   * Get all active rooms
   */
  static getActiveRooms(): string[] {
    if (!this.io) return [];

    const rooms: string[] = [];
    for (const [roomId] of this.io.sockets.adapter.rooms) {
      if (roomId.startsWith('kasir_') || roomId.startsWith('inventory_') || roomId.startsWith('store_')) {
        rooms.push(roomId);
      }
    }
    return rooms;
  }

  /**
   * Force disconnect user from all kasir rooms
   */
  static forceDisconnectUser(userId: string) {
    if (!this.io) return;

    this.io.sockets.sockets.forEach((socket) => {
      const session = (socket as any).kasirSession;
      if (session && session.user_id === userId) {
        socket.emit('kasir:force_disconnect', {
          reason: 'Administrative action',
          timestamp: new Date().toISOString()
        });
        socket.disconnect(true);
      }
    });
  }
}