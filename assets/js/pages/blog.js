  (function () {
    'use strict';

    var PER_PAGE = 10;
    var state = {
      all:      [],
      filtered: [],
      cat:      'all',
      tag:      null,
      month:    null,
      page:     1,
      cats:     []
    };

    var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12H19M19 12L13 6M19 12L13 18"/></svg>';

    function esc(s) {
      return String(s || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function fmtDate(iso) {
      if (!iso) return '';
      return iso.slice(0, 10).replace(/-/g, '.');
    }

    function fmtMonth(iso) {
      if (!iso) return '';
      return iso.slice(0, 7).replace('-', '.');
    }

    /* ── 記事カード ── */
    function buildCard(article) {
      var cat    = esc(article.category || 'tech');
      var tags   = (article.tags || []).map(function(t){
        return '<span class="article-tag">' + esc(t) + '</span>';
      }).join('');
      var reading = article.readingTime ? article.readingTime + ' min read' : '';
      var href   = '/blog/' + esc(article.slug) + '/';

      var featuredLabel = article.featured
        ? '<span class="featured-label"><span class="featured-label-dot"></span>Featured</span>'
        : '';

      return [
        '<a class="article-card reveal' + (article.featured ? ' featured' : '') + '"',
        '   href="' + href + '"',
        '   data-cat="' + cat + '"',
        '   data-slug="' + esc(article.slug) + '"',
        '   aria-label="' + esc(article.title) + ' — 記事を読む">',
        '  <div class="article-card-body">',
        featuredLabel,
        '    <div class="article-card-meta">',
        '      <span class="article-cat-badge" data-cat="' + cat + '">' + esc(getCatLabel(article.category)) + '</span>',
        '      <span class="article-date">'        + fmtDate(article.publishedAt) + '</span>',
        reading ? '<span class="article-reading-time">' + reading + '</span>' : '',
        '    </div>',
        '    <h2 class="article-card-title">' + esc(article.title) + '</h2>',
        '    <p class="article-card-excerpt">'  + esc(article.excerpt) + '</p>',
        tags ? '<div class="article-tags">' + tags + '</div>' : '',
        '  </div>',
        '  <span class="article-card-arrow">' + ARROW + '</span>',
        '</a>'
      ].join('\n');
    }

    function getCatLabel(catId) {
      var found = state.cats.filter(function(c){ return c.id === catId; })[0];
      return found ? found.label : (catId || '');
    }

    /* ── 空の状態 ── */
    function buildEmpty() {
      return [
        '<div class="empty-state">',
        '  <svg class="empty-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="8" y="12" width="48" height="40" rx="4"/><path d="M16 24h32M16 32h24M16 40h16"/></svg>',
        '  <p class="empty-title">記事準備中</p>',
        '  <p class="empty-desc">現在のフィルターに一致する記事はありません。<br>別のカテゴリをお試しください。</p>',
        '  <span class="empty-badge">Coming Soon</span>',
        '</div>'
      ].join('\n');
    }

    /* ── フィルタリング ── */
    function applyFilter() {
      state.filtered = state.all.filter(function(a) {
        if (a.status !== 'published') return false;
        var catOk  = state.cat  === 'all' || a.category === state.cat;
        var tagOk  = !state.tag  || (a.tags || []).indexOf(state.tag)  !== -1;
        var monOk  = !state.month || (a.publishedAt || '').slice(0,7) === state.month;
        return catOk && tagOk && monOk;
      });
      state.page = 1;
      renderArticles();
      renderPagination();
      updateCount();
    }

    /* ── 記事リスト描画 ── */
    function renderArticles() {
      var grid = document.getElementById('articles-grid');
      if (!grid) return;

      var start   = (state.page - 1) * PER_PAGE;
      var pageItems = state.filtered.slice(start, start + PER_PAGE);

      if (pageItems.length === 0) {
        grid.innerHTML = buildEmpty();
      } else {
        grid.innerHTML = pageItems.map(buildCard).join('\n');
        grid.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
      }

      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ── 件数更新 ── */
    function updateCount() {
      var el = document.getElementById('result-count');
      if (el) el.textContent = state.filtered.length + ' articles';
    }

    /* ── ページネーション ── */
    function renderPagination() {
      var nav   = document.getElementById('pagination');
      if (!nav) return;

      var total = Math.ceil(state.filtered.length / PER_PAGE);
      if (total <= 1) { nav.innerHTML = ''; return; }

      var html = '';
      html += '<button class="page-btn" id="pg-prev" aria-label="前のページ" ' + (state.page <= 1 ? 'disabled' : '') + '>';
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14" aria-hidden="true"><path d="M19 12H5M5 12l6-6M5 12l6 6"/></svg></button>';

      for (var i = 1; i <= total; i++) {
        html += '<button class="page-btn' + (i === state.page ? ' active' : '') + '" data-page="' + i + '" aria-label="' + i + 'ページ目" aria-current="' + (i === state.page ? 'page' : 'false') + '">' + i + '</button>';
      }

      html += '<button class="page-btn" id="pg-next" aria-label="次のページ" ' + (state.page >= total ? 'disabled' : '') + '>';
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14" aria-hidden="true"><path d="M5 12h14M19 12l-6-6M19 12l-6 6"/></svg></button>';

      nav.innerHTML = html;

      nav.querySelectorAll('[data-page]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          state.page = parseInt(btn.dataset.page, 10);
          renderArticles();
          renderPagination();
        });
      });

      var prev = document.getElementById('pg-prev');
      var next = document.getElementById('pg-next');
      if (prev) prev.addEventListener('click', function(){ if (state.page > 1){ state.page--; renderArticles(); renderPagination(); } });
      if (next) next.addEventListener('click', function(){ if (state.page < total){ state.page++; renderArticles(); renderPagination(); } });
    }

    /* ── サイドバー：カテゴリ ── */
    function renderSidebarCats(navCats) {
      var el = document.getElementById('sidebar-cats');
      if (!el) return;

      var counts = {};
      state.all.filter(function(a){ return a.status === 'published'; }).forEach(function(a){
        counts[a.category] = (counts[a.category] || 0) + 1;
      });

      var total = state.all.filter(function(a){ return a.status === 'published'; }).length;

      var html = '<button class="sidebar-cat-btn active" data-cat="all">All<span class="sidebar-cat-count">' + total + '</span></button>';
      navCats.forEach(function(cat) {
        var c = counts[cat.id] || 0;
        if (c === 0) return;
        html += '<button class="sidebar-cat-btn" data-cat="' + esc(cat.id) + '">' + esc(cat.label) + '<span class="sidebar-cat-count">' + c + '</span></button>';
      });

      el.innerHTML = html;

      el.querySelectorAll('.sidebar-cat-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var cat = btn.dataset.cat;
          state.cat  = cat;
          state.tag  = null;
          state.month = null;
          syncCatFilter(cat);
          applyFilter();
          el.querySelectorAll('.sidebar-cat-btn').forEach(function(b){
            b.classList.toggle('active', b === btn);
          });
        });
      });
    }

    /* ── サイドバー：タグクラウド ── */
    function renderTagCloud() {
      var el = document.getElementById('tag-cloud');
      if (!el) return;

      var tagCounts = {};
      state.all.filter(function(a){ return a.status === 'published'; }).forEach(function(a){
        (a.tags || []).forEach(function(t){ tagCounts[t] = (tagCounts[t] || 0) + 1; });
      });

      var tags = Object.keys(tagCounts).sort(function(a,b){ return tagCounts[b] - tagCounts[a]; }).slice(0, 20);

      if (tags.length === 0) {
        var card = document.getElementById('sidebar-tags-card');
        if (card) card.style.display = 'none';
        return;
      }

      el.innerHTML = tags.map(function(t) {
        return '<button class="tag-cloud-btn" data-tag="' + esc(t) + '">' + esc(t) + '</button>';
      }).join('');

      el.querySelectorAll('.tag-cloud-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var tag = btn.dataset.tag;
          if (state.tag === tag) {
            state.tag = null;
            btn.classList.remove('active');
          } else {
            state.tag = tag;
            el.querySelectorAll('.tag-cloud-btn').forEach(function(b){ b.classList.remove('active'); });
            btn.classList.add('active');
          }
          applyFilter();
        });
      });
    }

    /* ── サイドバー：アーカイブ ── */
    function renderArchive() {
      var el = document.getElementById('archive-list');
      if (!el) return;

      var monthCounts = {};
      state.all.filter(function(a){ return a.status === 'published'; }).forEach(function(a){
        var m = (a.publishedAt || '').slice(0,7);
        if (m) monthCounts[m] = (monthCounts[m] || 0) + 1;
      });

      var months = Object.keys(monthCounts).sort(function(a,b){ return b.localeCompare(a); });

      if (months.length === 0) {
        var card = document.getElementById('sidebar-archive-card');
        if (card) card.style.display = 'none';
        return;
      }

      el.innerHTML = months.map(function(m) {
        return '<button class="archive-item" data-month="' + esc(m) + '">' +
          '<span>' + m.replace('-', '.') + '</span>' +
          '<span class="archive-count">' + monthCounts[m] + '</span>' +
        '</button>';
      }).join('');

      el.querySelectorAll('.archive-item').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var month = btn.dataset.month;
          state.month = (state.month === month) ? null : month;
          applyFilter();
        });
      });
    }

    /* ── カテゴリフィルターバー同期 ── */
    function syncCatFilter(cat) {
      document.querySelectorAll('#cat-filter-group .filter-btn').forEach(function(btn) {
        var match = btn.dataset.cat === cat;
        btn.classList.toggle('active', match);
        btn.setAttribute('aria-pressed', String(match));
      });
    }

    /* ── カテゴリフィルターバー設定 ── */
    function setupCatFilter() {
      document.querySelectorAll('#cat-filter-group .filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var cat = btn.dataset.cat;
          state.cat   = cat;
          state.tag   = null;
          state.month = null;
          syncCatFilter(cat);
          applyFilter();
          /* サイドバーも同期 */
          document.querySelectorAll('#sidebar-cats .sidebar-cat-btn').forEach(function(b){
            b.classList.toggle('active', b.dataset.cat === cat);
          });
        });
      });
    }

    /* ── メイン ── */
    function loadBlog() {
      var loading = document.getElementById('loading-state');
      var errEl   = document.getElementById('error-state');
      var layout  = document.getElementById('blog-layout');

      if (loading) loading.style.display = 'flex';
      if (errEl)   errEl.style.display   = 'none';
      if (layout)  layout.style.display  = 'none';

      Promise.all([
        fetch('/assets/data/articles.json').then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }),
        fetch('/assets/data/navigation.json').then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
      ])
      .then(function(results) {
        var articleData = results[0];
        var navData     = results[1];

        state.all  = articleData.articles || [];
        state.cats = (navData.blogCategories || []);

        if (loading) loading.style.display = 'none';
        if (layout)  layout.style.display  = '';

        applyFilter();
        setupCatFilter();
        renderSidebarCats(state.cats);
        renderTagCloud();
        renderArchive();

        if (window.LAB && window.LAB.reveal) window.LAB.reveal();
      })
      .catch(function(err) {
        console.error('Blog data load error:', err);
        if (loading) loading.style.display = 'none';
        if (errEl)   errEl.style.display   = 'block';
      });
    }

    var retryBtnBlog = document.getElementById('retry-btn');
    if (retryBtnBlog) {
      retryBtnBlog.addEventListener('click', loadBlog);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadBlog);
    } else {
      loadBlog();
    }
  })();