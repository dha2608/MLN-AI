import { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, MessageSquare, Bell, Search, Send, X, Clock } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { clsx } from 'clsx';

// Types
interface User {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
}

interface FriendRequest {
    id: string;
    sender: User;
    created_at: string;
}

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
}

interface Notification {
    id: string;
    type: string;
    title: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export default function Social() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'friends' | 'messages' | 'notifications'>('friends');
    
    // State
    const [friends, setFriends] = useState<User[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    // Messaging State
    const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Loading States
    const [isLoading, setIsLoading] = useState(false);

    // --- Effects ---
    useEffect(() => {
        fetchData();
        // Poll for notifications every 30s (Simple "Realtime")
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        if (selectedFriend) {
            fetchMessages(selectedFriend.id);
            // Poll for messages
            const interval = setInterval(() => fetchMessages(selectedFriend.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedFriend]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- Fetch Actions ---
    const fetchData = () => {
        if (activeTab === 'friends') {
            fetchFriends();
            fetchRequests();
        } else if (activeTab === 'notifications') {
            fetchNotifications();
        }
    };

    const fetchFriends = async () => {
        try {
            const res = await api.get('/social/friends');
            if (Array.isArray(res.data)) {
                setFriends(res.data);
            } else {
                setFriends([]);
            }
        } catch (error) {
            console.error("Failed to fetch friends", error);
            setFriends([]);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await api.get('/social/friends/requests');
            if (Array.isArray(res.data)) {
                setRequests(res.data);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
            setRequests([]);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/social/notifications');
            if (Array.isArray(res.data)) {
                setNotifications(res.data);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            setNotifications([]);
        }
    };

    const fetchMessages = async (friendId: string) => {
        try {
            const res = await api.get(`/social/messages/${friendId}`);
            if (Array.isArray(res.data)) {
                setMessages(res.data);
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
            setMessages([]);
        }
    };

    // --- User Actions ---
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        try {
            const res = await api.get(`/social/users/search?query=${searchQuery}`);
            if (Array.isArray(res.data)) {
                setSearchResults(res.data);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Search failed", error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendFriendRequest = async (targetId: string) => {
        try {
            await api.post('/social/friends/request', { target_user_id: targetId });
            alert("Đã gửi lời mời kết bạn!");
            setSearchResults(prev => prev.filter(u => u.id !== targetId));
        } catch (error: any) {
            alert(error.response?.data?.detail || "Gửi thất bại");
        }
    };

    const acceptRequest = async (requestId: string) => {
        try {
            await api.post('/social/friends/accept', { request_id: requestId });
            fetchRequests();
            fetchFriends();
        } catch (error) {
            console.error("Accept failed", error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedFriend) return;
        try {
            const content = newMessage;
            setNewMessage(''); // Optimistic clear
            await api.post('/social/messages/send', { 
                receiver_id: selectedFriend.id,
                content: content 
            });
            fetchMessages(selectedFriend.id);
        } catch (error) {
            console.error("Send message failed", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // --- Render Helpers ---
    const renderAvatar = (u: User, size = "w-10 h-10") => (
        <div className={`${size} rounded-full bg-soviet-red-100 flex items-center justify-center text-soviet-red-700 font-bold overflow-hidden border border-gray-200`}>
            {u.avatar_url ? (
                <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
            ) : (
                (u.name || '?').charAt(0).toUpperCase()
            )}
        </div>
    );

    return (
        <div className="flex h-full bg-gray-50 font-sans overflow-hidden">
            {/* Sidebar for Social */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-xl font-serif font-bold text-gray-800 flex items-center">
                        <Users className="mr-2 h-6 w-6 text-soviet-red-700" />
                        Cộng đồng
                    </h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button 
                        onClick={() => setActiveTab('friends')}
                        className={clsx("w-full flex items-center px-4 py-3 rounded-xl transition-colors", activeTab === 'friends' ? "bg-soviet-red-50 text-soviet-red-700 font-medium" : "text-gray-600 hover:bg-gray-50")}
                    >
                        <Users className="mr-3 h-5 w-5" /> Bạn bè
                    </button>
                    <button 
                        onClick={() => setActiveTab('messages')}
                        className={clsx("w-full flex items-center px-4 py-3 rounded-xl transition-colors", activeTab === 'messages' ? "bg-soviet-red-50 text-soviet-red-700 font-medium" : "text-gray-600 hover:bg-gray-50")}
                    >
                        <MessageSquare className="mr-3 h-5 w-5" /> Tin nhắn
                    </button>
                    <button 
                        onClick={() => setActiveTab('notifications')}
                        className={clsx("w-full flex items-center px-4 py-3 rounded-xl transition-colors", activeTab === 'notifications' ? "bg-soviet-red-50 text-soviet-red-700 font-medium" : "text-gray-600 hover:bg-gray-50")}
                    >
                        <Bell className="mr-3 h-5 w-5" /> Thông báo
                        {notifications.some(n => !n.is_read) && (
                            <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>
                </nav>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-50">
                 <button onClick={() => setActiveTab('friends')} className={clsx("p-2", activeTab === 'friends' && "text-soviet-red-700")}><Users /></button>
                 <button onClick={() => setActiveTab('messages')} className={clsx("p-2", activeTab === 'messages' && "text-soviet-red-700")}><MessageSquare /></button>
                 <button onClick={() => setActiveTab('notifications')} className={clsx("p-2", activeTab === 'notifications' && "text-soviet-red-700")}><Bell /></button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {activeTab === 'friends' && (
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Search Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Tìm kiếm bạn mới</h3>
                            <div className="flex space-x-2">
                                <input 
                                    type="text" 
                                    placeholder="Nhập tên hoặc email..." 
                                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-soviet-red-500 focus:outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button 
                                    onClick={handleSearch}
                                    className="bg-soviet-red-700 text-white px-4 py-2 rounded-xl hover:bg-soviet-red-800"
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                            </div>
                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {searchResults.map(u => (
                                        <div key={u.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center">
                                                {renderAvatar(u)}
                                                <div className="ml-3">
                                                    <div className="font-medium text-gray-900">{u.name}</div>
                                                    <div className="text-xs text-gray-500">{u.email}</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => sendFriendRequest(u.id)}
                                                className="text-soviet-red-700 hover:bg-soviet-red-50 p-2 rounded-full"
                                            >
                                                <UserPlus className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Requests Section */}
                        {requests.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <Clock className="mr-2 h-5 w-5 text-amber-500" />
                                    Lời mời kết bạn
                                </h3>
                                <div className="space-y-3">
                                    {requests.map(req => (
                                        <div key={req.id} className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center justify-between">
                                            <div className="flex items-center">
                                                {renderAvatar(req.sender)}
                                                <div className="ml-3">
                                                    <span className="font-medium text-gray-900">{req.sender.name}</span>
                                                    <span className="text-gray-600 text-sm ml-2">muốn kết bạn với bạn</span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button onClick={() => acceptRequest(req.id)} className="bg-soviet-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-soviet-red-700">Chấp nhận</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Friends List */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Danh sách bạn bè ({friends.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {friends.map(friend => (
                                    <div key={friend.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center cursor-pointer" onClick={() => { setActiveTab('messages'); setSelectedFriend(friend); }}>
                                        {renderAvatar(friend, "w-12 h-12")}
                                        <div className="ml-4">
                                            <div className="font-bold text-gray-900">{friend.name}</div>
                                            <div className="text-xs text-green-600 flex items-center mt-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div> Online
                                            </div>
                                        </div>
                                        <MessageSquare className="ml-auto text-gray-300 h-5 w-5" />
                                    </div>
                                ))}
                                {friends.length === 0 && (
                                    <div className="col-span-full text-center py-10 text-gray-400 italic">
                                        Bạn chưa có bạn bè nào. Hãy tìm kiếm và kết bạn nhé!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="flex h-full">
                        {/* Friend List for Chat */}
                        <div className="w-1/3 border-r border-gray-200 overflow-y-auto hidden md:block">
                            <div className="p-4 border-b border-gray-100 font-bold text-gray-700">Tin nhắn</div>
                            {friends.map(friend => (
                                <div 
                                    key={friend.id} 
                                    onClick={() => setSelectedFriend(friend)}
                                    className={clsx(
                                        "p-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors",
                                        selectedFriend?.id === friend.id ? "bg-soviet-red-50 border-r-4 border-soviet-red-600" : ""
                                    )}
                                >
                                    {renderAvatar(friend)}
                                    <div className="ml-3 truncate">
                                        <div className="font-medium text-gray-900">{friend.name}</div>
                                        <div className="text-xs text-gray-500 truncate">Bấm để trò chuyện</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Window */}
                        <div className="flex-1 flex flex-col bg-white">
                            {selectedFriend ? (
                                <>
                                    <div className="p-4 border-b border-gray-200 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center">
                                            <button className="md:hidden mr-2" onClick={() => setSelectedFriend(null)}>
                                                <X className="h-5 w-5" />
                                            </button>
                                            {renderAvatar(selectedFriend)}
                                            <div className="ml-3">
                                                <div className="font-bold text-gray-900">{selectedFriend.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                        {messages.map(msg => {
                                            const isMe = msg.sender_id === user?.id;
                                            return (
                                                <div key={msg.id} className={clsx("flex", isMe ? "justify-end" : "justify-start")}>
                                                    <div className={clsx(
                                                        "max-w-[70%] p-3 rounded-2xl shadow-sm text-sm",
                                                        isMe ? "bg-soviet-red-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                                                    )}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <div className="flex space-x-2">
                                            <input 
                                                type="text" 
                                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-soviet-red-500 focus:outline-none"
                                                placeholder="Nhập tin nhắn..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                            />
                                            <button 
                                                onClick={sendMessage}
                                                className="bg-soviet-red-700 text-white p-2 rounded-full hover:bg-soviet-red-800 shadow-md"
                                            >
                                                <Send className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                    <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                                    <p>Chọn một người bạn để bắt đầu trò chuyện</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Thông báo</h3>
                        <div className="space-y-4">
                            {notifications.map(notif => (
                                <div key={notif.id} className={clsx("p-4 rounded-xl border flex items-start", notif.is_read ? "bg-white border-gray-100" : "bg-blue-50 border-blue-100")}>
                                    <div className="bg-white p-2 rounded-full shadow-sm mr-4 text-soviet-red-600">
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm">{notif.title}</h4>
                                        <p className="text-gray-600 text-sm mt-1">{notif.content}</p>
                                        <div className="text-xs text-gray-400 mt-2">{new Date(notif.created_at).toLocaleString('vi-VN')}</div>
                                    </div>
                                    {!notif.is_read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    )}
                                </div>
                            ))}
                            {notifications.length === 0 && (
                                <div className="text-center py-10 text-gray-400">Không có thông báo mới</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
