console.log('[Udemy AI] Inject script loaded');

// Wait for page to be ready
function init() {
    console.log('[Udemy AI] Initializing...');

    // Try to find the tab container
    // Udemy uses different selectors, so we try multiple approaches
    const tryInject = () => {
        if (document.querySelector('.ai-overview-tab')) {
            console.log('[Udemy AI] Already injected');
            return true;
        }

        // Look for the tab navigation bar (Overview, Q&A, Notes, etc.)
        const tabSelectors = [
            'nav[role="tablist"]',
            'div[role="tablist"]',
            '.ud-component--course-taking--curriculum-item-view--tabs',
            'button[data-purpose="overview-tab"]'
        ];

        let tabContainer = null;
        for (const selector of tabSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                // If we found a button, get its parent container
                if (element.tagName === 'BUTTON') {
                    tabContainer = element.parentElement;
                } else {
                    tabContainer = element;
                }
                console.log('[Udemy AI] Found tab container:', selector);
                break;
            }
        }

        if (tabContainer) {
            injectTab(tabContainer);
            return true;
        }

        return false;
    };

    // Try immediately
    if (tryInject()) return;

    // If not found, observe for changes
    const observer = new MutationObserver(() => {
        if (tryInject()) {
            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Also try after a delay
    setTimeout(tryInject, 2000);
}

function injectTab(tabContainer) {
    console.log('[Udemy AI] Injecting AI Overview tab...');

    // Create the tab button
    const aiTab = document.createElement('button');
    aiTab.className = 'ai-overview-tab ud-btn ud-btn-large ud-btn-ghost ud-heading-sm';
    aiTab.setAttribute('role', 'tab');
    aiTab.setAttribute('aria-selected', 'false');
    aiTab.innerHTML = '<span>✨ AI Overview</span>';

    // Style to match Udemy tabs
    aiTab.style.cssText = `
        padding: 0 1rem;
        margin: 0 0.5rem;
        cursor: pointer;
        border: none;
        background: transparent;
        color: inherit;
        font-weight: 400;
    `;

    // Add click handler
    aiTab.addEventListener('click', () => showAIPanel());

    // Append to tab container
    tabContainer.appendChild(aiTab);

    // Create the AI panel
    createAIPanel();

    console.log('[Udemy AI] Tab injected successfully!');
}

function createAIPanel() {
    // Find the content area where tab content is displayed
    const contentArea = document.querySelector('.ud-component--course-taking--curriculum-item-view--content')
        || document.querySelector('[data-purpose="curriculum-item-view-content"]')
        || document.body;

    const aiPanel = document.createElement('div');
    aiPanel.id = 'ai-overview-panel';
    aiPanel.style.cssText = `
        display: none;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        margin: 1rem 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
                    Powered by Groq AI (llama-3.3-70b)
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

    // Insert into page
    if (contentArea.firstChild) {
        contentArea.insertBefore(aiPanel, contentArea.firstChild);
    } else {
        contentArea.appendChild(aiPanel);
    }

    // Bind generate button
    document.getElementById('ai-generate-btn').addEventListener('click', triggerGeneration);
}

function showAIPanel() {
    // Hide all other tab content
    const contentDivs = document.querySelectorAll('[data-purpose="curriculum-item-view-content"] > div');
    contentDivs.forEach(div => {
        if (div.id !== 'ai-overview-panel') {
            div.style.display = 'none';
        }
    });

    // Show AI panel
    const aiPanel = document.getElementById('ai-overview-panel');
    if (aiPanel) {
        aiPanel.style.display = 'block';
    }

    // Update tab states
    const allTabs = document.querySelectorAll('[role="tab"]');
    allTabs.forEach(tab => {
        tab.setAttribute('aria-selected', 'false');
        tab.style.borderBottom = 'none';
    });

    const aiTab = document.querySelector('.ai-overview-tab');
    if (aiTab) {
        aiTab.setAttribute('aria-selected', 'true');
        aiTab.style.borderBottom = '2px solid #a435f0';
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

        // Get backend URL from settings
        const settings = await chrome.storage.local.get(['backendUrl']);
        const backendUrl = settings.backendUrl || 'https://udemy-extension.onrender.com';

        console.log('[Udemy AI] Calling backend:', backendUrl);

        const response = await fetch(`${backendUrl}/api/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transcript: transcript,
                lecture_title: document.title,
                force_refresh: forceRefresh
            })
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

function renderResult(data, fromCache = false) {
    const resultDiv = document.getElementById('ai-result');

    const cacheIndicator = fromCache ? `
        <div style="background: #e8f5e9; border: 1px solid #4caf50; padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.2rem;">⚡</span>
            <span style="color: #2e7d32; font-weight: 600;">Loaded from cache (instant!)</span>
        </div>
    ` : '';

    resultDiv.innerHTML = `
        ${cacheIndicator}
        
        <div style="background: #f7f9fa; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; font-size: 16px;">
            <h3 style="margin-top: 0; color: #1c1d1f; font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem;">📝 Summary</h3>
            <div style="line-height: 1.8; color: #2d2f31; white-space: pre-wrap; font-size: 16px;">${data.summary}</div>
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
