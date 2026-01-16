import { useState, useEffect, useRef } from 'react';
import api, { supabase } from '@/lib/api';
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
            // Direct update via Supabase client (more robust than backend proxy)
            if (user?.id) {
                // console.log("Sending heartbeat for:", user.id);
                const { error } = await supabase
                    .from('users')
                    .update({ last_seen: new Date().toISOString() })
                    .eq('id', user.id);
                
                if (error) {
                    // console.error("Heartbeat RLS Error:", error);
                    // Fallback to backend if direct update fails (e.g. RLS issues)
                    await api.post('/user/heartbeat');
                } else {
                    // console.log("Heartbeat success");
                }
            }
        } catch (e) {
            console.error("Heartbeat fatal error", e);
        }
    };

    return isOnline;
}

export function isUserOnline(lastSeen: string | null) {
    if (!lastSeen) return false;
    const last = new Date(lastSeen).getTime();
    const now = new Date().getTime();
    
    // Debug time difference
    const diffMinutes = (now - last) / (1000 * 60);
    // console.log(`Online Check: diff=${diffMinutes.toFixed(2)} mins, last=${lastSeen}`);
    
    // Consider online if seen within last 60 minutes (extremely relaxed for testing)
    // If this works, we know it's a timezone/clock drift issue
    return diffMinutes < 60;
}
