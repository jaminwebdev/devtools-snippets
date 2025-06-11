(function() {

  const WEIGHTS = {
    content: 18,
    title: 12,
    links: 13,
    speed: 13,
    headings: 9,
    meta: 7,
    images: 8,
    url: 6,
    schema: 8,
    index: 5,
    canonical: 3,
    ux: 6,
    security: 2
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
    // (Stub: check file sizes, formats)
    return { label: 'Images', score: Math.max(0, score), issues, details: { 'Images': imgs.length, 'Images without Alt': noAlt.length } };
  }

  function checkLinks() {
    const allLinks = [...document.querySelectorAll('a[href]')];
    const internal = allLinks.filter(a => a.hostname === location.hostname);
    const external = allLinks.filter(a => a.hostname !== location.hostname);
    let score = 100, issues = [];
    if (internal.length < 3) { score -= 40; issues.push('Very few internal links (<3)'); }
    // (Stub: check for broken links, anchor diversity, nofollow/dofollow, trust links)
    return { label: 'Links', score: Math.max(0, score), issues, details: { 'Internal Links': internal.length, 'External Links': external.length } };
  }

  // --- Stubs for other sections ---
  function stubSection(label) { return { label, score: 100, issues: [], details: {} }; }
  const checkSpeed = () => stubSection('Page Speed');
  const checkURL = () => stubSection('URL Structure');
  const checkSchema = () => stubSection('Structured Data & Schema');
  const checkCanonical = () => stubSection('Canonical Tag');
  const checkIndex = () => stubSection('Indexability & Crawlability');
  const checkUX = () => stubSection('UX Signals');
  const checkSecurity = () => stubSection('Security');

  // --- Run all checks ---
  function runAudit() {
    const keywords = getKeywords();
    const sections = [
      { key: 'content', ...checkContent(keywords) },
      { key: 'title', ...checkTitle(keywords) },
      { key: 'meta', ...checkMeta(keywords) },
      { key: 'headings', ...checkHeadings(keywords) },
      { key: 'images', ...checkImages() },
      { key: 'links', ...checkLinks() },
      { key: 'speed', ...checkSpeed() },
      { key: 'url', ...checkURL() },
      { key: 'schema', ...checkSchema() },
      { key: 'canonical', ...checkCanonical() },
      { key: 'index', ...checkIndex() },
      { key: 'ux', ...checkUX() },
      { key: 'security', ...checkSecurity() }
    ];
    // --- Calculate weighted score ---
    let totalScore = 0;
    let maxScore = 0;
    sections.forEach(s => {
      totalScore += (s.score * WEIGHTS[s.key]);
      maxScore += (100 * WEIGHTS[s.key]);
    });

    return sections;
  }

  // --- Overlay ---
  function renderOverlay(sections) {
    // Remove any existing overlay first
    const old = document.getElementById('__seoOverlay');
    if (old) old.remove();
    let totalScore = 0;
    let maxScore = 0;
    sections.forEach(s => {
      totalScore += (s.score * WEIGHTS[s.key]);
      maxScore += (100 * WEIGHTS[s.key]);
    });
    const finalScore = Math.round((totalScore / maxScore) * 100);
    const allIssues = sections.flatMap(s => s.issues.map(issue => ({ section: s.label, issue })));
    // Overlay with keyword input
    const overlay = document.createElement('div');
    overlay.id = '__seoOverlay';
    overlay.innerHTML = `
      <style>
        #__seoKeywordInput::selection {
          background: #00e0ff; /* Light blue background for selection */
          color: #181c24; /* Dark text for contrast */
        }
      </style>
      <div style="position:fixed;top:24px;right:24px;background:#181c24;color:#fff;padding:22px 28px 18px 28px;border-radius:10px;z-index:999999;max-width:480px;max-height:90vh;overflow-y:auto;font-family:monospace;font-size:14px;box-shadow:0 2px 16px rgba(0,0,0,0.18);">
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
    document.body.appendChild(overlay);
    // Keyword apply logic
    const apply = function() {
      const val = overlay.querySelector('#__seoKeywordInput').value;
      window.__seoLastKeywords = val;
      overlay.remove();
      renderOverlay(runAudit());
    };
    overlay.querySelector('#__seoKeywordApply').onclick = apply;
    overlay.querySelector('#__seoKeywordInput').onkeydown = function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        apply();
      }
    };
    // Close overlay on Escape
    function seoOverlayEscListener(e) {
      if (e.key === 'Escape' && overlay.parentElement) {
        overlay.remove();
        window.removeEventListener('keydown', seoOverlayEscListener, true);
      }
    }
    window.addEventListener('keydown', seoOverlayEscListener, true);
  }

  // --- Run and render ---
  renderOverlay(runAudit());
})();
