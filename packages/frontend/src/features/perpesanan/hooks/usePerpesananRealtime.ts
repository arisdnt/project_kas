import { useEffect } from 'react';
import { socket, ensureConnected } from '@/core/socket';
import { useAuthStore } from '@/core/store/authStore';
import { usePerpesananStore } from '@/features/perpesanan/store/perpesananStore';
import { PerpesananMessage } from '@/features/perpesanan/types/perpesanan';

export function usePerpesananRealtime() {
  const user = useAuthStore((state) => state.user);
  const receiveIncomingMessage = usePerpesananStore((state) => state.receiveIncomingMessage);
  const deleteMessageLocal = usePerpesananStore((state) => state.deleteMessageLocal);

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
    const onNewMessage = (payload: PerpesananMessage) => {
      receiveIncomingMessage(payload);
    };

    const onMessageUpdated = (payload: PerpesananMessage) => {
      receiveIncomingMessage(payload);
    };

    const onMessageDeleted = (payload: { id: string; partner_id: string }) => {
      if (!payload?.id || !payload?.partner_id) {
        return;
      }
      deleteMessageLocal(payload.partner_id, payload.id);
    };

    socket.on('perpesanan:new', onNewMessage);
    socket.on('perpesanan:updated', onMessageUpdated);
    socket.on('perpesanan:read', onMessageUpdated);
    socket.on('perpesanan:deleted', onMessageDeleted);

    return () => {
      socket.off('perpesanan:new', onNewMessage);
      socket.off('perpesanan:updated', onMessageUpdated);
      socket.off('perpesanan:read', onMessageUpdated);
      socket.off('perpesanan:deleted', onMessageDeleted);
    };
  }, [receiveIncomingMessage, deleteMessageLocal]);
}
