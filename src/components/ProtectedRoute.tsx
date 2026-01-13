import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token, checkAuth, isLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
     checkAuth();
  }, [checkAuth]);

  if (isLoading) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
