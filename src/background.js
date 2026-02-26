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

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(['autoCheckEnabled', 'checkInterval'], (result) => {
        if (result.autoCheckEnabled) {
            setupAutoCheck(result.checkInterval || 30);
        }
    });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'STOCKB_NOTIFY_AVAILABLE') {
        sendBStockNotification(request.displayName)
            .then(result => sendResponse({ success: true, ...result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.type === 'STOCKB_IS_TRACKED') {
        isItemTracked(request.url)
            .then(result => sendResponse({ success: true, ...result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.type === 'STOCKB_ADD_ITEM') {
        handleQuickAddItem(request.url)
            .then(result => sendResponse({ success: true, ...result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.type === 'STOCKB_REMOVE_ITEM') {
        handleQuickRemoveItem(request.url)
            .then(result => sendResponse({ success: true, ...result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

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

function extractArticleIdFromUrl(input) {
    const normalized = input.trim();

    let match = normalized.match(/[/_]product[_-]?(\d+)/i);
    if (match) return match[1];

    match = normalized.match(/\/(\d+)\.html?/i);
    if (match) return match[1];

    match = normalized.match(/\/p(\d+)\//i);
    if (match) return match[1];

    match = normalized.match(/(\d{5,})/);
    if (match) return match[1];

    return normalized;
}

async function handleQuickAddItem(url) {
    if (!url || typeof url !== 'string') {
        throw new Error('Missing item URL');
    }

    const itemId = extractArticleIdFromUrl(url);
    const data = await chrome.storage.local.get(['items']);
    const items = data.items || [];

    const alreadyTracked = items.some(item => item.id === itemId || item.url === url);
    if (alreadyTracked) {
        return { added: false, reason: 'already-tracked' };
    }

    const newItem = {
        id: itemId,
        url,
        name: null,
        addedAt: new Date().toISOString(),
    };

    await chrome.storage.local.set({ items: [...items, newItem] });

    return { added: true, item: newItem };
}

async function isItemTracked(url) {
    if (!url || typeof url !== 'string') {
        throw new Error('Missing item URL');
    }

    const itemId = extractArticleIdFromUrl(url);
    const data = await chrome.storage.local.get(['items']);
    const items = data.items || [];

    const trackedItem = items.find(item => item.id === itemId || item.url === url);
    return {
        tracked: !!trackedItem,
        item: trackedItem || null,
    };
}

async function handleQuickRemoveItem(url) {
    if (!url || typeof url !== 'string') {
        throw new Error('Missing item URL');
    }

    const itemId = extractArticleIdFromUrl(url);
    const data = await chrome.storage.local.get(['items', 'results']);
    const items = data.items || [];
    const results = data.results || {};

    const removedItems = items.filter(item => item.id === itemId || item.url === url);
    if (removedItems.length === 0) {
        return { removed: false, reason: 'not-tracked' };
    }

    const updatedItems = items.filter(item => item.id !== itemId && item.url !== url);
    const updatedResults = { ...results };
    for (const removedItem of removedItems) {
        delete updatedResults[removedItem.id];
        delete updatedResults[removedItem.url];
    }

    await chrome.storage.local.set({
        items: updatedItems,
        results: updatedResults,
    });

    return {
        removed: true,
        removedIds: removedItems.map(item => item.id),
    };
}

async function sendBStockNotification(displayName) {
    const data = await chrome.storage.local.get(['notificationsEnabled']);
    if (data.notificationsEnabled === false) {
        return { sent: false, reason: 'disabled' };
    }

    await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: 'B-Stock Available!',
        message: `B-Stock is available for ${displayName || 'a tracked item'}`,
        priority: 2,
    });

    return { sent: true };
}

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    console.log('Alarm triggered:', alarm.name);
    if (alarm.name === 'autoCheckAlarm') {
        console.log('Running auto-check...');
        performAutoCheck();
    }
});

function setupAutoCheck(intervalMinutes) {
    console.log('Setting up auto-check with interval:', intervalMinutes, 'minutes');
    // Clear existing alarm
    chrome.alarms.clear('autoCheckAlarm', () => {
        // Create new alarm that runs immediately and then periodically
        chrome.alarms.create('autoCheckAlarm', {
            delayInMinutes: 0.1, // Run almost immediately (6 seconds)
            periodInMinutes: intervalMinutes
        });
        console.log('Auto-check alarm created');
    });
}

async function performAutoCheck() {
    console.log('performAutoCheck started');
    try {
        // Get all items and settings
        const data = await chrome.storage.local.get(['items', 'results', 'notificationsEnabled', 'lastResults']);
        const items = data.items || [];
        const previousResults = data.lastResults || {};
        const currentResults = data.results || {};
        const notificationsEnabled = data.notificationsEnabled !== false;
        const results = {};
        
        console.log('Checking', items.length, 'items. Notifications enabled:', notificationsEnabled);
        
        // Check each item
        for (const item of items) {
            try {
                console.log('Fetching:', item.url);
                const response = await fetch(item.url);
                const html = await response.text();
                const isAvailable = checkStockBInHtml(html);
                const price = extractPrice(html);
                const name = extractName(html);
                const previousPrice = previousResults[item.id]?.price;
                const previousBStockPrice = previousResults[item.id]?.bStockPrice;
                const previousImageUrl = currentResults[item.id]?.imageUrl || previousResults[item.id]?.imageUrl;
                let bStockPrice = null;
                let bStockUrl = null;

                console.log(`Item ${item.id}: B-Stock available:`, isAvailable);

                if (isAvailable) {
                    bStockUrl = extractBStockUrl(html, item.url);
                    if (bStockUrl) {
                        const bStockResponse = await fetch(bStockUrl);
                        const bStockHtml = await bStockResponse.text();
                        bStockPrice = extractPrice(bStockHtml);
                    }
                }
                
                results[item.id] = {
                    status: isAvailable ? 'available' : 'unavailable',
                    message: isAvailable ? 'Stock B is available' : 'Stock B is not available',
                    timestamp: new Date().toISOString(),
                    price: price || previousPrice,
                    priceChanged: price && previousPrice && price !== previousPrice,
                    bStockPrice: bStockPrice || previousBStockPrice,
                    bStockPriceChanged: bStockPrice && previousBStockPrice && bStockPrice !== previousBStockPrice,
                    bStockUrl: bStockUrl || previousResults[item.id]?.bStockUrl,
                    name: name || item.name,
                    imageUrl: previousImageUrl
                };
                
                // Send a notification for every auto-check where B-Stock is available.
                if (notificationsEnabled && isAvailable) {
                    console.log('Sending notification for', name || item.id);
                    await sendBStockNotification(name || `article #${item.id}`);
                }
            } catch (error) {
                console.error('Error checking item:', error);
                results[item.id] = {
                    status: 'error',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                    price: previousResults[item.id]?.price,
                    bStockPrice: previousResults[item.id]?.bStockPrice,
                    bStockUrl: previousResults[item.id]?.bStockUrl,
                    name: item.name,
                    imageUrl: currentResults[item.id]?.imageUrl || previousResults[item.id]?.imageUrl
                };
            }
        }
        
        // Save results
        chrome.storage.local.set({ 
            results,
            lastResults: results
        });
        
        // Update badge if any B-Stock is available
        updateBadge(results);
        
    } catch (error) {
        console.error('Auto-check error:', error);
    }
}

function updateBadge(results) {
    // Count how many items have available B-Stock
    const availableCount = Object.values(results).filter(r => r.status === 'available').length;
    
    if (availableCount > 0) {
        chrome.action.setBadgeText({ text: availableCount.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#28a745' });
    } else {
        chrome.action.setBadgeText({ text: '' });
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
    // Look for structured price metadata first.
    let match = html.match(/itemprop=["']price["'][^>]*content=["']([0-9]+(?:[.,][0-9]{2})?)["']/i);
    if (match) return match[1].replace(',', '.');

    match = html.match(/"price"\s*:\s*"([0-9]+(?:[.,][0-9]{2})?)"/i);
    if (match) return match[1].replace(',', '.');

    match = html.match(/data-price["']?[=:]?["']?([0-9]+(?:[.,][0-9]{2})?)/i);
    if (match) return match[1].replace(',', '.');

    // Price with Euro symbol (allow 2+ digits to support 69, 119, 569, etc).
    match = html.match(/\b([1-9][0-9]{1,5}[,.][0-9]{2})\s*€\b/i);
    if (match) return match[1].replace(',', '.');

    // Common price containers.
    match = html.match(/class=["'][^"']*price[^"']*["'][^>]*>\s*([1-9][0-9]{1,5}[,.][0-9]{2})/i);
    if (match) return match[1].replace(',', '.');

    // Price near "TTC" (FR) or "inkl." (DE) markers.
    match = html.match(/([1-9][0-9]{1,5}[,.][0-9]{2})\s*(?:€)?\s*(?:TTC|inkl\.)/i);
    if (match) return match[1].replace(',', '.');

    return null;
}

function extractBStockUrl(html, baseUrl) {
    const match = html.match(/<div[^>]*class="[^"]*discounts-and-addons[^"]*"[^>]*>.*?href="([^"]*b_stock[^"]*\.htm)"/is);
    if (!match) return null;
    try {
        return new URL(match[1], baseUrl).toString();
    } catch (error) {
        return null;
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
