(function() {
  const resources = performance.getEntriesByType('resource');
  const analysis = resources.reduce((acc, resource) => {
    const type = resource.initiatorType || 'other';
    if (!acc[type]) acc[type] = { count: 0, totalSize: 0, avgTime: 0 };
    
    acc[type].count++;
    acc[type].totalSize += resource.transferSize || 0;
    acc[type].avgTime += resource.duration;
    
    return acc;
  }, {});
  
  Object.keys(analysis).forEach(type => {
    analysis[type].avgTime = (analysis[type].avgTime / analysis[type].count).toFixed(2) + 'ms';
    analysis[type].totalSize = (analysis[type].totalSize / 1024).toFixed(2) + 'KB';
  });
  
  console.table(analysis);
})();