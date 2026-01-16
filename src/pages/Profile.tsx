import { useAuthStore } from '@/store/authStore';
import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { isUserOnline } from '@/hooks/useOnlineStatus';
import toast from 'react-hot-toast';
import { Camera, Edit2, Save, X, Shield, Activity, Trophy, MessageSquare, UserPlus, Check, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function Profile() {
  const { user, setSession } = useAuthStore();
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [allowStrangers, setAllowStrangers] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [allAchievements, setAllAchievements] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
      fetchProfile();
      if (isOwnProfile) {
          fetchAllAchievements();
      }
  }, [userId, user?.id]);

  const fetchAllAchievements = async () => {
      try {
          const res = await api.get('/user/achievements/all');
          setAllAchievements(res.data || []);
      } catch (error) {
          console.error("Fetch achievements error", error);
      }
  };

  const fetchProfile = async () => {
      try {
          let url = '/user/profile';
          if (!isOwnProfile && userId) {
              url = `/user/profile/${userId}`;
          }

          const res = await api.get(url);
          const data = res.data;
          
          setProfileData(data);
          
          // Set form state
          setName(data.name || '');
          setBio(data.bio || '');
          setInterests(data.interests || []);
          setAllowStrangers(data.allow_stranger_messages ?? true);
          
          // Set achievements
          if (data.achievements) {
              setAchievements(data.achievements);
          }
          
      } catch (error: any) {
          console.error("Fetch profile error", error);
          if (error.response?.status === 404) {
             toast.error("Người dùng không tồn tại");
             navigate('/community');
          }
      }
  };

  const handleUpdateProfile = async () => {
    if (!isOwnProfile) return;
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
    if (isOwnProfile) {
        fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Đang tải ảnh lên...');
    try {
      await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (user) window.location.reload(); 
      toast.success('Cập nhật ảnh đại diện thành công!', { id: toastId });
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên', { id: toastId });
    }
  };

  const handleAddFriend = async () => {
      try {
          await api.post('/social/friends/request', { target_user_id: profileData.id });
          toast.success("Đã gửi lời mời kết bạn");
          fetchProfile(); // Refresh status
      } catch (error: any) {
          toast.error(error.response?.data?.detail || "Gửi thất bại");
      }
  };

  const handleMessage = () => {
      navigate(`/social?chat=${profileData.id}`);
  };

  // Determine display list for achievements (show all for self to see locked, show only unlocked for others)
  const displayAchievements = isOwnProfile && allAchievements.length > 0 ? allAchievements : achievements;

  if (!profileData) {
      return (
          <div className="flex h-full items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soviet-red-700"></div>
          </div>
      );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 pb-20">
        {!isOwnProfile && (
            <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-1" /> Quay lại
            </button>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Cover / Header */}
            <div className="h-32 bg-gradient-to-r from-soviet-red-700 to-soviet-red-900 relative">
                <div className="absolute top-4 right-4 flex space-x-2">
                    {isOwnProfile ? (
                        !isEditing ? (
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
                        )
                    ) : (
                        // Actions for other users
                        <div className="flex space-x-2">
                             {profileData.friendship_status === 'none' && (
                                <button 
                                    onClick={handleAddFriend}
                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-all flex items-center"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Kết bạn
                                </button>
                             )}
                             {profileData.friendship_status === 'pending' && (
                                <span className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm flex items-center cursor-default">
                                    <Activity className="h-4 w-4 mr-2 animate-pulse" />
                                    Đang chờ
                                </span>
                             )}
                             {profileData.friendship_status === 'accepted' && (
                                <span className="bg-green-500/20 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm flex items-center cursor-default border border-green-400/50">
                                    <Check className="h-4 w-4 mr-2" />
                                    Bạn bè
                                </span>
                             )}
                             
                             {(profileData.friendship_status === 'accepted' || profileData.allow_stranger_messages) && (
                                <button 
                                    onClick={handleMessage}
                                    className="bg-white text-soviet-red-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition-all flex items-center"
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Nhắn tin
                                </button>
                             )}
                        </div>
                    )}
                </div>
            </div>

            <div className="px-8 pb-8">
                <div className="relative -mt-16 mb-6 flex justify-between items-end">
                    <div className="relative group">
                        <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 shadow-md overflow-hidden">
                            {profileData.avatar_url ? (
                                <img src={profileData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-gray-400">
                                    {profileData.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {isOwnProfile && (
                            <>
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
                            </>
                        )}
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
                                        <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
                                        <input 
                                            type="text" 
                                            id="profile-name"
                                            name="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-soviet-red-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="profile-bio" className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân (Bio)</label>
                                        <textarea 
                                            id="profile-bio"
                                            name="bio"
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
                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{profileData.name}</h1>
                                    <p className="text-gray-500 mb-4">
                                        Tham gia: {new Date(profileData.created_at).toLocaleDateString('vi-VN')}
                                    </p>
                                    {profileData.bio ? (
                                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            {profileData.bio}
                                        </p>
                                    ) : (
                                        <p className="text-gray-400 italic">Chưa có giới thiệu.</p>
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
                                    {profileData.interests && profileData.interests.length > 0 ? profileData.interests.map((tag: string, idx: number) => (
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
                                {displayAchievements.length > 0 || isOwnProfile ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {isOwnProfile ? (
                                            // Show all slots for owner
                                            allAchievements.map((ach: any) => {
                                                const userAch = achievements.find((ua: any) => ua.id === ach.id);
                                                const isUnlocked = !!userAch;
                                                
                                                return (
                                                    <div key={ach.id} className={clsx("p-2 rounded-lg border flex flex-col items-center text-center transition-all relative overflow-hidden", isUnlocked ? "bg-yellow-50 border-yellow-200 shadow-sm" : "bg-gray-50 border-gray-100 opacity-60 grayscale")}>
                                                        <div className="text-2xl mb-1">{ach.icon_url || '🏅'}</div>
                                                        <div className="font-bold text-gray-900 text-xs mb-1 line-clamp-1" title={ach.name}>{ach.name}</div>
                                                        {isUnlocked ? (
                                                            <div className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full mt-auto">
                                                                {userAch.unlocked_at ? new Date(userAch.unlocked_at).toLocaleDateString('vi-VN') : 'Đã đạt'}
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] text-gray-400 mt-auto line-clamp-2 leading-tight" title={ach.description}>
                                                                {ach.description || "Chưa mở khóa"}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            // Show only unlocked for others
                                            achievements.length > 0 ? achievements.map((ach: any) => (
                                                <div key={ach.id} className="p-2 rounded-lg border flex flex-col items-center text-center transition-all relative overflow-hidden bg-yellow-50 border-yellow-200 shadow-sm">
                                                    <div className="text-2xl mb-1">{ach.icon || '🏅'}</div>
                                                    <div className="font-bold text-gray-900 text-xs mb-1 line-clamp-1" title={ach.name}>{ach.name}</div>
                                                    <div className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full mt-auto">
                                                        {new Date(ach.unlocked_at).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </div>
                                            )) : <p className="text-xs text-gray-400 italic col-span-2">Chưa có thành tựu nào.</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Đang tải thành tựu...</p>
                                )}
                            </div>
                            
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center">
                                    <Activity className="h-4 w-4 mr-2 text-blue-500" />
                                    Thống kê hoạt động
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Thứ hạng</span>
                                        <button 
                                            onClick={() => navigate(`/leaderboard?highlight=${profileData.id}`)}
                                            className="font-bold text-soviet-red-700 hover:underline flex items-center"
                                        >
                                            #{profileData.stats?.rank || '---'}
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Câu hỏi đã hỏi</span>
                                        <span className="font-bold text-gray-900">{profileData.stats?.total_questions || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Chuỗi hoạt động</span>
                                        <span className="font-bold text-orange-600 flex items-center">
                                            {profileData.stats?.streak || 0} 🔥
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Bạn bè</span>
                                        <span className="font-bold text-gray-900">{profileData.stats?.total_friends || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Thành tựu</span>
                                        <span className="font-bold text-gray-900">{profileData.stats?.total_achievements || 0}</span>
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
                                <span className={clsx("w-3 h-3 rounded-full", isUserOnline(profileData.last_seen) ? "bg-green-500" : "bg-gray-400")}></span>
                                <span className="text-gray-700 font-medium">
                                    {isUserOnline(profileData.last_seen) ? "Đang hoạt động" : "Ngoại tuyến"}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {profileData.last_seen ? (
                                    <>
                                        Hoạt động {formatDistanceToNow(new Date(profileData.last_seen), { addSuffix: true, locale: vi })}
                                    </>
                                ) : 'Chưa hoạt động'}
                            </p>
                        </div>

                        {/* Privacy Settings - Only visible to owner */}
                        {isOwnProfile && (
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
                                                    id="allow-strangers"
                                                    name="allow-strangers"
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
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
