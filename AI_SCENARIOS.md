# AI-Powered Interactive Scenarios

## Overview

The AI-Powered Interactive Scenarios feature transforms interpreting practice by using Large Language Models (LLMs) to simulate realistic conversations. The AI dynamically plays roles (doctor, patient, lawyer, client, etc.), responds contextually to your interpretations, evaluates emotional tone, and provides real-time coaching feedback.

## Key Features

### 1. Dynamic Role-Playing

- **AI Characters**: AI plays doctor, patient, lawyer, client, or custom roles
- **Contextual Responses**: AI responds naturally based on conversation history
- **Realistic Interactions**: Includes natural speech patterns, emotions, and reactions
- **Adaptive Difficulty**: Scenarios adjust to beginner, intermediate, or advanced levels

### 2. Emotional Tone Analysis

- **Real-time Detection**: Identifies emotions in AI responses (professional, empathetic, urgent, etc.)
- **Confidence Scoring**: Shows how certain the analysis is
- **Multiple Emotions**: Can detect combinations of emotional states
- **Visual Indicators**: Color-coded badges show current emotional tone

### 3. AI Coaching Feedback

- **Instant Evaluation**: Every response gets scored (0-100)
- **Strengths Identified**: Highlights what you're doing well
- **Areas for Improvement**: Specific suggestions for growth
- **Tonal Suggestions**: Guidance on matching appropriate emotional tone

### 4. Speech Integration

- **Text-to-Speech (TTS)**: AI responses spoken aloud automatically
- **Speech-to-Text (STT)**: Speak your interpretations naturally
- **Auto-modes**: Optional auto-speak and auto-listen features
- **Multiple Languages**: Configurable language support

### 5. Scenario Types

#### Medical Scenarios

- Doctor-patient consultations
- Medical history taking
- Diagnosis explanations
- Treatment discussions
- Emergency situations

#### Legal Scenarios

- Client consultations
- Court proceedings
- Contract discussions
- Rights explanations
- Legal advice sessions

#### Business Scenarios

- Negotiations
- Meetings
- Presentations
- Client relations
- Contract discussions

#### Emergency Scenarios

- 911 calls
- Crisis situations
- Time-sensitive communications
- High-stress interactions

## Setup Instructions

### 1. Get an API Key

Choose one of the supported providers:

#### Option A: OpenAI (Recommended)

1. Visit <https://platform.openai.com/api-keys>
2. Create an account or sign in
3. Generate a new API key
4. Copy the key (starts with `sk-...`)

**Recommended Models:**

- `gpt-4o` - Best quality, balanced cost
- `gpt-4o-mini` - Faster, cheaper, still excellent
- `gpt-4-turbo` - Previous generation, still good

**Pricing (as of Dec 2024):**

- GPT-4o Mini: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- GPT-4o: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens
- Typical practice session: ~$0.01 - $0.05

#### Option B: Anthropic (Claude)

1. Visit <https://console.anthropic.com/settings/keys>
2. Create an account or sign in
3. Generate a new API key
4. Copy the key (starts with `sk-ant-...`)

**Recommended Models:**

- `claude-3-5-sonnet-20241022` - Best for roleplay
- `claude-3-opus-20240229` - Highest quality
- `claude-3-haiku-20240307` - Fastest, cheapest

**Pricing (as of Dec 2024):**

- Claude 3.5 Sonnet: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- Typical practice session: ~$0.02 - $0.08

### 2. Configure the Application

#### Method A: Environment Variables (Recommended for Development)

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:

   ```env
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   VITE_LLM_PROVIDER=openai
   ```

3. Restart the development server

#### Method B: UI Settings (Recommended for Users)

1. Click the Settings icon in the app
2. Select your AI provider (OpenAI or Anthropic)
3. Paste your API key
4. Choose your model
5. Enable features
6. Save configuration

### 3. Start a Practice Session

1. Navigate to "AI Scenarios" section
2. Select scenario type (Medical, Legal, etc.)
3. Choose AI role (Doctor, Patient, etc.)
4. Set difficulty level
5. Click "Start Scenario"
6. The AI will provide an opening statement
7. Respond as the interpreter

