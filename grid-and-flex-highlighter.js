(function() {
  document.querySelectorAll('*').forEach(el => {
    const style = getComputedStyle(el);
    const display = style.display;
    
    if (display.includes('flex')) {
      el.style.outline = '2px solid lime';
      el.style.position = 'relative';
      const label = document.createElement('div');
      label.textContent = 'FLEX';
      label.style.cssText = 'position:absolute;top:-20px;left:0;background:lime;color:black;padding:2px 4px;font-size:10px;z-index:9999;';
      el.appendChild(label);
    }
    
    if (display.includes('grid')) {
      el.style.outline = '2px solid orange';
      el.style.position = 'relative';
      const label = document.createElement('div');
      label.textContent = 'GRID';
      label.style.cssText = 'position:absolute;top:-20px;left:0;background:orange;color:black;padding:2px 4px;font-size:10px;z-index:9999;';
      el.appendChild(label);
    }
  });
  
  console.log('Flex and Grid containers highlighted');
})();