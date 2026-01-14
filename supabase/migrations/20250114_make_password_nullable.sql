
-- Make password_hash nullable to support OAuth users (Google Login)
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;
