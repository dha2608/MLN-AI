import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { supabase } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Statistics from "@/pages/Statistics";
import Library from "@/pages/Library";
import Quiz from "@/pages/Quiz";
import QuizPvP from "@/pages/QuizPvP";
import Leaderboard from "@/pages/Leaderboard";
import Social from "@/pages/Social";
import Community from "@/pages/Community";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function App() {
  const { setSession, isAuthChecking } = useAuthStore();
  useOnlineStatus(); // Activate heartbeat globally

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soviet-red-700"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/library" element={<Library />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/pvp" element={<QuizPvP />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/social" element={<Social />} />
          <Route path="/community" element={<Community />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
