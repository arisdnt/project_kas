import { io as socketIo, Socket } from 'socket.io-client';
import { config } from '@/core/config';

// Simple centralized Socket.IO client per blueprint
const API_BASE_URL = `${config.api.url}:${config.api.port}`;

export const socket: Socket = socketIo(API_BASE_URL, {
  path: '/socket.io',
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export function ensureConnected() {
  if (!socket.connected && !socket.active) {
    socket.connect();
  }
}

