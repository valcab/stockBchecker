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
    // Check if there's a div with class "discounts-and-addons" containing a link with "b_stock" in the URL
    const hasBStock = /<div[^>]*class="[^"]*discounts-and-addons[^"]*"[^>]*>.*?href="[^"]*b_stock[^"]*\.htm/is.test(html);
    
    return hasBStock;
}
