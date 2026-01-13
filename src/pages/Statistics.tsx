import { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Activity, Users, MessageSquare, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Statistics() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await api.get('/statistics/overview');
            setStats(res.data);
        } catch (e) {
            console.error(e);
        }
    }
    fetchStats();
  }, []);

  if (!stats) {
      return (
          <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soviet-red-700"></div>
          </div>
      );
  }

  const { personal, community } = stats;

  const lineData = {
    labels: personal.daily_activity?.map((d: any) => d.date.split('-').slice(1).join('/')) || [],
    datasets: [
      {
        label: 'Tin nhắn hàng ngày',
        data: personal.daily_activity?.map((d: any) => d.count) || [],
        borderColor: 'rgb(220, 38, 38)',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(220, 38, 38)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineOptions = {
      responsive: true,
      plugins: {
          legend: {
              display: false,
          },
          tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: { size: 14, family: 'Inter' },
              bodyFont: { size: 14, family: 'Inter' },
              cornerRadius: 8,
              displayColors: false,
          }
      },
      scales: {
          y: {
              beginAtZero: true,
              grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
              },
              ticks: {
                  precision: 0
              }
          },
          x: {
              grid: {
                  display: false
              }
          }
      }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
        >
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Thống kê & Phân tích</h1>
            <p className="text-gray-600">Tổng quan về hoạt động học tập và nghiên cứu của bạn.</p>
        </motion.div>

        {/* Community Stats */}
        <div className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
                <GlobeIcon className="h-5 w-5 text-soviet-red-600" />
                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Cộng đồng nghiên cứu</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-soviet-red-700 to-soviet-red-900 overflow-hidden shadow-lg rounded-2xl text-white relative group"
                >
                    <div className="absolute right-0 top-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform">
                        <Users className="h-24 w-24" />
                    </div>
                    <div className="px-6 py-8 relative z-10">
                        <dt className="text-sm font-medium text-soviet-red-100 uppercase tracking-wider mb-1">Thành viên</dt>
                        <dd className="text-4xl font-bold text-white">{community.total_users}</dd>
                        <p className="text-xs text-soviet-red-200 mt-2 flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            Đang cùng nghiên cứu
                        </p>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-2xl border border-gray-100"
                >
                    <div className="px-6 py-8">
                        <div className="flex items-center justify-between mb-4">
                            <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng thảo luận</dt>
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                        </div>
                        <dd className="text-3xl font-bold text-gray-900">{community.total_questions_community}</dd>
                        <p className="text-xs text-gray-400 mt-2">Câu hỏi và phản biện</p>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-2xl border border-gray-100"
                >
                    <div className="px-6 py-8">
                        <div className="flex items-center justify-between mb-4">
                            <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">Trực tuyến</dt>
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <Activity className="h-5 w-5" />
                            </div>
                        </div>
                        <dd className="text-3xl font-bold text-green-600 flex items-center">
                            <span className="relative flex h-3 w-3 mr-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            {community.active_now}
                        </dd>
                        <p className="text-xs text-gray-400 mt-2">Đang hoạt động ngay bây giờ</p>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* Personal Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Summary Cards */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Tổng quan cá nhân</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-2xl font-bold text-gray-900">{personal.total_questions}</span>
                                <span className="text-xs font-medium text-gray-400">Tổng câu hỏi</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="bg-soviet-red-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-2xl font-bold text-gray-900">{personal.weekly_questions}</span>
                                <span className="text-xs font-medium text-gray-400">Tuần này</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min((personal.weekly_questions / 50) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-2xl font-bold text-gray-900">{personal.daily_average}</span>
                                <span className="text-xs font-medium text-gray-400">Trung bình / ngày</span>
                            </div>
                             <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min((personal.daily_average / 10) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white">
                    <h3 className="text-lg font-serif font-bold mb-2">Mẹo học tập</h3>
                    <p className="text-sm text-gray-300 leading-relaxed italic">
                        "Hãy kiên trì nghiên cứu mỗi ngày. Sự tích lũy về lượng sẽ dẫn đến sự thay đổi về chất."
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Hoạt động trong 7 ngày qua</h3>
                    <select className="text-sm border-gray-300 rounded-lg text-gray-500 focus:ring-soviet-red-500 focus:border-soviet-red-500">
                        <option>7 ngày gần nhất</option>
                    </select>
                </div>
                <div className="h-80">
                    <Line options={lineOptions} data={lineData} />
                </div>
            </div>
        </div>
        </div>
    </div>
  );
}

function GlobeIcon(props: any) {
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
        <circle cx="12" cy="12" r="10" />
        <line x1="2" x2="22" y1="12" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    )
  }
