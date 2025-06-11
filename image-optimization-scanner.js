(() => {
  const images = document.querySelectorAll('img');
  const issues = [];
  const recommendations = [];
  
  images.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    
    // Check for oversized images
    if (naturalWidth > displayWidth * 2 || naturalHeight > displayHeight * 2) {
      img.style.outline = '3px solid red';
      issues.push(`Image ${index + 1}: Oversized (${naturalWidth}x${naturalHeight} displayed as ${Math.round(displayWidth)}x${Math.round(displayHeight)})`);
    }
    
    // Check for missing alt text
    if (!img.alt || img.alt.trim() === '') {
      img.style.outline = '2px dashed orange';
      issues.push(`Image ${index + 1}: Missing alt text`);
    }
    
    // Check for missing lazy loading
    if (!img.loading && rect.top > window.innerHeight) {
      recommendations.push(`Image ${index + 1}: Consider lazy loading`);
    }
    
    // Check for old formats
    const src = img.src || img.currentSrc;
    if (src && (src.includes('.jpg') || src.includes('.png')) && !src.includes('.webp')) {
      recommendations.push(`Image ${index + 1}: Consider modern formats (WebP/AVIF)`);
    }
    
    // Estimate file size impact
    const pixelCount = naturalWidth * naturalHeight;
    const estimatedSize = pixelCount * 3; // Rough estimate for uncompressed
    if (estimatedSize > 1000000) { // > 1MB estimated
      console.warn(`📸 Large image detected: ${img.src} (estimated ${(estimatedSize / 1024 / 1024).toFixed(1)}MB)`);
    }
  });
  
  console.group('📸 Image Optimization Report');
  console.log(`Total images: ${images.length}`);
  console.log(`Issues found: ${issues.length}`);
  console.log(`Recommendations: ${recommendations.length}`);
  
  if (issues.length > 0) {
    console.warn('🔴 Issues:', issues);
  }
  
  if (recommendations.length > 0) {
    console.log('💡 Recommendations:', recommendations);
  }
  
  console.groupEnd();
  
  // Create visual summary
  const summary = document.createElement('div');
  summary.innerHTML = `
    <div style="position:fixed;bottom:20px;right:20px;background:#333;color:#fff;padding:15px;border-radius:8px;z-index:999999;font-family:monospace;font-size:12px;">
      <h4 style="margin:0 0 10px 0;">📸 Image Report</h4>
      <div>Total: ${images.length}</div>
      <div style="color:#ff6b6b;">Issues: ${issues.length}</div>
      <div style="color:#ffd93d;">Recommendations: ${recommendations.length}</div>
      <button onclick="this.parentElement.remove()" style="margin-top:10px;background:#666;border:none;color:#fff;padding:5px;border-radius:4px;">×</button>
    </div>
  `;
  document.body.appendChild(summary);
})();