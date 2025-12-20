-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Profiles Table
-- Extends Supabase Auth users with additional profile information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    organization TEXT,
    job_title TEXT,
    years_experience INTEGER DEFAULT 0,
    languages TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress Table
-- Tracks overall user performance metrics
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_sessions INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_practice_date TIMESTAMP WITH TIME ZONE,
    average_pitch_score DECIMAL(5,2) DEFAULT 0.00,
    average_pace_score DECIMAL(5,2) DEFAULT 0.00,
    average_volume_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Practice Sessions Table
-- Records individual practice sessions with detailed metrics
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_id TEXT NOT NULL,
    scenario_type TEXT NOT NULL, -- 'medical', 'legal', 'business', 'emergency'
    difficulty TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced'
    duration_minutes INTEGER NOT NULL,
    pitch_score DECIMAL(5,2),
    pace_score DECIMAL(5,2),
    volume_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    target_tone TEXT,
    audio_recording_url TEXT, -- Optional: URL to stored audio
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badges Table
-- Tracks earned achievements and badges
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- AI Conversation Logs Table
-- Stores AI scenario conversations and coaching feedback
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES practice_sessions(id) ON DELETE SET NULL,
    scenario_type TEXT NOT NULL,
    current_role TEXT NOT NULL, -- 'doctor', 'patient', 'lawyer', 'client', etc.
    conversation_data JSONB NOT NULL, -- Full conversation history
    coaching_feedback JSONB, -- Coaching insights and suggestions
    emotional_tone_analysis JSONB, -- Detected emotional tones
    total_messages INTEGER DEFAULT 0,
    session_score DECIMAL(5,2),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Usage Logs Table
-- Tracks LLM API calls for cost monitoring and analytics
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    provider TEXT NOT NULL, -- 'openai', 'anthropic', 'custom'
    model TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    cost_estimate DECIMAL(10,6), -- Estimated cost in USD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings Table
-- Stores user preferences and API configurations
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ai_provider TEXT DEFAULT 'openai', -- 'openai', 'anthropic', 'custom'
    ai_model TEXT,
    tts_enabled BOOLEAN DEFAULT true,
    stt_enabled BOOLEAN DEFAULT true,
    coaching_enabled BOOLEAN DEFAULT true,
    tts_voice TEXT DEFAULT 'en-US-AriaNeural',
    tts_rate DECIMAL(3,1) DEFAULT 1.0,
    notification_preferences JSONB DEFAULT '{}',
    theme TEXT DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_completed_at ON practice_sessions(completed_at DESC);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX idx_api_usage_logs_created_at ON api_usage_logs(created_at DESC);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- User Progress Policies
CREATE POLICY "Users can view their own progress"
    ON user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON user_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
    ON user_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Practice Sessions Policies
CREATE POLICY "Users can view their own sessions"
    ON practice_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON practice_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON practice_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- User Badges Policies
CREATE POLICY "Users can view their own badges"
    ON user_badges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
    ON user_badges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- AI Conversations Policies
CREATE POLICY "Users can view their own conversations"
    ON ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
    ON ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
    ON ai_conversations FOR UPDATE
    USING (auth.uid() = user_id);

-- API Usage Logs Policies (Read-only for users)
CREATE POLICY "Users can view their own API usage"
    ON api_usage_logs FOR SELECT
    USING (auth.uid() = user_id);

-- User Settings Policies
CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Functions and Triggers

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default user profile and progress on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    
    -- Create user progress
    INSERT INTO user_progress (user_id)
    VALUES (NEW.id);
    
    -- Create user settings
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update user progress after practice session
CREATE OR REPLACE FUNCTION update_user_progress_after_session()
RETURNS TRIGGER AS $$
DECLARE
    current_date DATE;
    last_date DATE;
    streak_broken BOOLEAN;
BEGIN
    current_date := NEW.completed_at::DATE;
    
    -- Get last practice date
    SELECT last_practice_date::DATE INTO last_date
    FROM user_progress
    WHERE user_id = NEW.user_id;
    
    -- Calculate if streak is broken (more than 1 day gap)
    streak_broken := (last_date IS NULL) OR (current_date - last_date > 1);
    
    -- Update user progress
    UPDATE user_progress
    SET
        total_sessions = total_sessions + 1,
        total_minutes = total_minutes + NEW.duration_minutes,
        current_streak = CASE 
            WHEN streak_broken THEN 1
            WHEN current_date = last_date THEN current_streak
            ELSE current_streak + 1
        END,
        longest_streak = GREATEST(
            longest_streak,
            CASE 
                WHEN streak_broken THEN 1
                WHEN current_date = last_date THEN current_streak
                ELSE current_streak + 1
            END
        ),
        last_practice_date = NEW.completed_at,
        average_pitch_score = (
            (average_pitch_score * (total_sessions - 1) + COALESCE(NEW.pitch_score, 0)) / 
            NULLIF(total_sessions, 0)
        ),
        average_pace_score = (
            (average_pace_score * (total_sessions - 1) + COALESCE(NEW.pace_score, 0)) / 
            NULLIF(total_sessions, 0)
        ),
        average_volume_score = (
            (average_volume_score * (total_sessions - 1) + COALESCE(NEW.volume_score, 0)) / 
            NULLIF(total_sessions, 0)
        ),
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update progress after practice session
CREATE TRIGGER on_practice_session_completed
    AFTER INSERT ON practice_sessions
    FOR EACH ROW EXECUTE FUNCTION update_user_progress_after_session();
