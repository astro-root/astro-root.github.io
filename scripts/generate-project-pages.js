/**
 * assets/data/v2/projects.json を単一の情報源として、
 * /projects/<slug>/index.html を静的生成するスクリプト。
 *
 * 使い方: node scripts/generate-project-pages.js
 *
 * projects.json を編集して本スクリプトを再実行すれば、
 * 全Project Detailページが再生成される(手動同期不要)。
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'assets/data/v2/projects.json');
const researchPath = path.join(root, 'assets/data/v2/research.json');
const notesPath = path.join(root, 'assets/data/v2/notes.json');
const outDir = path.join(root, 'projects');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const researchData = JSON.parse(fs.readFileSync(researchPath, 'utf-8'));
const notesData = JSON.parse(fs.readFileSync(notesPath, 'utf-8'));
const header = fs.readFileSync(path.join(root, 'partials/header.html'), 'utf-8').trim();
const footer = fs.readFileSync(path.join(root, 'partials/footer.html'), 'utf-8').trim();

// プロジェクトIDから関連Research/Notesを逆引き(single source of truth:
// research.json / notes.json 側の relatedProjects / relatedProject を正とする)
function findRelatedResearch(projectId) {
  return researchData.items.filter((r) => (r.relatedProjects || []).includes(projectId));
}
function findRelatedNotes(projectId) {
  return notesData.items.filter((n) => n.relatedProject === projectId);
}

const catLabel = {};
data.categories.forEach((c) => { catLabel[c.id] = c.label; });

function esc(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
}

function renderPage(p) {
  const cfg = data.statusConfig[p.status] || { label: p.status, color: '#4ba9ff' };
  const cats = (p.categories || []).map((id) => catLabel[id] || id).join(' / ');
  const techTags = (p.technologies || [])
    .map((t) => `<span class="pd-tech-tag">${esc(t)}</span>`)
    .join('\n          ');
  const relatedResearch = findRelatedResearch(p.id);
  const relatedNotes = findRelatedNotes(p.id);

  const liveLink = p.url
    ? `<a class="btn btn-primary" href="${esc(p.url)}" target="_blank" rel="noopener">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg>
          公開ページを開く
        </a>`
    : `<span class="btn btn-ghost" aria-disabled="true" style="opacity:.5;cursor:default;">準備中(未公開)</span>`;

  const githubLink = p.github
    ? `<a class="btn btn-ghost" href="${esc(p.github)}" target="_blank" rel="noopener">GitHub</a>`
    : '';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(p.name)} | Projects | るーとの研究室</title>
  <meta name="description" content="${esc(p.description)}" />
  <meta name="author" content="るーと" />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#020b18" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(p.name)} | るーとの研究室" />
  <meta property="og:description" content="${esc(p.description)}" />
  <meta property="og:url" content="https://astro-root.com/projects/${esc(p.slug)}/" />
  <meta property="og:image" content="https://astro-root.com/ogp-image.png" />
  <meta property="og:site_name" content="るーとの研究室" />
  <meta property="og:locale" content="ja_JP" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="canonical" href="https://astro-root.com/projects/${esc(p.slug)}/" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+JP:wght@400;500&display=swap" />
  <link rel="stylesheet" href="/assets/css/variables.css" />
  <link rel="stylesheet" href="/assets/css/base.css" />
  <link rel="stylesheet" href="/assets/css/nav.css" />
  <link rel="stylesheet" href="/assets/css/footer.css" />
  <link rel="stylesheet" href="/assets/css/chat-widget.css" />
  <link rel="stylesheet" href="/assets/css/search.css" />
  <link rel="stylesheet" href="/assets/css/pages/project-detail.css" />
</head>
<body>
  <div id="scroll-progress" aria-hidden="true"></div>
  <canvas id="star-canvas" aria-hidden="true"></canvas>
  <div class="aurora-bg" aria-hidden="true">
    <div class="aurora-orb"></div>
    <div class="aurora-orb"></div>
    <div class="aurora-orb"></div>
    <div class="aurora-orb"></div>
  </div>
  <div class="noise-overlay" aria-hidden="true"></div>
  <div class="grid-overlay" aria-hidden="true"></div>

  <a href="#main-content" class="skip-link">メインコンテンツへスキップ</a>
  <div id="cursor-dot" aria-hidden="true"></div>
  <div id="cursor-ring" aria-hidden="true"></div>

<!-- PARTIAL:HEADER:START -->
${header}
<!-- PARTIAL:HEADER:END -->

  <main id="main-content">
    <div class="container">
      <p class="pd-breadcrumb reveal"><a href="/projects/">Projects</a> / ${esc(p.name)}</p>

      <div class="pd-header reveal d1">
        <h1 class="pd-title">${esc(p.name)}</h1>
        <span class="pd-status-pill" style="color:${cfg.color};border-color:${cfg.color}55;background:${cfg.color}14;">${esc(cfg.label)}</span>
      </div>

      <p class="pd-desc reveal d2">${esc(p.description)}</p>

      <div class="pd-actions reveal d2">
        ${liveLink}
        ${githubLink}
      </div>

      <div class="pd-meta-grid reveal d3">
        <div class="pd-meta-item">
          <div class="pd-meta-label">Category</div>
          <div class="pd-meta-value">${esc(cats || '—')}</div>
        </div>
        <div class="pd-meta-item">
          <div class="pd-meta-label">Started</div>
          <div class="pd-meta-value">${esc(fmtDate(p.startedAt))}</div>
        </div>
        <div class="pd-meta-item">
          <div class="pd-meta-label">Updated</div>
          <div class="pd-meta-value">${esc(fmtDate(p.updatedAt))}</div>
        </div>
      </div>

      ${p.longDescription ? `<section class="pd-section reveal d3">
        <h2 class="pd-section-title">// About this project</h2>
        <p class="pd-long-desc">${esc(p.longDescription)}</p>
      </section>` : ''}

      <section class="pd-section reveal d4">
        <h2 class="pd-section-title">// Technologies</h2>
        <div class="pd-tech-list">
          ${techTags || '<span class="pd-tech-tag">—</span>'}
        </div>
      </section>

      ${relatedResearch.length ? `<section class="pd-section reveal d4">
        <h2 class="pd-section-title">// Related Research</h2>
        <ul class="pd-related-list">
          ${relatedResearch.map((r) => `<li><a href="/research/#${esc(r.id)}">${esc(r.title)}</a><span class="pd-related-summary">${esc(r.summary)}</span></li>`).join('\n          ')}
        </ul>
      </section>` : ''}

      ${relatedNotes.length ? `<section class="pd-section reveal d4">
        <h2 class="pd-section-title">// Related Notes</h2>
        <ul class="pd-related-list">
          ${relatedNotes.map((n) => `<li><a href="/notes/#${esc(n.id)}">${esc(n.title)}</a><span class="pd-related-summary">${esc(n.date)}</span></li>`).join('\n          ')}
        </ul>
      </section>` : ''}

      <a href="/projects/" class="pd-back reveal d5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12H19M19 12L13 6M19 12L13 18"/></svg>
        Back to Projects
      </a>
    </div>
  </main>

  <!-- PARTIAL:FOOTER:START -->
${footer}
<!-- PARTIAL:FOOTER:END -->

  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
  <script src="/assets/js/firebase-init.js"></script>
  <script src="/assets/js/lab-common.js"></script>
  <script src="/assets/js/nav-active.js"></script>
  <script src="/assets/js/chat-widget.js"></script>
  <script src="/assets/js/search-core.js"></script>
  <script src="/assets/js/search-overlay.js"></script>
</body>
</html>
`;
}

let count = 0;
data.projects.forEach((p) => {
  const dir = path.join(outDir, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderPage(p), 'utf-8');
  count++;
});

console.log(`✓ ${count} 件の Project Detail ページを生成しました (projects/<slug>/index.html)`);
