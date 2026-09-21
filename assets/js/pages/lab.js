(function () {
  'use strict';

  /* ── カテゴリ設定(表示順・色・セクションアイコン) ── */
  var CATEGORY_META = {
    frontend: {
      color: '#3b9eff',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
    },
    runtime: {
      color: '#00e5b8',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
    },
    backend: {
      color: '#ffb340',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'
    },
    database: {
      color: '#ff6b6b',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/></svg>'
    },
    infrastructure: {
      color: '#8b72ff',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>'
    },
    development: {
      color: '#ff6b6b',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>'
    },
    environment: {
      color: '#64d9fb',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8l3 3-3 3"/><line x1="13" y1="14" x2="17" y2="14"/></svg>'
    }
  };

  /* ── 技術ごとのブランドアイコン(id → {color, svg}) ── */
  var TECH_ICONS = {
    html5: { color: '#e34f26', svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M4 0l2.4 27L16 30l9.6-3L28 0zm20.8 8H10.4l.4 4h13.6l-1.2 13-7.2 2-7.2-2-.5-5.5h4l.25 2.75L16 24l4.25-1.25L20.8 20H9.6L8 8z"/></svg>' },
    css3: { color: '#1572b6', svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M4 0l2.4 27L16 30l9.6-3L28 0zm20.8 8H10.4l.2 2.5h14l-.4 4.5H12.2l.2 2.5h11.6l-.6 6.5-7.4 2-7.4-2-.5-5.5h2.5l.25 2.75L16 23l5.25-1.25.6-6.25H9.4L8.6 5.5h14.8z"/></svg>' },
    javascript: { color: '#f7df1e', svg: '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect width="32" height="32" rx="3" fill="#f7df1e"/><path d="M8 24.5c.8 1.3 1.9 2.3 3.9 2.3 1.6 0 2.7-.8 2.7-2 0-1.3-.7-1.8-2.4-2.6l-.8-.3c-2.4-1-4-2.3-4-5 0-2.5 1.9-4.4 4.8-4.4 2.1 0 3.6.7 4.7 2.6l-2.6 1.7c-.6-1-1.2-1.4-2.1-1.4-.9 0-1.5.6-1.5 1.4 0 1 .6 1.4 2.1 2.1l.8.3c2.8 1.2 4.4 2.4 4.4 5.2 0 3-2.3 4.7-5.5 4.7-3.1 0-5-1.5-6-3.4zM22 24.1c.6 1.1 1.2 2 2.6 2 1.3 0 2.1-.5 2.1-2.5V12.5h3.3v11.2c0 4.1-2.4 6-5.9 6-3.2 0-5-1.7-5.9-3.7z" fill="#323330"/></svg>' },
    typescript: { color: '#3178c6', svg: '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect width="32" height="32" rx="3" fill="#3178c6"/><path d="M18.5 19v2c.5.3 1.1.5 1.8.5 1.8 0 3-1 3-2.6 0-1.5-1-2.2-2.5-2.8-.9-.4-1.3-.6-1.3-1.1 0-.4.3-.7 1-.7.5 0 1 .2 1.5.5l.6-1.8c-.6-.4-1.4-.6-2.3-.6-1.7 0-2.8 1-2.8 2.5 0 1.4.9 2.1 2.3 2.6 1 .4 1.4.7 1.4 1.2 0 .5-.4.8-1.1.8-.7 0-1.3-.3-1.6-.5zM14 14h-3v12h-2V14H6v-2h8z" fill="white"/></svg>' },
    svg: { color: '#ffb13b', svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 22L13 8l6 10 3-5 4 9z"/><circle cx="10" cy="9" r="2"/></svg>' },
    pwa: { color: '#5a0fc8', svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="8" y="3" width="16" height="26" rx="3"/><line x1="13" y1="25" x2="19" y2="25"/></svg>' },
    nodejs: { color: '#339933', svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 0C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0zm6.8 22.4c-.3.5-.8.8-1.4.8-.4 0-.8-.1-1.1-.4l-3.3-2.7-1.8 1.7c-.2.2-.5.3-.8.3l.4-5.6 6.4-5.9c.3-.3-.1-.4-.4-.2l-7.9 5-3.4-1.1c-.7-.2-.7-.7.2-1l13.3-5.1c.6-.2 1.1.1.9.8z"/></svg>' },
    npm: { color: '#cb0000', svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M0 0h32v32H0zm4 4v24h24V4zm4 4h16v16H20V12h-4v12H8z"/></svg>' },
    'firebase-auth': { color: '#ffca28', svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M5.8 24.6l.7-7.5 7.9-14.1 4.1 7.5z" fill="#ffa000"/><path d="M23.2 17l2 7.6L16 29.5l-10.2-5-.2-.8 7.3-13z" fill="#f57c00"/><path d="M20.4 5.9l2.8 11.1-7.6 4.5-7.9-4.5 1.1-5.9z" fill="#ffca28"/><path d="M16 14.5l4.4 2.5-7.2 12.5-1.8-1.1z" fill="#ffa000" opacity="0.6"/></svg>' },
    firestore: { color: '#ffca28', svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M5.8 24.6l.7-7.5 7.9-14.1 4.1 7.5z" fill="#ffa000"/><path d="M23.2 17l2 7.6L16 29.5l-10.2-5-.2-.8 7.3-13z" fill="#f57c00"/><path d="M20.4 5.9l2.8 11.1-7.6 4.5-7.9-4.5 1.1-5.9z" fill="#ffca28"/><path d="M16 14.5l4.4 2.5-7.2 12.5-1.8-1.1z" fill="#ffa000" opacity="0.6"/></svg>' },
    'realtime-db': { color: '#ffca28', svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M5.8 24.6l.7-7.5 7.9-14.1 4.1 7.5z" fill="#ffa000"/><path d="M23.2 17l2 7.6L16 29.5l-10.2-5-.2-.8 7.3-13z" fill="#f57c00"/><path d="M20.4 5.9l2.8 11.1-7.6 4.5-7.9-4.5 1.1-5.9z" fill="#ffca28"/><path d="M16 14.5l4.4 2.5-7.2 12.5-1.8-1.1z" fill="#ffa000" opacity="0.6"/></svg>' },
    'cloudflare-workers': { color: '#f6821f', svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M21.3 20.3c.1-.4.1-.8 0-1.2l1.5-1.1c.1-.1.2-.3.1-.5l-1.4-2.4c-.1-.2-.3-.2-.5-.2l-1.7.7c-.4-.3-.8-.5-1.3-.6l-.3-1.8c0-.2-.2-.3-.4-.3h-2.8c-.2 0-.4.1-.4.3l-.3 1.8c-.5.1-.9.4-1.3.6l-1.7-.7c-.2-.1-.4 0-.5.2l-1.4 2.4c-.1.2 0 .4.1.5l1.5 1.1c-.1.4-.1.8 0 1.2l-1.5 1.1c-.1.1-.2.3-.1.5l1.4 2.4c.1.2.3.2.5.2l1.7-.7c.4.3.8.5 1.3.6l.3 1.8c0 .2.2.3.4.3h2.8c.2 0 .4-.1.4-.3l.3-1.8c.5-.1.9-.4 1.3-.6l1.7.7c.2.1.4 0 .5-.2l1.4-2.4c.1-.2 0-.4-.1-.5zm-5.3 1.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3z"/><path d="M25 7.5c-3.6 0-6.5 2.9-6.5 6.5h1.5c0-2.8 2.2-5 5-5V7.5z" opacity=".5"/></svg>' },
    'github-pages': { color: '#ffffff', svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 0C7.16 0 0 7.16 0 16c0 7.08 4.58 13.07 10.94 15.19.8.15 1.09-.35 1.09-.76 0-.38-.01-1.38-.02-2.71-4.45.97-5.39-2.14-5.39-2.14-.73-1.85-1.78-2.34-1.78-2.34-1.45-.99.11-.97.11-.97 1.61.11 2.45 1.65 2.45 1.65 1.43 2.44 3.74 1.74 4.65 1.33.14-1.03.56-1.74 1.01-2.14-3.55-.4-7.28-1.77-7.28-7.89 0-1.74.62-3.17 1.64-4.28-.16-.4-.71-2.02.16-4.22 0 0 1.34-.43 4.38 1.63a15.2 15.2 0 0 1 4-.54c1.36.01 2.72.18 4 .54 3.04-2.06 4.37-1.63 4.37-1.63.87 2.2.32 3.82.16 4.22 1.02 1.11 1.63 2.54 1.63 4.28 0 6.13-3.74 7.49-7.3 7.88.57.49 1.08 1.47 1.08 2.96 0 2.14-.02 3.86-.02 4.39 0 .42.29.91 1.1.76C27.43 29.06 32 23.07 32 16 32 7.16 24.84 0 16 0z"/></svg>' },
    git: { color: '#f05032', svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M31.4 14.6L17.4.6c-.8-.8-2-.8-2.8 0l-2.8 2.8 3.5 3.5c.8-.3 1.8-.1 2.4.5.7.7.8 1.6.5 2.4l3.4 3.4c.8-.3 1.7-.1 2.4.5.9.9.9 2.4 0 3.3-.9.9-2.4.9-3.3 0-.7-.7-.9-1.7-.5-2.5l-3.2-3.2v8.4c.2.1.5.3.7.5.9.9.9 2.4 0 3.3-.9.9-2.4.9-3.3 0-.9-.9-.9-2.4 0-3.3.2-.2.5-.4.8-.5v-8.5c-.3-.1-.6-.3-.8-.5-.7-.7-.9-1.7-.5-2.5L11 5.5.6 15.8c-.8.8-.8 2 0 2.8l14 14c.8.8 2 .8 2.8 0l14-14c.8-.7.8-2 0-2.8z"/></svg>' },
    github: { color: '#ffffff', svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 0C7.16 0 0 7.16 0 16c0 7.08 4.58 13.07 10.94 15.19.8.15 1.09-.35 1.09-.76 0-.38-.01-1.38-.02-2.71-4.45.97-5.39-2.14-5.39-2.14-.73-1.85-1.78-2.34-1.78-2.34-1.45-.99.11-.97.11-.97 1.61.11 2.45 1.65 2.45 1.65 1.43 2.44 3.74 1.74 4.65 1.33.14-1.03.56-1.74 1.01-2.14-3.55-.4-7.28-1.77-7.28-7.89 0-1.74.62-3.17 1.64-4.28-.16-.4-.71-2.02.16-4.22 0 0 1.34-.43 4.38 1.63a15.2 15.2 0 0 1 4-.54c1.36.01 2.72.18 4 .54 3.04-2.06 4.37-1.63 4.37-1.63.87 2.2.32 3.82.16 4.22 1.02 1.11 1.63 2.54 1.63 4.28 0 6.13-3.74 7.49-7.3 7.88.57.49 1.08 1.47 1.08 2.96 0 2.14-.02 3.86-.02 4.39 0 .42.29.91 1.1.76C27.43 29.06 32 23.07 32 16 32 7.16 24.84 0 16 0z"/></svg>' },
    'github-codespaces': { color: '#0078d4', svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="3" y="6" width="26" height="18" rx="3"/><path d="M10 16l4 4 8-8"/></svg>' },
    emailjs: { color: '#3b9eff', svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="7" width="26" height="18" rx="3"/><polyline points="3,9 16,18 29,9"/></svg>' },
    linux: { color: '#fcc624', svg: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 1C7.7 1 1 7.7 1 16s6.7 15 15 15 15-6.7 15-15S24.3 1 16 1zm-.9 3.5c.3 0 .5.1.7.2.3.2.4.5.4.8 0 .4-.2.7-.5.9-.2.1-.4.2-.6.2-.4 0-.7-.2-.9-.5-.1-.2-.2-.4-.2-.6 0-.3.1-.6.4-.8.2-.1.4-.2.7-.2zm2.8 1.1c.2 0 .4.1.6.2.3.2.5.5.5.9 0 .2-.1.4-.2.6-.2.3-.5.5-.9.5-.2 0-.4-.1-.6-.2-.3-.2-.5-.5-.5-.9 0-.2.1-.4.2-.6.2-.3.5-.5.9-.5zm-6.7 4.8c1.2 0 2 .9 2.3 2.1.1.4.1.9.1 1.3 0 .8-.2 1.6-.6 2.2-.4.6-1 1-1.8 1s-1.4-.4-1.8-1c-.4-.6-.6-1.4-.6-2.2 0-.4 0-.9.1-1.3.3-1.2 1.1-2.1 2.3-2.1zm9.6 0c1.2 0 2 .9 2.3 2.1.1.4.1.9.1 1.3 0 .8-.2 1.6-.6 2.2-.4.6-1 1-1.8 1s-1.4-.4-1.8-1c-.4-.6-.6-1.4-.6-2.2 0-.4 0-.9.1-1.3.3-1.2 1.1-2.1 2.3-2.1zM16 17c2.2 0 4.2 1 5.5 2.5.4.5.3 1.2-.2 1.6l-.1.1c-1.3 1-3.2 1.8-5.2 1.8s-3.9-.8-5.2-1.8l-.1-.1c-.5-.4-.6-1.1-.2-1.6C11.8 18 13.8 17 16 17z"/></svg>' }
  };

  var FALLBACK_ICON = {
    color: '#7d9ab8',
    svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="5" width="22" height="22" rx="4"/><path d="M12 16h8M16 12v8"/></svg>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function buildTechCard(tech) {
    var icon = TECH_ICONS[tech.id] || FALLBACK_ICON;
    var level = tech.level || (tech.primary ? 'primary' : 'secondary');
    var levelLabel = level.charAt(0).toUpperCase() + level.slice(1);
    var related = (tech.relatedProjects || []).length
      ? '<p class="tech-related">' + tech.relatedProjects.map(function (id) {
          return '<a href="/projects/' + esc(id) + '/">' + esc(id) + '</a>';
        }).join(' · ') + '</p>'
      : '';

    return [
      '<article class="tech-card reveal" id="' + esc(tech.id) + '" data-cat="' + esc(tech.category) + '">',
      '  <div class="tech-icon" style="color:' + icon.color + ';">' + icon.svg + '</div>',
      '  <div class="tech-info">',
      '    <h3 class="tech-name">' + esc(tech.name) + '</h3>',
      '    <p class="tech-desc">' + esc(tech.description) + '</p>',
      related,
      '  </div>',
      '  <span class="tech-badge" data-level="' + esc(level) + '">',
      '    <span class="tech-badge-dot"></span>' + esc(levelLabel),
      '  </span>',
      '</article>'
    ].join('\n');
  }

  function buildCategorySection(cat, techs, index) {
    var meta = CATEGORY_META[cat.id] || { color: '#7d9ab8', icon: FALLBACK_ICON.svg };
    var rgb = meta.color;
    var unit = techs.length === 1 ? 'technology' : 'technologies';

    return [
      '<section class="cat-section reveal" aria-labelledby="cat-' + esc(cat.id) + '">',
      '  <div class="cat-section-header">',
      '    <div class="cat-section-icon" style="color:' + rgb + ';background:' + rgb + '0f;">' + meta.icon + '</div>',
      '    <div>',
      '      <p class="cat-section-label">Category ' + pad2(index + 1) + '</p>',
      '      <h2 class="cat-section-title" id="cat-' + esc(cat.id) + '">' + esc(cat.label) + '</h2>',
      '    </div>',
      '    <span class="cat-section-count">' + techs.length + ' ' + unit + '</span>',
      '  </div>',
      '  <div class="tech-grid">',
      techs.map(buildTechCard).join('\n'),
      '  </div>',
      '</section>'
    ].join('\n');
  }

  function buildTerminal(data) {
    var lines = data.categories.map(function (cat) {
      var names = data.items
        .filter(function (t) { return t.category === cat.id; })
        .map(function (t) { return t.name; });
      if (!names.length) return '';
      var label = '[' + cat.label + ']';
      while (label.length < 18) label += ' ';
      return [
        '<div class="terminal-line terminal-out">',
        '  <span class="terminal-hl">' + esc(label) + '</span>',
        '  <span>  ' + esc(names.join(' · ')) + '</span>',
        '</div>'
      ].join('\n');
    }).filter(Boolean).join('\n');

    return [
      '<div class="terminal-dots" aria-hidden="true">',
      '  <span class="terminal-dot"></span><span class="terminal-dot"></span><span class="terminal-dot"></span>',
      '</div>',
      '<span class="terminal-title" aria-hidden="true">lab-equipment — zsh</span>',
      '<div class="terminal-body">',
      '  <div class="terminal-line">',
      '    <span class="terminal-prompt">$</span>',
      '    <span class="terminal-cmd">cat /etc/lab-stack.conf</span>',
      '  </div>',
      lines,
      '  <div class="terminal-line" style="margin-top:8px;">',
      '    <span class="terminal-prompt">$</span>',
      '    <span class="terminal-cmd">uptime</span>',
      '  </div>',
      '  <div class="terminal-line terminal-out">',
      '    <span class="terminal-hl">Research Lab</span>',
      '    <span> — online and running</span>',
      '  </div>',
      '  <div class="terminal-line" style="margin-top:8px;">',
      '    <span class="terminal-prompt">$</span>',
      '    <span class="terminal-cursor" aria-hidden="true"></span>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  function updateSpecs(data) {
    var usedCats = data.categories.filter(function (cat) {
      return data.items.some(function (t) { return t.category === cat.id; });
    });
    var primary = data.items.filter(function (t) { return t.primary; });

    var elTotal = document.getElementById('spec-total');
    var elCats = document.getElementById('spec-cats');
    var elPrimary = document.getElementById('spec-primary');

    if (elTotal) elTotal.textContent = data.items.length;
    if (elCats) elCats.textContent = usedCats.length;
    if (elPrimary) elPrimary.textContent = primary.length;
  }

  function render(data) {
    var root = document.getElementById('tech-root');
    var terminal = document.getElementById('terminal-block');
    if (!root) return;

    var usedCats = data.categories.filter(function (cat) {
      return data.items.some(function (t) { return t.category === cat.id; });
    });

    root.innerHTML = usedCats.map(function (cat, i) {
      var techs = data.items.filter(function (t) { return t.category === cat.id; });
      return buildCategorySection(cat, techs, i);
    }).join('\n');

    if (terminal) terminal.innerHTML = buildTerminal(data);

    if (window.LAB && window.LAB.reveal) {
      window.LAB.reveal();
    } else {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
    }
    jumpToHash();
  }

  function jumpToHash() {
    var hash = window.location.hash.slice(1);
    if (!hash) return;
    var target = document.getElementById(hash);
    if (!target) return;
    setTimeout(function () {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('highlight-flash');
      setTimeout(function () { target.classList.remove('highlight-flash'); }, 2200);
    }, 150);
  }

  function showError() {
    var root = document.getElementById('tech-root');
    if (root) {
      root.innerHTML = [
        '<div class="empty-state">',
        '  <p class="empty-title">読み込みに失敗しました</p>',
        '  <p class="empty-desc">技術スタックの取得中に通信エラーが発生しました。時間をおいて再度お試しください。</p>',
        '</div>'
      ].join('\n');
    }
  }

  function init() {
    var loading = document.getElementById('loading-state');

    fetch('/assets/data/v2/technologies.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        if (loading) loading.style.display = 'none';
        updateSpecs(data);
        render(data);
      })
      .catch(function (err) {
        console.error('technologies.json load error:', err);
        if (loading) loading.style.display = 'none';
        showError();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
