document.querySelectorAll('a, button, [onclick], input[type="submit"]').forEach(el => {
  el.style.outline = '3px solid orange';
});