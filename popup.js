// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    loadResults();
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
                    <div class="item-id">Article #${item.id}</div>
                    <div class="item-url">${item.url}</div>
                </div>
                <button class="remove-button" onclick="removeItem(${index})">Remove</button>
            </div>
        `).join('');
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
                checkStockB(item.id, item.url);
            }, index * 500); // Stagger requests to avoid rate limiting
        });
        
        // Reset button after a reasonable time
        setTimeout(() => {
            checkButton.disabled = false;
            checkButton.textContent = 'Check All Items';
        }, items.length * 500 + 3000);
    });
}

function checkStockB(articleId, url) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const isAvailable = checkStockBInHtml(html);
            updateResult(articleId, isAvailable, null);
        })
        .catch(error => {
            updateResult(articleId, null, error.message);
        });
}

function checkStockBInHtml(html) {
    // Check if there's a div with class "discounts-and-addons" containing a link with "b_stock" in the URL
    const hasBStock = /<div[^>]*class="[^"]*discounts-and-addons[^"]*"[^>]*>.*?href="[^"]*b_stock[^"]*\.htm/is.test(html);
    
    return hasBStock;
}

function updateResult(articleId, isAvailable, error) {
    chrome.storage.local.get('results', (result) => {
        const results = result.results || {};
        
        if (error) {
            results[articleId] = {
                status: 'error',
                message: error,
                timestamp: new Date().toISOString()
            };
        } else {
            results[articleId] = {
                status: isAvailable ? 'available' : 'unavailable',
                message: isAvailable ? 'Stock B is available' : 'Stock B is not available',
                timestamp: new Date().toISOString()
            };
        }
        
        chrome.storage.local.set({ results }, () => {
            loadResults();
        });
    });
}

function loadResults() {
    chrome.storage.local.get('results', (result) => {
        const results = result.results || {};
        const resultsList = document.getElementById('resultsList');
        
        const resultEntries = Object.entries(results);
        
        if (resultEntries.length === 0) {
            resultsList.innerHTML = '<p class="empty-state">Check items to see results</p>';
            return;
        }
        
        resultsList.innerHTML = resultEntries.map(([articleId, data]) => {
            const date = new Date(data.timestamp).toLocaleTimeString();
            return `
                <div class="result-row ${data.status}">
                    <div class="result-item-id">Article #${articleId}</div>
                    <div class="result-status">
                        <span class="status-indicator ${data.status}"></span>
                        <span>${data.message || 'Checking...'}</span>
                    </div>
                    <div class="result-timestamp">Checked at ${date}</div>
                </div>
            `;
        }).join('');
    });
}
