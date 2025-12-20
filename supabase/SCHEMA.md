# Database Schema Documentation

## Overview

The Interprelo Famous AI database uses PostgreSQL via Supabase with Row Level Security (RLS) enabled on all tables. The schema is designed to support user authentication, practice session tracking, AI conversation logging, and progress analytics.

## Tables

### 1. `user_profiles`
Extended profile information for authenticated users.

**Columns:**
- `id` (UUID, PK) - References `auth.users.id`
- `email` (TEXT) - User email
- `full_name` (TEXT) - User's full name
- `avatar_url` (TEXT) - Profile picture URL
- `organization` (TEXT) - Company/institution name
- `job_title` (TEXT) - Professional role
- `years_experience` (INTEGER) - Years in profession
- `languages` (TEXT[]) - Spoken languages
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**RLS Policies:**
- Users can view/update only their own profile
- Auto-created on user signup via trigger

### 2. `user_progress`
Aggregated performance metrics for each user.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK) - References `auth.users.id`
- `total_sessions` (INTEGER) - Count of completed sessions
- `total_minutes` (INTEGER) - Total practice time
- `current_streak` (INTEGER) - Consecutive days practicing
- `longest_streak` (INTEGER) - Best streak achieved
- `last_practice_date` (TIMESTAMP) - Most recent session
- `average_pitch_score` (DECIMAL) - Avg pitch performance (0-100)
- `average_pace_score` (DECIMAL) - Avg pace performance (0-100)
- `average_volume_score` (DECIMAL) - Avg volume performance (0-100)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**RLS Policies:**
- Users can view/update only their own progress
- Auto-created on user signup via trigger
- Auto-updated via trigger after each practice session

### 3. `practice_sessions`
Individual practice session records with detailed metrics.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK) - References `auth.users.id`
- `scenario_id` (TEXT) - Scenario identifier
- `scenario_type` (TEXT) - medical | legal | business | emergency
- `difficulty` (TEXT) - beginner | intermediate | advanced
- `duration_minutes` (INTEGER) - Session length
- `pitch_score` (DECIMAL) - Pitch performance (0-100)
- `pace_score` (DECIMAL) - Pace performance (0-100)
- `volume_score` (DECIMAL) - Volume performance (0-100)
- `overall_score` (DECIMAL) - Combined score (0-100)
- `target_tone` (TEXT) - Target emotional tone
- `audio_recording_url` (TEXT) - Optional audio file URL
- `notes` (TEXT) - User notes
- `completed_at` (TIMESTAMP) - Session end time
- `created_at` (TIMESTAMP)

**RLS Policies:**
- Users can view/insert/update only their own sessions
- Indexed on `user_id` and `completed_at` for performance

**Triggers:**
- `on_practice_session_completed` - Updates `user_progress` automatically

### 4. `user_badges`
Achievement badges earned by users.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK) - References `auth.users.id`
- `badge_id` (TEXT) - Badge identifier
- `earned_at` (TIMESTAMP) - When badge was earned

**RLS Policies:**
- Users can view/insert only their own badges
- Unique constraint on `(user_id, badge_id)`

### 5. `ai_conversations`
AI scenario conversation logs with coaching data.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK) - References `auth.users.id`
- `session_id` (UUID, FK) - Optional link to practice session
- `scenario_type` (TEXT) - Scenario category
- `current_role` (TEXT) - User's role (doctor, patient, etc.)
- `conversation_data` (JSONB) - Full message history
- `coaching_feedback` (JSONB) - AI coaching insights
- `emotional_tone_analysis` (JSONB) - Detected emotions
- `total_messages` (INTEGER) - Message count
- `session_score` (DECIMAL) - Overall session score
- `started_at` (TIMESTAMP) - Conversation start
- `completed_at` (TIMESTAMP) - Conversation end
- `created_at` (TIMESTAMP)

**RLS Policies:**
- Users can view/insert/update only their own conversations
- Indexed on `user_id` and `session_id`

**JSONB Structure Examples:**

```json
// conversation_data
{
  "messages": [
    {
      "role": "system",
      "content": "You are a patient...",
      "timestamp": "2024-12-19T10:30:00Z"
    },
    {
      "role": "user",
      "content": "How are you feeling today?",
      "timestamp": "2024-12-19T10:30:15Z"
    }
  ]
}

// coaching_feedback
{
  "score": 85,
  "strengths": ["Empathetic tone", "Clear communication"],
  "improvements": ["Pace too fast", "More pauses needed"],
  "tonalSuggestions": ["Lower voice for calming effect"]
}

// emotional_tone_analysis
{
  "primary": "empathetic",
  "confidence": 0.85,
  "detected": ["empathetic", "professional"]
}
```

