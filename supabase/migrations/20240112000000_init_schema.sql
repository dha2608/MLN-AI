-- Create tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE TABLE statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_questions INTEGER DEFAULT 0,
  weekly_questions INTEGER DEFAULT 0,
  top_topics JSONB,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_statistics_user_id ON statistics(user_id);

-- Enable Row Level Security (RLS) is good practice, but for now we grant access as requested
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT SELECT ON conversations TO anon;
GRANT ALL PRIVILEGES ON conversations TO authenticated;
GRANT SELECT ON messages TO anon;
GRANT ALL PRIVILEGES ON messages TO authenticated;
GRANT SELECT ON statistics TO anon;
GRANT ALL PRIVILEGES ON statistics TO authenticated;

-- Policies (Basic examples to allow work, refining based on PRD which implies backend handles logic)
-- Since the backend uses a service role (implied by "FastAPI Backend -> Supabase Database"), 
-- RLS applies to the direct connection. 
-- If the backend uses the service_role key, it bypasses RLS.
-- If the frontend connects directly (e.g. for storage), RLS matters.

-- Allow users to see their own data
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON conversations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations WHERE id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view their own stats" ON statistics FOR SELECT USING (auth.uid() = user_id);
