const observer = new MutationObserver(mutations => {
  console.log('DOM mutations:', mutations);
});
observer.observe(document.body, { childList: true, subtree: true });