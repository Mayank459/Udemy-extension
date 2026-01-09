// Background service worker
console.log('[Udemy AI] Service worker started');

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        chrome.storage.local.get(['backendUrl'], (result) => {
            sendResponse({ backendUrl: result.backendUrl || 'http://localhost:8000' });
        });
        return true; // Keep message channel open for async response
    }
});
