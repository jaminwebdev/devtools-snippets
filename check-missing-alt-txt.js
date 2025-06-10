document.querySelectorAll('img:not([alt])').forEach(img => {
  console.warn('Missing alt:', img);
});