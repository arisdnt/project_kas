import { useEffect } from 'react';
import { socket, ensureConnected } from '@/core/socket';
import { useAuthStore } from '@/core/store/authStore';
import { useBeritaStore } from '@/features/berita/store/beritaStore';
import { BeritaItem } from '@/features/berita/types/berita';

export function useBeritaRealtime() {
  const user = useAuthStore((state) => state.user);
  const handleUpsert = useBeritaStore((state) => state.handleRealtimeUpsert);
  const handleDelete = useBeritaStore((state) => state.handleRealtimeDelete);

  useEffect(() => {
    ensureConnected();
  }, []);

  useEffect(() => {
    if (!user?.tenantId) {
      return;
    }
    ensureConnected();
    socket.emit('join_tenant', { tenant_id: user.tenantId });
    return () => {
      socket.emit('leave_tenant', { tenant_id: user.tenantId });
    };
  }, [user?.tenantId]);

  useEffect(() => {
    const onCreated = (payload: BeritaItem) => {
      handleUpsert(payload);
    };

    const onUpdated = (payload: BeritaItem) => {
      handleUpsert(payload);
    };

    const onDeleted = (payload: { id: string }) => {
      if (!payload?.id) {
        return;
      }
      handleDelete(payload.id);
    };

    const onRefresh = () => {
      handleUpsert();
    };

    socket.on('berita:created', onCreated);
    socket.on('berita:updated', onUpdated);
    socket.on('berita:deleted', onDeleted);
    socket.on('berita:refresh', onRefresh);

    return () => {
      socket.off('berita:created', onCreated);
      socket.off('berita:updated', onUpdated);
      socket.off('berita:deleted', onDeleted);
      socket.off('berita:refresh', onRefresh);
    };
  }, [handleUpsert, handleDelete]);
}