## Using the Interface

### Main Components

#### Message Display

- **AI Messages**: White bubbles with role label
- **Your Messages**: Blue bubbles on the right
- **System Messages**: Blue info bars for status updates

#### Emotional Tone Badges

- Appear on AI messages
- Color-coded by emotion type:
  - Blue: Professional
  - Green: Empathetic
  - Red: Urgent
  - Orange: Frustrated
  - Purple: Confused
  - Gray: Neutral

#### Coaching Cards

- Appear below AI responses
- Show your performance score (0-100)
- List strengths (green checkmarks)
- Identify improvements (orange warnings)
- Provide tonal suggestions (blue lightbulbs)

#### Control Bar

- **Microphone Button**: Start/stop voice input
- **Send Button**: Submit your interpretation
- **Reset Button**: Start scenario over
- **Score Ring**: Current session average

### Input Methods

#### Typing

1. Type your interpretation in the text area
2. Press Enter to send (Shift+Enter for new line)
3. Or click the Send button

#### Voice Input

1. Click the microphone button
2. Speak your interpretation clearly
3. Speech appears in real-time
4. Click microphone again to stop
5. Review and edit if needed
6. Click Send

### Settings Toggles

#### Auto-speak AI

- When ON: AI responses are spoken aloud automatically
- When OFF: Silent mode, read responses visually

#### Auto-listen

- When ON: Microphone activates after AI speaks
- When OFF: Manual microphone activation

#### Show Coaching

- When ON: Feedback cards appear after each response
- When OFF: Hide coaching for immersive practice

## Best Practices

### For Effective Practice

1. **Start with Beginner**: Get comfortable with the system
2. **Use Voice Input**: More realistic than typing
3. **Enable Auto-speak**: Helps with audio processing practice
4. **Read Coaching**: Learn from each interaction
5. **Vary Scenarios**: Practice different contexts
6. **Track Progress**: Watch your session scores improve

### For Better AI Responses

1. **Be Specific**: Clear inputs get clear responses
2. **Stay in Character**: Remember you're the interpreter
3. **Natural Language**: Speak/type naturally, not robotically
4. **Use Context**: Reference earlier conversation points
5. **Ask Clarifications**: Just like real interpreting

### For Optimal Performance

1. **Stable Internet**: Required for LLM API calls
2. **Quiet Environment**: For speech recognition
3. **Good Microphone**: Improves transcription accuracy
4. **Chrome/Edge**: Best browser support for speech features
5. **Regular Practice**: Consistency builds skill

## Coaching Feedback Explained

### Scoring System (0-100)

- **80-100**: Excellent - Professional quality
- **60-79**: Good - Solid with room for improvement
- **40-59**: Fair - Needs practice
- **0-39**: Needs Work - Focus on fundamentals

### Evaluation Criteria

#### Response Length

- Too short: Lacks necessary detail
- Too long: Loses clarity and conciseness
- Optimal: 5-50 words typically

#### Professional Language

- Polite markers: "please", "thank you", "kindly"
- Formal tone: Appropriate register
- Respectful: Non-judgmental phrasing

#### Clarity

- No filler words: "um", "uh", "like", "you know"
- Clear articulation
- Proper grammar and structure

#### Tonal Appropriateness

- Matches scenario requirements
- Matches emotional context
- Maintains professional boundaries

### Sample Feedback

**High-scoring Response:**

```
Strengths:
✓ Appropriate response length
✓ Professional and polite language
✓ Clear articulation without filler words

Score: 95/100

Tonal Suggestions:
💡 Tone is appropriate
```

**Response Needing Improvement:**

```
Areas to Improve:
⚠ Provide more detailed responses
⚠ Include more courteous language
⚠ Eliminate filler words for clearer interpretation

Score: 45/100

Tonal Suggestions:
💡 Show more empathy in your interpretation
💡 Maintain a more formal, professional tone
```

## Technical Details

### Architecture

