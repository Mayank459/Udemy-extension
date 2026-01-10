console.log('[Udemy AI] Inject script loaded');

// Wait for page to be ready
function init() {
    console.log('[Udemy AI] Initializing...');

    const tryInject = () => {
        if (document.querySelector('[data-purpose="ai-overview-tab"]')) {
            console.log('[Udemy AI] Already injected');
            return true;
        }

        console.log('[Udemy AI] Searching for tab container...');

        // Find ALL scroll ports on the page
        const allScrollPorts = document.querySelectorAll('[data-purpose="scroll-port"]');
        console.log(`[Udemy AI] Found ${allScrollPorts.length} scroll ports`);

        // Find the one that contains Overview/Q&A tabs (below video), not sidebar tabs
        for (const scrollPort of allScrollPorts) {
            const buttons = scrollPort.querySelectorAll('button[role="tab"]');

            // Check if this scroll port has the Overview tab (main content tabs)
            let hasOverviewTab = false;
            for (const button of buttons) {
                const text = button.textContent || '';
                if (text.includes('Overview') || text.includes('Q&A')) {
                    hasOverviewTab = true;
                    break;
                }
            }

            if (hasOverviewTab) {
                console.log('[Udemy AI] ✓ Found correct scroll port with Overview/Q&A tabs');
                console.log('[Udemy AI] Scroll port:', scrollPort);
                console.log('[Udemy AI] Number of existing tabs:', scrollPort.querySelectorAll('[data-index]').length);
                injectTab(scrollPort);
                return true;
            }
        }

        console.log('[Udemy AI] No correct scroll port found yet');
        return false;
    };

    // Try immediately
    if (tryInject()) {
        // Auto-generate summary in background after successful injection
        setTimeout(() => {
            console.log('[Udemy AI] Auto-starting background generation...');
            startBackgroundGeneration();
        }, 2000); // Wait 2 seconds for page to fully load
        return;
    }

    // Set up MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
        if (tryInject()) {
            observer.disconnect();
            // Auto-generate summary in background
            setTimeout(() => {
                console.log('[Udemy AI] Auto-starting background generation...');
                startBackgroundGeneration();
            }, 2000);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Also try after delays (Udemy loads tabs asynchronously)
    setTimeout(() => {
        if (tryInject()) {
            observer.disconnect();
            setTimeout(() => startBackgroundGeneration(), 2000);
        }
    }, 1000);

    setTimeout(() => {
        if (tryInject()) {
            observer.disconnect();
            setTimeout(() => startBackgroundGeneration(), 2000);
        }
    }, 3000);

    setTimeout(() => {
        if (tryInject()) {
            observer.disconnect();
            setTimeout(() => startBackgroundGeneration(), 2000);
        }
    }, 5000);
}

function injectTab(scrollPort) {
    console.log('[Udemy AI] Injecting AI Overview tab...');
    console.log('[Udemy AI] Scroll port:', scrollPort);

    // Count existing tabs to get the next index
    const existingTabs = scrollPort.querySelectorAll('[data-index]');
    const nextIndex = existingTabs.length;

    console.log('[Udemy AI] Existing tabs:', existingTabs.length);
    console.log('[Udemy AI] Next index:', nextIndex);

    // Create the scroll item wrapper (matches Udemy structure exactly)
    const scrollItem = document.createElement('div');
    scrollItem.setAttribute('data-index', nextIndex);
    scrollItem.className = 'carousel-module--scroll-item--QZoY7';

    // Create nav button container
    const navButtonContainer = document.createElement('div');
    navButtonContainer.className = 'ud-nav-button-container tabs-module--nav-button-container--UQiPm';

    // Create h2 wrapper
    const h2 = document.createElement('h2');

    // Create the actual button
    const button = document.createElement('button');
    button.type = 'button';
    button.id = `tabs--7-tab-${nextIndex}`;
    button.setAttribute('aria-selected', 'false');
    button.setAttribute('role', 'tab');
    button.className = 'ud-btn ud-btn-large ud-btn-ghost ud-btn-text-md ud-nav-button tabs-module--nav-button--DtB8V';
    button.setAttribute('tabindex', '-1');
    button.style.borderBottom = 'none';
    button.setAttribute('data-purpose', 'ai-overview-tab');

    // Create button label
    const span = document.createElement('span');
    span.className = 'ud-btn-label';
    span.textContent = '✨ AI Overview';

    // Assemble the structure
    button.appendChild(span);
    h2.appendChild(button);
    navButtonContainer.appendChild(h2);
    scrollItem.appendChild(navButtonContainer);

    // Add click handler
    button.addEventListener('click', async () => {
        console.log('[Udemy AI] AI Overview tab clicked!');

        // Create panel on first click if it doesn't exist
        if (!document.getElementById('ai-overview-panel')) {
            console.log('[Udemy AI] Panel does not exist, creating it now...');
            createAIPanel();
        }

        showAIPanel();

        // Auto-generate summary if not already generated
        const resultDiv = document.getElementById('ai-result');
        if (resultDiv && resultDiv.style.display === 'none') {
            console.log('[Udemy AI] Auto-generating summary...');
            // Wait a bit for panel to be visible
            setTimeout(() => {
                triggerGeneration();
            }, 100);
        }
    });

    // Append to scroll port
    scrollPort.appendChild(scrollItem);

    console.log('[Udemy AI] Tab injected successfully!');
    console.log('[Udemy AI] Tab element:', button);
    console.log('[Udemy AI] Tab visible?', button.offsetWidth > 0 && button.offsetHeight > 0);
}

function createAIPanel() {
    console.log('[Udemy AI] Creating AI panel...');

    // Find the main content area below the video
    // Look for tab panels with IDs like "tabs--X-content-Y" that are NOT in the sidebar

    const allTabPanels = document.querySelectorAll('[role="tabpanel"]');
    let mainContentPanel = null;

    console.log(`[Udemy AI] Found ${allTabPanels.length} total tab panels`);

    for (const panel of allTabPanels) {
        // Skip panels that are inside the actual sidebar element
        const inSidebar = panel.closest('[data-purpose="sidebar"]');
        if (inSidebar) {
            console.log('[Udemy AI] Skipping sidebar panel:', panel.id);
            continue;
        }

        // Skip cookie consent / privacy panels (OneTrust)
        const isCookiePanel = panel.id?.includes('ot-') ||
            panel.className?.includes('ot-') ||
            panel.closest('[id*="onetrust"]') ||
            panel.closest('[class*="onetrust"]');
        if (isCookiePanel) {
            console.log('[Udemy AI] Skipping cookie/privacy panel:', panel.id);
            continue;
        }

        // Look for panels with IDs like "tabs--7-content-0" (main content tabs)
        if (panel.id && panel.id.match(/^tabs--\d+-content-\d+$/)) {
            console.log('[Udemy AI] Found main content panel:', panel.id);
            mainContentPanel = panel;
            break;
        }
    }

    if (!mainContentPanel) {
        console.error('[Udemy AI] Could not find main content panel');
        console.log('[Udemy AI] All panels:', allTabPanels);
        return;
    }

    // Get the parent container that holds all tab panels
    const contentArea = mainContentPanel.parentElement;
    console.log('[Udemy AI] Found main content panel:', mainContentPanel);
    console.log('[Udemy AI] Found content area (parent):', contentArea);

    const aiPanel = document.createElement('div');
    aiPanel.id = 'ai-overview-panel';
    aiPanel.setAttribute('role', 'tabpanel');
    aiPanel.style.cssText = `
        display: none;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        margin: 1rem 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        position: relative;
        z-index: 1;
        min-height: 400px;
        border: 3px solid #a435f0;
    `;

    aiPanel.innerHTML = `
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0; font-size: 1.5rem; color: #1c1d1f;">✨ AI Smart Overview</h2>
            <button id="ai-generate-btn" style="
                background: #a435f0;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 700;
                font-size: 1rem;
            ">Generate Summary</button>
        </div>
        
        <div id="ai-content">
            <div id="ai-placeholder" style="
                text-align: center;
                padding: 3rem;
                color: #6a6f73;
                background: #f7f9fa;
                border-radius: 4px;
            ">
                <p style="font-size: 1.1rem; margin: 0;">
                    Click "Generate Summary" to analyze this lecture with AI 🤖
                </p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                    Powered by Groq AI (llama-3.3-70b-versatile)
                </p>
            </div>
            
            <div id="ai-loading" style="display: none; text-align: center; padding: 3rem;">
                <div style="font-size: 1.2rem; color: #a435f0;">
                    🤖 Analyzing transcript and extracting code...
                </div>
                <div style="margin-top: 1rem; color: #6a6f73;">
                    This may take a few seconds
                </div>
            </div>
            
            <div id="ai-result" style="display: none;"></div>
        </div>
    `;

    // Append to the tab content area (sibling of other tab panels)
    console.log('[Udemy AI] Appending panel to:', contentArea);
    contentArea.appendChild(aiPanel);
    console.log('[Udemy AI] Panel appended. Parent element:', aiPanel.parentElement);
    console.log('[Udemy AI] Panel position in DOM:', aiPanel.getBoundingClientRect());

    // Bind generate button
    document.getElementById('ai-generate-btn').addEventListener('click', triggerGeneration);
}

function showAIPanel() {
    console.log('[Udemy AI] showAIPanel called');

    // Find the AI panel
    const aiPanel = document.getElementById('ai-overview-panel');
    if (!aiPanel) {
        console.error('[Udemy AI] AI panel not found!');
        return;
    }

    console.log('[Udemy AI] AI panel found:', aiPanel);
    console.log('[Udemy AI] AI panel current display:', aiPanel.style.display);

    // Hide all other tab panels (only main content ones, not sidebar)
    const allPanels = document.querySelectorAll('[role="tabpanel"][id*="tabs--"]');
    allPanels.forEach(panel => {
        const inSidebar = panel.closest('[data-purpose="sidebar"]');
        if (!inSidebar && panel.id !== 'ai-overview-panel') {
            panel.style.display = 'none';
            console.log('[Udemy AI] Hiding panel:', panel.id);
        }
    });

    // Show AI panel
    aiPanel.style.display = 'block';
    console.log('[Udemy AI] AI panel display set to block');

    // Scroll the panel into view
    aiPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Flash the background to make it obvious
    aiPanel.style.background = '#fff3cd';
    setTimeout(() => {
        aiPanel.style.background = 'white';
    }, 1000);

    // Update tab states
    const allTabs = document.querySelectorAll('[role="tab"]');
    allTabs.forEach(tab => {
        tab.setAttribute('aria-selected', 'false');
        tab.classList.remove('ud-nav-button-active');
    });

    const aiTab = document.querySelector('[data-purpose="ai-overview-tab"]');
    if (aiTab) {
        aiTab.setAttribute('aria-selected', 'true');
        aiTab.classList.add('ud-nav-button-active');
        console.log('[Udemy AI] AI tab activated');
    } else {
        console.error('[Udemy AI] Could not find AI tab to update');
    }

    // Add click handlers to all other tabs to restore them when clicked
    setupOtherTabClickHandlers();
}

// Setup click handlers for native Udemy tabs
function setupOtherTabClickHandlers() {
    const allTabs = document.querySelectorAll('[role="tab"]:not([data-purpose="ai-overview-tab"])');

    allTabs.forEach(tab => {
        // Remove existing handler if any
        if (tab._aiClickHandler) {
            tab.removeEventListener('click', tab._aiClickHandler);
        }

        // Create and store new handler
        tab._aiClickHandler = function () {
            console.log('[Udemy AI] Native tab clicked, hiding AI panel');

            // Hide AI panel
            const aiPanel = document.getElementById('ai-overview-panel');
            if (aiPanel) {
                aiPanel.style.display = 'none';
            }

            // Find and show the corresponding panel for this tab
            const ariaControls = this.getAttribute('aria-controls');
            if (ariaControls) {
                const targetPanel = document.getElementById(ariaControls);
                if (targetPanel) {
                    targetPanel.style.display = 'block';
                    console.log('[Udemy AI] Showing panel:', ariaControls);
                }
            }

            // Update tab states
            const allTabs = document.querySelectorAll('[role="tab"]');
            allTabs.forEach(t => {
                t.setAttribute('aria-selected', 'false');
                t.classList.remove('ud-nav-button-active');
            });

            this.setAttribute('aria-selected', 'true');
            this.classList.add('ud-nav-button-active');
        };

        tab.addEventListener('click', tab._aiClickHandler);
    });

    console.log('[Udemy AI] Setup click handlers for', allTabs.length, 'native tabs');
}

// Start generation in background (silently)
function startBackgroundGeneration() {
    console.log('[Udemy AI] Starting background generation...');

    // Create panel if it doesn't exist (but don't show it)
    if (!document.getElementById('ai-overview-panel')) {
        createAIPanel();
    }

    // Check if summary already exists
    const resultDiv = document.getElementById('ai-result');
    if (resultDiv && resultDiv.style.display === 'none') {
        // Trigger generation silently
        console.log('[Udemy AI] Background: Generating summary...');
        triggerGeneration();
    } else {
        console.log('[Udemy AI] Background: Summary already exists');
    }
}

async function triggerGeneration(forceRefresh = false) {
    const loadingDiv = document.getElementById('ai-loading');
    const resultDiv = document.getElementById('ai-result');
    const placeholderDiv = document.getElementById('ai-placeholder');

    loadingDiv.style.display = 'block';
    placeholderDiv.style.display = 'none';
    resultDiv.style.display = 'none';

    try {
        // Get transcript from caption extractor
        const transcript = await getTranscript();

        if (!transcript) {
            throw new Error('No transcript available. This is a demo - real caption extraction needs to be implemented.');
        }

        // Check cache first (unless force refresh)
        if (!forceRefresh && window.UdemyAICache) {
            const cached = window.UdemyAICache.getCachedSummary(window.location.href, transcript);
            if (cached) {
                renderResult(cached, true); // true = from cache
                return;
            }
        }

        // Get backend URL from settings (with fallback if chrome.storage is unavailable)
        let backendUrl = 'https://udemy-extension.onrender.com'; // Default to Render server

        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const settings = await chrome.storage.local.get(['backendUrl']);
                backendUrl = settings.backendUrl || backendUrl;
            }
        } catch (e) {
            console.log('[Udemy AI] Chrome storage not available, using default URL');
        }

        console.log('[Udemy AI] Calling backend:', backendUrl);

        // Build request body - only include force_refresh if true (backward compatibility)
        const requestBody = {
            transcript: transcript,
            lecture_title: document.title
        };
        if (forceRefresh) {
            requestBody.force_refresh = true;
        }

        const response = await fetch(`${backendUrl}/api/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();

        // Store in cache
        if (window.UdemyAICache) {
            window.UdemyAICache.setCachedSummary(window.location.href, transcript, data);
        }

        renderResult(data, false); // false = fresh from API

    } catch (error) {
        console.error('[Udemy AI] Generation failed:', error);
        resultDiv.innerHTML = `
            <div style="background: #fff4e5; border: 1px solid #ffc107; padding: 1rem; border-radius: 4px; color: #856404;">
                <strong>⚠️ Error:</strong> ${error.message}
                <br><br>
                <small>Make sure the backend is running at https://udemy-extension.onrender.com</small>
            </div>
        `;
        resultDiv.style.display = 'block';
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function getTranscript() {
    console.log('[Udemy AI] Getting transcript...');

    // Since both scripts run in the same content script context,
    // we can call the function directly from caption-extractor.js
    if (typeof extractTranscriptFromUdemy === 'function') {
        return extractTranscriptFromUdemy();
    } else {
        console.error('[Udemy AI] extractTranscriptFromUdemy function not found!');
        // Return sample transcript as fallback
        const SAMPLE_TRANSCRIPT = `Welcome to this lecture on Python functions and data structures.

In this session, we'll cover the fundamentals of Python programming, specifically focusing on functions and how to work with different data structures.

Let's start with a simple function definition. In Python, we use the def keyword to define a function.

Here's an example:

def greet(name):
    return f"Hello, {name}!"

This function takes a name parameter and returns a greeting string.

Now let's look at lists. Lists are one of the most versatile data structures in Python.

numbers = [1, 2, 3, 4, 5]
fruits = ["apple", "banana", "cherry"]

You can access list elements using indexing:

first_fruit = fruits[0]  # "apple"

And you can use list comprehensions for elegant data transformations:

squared_numbers = [x**2 for x in numbers]

That covers the basics of functions and lists in Python. In the next lecture, we'll explore dictionaries and sets.`;

        return Promise.resolve(SAMPLE_TRANSCRIPT);
    }
}

// Format markdown-style summary into beautiful HTML
function formatMarkdownSummary(text) {
    // Safety check for undefined/null text
    if (!text || typeof text !== 'string') {
        return '<p style="color: #d32f2f; font-weight: 600;">⚠️ Error: Summary is empty or invalid</p>';
    }

    let html = text;

    // Convert # heading to h1 with styling
    html = html.replace(/^# (.+)$/gm, '<h1 style="font-size: 2.25rem; font-weight: 700; color: #1c1d1f; margin: 1.5rem 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 3px solid #a435f0;">$1</h1>');

    // Convert ## heading to h2 with styling
    html = html.replace(/^## (.+)$/gm, '<h2 style="font-size: 1.5rem; font-weight: 700; color: #2d2f31; margin: 1.5rem 0 1rem 0; padding-left: 0.75rem; border-left: 4px solid #ff9800;">$1</h2>');

    // Convert ### heading to h3 with styling  
    html = html.replace(/^### (.+)$/gm, '<h3 style="font-size: 1.25rem; font-weight: 600; color: #3e4143; margin: 1.25rem 0 0.75rem 0;">$1</h3>');

    // Convert **bold** to strong
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 700; color: #1c1d1f;">$1</strong>');

    // Convert *italic* to em
    html = html.replace(/\*(.+?)\*/g, '<em style="font-style: italic; color: #5624d0;">$1</em>');

    // Convert bullet points (*, -, •) to styled list items
    html = html.replace(/^[\*\-•] (.+)$/gm, '<li style="margin: 0.5rem 0; color: #2d2f31; line-height: 1.6;">$1</li>');

    // Wrap consecutive list items in ul
    html = html.replace(/(<li[^>]*>.*<\/li>\s*)+/gs, (match) => {
        return '<ul style="margin: 1rem 0; padding-left: 2rem; list-style-type: disc;">' + match + '</ul>';
    });

    // Convert --- to horizontal rule
    html = html.replace(/^---$/gm, '<hr style="border: none; border-top: 2px solid #e0e0e0; margin: 2rem 0;">');

    // Convert line breaks to paragraphs
    html = html.split('\n\n').map(para => {
        if (para.trim() && !para.startsWith('<h') && !para.startsWith('<ul') && !para.startsWith('<hr') && !para.startsWith('<li')) {
            return `<p style="margin: 1rem 0; line-height: 1.8; color: #2d2f31; font-size: 16px;">${para}</p>`;
        }
        return para;
    }).join('\n');

    return html;
}

function renderResult(data, fromCache = false) {
    const resultDiv = document.getElementById('ai-result');

    const cacheIndicator = fromCache ? `
        <div style="background: #e8f5e9; border: 1px solid #4caf50; padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.2rem;">⚡</span>
            <span style="color: #2e7d32; font-weight: 600;">Loaded from cache (instant!)</span>
        </div>
    ` : '';

    // Parse and format the summary with markdown-style formatting
    const formattedSummary = formatMarkdownSummary(data.summary);

    resultDiv.innerHTML = `
        ${cacheIndicator}
        
        <div style="background: #ffffff; padding: 2.5rem; border-radius: 8px; margin-bottom: 2rem; font-size: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
            ${formattedSummary}
        </div>
        
        <div style="background: #f7f9fa; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; font-size: 16px;">
            <h3 style="margin-top: 0; color: #1c1d1f; font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem;">💻 Code Snippets</h3>
            ${data.code_blocks.length > 0 ? data.code_blocks.map(code => `
                <pre style="
                    background: #1e1e1e;
                    color: #d4d4d4;
                    padding: 1.25rem;
                    border-radius: 6px;
                    overflow-x: auto;
                    margin: 1rem 0;
                    font-size: 15px;
                    line-height: 1.6;
                "><code>${escapeHtml(code)}</code></pre>
            `).join('') : '<p style="color: #6a6f73; font-style: italic; font-size: 16px;">No code snippets found in this lecture.</p>'}
        </div>
        
        <div style="background: #f7f9fa; padding: 2rem; border-radius: 8px; font-size: 16px;">
            <h3 style="margin-top: 0; color: #1c1d1f; font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem;">🎯 Key Concepts</h3>
            <ul style="margin: 0; padding-left: 2rem; line-height: 1.8;">
                ${data.key_concepts.map(concept => `<li style="margin: 0.75rem 0; color: #2d2f31; font-size: 16px;">${concept}</li>`).join('')}
            </ul>
        
        
        <!-- Action Buttons -->
        <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button id="regenerate-btn" style="
                background: #ff9800;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            " onmouseover="this.style.background='#f57c00'" onmouseout="this.style.background='#ff9800'">
                🔄 Re-generate
            </button>
            <button id="export-markdown-btn" style="
                background: #5624d0;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            " onmouseover="this.style.background='#3b1a8c'" onmouseout="this.style.background='#5624d0'">
                📄 Export as Markdown
            </button>
            <button id="export-pdf-btn" style="
                background: #a435f0;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            " onmouseover="this.style.background='#8710d8'" onmouseout="this.style.background='#a435f0'">
                📑 Export as PDF
            </button>
        </div>
    </div>
    `;

    resultDiv.style.display = 'block';

    // Store data globally for export functions
    window.currentSummaryData = data;

    // Bind export button events
    setTimeout(() => {
        const regenerateBtn = document.getElementById('regenerate-btn');
        const markdownBtn = document.getElementById('export-markdown-btn');
        const pdfBtn = document.getElementById('export-pdf-btn');

        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                console.log('[Udemy AI] Re-generating summary (bypassing cache)...');
                triggerGeneration(true); // true = force refresh
            });
        }
        if (markdownBtn) {
            markdownBtn.addEventListener('click', () => exportAsMarkdown(window.currentSummaryData));
        }
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => exportAsPDF(window.currentSummaryData));
        }
    }, 100);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export Functions
