// Background service worker for Stock B Checker extension

chrome.runtime.onInstalled.addListener(() => {
    // Initialize storage
    chrome.storage.local.get(['items', 'results', 'autoCheckEnabled', 'checkInterval'], (result) => {
        if (!result.items) {
            chrome.storage.local.set({ items: [] });
        }
        if (!result.results) {
            chrome.storage.local.set({ results: {} });
        }
        // Set up alarm if auto-check is enabled
        if (result.autoCheckEnabled) {
            setupAutoCheck(result.checkInterval || 30);
        }
    });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CHECK_STOCK') {
        // Handle stock check requests
        handleStockCheck(request.articleId, request.url)
            .then(status => sendResponse({ status, success: true }))
            .catch(error => sendResponse({ error: error.message, success: false }));
        return true; // Will respond asynchronously
    }
    
    if (request.type === 'UPDATE_AUTO_CHECK') {
        // Handle auto-check settings update
        if (request.enabled) {
            setupAutoCheck(request.interval);
        } else {
            chrome.alarms.clear('autoCheckAlarm');
        }
        sendResponse({ success: true });
        return true;
    }
});

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'autoCheckAlarm') {
        performAutoCheck();
    }
});

function setupAutoCheck(intervalMinutes) {
    // Clear existing alarm
    chrome.alarms.clear('autoCheckAlarm', () => {
        // Create new alarm
        chrome.alarms.create('autoCheckAlarm', {
            periodInMinutes: intervalMinutes
        });
    });
}

async function performAutoCheck() {
    try {
        // Get all items and settings
        const data = await chrome.storage.local.get(['items', 'results', 'notificationsEnabled', 'lastResults']);
        const items = data.items || [];
        const previousResults = data.lastResults || {};
        const notificationsEnabled = data.notificationsEnabled !== false;
        const results = {};
        
        // Check each item
        for (const item of items) {
            try {
                const response = await fetch(item.url);
                const html = await response.text();
                const isAvailable = checkStockBInHtml(html);
                
                results[item.id] = {
                    status: isAvailable ? 'available' : 'unavailable',
                    message: isAvailable ? 'Stock B is available' : 'Stock B is not available',
                    timestamp: new Date().toISOString()
                };
                
                // Send notification if B-Stock became available
                if (notificationsEnabled && isAvailable && previousResults[item.id]?.status !== 'available') {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon-128.png',
                        title: 'B-Stock Available!',
                        message: `B-Stock is now available for article #${item.id}`,
                        priority: 2
                    });
                }
            } catch (error) {
                results[item.id] = {
                    status: 'error',
                    message: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
        
        // Save results
        chrome.storage.local.set({ 
            results,
            lastResults: results
        });
        
    } catch (error) {
        console.error('Auto-check error:', error);
    }
}

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
