// content.js
// Injects a floating button on Thomann item pages to allow quick adding to Stock B checker

(function() {
  const BUTTON_I18N = {
    en: {
      title: 'Track Stock B',
      added: 'Added',
      stop: 'Stop tracking',
      stopped: 'Tracking stopped',
      working: 'Working...',
      error: 'Error',
    },
    fr: {
      title: 'Suivre Stock B',
      added: 'Ajoute',
      stop: 'Arreter le suivi',
      stopped: 'Suivi arrete',
      working: 'Traitement...',
      error: 'Erreur',
    },
    de: {
      title: 'B-Stock verfolgen',
      added: 'Hinzugefugt',
      stop: 'Tracking stoppen',
      stopped: 'Tracking gestoppt',
      working: 'Wird verarbeitet...',
      error: 'Fehler',
    },
  };

  const normalizeLanguage = (value) => {
    if (!value || typeof value !== 'string') return 'en';
    const base = value.toLowerCase().split('-')[0];
    return BUTTON_I18N[base] ? base : 'en';
  };

  let language = normalizeLanguage(navigator.language);
  const t = (key) => BUTTON_I18N[language]?.[key] || BUTTON_I18N.en[key] || key;

  // Only run on product pages ending with .htm (not .html category pages).
  const isProductHtmPage = /\.htm(?:$|[?#])/i.test(
    window.location.pathname + window.location.search + window.location.hash
  );
  if (!isProductHtmPage) return;

  // Prevent duplicate button
  if (document.getElementById('stockbchecker-quickadd-btn')) return;

  // Create floating button
  const btn = document.createElement('button');
  btn.id = 'stockbchecker-quickadd-btn';
  btn.type = 'button';
  btn.innerHTML = `
    <span style="display:inline-flex;align-items:center;justify-content:center;pointer-events:none;">
      <svg
        id="stockbchecker-btn-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        style="margin-right:8px;"
      >
        <path d="M5 12h14"></path>
        <path d="M12 5v14"></path>
      </svg>
      <span id="stockbchecker-btn-label">Track Stock B</span>
    </span>
  `;
  btn.style.position = 'fixed';
  btn.style.bottom = '32px';
  btn.style.left = '32px';
  btn.style.zIndex = '99999';
  btn.style.display = 'inline-flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  btn.style.whiteSpace = 'nowrap';
  btn.style.height = '40px';
  btn.style.padding = '0 16px';
  btn.style.borderRadius = '8px';
  btn.style.border = '1px solid transparent';
  btn.style.fontSize = '14px';
  btn.style.fontWeight = '500';
  btn.style.lineHeight = '1';
  btn.style.fontFamily = 'ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif';
  btn.style.background = 'hsl(270 60% 70%)';
  btn.style.color = 'hsl(270 60% 10%)';
  btn.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
  btn.style.cursor = 'pointer';
  btn.style.transition = 'background-color 120ms ease, transform 120ms ease, box-shadow 120ms ease';
  let isTracked = false;
  let isBusy = false;
  let isAddedState = false;

  const applyTrackedStyle = (tracked) => {
    if (tracked) {
      btn.style.background = 'hsl(0 84% 60%)';
      btn.style.color = 'hsl(210 40% 98%)';
      return;
    }
    btn.style.background = 'hsl(270 60% 70%)';
    btn.style.color = 'hsl(270 60% 10%)';
  };

  btn.onmouseenter = () => {
    if (isAddedState) {
      btn.style.background = 'hsl(142 71% 41%)';
    } else {
      btn.style.background = isTracked ? 'hsl(0 84% 56%)' : 'hsl(270 60% 66%)';
    }
    btn.style.transform = 'translateY(-1px)';
  };
  btn.onmouseleave = () => {
    applyTrackedStyle(isTracked);
    btn.style.transform = 'translateY(0)';
  };

  const setState = (state) => {
    const icon = btn.querySelector('#stockbchecker-btn-icon');
    const label = btn.querySelector('#stockbchecker-btn-label');
    if (!icon || !label) return;

    if (state === 'added') {
      icon.innerHTML = '<path d="M20 6 9 17l-5-5"></path>';
      label.textContent = t('added');
      btn.style.background = 'hsl(142 71% 45%)';
      btn.style.color = 'hsl(0 0% 100%)';
      isAddedState = true;
      return;
    }

    if (state === 'tracked') {
      icon.innerHTML = '<path d="M5 12h14"></path>';
      label.textContent = t('stop');
      isAddedState = false;
      applyTrackedStyle(true);
      return;
    }

    if (state === 'removed') {
      icon.innerHTML = '<path d="M20 6 9 17l-5-5"></path>';
      label.textContent = t('stopped');
      isAddedState = false;
      applyTrackedStyle(false);
      return;
    }

    if (state === 'loading') {
      icon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6"></path><path d="M12 18h.01"></path>';
      label.textContent = t('working');
      isAddedState = false;
      return;
    }

    if (state === 'error') {
      icon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path>';
      label.textContent = t('error');
      isAddedState = false;
      return;
    }

    icon.innerHTML = '<path d="M5 12h14"></path><path d="M12 5v14"></path>';
    label.textContent = t('title');
    isAddedState = false;
    applyTrackedStyle(false);
  };

  btn.onclick = () => {
    if (isBusy) return;
    isBusy = true;
    setState('loading');

    // Toggle tracking for this item
    chrome.runtime.sendMessage({
      type: isTracked ? 'STOCKB_REMOVE_ITEM' : 'STOCKB_ADD_ITEM',
      url: window.location.href
    }, (response) => {
      isBusy = false;
      if (!response || !response.success) {
        setState('error');
        setTimeout(() => { setState(isTracked ? 'tracked' : 'default'); }, 1500);
        return;
      }

      if (isTracked) {
        if (response.removed) {
          isTracked = false;
          setState('removed');
          setTimeout(() => { setState('default'); }, 1200);
          return;
        }
        if (response.reason === 'not-tracked') {
          isTracked = false;
          setState('default');
          return;
        }
        setState('error');
        setTimeout(() => { setState('tracked'); }, 1500);
        return;
      }

      if (response.added) {
        isTracked = true;
        setState('added');
        setTimeout(() => { setState('tracked'); }, 1200);
      } else if (response.reason === 'already-tracked') {
        isTracked = true;
        setState('tracked');
      } else {
        setState('error');
        setTimeout(() => { setState('default'); }, 1500);
      }
    });
  };

  document.body.appendChild(btn);

  chrome.storage.local.get(['language'], (storage) => {
    language = normalizeLanguage(storage?.language || navigator.language);

    // Initialize button from current tracking state.
    chrome.runtime.sendMessage(
      {
        type: 'STOCKB_IS_TRACKED',
        url: window.location.href
      },
      (response) => {
        if (response && response.success && response.tracked) {
          isTracked = true;
          setState('tracked');
        } else {
          isTracked = false;
          setState('default');
        }
      }
    );
  });
})();
