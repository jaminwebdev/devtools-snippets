(function() {
  // Clean up if already running
  if (window.__editTooltipCleanup) window.__editTooltipCleanup();

  let form = null;
  let targetEl = null;
  let lastRightClick = { x: 0, y: 0 };
  let lastValues = {};

  function isLeafNode(el) {
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    if (["h1","h2","h3","h4","h5","h6","p","span"].includes(tag)) return true;
    return !el.children || el.children.length === 0;
  }

  function getEditableDetails(el) {
    const computed = window.getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      class: el.className || '',
      text: el.textContent || '',
      color: computed.color,
      bg: computed.backgroundColor,
      padding: `${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`,
      margin: `${computed.marginTop} ${computed.marginRight} ${computed.marginBottom} ${computed.marginLeft}`,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      width: computed.width,
      height: computed.height,
      position: computed.position,
      lineHeight: computed.lineHeight,
    };
  }

  function createForm(details) {
    if (form) form.remove();
    form = document.createElement('form');
    form.id = '__editTooltipForm';
    form.autocomplete = 'off';
    Object.assign(form.style, {
      position: 'fixed',
      left: (lastRightClick.x + 16) + 'px',
      top: (lastRightClick.y + 16) + 'px',
      zIndex: 1000001,
      background: 'rgba(30,30,40,0.98)',
      color: '#fff',
      borderRadius: '10px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
      padding: '0 0 14px 0',
      fontFamily: 'monospace',
      fontSize: '14px',
      minWidth: '260px',
      maxWidth: '350px',
      border: '2px solid #00e0ff',
      maxHeight: '90vh',
      overflowY: 'auto',
    });
    // Drag handle
    const dragHandle = document.createElement('div');
    dragHandle.style.cursor = 'move';
    dragHandle.style.background = 'rgba(0,224,255,0.18)';
    dragHandle.style.padding = '10px 18px 8px 18px';
    dragHandle.style.borderTopLeftRadius = '8px';
    dragHandle.style.borderTopRightRadius = '8px';
    dragHandle.style.userSelect = 'none';
    dragHandle.style.fontWeight = 'bold';
    dragHandle.textContent = '⇕ Drag to move';
    form.appendChild(dragHandle);
    function row(label, name, value, type = 'text', extra = '') {
      if (name === 'text' && isLeafNode(targetEl)) {
        return `<label style='display:block;margin-bottom:7px;'><b>${label}:</b><br/><textarea name='${name}' rows='3' style='width:98%;margin-top:2px;padding:2px 4px;border-radius:4px;border:1px solid #444;background:#222;color:#fff;resize:vertical;' ${extra}>${value.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea></label>`;
      }
      return `<label style='display:block;margin-bottom:7px;'><b>${label}:</b><br/><input name='${name}' type='${type}' value="${value.replace(/"/g, '&quot;')}" style='width:98%;margin-top:2px;padding:2px 4px;border-radius:4px;border:1px solid #444;background:#222;color:#fff;' ${extra}/></label>`;
    }
    let html = '';
    html += `<div style='margin-bottom:8px;'><b>Tag:</b> <span>${details.tag}</span></div>`;
    html += row('Class', 'class', details.class);
    if (isLeafNode(targetEl)) {
      html += row('Text', 'text', details.text.replace(/\n/g, ' '));
      html += row('Line Height', 'lineHeight', details.lineHeight, 'text');
    } else {
      html += row('Text', 'text', '(container - not editable)', 'text', 'readonly');
    }
    html += row('Color', 'color', details.color, 'text');
    html += row('Background', 'bg', details.bg, 'text');
    html += row('Padding', 'padding', details.padding, 'text');
    html += row('Margin', 'margin', details.margin, 'text');
    html += row('Font Size', 'fontSize', details.fontSize, 'text');
    html += row('Font Weight', 'fontWeight', details.fontWeight, 'text');
    html += row('Width', 'width', details.width, 'text');
    html += row('Height', 'height', details.height, 'text');
    html += row('Position', 'position', details.position, 'text');
    html += `<div style='margin-top:10px;text-align:right;'>
      <button type='submit' style='margin-right:8px;padding:3px 12px;border-radius:4px;border:none;background:#00e0ff;color:#222;font-weight:bold;cursor:pointer;'>Apply</button>
      <button type='button' id='__editTooltipCancel' style='padding:3px 12px;border-radius:4px;border:none;background:#444;color:#fff;cursor:pointer;'>Cancel</button>
    </div>`;
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = html;
    contentDiv.style.padding = '8px 18px 0 18px';
    form.appendChild(contentDiv);
    document.body.appendChild(form);
    setTimeout(() => form.querySelector('input,button').focus(), 0);

    // Ensure the form is fully visible in the viewport
    setTimeout(() => {
      const margin = 12;
      const rect = form.getBoundingClientRect();
      let left = rect.left, top = rect.top;
      if (rect.right > window.innerWidth - margin) {
        left = window.innerWidth - rect.width - margin;
      }
      if (rect.left < margin) {
        left = margin;
      }
      if (rect.bottom > window.innerHeight - margin) {
        top = window.innerHeight - rect.height - margin;
      }
      if (rect.top < margin) {
        top = margin;
      }
      form.style.left = left + 'px';
      form.style.top = top + 'px';
    }, 0);

    // Drag logic
    let dragOffsetX = 0, dragOffsetY = 0, dragging = false;
    dragHandle.addEventListener('mousedown', function(e) {
      dragging = true;
      const rect = form.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });
    window.addEventListener('mousemove', onDragMove, true);
    window.addEventListener('mouseup', onDragEnd, true);
    function onDragMove(e) {
      if (!dragging) return;
      let left = e.clientX - dragOffsetX;
      let top = e.clientY - dragOffsetY;
      // Keep within viewport
      const margin = 12;
      left = Math.max(margin, Math.min(window.innerWidth - form.offsetWidth - margin, left));
      top = Math.max(margin, Math.min(window.innerHeight - form.offsetHeight - margin, top));
      form.style.left = left + 'px';
      form.style.top = top + 'px';
    }
    function onDragEnd() {
      dragging = false;
      document.body.style.userSelect = '';
    }
  }

  function applyChangedEditsToElement(el, data) {
    // Only set properties that have changed
    if (data.class !== lastValues.class) el.className = data.class;
    if (isLeafNode(el) && 'text' in data && data.text !== lastValues.text) el.textContent = data.text;
    const computed = window.getComputedStyle(el);
    function setOrClearStyle(prop, value, computedValue, lastValue) {
      if (value === lastValue) return; // Only update if changed
      if (!value || value === computedValue) {
        el.style.removeProperty(prop);
      } else {
        el.style.setProperty(prop, value);
      }
    }
    setOrClearStyle('color', data.color, computed.color, lastValues.color);
    setOrClearStyle('background', data.bg, computed.background, lastValues.bg);
    // Padding
    const paddings = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];
    const padVals = data.padding.split(' ');
    const lastPadVals = (lastValues.padding || '').split(' ');
    paddings.forEach((prop, i) => {
      setOrClearStyle(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), padVals[i], computed[prop], lastPadVals[i]);
    });
    // Margin
    const margins = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
    const marVals = data.margin.split(' ');
    const lastMarVals = (lastValues.margin || '').split(' ');
    margins.forEach((prop, i) => {
      setOrClearStyle(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), marVals[i], computed[prop], lastMarVals[i]);
    });
    setOrClearStyle('font-size', data.fontSize, computed.fontSize, lastValues.fontSize);
    setOrClearStyle('font-weight', data.fontWeight, computed.fontWeight, lastValues.fontWeight);
    setOrClearStyle('line-height', data.lineHeight, computed.lineHeight, lastValues.lineHeight);
    setOrClearStyle('width', data.width, computed.width, lastValues.width);
    setOrClearStyle('height', data.height, computed.height, lastValues.height);
    setOrClearStyle('position', data.position, computed.position, lastValues.position);
  }

  function onRightClick(e) {
    // Only activate if Ctrl (Windows/Linux) or Meta (Command on Mac) is held
    if (!(e.ctrlKey || e.metaKey)) return;
    if (form && form.contains(e.target)) return;
    if (e.target.id === '__editTooltipForm') return;
    if (window.getSelection && window.getSelection().toString()) return; // allow text selection
    targetEl = document.elementFromPoint(e.clientX, e.clientY);
    if (!targetEl) return;
    lastRightClick = { x: e.clientX, y: e.clientY };
    lastValues = getEditableDetails(targetEl);
    createForm(lastValues);
    e.preventDefault();
  }

  function onFormInput(e) {
    if (!form || !targetEl) return;
    const data = Object.fromEntries(new FormData(form).entries());
    applyChangedEditsToElement(targetEl, data);
    lastValues = { ...lastValues, ...data };
  }

  function onFormSubmit(e) {
    if (!form || !targetEl) return;
    e.preventDefault();
    if (document.activeElement && form.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    const data = Object.fromEntries(new FormData(form).entries());
    applyChangedEditsToElement(targetEl, data);
    form.remove();
    form = null;
    targetEl = null;
    lastValues = {};
  }

  function onFormCancel(e) {
    if (form) form.remove();
    form = null;
    targetEl = null;
    lastValues = {};
  }

  function onClickOutside(e) {
    if (!form) return;
    if (!form.contains(e.target)) {
      form.remove();
      form = null;
      targetEl = null;
      lastValues = {};
    }
  }

  function onEsc(e) {
    if (e.key === 'Escape' && form) {
      form.remove();
      form = null;
      targetEl = null;
      lastValues = {};
    }
  }

  function cleanup() {
    window.removeEventListener('contextmenu', onRightClick, true);
    window.removeEventListener('mousedown', onClickOutside, true);
    window.removeEventListener('keydown', onEsc, true);
    if (form) form.remove();
    form = null;
    targetEl = null;
    lastValues = {};
    window.__editTooltipCleanup = undefined;
  }

  window.__editTooltipCleanup = cleanup;
  window.addEventListener('contextmenu', onRightClick, true);
  window.addEventListener('mousedown', onClickOutside, true);
  window.addEventListener('keydown', onEsc, true);
  document.body.addEventListener('input', onFormInput, true);
  document.body.addEventListener('submit', onFormSubmit, true);
  document.body.addEventListener('click', function(e) {
    if (e.target && e.target.id === '__editTooltipCancel') onFormCancel(e);
  }, true);

  // Optional: log cleanup instructions
  console.log('Edit tooltip form enabled. Ctrl+RightClick any element. Press ESC or click Cancel to close the form.');
})(); 