-- Add last_quiz_date to statistics table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'statistics' AND column_name = 'last_quiz_date') THEN
        ALTER TABLE public.statistics ADD COLUMN last_quiz_date DATE;
    END IF;
END $$;
