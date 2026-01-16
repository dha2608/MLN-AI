-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all user profiles (including last_seen)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.users FOR SELECT 
USING (true);

-- Allow users to update their own last_seen (for heartbeat)
CREATE POLICY "Users can update their own last_seen" 
ON public.users FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure last_seen column exists and has index
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users(last_seen DESC);

-- Fix permissions for auth.users to public.users sync if needed (usually handled by triggers)
-- But here we just ensure public.users is accessible.
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated, service_role;
