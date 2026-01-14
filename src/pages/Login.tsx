import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { BookOpen, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/api';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập Google thất bại');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await login(data.email, data.password);
      toast.success('Đăng nhập thành công');
      navigate('/');
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail;
      const displayMsg = typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : (errorMsg || 'Đăng nhập thất bại');
      toast.error(displayMsg);
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
               Đăng nhập
             </h2>
             <p className="mt-2 text-sm text-gray-600">
               Chào mừng trở lại với không gian tri thức.
             </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      autoComplete="username"
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
                      autoComplete="current-password"
                      required
                      {...register('password')}
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
                    Đăng nhập
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soviet-red-500 transition-colors"
                  >
                    <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                    Đăng nhập bằng Google
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Visual */}
      <div className="hidden lg:block relative w-0 flex-1 bg-soviet-red-900">
         <div className="absolute inset-0 h-full w-full bg-[url('https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
         <div className="absolute inset-0 bg-gradient-to-br from-soviet-red-900 via-soviet-red-800 to-black opacity-80"></div>
         
         <div className="relative h-full flex flex-col justify-center px-12 text-white">
            <blockquote className="font-serif text-3xl font-medium leading-normal italic text-soviet-gold-100">
              "Các nhà triết học đã chỉ giải thích thế giới bằng nhiều cách khác nhau, vấn đề là cải tạo thế giới."
            </blockquote>
            <div className="mt-6 flex items-center">
               <div className="h-px w-12 bg-soviet-gold-500 mr-4"></div>
               <p className="text-lg font-bold text-soviet-gold-400 uppercase tracking-widest">Karl Marx</p>
            </div>
         </div>
      </div>
    </div>
  );
}
