import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from './api';

let socket: Socket | null = null;

export const getSocket = (token: string): Socket => {
  if (socket) return socket;

  socket = io(BACKEND_URL, {
    auth: {
      token: token.startsWith('Bearer ') ? token : `Bearer ${token}`
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
