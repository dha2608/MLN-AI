import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

export default function NotificationManager() {
    const { user } = useAuthStore();
    const { notifications, fetchNotifications } = useNotificationStore();
    const lastNotifIdRef = useRef<string | null>(null);
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (!user) return;

        // Initial fetch
        fetchNotifications();

        // Poll every 30s
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, [user]);

    // Check for new notifications to show toast
    useEffect(() => {
        if (!user || notifications.length === 0) return;

        const latest = notifications[0];
        
        // If it's the first load, don't spam toasts, just set ref
        if (isFirstLoad.current) {
            lastNotifIdRef.current = latest.id;
            isFirstLoad.current = false;
            
            // Show "You have X unread notifications" if offline -> online
            const unread = notifications.filter(n => !n.is_read).length;
            if (unread > 0) {
                 toast((t) => (
                    <div className="flex items-center cursor-pointer" onClick={() => {
                        toast.dismiss(t.id);
                        // We could navigate, but simple dismiss is fine for now
                    }}>
                        <div className="bg-soviet-red-100 p-2 rounded-full mr-3 text-soviet-red-600">
                            <Bell className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Chào mừng trở lại!</p>
                            <p className="text-sm text-gray-600">Bạn có {unread} thông báo mới.</p>
                        </div>
                    </div>
                ), { duration: 5000 });
            }
            return;
        }

        // If new notification appears (ID changed and it's newer)
        if (latest.id !== lastNotifIdRef.current) {
            // It's a new one!
            lastNotifIdRef.current = latest.id;
            
            // Only toast if it's unread (should be)
            if (!latest.is_read) {
                toast((t) => (
                    <div className="flex items-start">
                         <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600 mt-1">
                            <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm">{latest.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{latest.content}</p>
                        </div>
                    </div>
                ), { duration: 5000 });
            }
        }
    }, [notifications, user]);

    return null; // Logic only component
}
