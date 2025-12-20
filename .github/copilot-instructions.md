# Interprelo Famous AI - AI Coding Agent Instructions

## Project Overview

This is an AI-powered interpreter training platform built with React + TypeScript + Vite. It combines LLM-based conversational AI (OpenAI/Anthropic) with real-time voice analysis using Web Audio/Speech APIs to create immersive practice scenarios for medical, legal, and business interpreters.

## Architecture

### Frontend Structure
- **Main App**: [src/App.tsx](src/App.tsx) bootstraps providers (Theme, QueryClient, Toaster)
- **Primary Page**: [src/pages/Index.tsx](src/pages/Index.tsx) - single-page app with section-based navigation
- **Context Hierarchy**: `AIConfigProvider` → `AuthProvider` → `AppProvider` → app components
  - API keys stored in localStorage via `AIConfigContext`
  - Supabase auth optional (app works without backend)
  - `AppContext` manages global UI state (active section, modals)

### Key Services (src/lib/)
1. **llmService.ts**: Dual-provider LLM integration
   - Supports OpenAI (`gpt-4o-mini` default) and Anthropic (`claude-3-5-sonnet`)
   - Returns structured responses with `emotionalTone` and `coaching` metadata
   - Can use Supabase Edge Functions or direct API calls based on `useEdgeFunction` flag
   
2. **audioAnalysis.ts**: Real-time audio processing
   - Uses Web Audio API's `AnalyserNode` for FFT-based pitch detection (80-300 Hz range)
   - Calculates volume via RMS, returns 0-100 normalized scores
   - `AudioAnalyzer` class must be initialized with `getUserMedia()` stream

3. **speechService.ts**: TTS/STT wrapper
   - Uses browser's `SpeechSynthesis` (TTS) and `SpeechRecognition` (STT)
   - No external dependencies - works offline for speech features
   - Handles continuous recognition with interim results

4. **supabase.ts**: Optional backend client
   - Hardcoded credentials (public anon key) - safe for client-side
   - See [supabase/SCHEMA.md](supabase/SCHEMA.md) for full database structure
   - Edge functions in `supabase/functions/` handle secure LLM proxying

### Component Patterns

**Section Components** (src/components/sections/)
- Mounted conditionally in `Index.tsx` based on `AppContext.activeSection`
- Self-contained: manage own state, API calls, and cleanup
- Example: `AIScenarioPractice.tsx` orchestrates LLM + Speech + Audio services

**UI Components** (src/components/ui/)
- shadcn/ui primitives with Tailwind + CVA styling
- Custom components: `ProgressRing`, `VocalMeter`, `WaveformVisualizer`
- Use `cn()` utility from `lib/utils.ts` for className merging

**Context Usage**
```tsx
// Always use exported hooks, not raw useContext
import { useAIConfig } from '@/contexts/AIConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
```

### Data Flow for AI Scenarios

1. User clicks "Start Practice" → `AIScenarioPractice` component mounts
2. Component initializes `LLMService` with API key from `AIConfigContext`
3. System prompt built from scenario metadata in `buildSystemPrompt()`
4. User speaks → `SpeechService` transcribes → sent to LLM
5. LLM response includes:
   - `content`: AI's spoken response
   - `emotionalTone`: Detected emotions (professional/empathetic/urgent/etc.)
   - `coaching`: Scored feedback with strengths/improvements
6. Response saved to `ai_conversations` table (if Supabase enabled)

## Development Workflows

