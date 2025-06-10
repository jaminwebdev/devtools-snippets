(function() {
  const perf = performance.getEntriesByType('navigation')[0];
  if (perf) {
    console.table({
      'DNS Lookup': `${(perf.domainLookupEnd - perf.domainLookupStart).toFixed(2)}ms`,
      'TCP Connect': `${(perf.connectEnd - perf.connectStart).toFixed(2)}ms`,
      'Request': `${(perf.responseStart - perf.requestStart).toFixed(2)}ms`,
      'Response': `${(perf.responseEnd - perf.responseStart).toFixed(2)}ms`,
      'DOM Load': `${(perf.domContentLoadedEventEnd - perf.fetchStart).toFixed(2)}ms`,
      'Full Load': `${(perf.loadEventEnd - perf.fetchStart).toFixed(2)}ms`
    });
  }
})();