```
User Input (Text/Voice)
    ↓
Speech-to-Text (if voice)
    ↓
LLM Service
    ├─ Context Building
    ├─ API Call (OpenAI/Anthropic)
    ├─ Response Generation
    ├─ Emotion Analysis
    └─ Coaching Feedback
    ↓
UI Update
    ↓
Text-to-Speech (if enabled)
```

### Data Flow

1. **User speaks/types** → Transcript captured
2. **Conversation history** → Added to context
3. **LLM API call** → Generate AI response
4. **Emotion analysis** → Keyword-based detection
5. **Coaching generation** → Rule-based evaluation
6. **UI update** → Display all information
7. **TTS** → Speak AI response

### Privacy & Security

#### What's Stored Locally

- API keys (localStorage, encrypted by browser)
- User preferences
- Session settings

#### What's Sent to AI Providers

- Conversation history (for context)
- Current user input
- System prompts (role instructions)

#### What's NOT Stored or Sent

- Practice sessions are not saved
- No user identification
- No conversation logging
- No data mining

#### Data Security

- API keys never leave your device except for direct API calls
- All communication is HTTPS encrypted
- No server-side storage
- You control all data

## Troubleshooting

### API Key Issues

**Error: "API key not configured"**

- Go to Settings → Add your API key
- Ensure key is correctly copied (no extra spaces)
- Check that key is valid on provider's dashboard

**Error: "API Error: Invalid authentication"**

- Key may be incorrect or expired
- Generate a new key from provider
- Update in Settings

**Error: "API Error: Rate limit exceeded"**

- You've hit your usage limit
- Wait a few minutes
- Check your provider's dashboard for limits
- Consider upgrading your plan

### Speech Issues

**Microphone not working**

- Grant microphone permission when prompted
- Check browser settings
- Ensure microphone is connected
- Use Chrome or Edge (best support)

**Speech recognition not working**

- Not supported in Firefox
- Limited support in Safari
- Use Chrome/Edge for full features
- Fallback to text input

**TTS not working**

- Check volume settings
- Try different voice in browser settings
- Restart browser
- Some languages have limited voice support

### Performance Issues

**Slow API responses**

- Check internet connection
- Try a faster model (gpt-4o-mini, claude-haiku)
- Provider may be experiencing high load
- Consider switching providers

**High costs**

- Use cheaper models (mini/haiku versions)
- Shorten conversation history
- Reduce session length
- Monitor usage in provider dashboard

## API Cost Management

### Estimating Costs

Typical conversation:

- System prompt: ~200 tokens
- User input: ~50 tokens
- AI response: ~100 tokens
- Total per exchange: ~350 tokens

10-minute session:

- ~10 exchanges
- ~3,500 tokens total
- Cost: $0.01 - $0.05 (depending on model)

### Cost-Saving Tips

1. **Use Cheaper Models**:
   - GPT-4o Mini instead of GPT-4o
   - Claude Haiku instead of Claude Opus

2. **Shorter Sessions**:
   - Practice in focused 5-10 minute sessions
   - Reset to clear history

3. **Monitor Usage**:
   - Check provider dashboard regularly
   - Set up billing alerts
   - Track spending

4. **Optimize Prompts**:
   - Keep responses concise
   - Avoid unnecessarily long inputs

## Future Enhancements

Planned features:

- [ ] Session recording and playback
- [ ] Progress tracking over time
- [ ] Custom scenario creation
- [ ] Multi-language support
- [ ] Advanced emotion AI (facial/vocal)
- [ ] Pronunciation feedback
- [ ] Peer comparison
- [ ] Certification preparation mode
- [ ] Export session transcripts
- [ ] Integration with Supabase for cloud storage

## Support & Resources

### Learning Resources

- Practice daily for best results
- Start with beginner scenarios
- Use coaching feedback to improve
- Review recordings if available

### Provider Documentation

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### Community

- Share tips with other learners
- Report issues and suggestions
- Request new scenarios
- Contribute improvements

## Conclusion

AI-powered scenarios represent the future of interpretation training. By providing realistic, adaptive, and immediate feedback, this system accelerates learning and builds confidence in a safe, controlled environment. Practice regularly, embrace the coaching feedback, and watch your skills grow!
