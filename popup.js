// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    loadResults();
    loadAutoCheckSettings();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('addButton').addEventListener('click', addItem);
    document.getElementById('checkAllButton').addEventListener('click', checkAllItems);
    document.getElementById('clearAllButton').addEventListener('click', clearAllItems);
    
    document.getElementById('articleInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addItem();
        }
    });
    
    // Auto-check settings
    document.getElementById('autoCheckEnabled').addEventListener('change', updateAutoCheckSettings);
    document.getElementById('checkInterval').addEventListener('change', updateAutoCheckSettings);
    document.getElementById('notificationsEnabled').addEventListener('change', updateAutoCheckSettings);
}

function loadAutoCheckSettings() {
    chrome.storage.local.get(['autoCheckEnabled', 'checkInterval', 'notificationsEnabled'], (result) => {
        document.getElementById('autoCheckEnabled').checked = result.autoCheckEnabled || false;
        document.getElementById('checkInterval').value = result.checkInterval || '30';
        document.getElementById('notificationsEnabled').checked = result.notificationsEnabled !== false;
    });
}

function updateAutoCheckSettings() {
    const autoCheckEnabled = document.getElementById('autoCheckEnabled').checked;
    const checkInterval = parseInt(document.getElementById('checkInterval').value);
    const notificationsEnabled = document.getElementById('notificationsEnabled').checked;
    
    chrome.storage.local.set({
        autoCheckEnabled,
        checkInterval,
        notificationsEnabled
    }, () => {
        // Send message to background script to update alarm
        chrome.runtime.sendMessage({
            type: 'UPDATE_AUTO_CHECK',
            enabled: autoCheckEnabled,
            interval: checkInterval
        });
    });
}

