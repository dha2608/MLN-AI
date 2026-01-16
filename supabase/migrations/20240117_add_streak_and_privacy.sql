-- Add streak tracking columns to statistics table
ALTER TABLE public.statistics 
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_streak_date DATE;

-- Add privacy setting to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT TRUE;

-- Update RLS policies to allow reading public profiles
-- (Assuming we want authenticated users to read public profiles of others)
-- We might need to adjust existing policies or add new ones.
-- For now, let's ensure basic columns exist.
