-- Create tables if they don't exist

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

CREATE POLICY "Users can view their own statistics" 
ON public.statistics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" 
ON public.statistics FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" 
ON public.statistics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" 
ON public.conversations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" 
ON public.messages FOR SELECT 
USING (
    exists (
        select 1 from public.conversations 
        where conversations.id = messages.conversation_id 
        and conversations.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert messages in their conversations" 
ON public.messages FOR INSERT 
WITH CHECK (
    exists (
        select 1 from public.conversations 
        where conversations.id = messages.conversation_id 
        and conversations.user_id = auth.uid()
    )
);

-- Storage Bucket Setup (This usually needs to be done via SQL extension or API, but let's try via SQL if extension is enabled)
-- Note: Creating buckets via SQL is specific to Supabase storage-api extension.

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Anyone can update their own avatar"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );
