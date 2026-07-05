  (function () {
    'use strict';

    /* ── SVG アイコン定義 ── */
    var CAT_ICONS = {
      physics: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="32" cy="32" r="10"/><ellipse cx="32" cy="32" rx="28" ry="10" transform="rotate(0 32 32)"/><ellipse cx="32" cy="32" rx="28" ry="10" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="28" ry="10" transform="rotate(120 32 32)"/></svg>',
      astronomy: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="32" cy="32" r="14"/><path d="M32 6v6M32 52v6M6 32h6M52 32h6M14.1 14.1l4.2 4.2M45.7 45.7l4.2 4.2M45.7 18.3l-4.2 4.2M18.3 45.7l-4.2 4.2"/></svg>',
      mathematics: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 32h40M32 12v40M18 18l28 28M46 18L18 46"/></svg>',
      simulations: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="8" y="8" width="48" height="36" rx="4"/><path d="M8 36h48M20 44v12M44 44v12M14 56h36"/><path d="M22 24l8 6-8 6"/><path d="M34 28h8"/></svg>'
    };

    var ARROW_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="study-card-arrow" aria-hidden="true"><path d="M5 12H19M19 12L13 6M19 12L13 18"/></svg>';

    /* ══════ Astronomyタブ統合コンテンツ ══════ */
    var ASTRONOMY_EXTRA_HTML = [
      '<div class="astro-fact-strip">',
      '  <div class="astro-fact-item"><div class="astro-fact-value">88</div><div class="astro-fact-label">IAU Constellations</div></div>',
      '  <div class="astro-fact-item"><div class="astro-fact-value">13.8Gyr</div><div class="astro-fact-label">Age of Universe</div></div>',
      '  <div class="astro-fact-item"><div class="astro-fact-value">2000+</div><div class="astro-fact-label">Exoplanets Found</div></div>',
      '  <div class="astro-fact-item"><div class="astro-fact-value">c</div><div class="astro-fact-label">Speed of Light</div></div>',
      '</div>',
      '<div class="astro-banner">',
      '  <div>',
      '    <span class="astro-banner-badge">Community</span>',
      '    <p class="astro-banner-title">AstroHigh</p>',
      '    <p class="astro-banner-desc">高校生天文学者のためのコミュニティ。天体観測・論文読解・宇宙論の議論を行っています。管理者として運営に携わっています。</p>',
      '  </div>',
      '  <a class="astro-banner-link" href="https://x.com/AstroHigh_Info" target="_blank" rel="noopener noreferrer">',
      '    AstroHighを見る',
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12H19M19 12L13 6M19 12L13 18"/></svg>',
      '  </a>',
      '</div>',
      '<p class="astro-subhead">天体カタログ</p>',
      '<div class="astro-catalog-grid">',
      '  <div class="astro-catalog-card">',
      '    <div class="astro-catalog-preview"><svg viewBox="0 0 240 100" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="100" fill="rgba(2,8,20,1)"/><ellipse cx="120" cy="50" rx="80" ry="30" fill="none" stroke="rgba(75,169,255,0.2)" stroke-width="1" stroke-dasharray="4,4"/><circle cx="120" cy="50" r="9" fill="rgba(255,210,100,0.95)"/><circle cx="180" cy="50" r="3.5" fill="rgba(75,169,255,0.9)"/><circle cx="96" cy="34" r="3" fill="rgba(30,235,192,0.85)"/></svg></div>',
      '    <div class="astro-catalog-body"><p class="astro-catalog-name">太陽系</p><p class="astro-catalog-desc">太陽を中心に8惑星が公転する恒星系。地球は第3惑星。</p></div>',
      '  </div>',
      '  <div class="astro-catalog-card">',
      '    <div class="astro-catalog-preview"><svg viewBox="0 0 240 100" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="100" fill="rgba(2,8,20,1)"/><ellipse cx="120" cy="50" rx="16" ry="12" fill="rgba(255,220,160,0.3)"/><path d="M120 50 Q160 30 200 22" fill="none" stroke="rgba(180,180,255,0.3)" stroke-width="6" stroke-linecap="round"/><path d="M120 50 Q80 70 40 78" fill="none" stroke="rgba(180,180,255,0.3)" stroke-width="6" stroke-linecap="round"/><circle cx="150" cy="46" r="2.5" fill="rgba(255,220,100,0.9)"/></svg></div>',
      '    <div class="astro-catalog-body"><p class="astro-catalog-name">天の川銀河</p><p class="astro-catalog-desc">直径約10万光年の棒渦巻銀河。太陽はオリオン腕に位置。</p></div>',
      '  </div>',
      '  <div class="astro-catalog-card">',
      '    <div class="astro-catalog-preview"><svg viewBox="0 0 240 100" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="100" fill="rgba(2,8,20,1)"/><circle cx="120" cy="50" r="8" fill="none" stroke="rgba(156,135,255,0.3)" stroke-width="1"/><circle cx="120" cy="50" r="26" fill="none" stroke="rgba(156,135,255,0.18)" stroke-width="1" stroke-dasharray="3,3"/><circle cx="120" cy="16" r="3" fill="rgba(255,220,160,0.8)"/><circle cx="164" cy="34" r="2.5" fill="rgba(255,220,160,0.75)"/></svg></div>',
      '    <div class="astro-catalog-body"><p class="astro-catalog-name">ハッブル定数</p><p class="astro-catalog-desc">宇宙膨張速度を表す定数。CMB観測値と局所観測値の乖離が現代宇宙論の課題。</p></div>',
      '  </div>',
      '</div>',
      '<p class="astro-subhead">観測記録</p>',
      '<div class="astro-obs-empty"><strong>準備中</strong> — 天体望遠鏡による観測記録・スケッチを Research Log と連携して順次公開予定です。</div>',
      '<p class="astro-subhead">シミュレーション</p>',
      '<div class="astro-sim-grid">',
      '  <div class="astro-sim-card"><span class="astro-sim-card-label">Orbital Mechanics</span><p class="astro-sim-card-name">軌道力学</p><p class="astro-sim-card-desc">ケプラーの法則による惑星軌道の可視化（準備中）</p></div>',
      '  <div class="astro-sim-card"><span class="astro-sim-card-label">N-Body Problem</span><p class="astro-sim-card-name">多体問題</p><p class="astro-sim-card-desc">重力相互作用のリアルタイム計算（準備中）</p></div>',
      '  <div class="astro-sim-card"><span class="astro-sim-card-label">Galaxy Formation</span><p class="astro-sim-card-name">銀河形成</p><p class="astro-sim-card-desc">ダークマターハローへのガス降着モデル（準備中）</p></div>',
      '</div>'
    ].join('\n');

    /* ── シミュレーション用プレビューSVG ── */
    function makeSimPreview(subcat) {
      var previews = {
        orbital: '<svg class="sim-preview-svg" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="120" fill="rgba(2,8,20,1)"/><circle cx="150" cy="60" r="12" fill="rgba(255,200,80,0.9)"/><ellipse cx="150" cy="60" rx="80" ry="35" fill="none" stroke="rgba(59,158,255,0.3)" stroke-width="1" stroke-dasharray="4,4"/><circle cx="230" cy="60" r="5" fill="rgba(59,158,255,0.9)"/><ellipse cx="150" cy="60" rx="55" ry="24" fill="none" stroke="rgba(0,229,184,0.25)" stroke-width="1" stroke-dasharray="3,5"/><circle cx="113" cy="46" r="3.5" fill="rgba(0,229,184,0.85)"/><ellipse cx="150" cy="60" rx="110" ry="48" fill="none" stroke="rgba(139,114,255,0.18)" stroke-width="1" stroke-dasharray="6,6"/><circle cx="68" cy="85" r="2.5" fill="rgba(139,114,255,0.8)"/></svg>',
        'n-body': '<svg class="sim-preview-svg" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="120" fill="rgba(2,8,20,1)"/><circle cx="90" cy="50" r="8" fill="rgba(59,158,255,0.85)"/><circle cx="200" cy="70" r="6" fill="rgba(0,229,184,0.85)"/><circle cx="150" cy="35" r="5" fill="rgba(139,114,255,0.85)"/><circle cx="120" cy="90" r="4" fill="rgba(255,179,64,0.8)"/><path d="M90 50 Q120 30 150 35" fill="none" stroke="rgba(59,158,255,0.25)" stroke-width="1"/><path d="M150 35 Q175 52 200 70" fill="none" stroke="rgba(0,229,184,0.25)" stroke-width="1"/><path d="M200 70 Q160 80 120 90" fill="none" stroke="rgba(139,114,255,0.20)" stroke-width="1"/><path d="M120 90 Q105 70 90 50" fill="none" stroke="rgba(255,179,64,0.20)" stroke-width="1"/></svg>',
        wave: '<svg class="sim-preview-svg" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="120" fill="rgba(2,8,20,1)"/><path d="M10 60 Q35 20 60 60 Q85 100 110 60 Q135 20 160 60 Q185 100 210 60 Q235 20 260 60 Q285 100 290 60" fill="none" stroke="rgba(59,158,255,0.7)" stroke-width="2"/><path d="M10 60 Q35 35 60 60 Q85 85 110 60 Q135 35 160 60 Q185 85 210 60 Q235 35 260 60 Q285 85 290 60" fill="none" stroke="rgba(0,229,184,0.4)" stroke-width="1.5"/><line x1="10" y1="60" x2="290" y2="60" stroke="rgba(59,158,255,0.10)" stroke-width="1"/></svg>',
        fluid: '<svg class="sim-preview-svg" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="120" fill="rgba(2,8,20,1)"/><path d="M10 80 Q50 40 90 70 Q130 100 170 55 Q210 15 250 50 Q280 75 290 60" fill="rgba(59,158,255,0.08)" stroke="rgba(59,158,255,0.4)" stroke-width="1.5"/><path d="M10 90 Q55 55 95 80 Q135 108 175 68 Q215 28 255 62 Q282 82 290 70" fill="rgba(0,229,184,0.05)" stroke="rgba(0,229,184,0.3)" stroke-width="1"/></svg>',
        custom: '<svg class="sim-preview-svg" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="120" fill="rgba(2,8,20,1)"/><text x="150" y="55" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="rgba(255,179,64,0.5)">Custom Simulation</text><text x="150" y="75" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="9" fill="rgba(255,179,64,0.25)">Coming Soon</text></svg>'
      };
      return previews[subcat] || previews.custom;
    }

    /* ── 難易度ピップ ── */
    function makeDiffPips(level, cat) {
      var pips = '';
      for (var i = 1; i <= 5; i++) {
        pips += '<span class="diff-pip' + (i <= level ? ' filled" data-cat="' + cat + '"' : '"') + '></span>';
      }
      return pips;
    }

    /* ── 日付フォーマット ── */
    function fmtDate(iso) {
      if (!iso) return '';
      return iso.slice(0, 10).replace(/-/g, '.');
    }

    /* ── HTMLエスケープ ── */
    function esc(s) {
      return String(s || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* ── スタディカード生成 ── */
    function buildStudyCard(item, cat) {
      var href = item.slug ? '/study/' + item.slug + '/' : '#';
      return [
        '<a class="study-card reveal" href="' + esc(href) + '"',
        '   data-cat="' + esc(cat.id) + '"',
        '   data-subcat="' + esc(item.subcategory || '') + '">',
        '  <div class="card-meta">',
        '    <span class="card-subcat">' + esc(item.subcategory || cat.label) + '</span>',
        '    <div class="card-difficulty" aria-label="難易度 ' + (item.difficulty || 1) + '/5">',
        makeDiffPips(item.difficulty || 1, cat.id),
        '    </div>',
        '  </div>',
        '  <h3 class="study-card-title">' + esc(item.title) + '</h3>',
        '  <p class="study-card-excerpt">' + esc(item.excerpt || '') + '</p>',
        '  <div class="study-card-footer">',
        '    <span class="study-card-date">' + fmtDate(item.publishedAt) + '</span>',
        ARROW_SVG,
        '  </div>',
        '</a>'
      ].join('\n');
    }

    /* ── シミュレーションカード生成 ── */
    function buildSimCard(item) {
      var tags = (item.tags || []).map(function(t){
        return '<span class="sim-tech-tag">' + esc(t) + '</span>';
      }).join('');
      var href = item.slug ? '/study/' + item.slug + '/' : '#';
      var subcat = (item.simulation && item.simulation.type) ? item.simulation.type : (item.subcategory || 'custom');

      return [
        '<a class="sim-card reveal" href="' + esc(href) + '"',
        '   data-cat="simulations"',
        '   data-subcat="' + esc(item.subcategory || '') + '">',
        '  <div class="sim-card-preview">',
        makeSimPreview(item.subcategory || 'custom'),
        '  </div>',
        '  <span class="sim-card-type">Simulation</span>',
        '  <h3 class="sim-card-title">' + esc(item.title) + '</h3>',
        '  <p class="sim-card-desc">' + esc(item.excerpt || '') + '</p>',
        '  <div class="sim-card-tech">' + tags + '</div>',
        '  <div class="sim-card-footer">',
        '    <span class="sim-card-status"><span class="sim-card-status-dot"></span>' + esc(item.status || 'wip') + '</span>',
        '    <span class="sim-card-open">Open <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12H19M19 12L13 6M19 12L13 18"/></svg></span>',
        '  </div>',
        '</a>'
      ].join('\n');
    }

    /* ── 空の状態 ── */
    function buildEmpty(cat) {
      var msgs = {
        physics:     { title: '物理学ノート準備中', desc: '力学・電磁気学・量子力学などのノートを順次追加します。' },
        astronomy:   { title: '天文学ノート準備中', desc: '宇宙論・恒星進化・銀河などのノートを順次追加します。' },
        mathematics: { title: '数学ノート準備中',   desc: '解析学・線形代数・確率統計などのノートを順次追加します。' },
        simulations: { title: 'シミュレーション準備中', desc: 'JS/TSによる軌道力学・多体問題・波動などのシミュレーションを順次追加します。' }
      };
      var m = msgs[cat.id] || { title: 'コンテンツ準備中', desc: '近日公開予定です。' };
      return [
        '<div class="empty-state">',
        '  <svg class="empty-state-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="32" cy="32" r="24"/><path d="M32 20v14l8 6"/></svg>',
        '  <p class="empty-title">' + esc(m.title) + '</p>',
        '  <p class="empty-desc">' + esc(m.desc) + '</p>',
        '  <span class="empty-badge">Coming Soon</span>',
        '</div>'
      ].join('\n');
    }

    /* ── カテゴリパネル生成 ── */
    function buildPanel(cat, items) {
      var catItems = items.filter(function(it){ return it.category === cat.id; });
      var count = catItems.length;

      var gridContent;
      if (count === 0) {
        gridContent = buildEmpty(cat);
      } else if (cat.id === 'simulations') {
        gridContent = catItems.map(buildSimCard).join('\n');
      } else {
        gridContent = catItems.map(function(it){ return buildStudyCard(it, cat); }).join('\n');
      }

      /* サブカテゴリフィルターボタン */
      var subcatSet = {};
      catItems.forEach(function(it){ if (it.subcategory) subcatSet[it.subcategory] = true; });
      var subcatBtns = '';
      if (Object.keys(subcatSet).length > 1) {
        subcatBtns = '<button class="subcat-btn active" data-subcat="all">All</button>';
        Object.keys(subcatSet).forEach(function(sc){
          subcatBtns += '<button class="subcat-btn" data-subcat="' + esc(sc) + '">' + esc(sc) + '</button>';
        });
      }

      return [
        '<div class="cat-panel" data-cat="' + esc(cat.id) + '" role="tabpanel" aria-labelledby="tab-' + esc(cat.id) + '">',
        '  <div class="cat-banner reveal" data-cat="' + esc(cat.id) + '">',
        '    <div class="cat-banner-icon">' + (CAT_ICONS[cat.id] || '') + '</div>',
        '    <div class="cat-banner-body">',
        '      <p class="cat-banner-label">' + esc(cat.label) + '</p>',
        '      <h2 class="cat-banner-title">' + esc(cat.labelJa) + '</h2>',
        '      <p class="cat-banner-desc">' + esc(cat.description || '') + '</p>',
        '    </div>',
        '    <div class="cat-banner-count"><strong>' + count + '</strong>items</div>',
        '  </div>',
        (cat.id === 'astronomy' ? ASTRONOMY_EXTRA_HTML : ''),
        subcatBtns ? '<div class="subcat-bar">' + subcatBtns + '</div>' : '',
        '  <div class="items-grid">',
        gridContent,
        '  </div>',
        '</div>'
      ].join('\n');
    }

    /* ── タブバー生成 ── */
    function buildTabBar(categories) {
      return '<div class="tab-bar" role="tablist" aria-label="学習カテゴリ">' +
        categories.map(function(cat, i){
          return [
            '<button class="tab-btn' + (i === 0 ? ' active' : '') + '"',
            '  data-cat="' + esc(cat.id) + '"',
            '  id="tab-' + esc(cat.id) + '"',
            '  role="tab"',
            '  aria-selected="' + (i === 0 ? 'true' : 'false') + '"',
            '  aria-controls="panel-' + esc(cat.id) + '">',
            '  <span class="tab-dot" aria-hidden="true"></span>',
            esc(cat.label),
            '</button>'
          ].join('');
        }).join('') +
      '</div>';
    }

    /* ── タブ切り替え ── */
    function setupTabs(root) {
      var tabs   = root.querySelectorAll('.tab-btn');
      var panels = root.querySelectorAll('.cat-panel');

      tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
          var target = tab.dataset.cat;

          tabs.forEach(function(t){
            t.classList.toggle('active', t === tab);
            t.setAttribute('aria-selected', String(t === tab));
          });

          panels.forEach(function(p){
            p.classList.toggle('active', p.dataset.cat === target);
          });
        });
      });
    }

    /* ── サブカテゴリフィルター ── */
    function setupSubcatFilters(root) {
      root.querySelectorAll('.subcat-bar').forEach(function(bar) {
        var panel = bar.closest('.cat-panel');
        if (!panel) return;
        var cards = panel.querySelectorAll('.study-card, .sim-card');
        var btns  = bar.querySelectorAll('.subcat-btn');

        btns.forEach(function(btn) {
          btn.addEventListener('click', function() {
            var sc = btn.dataset.subcat;
            btns.forEach(function(b){ b.classList.toggle('active', b === btn); });
            cards.forEach(function(c){
              var show = sc === 'all' || c.dataset.subcat === sc;
              c.style.display = show ? '' : 'none';
            });
          });
        });
      });
    }

    /* ── メイン ── */
    function loadStudy() {
      var loading = document.getElementById('loading-state');
      var errEl   = document.getElementById('error-state');
      var studyRoot = document.getElementById('study-root');

      if (loading) loading.style.display = 'flex';
      if (errEl)   errEl.style.display   = 'none';
      if (studyRoot) studyRoot.innerHTML = '';

      fetch('/assets/data/study.json')
        .then(function(res){
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function(data) {
          if (loading) loading.style.display = 'none';

          var cats  = data.categories || [];
          var items = data.items || [];

          var html  = buildTabBar(cats);
          html += cats.map(function(cat){ return buildPanel(cat, items); }).join('\n');

          studyRoot.innerHTML = html;

          /* URLクエリ(?cat=xxx)があればそのタブを、なければ最初のパネルをアクティブに */
          var queryCat = new URLSearchParams(window.location.search).get('cat');
          var targetPanel = queryCat ? studyRoot.querySelector('.cat-panel[data-cat="' + queryCat + '"]') : null;
          var activePanel = targetPanel || studyRoot.querySelector('.cat-panel');
          if (activePanel) activePanel.classList.add('active');

          if (queryCat) {
            var targetTab = studyRoot.querySelector('.tab-btn[data-cat="' + queryCat + '"]');
            if (targetTab) {
              studyRoot.querySelectorAll('.tab-btn').forEach(function (t) {
                t.classList.toggle('active', t === targetTab);
                t.setAttribute('aria-selected', String(t === targetTab));
              });
            }
          }

          setupTabs(studyRoot);
          setupSubcatFilters(studyRoot);

          if (window.LAB && window.LAB.reveal) {
            window.LAB.reveal();
          } else {
            studyRoot.querySelectorAll('.reveal').forEach(function(el){
              el.classList.add('visible');
            });
          }
        })
        .catch(function(err) {
          console.error('study.json load error:', err);
          if (loading) loading.style.display = 'none';
          if (errEl)   errEl.style.display   = 'block';
        });
    }

    var retryBtnStudy = document.getElementById('retry-btn');
    if (retryBtnStudy) {
      retryBtnStudy.addEventListener('click', loadStudy);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadStudy);
    } else {
      loadStudy();
    }
  })();