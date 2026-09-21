(function () {
  'use strict';

  var ICONS = {
    quiz:       '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="48" height="48" rx="6"/><path d="M22 32h20M22 22h20M22 42h12"/><circle cx="46" cy="42" r="6" fill="none"/><path d="M50 46l4 4"/></svg>',
    web:        '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="12" width="48" height="40" rx="4"/><path d="M8 22h48"/><circle cx="16" cy="17" r="1.5" fill="currentColor"/></svg>',
    education:  '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 24l26-12 26 12-26 12z"/><path d="M18 30v12c0 4 6 8 14 8s14-4 14-8V30"/></svg>',
    utility:    '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="24" width="48" height="32" rx="4"/><path d="M20 24V16a12 12 0 0124 0v8"/><circle cx="32" cy="40" r="4" fill="currentColor"/></svg>',
    experiment: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M26 8h12M28 8v18l-14 26a4 4 0 003.5 6h29a4 4 0 003.5-6L36 26V8"/></svg>',
    other:      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="32" cy="32" r="24"/><path d="M32 20v12l8 8"/></svg>'
  };

  var ARROW_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="card-launch-arrow" aria-hidden="true"><path d="M5 12H19M19 12L13 6M19 12L13 18"/></svg>';

  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildCard(p, statusConfig) {
    var cat = (p.categories && p.categories[0]) || 'other';
    var cfg = statusConfig[p.status] || { label: p.status, color: '#4ba9ff' };
    var techs = (p.technologies || []).slice(0, 4).map(function (t) {
      return '<span class="card-tag">' + escHtml(t) + '</span>';
    }).join('');

    return [
      '<a class="project-card reveal" href="/projects/' + escHtml(p.slug) + '/"',
      '   data-cat="' + escHtml(cat) + '"',
      '   data-id="' + escHtml(p.id) + '"',
      '   aria-label="' + escHtml(p.name) + ' の詳細を見る"',
      '>',
      '  <div class="card-top">',
      '    <span class="card-room">' + escHtml((p.technologies && p.technologies[0]) || '') + '</span>',
      '    <span class="card-status" style="color:' + cfg.color + '">',
      '      <span class="card-status-dot" style="background:' + cfg.color + '"></span>',
      '      ' + escHtml(cfg.label),
      '    </span>',
      '  </div>',
      '  <div class="card-icon-wrap" data-cat="' + escHtml(cat) + '">',
      '    ' + (ICONS[cat] || ICONS.other),
      '  </div>',
      '  <h3 class="card-name">' + escHtml(p.name) + '</h3>',
      '  <p class="card-desc">' + escHtml(p.description) + '</p>',
      '  <div class="card-tags">' + techs + '</div>',
      '  <span class="card-launch" data-cat="' + escHtml(cat) + '">',
      '    詳細を見る ' + ARROW_SVG,
      '  </span>',
      '</a>'
    ].join('\n');
  }

  function buildSection(cat, projects, statusConfig) {
    var cards = projects.map(function (p) { return buildCard(p, statusConfig); }).join('\n');
    return [
      '<section class="category-section" data-category="' + escHtml(cat.id) + '" aria-labelledby="cat-' + escHtml(cat.id) + '">',
      '  <div class="category-header">',
      '    <span class="category-label" data-cat="' + escHtml(cat.id) + '">' + escHtml(cat.label) + '</span>',
      '    <h2 class="category-title" id="cat-' + escHtml(cat.id) + '">' + escHtml(cat.label) + '</h2>',
      '    <span class="category-count">' + projects.length + ' projects</span>',
      '  </div>',
      '  <div class="projects-grid">',
      cards,
      '  </div>',
      '</section>'
    ].join('\n');
  }

  function updateStats(data) {
    var total = data.projects.length;
    var active = data.projects.filter(function (p) { return p.status === 'active' || p.status === 'beta'; }).length;
    var usedCats = {};
    data.projects.forEach(function (p) { (p.categories || []).forEach(function (c) { usedCats[c] = true; }); });

    var elTotal = document.getElementById('stat-total');
    var elActive = document.getElementById('stat-active');
    var elCats = document.getElementById('stat-cats');
    if (elTotal) elTotal.textContent = total;
    if (elActive) elActive.textContent = active;
    if (elCats) elCats.textContent = Object.keys(usedCats).length;
  }

  function renderProjects(data) {
    var root = document.getElementById('projects-root');
    if (!root) return;

    var html = data.categories.map(function (cat) {
      var catProjects = data.projects
        .filter(function (p) { return p.categories && p.categories[0] === cat.id; });
      if (catProjects.length === 0) return '';
      return buildSection(cat, catProjects, data.statusConfig || {});
    }).join('\n');

    root.innerHTML = html;

    if (window.LAB && window.LAB.reveal) {
      window.LAB.reveal();
    } else {
      root.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
    }
  }

  function renderFilterBar(data) {
    var bar = document.getElementById('filter-bar');
    if (!bar) return;
    var usedCatIds = {};
    data.projects.forEach(function (p) { (p.categories || []).forEach(function (c) { usedCatIds[c] = true; }); });
    var cats = data.categories.filter(function (c) { return usedCatIds[c.id]; });

    var html = ['<button class="filter-btn active" data-filter="all" aria-pressed="true"><span class="filter-btn-dot"></span>All</button>'];
    cats.forEach(function (c) {
      html.push('<button class="filter-btn" data-filter="' + escHtml(c.id) + '" aria-pressed="false"><span class="filter-btn-dot"></span>' + escHtml(c.label) + '</button>');
    });
    bar.innerHTML = html.join('\n');
    setupFilter();
  }

  function setupFilter() {
    var btns = document.querySelectorAll('.filter-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter;
        btns.forEach(function (b) {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
        document.querySelectorAll('.category-section').forEach(function (sec) {
          var show = filter === 'all' || sec.dataset.category === filter;
          sec.dataset.hidden = String(!show);
        });
      });
    });
  }

  function loadProjects() {
    var loading = document.getElementById('loading-state');
    var errEl = document.getElementById('error-state');

    if (loading) loading.style.display = 'flex';
    if (errEl) errEl.style.display = 'none';

    fetch('/assets/data/v2/projects.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (loading) loading.style.display = 'none';
        updateStats(data);
        renderFilterBar(data);
        renderProjects(data);
      })
      .catch(function (err) {
        console.error('projects.json load error:', err);
        if (loading) loading.style.display = 'none';
        if (errEl) errEl.style.display = 'block';
      });
  }

  var retryBtnProjects = document.getElementById('retry-btn');
  if (retryBtnProjects) {
    retryBtnProjects.addEventListener('click', loadProjects);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProjects);
  } else {
    loadProjects();
  }
})();
