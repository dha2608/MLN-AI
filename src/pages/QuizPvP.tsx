import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Users, UserPlus, Play, Copy, Check, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

interface Participant {
    user_id: string;
    score: number;
    status: string;
    users: {
        name: string;
        avatar_url: string | null;
    };
}

export default function QuizPvP() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [mode, setMode] = useState<'lobby' | 'room' | 'playing'>('lobby');
    const [roomCode, setRoomCode] = useState('');
    const [matchId, setMatchId] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [joinCode, setJoinCode] = useState('');

    useEffect(() => {
        let interval: any;
        if (mode === 'room' && matchId) {
            fetchRoomState();
            interval = setInterval(fetchRoomState, 3000);
        }
        return () => clearInterval(interval);
    }, [mode, matchId]);

    const createRoom = async () => {
        try {
            const res = await api.post('/quiz/match/create', { mode: 'pvp' });
            setMatchId(res.data.match_id);
            setRoomCode(res.data.room_code);
            setIsHost(true);
            setMode('room');
        } catch (error) {
            console.error("Create room failed", error);
            alert("Không thể tạo phòng");
        }
    };

    const joinRoom = async () => {
        if (!joinCode) return;
        try {
            const res = await api.post('/quiz/match/join', { room_code: joinCode.toUpperCase() });
            setMatchId(res.data.match_id);
            setRoomCode(res.data.room_code);
            setIsHost(false);
            setMode('room');
        } catch (error: any) {
            alert(error.response?.data?.detail || "Không tìm thấy phòng");
        }
    };

    const fetchRoomState = async () => {
        try {
            const res = await api.get(`/quiz/match/${matchId}`);
            setParticipants(res.data.participants);
            if (res.data.match.status === 'playing') {
                setMode('playing');
                // Navigate to actual game logic (to be implemented)
                // navigate(`/quiz/play/${matchId}`);
            }
        } catch (error) {
            console.error("Fetch room failed", error);
        }
    };

    const startMatch = async () => {
        try {
            await api.post(`/quiz/match/${matchId}/start`);
        } catch (error) {
            console.error("Start failed", error);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
        alert("Đã sao chép mã phòng!");
    };

    if (mode === 'lobby') {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 flex items-center">
                    <Users className="mr-3 h-8 w-8 text-soviet-red-700" />
                    Đấu trường Tri thức
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Create Room */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-soviet-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plus className="h-8 w-8 text-soviet-red-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-4">Tạo phòng mới</h2>
                        <p className="text-gray-600 mb-6">Tạo phòng và mời bạn bè cùng thi đấu hoặc hợp tác trả lời câu hỏi.</p>
                        <button 
                            onClick={createRoom}
                            className="w-full bg-soviet-red-700 text-white py-3 rounded-xl font-bold hover:bg-soviet-red-800 transition-colors"
                        >
                            Tạo phòng ngay
                        </button>
                    </div>

                    {/* Join Room */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <UserPlus className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-4">Tham gia phòng</h2>
                        <p className="text-gray-600 mb-6">Nhập mã phòng từ bạn bè để tham gia trận đấu đang chờ.</p>
                        <div className="flex space-x-2">
                            <input 
                                type="text" 
                                placeholder="Mã phòng (VD: ABC123)" 
                                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 uppercase text-center font-mono font-bold tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                            />
                            <button 
                                onClick={joinRoom}
                                className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                                Vào
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'room') {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    <div className="bg-soviet-red-700 p-8 text-center text-white">
                        <h2 className="text-2xl font-bold mb-2">Phòng chờ</h2>
                        <div className="flex items-center justify-center space-x-4 mt-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm inline-flex">
                            <span className="text-gray-200 text-sm uppercase tracking-wider">Mã phòng:</span>
                            <span className="text-3xl font-mono font-bold tracking-widest">{roomCode}</span>
                            <button onClick={copyCode} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Sao chép">
                                <Copy className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                            <Users className="mr-2 h-5 w-5" />
                            Người tham gia ({participants.length})
                        </h3>
                        
                        <div className="space-y-3 mb-8">
                            {participants.map((p) => (
                                <div key={p.user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                                            {p.users.avatar_url ? (
                                                <img src={p.users.avatar_url} alt={p.users.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center font-bold text-gray-500">
                                                    {p.users.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="ml-3 font-medium text-gray-900">{p.users.name}</span>
                                        {p.user_id === user?.id && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Bạn</span>}
                                        {p.status === 'ready' && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Host</span>}
                                    </div>
                                    <div className="text-green-500">
                                        <Check className="h-5 w-5" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isHost ? (
                            <button 
                                onClick={startMatch}
                                className="w-full bg-soviet-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-soviet-red-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                            >
                                <Play className="mr-2 h-6 w-6" />
                                Bắt đầu trận đấu
                            </button>
                        ) : (
                            <div className="text-center text-gray-500 italic animate-pulse">
                                Đang chờ chủ phòng bắt đầu...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'playing') {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
                    <h2 className="text-2xl font-bold text-gray-900">Trận đấu đang diễn ra!</h2>
                    <p className="text-gray-500 mt-2">Tính năng đang được hoàn thiện...</p>
                </div>
            </div>
        );
    }

    return null;
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
