-- Create tables for Social features
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    friend_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, accepted, blocked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS public.messages_social (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL, -- friend_request, friend_accept, match_invite
    title TEXT,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tables for PvP Quiz features
CREATE TABLE IF NOT EXISTS public.quiz_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_code TEXT UNIQUE NOT NULL,
    host_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'waiting', -- waiting, playing, finished
    mode TEXT DEFAULT 'pvp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.match_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES public.quiz_matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    score INT DEFAULT 0,
    status TEXT DEFAULT 'joined', -- joined, ready, finished
    UNIQUE(match_id, user_id)
);

-- Ensure public.users exists for profile syncing (optional, depends on your setup)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
alter publication supabase_realtime add table public.friendships;
alter publication supabase_realtime add table public.messages_social;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.quiz_matches;
alter publication supabase_realtime add table public.match_participants;
