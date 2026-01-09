# Real Caption Extraction Guide for Udemy

## Step 1: Inspect Udemy's Caption System

1. **Open a Udemy lecture with captions enabled**
2. **Open DevTools** (F12)
3. **Go to Network tab**
4. **Filter by "vtt" or "caption"**
5. **Play the video**
6. **Look for caption file requests**

## What to Look For

Udemy typically uses one of these methods:

### Method 1: VTT Files (WebVTT)
- Look for `.vtt` file requests
- URL pattern might be: `https://udemy-captions.s3.amazonaws.com/...`
- These are standard caption files

### Method 2: JSON Captions
- Look for JSON responses containing caption data
- Might be in the initial page load or separate API calls

### Method 3: Embedded in Page
- Check the page source for caption data
- Look for `<script>` tags with caption information

## Step 2: Extract Caption URL Pattern

Once you find the caption requests, note:
- The URL pattern
- Any authentication tokens needed
- The response format

## Step 3: Implementation Strategy

### Option A: Direct VTT Fetch (If Available)
```javascript
async function fetchCaptions() {
    // Find the caption URL from the video player
    const video = document.querySelector('video');
    const tracks = video.querySelectorAll('track');
    
    for (const track of tracks) {
        if (track.kind === 'captions' || track.kind === 'subtitles') {
            const vttUrl = track.src;
            const response = await fetch(vttUrl);
            const vttText = await response.text();
            return parseVTT(vttText);
        }
    }
}

function parseVTT(vttText) {
    // Remove VTT headers and timestamps
    const lines = vttText.split('\n');
    const transcript = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip empty lines, timestamps, and VTT headers
        if (line && !line.includes('-->') && !line.startsWith('WEBVTT')) {
            transcript.push(line);
        }
    }
    
    return transcript.join(' ');
}
```

### Option B: Intercept Network Requests
```javascript
// In background/service-worker.js
chrome.webRequest.onCompleted.addListener(
    (details) => {
        if (details.url.includes('.vtt') || details.url.includes('caption')) {
            // Store caption URL
            chrome.storage.local.set({ captionUrl: details.url });
        }
    },
    { urls: ["*://*.udemy.com/*"] }
);
```

### Option C: Extract from Page Data
```javascript
function extractFromPageData() {
    // Udemy stores course data in window object
    // Look for: window.ud, window.__INITIAL_STATE__, etc.
    
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
        if (script.textContent.includes('caption') || script.textContent.includes('subtitle')) {
            // Parse the script content
            // Extract caption URLs or data
        }
    }
}
```

## Step 4: Testing

1. Open DevTools Console
2. Run: `chrome.runtime.sendMessage({ action: 'get_transcript' }, console.log)`
3. Verify the transcript is returned

## Common Issues

### CORS Errors
- Caption URLs might be on different domains
- Solution: Fetch in background script or use appropriate permissions

### Authentication
- Some caption URLs require authentication tokens
- Solution: Extract tokens from cookies or page data

### Dynamic Loading
- Captions might load after page load
- Solution: Use MutationObserver to wait for video player

## Next Steps

Once you identify the caption source:
1. Update `caption-extractor.js` with the appropriate method
2. Test on multiple lectures
3. Add error handling for lectures without captions

---

**For now, the extension uses sample transcript data for testing. Replace the SAMPLE_TRANSCRIPT in caption-extractor.js with real extraction logic once you identify the pattern.**
