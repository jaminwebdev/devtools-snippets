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
  const stats = {
    'Title Length': title ? title.textContent.length : 0,
    'Meta Description Length': metaDesc ? metaDesc.content.length : 0,
    'H1 Count': h1s.length,
    'Images': document.images.length,
    'Images with Alt': document.images.length - imagesNoAlt.length,
    'Images without Alt': imagesNoAlt.length,
    'Internal Links': internalLinks.length,
    'External Links': [...document.querySelectorAll('a[href]')].filter(a => a.hostname !== location.hostname).length
  };
  console.table(stats);

  // Visual overlay
  const overlay = document.createElement('div');
  overlay.innerHTML = `
    <div style="position:fixed;top:24px;right:24px;background:#181c24;color:#fff;padding:22px 28px 18px 28px;border-radius:10px;z-index:999999;max-width:420px;font-family:monospace;font-size:14px;box-shadow:0 2px 16px rgba(0,0,0,0.18);">
      <h3 style="margin:0 0 12px 0;color:#4CAF50;font-size:18px;">SEO Audit</h3>
      <div style="margin-bottom:8px;"><strong>Issues (${issues.length}):</strong></div>
      ${issues.length > 0 ? issues.map(issue => `<div style=\"color:#ff6b6b;margin-bottom:2px;\">• ${issue}</div>`).join('') : '<div style="color:#4CAF50;">No major SEO issues detected</div>'}
      <div style="margin:14px 0 6px 0;"><strong>Stats:</strong></div>
      <table style="width:100%;font-size:13px;margin-bottom:8px; background: #181c24;">
        ${Object.entries(stats).map(([k,v]) => `<tr style=\"background:#181c24;\"><td style=\"color:#aaa;padding-right:8px;\">${k}</td><td style=\"color:#fff;font-weight:bold;text-align:right;\">${v}</td></tr>`).join('')}
      </table>
      <button onclick="this.parentElement.parentElement.remove()" style="margin-top:6px;background:#333;border:none;color:#fff;padding:6px 16px;border-radius:5px;cursor:pointer;font-size:13px;">Close</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Close overlay on Escape
  function seoOverlayEscListener(e) {
    if (e.key === 'Escape' && overlay.parentElement) {
      overlay.remove();
      window.removeEventListener('keydown', seoOverlayEscListener, true);
    }
  }
  window.addEventListener('keydown', seoOverlayEscListener, true);
})();