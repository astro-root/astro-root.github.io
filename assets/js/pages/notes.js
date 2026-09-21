(function () {
  'use strict';

  var CAT_CONFIG = {
    development: { label: 'Development', color: '#3b9eff', icon: 'code' },
    quiz:        { label: 'Quiz',        color: '#00e5b8', icon: 'quiz' },
    physics:     { label: 'Physics',     color: '#8b72ff', icon: 'atom' },
    astronomy:   { label: 'Astronomy',   color: '#ffb340', icon: 'scope' },
    study:       { label: 'Study',       color: '#ff6b6b', icon: 'book' },
    misc:        { label: 'Misc',        color: '#7d9ab8', icon: 'note' }
  };

  var ICONS = {
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 .5c0 1.5-2.5 1.7-2.5 3.5"/><circle cx="12" cy="16.5" r=".3" fill="currentColor"/></svg>',
    atom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="1.5" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/></svg>',
    scope: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v3l2 2"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
  };

  var ARROW_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12H19M19 12L13 6M19 12L13 18"/></svg>';

  var state = { all: [], category: 'all' };

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtDate(iso) {
    if (!iso) return '';
    return iso.slice(0, 10).replace(/-/g, '.');
  }

  function fmtMonth(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.getFullYear() + '年 ' + (d.getMonth() + 1) + '月';
  }

  function getYear(iso) { return iso ? iso.slice(0, 4) : ''; }

  function buildNoteItem(note) {
    var cat = note.category || 'misc';
    var cfg = CAT_CONFIG[cat] || CAT_CONFIG.misc;
    var icon = ICONS[cfg.icon] || ICONS.note;
    var tags = (note.tags || []).map(function (t) { return '<span class="log-tag">' + esc(t) + '</span>'; }).join('');
    var link = note.relatedProject
      ? '<a class="log-link" href="/projects/' + esc(note.relatedProject) + '/">' + ARROW_ICON + ' 関連プロジェクトを見る</a>'
      : '';

    return [
      '<article class="log-item reveal" id="' + esc(note.id) + '" data-type="' + esc(cat) + '" aria-label="' + esc(note.title) + '">',
      '  <div class="log-left">',
      '    <div class="log-icon" data-type="' + esc(cat) + '" aria-hidden="true">' + icon + '</div>',
      '    <div class="log-vline" aria-hidden="true"></div>',
      '  </div>',
      '  <div class="log-right">',
      '    <div class="log-header">',
      '      <span class="log-type-badge" data-type="' + esc(cat) + '">' + esc(cfg.label) + '</span>',
      '      <time class="log-date" datetime="' + esc(note.date) + '">' + fmtDate(note.date) + '</time>',
      '    </div>',
      '    <h3 class="log-title">' + esc(note.title) + '</h3>',
      note.summary ? '<p class="log-body">' + esc(note.summary) + '</p>' : '',
      tags ? '<div class="log-tags">' + tags + '</div>' : '',
      link,
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function renderTimeline(notes) {
    var timeline = document.getElementById('timeline');
    if (!timeline) return;

    if (notes.length === 0) {
      timeline.innerHTML = [
        '<div class="empty-state">',
        '  <svg class="empty-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="8" y="8" width="48" height="48" rx="4"/><path d="M8 24h48M8 40h48M24 8v48"/></svg>',
        '  <p class="empty-title">ノートがありません</p>',
        '  <p class="empty-desc">現在のフィルターに一致するノートはありません。</p>',
        '</div>'
      ].join('\n');
      return;
    }

    var yearMap = {};
    notes.forEach(function (n) {
      var y = getYear(n.date);
      var m = n.date ? n.date.slice(0, 7) : 'unknown';
      if (!yearMap[y]) yearMap[y] = {};
      if (!yearMap[y][m]) yearMap[y][m] = [];
      yearMap[y][m].push(n);
    });

    var years = Object.keys(yearMap).sort(function (a, b) { return b - a; });
    var html = '';

    years.forEach(function (year) {
      html += '<div class="year-group">';
      html += '<div class="year-label" aria-hidden="true">' + esc(year) + '</div>';

      var months = Object.keys(yearMap[year]).sort(function (a, b) { return b.localeCompare(a); });
      months.forEach(function (month) {
        var items = yearMap[year][month];
        html += '<div class="month-group">';
        html += '<p class="month-label" aria-hidden="true">' + fmtMonth(items[0].date) + '</p>';
        items.forEach(function (n) { html += buildNoteItem(n); });
        html += '</div>';
      });
      html += '</div>';
    });

    timeline.innerHTML = html;
    timeline.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
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

  function applyFilter() {
    var filtered = state.all.filter(function (n) {
      return state.category === 'all' || n.category === state.category;
    });

    var count = document.getElementById('result-count');
    if (count) count.textContent = filtered.length + ' notes';

    renderTimeline(filtered);
  }

  function setupFilter() {
    var btns = document.querySelectorAll('#filter-bar .filter-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.category = btn.dataset.type;
        btns.forEach(function (b) {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
        applyFilter();
      });
    });
  }

  function renderStats() {
    var el = document.getElementById('stat-list');
    if (!el) return;

    var counts = {};
    state.all.forEach(function (n) {
      var c = n.category || 'misc';
      counts[c] = (counts[c] || 0) + 1;
    });

    var cats = Object.keys(CAT_CONFIG);
    var maxCnt = Math.max.apply(null, cats.map(function (c) { return counts[c] || 0; })) || 1;

    var html = '';
    cats.forEach(function (c) {
      var cfg = CAT_CONFIG[c];
      var cnt = counts[c] || 0;
      if (cnt === 0) return;
      var pct = Math.round((cnt / maxCnt) * 100);
      html += [
        '<div class="stat-row">',
        '  <span class="stat-row-label">',
        '    <span class="stat-row-dot" style="background:' + cfg.color + '"></span>',
        '    ' + esc(cfg.label),
        '  </span>',
        '  <span class="stat-row-value">' + cnt + '</span>',
        '</div>',
        '<div class="stat-bar-wrap">',
        '  <div class="stat-bar-fill" style="width:' + pct + '%;background:' + cfg.color + '"></div>',
        '</div>'
      ].join('\n');
    });

    el.innerHTML = html || '<p style="font-family:var(--font-mono);font-size:0.60rem;color:var(--text-2);">ノートなし</p>';
  }

  function renderRecent() {
    var el = document.getElementById('recent-list');
    var card = document.getElementById('recent-card');
    if (!el) return;

    var recent = state.all.slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    }).slice(0, 5);

    if (recent.length === 0) {
      if (card) card.style.display = 'none';
      return;
    }

    el.innerHTML = recent.map(function (n) {
      var cfg = CAT_CONFIG[n.category] || CAT_CONFIG.misc;
      return [
        '<div class="recent-item">',
        '  <p class="recent-item-date" style="color:' + cfg.color + '">' + fmtDate(n.date) + ' · ' + esc(cfg.label) + '</p>',
        '  <p class="recent-item-title">' + esc(n.title) + '</p>',
        '</div>'
      ].join('');
    }).join('');
  }

  function showLoadError() {
    var timeline = document.getElementById('timeline');
    if (timeline) {
      timeline.innerHTML = [
        '<div class="empty-state">',
        '  <svg class="empty-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="32" cy="32" r="24"/><path d="M32 20v14l8 6"/></svg>',
        '  <p class="empty-title">読み込みに失敗しました</p>',
        '  <p class="empty-desc">ノートの取得中に通信エラーが発生しました。時間をおいて再度お試しください。</p>',
        '</div>'
      ].join('\n');
    }
  }

  function init() {
    var loading = document.getElementById('loading-state');
    var layout = document.getElementById('log-layout');

    fetch('/assets/data/v2/notes.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        state.all = (data.items || []).sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

        if (loading) loading.style.display = 'none';
        if (layout) layout.style.display = '';

        applyFilter();
        setupFilter();
        renderStats();
        renderRecent();

        if (window.LAB && window.LAB.reveal) window.LAB.reveal();
        jumpToHash();
      })
      .catch(function (err) {
        console.error('notes.json load error:', err);
        if (loading) loading.style.display = 'none';
        if (layout) layout.style.display = '';
        showLoadError();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
