# Supabase Setup Guide

This guide walks you through setting up the Supabase backend for the Interprelo Famous AI application.

## Prerequisites

- Supabase account (sign up at https://supabase.com)
- Supabase CLI installed: `npm install -g supabase`
- Project already connected to Supabase (check `src/lib/supabase.ts` for credentials)

## Step 1: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

This will create all tables, indexes, RLS policies, triggers, and functions.

### Option B: Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link your project (find your project ref in dashboard URL)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 2: Verify Tables Created

In the Supabase Dashboard, go to **Table Editor** and verify these tables exist:

- ✅ `user_profiles` - Extended user profile data
- ✅ `user_progress` - User performance metrics
- ✅ `practice_sessions` - Individual practice session records
- ✅ `user_badges` - Earned achievements
- ✅ `ai_conversations` - AI conversation logs
- ✅ `api_usage_logs` - LLM API usage tracking
- ✅ `user_settings` - User preferences and configs

## Step 3: Configure Authentication

### Enable Email/Password Auth

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional):
   - Confirmation email
   - Password recovery
   - Email change

### Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

### Enable Microsoft OAuth (Optional)

1. Enable **Azure** provider in Supabase
2. Set up Azure AD app registration:
   - Go to [Azure Portal](https://portal.azure.com)
   - Register new application
   - Add redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy Application (client) ID and create client secret
   - Paste into Supabase Azure provider settings

## Step 4: Deploy Edge Functions

Edge functions handle secure LLM API calls and conversation storage.

### Prerequisites

- Deno installed (for local development): https://deno.land/manual/getting_started/installation

### Deploy LLM Chat Function

```bash
# Navigate to project root
cd interprelo-famous-ai

# Deploy llm-chat function
supabase functions deploy llm-chat --no-verify-jwt

# Set environment variables for API keys (optional, if not using user's own keys)
supabase secrets set OPENAI_API_KEY=your-openai-key
supabase secrets set ANTHROPIC_API_KEY=your-anthropic-key
```

### Deploy Save Conversation Function

```bash
# Deploy save-conversation function
supabase functions deploy save-conversation --no-verify-jwt
```

### Test Edge Functions

```bash
# Test llm-chat locally
supabase functions serve llm-chat

# In another terminal, test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/llm-chat' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "provider": "openai",
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Step 5: Configure Row Level Security

RLS policies are automatically created by the migration script. Verify they're active:

1. Go to **Authentication** → **Policies**
2. Check each table has policies enabled:
   - Users can only view/edit their own data
   - Proper INSERT/UPDATE/DELETE policies exist

## Step 6: Update Environment Variables

Update your `.env` file (create from `.env.example`):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Server-side API keys (if not using user's keys)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## Step 7: Test Authentication Flow

1. Start your development server: `npm run dev`
2. Click "Sign In" in the app
3. Try creating a new account
4. Verify you receive confirmation email
5. Test Google OAuth (if configured)
6. Check Supabase Dashboard → Authentication → Users to see new user

## Step 8: Test Database Operations

After signing in:

1. Start a practice session in **Vocal Dashboard**
2. Complete the session
3. Check Supabase Dashboard → Table Editor → `practice_sessions` for new record
4. Verify `user_progress` table updated automatically via trigger
5. Try AI Scenario Practice to test edge functions

## Monitoring and Maintenance

### View Logs

```bash
# View edge function logs
supabase functions logs llm-chat
supabase functions logs save-conversation
```

### Monitor API Usage

Query `api_usage_logs` table to track:
- LLM API calls
- Token usage
- Cost estimates
- Response times

### Database Backups

Supabase automatically backs up your database. Configure backup retention in:
**Settings** → **Database** → **Backups**

## Troubleshooting

### Users Not Creating Profiles

- Check trigger `on_auth_user_created` is active
- Verify `handle_new_user()` function exists
- Check Supabase logs for errors

### Edge Functions Failing

- Verify JWT verification is disabled: `--no-verify-jwt`
- Check environment variables are set
- View function logs: `supabase functions logs function-name`

### RLS Blocking Queries

- Verify user is authenticated: `supabase.auth.getSession()`
- Check RLS policies include proper `auth.uid()` checks
- Test queries in SQL Editor with RLS enabled

## Production Deployment

Before deploying to production:

1. ✅ Review and test all RLS policies
2. ✅ Enable email rate limiting in Auth settings
3. ✅ Set up custom SMTP for emails (optional)
4. ✅ Configure database backups
5. ✅ Set up monitoring alerts
6. ✅ Add API rate limiting on edge functions
7. ✅ Rotate and secure API keys

## Cost Optimization

- Monitor `api_usage_logs` for LLM costs
- Consider using user's own API keys vs server keys
- Implement caching for repeated queries
- Use cheaper models (gpt-4o-mini, claude-haiku) where possible

## Need Help?

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Edge Functions Guide: https://supabase.com/docs/guides/functions
