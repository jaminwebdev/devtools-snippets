(function() {
  const issues = [];
  const resources = performance.getEntriesByType('resource');
  
  // Large resources
  const largeResources = resources.filter(r => r.transferSize > 500 * 1024);
  if (largeResources.length > 0) {
    issues.push(`${largeResources.length} resources over 500KB`);
  }
  
  // Slow resources
  const slowResources = resources.filter(r => r.duration > 1000);
  if (slowResources.length > 0) {
    issues.push(`${slowResources.length} resources taking over 1 second`);
  }
  
  // Too many requests
  if (resources.length > 100) {
    issues.push(`High request count: ${resources.length} resources`);
  }
  
  // DOM size
  const domSize = document.querySelectorAll('*').length;
  if (domSize > 1500) {
    issues.push(`Large DOM: ${domSize} elements`);
  }
  
  // Images without dimensions
  const imagesNoDimensions = [...document.querySelectorAll('img')].filter(img => 
    !img.width || !img.height
  );
  if (imagesNoDimensions.length > 0) {
    issues.push(`${imagesNoDimensions.length} images without dimensions (CLS risk)`);
  }
  
  console.log('Performance Bottleneck Analysis:');
  if (issues.length > 0) {
    console.warn('Issues found:');
    issues.forEach(issue => console.warn('⚠️ ' + issue));
  } else {
    console.log('✅ No major performance issues detected');
  }
  
  // Show worst offenders
  const worstResources = resources
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5)
    .map(r => ({
      name: r.name.split('/').pop(),
      duration: r.duration.toFixed(0) + 'ms',
      size: r.transferSize ? (r.transferSize / 1024).toFixed(1) + 'KB' : 'N/A'
    }));
  
  console.log('\nSlowest resources:');
  console.table(worstResources);
})();

// combine with
// (() => {
//   const startTime = performance.now();
//   const observer = new PerformanceObserver((list) => {
//     const entries = list.getEntries();
//     entries.forEach(entry => {
//       if (entry.duration > 50) {
//         console.warn(`🐌 Slow operation detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
//       }
//     });
//   });
  
//   observer.observe({entryTypes: ['measure', 'navigation', 'resource']});
  
//   // Monitor DOM mutations
//   const mutationObserver = new MutationObserver((mutations) => {
//     if (mutations.length > 10) {
//       console.warn(`🔄 Heavy DOM mutations: ${mutations.length} changes in one batch`);
//     }
//   });
  
//   mutationObserver.observe(document, {
//     childList: true,
//     subtree: true,
//     attributes: true
//   });
  
//   // Check for memory leaks
//   setInterval(() => {
//     if (performance.memory && performance.memory.usedJSHeapSize > 50000000) {
//       console.warn(`🧠 High memory usage: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
//     }
//   }, 5000);
  
//   console.log('🚀 Performance monitoring started. Check console for bottlenecks.');
// })();