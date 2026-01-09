import re

# Read the file
with open(r'c:\Users\HP\OneDrive\Desktop\backend\extension\content\caption-extractor.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the extractTranscriptFromUdemy function and replace it
new_extract_function = '''async function extractTranscriptFromUdemy() {
    console.log('[Udemy AI] Attempting to extract transcript from Udemy...');
    
    // Try to open transcript panel if it's closed
    await ensureTranscriptPanelOpen();
    
    // Wait for transcript to load
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const transcript = extractTranscriptText();
    return transcript;
}

// Helper function to ensure transcript panel is open
async function ensureTranscriptPanelOpen() {
    console.log('[Udemy AI] Checking if transcript panel is open...');
    
    // Look for transcript button/toggle
    const transcriptButtons = [
        'button[data-purpose="transcript-toggle"]',
        'button[aria-label*="Transcript"]',
        'button[aria-label*="transcript"]',
        '[class*="transcript-toggle"]'
    ];
    
    for (const selector of transcriptButtons) {
        const button = document.querySelector(selector);
        if (button && button.getAttribute('aria-expanded') === 'false') {
            console.log('[Udemy AI] Opening transcript panel...');
            button.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            break;
        }
    }
}'''

# Replace the extractTranscriptFromUdemy function
pattern = r'function extractTranscriptFromUdemy\(\) \{[\s\S]*?^\}'
content = re.sub(pattern, new_extract_function, content, flags=re.MULTILINE)

# Write back
with open(r'c:\Users\HP\OneDrive\Desktop\backend\extension\content\caption-extractor.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Enhanced caption-extractor.js with better transcript extraction!")
