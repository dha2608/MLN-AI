import { useAuthStore } from '@/store/authStore';
import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Camera, Edit2, Save, X, Shield, Lock, Activity, Trophy, MessageSquare } from 'lucide-react';
import { isUserOnline } from '@/hooks/useOnlineStatus';

export default function Profile() {
  const { user, setSession } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [allowStrangers, setAllowStrangers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fullProfile, setFullProfile] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      fetchProfile();
  }, [user?.id]);

  const fetchProfile = async () => {
      try {
          const res = await api.get('/user/profile');
          const data = res.data;
          setFullProfile(data);
          setName(data.name || '');
          setBio(data.bio || '');
          setInterests(data.interests || []);
          setAllowStrangers(data.allow_stranger_messages ?? true);
      } catch (error) {
          console.error("Fetch profile error", error);
      }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await api.put('/user/profile', { 
          name,
          bio,
          interests,
          allow_stranger_messages: allowStrangers
      });
      
      // Update local store
      if (user) {
          setSession({
              access_token: localStorage.getItem('token'),
              user: { ...user, user_metadata: { ...user, name, full_name: name } }
          });
      }
      
      toast.success('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterest = (e: React.FormEvent) => {
      e.preventDefault();
      if (newInterest.trim() && !interests.includes(newInterest.trim())) {
          setInterests([...interests, newInterest.trim()]);
          setNewInterest('');
      }
  };

  const removeInterest = (tag: string) => {
      setInterests(interests.filter(i => i !== tag));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Đang tải ảnh lên...');
    try {
      const res = await api.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (user) {
          // Force refresh or update local state
          window.location.reload(); 
      }
      toast.success('Cập nhật ảnh đại diện thành công!', { id: toastId });
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên', { id: toastId });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover / Header */}
        <div className="h-32 bg-gradient-to-r from-soviet-red-700 to-soviet-red-900 relative">
            <div className="absolute top-4 right-4 flex space-x-2">
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-all flex items-center"
                    >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-all"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="bg-white text-soviet-red-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition-all flex items-center"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Lưu
                        </button>
                    </>
                )}
            </div>
        </div>

        <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex justify-between items-end">
                <div className="relative group">
                    <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 shadow-md overflow-hidden">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-gray-400">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleAvatarClick}
                        className="absolute bottom-0 right-0 p-2 bg-gray-900/70 text-white rounded-full hover:bg-gray-900 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                    >
                        <Camera className="h-4 w-4" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
            </div>

            {/* Main Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Basic Info */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-soviet-red-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân (Bio)</label>
                                    <textarea 
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-soviet-red-500 focus:outline-none"
                                        placeholder="Chia sẻ đôi chút về bạn..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{name}</h1>
                                <p className="text-gray-500 mb-4">{user?.email}</p>
                                {bio && (
                                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        {bio}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Interests */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-soviet-red-600" />
                            Sở thích & Mối quan tâm
                        </h3>
                        {isEditing ? (
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {interests.map((tag, idx) => (
                                        <span key={idx} className="bg-soviet-red-50 text-soviet-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                            #{tag}
                                            <button onClick={() => removeInterest(tag)} className="ml-2 hover:text-red-600"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                </div>
                                <form onSubmit={handleAddInterest} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newInterest}
                                        onChange={(e) => setNewInterest(e.target.value)}
                                        placeholder="Thêm sở thích (VD: Triết học, Lịch sử...)"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-soviet-red-500 focus:outline-none text-sm"
                                    />
                                    <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors">Thêm</button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {interests.length > 0 ? interests.map((tag, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                        #{tag}
                                    </span>
                                )) : (
                                    <span className="text-gray-400 italic text-sm">Chưa cập nhật sở thích</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Achievements & Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center">
                                <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                                Thành tựu
                            </h3>
                            {fullProfile?.achievements && fullProfile.achievements.length > 0 ? (
                                <div className="space-y-2">
                                    {fullProfile.achievements.map((ach: any, idx: number) => (
                                        <div key={idx} className="flex items-center text-sm">
                                            <span className="text-lg mr-2">{ach.icon || '🏅'}</span>
                                            <span className="text-gray-700">{ach.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">Chưa có thành tựu nào.</p>
                            )}
                        </div>
                        
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center">
                                <Activity className="h-4 w-4 mr-2 text-blue-500" />
                                Thống kê
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Câu hỏi đã hỏi</span>
                                    <span className="font-bold text-gray-900">{fullProfile?.stats?.total_questions || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Tham gia từ</span>
                                    <span className="font-bold text-gray-900">
                                        {fullProfile?.created_at ? new Date(fullProfile.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Status */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Trạng thái</h3>
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="text-gray-700 font-medium">Đang hoạt động</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Lần cuối: {fullProfile?.last_seen ? new Date(fullProfile.last_seen).toLocaleString('vi-VN') : 'Vừa xong'}
                        </p>
                    </div>

                    {/* Privacy Settings */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center text-sm uppercase tracking-wider">
                            <Shield className="h-4 w-4 mr-2 text-blue-600" />
                            Quyền riêng tư
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Nhận tin nhắn từ người lạ</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Cho phép người chưa kết bạn nhắn tin cho bạn.</p>
                                </div>
                                {isEditing ? (
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={allowStrangers}
                                            onChange={(e) => setAllowStrangers(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                ) : (
                                    <span className={clsx("text-xs font-bold px-2 py-1 rounded", allowStrangers ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                        {allowStrangers ? "BẬT" : "TẮT"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
