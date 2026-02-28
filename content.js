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
      drag: 'Drag to move',
    },
    fr: {
      title: 'Suivre Stock B',
      added: 'Ajoute',
      stop: 'Arreter le suivi',
      stopped: 'Suivi arrete',
      working: 'Traitement...',
      error: 'Erreur',
      drag: 'Glisser pour deplacer',
    },
    de: {
      title: 'B-Stock verfolgen',
      added: 'Hinzugefugt',
      stop: 'Tracking stoppen',
      stopped: 'Tracking gestoppt',
      working: 'Wird verarbeitet...',
      error: 'Fehler',
      drag: 'Zum Verschieben ziehen',
    },
  };

  const POSITION_KEY = 'floatingButtonPosition';
  const COMPACT_SCROLL_Y = 180;

  const normalizeLanguage = (value) => {
    if (!value || typeof value !== 'string') return 'en';
    const base = value.toLowerCase().split('-')[0];
    return BUTTON_I18N[base] ? base : 'en';
  };

  let language = normalizeLanguage(navigator.language);
  const t = (key) => BUTTON_I18N[language]?.[key] || BUTTON_I18N.en[key] || key;

  const pagePath = window.location.pathname + window.location.search + window.location.hash;
  const isProductHtmPage = /\.htm(?:$|[?#])/i.test(pagePath);
  const isBStockPage = /_b_stock\.htm(?:$|[?#])/i.test(pagePath);
  if (!isProductHtmPage || isBStockPage) return;

  if (document.getElementById('stockbchecker-widget')) return;

  let isTracked = false;
  let isBusy = false;
  let isAddedState = false;
  let isCompact = false;
  let isDragging = false;
  let dragPointerId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  const widget = document.createElement('div');
  widget.id = 'stockbchecker-widget';
  widget.style.position = 'fixed';
  widget.style.left = '24px';
  widget.style.bottom = '24px';
  widget.style.zIndex = '99999';
  widget.style.display = 'flex';
  widget.style.alignItems = 'center';
  widget.style.gap = '10px';
  widget.style.padding = '10px';
  widget.style.borderRadius = '18px';
  widget.style.background = 'rgba(255,255,255,0.92)';
  widget.style.backdropFilter = 'blur(16px)';
  widget.style.boxShadow = '0 18px 42px rgba(15, 23, 42, 0.22)';
  widget.style.border = '1px solid rgba(148, 163, 184, 0.28)';
  widget.style.userSelect = 'none';
  widget.style.transition = 'gap 140ms ease, padding 140ms ease, transform 120ms ease';

  const dragHandle = document.createElement('button');
  dragHandle.type = 'button';
  dragHandle.setAttribute('aria-label', t('drag'));
  dragHandle.title = t('drag');
  dragHandle.style.width = '32px';
  dragHandle.style.height = '32px';
  dragHandle.style.border = 'none';
  dragHandle.style.borderRadius = '999px';
  dragHandle.style.background = 'rgba(15, 23, 42, 0.06)';
  dragHandle.style.color = 'rgb(71, 85, 105)';
  dragHandle.style.display = 'inline-flex';
  dragHandle.style.alignItems = 'center';
  dragHandle.style.justifyContent = 'center';
  dragHandle.style.cursor = 'grab';
  dragHandle.style.flexShrink = '0';
  dragHandle.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="8" cy="6" r="1"></circle>
      <circle cx="16" cy="6" r="1"></circle>
      <circle cx="8" cy="12" r="1"></circle>
      <circle cx="16" cy="12" r="1"></circle>
      <circle cx="8" cy="18" r="1"></circle>
      <circle cx="16" cy="18" r="1"></circle>
    </svg>
  `;

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
  btn.style.display = 'inline-flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  btn.style.whiteSpace = 'nowrap';
  btn.style.height = '40px';
  btn.style.padding = '0 16px';
  btn.style.borderRadius = '12px';
  btn.style.border = '1px solid transparent';
  btn.style.fontSize = '14px';
  btn.style.fontWeight = '600';
  btn.style.lineHeight = '1';
  btn.style.fontFamily = 'ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif';
  btn.style.background = 'hsl(214 100% 45%)';
  btn.style.color = 'hsl(0 0% 100%)';
  btn.style.boxShadow = '0 10px 26px rgba(20, 99, 255, 0.28)';
  btn.style.cursor = 'pointer';
  btn.style.transition = 'background-color 120ms ease, transform 120ms ease, padding 140ms ease';

  widget.appendChild(dragHandle);
  widget.appendChild(btn);
  document.body.appendChild(widget);

  const savePosition = () => {
    chrome.storage.local.set({
      [POSITION_KEY]: {
        left: widget.style.left,
        top: widget.style.top,
        bottom: widget.style.bottom,
      },
    });
  };

  const applyStoredPosition = (position) => {
    if (!position || typeof position !== 'object') return;
    if (position.left) widget.style.left = position.left;
    if (position.top) widget.style.top = position.top;
    if (position.bottom) widget.style.bottom = position.bottom;
  };

  const setCompactMode = (compact) => {
    if (isCompact === compact) return;
    isCompact = compact;
    const label = btn.querySelector('#stockbchecker-btn-label');
    const icon = btn.querySelector('#stockbchecker-btn-icon');
    if (!label || !icon) return;

    label.style.display = compact ? 'none' : 'inline';
    icon.style.marginRight = compact ? '0px' : '8px';
    btn.style.padding = compact ? '0 12px' : '0 16px';
    dragHandle.style.width = compact ? '28px' : '32px';
    dragHandle.style.height = compact ? '28px' : '32px';
    widget.style.gap = compact ? '8px' : '10px';
    widget.style.padding = compact ? '8px' : '10px';
  };

  const applyTrackedStyle = (tracked) => {
    if (tracked) {
      btn.style.background = 'hsl(214 100% 38%)';
      btn.style.color = 'hsl(210 40% 98%)';
      return;
    }
    btn.style.background = 'hsl(214 100% 45%)';
    btn.style.color = 'hsl(0 0% 100%)';
  };

  btn.onmouseenter = () => {
    if (isDragging) return;
    if (isAddedState) {
      btn.style.background = 'hsl(214 100% 40%)';
    } else {
      btn.style.background = isTracked ? 'hsl(214 100% 34%)' : 'hsl(214 100% 40%)';
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
      btn.style.background = 'hsl(214 100% 42%)';
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

  dragHandle.addEventListener('pointerdown', (event) => {
    isDragging = true;
    dragPointerId = event.pointerId;
    const rect = widget.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    widget.style.bottom = 'auto';
    widget.style.top = `${rect.top}px`;
    dragHandle.style.cursor = 'grabbing';
    dragHandle.setPointerCapture(event.pointerId);
  });

  dragHandle.addEventListener('pointermove', (event) => {
    if (!isDragging || dragPointerId !== event.pointerId) return;

    const nextLeft = Math.max(8, Math.min(window.innerWidth - widget.offsetWidth - 8, event.clientX - dragOffsetX));
    const nextTop = Math.max(8, Math.min(window.innerHeight - widget.offsetHeight - 8, event.clientY - dragOffsetY));

    widget.style.left = `${nextLeft}px`;
    widget.style.top = `${nextTop}px`;
  });

  const stopDragging = (event) => {
    if (!isDragging || dragPointerId !== event.pointerId) return;
    isDragging = false;
    dragHandle.style.cursor = 'grab';
    dragHandle.releasePointerCapture(event.pointerId);
    dragPointerId = null;
    savePosition();
  };

  dragHandle.addEventListener('pointerup', stopDragging);
  dragHandle.addEventListener('pointercancel', stopDragging);

  btn.onclick = () => {
    if (isBusy || isDragging) return;
    isBusy = true;
    setState('loading');

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

  window.addEventListener('scroll', () => {
    setCompactMode(window.scrollY > COMPACT_SCROLL_Y);
  }, { passive: true });

  chrome.storage.local.get(['language', POSITION_KEY], (storage) => {
    language = normalizeLanguage(storage?.language || navigator.language);
    applyStoredPosition(storage?.[POSITION_KEY]);
    setCompactMode(window.scrollY > COMPACT_SCROLL_Y);

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
