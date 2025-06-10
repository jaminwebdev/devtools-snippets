document.querySelectorAll('[role]').forEach(el => {
  el.style.outline = '2px dashed #00f';
  console.log('ARIA role:', el.getAttribute('role'), el);
});