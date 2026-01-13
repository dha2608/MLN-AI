import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import api from '@/lib/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
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

  if (!stats) return <div className="p-8">Loading stats...</div>;

  const { personal, community } = stats;

  const barData = {
    labels: ['Tuần này', 'Tuần trước'],
    datasets: [
      {
        label: 'Số câu hỏi',
        data: [personal.weekly_questions, personal.weekly_questions * 0.8], // Mock comparison
        backgroundColor: 'rgba(220, 38, 38, 0.5)',
      },
    ],
  };

  const pieData = {
    labels: personal.top_topics?.length ? personal.top_topics : ['Chưa có dữ liệu'],
    datasets: [
      {
        data: personal.top_topics?.length ? [12, 19, 3] : [1], // Mock data for topics distribution
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Thống kê sử dụng</h1>

      {/* Community Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Cộng đồng nghiên cứu</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
             <div className="bg-gradient-to-br from-soviet-red-700 to-soviet-red-900 overflow-hidden shadow rounded-lg text-white">
                <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-soviet-gold-100 truncate">Thành viên tích cực</dt>
                    <dd className="mt-1 text-3xl font-semibold text-white">{community.total_users}</dd>
                </div>
             </div>
             <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Tổng câu hỏi cộng đồng</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{community.total_questions_community}</dd>
                </div>
             </div>
             <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Đang trực tuyến</dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600 flex items-center">
                        <span className="h-3 w-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        {community.active_now}
                    </dd>
                </div>
             </div>
        </div>
      </div>

      <h2 className="text-lg font-medium text-gray-900 mb-4">Hoạt động cá nhân</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Tổng số câu hỏi của bạn</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{personal.total_questions}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Câu hỏi tuần này</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{personal.weekly_questions}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Trung bình mỗi ngày</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{personal.daily_average}</dd>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Hoạt động theo tuần</h3>
          <Bar options={{ responsive: true }} data={barData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Chủ đề quan tâm</h3>
          <div className="w-2/3 mx-auto">
             <Pie data={pieData} />
          </div>
        </div>
      </div>
    </div>
  );
}
