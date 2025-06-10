document.querySelectorAll('a[href]').forEach(a => {
  const href = a.href;
  console.log(`${href.includes(location.hostname) ? 'Internal' : 'External'}:`, href);
});