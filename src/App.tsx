import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Statistics from "@/pages/Statistics";
import Library from "@/pages/Library";
import Quiz from "@/pages/Quiz";
import Leaderboard from "@/pages/Leaderboard";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
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
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/library" element={<Library />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
