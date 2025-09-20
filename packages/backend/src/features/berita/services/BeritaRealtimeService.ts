import { Server } from 'socket.io';
import { BeritaWithUser } from '@/features/berita/models/BeritaCore';
import { logger } from '@/core/utils/logger';

export class BeritaRealtimeService {
  private static io: Server | null = null;

  static initialize(io: Server): void {
    this.io = io;
    logger.info('BeritaRealtimeService initialized');
  }

  private static ensureIO(): Server | null {
    if (!this.io) {
      logger.warn('BeritaRealtimeService used before initialization');
    }
    return this.io;
  }

  private static tenantRoom(tenantId: string): string {
    return `tenant_${tenantId}`;
  }

  private static emitToTenant(tenantId: string, event: string, payload?: any): void {
    const io = this.ensureIO();
    if (!io) {
      return;
    }
    const room = this.tenantRoom(tenantId);
    io.to(room).emit(event, payload);
  }

  private static emitGlobal(event: string): void {
    const io = this.ensureIO();
    if (!io) {
      return;
    }
    io.emit(event);
  }

  private static broadcastTargets(berita: BeritaWithUser, event: string, payload?: any): void {
    // Always notify the tenant who owns the berita
    this.emitToTenant(berita.tenantId, event, payload);

    // Jika berita ditargetkan ke tenant lainnya, broadcast juga
    if (berita.targetTenantIds && Array.isArray(berita.targetTenantIds)) {
      berita.targetTenantIds.forEach((tenantId) => {
        if (tenantId && tenantId !== berita.tenantId) {
          this.emitToTenant(tenantId, event, payload);
        }
      });
    }

    // Untuk kasus super global, kirim event global agar listener melakukan refresh
    if (berita.targetTampil === 'semua_tenant' && (!berita.targetTenantIds || berita.targetTenantIds.length === 0)) {
      this.emitGlobal('berita:refresh');
    }
  }

  static emitCreated(berita: BeritaWithUser): void {
    this.broadcastTargets(berita, 'berita:created', berita);
    this.emitGlobal('berita:refresh');
  }

  static emitUpdated(berita: BeritaWithUser): void {
    this.broadcastTargets(berita, 'berita:updated', berita);
    this.emitGlobal('berita:refresh');
  }

  static emitDeleted(beritaId: string, tenantId: string, targetTenantIds?: string[] | null): void {
    const io = this.ensureIO();
    if (!io) {
      return;
    }
    const payload = { id: beritaId };
    this.emitToTenant(tenantId, 'berita:deleted', payload);
    if (targetTenantIds && Array.isArray(targetTenantIds)) {
      targetTenantIds.forEach((id) => {
        if (id && id !== tenantId) {
          this.emitToTenant(id, 'berita:deleted', payload);
        }
      });
    }
    this.emitGlobal('berita:refresh');
  }
}
