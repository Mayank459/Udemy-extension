console.log('[Udemy AI] Transcript extractor loaded');

// Sample transcript for testing (fallback if real extraction fails)
const SAMPLE_TRANSCRIPT = `
Welcome to this lecture on Python functions and data structures.

In this session, we'll cover the fundamentals of Python programming, specifically focusing on functions and how to work with different data structures.

Let's start with a simple function definition. In Python, we use the def keyword to define a function.

def greet(name):
    return f"Hello, {name}!"

This function takes a name parameter and returns a greeting string. Notice how we use f-strings for string formatting, which is a modern Python feature.

Now let's talk about data structures. Python has several built-in data structures including lists, tuples, dictionaries, and sets.

Here's an example of working with a list:

numbers = [1, 2, 3, 4, 5]
squared = [x**2 for x in numbers]
print(squared)

This demonstrates list comprehension, which is a concise way to create lists in Python.

For dictionaries, we can store key-value pairs:

student = {
    "name": "John",
    "age": 20,
    "courses": ["Math", "Physics", "CS"]
}

You can access dictionary values using square brackets or the get method.

Let's also look at a more complex function that processes data:

def calculate_average(numbers):
    if not numbers:
        return 0
    total = sum(numbers)
    return total / len(numbers)

This function calculates the average of a list of numbers, with error handling for empty lists.

Remember, functions are reusable blocks of code that help us organize our programs better. Always use descriptive names and include docstrings to document what your functions do.

That's it for this lecture. Practice these concepts and we'll move on to more advanced topics in the next session.
`;

/**
 * Extract transcript from Udemy's transcript panel
 */
async function extractTranscriptFromUdemy() {
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
}

/**
 * Extract the actual transcript text from the DOM
 */
