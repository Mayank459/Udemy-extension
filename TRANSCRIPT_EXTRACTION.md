# Using Udemy Transcript Instead of Captions

## ✅ Why Transcript is Better

1. **Easier Access** - Udemy provides transcripts in the UI
2. **Complete Text** - Full lecture content without timing codes
3. **No Parsing** - Already formatted as clean text
4. **More Reliable** - Always available when captions are enabled

## 🔍 How It Works

The updated `caption-extractor.js` now:

### Strategy 1: Auto-Open Transcript Panel
- Finds the transcript toggle button
- Clicks it if not already open
- Waits for panel to load

### Strategy 2: Extract Transcript Text
Tries multiple selectors to find transcript:
- `[data-purpose="transcript-cue"]` - Individual transcript segments
- `.transcript--cue-container--wZP_T` - Udemy's CSS class
- `[data-purpose="transcript-container"]` - Container element

### Strategy 3: Fallback to Page Data
- Searches `<script>` tags for embedded transcript data
- Falls back to sample data if nothing found

## 📝 How to Use

### For Users:
1. **Enable transcript** on the Udemy lecture (click the transcript button)
2. **Click "AI Overview" tab**
3. **Click "Generate Summary"**
4. The extension will automatically extract the transcript!

### Testing:
1. Reload the extension in Chrome
2. Go to a Udemy lecture
3. Make sure transcript is visible (click transcript button if needed)
4. Open AI Overview tab
5. Generate summary

## 🎯 Advantages Over Captions

| Feature | Captions (VTT) | Transcript |
|---------|---------------|------------|
| Access | Network requests | DOM scraping |
| Format | VTT with timestamps | Plain text |
| Parsing | Complex | Simple |
| Reliability | Medium | High |
| Speed | Slower | Faster |

## 🔧 Troubleshooting

### If transcript extraction fails:
1. **Check if transcript is enabled** on the lecture
2. **Open browser console** (F12) to see logs
3. **Look for**: `[Udemy AI] Found X transcript segments`
4. **Fallback**: Extension will use sample data

### Common Issues:
- **"Using sample data"** - Transcript not found, check if enabled
- **Empty transcript** - Selectors might be outdated
- **Partial transcript** - Panel might not be fully loaded

## 🚀 Next Steps

The extension now:
- ✅ Tries to extract real Udemy transcripts
- ✅ Falls back to sample data if extraction fails
- ✅ Works automatically without manual setup

Just reload the extension and test it on a lecture with transcript enabled!
