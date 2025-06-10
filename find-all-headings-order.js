[...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].forEach(el => {
  console.log(el.tagName + ':', el.textContent.trim());
});