function extractTranscriptText() {
    console.log('[Udemy AI] Searching for transcript in DOM...');

    // Strategy 1: Look for the transcript sidebar (has Autoscroll checkbox)
    // Based on screenshot, transcript is in a sidebar panel on the right
    const transcriptSidebar = document.querySelector('[data-purpose="sidebar"]');
    if (transcriptSidebar) {
        console.log('[Udemy AI] Found sidebar, extracting text...');

        // Look for all paragraph/span elements in the sidebar
        const textElements = transcriptSidebar.querySelectorAll('p, span[class*="cue"], div[class*="cue"]');
        if (textElements.length > 0) {
            const text = Array.from(textElements)
                .map(el => el.textContent.trim())
                .filter(t => t.length > 0 && !t.includes('Autoscroll') && !t.startsWith('Take a'))
                .join(' ');

            if (text.length > 50) {
                console.log(`[Udemy AI] ✅ Extracted ${text.length} characters from sidebar`);
                return text;
            }
        }
    }

    // Strategy 2: Look for specific Udemy transcript cue selectors
    const transcriptSelectors = [
        // Udemy specific transcript cues
        '[data-purpose="cue-text"]',
        '[class*="transcript--cue-text"]',
        '[class*="cue-text"]',
        'span[class*="transcript"]',
        // Try specific transcript cue selectors
        '[data-purpose="transcript-cue-text"]',
        '[class*="transcript-cue"]',
        // Try broader selectors
        '.transcript p',
        '[role="region"][aria-label*="Transcript"] p',
        '[role="region"][aria-label*="transcript"] p',
        // Try any paragraph in transcript area
        'div[class*="transcript"] p',
        'div[class*="Transcript"] p'
    ];

    for (const selector of transcriptSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`[Udemy AI] Found ${elements.length} elements with selector: ${selector}`);
            const text = Array.from(elements)
                .map(el => el.textContent.trim())
                .filter(t => t.length > 0)
                .join(' ');

            if (text.length > 50) {
                console.log(`[Udemy AI] ✅ Extracted ${text.length} characters`);
                return text;
            }
        }
    }

    // Strategy 2: Look for any visible transcript container
    const containerSelectors = [
        '[data-purpose="transcript-container"]',
        '[aria-label*="Transcript"]',
        '[aria-label*="transcript"]',
        'aside[class*="transcript"]',
        'div[class*="transcript-panel"]'
    ];

    for (const selector of containerSelectors) {
        const container = document.querySelector(selector);
        if (container) {
            console.log(`[Udemy AI] Found container: ${selector}`);
            const text = container.innerText.trim();
            if (text.length > 50) {
                console.log(`[Udemy AI] ✅ Extracted ${text.length} characters from container`);
                return text;
            }
        }
    }

    // Strategy 3: Search all visible text areas
    const allTextAreas = document.querySelectorAll('p, span, div');
    let transcriptText = '';

    for (const el of allTextAreas) {
        const text = el.textContent;
        // Look for text that looks like transcript (has sentences)
        if (text && text.length > 30 && text.includes('.') &&
            !text.includes('http') && !text.includes('www')) {
            // Check if parent might be transcript
            const parent = el.closest('[class*="transcript"], [class*="Transcript"]');
            if (parent) {
                transcriptText += text + ' ';
            }
        }
    }

    if (transcriptText.length > 100) {
        console.log(`[Udemy AI] ✅ Extracted ${transcriptText.length} characters from text search`);
        return transcriptText.trim();
    }

    // Strategy 4: Debug - log what we can find
    console.log('[Udemy AI] 🔍 Debugging - looking for any transcript-related elements...');
    const allElements = document.querySelectorAll('*');
    let foundTranscriptElements = 0;

    for (const el of allElements) {
        const className = el.className?.toString() || '';
        const ariaLabel = el.getAttribute('aria-label') || '';
        const dataPurpose = el.getAttribute('data-purpose') || '';

        if (className.toLowerCase().includes('transcript') ||
            ariaLabel.toLowerCase().includes('transcript') ||
            dataPurpose.toLowerCase().includes('transcript')) {
            foundTranscriptElements++;
            console.log(`[Udemy AI] Found element:`, {
                tag: el.tagName,
                class: className,
                'aria-label': ariaLabel,
                'data-purpose': dataPurpose,
                textLength: el.textContent?.length || 0
            });
        }
    }

    console.log(`[Udemy AI] Found ${foundTranscriptElements} transcript-related elements`);
    console.log('[Udemy AI] ⚠️ Could not extract transcript, using sample data');
    return null;
}

// Listen for requests from inject-tab.js via window.postMessage
window.addEventListener('message', (event) => {
    // Only accept messages from same window
    if (event.source !== window) return;

    if (event.data && event.data.type === 'UDEMY_AI_TRANSCRIPT_REQUEST') {
        console.log('[Udemy AI] 📝 Transcript requested via postMessage');

        // Try to extract real transcript (async)
        extractTranscriptFromUdemy()
            .then(transcript => {
                if (transcript && transcript.length > 100) {
                    console.log('[Udemy AI] ✅ Sending real transcript');
                    window.postMessage({
                        type: 'UDEMY_AI_TRANSCRIPT_RESPONSE',
                        transcript: transcript,
                        isReal: true
                    }, '*');
                } else {
                    console.log('[Udemy AI] ⚠️ Sending sample transcript');
                    window.postMessage({
                        type: 'UDEMY_AI_TRANSCRIPT_RESPONSE',
                        transcript: SAMPLE_TRANSCRIPT,
                        isReal: false
                    }, '*');
                }
            })
            .catch(error => {
                console.error('[Udemy AI] Error extracting transcript:', error);
                console.log('[Udemy AI] ⚠️ Sending sample transcript due to error');
                window.postMessage({
                    type: 'UDEMY_AI_TRANSCRIPT_RESPONSE',
                    transcript: SAMPLE_TRANSCRIPT,
                    isReal: false
                }, '*');
            });
    }
});

// Expose function globally for inject-tab.js
window.extractTranscriptFromUdemy = extractTranscriptFromUdemy;
console.log('[Udemy AI] extractTranscriptFromUdemy exposed globally');
