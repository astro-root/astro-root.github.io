(function () {
  'use strict';

  var CAT_COLOR = {
    physics: '#8b72ff',
    astronomy: '#ffb340',
    mathematics: '#00e5b8',
    cs: '#3b9eff',
    quiz: '#ff6b6b',
    other: '#7d9ab8'
  };

  var STATUS_LABEL = {
    idea: 'Idea',
    ongoing: 'Ongoing',
    completed: 'Completed',
    paused: 'Paused'
  };

  var state = { all: [], category: 'all', catLabel: {} };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtDate(iso) {
    if (!iso) return '';
    return iso.slice(0, 10).replace(/-/g, '.');
  }

  function buildCard(item) {
    var color = CAT_COLOR[item.category] || CAT_COLOR.other;
    var catLabel = state.catLabel[item.category] || item.category;
    var tags = (item.tags || []).map(function (t) {
      return '<span class="research-tag">' + esc(t) + '</span>';
    }).join('');
    var related = (item.relatedProjects || []).map(function (id) {
      return '<a href="/projects/' + esc(id) + '/">' + esc(id) + ' →</a>';
    }).join('');

    return [
      '<article class="research-card reveal" id="' + esc(item.id) + '">',
      '  <div class="research-card-top">',
      '    <span class="research-cat-badge" style="--rc-color:' + color + '">' + esc(catLabel) + '</span>',
      '    <span class="research-status" data-status="' + esc(item.status) + '">' + esc(STATUS_LABEL[item.status] || item.status) + '</span>',
      '    <span class="research-updated">Updated ' + fmtDate(item.updatedAt) + '</span>',
      '  </div>',
      '  <h3 class="research-card-title">' + esc(item.title) + '</h3>',
      '  <p class="research-card-summary">' + esc(item.summary) + '</p>',
      '  <div class="research-card-footer">',
      tags ? '    <div class="research-tags">' + tags + '</div>' : '',
      related ? '    <div class="research-related">' + related + '</div>' : '',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function render() {
    var root = document.getElementById('research-grid');
    var count = document.getElementById('result-count');
    if (!root) return;

    var filtered = state.all.filter(function (item) {
      return state.category === 'all' || item.category === state.category;
    }).sort(function (a, b) { return (b.updatedAt || '').localeCompare(a.updatedAt || ''); });

    if (count) count.textContent = filtered.length + ' themes';

    if (filtered.length === 0) {
      root.innerHTML = [
        '<div class="empty-state">',
        '  <svg class="empty-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="32" cy="32" r="24"/><path d="M32 20v14l8 6"/></svg>',
        '  <p class="empty-title">テーマがありません</p>',
        '  <p class="empty-desc">現在のフィルターに一致するテーマはありません。</p>',
        '</div>'
      ].join('\n');
      return;
    }

    root.innerHTML = filtered.map(buildCard).join('\n');
    if (window.LAB && window.LAB.reveal) {
      window.LAB.reveal();
    } else {
      root.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
    }
  }

  /* URLに #id が付いている場合、該当カードまでスクロールしてハイライト */
  function jumpToHash() {
    var hash = window.location.hash.slice(1);
    if (!hash) return;
    var target = document.getElementById(hash);
    if (!target) return;
    setTimeout(function () {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('visible');
      target.classList.add('highlight-flash');
      setTimeout(function () { target.classList.remove('highlight-flash'); }, 2200);
    }, 150);
  }

  function renderFilterBar(data) {
    var bar = document.getElementById('filter-bar');
    if (!bar) return;
    var usedCats = {};
    data.items.forEach(function (i) { usedCats[i.category] = true; });
    var cats = data.categories.filter(function (c) { return usedCats[c.id]; });

    var html = ['<button class="filter-btn active" data-cat="all" aria-pressed="true"><span class="filter-btn-dot"></span>All</button>'];
    cats.forEach(function (c) {
      html.push('<button class="filter-btn" data-cat="' + esc(c.id) + '" aria-pressed="false"><span class="filter-btn-dot"></span>' + esc(c.label) + '</button>');
    });
    bar.innerHTML = html.join('\n');

    bar.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.category = btn.dataset.cat;
        bar.querySelectorAll('.filter-btn').forEach(function (b) {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
        render();
      });
    });
  }

  function showLoadError() {
    var root = document.getElementById('research-grid');
    if (root) {
      root.innerHTML = [
        '<div class="empty-state">',
        '  <svg class="empty-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="32" cy="32" r="24"/><path d="M32 20v14l8 6"/></svg>',
        '  <p class="empty-title">読み込みに失敗しました</p>',
        '  <p class="empty-desc">通信エラーが発生しました。時間をおいて再度お試しください。</p>',
        '</div>'
      ].join('\n');
    }
  }

  function init() {
    var loading = document.getElementById('loading-state');
    var layout = document.getElementById('research-layout');

    fetch('/assets/data/v2/research.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        data.categories.forEach(function (c) { state.catLabel[c.id] = c.label; });
        state.all = data.items || [];

        if (loading) loading.style.display = 'none';
        if (layout) layout.style.display = '';

        renderFilterBar(data);
        render();
        jumpToHash();
      })
      .catch(function (err) {
        console.error('research.json load error:', err);
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
