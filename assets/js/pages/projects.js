  (function () {
    'use strict';

    var STATUS_LABEL = {
      active:      'Active',
      beta:        'Beta',
      wip:         'WIP',
      maintenance: 'Maintenance',
      archived:    'Archived'
    };

    var ICONS = {
      quiz: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="48" height="48" rx="6"/><path d="M22 32h20M22 22h20M22 42h12"/><circle cx="46" cy="42" r="6" fill="none"/><path d="M50 46l4 4"/></svg>',
      utility: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="24" width="48" height="32" rx="4"/><path d="M20 24V16a12 12 0 0124 0v8"/><circle cx="32" cy="40" r="4" fill="currentColor"/></svg>',
      other: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="32" cy="32" r="24"/><path d="M32 20v12l8 8"/></svg>'
    };

    var ARROW_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="card-launch-arrow" aria-hidden="true"><path d="M5 12H19M19 12L13 6M19 12L13 18"/></svg>';

    function escHtml(s) {
      return String(s)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
    }

    function buildCard(p) {
      var cat    = escHtml(p.category || 'other');
      var status = p.status || 'active';
      var tags   = (p.tags || []).map(function(t){
        return '<span class="card-tag">' + escHtml(t) + '</span>';
      }).join('');

      return [
        '<a class="project-card reveal" href="' + escHtml(p.url) + '"',
        '   target="_blank" rel="noopener noreferrer"',
        '   data-cat="' + cat + '"',
        '   data-id="'  + escHtml(p.id) + '"',
        '   aria-label="' + escHtml(p.name) + ' — 外部リンクで開く"',
        '>',
        '  <div class="card-top">',
        '    <span class="card-room">' + escHtml(p.room || '') + '</span>',
        '    <span class="card-status" data-status="' + escHtml(status) + '">',
        '      <span class="card-status-dot"></span>',
        '      ' + escHtml(STATUS_LABEL[status] || status),
        '    </span>',
        '  </div>',
        '  <div class="card-icon-wrap" data-cat="' + cat + '">',
        '    ' + (ICONS[cat] || ICONS.other),
        '  </div>',
        '  <h3 class="card-name">' + escHtml(p.name) + '</h3>',
        '  <p class="card-desc">'  + escHtml(p.description) + '</p>',
        '  <div class="card-tags">' + tags + '</div>',
        '  <span class="card-launch" data-cat="' + cat + '">',
        '    Launch ' + ARROW_SVG,
        '  </span>',
        '</a>'
      ].join('\n');
    }

    function buildSection(cat, projects) {
      var cards = projects.map(buildCard).join('\n');
      return [
        '<section class="category-section" data-category="' + escHtml(cat.id) + '" aria-labelledby="cat-' + escHtml(cat.id) + '">',
        '  <div class="category-header">',
        '    <span class="category-label" data-cat="' + escHtml(cat.id) + '">' + escHtml(cat.label) + '</span>',
        '    <h2 class="category-title" id="cat-' + escHtml(cat.id) + '">' + escHtml(cat.labelJa) + '</h2>',
        '    <span class="category-count">' + projects.length + ' projects</span>',
        '  </div>',
        '  <div class="projects-grid">',
        cards,
        '  </div>',
        '</section>'
      ].join('\n');
    }

    function updateStats(data) {
      var total  = data.projects.length;
      var active = data.projects.filter(function(p){ return p.status === 'active'; }).length;
      var cats   = data.categories.length;

      var elTotal  = document.getElementById('stat-total');
      var elActive = document.getElementById('stat-active');
      var elCats   = document.getElementById('stat-cats');
      if (elTotal)  elTotal.textContent  = total;
      if (elActive) elActive.textContent = active;
      if (elCats)   elCats.textContent   = cats;
    }

    function renderProjects(data) {
      var root = document.getElementById('projects-root');
      if (!root) return;

      var html = data.categories.map(function(cat) {
        var catProjects = data.projects
          .filter(function(p){ return p.category === cat.id; })
          .sort(function(a, b){ return (a.order || 0) - (b.order || 0); });

        if (catProjects.length === 0) return '';
        return buildSection(cat, catProjects);
      }).join('\n');

      root.innerHTML = html;

      if (window.LAB && window.LAB.reveal) {
        window.LAB.reveal();
      } else {
        root.querySelectorAll('.reveal').forEach(function(el){
          el.classList.add('visible');
        });
      }
    }

    function setupFilter(data) {
      var btns = document.querySelectorAll('.filter-btn');

      btns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var filter = btn.dataset.filter;

          btns.forEach(function(b){
            b.classList.toggle('active', b === btn);
            b.setAttribute('aria-pressed', String(b === btn));
          });

          document.querySelectorAll('.category-section').forEach(function(sec){
            var show = filter === 'all' || sec.dataset.category === filter;
            sec.dataset.hidden = String(!show);
          });
        });
      });
    }

    function loadProjects() {
      var loading = document.getElementById('loading-state');
      var errEl   = document.getElementById('error-state');

      if (loading) loading.style.display = 'flex';
      if (errEl)   errEl.style.display   = 'none';

      fetch('/assets/data/projects.json')
        .then(function(res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function(data) {
          if (loading) loading.style.display = 'none';
          updateStats(data);
          renderProjects(data);
          setupFilter(data);
        })
        .catch(function(err) {
          console.error('projects.json load error:', err);
          if (loading) loading.style.display = 'none';
          if (errEl)   errEl.style.display   = 'block';
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