### 6. `api_usage_logs`
LLM API call tracking for cost monitoring.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK) - References `auth.users.id` (nullable)
- `provider` (TEXT) - openai | anthropic | custom
- `model` (TEXT) - Model name (gpt-4o, claude-3-5-sonnet, etc.)
- `endpoint` (TEXT) - API endpoint called
- `prompt_tokens` (INTEGER) - Input token count
- `completion_tokens` (INTEGER) - Output token count
- `total_tokens` (INTEGER) - Combined tokens
- `response_time_ms` (INTEGER) - API response time
- `status_code` (INTEGER) - HTTP status
- `error_message` (TEXT) - Error details if failed
- `cost_estimate` (DECIMAL) - Estimated cost in USD
- `created_at` (TIMESTAMP)

**RLS Policies:**
- Users can view only their own API usage
- Insert restricted to service role (edge functions)
- Indexed on `user_id` and `created_at` for analytics

### 7. `user_settings`
User preferences and configuration.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK) - References `auth.users.id`
- `ai_provider` (TEXT) - openai | anthropic | custom
- `ai_model` (TEXT) - Preferred model
- `tts_enabled` (BOOLEAN) - Text-to-speech on/off
- `stt_enabled` (BOOLEAN) - Speech-to-text on/off
- `coaching_enabled` (BOOLEAN) - AI coaching on/off
- `tts_voice` (TEXT) - TTS voice name
- `tts_rate` (DECIMAL) - Speech rate (0.5-2.0)
- `notification_preferences` (JSONB) - Notification settings
- `theme` (TEXT) - light | dark
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**RLS Policies:**
- Users can view/update only their own settings
- Auto-created on user signup via trigger
- Unique constraint on `user_id`

## Indexes

Performance indexes created on frequently queried columns:

```sql
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_completed_at ON practice_sessions(completed_at DESC);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX idx_api_usage_logs_created_at ON api_usage_logs(created_at DESC);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
```

## Triggers

### 1. `on_auth_user_created`
**When:** After user signs up
**Action:** Creates profile, progress, and settings records automatically

### 2. `on_practice_session_completed`
**When:** After practice session inserted
**Action:** Updates user_progress metrics including:
- Total sessions/minutes
- Streak calculations
- Average scores
- Last practice date

### 3. Auto-update `updated_at`
**When:** Before row update
**Tables:** `user_profiles`, `user_progress`, `user_settings`
**Action:** Sets `updated_at` to current timestamp

## Functions

### `handle_new_user()`
Creates default records when new user signs up:
- Inserts into `user_profiles`
- Inserts into `user_progress` (defaults to 0)
- Inserts into `user_settings` (defaults enabled)

### `update_user_progress_after_session()`
Calculates and updates progress metrics:
- Increments session counts
- Updates running averages
- Calculates streaks (handles missed days)
- Updates last practice date

### `update_updated_at_column()`
Generic trigger function to maintain `updated_at` timestamps.

## Row Level Security (RLS)

All tables have RLS enabled with policies enforcing:
- Users can only access their own data
- SELECT, INSERT, UPDATE restricted to `auth.uid()`
- DELETE policies intentionally omitted (data retention)
- Service role bypasses RLS for admin operations

## Migrations

Database schema defined in:
```
supabase/migrations/001_initial_schema.sql
```

Run migrations via:
1. Supabase Dashboard → SQL Editor
2. Supabase CLI: `supabase db push`

## Relationships

```
auth.users (Supabase Auth)
    ↓ (1:1)
user_profiles
    ↓ (1:1)
user_progress
    ↓ (1:many)
practice_sessions
    ↓ (1:many)
ai_conversations
    
auth.users
    ↓ (1:many)
user_badges

auth.users
    ↓ (1:1)
user_settings

auth.users
    ↓ (1:many)
api_usage_logs
```

## Backup and Recovery

- Supabase provides automatic daily backups
- Point-in-time recovery available on Pro plan
- Export data via `pg_dump` for local backups

## Performance Considerations

- Indexes on foreign keys and timestamp columns
- JSONB for flexible schema in conversation logs
- Partitioning recommended for `api_usage_logs` at scale
- Consider archiving old sessions after 1 year

## Security Best Practices

- ✅ RLS enabled on all tables
- ✅ Triggers use SECURITY DEFINER for privilege escalation
- ✅ No direct DELETE policies (soft delete pattern recommended)
- ✅ API keys stored in Supabase secrets, not database
- ✅ Sensitive data encrypted at rest by Supabase