### Running the App
```bash
npm run dev          # Start Vite dev server (localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

### Configuration
- **API Keys**: Set via UI (Settings modal) or env vars `VITE_OPENAI_API_KEY`/`VITE_ANTHROPIC_API_KEY`
- **LLM Provider**: Switch in `AIConfigContext` - updates both provider and default model
- **Browser Permissions**: Microphone access required for voice features

### Supabase Setup (Optional)
- Local: `supabase login` → `supabase link` → `supabase db push`
- Migrations: Apply `supabase/migrations/001_initial_schema.sql` via dashboard SQL editor
- Edge Functions: Deploy with `supabase functions deploy llm-chat --no-verify-jwt`
- See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for full guide

## Critical Conventions

### Type Safety
- All LLM responses use `LLMResponse` interface with mandatory `emotionalTone` and optional `coaching`
- Scenario data uses strict type unions: `'medical' | 'legal' | 'business' | 'emergency'`
- Audio analysis returns normalized 0-100 scores, not raw values

### Service Initialization
- Always check service readiness before calling methods:
  ```tsx
  if (!llmServiceRef.current) return;
  ```
- Clean up audio streams in `useEffect` cleanup functions
- Stop speech synthesis/recognition on component unmount

### Error Handling
- LLM errors: Fall back to error message, never crash the session
- Microphone errors: Show user-friendly prompt for permissions
- API key missing: Display `AISettingsModal` automatically

### Performance
- Use `useRef` for services to avoid re-initialization
- Debounce audio analysis updates (not every frame)
- Lazy load scenario data from `appData.ts`

## Integration Points

### Browser APIs
- **MediaStream API**: Microphone access for audio analysis
- **Web Audio API**: Real-time frequency/amplitude analysis
- **Web Speech API**: TTS/STT - no API keys needed
- **localStorage**: Persist API keys and user settings

### External APIs
- **OpenAI**: Chat completions endpoint, expects `messages` array
- **Anthropic**: Messages endpoint, requires `anthropic-version: 2023-06-01` header
- Both: Responses parsed for emotional tone via regex/keywords (not separate API call)

### Supabase Integration
- **Auth**: Email/password + OAuth (Google/Microsoft) - see `AuthContext.tsx`
- **Database**: Row-level security enforced, user_id FK on all user tables
- **Edge Functions**: Deno-based, handle CORS + API key encryption
- **Storage**: Not currently used (audio recordings could be added)

## Example Patterns

### Adding a New Scenario Type
1. Update type union in `llmService.ts`: `scenarioType: 'medical' | 'legal' | 'business' | 'emergency' | 'YOUR_TYPE'`
2. Add system prompt logic in `buildSystemPrompt()` method
3. Create scenario data in `appData.ts` with matching category
4. Update `ScenarioLibrary.tsx` to display new category

### Adding a New Voice Metric
1. Implement calculation in `AudioAnalyzer` class ([audioAnalysis.ts](src/lib/audioAnalysis.ts#L50-L100))
2. Add to `AudioAnalysisData` interface
3. Update `VocalDashboard.tsx` to display metric
4. Add column to `practice_sessions` table if persisting

### Switching LLM Providers
```tsx
// In AISettingsModal or AIConfigContext
updateConfig({ 
  provider: 'anthropic', 
  model: 'claude-3-5-sonnet-20241022' 
});
// LLMService automatically adjusts API endpoint and request format
```

## Common Gotchas

1. **Fast Refresh Warnings**: Export hooks as named functions, not inline (see `AIConfigContext.tsx:75`)
2. **Audio Permissions**: Must be triggered by user gesture - wrap in button click handler
3. **Speech Recognition**: Chrome-only on desktop, limited mobile support
4. **LLM Rate Limits**: No built-in retry logic - handle `429` errors in UI
5. **Environment Variables**: Must start with `VITE_` to be exposed to client
6. **Supabase RLS**: Test policies with different user roles, easy to break
7. **Conversation History**: Grows unbounded - implement token limit in `buildMessages()`

## Key Files to Reference

- [AI_IMPLEMENTATION.md](AI_IMPLEMENTATION.md) - Complete feature documentation
- [supabase/SCHEMA.md](supabase/SCHEMA.md) - Database schema with examples
- [src/lib/llmService.ts](src/lib/llmService.ts) - LLM integration patterns
- [src/components/sections/AIScenarioPractice.tsx](src/components/sections/AIScenarioPractice.tsx) - Full AI scenario implementation
- [QUICKSTART.md](QUICKSTART.md) - Setup and configuration guide
