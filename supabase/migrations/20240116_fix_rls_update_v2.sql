-- FIX RLS POLICY FOR UPDATE
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop old policy if exists to avoid conflicts
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own last_seen" ON public.users;

-- Create a comprehensive update policy
CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure public read access is still there
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.users FOR SELECT 
USING (true);

-- Ensure replica identity is set to FULL so realtime gets all columns
ALTER TABLE public.users REPLICA IDENTITY FULL;

-- Grant permissions again just in case
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated, service_role;
