(() => {
  const requests = [];
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      if (entry.entryType === 'resource') {
        requests.push({
          name: entry.name,
          type: entry.initiatorType,
          size: entry.transferSize,
          duration: entry.duration,
          status: entry.responseStatus
        });
        
        // Flag large resources
        if (entry.transferSize > 500000) { // > 500KB
          console.warn(`📦 Large resource: ${entry.name} (${(entry.transferSize / 1024).toFixed(2)}KB)`);
        }
        
        // Flag slow requests
        if (entry.duration > 1000) { // > 1s
          console.warn(`🐌 Slow request: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
        }
      }
    });
  });
  
  observer.observe({entryTypes: ['resource']});
  
  // Intercept fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const start = performance.now();
    return originalFetch.apply(this, args).then(response => {
      const duration = performance.now() - start;
      console.log(`🌐 Fetch: ${args[0]} - ${response.status} (${duration.toFixed(2)}ms)`);
      return response;
    }).catch(error => {
      console.error(`❌ Fetch failed: ${args[0]}`, error);
      throw error;
    });
  };
  
  // Summary function
  window.getNetworkSummary = () => {
    const totalSize = requests.reduce((sum, req) => sum + (req.size || 0), 0);
    const totalRequests = requests.length;
    const slowRequests = requests.filter(req => req.duration > 1000);
    const largeRequests = requests.filter(req => req.size > 500000);
    
    console.group('🌐 Network Summary');
    console.log(`Total requests: ${totalRequests}`);
    console.log(`Total transferred: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Slow requests (>1s): ${slowRequests.length}`);
    console.log(`Large requests (>500KB): ${largeRequests.length}`);
    console.groupEnd();
    
    return {totalRequests, totalSize, slowRequests, largeRequests};
  };
  
  console.log('🔍 Network monitoring started. Use getNetworkSummary() for overview.');
})();