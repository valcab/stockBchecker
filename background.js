// Background service worker for Stock B Checker extension

chrome.runtime.onInstalled.addListener(() => {
    // Initialize storage
    chrome.storage.local.get(['items', 'results'], (result) => {
        if (!result.items) {
            chrome.storage.local.set({ items: [] });
        }
        if (!result.results) {
            chrome.storage.local.set({ results: {} });
        }
    });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CHECK_STOCK') {
        // Handle stock check requests
        handleStockCheck(request.articleId, request.url)
            .then(status => sendResponse({ status, success: true }))
            .catch(error => sendResponse({ error: error.message, success: false }));
        return true; // Will respond asynchronously
    }
});

async function handleStockCheck(articleId, url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        return checkStockBInHtml(html);
    } catch (error) {
        throw new Error(`Failed to fetch article: ${error.message}`);
    }
}

function checkStockBInHtml(html) {
    const stockBPatterns = [
        /Stock\s*B/i,
        /Lagerbestand\s*B/i,
        /Verfügbar.*B/i,
        /stock-b/i,
        /available.*stock-b/i
    ];
    
    return stockBPatterns.some(pattern => pattern.test(html));
}
