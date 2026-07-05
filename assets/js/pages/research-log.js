  (function () {
    'use strict';

    /* ── 定数 ── */
    var TYPE_CONFIG = {
      release:     { label: 'Release',     color: '#00e5b8', icon: 'rocket'  },
      update:      { label: 'Update',      color: '#3b9eff', icon: 'refresh' },
      study:       { label: 'Study',       color: '#8b72ff', icon: 'book'    },
      observation: { label: 'Observation', color: '#ffb340', icon: 'scope'   },
      event:       { label: 'Event',       color: '#ff6b6b', icon: 'star'    },
      note:        { label: 'Note',        color: '#7d9ab8', icon: 'note'    }
    };

    var TYPE_ICONS = {
      rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
      refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>',
      book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      scope: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v3l2 2"/></svg>',
      star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>'
    };

    var EXTERNAL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
    var ARROW_ICON   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12H19M19 12L13 6M19 12L13 18"/></svg>';

    var state = { all: [], filtered: [], type: 'all' };

    /* ── ユーティリティ ── */
    function esc(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

    /* ── ログアイテムHTML ── */
    function buildLogItem(log) {
      var type   = log.type || 'note';
      var cfg    = TYPE_CONFIG[type] || TYPE_CONFIG.note;
      var icon   = TYPE_ICONS[cfg.icon] || TYPE_ICONS.note;
      var tags   = (log.tags || []).map(function(t){ return '<span class="log-tag">' + esc(t) + '</span>'; }).join('');
      var link   = '';
      if (log.relatedUrl) {
        var ext = log.relatedType === 'external';
        link = '<a class="log-link" href="' + esc(log.relatedUrl) + '"' +
               (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
               (ext ? EXTERNAL_ICON : ARROW_ICON) + ' ' + esc(log.relatedUrl.replace(/^https?:\/\//, '').split('/')[0]) +
               '</a>';
      } else if (log.relatedId && log.relatedType === 'article') {
        link = '<a class="log-link" href="/blog/' + esc(log.relatedId) + '/">' + ARROW_ICON + ' 記事を読む</a>';
      } else if (log.relatedId && log.relatedType === 'project') {
        link = '<a class="log-link" href="/projects/">' + ARROW_ICON + ' Projects</a>';
      }

      return [
        '<article class="log-item reveal" data-type="' + esc(type) + '" aria-label="' + esc(log.title) + '">',
        '  <div class="log-left">',
        '    <div class="log-icon" data-type="' + esc(type) + '" aria-hidden="true">' + icon + '</div>',
        '    <div class="log-vline" aria-hidden="true"></div>',
        '  </div>',
        '  <div class="log-right">',
        '    <div class="log-header">',
        '      <span class="log-type-badge" data-type="' + esc(type) + '">' + esc(cfg.label) + '</span>',
        '      <time class="log-date" datetime="' + esc(log.date) + '">' + fmtDate(log.date) + '</time>',
        '    </div>',
        '    <h3 class="log-title">' + esc(log.title) + '</h3>',
        log.body ? '<p class="log-body">' + esc(log.body) + '</p>' : '',
        tags     ? '<div class="log-tags">' + tags + '</div>' : '',
        link,
        '  </div>',
        '</article>'
      ].join('\n');
    }

    /* ── タイムライン描画 ── */
    function renderTimeline(logs) {
      var timeline = document.getElementById('timeline');
      if (!timeline) return;

      if (logs.length === 0) {
        timeline.innerHTML = [
          '<div class="empty-state">',
          '  <svg class="empty-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="8" y="8" width="48" height="48" rx="4"/><path d="M8 24h48M8 40h48M24 8v48"/></svg>',
          '  <p class="empty-title">ログがありません</p>',
          '  <p class="empty-desc">現在のフィルターに一致するログはありません。</p>',
          '</div>'
        ].join('\n');
        return;
      }

      /* 年 → 月 でグループ化 */
      var yearMap = {};
      logs.forEach(function(log) {
        var y = getYear(log.date);
        var m = log.date ? log.date.slice(0, 7) : 'unknown';
        if (!yearMap[y]) yearMap[y] = {};
        if (!yearMap[y][m]) yearMap[y][m] = [];
        yearMap[y][m].push(log);
      });

      var years = Object.keys(yearMap).sort(function(a,b){ return b - a; });
      var html  = '';

      years.forEach(function(year) {
        html += '<div class="year-group">';
        html += '<div class="year-label" aria-hidden="true">' + esc(year) + '</div>';

        var months = Object.keys(yearMap[year]).sort(function(a,b){ return b.localeCompare(a); });
        months.forEach(function(month) {
          var items = yearMap[year][month];
          html += '<div class="month-group">';
          html += '<p class="month-label" aria-hidden="true">' + fmtMonth(items[0].date) + '</p>';
          items.forEach(function(log) { html += buildLogItem(log); });
          html += '</div>';
        });
        html += '</div>';
      });

      timeline.innerHTML = html;
      timeline.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
    }

    /* ── フィルタリング ── */
    function applyFilter() {
      state.filtered = state.all.filter(function(log) {
        if (log.visibility === 'private') return false;
        return state.type === 'all' || log.type === state.type;
      });

      var count = document.getElementById('result-count');
      if (count) count.textContent = state.filtered.length + ' logs';

      renderTimeline(state.filtered);
    }

    /* ── フィルターボタン ── */
    function setupFilter() {
      var btns = document.querySelectorAll('#filter-bar .filter-btn');
      btns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          state.type = btn.dataset.type;
          btns.forEach(function(b) {
            b.classList.toggle('active', b === btn);
            b.setAttribute('aria-pressed', String(b === btn));
          });
          applyFilter();
        });
      });
    }

    /* ── サイドバー：統計 ── */
    function renderStats() {
      var el = document.getElementById('stat-list');
      if (!el) return;

      var counts = {};
      var total  = 0;
      state.all.forEach(function(log) {
        if (log.visibility === 'private') return;
        var t = log.type || 'note';
        counts[t] = (counts[t] || 0) + 1;
        total++;
      });

      var types  = Object.keys(TYPE_CONFIG);
      var maxCnt = Math.max.apply(null, types.map(function(t){ return counts[t] || 0; })) || 1;

      var html = '';
      types.forEach(function(t) {
        var cfg = TYPE_CONFIG[t];
        var cnt = counts[t] || 0;
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

      if (!html) {
        el.innerHTML = '<p style="font-family:var(--font-mono);font-size:0.60rem;color:var(--text-2);">ログなし</p>';
      } else {
        el.innerHTML = html;
      }
    }

    /* ── サイドバー：最近の活動 ── */
    function renderRecent() {
      var el   = document.getElementById('recent-list');
      var card = document.getElementById('recent-card');
      if (!el) return;

      var pub = state.all
        .filter(function(l){ return l.visibility !== 'private'; })
        .sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); })
        .slice(0, 5);

      if (pub.length === 0) {
        if (card) card.style.display = 'none';
        return;
      }

      el.innerHTML = pub.map(function(log) {
        var cfg = TYPE_CONFIG[log.type] || TYPE_CONFIG.note;
        return [
          '<div class="recent-item">',
          '  <p class="recent-item-date" style="color:' + cfg.color + '">' + fmtDate(log.date) + ' · ' + esc(cfg.label) + '</p>',
          '  <p class="recent-item-title">' + esc(log.title) + '</p>',
          '</div>'
        ].join('\n');
      }).join('');
    }

    /* ── デモエントリ（ログが空の場合に表示するサンプル） ── */
    function injectDemoLogs() {
      var today = new Date();
      var fmt   = function(d) { return d.toISOString().slice(0,10); };

      return [
        {
          id: 'demo-001', type: 'release', title: 'るーとの研究室 リニューアル完了',
          body: '全面リニューアル。研究室探索UIを実装。Projects / Study / Blog / Lab / Astronomy / Research Log の各ページを新規作成。',
          date: fmt(today), tags: ['Web', 'Design', 'Milestone'], visibility: 'public',
          relatedType: null, relatedId: null, relatedUrl: null
        },
        {
          id: 'demo-002', type: 'update', title: 'Phase 1〜9 実装完了',
          body: '基盤整備・トップページSVG研究室UI・データスキーマ・各コンテンツページの実装が完了。',
          date: fmt(new Date(today.getTime() - 1 * 86400000)),
          tags: ['Development', 'GitHub'], visibility: 'public',
          relatedType: null, relatedId: null, relatedUrl: null
        },
        {
          id: 'demo-003', type: 'study', title: 'ハッブルテンションについて調査',
          body: 'CMB由来の H₀ = 67.4 km/s/Mpc と局所観測値 73 km/s/Mpc の乖離「ハッブルテンション」について文献調査を実施。',
          date: fmt(new Date(today.getTime() - 3 * 86400000)),
          tags: ['Cosmology', 'Hubble', 'Tension'], visibility: 'public',
          relatedType: 'external', relatedId: null, relatedUrl: 'https://arxiv.org'
        },
        {
          id: 'demo-004', type: 'observation', title: '木星・土星 同時観測',
          body: '天頂付近で木星の縞模様と大赤斑、土星の環（カッシーニ間隙）を確認。シーイング：4/5。',
          date: fmt(new Date(today.getTime() - 7 * 86400000)),
          tags: ['Jupiter', 'Saturn', 'Planetary'], visibility: 'public',
          relatedType: 'external', relatedId: null, relatedUrl: null
        },
        {
          id: 'demo-005', type: 'event', title: 'AstroHigh 定例ミーティング',
          body: '高校生天文学コミュニティ AstroHigh の定例オンラインミーティング。最新の天文ニュースについて議論。',
          date: fmt(new Date(today.getTime() - 10 * 86400000)),
          tags: ['AstroHigh', 'Community'], visibility: 'public',
          relatedType: 'external', relatedId: null, relatedUrl: 'https://x.com/AstroHigh_Info'
        },
        {
          id: 'demo-006', type: 'release', title: 'Q-Room アップデート v2.3',
          body: 'リアルタイムオンラインクイズルーム Q-Room をアップデート。新ルール3種を追加・UIを改善。',
          date: fmt(new Date(today.getTime() - 14 * 86400000)),
          tags: ['Q-Room', 'Quiz', 'Release'], visibility: 'public',
          relatedType: 'project', relatedId: 'q-room', relatedUrl: null
        },
        {
          id: 'demo-007', type: 'note', title: '軌道力学シミュレーション 設計メモ',
          body: 'ケプラー方程式の数値解法（二分法 / Newton-Raphson法）の比較と実装方針を整理。TypeScript + Canvas API で実装予定。',
          date: fmt(new Date(today.getTime() - 18 * 86400000)),
          tags: ['Simulation', 'TypeScript', 'Math'], visibility: 'public',
          relatedType: null, relatedId: null, relatedUrl: null
        }
      ];
    }

    /* ── メイン ── */
    function init() {
      var loading = document.getElementById('loading-state');
      var layout  = document.getElementById('log-layout');
      var notice  = document.getElementById('demo-notice');

      fetch('/assets/data/research-log.json')
        .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function(data) {
          var logs = (data.logs || []).sort(function(a,b){
            return (b.date||'').localeCompare(a.date||'');
          });

          /* ログが空ならデモエントリを表示 */
          if (logs.length === 0) {
            state.all = injectDemoLogs();
            if (notice) notice.style.display = 'block';
          } else {
            state.all = logs;
          }

          if (loading) loading.style.display = 'none';
          if (layout)  layout.style.display  = '';

          applyFilter();
          setupFilter();
          renderStats();
          renderRecent();

          if (window.LAB && window.LAB.reveal) window.LAB.reveal();
        })
        .catch(function(err) {
          console.error('research-log.json load error:', err);
          /* エラー時もデモ表示 */
          state.all = injectDemoLogs();
          if (loading) loading.style.display = 'none';
          if (layout)  layout.style.display  = '';
          if (notice)  notice.style.display  = 'block';
          applyFilter();
          setupFilter();
          renderStats();
          renderRecent();
        });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();