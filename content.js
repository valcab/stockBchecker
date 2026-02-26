// content.js
// Injects a floating button on Thomann item pages to allow quick adding to Stock B checker

(function() {
  // Only run on product pages
  const isThomannProductPage = /thomann\.(de|fr|es|com)\/.+\.html/.test(window.location.href);
  if (!isThomannProductPage) return;

  // Prevent duplicate button
  if (document.getElementById('stockbchecker-quickadd-btn')) return;

  // Create floating button
  const btn = document.createElement('button');
  btn.id = 'stockbchecker-quickadd-btn';
  btn.innerText = '➕ Stock B';
  btn.style.position = 'fixed';
  btn.style.bottom = '32px';
  btn.style.right = '32px';
  btn.style.zIndex = '99999';
  btn.style.background = '#22c55e';
  btn.style.color = 'white';
  btn.style.border = 'none';
  btn.style.borderRadius = '9999px';
  btn.style.padding = '14px 22px';
  btn.style.fontSize = '16px';
  btn.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
  btn.style.cursor = 'pointer';
  btn.style.transition = 'background 0.2s';
  btn.onmouseenter = () => btn.style.background = '#16a34a';
  btn.onmouseleave = () => btn.style.background = '#22c55e';

  btn.onclick = () => {
    // Send message to background/popup to add this item
    chrome.runtime.sendMessage({
      type: 'STOCKB_ADD_ITEM',
      url: window.location.href
    }, (response) => {
      if (response && response.success && response.added) {
        btn.innerText = '✔️ Added!';
        setTimeout(() => { btn.innerText = '➕ Stock B'; }, 2000);
      } else if (response && response.success && response.reason === 'already-tracked') {
        btn.innerText = 'ℹ️ Already tracked';
        setTimeout(() => { btn.innerText = '➕ Stock B'; }, 2000);
      } else {
        btn.innerText = '⚠️ Error';
        setTimeout(() => { btn.innerText = '➕ Stock B'; }, 2000);
      }
    });
  };

  document.body.appendChild(btn);
})();
