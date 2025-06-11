(function() {

  const WEIGHTS = {
    content: 17,
    title: 11,
    links: 12,
    speed: 12,
    headings: 8,
    meta: 6,
    images: 7,
    url: 5,
    schema: 8,
    crawlability: 5,
    canonical: 3,
    ux: 6,
    security: 2,
    indexability: 8
  };

  // --- Keyword helpers ---
  function getKeywords() {
    const input = document.getElementById('__seoKeywordInput');
    let val = '';
    if (input) {
      val = input.value;
    } else if (window.__seoLastKeywords) {
      val = window.__seoLastKeywords;
    }
    return val.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
  }
  function keywordDensity(text, keyword) {
    const words = text.toLowerCase().split(/\s+/);
    const count = words.filter(w => w === keyword.toLowerCase()).length;
    return words.length ? (count / words.length) * 100 : 0;
  }
  function keywordPresent(text, keyword) {
    return text.toLowerCase().includes(keyword.toLowerCase());
  }

  function checkContent(keywords) {
    const text = document.body.innerText || '';
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    function fleschReadingEase(text) {
      const sentences = text.split(/[.!?]+/).filter(Boolean).length;
      const words = text.split(/\s+/).filter(Boolean).length;
      const syllables = text.split(/\b[aeiouy]+/gi).length - 1;
      if (!sentences || !words) return 0;
      return Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words));
    }
    function avgSentenceLength(text) {
      const sentences = text.split(/[.!?]+/).filter(Boolean);
      const words = text.split(/\s+/).filter(Boolean);
      return sentences.length ? (words.length / sentences.length) : 0;
    }
    const flesch = fleschReadingEase(text);
    const avgSentLen = avgSentenceLength(text);
    let score = 100, issues = [];
    if (wordCount < 500) {
      score -= 60;
      issues.push('Low word count (<500)');
    } else if (wordCount < 1200) {
      score -= 20;
      issues.push('Word count could be higher for in-depth content');
    }
    if (flesch < 50) {
      score -= 20;
      issues.push('Content is hard to read (Flesch score < 50)');
    } else if (flesch < 60) {
      score -= 10;
      issues.push('Content could be easier to read (Flesch score < 60)');
    }
    if (avgSentLen > 20) {
      score -= 10;
      issues.push('Average sentence is long (>20 words)');
    }
    // Keyword checks
    let keywordStats = [];
    if (keywords.length) {
      keywords.forEach(kw => {
        const present = keywordPresent(text, kw);
        const density = keywordDensity(text, kw);
        keywordStats.push({ keyword: kw, present, density: density.toFixed(2) });
        if (!present) {
          score -= 10;
          issues.push(`Keyword "${kw}" not found in content`);
        } else if (density < 0.5) {
          score -= 5;
          issues.push(`Keyword "${kw}" density is low (${density.toFixed(2)}%)`);
        } else if (density > 3) {
          score -= 5;
          issues.push(`Keyword "${kw}" density is high (${density.toFixed(2)}%)`);
        }
      });
    }
    return { label: 'Content', score: Math.max(0, score), issues, details: { 'Word Count': wordCount, 'Flesch Reading Ease': flesch, 'Avg Sentence Length': avgSentLen.toFixed(1), 'Keywords': keywordStats } };
  }

  function checkTitle(keywords) {
    const title = document.querySelector('title');
    let score = 100, issues = [], len = 0, keywordStats = [];
    if (!title) {
      score = 0;
      issues.push('Missing <title> tag');
    } else {
      len = title.textContent.length;
      if (len < 50) { score -= 30; issues.push('Title too short (<50 chars)'); }
      if (len > 60) { score -= 30; issues.push('Title too long (>60 chars)'); }
      // Keyword check
      if (keywords.length) {
        keywords.forEach(kw => {
          const present = keywordPresent(title.textContent, kw);
          keywordStats.push({ keyword: kw, present });
          if (!present) {
            score -= 10;
            issues.push(`Keyword "${kw}" not found in title`);
          }
        });
      }
    }
    return { label: 'Page Title', score: Math.max(0, score), issues, details: { 'Title Length': len, 'Keywords': keywordStats } };
  }

  function checkMeta(keywords) {
    const metaDesc = document.querySelector('meta[name="description"]');
    let score = 100, issues = [], len = 0, keywordStats = [];
    if (!metaDesc) {
      score = 0;
      issues.push('Meta description missing');
    } else {
      len = metaDesc.content.length;
      if (len < 120) { score -= 40; issues.push('Meta description too short (<120 chars)'); }
      if (len > 155) { score -= 20; issues.push('Meta description too long (>155 chars)'); }
      // Keyword check
      if (keywords.length) {
        keywords.forEach(kw => {
          const present = keywordPresent(metaDesc.content, kw);
          keywordStats.push({ keyword: kw, present });
          if (!present) {
            score -= 10;
            issues.push(`Keyword "${kw}" not found in meta description`);
          }
        });
      }
    }
    return { label: 'Meta Description', score: Math.max(0, score), issues, details: { 'Meta Description Length': len, 'Keywords': keywordStats } };
  }

  function checkHeadings(keywords) {
    const h1s = document.querySelectorAll('h1');
    let score = 100, issues = [], keywordStats = [];
    if (h1s.length === 0) { score -= 60; issues.push('No H1 tag found'); }
    if (h1s.length > 1) { score -= 40; issues.push('Multiple H1 tags found'); }
    // Keyword check
    if (keywords.length) {
      keywords.forEach(kw => {
        let found = false;
        h1s.forEach(h1 => { if (keywordPresent(h1.textContent, kw)) found = true; });
        keywordStats.push({ keyword: kw, present: found });
        if (!found) {
          score -= 10;
          issues.push(`Keyword "${kw}" not found in any H1`);
        }
      });
    }
    return { label: 'Headings', score: Math.max(0, score), issues, details: { 'H1 Count': h1s.length, 'Keywords': keywordStats } };
  }

  function checkImages() {
    const imgs = [...document.querySelectorAll('img')];
    const noAlt = imgs.filter(img => !img.alt);
    let score = 100, issues = [];
    if (noAlt.length > 0) {
      score -= Math.min(60, Math.round((noAlt.length / imgs.length) * 100));
      issues.push(`${noAlt.length} images without alt text`);
    }
    return { label: 'Images', score: Math.max(0, score), issues, details: { 'Images': imgs.length, 'Images without Alt': noAlt.length } };
  }

  async function checkLinks() {
    const allLinks = [...document.querySelectorAll('a[href]')].map(a => a.href).filter(href => href && (href.startsWith('http://') || href.startsWith('https://')));
    const internal = allLinks.filter(a => {
      try { return new URL(a).hostname === location.hostname; } catch { return false; }
    });
    const external = allLinks.filter(a => {
      try { return new URL(a).hostname !== location.hostname; } catch { return false; }
    });
    let score = 100, issues = [];

    if (internal.length < 3) { score -= 20; issues.push('Very few internal links (<3)'); }

    const brokenLinks = [];
    // Note: Checking external links with fetch() is often blocked by CORS policies.
    // This will primarily reliably check internal links or external links with permissive CORS.
    for (const link of allLinks) {
      try {
        const response = await fetch(link, { method: 'HEAD', mode: 'no-cors' }); // Use HEAD request to be faster, no-cors to avoid immediate blocking
        // For no-cors, status will be 0 and ok will be false if blocked or error
        // For internal links, response.ok will be true for 2xx statuses.
        if (!response.ok && response.status !== 0) { 
          brokenLinks.push(link);
        }
      } catch (e) {
        brokenLinks.push(link); // Network error, likely broken
      }
    }
    if (brokenLinks.length > 0) {
      score -= Math.min(60, Math.round((brokenLinks.length / allLinks.length) * 100));
      issues.push(`${brokenLinks.length} broken links found: ${brokenLinks.join(', ')}`);
    }

    return { label: 'Links', score: Math.max(0, score), issues, details: { 'Total Links': allLinks.length, 'Internal Links': internal.length, 'External Links': external.length, 'Broken Links': brokenLinks.length } };
  }

  // --- Stubs for other sections ---
  function stubSection(label) { return { label, score: 100, issues: [], details: {} }; }
  const checkSpeed = () => stubSection('Page Speed');
  const checkURL = () => stubSection('URL Structure');
  const checkSchema = () => stubSection('Structured Data & Schema');
  const checkCanonical = () => stubSection('Canonical Tag');
  const checkCrawlability = () => stubSection('Crawlability');
  const checkUX = () => stubSection('UX Signals');
  const checkSecurity = () => stubSection('Security');

  function checkIndexability() {
    const robotsMeta = document.querySelector('meta[name="robots"]');
    let score = 100;
    let issues = [];
    let details = { 'Robots Meta Tag': 'Not found or indexable' };

    if (robotsMeta) {
      const content = robotsMeta.content.toLowerCase();
      if (content.includes('noindex') || content.includes('none')) {
        score = 0;
        issues.push('Page is explicitly blocked from indexing by meta robots tag (noindex/none)');
        details['Robots Meta Tag'] = `Found: ${robotsMeta.content}`;
      }
    }
    return { label: 'Indexability', score, issues, details };
  }

  // --- Run all checks ---
  async function runAudit() {
    const keywords = getKeywords();
    const sections = await Promise.all([
      { key: 'content', ...checkContent(keywords) },
      { key: 'title', ...checkTitle(keywords) },
      { key: 'meta', ...checkMeta(keywords) },
      { key: 'headings', ...checkHeadings(keywords) },
      { key: 'images', ...checkImages() },
      { key: 'links', ...(await checkLinks()) },
      { key: 'speed', ...checkSpeed() },
      { key: 'url', ...checkURL() },
      { key: 'schema', ...checkSchema() },
      { key: 'crawlability', ...checkCrawlability() },
      { key: 'canonical', ...checkCanonical() },
      { key: 'ux', ...checkUX() },
      { key: 'security', ...checkSecurity() },
      { key: 'indexability', ...checkIndexability() }
    ]);

    // --- Calculate weighted score ---
    let totalScore = 0;
    let maxScore = 0;
    sections.forEach(s => {
      totalScore += (s.score * WEIGHTS[s.key]);
      maxScore += (100 * WEIGHTS[s.key]);
    });
    const finalScore = Math.round((totalScore / maxScore) * 100);

    // --- Gather all issues ---
    const allIssues = sections.flatMap(s => s.issues.map(issue => ({ section: s.label, issue })));

    return { sections, finalScore, allIssues }; // Return all relevant data
  }

  // --- Overlay ---
  let currentSeoOverlayEscListener = null; // Store the listener for cleanup

  async function renderOverlay(auditResults, existingOverlayElement = null) {
    // Remove any existing overlay first if it's not the one we're reusing
    if (!existingOverlayElement) {
      const old = document.getElementById('__seoOverlay');
      if (old) old.remove();
    }

    const { sections, finalScore, allIssues } = auditResults;

    const overlay = existingOverlayElement || document.createElement('div');
    overlay.id = '__seoOverlay';

    // Apply common overlay styles, overwriting any loading styles if reusing
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '24px',
      right: '24px',
      left: 'auto',
      bottom: 'auto',
      background: '#181c24',
      color: '#fff',
      padding: '22px 28px 18px 28px',
      borderRadius: '10px',
      zIndex: 999999,
      maxWidth: '480px',
      maxHeight: '90vh',
      overflowY: 'auto',
      fontFamily: 'monospace',
      fontSize: '14px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
      // Reset flex properties from loading overlay and explicitly set initial position
      display: '',
      justifyContent: '',
      alignItems: '',
      flexDirection: '',
      visibility: 'hidden', // Start hidden to prevent flicker
      opacity: '0', // Start invisible to prevent flicker
      transition: 'opacity 0.2s ease-in-out', // Add a fade-in effect
      top: '24px', // Initial top position
      right: '24px', // Initial right position
      left: 'auto', // Ensure left is auto for right positioning
      bottom: 'auto', // Ensure bottom is auto
    });

    // Remove any existing overlay first if it's not the one we're reusing
    if (!existingOverlayElement) {
      const old = document.getElementById('__seoOverlay');
      if (old) old.remove();
      document.body.appendChild(overlay);
    }

    // Use requestAnimationFrame to ensure visibility is set after layout
    requestAnimationFrame(() => {
      overlay.style.visibility = 'visible';
      overlay.style.opacity = '1';
    });

    // Make the overlay draggable
    let isDragging = false;
    let initialMouseX, initialMouseY;
    let initialOverlayX, initialOverlayY;

    overlay.addEventListener('mousedown', (e) => {
      if (e.target === overlay || (overlay.contains(e.target) && !e.target.closest('button, input'))) {
        isDragging = true;
        initialMouseX = e.clientX;
        initialMouseY = e.clientY;

        // Convert right/top positioning to left/top at the start of drag
        // This prevents the jump if the element was initially positioned with 'right'.
        const currentRect = overlay.getBoundingClientRect();
        overlay.style.left = currentRect.left + 'px';
        overlay.style.top = currentRect.top + 'px';
        overlay.style.right = 'auto'; // Remove right property once left is set
        overlay.style.bottom = 'auto'; // Remove bottom property once top is set

        initialOverlayX = currentRect.left;
        initialOverlayY = currentRect.top;

        overlay.style.cursor = 'grabbing';
        document.addEventListener('mousemove', dragMouseMove);
        document.addEventListener('mouseup', dragMouseUp);
      }
    });

    const dragMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - initialMouseX;
      const dy = e.clientY - initialMouseY;
      overlay.style.left = (initialOverlayX + dx) + 'px';
      overlay.style.top = (initialOverlayY + dy) + 'px';
    };

    const dragMouseUp = () => {
      isDragging = false;
      overlay.style.cursor = 'grab';
      document.removeEventListener('mousemove', dragMouseMove);
      document.removeEventListener('mouseup', dragMouseUp);
    };

    // Set initial cursor style
    overlay.style.cursor = 'grab';

    overlay.innerHTML = `
      <style>
        #__seoKeywordInput::selection {
          background: #00e0ff; /* Light blue background for selection */
          color: #181c24; /* Dark text for contrast */
        }
      </style>
      <div style="width:100%; height:100%;">
        <h3 style="margin:0 0 12px 0;color:#4CAF50;font-size:18px;">SEO Audit</h3>
        <div style="margin-bottom:10px;">
          <label for="__seoKeywordInput"><b>Keywords (comma separated):</b></label>
          <input id="__seoKeywordInput" type="text" style="width:100%;margin-top:4px;margin-bottom:0;padding:6px 10px;border-radius:6px;border:1.5px solid #00e0ff;font-size:15px;background:#222;color:#fff;" placeholder="e.g. seo, audit, ranking" value="${window.__seoLastKeywords || ''}" />
          <button id="__seoKeywordApply" style="margin-top:6px;background:#00e0ff;border:none;color:#222;padding:6px 16px;border-radius:5px;cursor:pointer;font-size:13px;float:right;">Apply</button>
        </div>
        <div style="font-size:16px;margin-bottom:10px;"><b>Total SEO Score:</b> <span style="color:${finalScore >= 80 ? '#4CAF50' : finalScore >= 60 ? '#ffd93d' : '#ff6b6b'};font-size:20px;">${finalScore}</span>/100</div>
        <div style=\"margin-bottom:10px;\"><strong>Issues & Warnings:</strong></div>
        <div style=\"margin-bottom:12px;\">
          ${allIssues.length > 0 ? `<ul style=\"padding-left:18px;margin:0;\">${allIssues.map(i => `<li style=\"color:#ff6b6b;margin-bottom:2px;\"><b>${i.section}:</b> ${i.issue}</li>`).join('')}</ul>` : '<div style=\"color:#4CAF50;\">No major SEO issues detected</div>'}
        </div>
        <div style="margin-bottom:10px;"><b>Section Scores:</b></div>
        <table style="width:100%;font-size:13px;margin-bottom:8px;background:#181c24;">
          ${sections.map(s => `<tr style=\"background:#181c24;\"><td style=\"color:#aaa;padding-right:8px;\">${s.label}</td><td style=\"color:#fff;font-weight:bold;text-align:right;\">${s.score}</td></tr>`).join('')}
        </table>
        <button onclick="this.parentElement.parentElement.remove()" style="margin-top:6px;background:#333;border:none;color:#fff;padding:6px 16px;border-radius:5px;cursor:pointer;font-size:13px;">Close</button>
      </div>
    `;
    if (!existingOverlayElement) {
      document.body.appendChild(overlay);
    }

    // Keyword apply logic
    const apply = async function() {
      const val = overlay.querySelector('#__seoKeywordInput').value;
      window.__seoLastKeywords = val;

      // Remove the current overlay before showing loading state and re-auditing
      overlay.remove();

      // Show loading state while re-auditing
      const loading = showLoadingOverlay();

      const newAuditResults = await runAudit();
      loading.remove(); // Remove loading overlay

      // Render the new audit results. It will create a new overlay in the default position.
      renderOverlay(newAuditResults);
    };
    overlay.querySelector('#__seoKeywordApply').onclick = apply;
    overlay.querySelector('#__seoKeywordInput').onkeydown = function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        apply();
      }
    };

    // Close overlay on Escape (manage the listener for this specific overlay)
    if (currentSeoOverlayEscListener) {
      window.removeEventListener('keydown', currentSeoOverlayEscListener, true);
    }
    const newEscListener = function(e) {
      if (e.key === 'Escape' && overlay.parentElement) {
        overlay.remove();
        window.removeEventListener('keydown', newEscListener, true);
        currentSeoOverlayEscListener = null; // Clear global reference
      }
    };
    window.addEventListener('keydown', newEscListener, true);
    currentSeoOverlayEscListener = newEscListener; // Store global reference
  }

  // --- Initial Load Logic ---
  function showLoadingOverlay() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = '__seoLoadingOverlay';
    Object.assign(loadingOverlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.7)',
      zIndex: 1000000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      fontFamily: 'monospace',
      color: '#fff',
    });
    loadingOverlay.innerHTML = `
      <div style="font-size:24px;margin-bottom:15px;">Performing SEO Analysis...</div>
      <div style="border: 4px solid #f3f3f3; border-top: 4px solid #00e0ff; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite;"></div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;
    document.body.appendChild(loadingOverlay);
    return loadingOverlay;
  }

  // --- Run and render ---
  (async () => {
    // Ensure any previous instances are cleaned up, including their event listeners
    if (window.__seoCleanup) window.__seoCleanup(); 

    const loadingOverlayElement = showLoadingOverlay();
    const auditResults = await runAudit();
    
    // Remove the loading overlay completely before rendering the main overlay
    if (loadingOverlayElement) {
      loadingOverlayElement.remove();
    }

    // Now render the main overlay. No existing element passed, so it will create a new one.
    renderOverlay(auditResults);
  })();

  // Add global cleanup for the entire script
  window.__seoCleanup = () => {
    const existingOverlay = document.getElementById('__seoOverlay');
    if (existingOverlay) existingOverlay.remove();
    const existingLoading = document.getElementById('__seoLoadingOverlay');
    if (existingLoading) existingLoading.remove();
    // Ensure the escape listener is also removed if active
    if (currentSeoOverlayEscListener) {
      window.removeEventListener('keydown', currentSeoOverlayEscListener, true);
      currentSeoOverlayEscListener = null;
    }
  };
})();
