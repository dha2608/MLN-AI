-- 1. Online Status & User Presence
-- We can use a simple table with "last_seen" timestamp.
-- Users will send a heartbeat every X seconds.
-- Or better, add 'last_seen' to public.users if not exists.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests TEXT[]; -- Array of strings
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS allow_stranger_messages BOOLEAN DEFAULT TRUE;

-- 2. Block List
CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    blocked_user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id)
);

-- 3. Update realtime for presence tracking
-- We want to subscribe to changes in 'public.users' (specifically last_seen) to show online status
alter publication supabase_realtime add table public.users;
