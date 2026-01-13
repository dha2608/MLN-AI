import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register, handleSubmit } = useForm();
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
    }
    try {
      const res = await registerUser(data.email, data.password, data.name);
      if (res.access_token) {
        toast.success('Đăng ký thành công');
        navigate('/');
      } else if (res.message) {
        toast.success(res.message, { duration: 5000 });
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center lg:items-start">
             <div className="h-12 w-12 bg-soviet-red-700 rounded-xl flex items-center justify-center shadow-lg mb-6">
                <BookOpen className="h-7 w-7 text-soviet-gold-400" />
             </div>
             <h2 className="mt-2 text-3xl font-serif font-bold text-gray-900">
               Tạo tài khoản
             </h2>
             <p className="mt-2 text-sm text-gray-600">
               Bắt đầu hành trình nghiên cứu của bạn.
             </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Họ tên
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      type="text"
                      required
                      {...register('name')}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-soviet-red-500 focus:border-soviet-red-500 sm:text-sm transition-shadow"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      required
                      {...register('email')}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-soviet-red-500 focus:border-soviet-red-500 sm:text-sm transition-shadow"
                      placeholder="vidu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      type="password"
                      required
                      {...register('password')}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-soviet-red-500 focus:border-soviet-red-500 sm:text-sm transition-shadow"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Xác nhận mật khẩu
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      {...register('confirmPassword')}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-soviet-red-500 focus:border-soviet-red-500 sm:text-sm transition-shadow"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-soviet-red-700 hover:bg-soviet-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soviet-red-500 transition-colors"
                  >
                    Đăng ký
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 text-center">
               <p className="text-sm text-gray-600">
                 Đã có tài khoản?{' '}
                 <Link to="/login" className="font-medium text-soviet-red-600 hover:text-soviet-red-500 hover:underline">
                   Đăng nhập ngay
                 </Link>
               </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Visual */}
      <div className="hidden lg:block relative w-0 flex-1 bg-soviet-red-900">
         <div className="absolute inset-0 h-full w-full bg-[url('https://images.unsplash.com/photo-1524334228333-0f6db392f8a1?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
         <div className="absolute inset-0 bg-gradient-to-bl from-soviet-red-900 via-soviet-red-800 to-black opacity-80"></div>
         
         <div className="relative h-full flex flex-col justify-center px-12 text-white">
            <blockquote className="font-serif text-3xl font-medium leading-normal italic text-soviet-gold-100">
              "Học, học nữa, học mãi."
            </blockquote>
            <div className="mt-6 flex items-center">
               <div className="h-px w-12 bg-soviet-gold-500 mr-4"></div>
               <p className="text-lg font-bold text-soviet-gold-400 uppercase tracking-widest">V.I. Lenin</p>
            </div>
         </div>
      </div>
    </div>
  );
}
