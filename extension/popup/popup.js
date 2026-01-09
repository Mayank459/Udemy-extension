document.addEventListener('DOMContentLoaded', () => {
    const backendUrlInput = document.getElementById('backendUrl');
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    // Load saved settings
    chrome.storage.local.get(['backendUrl'], (result) => {
        if (result.backendUrl) {
            backendUrlInput.value = result.backendUrl;
        }
    });

    // Save settings
    saveBtn.addEventListener('click', () => {
        const backendUrl = backendUrlInput.value.replace(/\/$/, ''); // Remove trailing slash

        if (!backendUrl) {
            showStatus('Please enter a valid URL', 'error');
            return;
        }

        chrome.storage.local.set({ backendUrl }, () => {
            showStatus('Settings saved!', 'success');
            // Notify content script/background script if necessary
        });
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'status';
        }, 2000);
    }
});
