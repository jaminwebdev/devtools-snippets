[...document.scripts]
  .filter(script => script.src)
  .forEach(script => console.log(script.src));