(function () {
  'use strict';

  var DATA_BASE = '/assets/data/v2/';

  function fetchJson(name) {
    return fetch(DATA_BASE + name, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('failed to load ' + name);
        return res.json();
      })
      .catch(function (err) {
        console.error(err);
        return null;
      });
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ── CURRENTLY ── */
  function renderCurrently(projectsData) {
    var mount = document.getElementById('currently-list');
    if (!mount || !projectsData) return;
    var statusConfig = projectsData.statusConfig || {};
    var current = projectsData.projects.filter(function (p) { return p.current; });
    if (!current.length) return;

    mount.innerHTML = '';
    current.forEach(function (p) {
      var cfg = statusConfig[p.status] || { label: p.status, color: '#4ba9ff' };
      var li = el('li', 'currently-item');
      li.innerHTML =
        '<span class="currently-dot" style="--dot-color:' + cfg.color + '"></span>' +
        '<span class="currently-name">' + escapeHtml(p.name) + '</span>' +
        '<span class="currently-status">' + escapeHtml(cfg.label) + '</span>';
      mount.appendChild(li);
    });
  }

  /* ── FEATURED PROJECTS ── */
  function renderProjects(projectsData) {
    var mount = document.getElementById('project-grid');
    if (!mount || !projectsData) return;
    var statusConfig = projectsData.statusConfig || {};
    var featured = projectsData.projects.filter(function (p) { return p.featured; });

    mount.innerHTML = '';
    featured.forEach(function (p) {
      var cfg = statusConfig[p.status] || { label: p.status, color: '#4ba9ff' };
      var card = el('div', 'project-card-v2');
      card.setAttribute('role', 'listitem');
      var tagsHtml = (p.technologies || []).slice(0, 4).map(function (t) {
        return '<span class="project-card-v2-tag">' + escapeHtml(t) + '</span>';
      }).join('');
      var linkHtml = p.url
        ? '<a class="project-card-v2-link" href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener">開く &rarr;</a>'
        : '<span class="project-card-v2-link" style="color:var(--text-2)">準備中</span>';

      card.innerHTML =
        '<div class="project-card-v2-top">' +
          '<span class="project-card-v2-name">' + escapeHtml(p.name) + '</span>' +
          '<span class="status-pill" style="--pill-color:' + cfg.color + '">' + escapeHtml(cfg.label) + '</span>' +
        '</div>' +
        '<p class="project-card-v2-desc">' + escapeHtml(p.description) + '</p>' +
        '<div class="project-card-v2-tags">' + tagsHtml + '</div>' +
        linkHtml;
      mount.appendChild(card);
    });
  }

  /* ── RESEARCH ── */
  function renderResearch(researchData) {
    var chipsMount = document.getElementById('research-chips');
    var listMount = document.getElementById('research-list');
    if (!researchData) return;

    if (chipsMount) {
      chipsMount.innerHTML = '';
      researchData.categories.forEach(function (cat) {
        var count = researchData.items.filter(function (i) { return i.category === cat.id; }).length;
        if (!count) return;
        var chip = el('span', 'research-chip');
        chip.setAttribute('role', 'listitem');
        chip.textContent = cat.label + ' (' + count + ')';
        chipsMount.appendChild(chip);
      });
    }

    if (listMount) {
      listMount.innerHTML = '';
      var sorted = researchData.items.slice().sort(function (a, b) {
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      }).slice(0, 4);
      var catLabel = {};
      researchData.categories.forEach(function (c) { catLabel[c.id] = c.labelJa || c.label; });

      sorted.forEach(function (item) {
        var li = el('li', 'research-item');
        li.innerHTML =
          '<span class="research-item-cat">' + escapeHtml(catLabel[item.category] || item.category) + '</span>' +
          '<div class="research-item-body">' +
            '<div class="research-item-title">' + escapeHtml(item.title) + '</div>' +
            '<div class="research-item-summary">' + escapeHtml(item.summary) + '</div>' +
          '</div>' +
          '<span class="research-item-status">' + escapeHtml(item.status) + '</span>';
        listMount.appendChild(li);
      });
    }
  }

  /* ── NOTES ── */
  function renderNotes(notesData) {
    var mount = document.getElementById('notes-list');
    if (!mount || !notesData) return;
    var catLabel = {};
    notesData.categories.forEach(function (c) { catLabel[c.id] = c.label; });

    var sorted = notesData.items.slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    }).slice(0, 5);

    mount.innerHTML = '';
    sorted.forEach(function (n) {
      var li = el('li', 'note-item');
      li.innerHTML =
        '<span class="note-item-date">' + escapeHtml(n.date) + '</span>' +
        '<div class="note-item-body">' +
          '<div class="note-item-title">' + escapeHtml(n.title) + '</div>' +
          '<div class="note-item-summary">' + escapeHtml(n.summary) + '</div>' +
        '</div>' +
        '<span class="note-item-cat">' + escapeHtml(catLabel[n.category] || n.category) + '</span>';
      mount.appendChild(li);
    });
  }

  /* ── LAB STATUS (統計はハードコードせずデータから算出) ── */
  function renderStats(projectsData, researchData, notesData, techData) {
    var mount = document.getElementById('lab-stats-grid');
    if (!mount) return;

    var stats = [];

    if (projectsData) {
      var total = projectsData.projects.length;
      var active = projectsData.projects.filter(function (p) {
        return p.status === 'active' || p.status === 'beta';
      }).length;
      stats.push({ label: 'Projects', value: total, sub: active + ' active' });
    }
    if (researchData) {
      var ongoing = researchData.items.filter(function (i) { return i.status === 'ongoing'; }).length;
      stats.push({ label: 'Research Themes', value: researchData.items.length, sub: ongoing + ' ongoing' });
    }
    if (notesData) {
      stats.push({ label: 'Notes', value: notesData.items.length, sub: 'logged' });
    }
    if (techData) {
      stats.push({ label: 'Technologies', value: techData.items.length, sub: techData.categories.length + ' categories' });
    }

    mount.innerHTML = '';
    stats.forEach(function (s) {
      var wrap = el('div', 'lab-stat');
      wrap.setAttribute('role', 'listitem');
      wrap.innerHTML =
        '<dt>' + escapeHtml(s.label) + '</dt>' +
        '<dd>' + escapeHtml(s.value) + ' <span>' + escapeHtml(s.sub) + '</span></dd>';
      mount.appendChild(wrap);
    });
  }

  /* ── EXPLORE MODAL ── */
  var OBJECTS = {
    'obj-monitor':    { name: '大型モニター',    dest: '→ Projects',  href: '/projects/' },
    'obj-bookshelf':  { name: '本棚',             dest: '→ Research',  href: '/research/' },
    'obj-whiteboard': { name: 'ホワイトボード',   dest: '→ Notes',     href: '/notes/' },
    'obj-telescope':  { name: '天体望遠鏡',       dest: '→ Astronomy', href: '/research/astronomy' },
    'obj-server':     { name: 'サーバーラック',   dest: '→ Lab',       href: '/lab/' },
    'obj-cabinet':    { name: 'キャビネット',     dest: '→ Notes',     href: '/notes/' },
    'obj-envelope':   { name: '封筒',             dest: '→ Contact',   href: '/contact' },
    'obj-door':       { name: 'ドア',             dest: '→ About',     href: '/about' }
  };

  function initExploreModal() {
    var modal = document.getElementById('explore-modal');
    var backdrop = document.getElementById('explore-modal-backdrop');
    var closeBtn = document.getElementById('explore-modal-close');
    var openBtns = [
      document.getElementById('explore-open-btn'),
      document.getElementById('explore-open-btn-2')
    ].filter(Boolean);
    var tooltip = document.getElementById('lab-tooltip');
    var tipName = document.getElementById('tooltip-name');
    var tipDest = document.getElementById('tooltip-dest');
    if (!modal) return;

    var lastFocused = null;
    var mouseX = 0, mouseY = 0, tipVisible = false;

    function positionTooltip() {
      if (!tooltip) return;
      var tw = tooltip.offsetWidth || 160;
      var th = tooltip.offsetHeight || 52;
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var x = mouseX + 16;
      var y = mouseY - th / 2;
      if (x + tw > vw - 12) x = mouseX - tw - 12;
      if (y < 12) y = 12;
      if (y + th > vh - 12) y = vh - th - 12;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    }

    function showTooltip(info) {
      if (!tooltip) return;
      tipName.textContent = info.name;
      tipDest.textContent = info.dest;
      positionTooltip();
      tooltip.classList.add('visible');
      tipVisible = true;
    }

    function hideTooltip() {
      if (!tooltip) return;
      tooltip.classList.remove('visible');
      tipVisible = false;
    }

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (tipVisible) positionTooltip();
    }, { passive: true });

    Object.keys(OBJECTS).forEach(function (id) {
      var node = document.getElementById(id);
      var info = OBJECTS[id];
      if (!node) return;

      node.addEventListener('mouseenter', function () { showTooltip(info); });
      node.addEventListener('mouseleave', hideTooltip);
      node.addEventListener('focus', function () { showTooltip(info); });
      node.addEventListener('blur', hideTooltip);
      node.addEventListener('click', function () { window.location.href = info.href; });
      node.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.href = info.href;
        }
      });
    });

    function openModal() {
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = '';
      hideTooltip();
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    openBtns.forEach(function (btn) {
      btn.addEventListener('click', openModal);
    });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  /* ── INIT ── */
  Promise.all([
    fetchJson('projects.json'),
    fetchJson('research.json'),
    fetchJson('notes.json'),
    fetchJson('technologies.json')
  ]).then(function (results) {
    var projectsData = results[0];
    var researchData = results[1];
    var notesData = results[2];
    var techData = results[3];

    renderCurrently(projectsData);
    renderProjects(projectsData);
    renderResearch(researchData);
    renderNotes(notesData);
    renderStats(projectsData, researchData, notesData, techData);

    // データ描画後に reveal 初期化し直す(動的追加要素にも適用したい場合はここで再実行)
    if (window.LAB && typeof window.LAB.reveal === 'function') {
      window.LAB.reveal();
    }
  });

  initExploreModal();
})();
