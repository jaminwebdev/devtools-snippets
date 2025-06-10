(function highlightFlexAndGridItems() {
  function getContrastColor(bgColor) {
    const rgba = bgColor.match(/rgba?\(([^)]+)\)/);
    if (!rgba) return 'red'; // fallback
    const parts = rgba[1].split(',').map(p => parseFloat(p));
    const [r, g, b] = parts;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 186 ? 'black' : 'white'; // high contrast
  }

  function applyBorder(el) {
    const style = getComputedStyle(el);
    const bgColor = style.backgroundColor || 'rgb(255,255,255)';
    const borderColor = getContrastColor(bgColor);
    el.style.outline = `2px dashed ${borderColor}`;
  }

  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    const style = getComputedStyle(el);
    const display = style.display;
    if (
      (display === 'flex' || display === 'inline-flex') ||
      (display === 'grid' || display === 'inline-grid')
    ) {
      el.style.outline = '2px solid lime'; // container
    } else if (
      el.parentElement &&
      ['flex', 'inline-flex', 'grid', 'inline-grid'].includes(getComputedStyle(el.parentElement).display)
    ) {
      applyBorder(el); // item
    }
  });

  console.log('Flex and grid items outlined for debugging.');
})();
