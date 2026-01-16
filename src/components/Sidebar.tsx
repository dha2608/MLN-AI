import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { MessageSquare, User, BarChart2, LogOut, Plus, BookOpen, Library, BrainCircuit, Trash2, Award, Edit3, Check, X, Users as UsersIcon, Trophy, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  const fetchRecentChats = async () => {
      try {
          const res = await api.get('/chat/history/recent');
          setRecentChats(res.data);
      } catch (e) {
          console.error("Failed to load history", e);
      }
  };

  useEffect(() => {
    if (user) {
        fetchRecentChats();
    }
  }, [user, location.pathname]);

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?")) return;
      
      try {
          await api.delete(`/chat/${chatId}`);
          toast.success("Đã xóa cuộc trò chuyện");
          fetchRecentChats();
          if (location.pathname === `/chat/${chatId}`) {
              navigate('/');
          }
      } catch (error) {
          toast.error("Xóa thất bại");
      }
  }

  const startRename = (e: React.MouseEvent, chat: any) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingChatId(chat.id);
      setEditTitle(chat.title || '');
  }

  const handleRename = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editTitle.trim()) return;
      
      try {
          await api.put(`/chat/${editingChatId}`, { title: editTitle });
          toast.success("Đã đổi tên");
          setEditingChatId(null);
          fetchRecentChats();
      } catch (error) {
          toast.error("Đổi tên thất bại");
      }
  }

  const cancelRename = () => {
      setEditingChatId(null);
  }

  const navItems = [
    { href: '/', label: 'Hỏi đáp Triết học', icon: MessageSquare },
    { href: '/library', label: 'Thư viện Triết học', icon: Library },
    { href: '/quiz', label: 'Trắc nghiệm', icon: BrainCircuit },
    { href: '/quiz/pvp', label: 'Đấu trường PvP', icon: Trophy },
    { href: '/leaderboard', label: 'Bảng xếp hạng', icon: Award },
    { href: '/social', label: 'Tin nhắn', icon: MessageSquare },
    { href: '/community', label: 'Thành viên', icon: Globe },
    { href: '/statistics', label: 'Thống kê học tập', icon: BarChart2 },
    { href: '/profile', label: 'Hồ sơ cá nhân', icon: User },
  ];

  return (
    <div className={clsx(
        "flex flex-col h-full w-72 bg-white border-r border-gray-200 shadow-lg z-40 font-sans transition-transform duration-300 ease-in-out",
        "fixed inset-y-0 left-0 lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-soviet-red-700 relative">
        <div className="flex items-center space-x-3 text-white">
          <div className="p-2 bg-soviet-gold-500 rounded-lg shadow-md">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
             <h1 className="font-serif font-bold text-lg leading-tight">Triết học M-L</h1>
             <p className="text-xs text-soviet-red-100 opacity-80">Trợ lý học tập AI</p>
          </div>
        </div>
        {/* Close button for mobile */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white lg:hidden"
        >
            <X className="h-6 w-6" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
          <Link to="/" className="block">
            <button className="w-full flex items-center justify-center px-4 py-3 border border-soviet-red-200 rounded-xl shadow-sm text-sm font-medium text-soviet-red-700 bg-soviet-red-50 hover:bg-soviet-red-100 hover:border-soviet-red-300 transition-all duration-200 group">
            <Plus className="mr-2 h-5 w-5 text-soviet-red-600 group-hover:scale-110 transition-transform" />
            Cuộc hội thoại mới
            </button>
          </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={clsx(
                'flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-soviet-red-50 text-soviet-red-800 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:pl-4'
              )}
            >
              <Icon
                className={clsx(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-soviet-red-600' : 'text-gray-400 group-hover:text-soviet-red-500'
                )}
              />
              {item.label}
              {item.href === '/social' && unreadCount > 0 && (
                 <span className="ml-auto bg-soviet-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                     {unreadCount > 9 ? '9+' : unreadCount}
                 </span>
              )}
            </Link>
          );
        })}
        
        {/* History */}
        <div className="mt-8">
             <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Lịch sử gần đây</p>
             <div className="space-y-1">
                {recentChats.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400 italic">
                        Chưa có lịch sử...
                    </div>
                ) : (
                    recentChats.map((chat) => (
                        editingChatId === chat.id ? (
                            <form key={chat.id} onSubmit={handleRename} className="px-3 py-2 flex items-center space-x-1 bg-white border border-soviet-red-300 rounded-lg shadow-sm">
                                <input
                                    ref={editInputRef}
                                    type="text"
                                    name="rename-chat"
                                    id="rename-chat-input"
                                    autoComplete="off"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full text-sm border-none focus:ring-0 p-0"
                                    autoFocus
                                />
                                <button type="submit" className="text-green-600 hover:text-green-700 p-1"><Check className="h-4 w-4" /></button>
                                <button type="button" onClick={cancelRename} className="text-red-500 hover:text-red-600 p-1"><X className="h-4 w-4" /></button>
                            </form>
                        ) : (
                        <Link
                            key={chat.id}
                            to={`/chat/${chat.id}`}
                            className={clsx(
                                "block px-3 py-2 text-sm rounded-lg truncate transition-colors group relative pr-16",
                                location.pathname === `/chat/${chat.id}`
                                    ? "bg-gray-100 text-gray-900 font-medium"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                            title={chat.title}
                        >
                            <span className="truncate block">{chat.title || "Cuộc hội thoại mới"}</span>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-inherit">
                                <button
                                    onClick={(e) => startRename(e, chat)}
                                    className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                                    title="Đổi tên"
                                >
                                    <Edit3 className="h-3 w-3" />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteChat(e, chat.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                                    title="Xóa"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </Link>
                        )
                    ))
                )}
             </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center">
            <Link to="/profile" className="flex items-center flex-1 min-w-0 group cursor-pointer" onClick={onClose}>
              <div className="h-10 w-10 rounded-full bg-soviet-red-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0 group-hover:border-soviet-red-300 transition-colors">
                 {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                 ) : (
                    <div className="h-full w-full flex items-center justify-center text-soviet-red-700 font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                 )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate font-serif group-hover:text-soviet-red-700 transition-colors">{user?.name || user?.email}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </Link>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-soviet-red-600 transition-colors rounded-lg hover:bg-white hover:shadow-sm ml-auto"
            title="Đăng xuất"
          >
            <span className="text-xs font-medium lg:hidden">Đăng xuất</span>
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}