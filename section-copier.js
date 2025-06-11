(function() {
  // Clean up if already running
  if (window.__highlightSectionsCleanup) window.__highlightSectionsCleanup();

  const HIGHLIGHT_CLASS = '__highlightedSection';
  const ICON_CLASS = '__sectionCopyIcon';
  const COPIED_CLASS = '__sectionCopiedMsg';
  const BORDER_STYLE = '3px solid #00e0ff';
  const ICON_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`;
  const PLUS_ICON_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
  const BOTTOM_PLUS_ICON_SVG = PLUS_ICON_SVG;
  const TARGET_SELECTOR = 'section,div,article';
  const STYLE_ID = '__highlightSectionsStyle';
  const TRASH_ICON_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff3b3b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;

  let icons = [];
  let copiedMsg = null;
  let savePopup = null;

  function addHighlightStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .${HIGHLIGHT_CLASS}:hover {
        outline: ${BORDER_STYLE} !important;
        position: relative !important;
      }
      .__sectionIconWrap {
        display: none;
      }
      .${HIGHLIGHT_CLASS}:hover > .__sectionIconWrap {
        display: flex;
      }
      .${ICON_CLASS} {
        position: static;
        background: rgba(255,255,255,0.92);
        border: 1.5px solid #00e0ff;
        border-radius: 6px;
        padding: 2px 4px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        transition: background 0.2s;
        margin: 0 4px;
      }
      .__sectionIconWrap {
        position: absolute;
        left: 50%;
        top: -28px;
        transform: translateX(-50%);
        z-index: 10001;
        align-items: center;
        justify-content: center;
      }
      .${COPIED_CLASS} {
        position: absolute;
        left: 50%;
        top: -48px;
        transform: translateX(-50%);
        background: #00e0ff;
        color: #fff;
        font-weight: bold;
        font-family: monospace;
        font-size: 14px;
        border-radius: 5px;
        padding: 3px 12px;
        z-index: 10002;
        pointer-events: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        opacity: 1;
        transition: opacity 0.3s;
      }
    `;
    document.head.appendChild(style);
  }

  function activateSection(section) {
    section.classList.add(HIGHLIGHT_CLASS);
    // Remove any existing icon
    section.querySelectorAll('.' + ICON_CLASS).forEach(icon => icon.remove());
    section.addEventListener('mouseenter', onSectionEnter);
    section.addEventListener('mouseleave', onSectionLeave);
  }

  function highlightSections() {
    addHighlightStyles();
    document.querySelectorAll(TARGET_SELECTOR).forEach(section => {
      activateSection(section);
    });
  }

  function onSectionEnter(e) {
    const section = e.currentTarget;
    // Add copy/plus/trash icon wrapper at top if not present
    if (!section.querySelector('.__sectionIconWrap')) {
      const icon = document.createElement('button');
      icon.innerHTML = ICON_SVG;
      icon.className = ICON_CLASS;
      icon.title = 'Copy section HTML';
      icon.addEventListener('click', function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        copySectionHTML(section, icon);
      });
      // Add plus icon (insert before)
      const plusIcon = document.createElement('button');
      plusIcon.innerHTML = PLUS_ICON_SVG;
      plusIcon.className = ICON_CLASS + ' __sectionPlusIcon';
      plusIcon.title = 'Paste saved HTML before';
      plusIcon.style.marginLeft = '8px';
      plusIcon.addEventListener('click', function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        showPastePopup(plusIcon, 'before');
      });
      // Add trashcan icon
      const trashIcon = document.createElement('button');
      trashIcon.innerHTML = TRASH_ICON_SVG;
      trashIcon.className = ICON_CLASS + ' __sectionTrashIcon';
      trashIcon.title = 'Delete section from DOM';
      trashIcon.style.marginLeft = '8px';
      trashIcon.addEventListener('click', function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        const parent = section.parentElement;
        section.remove();
        showDeleteMsg(icon);
      });
      const iconWrap = document.createElement('div');
      iconWrap.className = '__sectionIconWrap';
      iconWrap.style.display = 'flex';
      iconWrap.style.alignItems = 'center';
      iconWrap.style.justifyContent = 'center';
      iconWrap.style.position = 'absolute';
      iconWrap.style.left = '50%';
      iconWrap.style.top = '-28px';
      iconWrap.style.transform = 'translateX(-50%)';
      iconWrap.style.zIndex = 10001;
      iconWrap.appendChild(icon);
      iconWrap.appendChild(plusIcon);
      iconWrap.appendChild(trashIcon);
      section.appendChild(iconWrap);
      icons.push(iconWrap);
    }
    // Add bottom plus icon for insert after
    if (!section.querySelector('.__sectionIconWrapBottom')) {
      const bottomPlus = document.createElement('button');
      bottomPlus.innerHTML = BOTTOM_PLUS_ICON_SVG;
      bottomPlus.className = ICON_CLASS + ' __sectionPlusIconBottom';
      bottomPlus.title = 'Paste saved HTML after';
      bottomPlus.addEventListener('click', function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        showPastePopup(bottomPlus, 'after');
      });
      const bottomWrap = document.createElement('div');
      bottomWrap.className = '__sectionIconWrapBottom';
      bottomWrap.style.display = 'flex';
      bottomWrap.style.alignItems = 'center';
      bottomWrap.style.justifyContent = 'center';
      bottomWrap.style.position = 'absolute';
      bottomWrap.style.left = '50%';
      bottomWrap.style.bottom = '-28px';
      bottomWrap.style.transform = 'translateX(-50%)';
      bottomWrap.style.zIndex = 10001;
      bottomWrap.appendChild(bottomPlus);
      section.appendChild(bottomWrap);
      icons.push(bottomWrap);
    }
  }

  function onSectionLeave(e) {
    const section = e.currentTarget;
    // Remove the icon wrappers directly
    const iconWrap = section.querySelector('.__sectionIconWrap');
    if (iconWrap) iconWrap.remove();
    const bottomWrap = section.querySelector('.__sectionIconWrapBottom');
    if (bottomWrap) bottomWrap.remove();
    // Do NOT remove the popup here
  }

  function copySectionHTML(section, icon) {
    // Clone the section
    const clone = section.cloneNode(true);
    // Recursively inline only non-default styles and remove class attributes
    function getDefaultComputedStyle(tag) {
      const temp = document.createElement(tag);
      document.body.appendChild(temp);
      const def = window.getComputedStyle(temp);
      const defObj = {};
      for (let i = 0; i < def.length; i++) {
        const prop = def[i];
        defObj[prop] = def.getPropertyValue(prop);
      }
      temp.remove();
      return defObj;
    }
    function inlineNonDefaultStylesAndRemoveClass(el, orig) {
      if (orig.nodeType !== 1) return;
      const computed = window.getComputedStyle(orig);
      const defaults = getDefaultComputedStyle(orig.tagName.toLowerCase());
      let styleStr = '';
      for (let i = 0; i < computed.length; i++) {
        const prop = computed[i];
        const val = computed.getPropertyValue(prop);
        if (defaults[prop] !== val) {
          styleStr += prop + ':' + val + ';';
        }
      }
      if (styleStr) el.setAttribute('style', styleStr);
      else el.removeAttribute('style');
      el.removeAttribute('class');
      for (let i = 0; i < el.children.length; i++) {
        inlineNonDefaultStylesAndRemoveClass(el.children[i], orig.children[i]);
      }
    }
    inlineNonDefaultStylesAndRemoveClass(clone, section);
    showSavePopup(clone.outerHTML, icon);
  }

  function showSavePopup(html, icon) {
    if (savePopup) savePopup.remove();
    savePopup = document.createElement('div');
    savePopup.style.position = 'absolute';
    savePopup.style.left = '50%';
    savePopup.style.top = '-80px';
    savePopup.style.transform = 'translateX(-50%)';
    savePopup.style.background = '#fff';
    savePopup.style.color = '#222';
    savePopup.style.border = '2px solid #00e0ff';
    savePopup.style.borderRadius = '12px';
    savePopup.style.boxShadow = '0 2px 16px rgba(0,0,0,0.18)';
    savePopup.style.padding = '28px 38px 24px 38px';
    savePopup.style.zIndex = 10010;
    savePopup.style.fontFamily = 'monospace';
    savePopup.style.fontSize = '15px';
    savePopup.style.minWidth = '440px';
    savePopup.style.maxWidth = '600px';
    savePopup.innerHTML = `
      <div style='margin-bottom:14px;'>Save section HTML</div>
      <input type='text' id='__sectionSaveName' placeholder='Enter a name...' style='width:98%;margin-bottom:18px;padding:7px 10px;border-radius:6px;border:1.5px solid #00e0ff;font-size:16px;'/><br/>
      <div style='display:flex;gap:25px;justify-content:center;margin-bottom:0;'>
        <button id='__sectionSaveBtn' style='padding:7px 22px;border-radius:6px;border:none;background:#00e0ff;color:#222;font-weight:bold;cursor:pointer;font-size:15px;'>Save to LocalStorage</button>
        <button id='__sectionCopyBtn' style='padding:7px 22px;border-radius:6px;border:none;background:#00e0ff;color:#222;font-weight:bold;cursor:pointer;font-size:15px;'>Copy to Clipboard</button>
        <button id='__sectionCancelBtn' style='padding:7px 22px;border-radius:6px;border:none;background:#eee;color:#222;cursor:pointer;font-size:15px;'>Cancel</button>
      </div>
      <div id='__sectionSaveMsg' style='margin-top:14px;font-size:14px;color:#00b300;display:none;'></div>
    `;
    icon.parentElement.appendChild(savePopup);
    const nameInput = savePopup.querySelector('#__sectionSaveName');
    const saveBtn = savePopup.querySelector('#__sectionSaveBtn');
    const copyBtn = savePopup.querySelector('#__sectionCopyBtn');
    const cancelBtn = savePopup.querySelector('#__sectionCancelBtn');
    const msg = savePopup.querySelector('#__sectionSaveMsg');
    nameInput.focus();
    saveBtn.onclick = function() {
      const name = nameInput.value.trim();
      if (!name) {
        msg.textContent = 'Please enter a name.';
        msg.style.display = 'block';
        return;
      }
      localStorage.setItem('__savedSectionHTML_' + name, html);
      msg.textContent = 'Saved as "' + name + '"!';
      msg.style.display = 'block';
      setTimeout(() => { if (savePopup) savePopup.remove(); savePopup = null; }, 1200);
    };
    copyBtn.onclick = function() {
      navigator.clipboard.writeText(html).then(() => {
        msg.textContent = 'Copied to clipboard!';
        msg.style.display = 'block';
        setTimeout(() => { if (savePopup) savePopup.remove(); savePopup = null; }, 1200);
      });
    };
    cancelBtn.onclick = function() {
      if (savePopup) savePopup.remove();
      savePopup = null;
    };
    // ESC to close
    function onPopupEsc(e) {
      if (e.key === 'Escape') {
        if (savePopup) savePopup.remove();
        savePopup = null;
        window.removeEventListener('keydown', onPopupEsc, true);
      }
    }
    window.addEventListener('keydown', onPopupEsc, true);
  }

  function showPastePopup(plusIcon, position) {
    if (savePopup) savePopup.remove();
    savePopup = document.createElement('div');
    savePopup.style.position = 'absolute';
    savePopup.style.left = '50%';
    savePopup.style.top = position === 'after' ? 'auto' : '-80px';
    savePopup.style.bottom = position === 'after' ? '-80px' : 'auto';
    savePopup.style.transform = 'translateX(-50%)';
    savePopup.style.background = '#fff';
    savePopup.style.color = '#222';
    savePopup.style.border = '2px solid #00e0ff';
    savePopup.style.borderRadius = '12px';
    savePopup.style.boxShadow = '0 2px 16px rgba(0,0,0,0.18)';
    savePopup.style.padding = '28px 38px 24px 38px';
    savePopup.style.zIndex = 10010;
    savePopup.style.fontFamily = 'monospace';
    savePopup.style.fontSize = '15px';
    savePopup.style.minWidth = '440px';
    savePopup.style.maxWidth = '600px';
    // Get all saved keys
    const keys = Object.keys(localStorage).filter(k => k.startsWith('__savedSectionHTML_'));
    let html = `<div style='margin-bottom:14px;'>Paste saved HTML</div>`;
    if (keys.length === 0) {
      html += `<div style='color:#b00;margin-bottom:14px;'>No saved items found.</div>`;
    } else {
      html += `<select id='__sectionPasteSelect' style='width:99%;margin-bottom:18px;padding:7px 10px;border-radius:6px;border:1.5px solid #00e0ff;font-size:16px;'>`;
      keys.forEach(k => {
        const name = k.replace('__savedSectionHTML_', '');
        html += `<option value='${k}'>${name}</option>`;
      });
      html += `</select><br/>`;
      // Button row
      html += `<div style='display:flex;gap:25px;justify-content:center;margin-bottom:0;'>`;
      const isPlus = plusIcon.classList.contains('__sectionPlusIcon') || plusIcon.classList.contains('__sectionPlusIconBottom');
      if (!isPlus) {
        html += `<button id='__sectionPasteCopyBtn' style='padding:7px 22px;border-radius:6px;border:none;background:#00e0ff;color:#222;font-weight:bold;cursor:pointer;font-size:15px;'>Copy to Clipboard</button>`;
        html += `<button id='__sectionPasteInsertBtn' style='padding:7px 22px;border-radius:6px;border:none;background:#00e0ff;color:#222;font-weight:bold;cursor:pointer;font-size:15px;'>Insert ${position === 'after' ? 'After' : 'Before'}</button>`;
        html += `</div>`;
        html += `<div style='display:flex;justify-content:center;margin-top:18px;'><button id='__sectionPasteCancelBtn' style='padding:7px 22px;border-radius:6px;border:none;background:#eee;color:#222;cursor:pointer;font-size:15px;'>Cancel</button></div>`;
      } else {
        html += `<button id='__sectionPasteInsertBtn' style='padding:7px 22px;border-radius:6px;border:none;background:#00e0ff;color:#222;font-weight:bold;cursor:pointer;font-size:15px;'>Insert ${position === 'after' ? 'After' : 'Before'}</button>`;
        html += `<button id='__sectionPasteCancelBtn' style='padding:7px 22px;border-radius:6px;border:none;background:#eee;color:#222;cursor:pointer;font-size:15px;'>Cancel</button>`;
        html += `</div>`;
      }
    }
    html += `<div id='__sectionPasteMsg' style='margin-top:14px;font-size:14px;color:#00b300;display:none;'></div>`;
    savePopup.innerHTML = html;
    plusIcon.parentElement.appendChild(savePopup);
    const select = savePopup.querySelector('#__sectionPasteSelect');
    const copyBtn = savePopup.querySelector('#__sectionPasteCopyBtn');
    const insertBtn = savePopup.querySelector('#__sectionPasteInsertBtn');
    const cancelBtn = savePopup.querySelector('#__sectionPasteCancelBtn');
    const msg = savePopup.querySelector('#__sectionPasteMsg');
    if (copyBtn) {
      copyBtn.onclick = function() {
        if (!select) return;
        const key = select.value;
        const html = localStorage.getItem(key);
        if (html) {
          navigator.clipboard.writeText(html).then(() => {
            msg.textContent = 'Copied to clipboard!';
            msg.style.display = 'block';
            setTimeout(() => { if (savePopup) savePopup.remove(); savePopup = null; }, 1200);
          });
        }
      };
    }
    if (insertBtn) {
      insertBtn.onclick = function() {
        if (!select) return;
        const key = select.value;
        const html = localStorage.getItem(key);
        if (html) {
          // Find the currently hovered section
          let section = plusIcon;
          while (section && !section.classList.contains(HIGHLIGHT_CLASS)) {
            section = section.parentElement;
          }
          if (section && section.parentElement) {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            // Insert all top-level nodes (should be one, but just in case)
            Array.from(temp.childNodes).forEach(node => {
              if (position === 'after') {
                section.parentElement.insertBefore(node, section.nextSibling);
              } else {
                section.parentElement.insertBefore(node, section);
              }
              if (node.nodeType === 1 && (node.matches(TARGET_SELECTOR))) {
                activateSection(node);
              }
            });
            msg.textContent = `Inserted ${position === 'after' ? 'after' : 'before'} section!`;
            msg.style.display = 'block';
            setTimeout(() => { if (savePopup) savePopup.remove(); savePopup = null; }, 1200);
          }
        }
      };
    }
    cancelBtn.onclick = function() {
      if (savePopup) savePopup.remove();
      savePopup = null;
    };
    // ESC to close
    function onPopupEsc(e) {
      if (e.key === 'Escape') {
        if (savePopup) savePopup.remove();
        savePopup = null;
        window.removeEventListener('keydown', onPopupEsc, true);
      }
    }
    window.addEventListener('keydown', onPopupEsc, true);
  }

  function showCopiedMsg(icon) {
    if (copiedMsg) copiedMsg.remove();
    copiedMsg = document.createElement('div');
    copiedMsg.className = COPIED_CLASS;
    copiedMsg.textContent = 'Copied!';
    Object.assign(copiedMsg.style, {
      position: 'absolute',
      top: '-28px',
      right: '0',
      background: '#00e0ff',
      color: '#fff',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      fontSize: '14px',
      borderRadius: '5px',
      padding: '3px 12px',
      zIndex: 10002,
      pointerEvents: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      opacity: 1,
      transition: 'opacity 0.3s',
    });
    icon.parentElement.appendChild(copiedMsg);
    setTimeout(() => {
      if (copiedMsg) {
        copiedMsg.style.opacity = 0;
        setTimeout(() => copiedMsg && copiedMsg.remove(), 400);
      }
    }, 1200);
  }

  function showDeleteMsg(icon) {
    if (copiedMsg) copiedMsg.remove();
    copiedMsg = document.createElement('div');
    copiedMsg.className = COPIED_CLASS;
    copiedMsg.textContent = 'Deleted!';
    Object.assign(copiedMsg.style, {
      position: 'absolute',
      top: '-28px',
      right: '0',
      background: '#ff3b3b',
      color: '#fff',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      fontSize: '14px',
      borderRadius: '5px',
      padding: '3px 12px',
      zIndex: 10002,
      pointerEvents: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      opacity: 1,
      transition: 'opacity 0.3s',
    });
    icon.parentElement.appendChild(copiedMsg);
    setTimeout(() => {
      if (copiedMsg) {
        copiedMsg.style.opacity = 0;
        setTimeout(() => copiedMsg && copiedMsg.remove(), 400);
      }
    }, 1200);
  }

  function cleanup() {
    document.querySelectorAll(TARGET_SELECTOR).forEach(section => {
      section.classList.remove(HIGHLIGHT_CLASS);
      section.querySelectorAll('.' + ICON_CLASS).forEach(icon => icon.remove());
      section.removeEventListener('mouseenter', onSectionEnter);
      section.removeEventListener('mouseleave', onSectionLeave);
      section.style.outline = '';
      section.style.position = '';
    });
    if (copiedMsg) copiedMsg.remove();
    if (savePopup) savePopup.remove();
    icons = [];
    const style = document.getElementById(STYLE_ID);
    if (style) style.remove();
    window.removeEventListener('keydown', onEsc, true);
    window.removeEventListener('keydown', onPopupEsc, true);
    window.__highlightSectionsCleanup = undefined;
  }

  function onEsc(e) {
    if (e.key === 'Escape') cleanup();
  }

  // Prevent popup from being closed when clicking inside it
  if (!window.__sectionCopierPopupClickGuard) {
    document.addEventListener('mousedown', function(e) {
      if (savePopup && savePopup.contains(e.target)) {
        // Click inside popup, do nothing
        return;
      }
      // Click outside popup, do nothing (let Cancel/Escape handle closing)
    }, true);
    window.__sectionCopierPopupClickGuard = true;
  }

  window.__highlightSectionsCleanup = cleanup;
  highlightSections();
  window.addEventListener('keydown', onEsc, true);
  // Optional: log cleanup instructions
  console.log('Sections highlighted. Click the copy icon to copy HTML. Press ESC to remove highlights.');
})(); 

// todos
// style better