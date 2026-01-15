import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useOnlineStatus() {
    const { user } = useAuthStore();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Send heartbeat immediately if logged in
        if (user) {
            sendHeartbeat();
        }

        // Start interval
        intervalRef.current = setInterval(() => {
            if (user && document.visibilityState === 'visible') {
                sendHeartbeat();
            }
        }, 30000); // 30s

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [user]);

    const sendHeartbeat = async () => {
        try {
            await api.post('/user/heartbeat');
        } catch (e) {
            // Ignore heartbeat errors
        }
    };

    return isOnline;
}

export function isUserOnline(lastSeen: string | null) {
    if (!lastSeen) return false;
    const last = new Date(lastSeen).getTime();
    const now = new Date().getTime();
    // Consider online if seen within last 2 minutes
    return (now - last) < 2 * 60 * 1000;
}
