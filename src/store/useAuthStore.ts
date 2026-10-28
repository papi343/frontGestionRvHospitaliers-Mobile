import { create } from 'zustand';
import { authApi, hospitalApi } from '../api/services';
import { setClientAuthToken, API_BASE_URL, setApiBaseUrl } from '../api/client';
import { NotificationItem, UserProfile } from '../types';
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from '../sockets/notificationSocket';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  notifications: NotificationItem[];
  apiUrl: string;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: {
    email: string;
    password: string;
    nom: string;
    dateNaissance: string;
  }) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  updateServerUrl: (url: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  notifications: [],
  apiUrl: API_BASE_URL,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authApi.login(email, password);
      setClientAuthToken(token);
      set({ user, token, loading: false });

      // Load initial notifications and connect real-time socket
      await get().fetchNotifications();
      connectNotificationSocket(token, user.id, (newNotif) => {
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      });

      return true;
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || 'Échec de connexion',
      });
      return false;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authApi.register(payload);
      setClientAuthToken(token);
      set({ user, token, loading: false });

      await get().fetchNotifications();
      connectNotificationSocket(token, user.id, (newNotif) => {
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      });

      return true;
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Échec lors de l'inscription",
      });
      return false;
    }
  },

  logout: () => {
    disconnectNotificationSocket();
    setClientAuthToken(null);
    set({ user: null, token: null, notifications: [], error: null });
  },

  clearError: () => set({ error: null }),

  fetchNotifications: async () => {
    const user = get().user;
    if (!user) return;
    const list = await hospitalApi.getNotifications(user.id);
    set({ notifications: list });
  },

  markNotificationRead: async (id: number) => {
    await hospitalApi.markNotificationAsRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, lu: true } : n
      ),
    }));
  },

  updateServerUrl: (url: string) => {
    setApiBaseUrl(url);
    set({ apiUrl: url });
  },
}));