function exportAsMarkdown(data) {
    const markdown = `# Udemy AI Smart Overview

## 📝 Summary

${data.summary}

## 💻 Code Snippets

${data.code_blocks.length > 0 ? data.code_blocks.map((code, index) => `
### Code Snippet ${index + 1}

\`\`\`
${code}
\`\`\`
`).join('\n') : 'No code snippets found in this lecture.'}

## 🎯 Key Concepts

${data.key_concepts.map(concept => `- ${concept}`).join('\n')}

---
*Generated by Udemy AI Smart Overview Extension*
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `udemy-summary-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('[Udemy AI] Exported as Markdown');
}

async function exportAsPDF(data) {
    if (typeof jspdf === 'undefined') {
        console.log('[Udemy AI] Loading jsPDF...');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Udemy AI Smart Overview', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(16);
    doc.text('Summary', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const summaryLines = doc.splitTextToSize(data.summary, maxWidth);
    doc.text(summaryLines, margin, yPosition);
    yPosition += (summaryLines.length * 7) + 10;

    if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Code Snippets', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('courier', 'normal');

    if (data.code_blocks.length > 0) {
        data.code_blocks.forEach((code, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFont(undefined, 'bold');
            doc.text(`Code Snippet ${index + 1}: `, margin, yPosition);
            yPosition += 7;

            doc.setFont('courier', 'normal');
            const codeLines = doc.splitTextToSize(code, maxWidth);
            doc.text(codeLines, margin, yPosition);
            yPosition += (codeLines.length * 5) + 10;
        });
    }

    if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Key Concepts', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    data.key_concepts.forEach(concept => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }

        const conceptLines = doc.splitTextToSize(`• ${concept} `, maxWidth - 5);
        doc.text(conceptLines, margin + 5, yPosition);
        yPosition += (conceptLines.length * 7) + 3;
    });

    doc.save(`udemy-summary-${Date.now()}.pdf`);
    console.log('[Udemy AI] Exported as PDF');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
