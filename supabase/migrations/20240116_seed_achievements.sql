-- Seed Achievements
INSERT INTO public.achievements (code, name, description, icon_url, points) VALUES
('first_login', 'Người mới bắt đầu', 'Đăng nhập lần đầu tiên', '👋', 10),
('first_question', 'Câu hỏi đầu tiên', 'Đặt câu hỏi đầu tiên cho AI', '❓', 20),
('10_questions', 'Tò mò', 'Đặt 10 câu hỏi', '🤔', 50),
('100_questions', 'Học giả', 'Đặt 100 câu hỏi', '🎓', 200),
('first_friend', 'Kết nối', 'Kết bạn với người đầu tiên', '🤝', 30),
('social_butterfly', 'Quảng giao', 'Có 10 người bạn', '🦋', 100),
('streak_3', 'Chăm chỉ', 'Online 3 ngày liên tiếp', '🔥', 50),
('streak_7', 'Bền bỉ', 'Online 7 ngày liên tiếp', '⚡', 150)
ON CONFLICT (code) DO NOTHING;
