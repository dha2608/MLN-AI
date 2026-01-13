-- Add quiz_score to statistics table if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'statistics' AND column_name = 'quiz_score') THEN
        ALTER TABLE public.statistics ADD COLUMN quiz_score INT DEFAULT 0;
    END IF;
END $$;
