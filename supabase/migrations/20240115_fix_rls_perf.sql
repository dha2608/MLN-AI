-- Enable RLS for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to view anyone's profile (needed for Community/Friends)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.users FOR SELECT 
USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- 2. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON public.users USING gin (name gin_trgm_ops); -- Requires pg_trgm extension
