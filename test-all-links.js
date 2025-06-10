(function() {
  const links = [...document.querySelectorAll('a[href]')];
  const promises = links.map(async link => {
    try {
      const response = await fetch(link.href, { method: 'HEAD', mode: 'no-cors' });
      return { link: link.href, status: 'OK', element: link };
    } catch (error) {
      link.style.outline = '2px solid red';
      return { link: link.href, status: 'ERROR', error: error.message, element: link };
    }
  });
  
  Promise.all(promises).then(results => {
    const broken = results.filter(r => r.status === 'ERROR');
    console.log(`Link check complete. ${broken.length}/${links.length} broken links found:`);
    if (broken.length > 0) console.table(broken);
  });
})();