(function() {
  const tables = [...document.querySelectorAll('table')];
  tables.forEach((table, index) => {
    const data = [];
    const rows = [...table.querySelectorAll('tr')];
    
    rows.forEach(row => {
      const cells = [...row.querySelectorAll('td, th')];
      data.push(cells.map(cell => cell.textContent.trim()));
    });
    
    console.log(`Table ${index + 1} data:`);
    console.table(data);
  });
  
  if (tables.length === 0) {
    console.log('No tables found on this page');
  }
})();