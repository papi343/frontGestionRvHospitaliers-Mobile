import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../api/client';
import { NotificationItem } from '../types';

let socket: Socket | null = null;

export const connectNotificationSocket = (
  token: string,
  userId: number,
  onNotificationReceived: (notification: NotificationItem) => void
) => {
  disconnectNotificationSocket();

  try {
    socket = io(API_BASE_URL, {
      auth: {
        token: `Bearer ${token}`,
        userId,
      },
      transports: ['websocket'],
      reconnectionAttempts: 3,
    });

    socket.on('connect', () => {
      console.log('Connected to hospital notification WebSocket');
    });

    socket.on('notification', (payload: any) => {
      const item: NotificationItem = {
        id: payload?.id ?? Date.now(),
        userId: payload?.userId ?? userId,
        message:
          typeof payload === 'string'
            ? payload
            : payload?.message || 'Nouvelle notification médicale reçue.',
        lu: false,
        createdAt: payload?.createdAt || new Date().toISOString(),
      };
      onNotificationReceived(item);
    });
  } catch (err) {
    console.warn('Socket connection warning:', err);
  }
};

export const disconnectNotificationSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
