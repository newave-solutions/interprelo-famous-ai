# Supabase Edge Functions

This directory contains Supabase Edge Functions for secure server-side operations.

## Functions

### 1. `llm-chat`
**Purpose:** Securely handle LLM API calls (OpenAI/Anthropic) from the server.

**Benefits:**
- Protects API keys from client exposure
- Tracks usage and costs in database
- Enforces authentication
- Centralizes API call logic

**Endpoint:** `https://your-project.supabase.co/functions/v1/llm-chat`

**Request:**
```typescript
{
  provider: 'openai' | 'anthropic',
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature?: number,
  maxTokens?: number,
  apiKey?: string // Optional: user's own key
}
```

**Response:**
```typescript
{
  content: string,
  usage: {
    promptTokens: number,
    completionTokens: number,
    totalTokens: number
  },
  model: string
}
```

### 2. `save-conversation`
**Purpose:** Store AI conversation logs with coaching feedback.

**Benefits:**
- Persists conversation history
- Enables analytics and insights
- Tracks user progress over time

**Endpoint:** `https://your-project.supabase.co/functions/v1/save-conversation`

**Request:**
```typescript
{
  sessionId?: string,
  scenarioType: string,
  currentRole: string,
  conversationData: object,
  coachingFeedback?: object,
  emotionalToneAnalysis?: object,
  totalMessages: number,
  sessionScore?: number
}
```

**Response:**
```typescript
{
  success: boolean,
  conversationId: string
}
```

## Local Development

### Prerequisites
- Supabase CLI: `npm install -g supabase`
- Deno: https://deno.land/manual/getting_started/installation

### Serve Functions Locally

```bash
# Start Supabase local development
supabase start

# Serve a specific function
supabase functions serve llm-chat

# In another terminal, test the function
curl -i --location --request POST 'http://localhost:54321/functions/v1/llm-chat' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "provider": "openai",
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Test"}]
  }'
```

## Deployment

### Deploy All Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy llm-chat
```

### Set Environment Variables

```bash
# Set API keys (optional if users provide their own)
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# List all secrets
supabase secrets list
```

## Monitoring

### View Logs

```bash
# Real-time logs
supabase functions logs llm-chat --tail

# Get recent logs
supabase functions logs llm-chat --limit 100
```

### Check Usage

Query the `api_usage_logs` table in your Supabase dashboard to monitor:
- Total API calls
- Token usage
- Cost estimates
- Error rates

## Security

- ✅ All functions require authentication
- ✅ Row Level Security enforced on database
- ✅ API keys stored securely as secrets
- ✅ CORS configured for your domain only (in production)
- ✅ Rate limiting recommended (configure in Supabase dashboard)

## Cost Optimization

1. **Use cheaper models when possible:**
   - `gpt-4o-mini` instead of `gpt-4o` for simple tasks
   - `claude-3-5-haiku` instead of `claude-3-5-sonnet`

2. **Implement caching:**
   - Cache frequent responses
   - Reuse conversation context efficiently

3. **Monitor usage:**
   - Set up alerts for high API usage
   - Review `api_usage_logs` regularly

4. **User's own keys:**
   - Allow users to provide their own API keys
   - Reduces server costs

## Troubleshooting

### Function Not Deploying

```bash
# Check for syntax errors
deno check functions/llm-chat/index.ts

# Deploy with verbose output
supabase functions deploy llm-chat --debug
```

### Authentication Errors

- Verify Supabase URL and anon key are correct
- Check user is authenticated: `supabase.auth.getSession()`
- Ensure JWT is being passed in Authorization header

### API Rate Limits

- Implement exponential backoff for retries
- Consider queueing requests during high load
- Monitor rate limit headers from LLM providers

## Adding New Functions

1. Create new directory: `supabase/functions/my-function`
2. Create `index.ts` with Deno server code
3. Test locally: `supabase functions serve my-function`
4. Deploy: `supabase functions deploy my-function`

## Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Anthropic API Reference](https://docs.anthropic.com/claude/reference)
