(function() {
  console.log('🔍 COMPLETE PAGE AUDIT SUMMARY');
  console.log('═'.repeat(50));
  
  // Basic page info
  const pageInfo = {
    'URL': location.href,
    'Title': document.title,
    'Meta Description': document.querySelector('meta[name="description"]')?.content || 'Missing',
    'Viewport': document.querySelector('meta[name="viewport"]')?.content || 'Missing',
    'Charset': document.querySelector('meta[charset]')?.getAttribute('charset') || 'Not specified'
  };
  
  console.log('📄 Page Information:');
  console.table(pageInfo);
  
  // Performance metrics
  const perf = performance.getEntriesByType('navigation')[0];
  const perfMetrics = {
    'DOM Load': (perf.domContentLoadedEventEnd - perf.fetchStart).toFixed(0) + 'ms',
    'Page Load': (perf.loadEventEnd - perf.fetchStart).toFixed(0) + 'ms',
    'Resources': performance.getEntriesByType('resource').length,
    'DOM Nodes': document.querySelectorAll('*').length
  };
  
  console.log('\n⚡ Performance:');
  console.table(perfMetrics);
  
  // Content analysis
  const contentStats = {
    'Images': document.images.length,
    'Images without Alt': [...document.images].filter(img => !img.alt).length,
    'Links': document.links.length,
    'External Links': [...document.links].filter(link => link.hostname !== location.hostname).length,
    'Forms': document.forms.length,
    'Scripts': document.scripts.length,
    'Stylesheets': document.styleSheets.length
  };
  
  console.log('\n📊 Content Analysis:');
  console.table(contentStats);
  
  // Quick issues check
  const quickIssues = [];
  if (!document.title || document.title.length < 30) quickIssues.push('Title too short');
  if ([...document.images].filter(img => !img.alt).length > 0) quickIssues.push('Images missing alt text');
  if (document.querySelectorAll('h1').length !== 1) quickIssues.push('Should have exactly one H1');
  if (performance.getEntriesByType('resource').length > 100) quickIssues.push('High resource count');
  
  console.log('\n🚨 Quick Issues:');
  if (quickIssues.length > 0) {
    quickIssues.forEach(issue => console.warn('- ' + issue));
  } else {
    console.log('✅ No major issues detected');
  }
  
  console.log('\n═'.repeat(50));
  console.log('Audit complete! Check individual sections above for details.');
})();

// todos
// expand on further and merge with performance bottlenecks and on-page-seo maybe? 
// 