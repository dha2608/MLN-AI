import { useState, useEffect } from 'react';
import api, { supabase } from '@/lib/api';
import { isUserOnline } from '@/hooks/useOnlineStatus';
import { Search, UserPlus, MessageCircle, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface UserProfile {
    id: string;
    name: string;
    avatar_url: string | null;
    last_seen: string | null;
    bio: string | null;
    interests: string[] | null;
}

export default function Community() {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const navigate = useNavigate();

    // Realtime subscription for online status
    useEffect(() => {
        const channel = supabase
            .channel('public:users')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                },
                (payload) => {
                    console.log("Realtime Update Received:", payload);
                    const updatedUser = payload.new as UserProfile;
                    setUsers((prevUsers) => 
                        prevUsers.map((user) => 
                            user.id === updatedUser.id ? { ...user, last_seen: updatedUser.last_seen } : user
                        )
                    );
                }
            )
            .subscribe((status) => {
                console.log("Realtime Subscription Status:", status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Re-fetch when debounced search changes
    useEffect(() => {
        if (debouncedSearch) {
            handleSearch(debouncedSearch);
        } else {
            fetchCommunity();
        }
    }, [debouncedSearch]);

    const handleSearch = async (query: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/user/search?query=${encodeURIComponent(query)}`);
            // Standardize format
            const formatted = res.data.map((u: any) => ({
                ...u,
                // Add defaults for missing fields in search result
                last_seen: u.last_seen || null,
                bio: u.bio || null,
                interests: u.interests || []
            }));
            setUsers(formatted);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCommunity = async () => {
        setLoading(true);
        try {
            // Use V2 endpoint directly to bypass 500 issues
            const res = await api.get('/user/community_v2');
            console.log("Community Data:", res.data); // DEBUG
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch community V2", error);
            try {
                // Fallback to old public endpoint just in case
                const fallbackRes = await api.get('/user/community/public_fallback');
                setUsers(fallbackRes.data);
            } catch (fbError) {
                console.error("Fallback also failed", fbError);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (userId: string) => {
        try {
            await api.post('/social/friends/request', { target_user_id: userId });
            toast.success("Đã gửi lời mời kết bạn");
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Gửi thất bại");
        }
    };

    const handleMessage = (userId: string) => {
        navigate(`/social?chat=${userId}`);
    };

    const onlineCount = users.filter(u => u.id !== currentUser?.id && isUserOnline(u.last_seen)).length;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Cộng đồng Học tập</h1>
                    <p className="text-gray-500 mt-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        {onlineCount} người đang online
                    </p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm thành viên..." 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-soviet-red-500 focus:outline-none w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soviet-red-700 mx-auto"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.filter(u => u.id !== currentUser?.id).map(user => {
                        const isOnline = isUserOnline(user.last_seen);
                        return (
                            <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
                                {isOnline && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">
                                        ONLINE
                                    </div>
                                )}
                                
                                <div className="flex items-center mb-4">
                                    <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center font-bold text-gray-500 text-xl">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{user.name}</h3>
                                        <p className="text-sm text-gray-500 truncate">
                                            {isOnline ? 'Đang hoạt động' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex-1">
                                    {user.bio ? (
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{user.bio}</p>
                                    ) : (
                                        <p className="text-gray-400 text-sm mb-3 italic">Chưa có giới thiệu</p>
                                    )}
                                    
                                    {user.interests && user.interests.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {user.interests.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                                    #{tag}
                                                </span>
                                            ))}
                                            {user.interests.length > 3 && (
                                                <span className="text-xs text-gray-400 self-center">+{user.interests.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                                    <button 
                                        onClick={() => handleAddFriend(user.id)}
                                        className="flex-1 flex items-center justify-center py-2 bg-soviet-red-50 text-soviet-red-700 rounded-lg text-sm font-medium hover:bg-soviet-red-100 transition-colors"
                                    >
                                        <UserPlus className="h-4 w-4 mr-1" />
                                        Kết bạn
                                    </button>
                                    <button 
                                        onClick={() => handleMessage(user.id)}
                                        className="flex-1 flex items-center justify-center py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                    >
                                        <MessageCircle className="h-4 w-4 mr-1" />
                                        Nhắn tin
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
