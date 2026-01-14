import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { Camera } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, checkAuth } = useAuthStore();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
    }
  });
  const [uploading, setUploading] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      await api.put('/user/profile', { name: data.name });
      await checkAuth(); // Refresh user data
      toast.success('Thông tin đã được cập nhật thành công');
    } catch (error: any) {
      console.error(error);
      toast.error('Cập nhật thất bại: ' + (error.response?.data?.detail || 'Lỗi không xác định'));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
        await api.post('/user/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        await checkAuth(); // Refresh user data
        toast.success('Avatar updated successfully');
    } catch (error) {
        toast.error('Failed to upload avatar');
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Hồ sơ cá nhân</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 border-4 border-red-500">
                {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl text-gray-400 font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 border border-gray-200"
              >
                <Camera className="h-5 w-5 text-gray-600" />
                <input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                />
              </label>
            </div>
            {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                disabled
                {...register('email')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Họ tên</label>
              <input
                type="text"
                {...register('name')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
