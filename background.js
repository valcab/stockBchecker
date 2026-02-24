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
                const price = extractPrice(html);
                const name = extractName(html);
                const previousPrice = previousResults[item.id]?.price;
                
                results[item.id] = {
                    status: isAvailable ? 'available' : 'unavailable',
                    message: isAvailable ? 'Stock B is available' : 'Stock B is not available',
                    timestamp: new Date().toISOString(),
                    price: price || previousPrice,
                    priceChanged: price && previousPrice && price !== previousPrice,
                    name: name || item.name
                };
                
                // Send notification if B-Stock became available
                if (notificationsEnabled && isAvailable && previousResults[item.id]?.status !== 'available') {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon-128.png',
                        title: 'B-Stock Available!',
                        message: `B-Stock is now available for ${name || `article #${item.id}`}`,
                        priority: 2
                    });
                }
            } catch (error) {
                results[item.id] = {
                    status: 'error',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    price: previousResults[item.id]?.price,
                    name: item.name
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

function extractName(html) {
    // Extract product name from h1 tag
    const match = html.match(/<h1[^>]*>\s*([^<]+?)\s*<\/h1>/i);
    if (match) {
        return match[1].trim();
    }
    return null;
}

function extractPrice(html) {
    // Look for main product price on Thomann pages.
    // Prefer prices with thousands/large values to avoid small numbers like fees.
    let match = html.match(/\b([1-9][0-9]{2,5}[,.][0-9]{2})\s*€\b/i);
    if (match) return match[1].replace(',', '.');

    // Common Thomann price containers.
    match = html.match(/class=["'][^"']*price[^"']*["'][^>]*>\s*([1-9][0-9]{2,5}[,.][0-9]{2})/i);
    if (match) return match[1].replace(',', '.');

    // Price near "TTC" (FR) or "inkl." (DE) markers.
    match = html.match(/([1-9][0-9]{2,5}[,.][0-9]{2})\s*(?:€)?\s*(?:TTC|inkl\.)/i);
    if (match) return match[1].replace(',', '.');

    return null;
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
