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
    // Check if it's a URL
    if (input.includes('thomann')) {
        const match = input.match(/\/(\d+)\.html/);
        if (match) return match[1];
    }
    // Otherwise assume it's an ID
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
    
    chrome.storage.local.get('items', (result) => {
        const items = result.items || [];
        
        // Check if item already exists
        if (items.some(item => item.id === articleId)) {
            alert('This item is already tracked');
            return;
        }
        
        // Add new item
        items.push({
            id: articleId,
            url: `https://www.thomann.de/${articleId}.html`,
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
    // Check for Stock B text patterns on Thomann page
    // This looks for specific indicators that Stock B is available
    const stockBPatterns = [
        /Stock\s*B/i,
        /Lagerbestand\s*B/i,
        /Verfügbar.*B/i,
        /stock-b/i,
        /available.*stock-b/i
    ];
    
    return stockBPatterns.some(pattern => pattern.test(html));
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
