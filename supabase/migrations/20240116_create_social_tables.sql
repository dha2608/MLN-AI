-- Create tables for social features if they don't exist

-- 1. Friendships
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- 2. Messages (Social)
CREATE TABLE IF NOT EXISTS public.messages_social (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- 3. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'friend_request', 'friend_accept', 'message', 'system'
    title TEXT,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Blocked Users
CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id)
);

-- 5. Achievements (For Leaderboard/Profile)
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL, -- e.g., 'first_post', '100_questions'
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    points INTEGER DEFAULT 10
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_messages_social_sender ON public.messages_social(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_social_receiver ON public.messages_social(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_social ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Friendships: Users can view their own friendships
CREATE POLICY "Users can view their own friendships" ON public.friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert friendships" ON public.friendships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendships" ON public.friendships
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Messages: Users can view messages sent to/from them
CREATE POLICY "Users can view their messages" ON public.messages_social
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages_social
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications: Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- System can insert notifications (service_role will bypass RLS, but for client-side inserts if any)
CREATE POLICY "Anyone can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true); -- Usually backend does this, but keeping it open for now for simplicity if frontend triggers it

-- Achievements: Public read
CREATE POLICY "Achievements are public" ON public.achievements
    FOR SELECT USING (true);

CREATE POLICY "User achievements are public" ON public.user_achievements
    FOR SELECT USING (true);

-- Grant permissions
GRANT ALL ON public.friendships TO authenticated, service_role;
GRANT ALL ON public.messages_social TO authenticated, service_role;
GRANT ALL ON public.notifications TO authenticated, service_role;
GRANT ALL ON public.blocked_users TO authenticated, service_role;
GRANT ALL ON public.achievements TO authenticated, service_role;
GRANT ALL ON public.user_achievements TO authenticated, service_role;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages_social;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
