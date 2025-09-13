import { useEffect, useState } from 'react';
import { socket, ensureConnected } from '@/core/socket';

export function useSocketStatus() {
  const [connected, setConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    ensureConnected();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // If already connected due to eager connect
    setConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return { connected };
}

