import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api/client';

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://lightsalmon-ibis-912038.hostingersite.com').replace(/\/$/, '');

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      console.warn('[Socket] No access token found, skipping connection');
      return;
    }

    console.log('[Socket] Initializing connection to:', BACKEND_URL);
    
    // Accept token from socket.handshake.auth.token OR query.token
    const socketInstance = io(BACKEND_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('✅ [Socket] Connected to server:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ [Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('⚠️ [Socket] Connection error:', error.message);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      console.log('[Socket] Cleaning up connection');
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
