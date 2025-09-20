import { useEffect } from 'react';
import { socket, ensureConnected } from '@/core/socket';
import { useAuthStore } from '@/core/store/authStore';
import { useCatatanStore } from '@/features/catatan/store/catatanStore';
import { CatatanRecord } from '@/features/catatan/types/catatan';

export function useCatatanRealtime() {
  const tenantId = useAuthStore((state) => state.user?.tenantId);
  const upsertFromRealtime = useCatatanStore((state) => state.upsertFromRealtime);
  const removeFromRealtime = useCatatanStore((state) => state.removeFromRealtime);
  const fetchStats = useCatatanStore((state) => state.fetchStats);
  const fetchReminders = useCatatanStore((state) => state.fetchReminders);

  useEffect(() => {
    ensureConnected();
  }, []);

  useEffect(() => {
    if (!tenantId) {
      return;
    }
    ensureConnected();
    socket.emit('join_tenant', { tenant_id: tenantId });
    return () => {
      socket.emit('leave_tenant', { tenant_id: tenantId });
    };
  }, [tenantId]);

  useEffect(() => {
    const handleCreated = (record: CatatanRecord) => {
      upsertFromRealtime(record);
      fetchStats().catch(() => {});
      fetchReminders().catch(() => {});
    };

    const handleUpdated = (record: CatatanRecord) => {
      upsertFromRealtime(record);
      fetchStats().catch(() => {});
      fetchReminders().catch(() => {});
    };

    const handleDeleted = (payload: { id: string }) => {
      if (!payload?.id) {
        return;
      }
      removeFromRealtime(payload.id);
      fetchStats().catch(() => {});
      fetchReminders().catch(() => {});
    };

    socket.on('catatan:created', handleCreated);
    socket.on('catatan:updated', handleUpdated);
    socket.on('catatan:deleted', handleDeleted);

    return () => {
      socket.off('catatan:created', handleCreated);
      socket.off('catatan:updated', handleUpdated);
      socket.off('catatan:deleted', handleDeleted);
    };
  }, [upsertFromRealtime, removeFromRealtime, fetchStats, fetchReminders]);
}