function extractArticleId(input) {
    input = input.trim();
    
    // Check if it's a URL
    if (input.match(/^https?:\/\//i) || input.includes('thomann')) {
        // Normalize the URL
        if (!input.match(/^https?:\/\//i)) {
            input = 'https://' + input;
        }
        
        // Try to extract numeric article ID from various Thomann URL formats
        let match = input.match(/[/_]product[_-]?(\d+)/i);
        if (match) return match[1];
        
        match = input.match(/\/(\d+)\.html?/i);
        if (match) return match[1];
        
        match = input.match(/\/p(\d+)\//i);
        if (match) return match[1];
        
        match = input.match(/(\d{5,})/);
        if (match) return match[1];
        
        // If no numeric ID found, use the full URL as identifier
        return input;
    }
    
    // Assume it's an article ID (just digits)
    if (/^\d+$/.test(input)) {
        return input;
    }
    
    return null;
}

function addItem() {
    const input = document.getElementById('articleInput').value.trim();
    
    if (!input) {
        alert('Please enter a URL or article ID');
        return;
    }
    
    const articleId = extractArticleId(input);
    if (!articleId) {
        alert('Invalid URL or article ID. Please enter a valid Thomann article ID or URL.');
        return;
    }
    
    // Determine if it's a URL or numeric ID
    const isUrl = articleId.match(/^https?:\/\//i);
    const url = isUrl ? articleId : `https://www.thomann.de/${articleId}.html`;
    
    chrome.storage.local.get('items', (result) => {
        const items = result.items || [];
        
        // Check if item already exists (by URL or ID)
        if (items.some(item => item.id === articleId || item.url === url)) {
            alert('This item is already tracked');
            return;
        }
        
        // Add new item
        items.push({
            id: articleId,
            url: url,
            name: null,  // Will be populated on first check
            addedAt: new Date().toISOString()
        });
        
        chrome.storage.local.set({ items }, () => {
            document.getElementById('articleInput').value = '';
            loadItems();
        });
    });
}

function loadItems() {
    chrome.storage.local.get('items', (result) => {
        const items = result.items || [];
        const itemsList = document.getElementById('itemsList');
        
        if (items.length === 0) {
            itemsList.innerHTML = '<p class="empty-state">No items tracked yet</p>';
            return;
        }
        
        itemsList.innerHTML = items.map((item, index) => `
            <div class="item-row">
                <div class="item-info">
                    <div class="item-id">${item.name || `Article #${item.id}`}</div>
                    <div class="item-url">${item.url}</div>
                </div>
                <button class="remove-button" data-index="${index}">Remove</button>
            </div>
        `).join('');
        
        // Attach event listeners to all remove buttons
        document.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                removeItem(index);
            });
        });
    });
}

function removeItem(index) {
    chrome.storage.local.get('items', (result) => {
        const items = result.items || [];
        items.splice(index, 1);
        chrome.storage.local.set({ items }, () => {
            loadItems();
        });
    });
}

function clearAllItems() {
    if (!confirm('Are you sure you want to clear all items?')) {
        return;
    }
    
    chrome.storage.local.set({ items: [], results: {} }, () => {
        loadItems();
        loadResults();
    });
}

function checkAllItems() {
    chrome.storage.local.get('items', (result) => {
        const items = result.items || [];
        
        if (items.length === 0) {
            alert('No items to check');
            return;
        }
        
        const checkButton = document.getElementById('checkAllButton');
        checkButton.disabled = true;
        checkButton.textContent = 'Checking...';
        
        // Initialize results with checking status
        const results = {};
        items.forEach(item => {
            results[item.id] = {
                status: 'checking',
                timestamp: new Date().toISOString()
            };
        });
        
        chrome.storage.local.set({ results }, () => {
            loadResults();
        });
        
        // Check each item
        items.forEach((item, index) => {
            setTimeout(() => {
                checkStockB(item.id, item.url, index);
            }, index * 500); // Stagger requests to avoid rate limiting
        });
        
        // Reset button after a reasonable time
        setTimeout(() => {
            checkButton.disabled = false;
            checkButton.textContent = 'Check All Items';
        }, items.length * 500 + 3000);
    });
}

function checkStockB(articleId, url, itemIndex) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const isAvailable = checkStockBInHtml(html);
            const price = extractPrice(html);
            const name = extractName(html);
            updateResult(articleId, isAvailable, null, price);
            
            // Update item with the product name
            if (name && itemIndex !== undefined) {
                updateItemName(itemIndex, name);
            }
        })
        .catch(error => {
            updateResult(articleId, null, error.message, null);
        });
}

function extractName(html) {
    // Extract product name from h1 tag
    const match = html.match(/<h1[^>]*>\s*([^<]+?)\s*<\/h1>/i);
    if (match) {
        return match[1].trim();
    }
    return null;
}

function updateItemName(itemIndex, name) {
    chrome.storage.local.get('items', (result) => {
        const items = result.items || [];
        if (items[itemIndex]) {
            items[itemIndex].name = name;
            chrome.storage.local.set({ items }, () => {
                loadItems();
            });
        }
    });
}

function extractPrice(html) {
    // Look for price patterns on Thomann pages
    // Pattern 1: Price closest to "€" symbol or currency
    // Match 1-6 digits, optional decimal separator, then 2 digits, followed by Euro symbol
    let match = html.match(/([0-9]{1,6}[,.][0-9]{2})\s*€/i);
    if (match) return match[1].replace(',', '.');
    
    // Pattern 2: Look for price in common contexts like sale price or regular price
    // Find prices in readable format like "123.45" or "123,45"
    match = html.match(/(?:price|€|eur)[\s:]*([0-9]{1,6}[,.][0-9]{2})/i);
    if (match) return match[1].replace(',', '.');
    
    // Pattern 3: Look for data attributes with prices
    match = html.match(/data-price["']?[=:]?["']?([0-9]{1,6}[,.][0-9]{2})/i);
    if (match) return match[1].replace(',', '.');
    
    // Pattern 4: Price in context of main product price (larger prices)
    // Look for bigger numbers with currency - prioritize numbers over 10€
    match = html.match(/(?:EUR|\€|€)\s*([0-9]{2,6}[,.][0-9]{2})/i);
    if (match) {
        const price = match[1].replace(',', '.');
        if (parseFloat(price) > 10) return price;  // Only return if significant price
    }
    
    return null;
}

function checkStockBInHtml(html) {
    // Check if there's a div with class "discounts-and-addons" containing a link with "b_stock" in the URL
    const hasBStock = /<div[^>]*class="[^"]*discounts-and-addons[^"]*"[^>]*>.*?href="[^"]*b_stock[^"]*\.htm/is.test(html);
    
    return hasBStock;
}

function updateResult(articleId, isAvailable, error, price) {
    chrome.storage.local.get('results', (result) => {
        const results = result.results || {};
        const previousPrice = results[articleId]?.price;
        
        if (error) {
            results[articleId] = {
                status: 'error',
                message: error,
                timestamp: new Date().toISOString(),
                price: price || previousPrice
            };
        } else {
            results[articleId] = {
                status: isAvailable ? 'available' : 'unavailable',
                message: isAvailable ? 'Stock B is available' : 'Stock B is not available',
                timestamp: new Date().toISOString(),
                price: price || previousPrice,
                priceChanged: price && previousPrice && price !== previousPrice
            };
        }
        
        chrome.storage.local.set({ results }, () => {
            loadResults();
        });
    });
}

function loadResults() {
    chrome.storage.local.get(['results', 'items'], (result) => {
        const results = result.results || {};
        const items = result.items || [];
        const resultsList = document.getElementById('resultsList');
        
        const resultEntries = Object.entries(results);
        
        if (resultEntries.length === 0) {
            resultsList.innerHTML = '<p class="empty-state">Check items to see results</p>';
            return;
        }
        
        resultsList.innerHTML = resultEntries.map(([articleId, data]) => {
            const date = new Date(data.timestamp).toLocaleTimeString();
            // Find the URL and name for this article ID
            const item = items.find(i => i.id === articleId);
            const url = item ? item.url : '#';
            const displayName = item?.name || `Article #${articleId}`;
            const priceDisplay = data.price ? `<div class="result-price ${data.priceChanged ? 'price-changed' : ''}">Price: ${data.price}€</div>` : '';
            
            return `
                <a href="${url}" target="_blank" class="result-row-link">
                    <div class="result-row ${data.status}">
                        <div class="result-item-id">${displayName}</div>
                        <div class="result-status">
                            <span class="status-indicator ${data.status}"></span>
                            <span>${data.message || 'Checking...'}</span>
                        </div>
                        ${priceDisplay}
                        <div class="result-timestamp">Checked at ${date}</div>
                    </div>
                </a>
            `;
        }).join('');
    });
}
