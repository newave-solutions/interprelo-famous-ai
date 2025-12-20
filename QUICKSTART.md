# Quick Start Guide - AI-Powered Interpreter Training

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install Dependencies (1 minute)

```bash
npm install
```

### Step 2: Get an API Key (2 minutes)

Choose ONE option:

**Option A: OpenAI (Recommended)**

1. Go to <https://platform.openai.com/api-keys>
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

**Option B: Anthropic (Alternative)**

1. Go to <https://console.anthropic.com/settings/keys>
2. Sign up or log in
3. Click "Create Key"
4. Copy the key (starts with `sk-ant-...`)

### Step 3: Configure the App (30 seconds)

**Quick Method (UI):**

1. Start the app: `npm run dev`
2. Open <http://localhost:5173>
3. Click Settings ⚙️ icon
4. Paste your API key
5. Click "Save Configuration"

**Alternative Method (.env file):**

```bash
cp .env.example .env
# Edit .env and add: VITE_OPENAI_API_KEY=sk-your-key-here
npm run dev
```

### Step 4: Try It Out! (1 minute)

1. **Test Voice Analysis:**
   - Navigate to "Vocal Dashboard"
   - Click "Start Recording"
   - Grant microphone permission
   - Speak naturally

2. **Try AI Scenario:**
   - Go to "AI Scenarios"
   - Click "Start Practice"
   - Select "Medical" → "Beginner"
   - Let the AI start
   - Respond as the interpreter

## ✅ Verification Checklist

- [ ] Dependencies installed
- [ ] API key configured
- [ ] Dev server running
- [ ] Microphone permission granted
- [ ] AI responds to your input
- [ ] Voice analysis shows metrics
- [ ] You can hear TTS

## 🎯 First Practice Session

**Recommended for Beginners:**

1. **Scenario**: Medical - Doctor/Patient
2. **Difficulty**: Beginner
3. **Duration**: 5-10 minutes
4. **Settings**:
   - ✅ Auto-speak AI
   - ✅ Show coaching
   - ⬜ Auto-listen (until comfortable)

**What to expect:**

- AI plays the patient
- You interpret as if translating
- Get instant feedback
- See your score improve

## 🆘 Common Issues

### "API key not configured"

→ Add key in Settings or .env file

### Microphone not working

→ Grant permission in browser, use Chrome/Edge

### Speech recognition not working

→ Use Chrome or Edge (Firefox not supported)

### Slow responses

→ Check internet connection, try GPT-4o Mini

## 📊 Cost Estimate

Your first hour of practice: **$0.10 - $0.30**

That's less than a coffee! ☕

## 🎓 Learning Path

**Week 1**: Beginner medical scenarios (15 min/day)
**Week 2**: Intermediate medical + legal basics
**Week 3**: Advanced medical + business scenarios
**Week 4**: Mix of all types, focus on coaching feedback

## 💡 Pro Tips

1. **Use voice input** - More realistic than typing
2. **Read the coaching** - That's where you learn
3. **Practice daily** - Consistency > intensity
4. **Start slow** - Beginner is OK!
5. **Track progress** - Watch your scores climb

## 📞 Need Help?

- Check [AI_SCENARIOS.md](AI_SCENARIOS.md) for detailed docs
- Check [VOICE_FEATURES.md](VOICE_FEATURES.md) for voice help
- Open an issue on GitHub
- Email: <support@interprelo.com>

---

**Ready to become a better interpreter? Let's go! 🚀**
