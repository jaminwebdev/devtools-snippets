document.body.addEventListener('mouseover', e => {
  e.target.style.outline = '2px solid red';
  setTimeout(() => e.target.style.outline = '', 500);
});
