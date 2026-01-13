-- Statistics Table
CREATE TABLE IF NOT EXISTS public.statistics (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    total_questions INT DEFAULT 0,
    weekly_questions INT DEFAULT 0,
    top_topics TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for statistics
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'statistics' AND policyname = 'Users can view their own statistics') THEN
        CREATE POLICY "Users can view their own statistics" ON public.statistics FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'statistics' AND policyname = 'Users can update their own statistics') THEN
        CREATE POLICY "Users can update their own statistics" ON public.statistics FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'statistics' AND policyname = 'Users can insert their own statistics') THEN
        CREATE POLICY "Users can insert their own statistics" ON public.statistics FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Avatar images are publicly accessible') THEN
        CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can upload an avatar') THEN
        CREATE POLICY "Anyone can upload an avatar" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can update their own avatar') THEN
        CREATE POLICY "Anyone can update their own avatar" ON storage.objects FOR UPDATE USING ( bucket_id = 'avatars' AND auth.uid() = owner ) WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );
    END IF;
END $$;
