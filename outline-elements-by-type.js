(function() {
  const colors = {
    div: 'red', span: 'blue', p: 'green', a: 'orange',
    img: 'purple', form: 'yellow', input: 'pink', button: 'cyan'
  };
  Object.entries(colors).forEach(([tag, color]) => {
    document.querySelectorAll(tag).forEach(el => {
      el.style.outline = `2px solid ${color}`;
    });
  });
  console.log('Elements outlined by type');
})();