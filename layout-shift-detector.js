(() => {
  let cumulativeLayoutShift = 0;
  const shiftElements = [];
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        cumulativeLayoutShift += entry.value;
        
        // Highlight shifting elements
        entry.sources?.forEach(source => {
          if (source.node) {
            source.node.style.outline = '3px solid red';
            source.node.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
            shiftElements.push({
              element: source.node,
              shift: entry.value,
              time: entry.startTime
            });
            
            setTimeout(() => {
              source.node.style.outline = '';
              source.node.style.backgroundColor = '';
            }, 2000);
          }
        });
        
        console.warn(`📐 Layout shift detected: ${entry.value.toFixed(4)} (CLS: ${cumulativeLayoutShift.toFixed(4)})`);
      }
    }
  });
  
  observer.observe({entryTypes: ['layout-shift']});
  
  // Monitor for common CLS causes
  const imageObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.tagName === 'IMG' && (!node.width || !node.height)) {
          console.warn('⚠️ Image without dimensions added (potential CLS cause):', node);
        }
      });
    });
  });
  
  imageObserver.observe(document, {childList: true, subtree: true});
  
  // Check existing images
  document.querySelectorAll('img').forEach(img => {
    if (!img.width || !img.height) {
      img.style.outline = '2px dashed orange';
      console.warn('⚠️ Image without dimensions:', img);
    }
  });
  
  console.log('📐 Layout shift monitoring started. Shifting elements will be highlighted in red.');
  
  // Summary function
  window.getCLSReport = () => {
    console.group('📐 Cumulative Layout Shift Report');
    console.log(`Total CLS: ${cumulativeLayoutShift.toFixed(4)}`);
    console.log(`Shifting elements: ${shiftElements.length}`);
    console.log('Rating:', cumulativeLayoutShift < 0.1 ? '✅ Good' : cumulativeLayoutShift < 0.25 ? '⚠️ Needs Improvement' : '❌ Poor');
    console.groupEnd();
    return {cls: cumulativeLayoutShift, elements: shiftElements};
  };
})();