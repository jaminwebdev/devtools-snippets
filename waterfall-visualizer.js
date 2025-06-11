(function() {
  const resources = performance.getEntriesByType('resource');
  const navigation = performance.getEntriesByType('navigation')[0];
  
  console.log('Page Load Waterfall:');
  console.log('═'.repeat(80));
  
  // Sort by start time
  const sortedResources = resources.sort((a, b) => a.startTime - b.startTime);
  
  sortedResources.forEach(resource => {
    const name = resource.name.split('/').pop().substring(0, 30);
    const startTime = resource.startTime.toFixed(0);
    const duration = resource.duration.toFixed(0);
    const size = resource.transferSize ? (resource.transferSize / 1024).toFixed(1) + 'KB' : 'N/A';
    
    // Create simple visual bar
    const barLength = Math.min(Math.floor(resource.duration / 10), 40);
    const bar = '█'.repeat(barLength) + '░'.repeat(Math.max(0, 10 - barLength));
    
    console.log(`${startTime.padStart(6)}ms ${bar} ${name.padEnd(32)} ${duration.padStart(6)}ms ${size.padStart(8)}`);
  });
  
  console.log('═'.repeat(80));
  console.log(`Total resources: ${resources.length}`);
  console.log(`Page load time: ${navigation.loadEventEnd.toFixed(0)}ms`);
})();

// todo
// order by largest to smallest time