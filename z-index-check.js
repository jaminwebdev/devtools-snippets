document.querySelectorAll('*').forEach(el => {
  const z = getComputedStyle(el).zIndex;
  if (z !== 'auto') {
    el.style.outline = '2px dashed purple';
    console.log(`z-index ${z}:`, el);
  }
});