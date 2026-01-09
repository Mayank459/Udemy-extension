# Setting Up Free AI (Hugging Face)

## Quick Start - Get Your Free API Key

### Option 1: Hugging Face (Recommended - 100% Free)

1. **Create Account**: Go to [huggingface.co](https://huggingface.co/join)
2. **Get Token**: Visit [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. **Create New Token**: Click "New token" → Name it "udemy-ai" → Role: "Read"
4. **Copy Token**: Copy the token (starts with `hf_...`)
5. **Add to .env**:
   ```bash
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```

**Limits**: Free tier includes ~30,000 requests/month (more than enough!)

### Option 2: Groq (Very Fast & Free)

1. **Sign Up**: [console.groq.com](https://console.groq.com)
2. **Get API Key**: Go to API Keys section
3. **Add to .env**:
   ```bash
   GROQ_API_KEY=gsk_your_key_here
   ```

**Limits**: Free tier with generous rate limits

## Models Being Used

- **Hugging Face**: `mistralai/Mistral-7B-Instruct-v0.2` (7B parameters, good quality)
- **Groq**: `mixtral-8x7b-32768` (very fast inference)

## First Time Setup Note

⚠️ **Important**: When using Hugging Face free tier, the first request might take 20-30 seconds because the model needs to "wake up". Subsequent requests are much faster!

If you see "Model is loading", just wait 20 seconds and try again.

## Testing Your Setup

After adding your key to `.env`, restart the backend:
```bash
python main.py
```

Then test with the extension - it should now generate real AI summaries! 🎉
