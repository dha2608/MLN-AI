-- FORCE PUBLIC READ ACCESS TO ALL COLUMNS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing select policies to be sure
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;

-- Create a truly permissive select policy
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.users FOR SELECT 
USING (true);

-- Ensure anon and authenticated roles have column-level access
GRANT SELECT (id, name, avatar_url, last_seen, bio, interests, email) ON public.users TO anon;
GRANT SELECT (id, name, avatar_url, last_seen, bio, interests, email) ON public.users TO authenticated;
GRANT SELECT (id, name, avatar_url, last_seen, bio, interests, email) ON public.users TO service_role;

-- Force update stats to ensure query planner knows about columns
ANALYZE public.users;
