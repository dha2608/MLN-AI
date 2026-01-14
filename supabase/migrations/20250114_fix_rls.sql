
-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES
-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Allow users to insert their own data (needed for the sync logic)
CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Allow public read access to users (needed for Leaderboard to show names/avatars)
CREATE POLICY "Public can read basic user info" ON public.users
    FOR SELECT
    USING (true);


-- CONVERSATIONS TABLE POLICIES
CREATE POLICY "Users can read own conversations" ON public.conversations
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.conversations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.conversations
    FOR DELETE
    USING (auth.uid() = user_id);


-- MESSAGES TABLE POLICIES
-- Users can read messages from conversations they own
CREATE POLICY "Users can read own messages" ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );

-- Users can insert messages into conversations they own
CREATE POLICY "Users can insert own messages" ON public.messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );


-- STATISTICS TABLE POLICIES
-- Users can read their own stats
CREATE POLICY "Users can read own stats" ON public.statistics
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert/update their own stats
CREATE POLICY "Users can upsert own stats" ON public.statistics
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow public to read stats (needed for Leaderboard)
CREATE POLICY "Public can read leaderboard stats" ON public.statistics
    FOR SELECT
    USING (true);
