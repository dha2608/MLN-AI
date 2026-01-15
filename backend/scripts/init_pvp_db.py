from backend.database import supabase

def create_pvp_tables():
    # Table: quiz_matches
    # - id: uuid (pk)
    # - room_code: string (unique, 6 chars)
    # - host_id: uuid (fk users)
    # - status: 'waiting', 'playing', 'finished'
    # - mode: 'pvp', 'coop'
    # - current_question_index: int
    # - created_at: timestamp
    
    # Table: match_participants
    # - match_id: uuid (fk quiz_matches)
    # - user_id: uuid (fk users)
    # - score: int
    # - status: 'ready', 'playing', 'finished'
    
    # Table: match_questions
    # - match_id: uuid
    # - question_data: jsonb
    
    print("Please execute these SQL commands in Supabase SQL Editor:")
    print("""
    CREATE TABLE IF NOT EXISTS quiz_matches (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        room_code TEXT UNIQUE NOT NULL,
        host_id UUID REFERENCES users(id),
        status TEXT DEFAULT 'waiting', -- waiting, playing, finished
        mode TEXT DEFAULT 'pvp',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS match_participants (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        match_id UUID REFERENCES quiz_matches(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id),
        score INT DEFAULT 0,
        status TEXT DEFAULT 'joined', -- joined, ready, finished
        UNIQUE(match_id, user_id)
    );
    
    -- Realtime policies need to be enabled in Supabase dashboard for these tables
    """)

if __name__ == "__main__":
    create_pvp_tables()
