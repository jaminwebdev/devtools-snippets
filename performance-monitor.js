(function() {
  let monitoring = true;
  const startTime = performance.now();
  let frameCount = 0;
  let lastFrameTime = startTime;
  
  const display = document.createElement('div');
  display.style.cssText = 'position:fixed;top:10px;left:10px;background:rgba(0,0,0,0.8);color:lime;padding:10px;font:12px monospace;z-index:99999;border-radius:5px;';
  document.body.appendChild(display);
  
  function updateMetrics() {
    if (!monitoring) return;
    
    frameCount++;
    const now = performance.now();
    const fps = Math.round(1000 / (now - lastFrameTime));
    lastFrameTime = now;
    
    const memory = performance.memory ? 
      `${(performance.memory.usedJSHeapSize / 1048576).toFixed(1)}MB` : 'N/A';
    
    display.innerHTML = `
      FPS: ${fps}<br>
      Memory: ${memory}<br>
      Runtime: ${((now - startTime) / 1000).toFixed(1)}s<br>
      <small>ESC to stop</small>
    `;
    
    requestAnimationFrame(updateMetrics);
  }
  
  function stopMonitoring(e) {
    if (e.key === 'Escape') {
      monitoring = false;
      display.remove();
      document.removeEventListener('keydown', stopMonitoring);
      console.log('Performance monitoring stopped');
    }
  }
  
  document.addEventListener('keydown', stopMonitoring);
  requestAnimationFrame(updateMetrics);
  console.log('Performance monitor started - ESC to stop');
})();