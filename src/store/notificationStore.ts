import { create } from 'zustand';
import api from '@/lib/api';

export interface Notification {
    id: string;
    type: string;
    title: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    fetchNotifications: async () => {
        try {
            const res = await api.get('/social/notifications');
            const data = Array.isArray(res.data) ? res.data : [];
            const unread = data.filter((n: Notification) => !n.is_read).length;
            set({ notifications: data, unreadCount: unread });
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    },
    markAsRead: async (id: string) => {
        // Optimistic
        set(state => {
            const newNotifs = state.notifications.map(n => 
                n.id === id ? { ...n, is_read: true } : n
            );
            return {
                notifications: newNotifs,
                unreadCount: newNotifs.filter(n => !n.is_read).length
            };
        });
        
        try {
            await api.post(`/social/notifications/${id}/read`);
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    },
    markAllAsRead: async () => {
         set(state => ({
            notifications: state.notifications.map(n => ({ ...n, is_read: true })),
            unreadCount: 0
         }));
         try {
            await api.post(`/social/notifications/read-all`);
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    }
}));
