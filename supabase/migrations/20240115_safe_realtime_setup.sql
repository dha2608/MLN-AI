-- Safe setup for Realtime publication
-- This script will try to add tables to supabase_realtime and ignore the error if they are already added.

DO $$
BEGIN
    -- 1. friendships
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'friendships already in publication or other error (ignoring)';
    END;

    -- 2. messages_social
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages_social;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'messages_social already in publication or other error (ignoring)';
    END;

    -- 3. notifications
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'notifications already in publication or other error (ignoring)';
    END;

    -- 4. quiz_matches
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_matches;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'quiz_matches already in publication or other error (ignoring)';
    END;

    -- 5. match_participants
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.match_participants;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'match_participants already in publication or other error (ignoring)';
    END;
END $$;
