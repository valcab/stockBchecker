(function () {
  const I18N = {
    en: {
      title: 'Track Stock B',
      added: 'Added',
      stop: 'Stop tracking',
      stopped: 'Tracking stopped',
      working: 'Working...',
      error: 'Error',
      drag: 'Drag',
      help: 'Drag to move',
    },
    fr: {
      title: 'Suivre Stock B',
      added: 'Ajoute',
      stop: 'Arreter le suivi',
      stopped: 'Suivi arrete',
      working: 'Traitement...',
      error: 'Erreur',
      drag: 'Deplacer',
      help: 'Glisser pour deplacer',
    },
    de: {
      title: 'B-Stock verfolgen',
      added: 'Hinzugefugt',
      stop: 'Tracking stoppen',
      stopped: 'Tracking gestoppt',
      working: 'Wird verarbeitet...',
      error: 'Fehler',
      drag: 'Verschieben',
      help: 'Zum Verschieben ziehen',
    },
  };

  const STORAGE_KEY = 'floatingWidgetPosition';
  const DEFAULT_OFFSET = 24;
  const COMPACT_SCROLL_Y = 180;

  const normalizeLanguage = (value) => {
    if (!value || typeof value !== 'string') return 'en';
    const base = value.toLowerCase().split('-')[0];
    return I18N[base] ? base : 'en';
  };

  let language = normalizeLanguage(navigator.language);
  const t = (key) => I18N[language]?.[key] || I18N.en[key] || key;

  const isProductHtmPage = /\.htm(?:$|[?#])/i.test(
    window.location.pathname + window.location.search + window.location.hash
  );
  const isBStockPage = /_b_stock\.htm(?:$|[?#])/i.test(
    window.location.pathname + window.location.search + window.location.hash
  );
  if (!isProductHtmPage || isBStockPage) return;

  if (document.getElementById('stockbchecker-widget')) return;

  const currentUrl = window.location.href;
  const articleIdMatch = currentUrl.match(/\/([^/?#]+)\.htm/i);
  const fallbackItemId = articleIdMatch ? articleIdMatch[1] : currentUrl;

  let isTracked = false;
  let isBusy = false;
  let isAddedState = false;
  let isCompact = false;
  let dragState = null;

  const widget = document.createElement('div');
  widget.id = 'stockbchecker-widget';
  widget.style.position = 'fixed';
  widget.style.left = `${DEFAULT_OFFSET}px`;
  widget.style.bottom = `${DEFAULT_OFFSET}px`;
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
  widget.style.transition = 'transform 140ms ease, opacity 140ms ease, gap 140ms ease, padding 140ms ease';

  const dragHandle = document.createElement('button');
  dragHandle.type = 'button';
  dragHandle.setAttribute('aria-label', t('drag'));
  dragHandle.dataset.tooltip = t('help');
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

  const mainButton = document.createElement('button');
  mainButton.id = 'stockbchecker-quickadd-btn';
  mainButton.type = 'button';
  mainButton.dataset.tooltip = t('title');
  mainButton.setAttribute('aria-live', 'polite');
  mainButton.style.height = '40px';
  mainButton.style.padding = '0 16px';
  mainButton.style.border = '1px solid transparent';
  mainButton.style.borderRadius = '12px';
  mainButton.style.display = 'inline-flex';
  mainButton.style.alignItems = 'center';
  mainButton.style.justifyContent = 'center';
  mainButton.style.gap = '8px';
  mainButton.style.whiteSpace = 'nowrap';
  mainButton.style.font = '600 14px/1 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif';
  mainButton.style.color = 'white';
  mainButton.style.background = 'hsl(214 100% 45%)';
  mainButton.style.boxShadow = '0 10px 26px rgba(20, 99, 255, 0.28)';
  mainButton.style.cursor = 'pointer';
  mainButton.style.transition = 'background-color 120ms ease, transform 120ms ease, width 140ms ease, padding 140ms ease';
  mainButton.innerHTML = `
    <svg id="stockbchecker-btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12h14"></path>
      <path d="M12 5v14"></path>
    </svg>
    <span id="stockbchecker-btn-label">${t('title')}</span>
  `;

  const tooltip = document.createElement('div');
  tooltip.style.position = 'fixed';
  tooltip.style.zIndex = '100000';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.padding = '7px 10px';
  tooltip.style.borderRadius = '10px';
  tooltip.style.background = 'rgba(15, 23, 42, 0.94)';
  tooltip.style.color = 'white';
  tooltip.style.font = '500 12px/1.2 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif';
  tooltip.style.opacity = '0';
  tooltip.style.transform = 'translateY(6px)';
  tooltip.style.transition = 'opacity 120ms ease, transform 120ms ease';
  tooltip.style.maxWidth = '180px';

  widget.appendChild(dragHandle);
  widget.appendChild(mainButton);
  document.body.appendChild(widget);
  document.body.appendChild(tooltip);

  const savePosition = () => {
    chrome.storage.local.set({
      [STORAGE_KEY]: {
        left: widget.style.left,
        top: widget.style.top,
        bottom: widget.style.bottom,
      },
    });
  };

  const applyPosition = (pos) => {
    if (!pos || typeof pos !== 'object') {
      widget.style.left = `${DEFAULT_OFFSET}px`;
      widget.style.bottom = `${DEFAULT_OFFSET}px`;
      widget.style.top = 'auto';
      return;
    }
    widget.style.left = pos.left || `${DEFAULT_OFFSET}px`;
    widget.style.top = pos.top || 'auto';
    widget.style.bottom = pos.bottom || `${DEFAULT_OFFSET}px`;
  };

  const showTooltip = (target) => {
    const text = target?.dataset?.tooltip;
    if (!text) return;
    const rect = target.getBoundingClientRect();
    tooltip.textContent = text;
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${Math.max(12, rect.top - 12)}px`;
    tooltip.style.transform = 'translate(-50%, -100%)';
    tooltip.style.opacity = '1';
  };

  const hideTooltip = () => {
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translate(-50%, calc(-100% + 6px))';
  };

  const setCompact = (compact) => {
    isCompact = compact;
    const label = mainButton.querySelector('#stockbchecker-btn-label');
    if (!label) return;
    label.style.display = compact ? 'none' : 'inline';
    mainButton.style.padding = compact ? '0 12px' : '0 16px';
    dragHandle.style.width = compact ? '28px' : '32px';
    dragHandle.style.height = compact ? '28px' : '32px';
    widget.style.gap = compact ? '8px' : '10px';
    widget.style.padding = compact ? '8px' : '10px';
  };

  const applyMainColor = (bg) => {
    mainButton.style.background = bg;
    mainButton.style.color = 'white';
  };

  const setState = (state) => {
    const icon = mainButton.querySelector('#stockbchecker-btn-icon');
    const label = mainButton.querySelector('#stockbchecker-btn-label');
    if (!icon || !label) return;

    mainButton.dataset.tooltip = t('title');

    if (state === 'added') {
      icon.innerHTML = '<path d="M20 6 9 17l-5-5"></path>';
      label.textContent = t('added');
      applyMainColor('hsl(214 100% 42%)');
      isAddedState = true;
      return;
    }

    if (state === 'tracked') {
      icon.innerHTML = '<path d="M5 12h14"></path>';
      label.textContent = t('stop');
      applyMainColor('hsl(214 100% 38%)');
      isAddedState = false;
      return;
    }

    if (state === 'removed') {
      icon.innerHTML = '<path d="M20 6 9 17l-5-5"></path>';
      label.textContent = t('stopped');
      applyMainColor('hsl(214 100% 45%)');
      isAddedState = false;
      return;
    }

    if (state === 'loading') {
      icon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6"></path><path d="M12 18h.01"></path>';
      label.textContent = t('working');
      applyMainColor('hsl(214 100% 38%)');
      isAddedState = false;
      return;
    }

    if (state === 'error') {
      icon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path>';
      label.textContent = t('error');
      applyMainColor('hsl(0 72% 47%)');
      isAddedState = false;
      return;
    }

    icon.innerHTML = '<path d="M5 12h14"></path><path d="M12 5v14"></path>';
    label.textContent = t('title');
    applyMainColor('hsl(214 100% 45%)');
    isAddedState = false;
  };

  const setHoverState = () => {
    if (isAddedState) {
      applyMainColor('hsl(214 100% 40%)');
      return;
    }
    if (isTracked) {
      applyMainColor('hsl(214 100% 34%)');
      return;
    }
    applyMainColor('hsl(214 100% 40%)');
  };

  const resetHoverState = () => {
    if (isTracked) {
      setState('tracked');
      return;
    }
    setState('default');
  };

  [mainButton, dragHandle].forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (el === mainButton) {
        setHoverState();
      } else {
        el.style.transform = 'translateY(-1px)';
        el.style.background = 'rgba(226, 232, 240, 0.95)';
      }
      showTooltip(el);
    });
    el.addEventListener('mouseleave', () => {
      if (el === mainButton) {
        resetHoverState();
      } else {
        el.style.transform = 'translateY(0)';
        el.style.background = el === dragHandle ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255,255,255,0.92)';
      }
      hideTooltip();
    });
  });

  dragHandle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      startLeft: widget.offsetLeft,
      startTop: widget.offsetTop,
    };
    dragHandle.style.cursor = 'grabbing';
    dragHandle.setPointerCapture(event.pointerId);
  });

  dragHandle.addEventListener('pointermove', (event) => {
    if (!dragState) return;
    const maxLeft = window.innerWidth - widget.offsetWidth - 8;
    const maxTop = window.innerHeight - widget.offsetHeight - 8;
    const nextLeft = Math.min(maxLeft, Math.max(8, dragState.startLeft + event.clientX - dragState.startX));
    const nextTop = Math.min(maxTop, Math.max(8, dragState.startTop + event.clientY - dragState.startY));
    widget.style.left = `${nextLeft}px`;
    widget.style.top = `${nextTop}px`;
    widget.style.bottom = 'auto';
  });

  const stopDrag = (event) => {
    if (!dragState) return;
    dragState = null;
    dragHandle.style.cursor = 'grab';
    if (event?.pointerId !== undefined && dragHandle.hasPointerCapture(event.pointerId)) {
      dragHandle.releasePointerCapture(event.pointerId);
    }
    savePosition();
  };

  dragHandle.addEventListener('pointerup', stopDrag);
  dragHandle.addEventListener('pointercancel', stopDrag);

  mainButton.addEventListener('click', () => {
    if (isBusy || dragState) return;
    isBusy = true;
    setState('loading');

    chrome.runtime.sendMessage(
      {
        type: isTracked ? 'STOCKB_REMOVE_ITEM' : 'STOCKB_ADD_ITEM',
        url: currentUrl,
      },
      (response) => {
        isBusy = false;
        if (!response || !response.success) {
          setState('error');
          setTimeout(() => setState(isTracked ? 'tracked' : 'default'), 1500);
          return;
        }

        if (isTracked) {
          if (response.removed) {
            isTracked = false;
            setState('removed');
            setTimeout(() => setState('default'), 1200);
            return;
          }
          if (response.reason === 'not-tracked') {
            isTracked = false;
            setState('default');
            return;
          }
          setState('error');
          setTimeout(() => setState('tracked'), 1500);
          return;
        }

      if (response.added) {
        isTracked = true;
        setState('added');
        setTimeout(() => setState('tracked'), 1200);
        } else if (response.reason === 'already-tracked') {
          isTracked = true;
          setState('tracked');
        } else {
          setState('error');
          setTimeout(() => setState('default'), 1500);
        }
      }
    );
  });

  window.addEventListener(
    'scroll',
    () => {
      setCompact(window.scrollY > COMPACT_SCROLL_Y);
    },
    { passive: true }
  );

  chrome.storage.local.get(['language', STORAGE_KEY], (storage) => {
    language = normalizeLanguage(storage?.language || navigator.language);
    applyPosition(storage?.[STORAGE_KEY]);

    chrome.runtime.sendMessage(
      {
        type: 'STOCKB_IS_TRACKED',
        url: currentUrl,
      },
      (response) => {
        if (response && response.success && response.tracked) {
          isTracked = true;
          setState('tracked');
        } else {
          isTracked = false;
          setState('default');
        }
        setCompact(window.scrollY > COMPACT_SCROLL_Y);
      }
    );
  });
})();
