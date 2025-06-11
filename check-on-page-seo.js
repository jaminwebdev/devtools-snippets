(function() {
  const issues = [];
  
  // Title
  const title = document.querySelector('title');
  if (!title || title.textContent.length < 30) {
    issues.push('Title missing or too short (< 30 chars)');
  }
  if (title && title.textContent.length > 60) {
    issues.push('Title too long (> 60 chars)');
  }
  
  // Meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    issues.push('Meta description missing');
  } else if (metaDesc.content.length < 120) {
    issues.push('Meta description too short (< 120 chars)');
  }
  
  // H1 tags
  const h1s = document.querySelectorAll('h1');
  if (h1s.length === 0) issues.push('No H1 tag found');
  if (h1s.length > 1) issues.push('Multiple H1 tags found');
  
  // Images without alt
  const imagesNoAlt = [...document.querySelectorAll('img')].filter(img => !img.alt);
  if (imagesNoAlt.length > 0) {
    issues.push(`${imagesNoAlt.length} images without alt text`);
  }
  
  // Internal links
  const internalLinks = [...document.querySelectorAll('a[href]')].filter(a => 
    a.hostname === location.hostname
  );
  if (internalLinks.length < 3) {
    issues.push('Very few internal links (< 3)');
  }
  
  console.log('SEO Quick Audit:');
  if (issues.length > 0) {
    console.warn('Issues found:');
    issues.forEach(issue => console.warn('- ' + issue));
  } else {
    console.log('✅ No major SEO issues detected');
  }
  
  // Basic stats
  console.table({
    'Title Length': title ? title.textContent.length : 0,
    'Meta Description Length': metaDesc ? metaDesc.content.length : 0,
    'H1 Count': h1s.length,
    'Images': document.images.length,
    'Images with Alt': document.images.length - imagesNoAlt.length,
    'Internal Links': internalLinks.length,
    'External Links': [...document.querySelectorAll('a[href]')].filter(a => a.hostname !== location.hostname).length
  });
})();

// expand on this greatly
// add visual overlay
  // Visual overlay
  // const overlay = document.createElement('div');
  // overlay.innerHTML = `
  //   <div style="position:fixed;top:20px;right:20px;background:#000;color:#fff;padding:20px;border-radius:8px;z-index:999999;max-width:400px;font-family:monospace;font-size:12px;">
  //     <h3 style="margin:0 0 10px 0;color:#4CAF50;">SEO Audit</h3>
  //     <div><strong>Issues (${issues.length}):</strong></div>
  //     ${issues.map(issue => `<div style="color:#ff6b6b;">• ${issue}</div>`).join('')}
  //     <div style="margin-top:10px;"><strong>Warnings (${warnings.length}):</strong></div>
  //     ${warnings.map(warning => `<div style="color:#ffd93d;">• ${warning}</div>`).join('')}
  //     <button onclick="this.parentElement.parentElement.remove()" style="margin-top:10px;background:#666;border:none;color:#fff;padding:5px 10px;border-radius:4px;cursor:pointer;">Close</button>
  //   </div>
  // `;
  // document.body.appendChild(overlay);