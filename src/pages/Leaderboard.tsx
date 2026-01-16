import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Award, Medal, User, UserPlus, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

interface LeaderboardItem {
    user_id: string;
    name: string;
    avatar_url: string | null;
    score: number;
}

export default function Leaderboard() {
    const { user: currentUser } = useAuthStore();
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/quiz/leaderboard');
                setLeaderboard(res.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

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

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Medal className="h-6 w-6 text-yellow-500" />;
            case 1: return <Medal className="h-6 w-6 text-gray-400" />;
            case 2: return <Medal className="h-6 w-6 text-amber-700" />;
            default: return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>;
        }
    };

    return (
        <div className="flex h-full bg-gray-50 overflow-y-auto font-sans">
            <div className="max-w-4xl mx-auto w-full py-10 px-4 sm:px-6 lg:px-8">
                
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block p-4 rounded-full bg-soviet-red-100 mb-4"
                    >
                        <Award className="h-10 w-10 text-soviet-red-700" />
                    </motion.div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Bảng Xếp Hạng Tri thức</h1>
                    <p className="mt-2 text-gray-600">Vinh danh những nhà nghiên cứu xuất sắc nhất</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Hạng</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thành viên</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Điểm số</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-6 w-6 bg-gray-200 rounded"></div></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right"><div className="h-4 w-12 bg-gray-200 rounded ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : leaderboard.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">
                                            Chưa có dữ liệu xếp hạng. Hãy là người đầu tiên tham gia trắc nghiệm!
                                        </td>
                                    </tr>
                                ) : (
                                    leaderboard.map((item, index) => (
                                        <motion.tr 
                                            key={item.user_id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={clsx(
                                                "hover:bg-gray-50 transition-colors",
                                                index < 3 ? "bg-gradient-to-r from-transparent via-transparent" : "",
                                                index === 0 ? "to-yellow-50/30" : "",
                                                index === 1 ? "to-gray-50/30" : "",
                                                index === 2 ? "to-amber-50/30" : ""
                                            )}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100">
                                                    {getRankIcon(index)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-soviet-red-100 flex items-center justify-center text-soviet-red-700 font-bold border-2 border-white shadow-sm overflow-hidden">
                                                        {item.avatar_url ? (
                                                            <img src={item.avatar_url} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                                        ) : (
                                                            item.name.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 font-serif">{item.name}</div>
                                                        <div className="text-xs text-gray-500">Nhà nghiên cứu</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-soviet-red-50 text-soviet-red-700 border border-soviet-red-100 mr-2">
                                                        {item.score} điểm
                                                    </span>
                                                    
                                                    {currentUser?.id !== item.user_id && (
                                                        <>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleAddFriend(item.user_id); }}
                                                                className="p-2 text-gray-400 hover:text-soviet-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                                title="Kết bạn"
                                                            >
                                                                <UserPlus className="h-5 w-5" />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleMessage(item.user_id); }}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                                title="Nhắn tin"
                                                            >
                                                                <MessageCircle className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
