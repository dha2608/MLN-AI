-- 1. Add missing columns if they don't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS allow_stranger_messages BOOLEAN DEFAULT TRUE;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users(last_seen DESC);

-- 3. Grant permissions (Pre-emptive)
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated, service_role;

-- 4. Enable Realtime for these columns
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
