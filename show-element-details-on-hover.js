(function() {
  // Clean up if already running
  if (window.__elementDetailsCleanup) window.__elementDetailsCleanup();

  let lastEl = null;
  let tooltip = null;
  let outline = null;
  let childOutlines = [];
  let childTooltip = null;
  let containerEl = null;
  let gapRects = [];
  let cleanupScrollResize = null;
  let mutationObserver = null;
  let copyMessage = null;

  function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.id = '__elementDetailsTooltip';
    Object.assign(tooltip.style, {
      position: 'fixed',
      zIndex: 999999,
      pointerEvents: 'none',
      background: 'rgba(30,30,40,0.97)',
      color: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      padding: '10px 14px',
      fontFamily: 'monospace',
      fontSize: '13px',
      maxWidth: '400px',
      whiteSpace: 'pre-line',
      transition: 'opacity 0.1s',
      opacity: 0,
      pointerEvents: 'none',
    });
    document.body.appendChild(tooltip);
  }

  function showTooltip(html, x, y) {
    if (!tooltip) createTooltip();
    tooltip.innerHTML = html;
    tooltip.style.left = (x + 16) + 'px';
    tooltip.style.top = (y + 16) + 'px';
    tooltip.style.opacity = 1;
    // Prevent overflow
    const rect = tooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      tooltip.style.left = (window.innerWidth - rect.width - 10) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
      tooltip.style.top = (window.innerHeight - rect.height - 10) + 'px';
    }
  }

  function hideTooltip() {
    if (tooltip) tooltip.style.opacity = 0;
  }

  function createOutline() {
    outline = document.createElement('div');
    outline.id = '__elementDetailsOutline';
    Object.assign(outline.style, {
      position: 'fixed',
      zIndex: 999998,
      pointerEvents: 'none',
      border: '2px solid #00e0ff',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'all 0.08s',
    });
    document.body.appendChild(outline);
  }

  function showOutline(el) {
    if (!outline) createOutline();
    const r = el.getBoundingClientRect();
    Object.assign(outline.style, {
      left: r.left + 'px',
      top: r.top + 'px',
      width: r.width + 'px',
      height: r.height + 'px',
      display: 'block',
    });
  }

  function hideOutline() {
    if (outline) outline.style.display = 'none';
  }

  function getElementDetails(el) {
    if (!el) return '';
    const computed = window.getComputedStyle(el);
    const parent = el.parentElement;
    const tag = el.tagName.toLowerCase();
    const classes = el.className ? (typeof el.className === 'string' ? el.className : Array.from(el.classList).join(' ')) : '';
    let text = el.textContent?.trim() || '';
    if (text.length > 80) text = text.slice(0, 77) + '...';
    const color = computed.color;
    const bg = computed.backgroundColor;
    const padding = `${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`;
    const margin = `${computed.marginTop} ${computed.marginRight} ${computed.marginBottom} ${computed.marginLeft}`;
    const position = computed.position;
    const display = computed.display;
    const parentTag = parent ? parent.tagName.toLowerCase() : 'none';
    const parentClass = parent && parent.className ? (typeof parent.className === 'string' ? parent.className : Array.from(parent.classList).join(' ')) : '';
    const fontSize = computed.fontSize;
    const fontWeight = computed.fontWeight;
    const width = computed.width;
    const height = computed.height;
    const href = el.getAttribute && el.getAttribute('href');
    const alt = el.getAttribute && el.getAttribute('alt');

    function row(label, value) {
      return `<b>${label}:</b> ${value}<br/>`;
    }

    let details = '';
    details += row('tag', tag);
    details += row('class', classes || '(none)');
    details += row('text', text || '(none)');
    details += row('color', color);
    details += row('bg', bg);
    details += row('padding', padding);
    details += row('margin', margin);
    details += row('position', position);
    details += row('display', display);
    if (fontSize && fontSize !== '0px') details += row('font-size', fontSize);
    if (fontWeight && fontWeight !== 'normal' && fontWeight !== '400') details += row('font-weight', fontWeight);
    if (width && width !== 'auto' && width !== '0px') details += row('width', width);
    if (height && height !== 'auto' && height !== '0px') details += row('height', height);
    if (href) details += row('href', href);
    if (alt) details += row('alt', alt);
    details += row('parent', parentTag + (parentClass ? '.' + parentClass : ''));
    return details;
  }

  function isContainerElement(el) {
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return [
      'div', 'section', 'article', 'main', 'aside', 'nav', 'header', 'footer'
    ].includes(tag);
  }

  function isFlexOrGrid(el) {
    if (!el) return false;
    const display = window.getComputedStyle(el).display;
    return (
      display === 'flex' || display === 'inline-flex' ||
      display === 'grid' || display === 'inline-grid'
    );
  }

  function cleanupGapRects() {
    gapRects.forEach(r => r.remove());
    gapRects = [];
  }

  function highlightChildren(container) {
    cleanupChildOutlines();
    cleanupGapRects();
    if (!container) return;
    const computed = window.getComputedStyle(container);
    const isFlex = computed.display.includes('flex');
    const isGrid = computed.display.includes('grid');
    const gapX = parseFloat(computed.columnGap || computed.gap || '0');
    const gapY = parseFloat(computed.rowGap || computed.gap || '0');
    const children = Array.from(container.children).filter(child => {
      const r = child.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    // Outline all children
    children.forEach(child => {
      const outline = document.createElement('div');
      outline.className = '__elementDetailsChildOutline';
      Object.assign(outline.style, {
        position: 'fixed',
        zIndex: 999997,
        pointerEvents: 'none',
        border: '2px dashed #ffb300',
        borderRadius: '3px',
        boxSizing: 'border-box',
        transition: 'all 0.08s',
      });
      const r = child.getBoundingClientRect();
      Object.assign(outline.style, {
        left: r.left + 'px',
        top: r.top + 'px',
        width: r.width + 'px',
        height: r.height + 'px',
        display: 'block',
      });
      document.body.appendChild(outline);
      childOutlines.push(outline);
    });
    // Draw gap rectangles
    if ((isFlex || isGrid) && (gapX > 0 || gapY > 0) && children.length > 1) {
      for (let i = 0; i < children.length - 1; i++) {
        const a = children[i].getBoundingClientRect();
        const b = children[i + 1].getBoundingClientRect();
        // Flex row (horizontal gap)
        if (isFlex && computed.flexDirection.startsWith('row') && gapX > 0) {
          const left = a.right;
          const top = Math.min(a.top, b.top);
          const width = b.left - a.right;
          const height = Math.max(a.height, b.height);
          if (width > 0) {
            const gapRect = document.createElement('div');
            Object.assign(gapRect.style, {
              position: 'fixed',
              left: left + 'px',
              top: top + 'px',
              width: width + 'px',
              height: height + 'px',
              background: 'rgba(0,200,255,0.18)',
              zIndex: 999996,
              pointerEvents: 'none',
              borderRadius: '2px',
            });
            document.body.appendChild(gapRect);
            gapRects.push(gapRect);
          }
        }
        // Flex column (vertical gap)
        if (isFlex && computed.flexDirection.startsWith('column') && gapY > 0) {
          const left = Math.min(a.left, b.left);
          const top = a.bottom;
          const width = Math.max(a.width, b.width);
          const height = b.top - a.bottom;
          if (height > 0) {
            const gapRect = document.createElement('div');
            Object.assign(gapRect.style, {
              position: 'fixed',
              left: left + 'px',
              top: top + 'px',
              width: width + 'px',
              height: height + 'px',
              background: 'rgba(0,200,255,0.18)',
              zIndex: 999996,
              pointerEvents: 'none',
              borderRadius: '2px',
            });
            document.body.appendChild(gapRect);
            gapRects.push(gapRect);
          }
        }
        // Grid: show both horizontal and vertical gaps
        if (isGrid) {
          // Horizontal gap
          if (gapX > 0) {
            const left = a.right;
            const top = Math.min(a.top, b.top);
            const width = b.left - a.right;
            const height = Math.max(a.height, b.height);
            if (width > 0) {
              const gapRect = document.createElement('div');
              Object.assign(gapRect.style, {
                position: 'fixed',
                left: left + 'px',
                top: top + 'px',
                width: width + 'px',
                height: height + 'px',
                background: 'rgba(255,0,200,0.18)',
                zIndex: 999996,
                pointerEvents: 'none',
                borderRadius: '2px',
              });
              document.body.appendChild(gapRect);
              gapRects.push(gapRect);
            }
          }
          // Vertical gap
          if (gapY > 0) {
            const left = Math.min(a.left, b.left);
            const top = a.bottom;
            const width = Math.max(a.width, b.width);
            const height = b.top - a.bottom;
            if (height > 0) {
              const gapRect = document.createElement('div');
              Object.assign(gapRect.style, {
                position: 'fixed',
                left: left + 'px',
                top: top + 'px',
                width: width + 'px',
                height: height + 'px',
                background: 'rgba(255,0,200,0.18)',
                zIndex: 999996,
                pointerEvents: 'none',
                borderRadius: '2px',
              });
              document.body.appendChild(gapRect);
              gapRects.push(gapRect);
            }
          }
        }
      }
    }
  }

  function cleanupChildOutlines() {
    childOutlines.forEach(o => o.remove());
    childOutlines = [];
    if (childTooltip) {
      childTooltip.remove();
      childTooltip = null;
    }
    cleanupGapRects();
  }

  function showChildTooltip(html, x, y) {
    if (!childTooltip) {
      childTooltip = document.createElement('div');
      childTooltip.id = '__elementDetailsChildTooltip';
      Object.assign(childTooltip.style, {
        position: 'fixed',
        zIndex: 999999,
        pointerEvents: 'none',
        background: 'rgba(30,30,40,0.97)',
        color: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        padding: '10px 14px',
        fontFamily: 'monospace',
        fontSize: '13px',
        maxWidth: '400px',
        whiteSpace: 'pre-line',
        transition: 'opacity 0.1s',
        opacity: 0,
        pointerEvents: 'none',
      });
      document.body.appendChild(childTooltip);
    }
    childTooltip.innerHTML = html;
    childTooltip.style.left = (x + 16) + 'px';
    childTooltip.style.top = (y + 16) + 'px';
    childTooltip.style.opacity = 1;
    // Prevent overflow
    const rect = childTooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      childTooltip.style.left = (window.innerWidth - rect.width - 10) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
      childTooltip.style.top = (window.innerHeight - rect.height - 10) + 'px';
    }
  }

  function hideChildTooltip() {
    if (childTooltip) childTooltip.style.opacity = 0;
  }

  function isTooltipOrOutline(el) {
    if (!el) return false;
    return (
      el.id === '__elementDetailsTooltip' ||
      el.id === '__elementDetailsOutline' ||
      el.className === '__elementDetailsChildOutline' ||
      el.id === '__elementDetailsChildTooltip' ||
      el.closest('#__elementDetailsTooltip') ||
      el.closest('#__elementDetailsOutline') ||
      el.closest('.__elementDetailsChildOutline') ||
      el.closest('#__elementDetailsChildTooltip')
    );
  }

  function observeContainerRemoval(container) {
    if (mutationObserver) mutationObserver.disconnect();
    if (!container || !container.parentElement) return;
    mutationObserver = new MutationObserver(() => {
      if (!document.body.contains(container)) {
        cleanup();
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  function showCopyMessage(x, y) {
    if (copyMessage) copyMessage.remove();
    copyMessage = document.createElement('div');
    copyMessage.textContent = 'Element data added to clipboard';
    Object.assign(copyMessage.style, {
      position: 'fixed',
      left: (x + 16) + 'px',
      top: (y + 16) + 'px',
      zIndex: 1000000,
      background: 'rgba(30,200,80,0.97)',
      color: '#fff',
      borderRadius: '6px',
      padding: '8px 16px',
      fontFamily: 'monospace',
      fontSize: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      pointerEvents: 'none',
      opacity: 1,
      transition: 'opacity 0.3s',
    });
    document.body.appendChild(copyMessage);
    setTimeout(() => {
      if (copyMessage) {
        copyMessage.style.opacity = 0;
        setTimeout(() => copyMessage && copyMessage.remove(), 400);
      }
    }, 1200);
  }

  function onRightClick(e) {
    if (isTooltipOrOutline(e.target)) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    const details = getElementDetails(el).replace(/<br\/?>(\n)?/g, '\n').replace(/<[^>]+>/g, '');
    navigator.clipboard.writeText(details).then(() => {
      showCopyMessage(e.clientX, e.clientY);
    });
    e.preventDefault();
  }

  function onMove(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    // If hovering a child of a flex/grid container, show child tooltip
    if (
      containerEl &&
      containerEl !== el &&
      containerEl.contains(el) &&
      !isTooltipOrOutline(el)
    ) {
      hideTooltip();
      showChildTooltip(getElementDetails(el), e.clientX, e.clientY);
      showOutline(el);
      lastEl = el;
      return;
    }
    // If hovering a flex/grid container
    if (
      el &&
      isContainerElement(el) &&
      isFlexOrGrid(el) &&
      !isTooltipOrOutline(el)
    ) {
      containerEl = el;
      highlightChildren(el);
      showTooltip(getElementDetails(el), e.clientX, e.clientY);
      showOutline(el);
      hideChildTooltip();
      lastEl = el;
      observeContainerRemoval(el);
      return;
    }
    // If hovering a child outline
    if (el && el.className === '__elementDetailsChildOutline') {
      // Do nothing, let the child tooltip logic handle
      return;
    }
    // Otherwise, clean up child outlines/tooltips
    cleanupChildOutlines();
    containerEl = null;
    if (mutationObserver) mutationObserver.disconnect();
    mutationObserver = null;
    if (!el || isTooltipOrOutline(el) || el === document.body || el === document.documentElement) {
      hideTooltip();
      hideOutline();
      lastEl = null;
      return;
    }
    if (el !== lastEl) {
      showTooltip(getElementDetails(el), e.clientX, e.clientY);
      showOutline(el);
      lastEl = el;
    } else {
      // Move tooltip with mouse
      showTooltip(tooltip.innerHTML, e.clientX, e.clientY);
    }
  }

  function handleScrollResize() {
    cleanupChildOutlines();
    cleanupGapRects();
    hideTooltip();
    hideOutline();
    containerEl = null;
    lastEl = null;
    if (mutationObserver) mutationObserver.disconnect();
    mutationObserver = null;
  }

  function setupScrollResizeCleanup() {
    if (cleanupScrollResize) return;
    const handler = () => handleScrollResize();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler, true);
    cleanupScrollResize = () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler, true);
      cleanupScrollResize = null;
    };
  }

  function cleanup() {
    window.removeEventListener('mousemove', onMove, true);
    window.removeEventListener('contextmenu', onRightClick, true);
    if (tooltip) tooltip.remove();
    if (outline) outline.remove();
    cleanupChildOutlines();
    cleanupGapRects();
    if (cleanupScrollResize) cleanupScrollResize();
    if (mutationObserver) mutationObserver.disconnect();
    mutationObserver = null;
    if (copyMessage) copyMessage.remove();
    window.__elementDetailsCleanup = undefined;
  }

  window.__elementDetailsCleanup = cleanup;
  window.addEventListener('mousemove', onMove, true);
  setupScrollResizeCleanup();
  window.addEventListener('contextmenu', onRightClick, true);
  // Clean up on ESC
  window.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') cleanup();
  }, { once: true });

  // Optional: log cleanup instructions
  console.log('Element details tooltip enabled. Press ESC to remove.');
})(); 