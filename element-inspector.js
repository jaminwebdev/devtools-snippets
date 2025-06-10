(function() {
  let isActive = true;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:10px;right:10px;background:black;color:white;padding:10px;z-index:99999;font-family:monospace;font-size:12px;';
  overlay.innerHTML = 'Inspector Active - Click to inspect, ESC to exit';
  document.body.appendChild(overlay);
  
  function inspector(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const el = e.target;
    const rect = el.getBoundingClientRect();
    const computedStyle = getComputedStyle(el);
    
    console.group('Element Inspector');
    console.log('Element:', el);
    console.table({
      Tag: el.tagName,
      ID: el.id || 'none',
      Classes: el.className || 'none',
      Size: `${rect.width.toFixed(2)} × ${rect.height.toFixed(2)}`,
      Position: `${rect.left.toFixed(2)}, ${rect.top.toFixed(2)}`,
      Display: computedStyle.display,
      Position: computedStyle.position,
      'Z-Index': computedStyle.zIndex,
      Color: computedStyle.color,
      Background: computedStyle.backgroundColor
    });
    console.groupEnd();
  }
  
  function keyHandler(e) {
    if (e.key === 'Escape') {
      document.removeEventListener('click', inspector, true);
      document.removeEventListener('keydown', keyHandler);
      overlay.remove();
      console.log('Inspector deactivated');
    }
  }
  
  document.addEventListener('click', inspector, true);
  document.addEventListener('keydown', keyHandler);
})();