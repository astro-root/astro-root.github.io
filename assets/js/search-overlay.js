/**
 * ROOT LAB — 検索オーバーレイ (要件16.1)
 * 起動: ヘッダーの検索ボタン / Cmd+K (Mac) / Ctrl+K (Win) / "/" キー
 * 操作: ↑↓ で選択、Enter で移動、Esc で閉じる
 */
(function () {
  'use strict';

  var overlay, input, resultsEl, hintEl;
  var lastFocused = null;
  var activeIndex = -1;
  var flatResults = [];
  var debounceTimer = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* クエリに一致した箇所を <mark> で強調 */
  function highlight(text, terms) {
    var out = esc(text);
    terms.forEach(function (t) {
      if (!t) return;
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.id = 'search-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'サイト内検索');
    overlay.hidden = true;

    overlay.innerHTML = [
      '<div class="search-backdrop" id="search-backdrop"></div>',
      '<div class="search-panel">',
      '  <div class="search-input-row">',
      '    <svg class="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
      '    <input type="search" id="search-input" class="search-input" placeholder="Projects・Research・Notes・Technologies を検索..." autocomplete="off" aria-label="検索キーワード" aria-controls="search-results" />',
      '    <button type="button" class="search-close" id="search-close" aria-label="検索を閉じる">ESC</button>',
      '  </div>',
      '  <div class="search-results" id="search-results" role="listbox" aria-label="検索結果"></div>',
      '  <div class="search-hint" id="search-hint">',
      '    <span><kbd>↑</kbd><kbd>↓</kbd> 選択</span>',
      '    <span><kbd>Enter</kbd> 移動</span>',
      '    <span><kbd>Esc</kbd> 閉じる</span>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(overlay);

    input = overlay.querySelector('#search-input');
    resultsEl = overlay.querySelector('#search-results');
    hintEl = overlay.querySelector('#search-hint');

    overlay.querySelector('#search-backdrop').addEventListener('click', close);
    overlay.querySelector('#search-close').addEventListener('click', close);
    input.addEventListener('input', onInput);
    input.addEventListener('keydown', onInputKeydown);
  }

  function renderEmpty(message, sub) {
    resultsEl.innerHTML = [
      '<div class="search-empty">',
      '  <p class="search-empty-title">' + esc(message) + '</p>',
      sub ? '  <p class="search-empty-desc">' + esc(sub) + '</p>' : '',
      '</div>'
    ].join('\n');
    flatResults = [];
    activeIndex = -1;
  }

  function renderResults(groups, terms) {
    flatResults = [];
    var html = '';

    groups.forEach(function (g) {
      html += '<div class="search-group">';
      html += '<p class="search-group-label">' + esc(g.type) + '<span>' + g.items.length + '</span></p>';

      g.items.forEach(function (rec) {
        var i = flatResults.length;
        flatResults.push(rec);
        html += [
          '<a class="search-result" data-index="' + i + '" href="' + esc(rec.url) + '" role="option" aria-selected="false">',
          '  <span class="search-result-badge" style="color:' + rec.typeColor + ';border-color:' + rec.typeColor + '55;">' + esc(rec.type) + '</span>',
          '  <span class="search-result-body">',
          '    <span class="search-result-title">' + highlight(rec.title, terms) + '</span>',
          rec.description ? '    <span class="search-result-desc">' + highlight(rec.description, terms) + '</span>' : '',
          '  </span>',
          rec.meta ? '  <span class="search-result-meta">' + esc(rec.meta) + '</span>' : '',
          '</a>'
        ].join('\n');
      });

      html += '</div>';
    });

    resultsEl.innerHTML = html;
    activeIndex = flatResults.length ? 0 : -1;
    updateActive();

    resultsEl.querySelectorAll('.search-result').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        activeIndex = parseInt(el.dataset.index, 10);
        updateActive();
      });
    });
  }

  function updateActive() {
    var nodes = resultsEl.querySelectorAll('.search-result');
    nodes.forEach(function (el, i) {
      var on = i === activeIndex;
      el.classList.toggle('active', on);
      el.setAttribute('aria-selected', String(on));
      if (on) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function onInput() {
    clearTimeout(debounceTimer);
    var q = input.value.trim();

    if (!q) {
      renderEmpty('キーワードを入力してください', 'Projects・Research・Notes・Technologies を横断して検索します。');
      return;
    }

    debounceTimer = setTimeout(function () {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);

      window.LabSearch.search(q).then(function (results) {
        /* 実行中に入力が変わっていたら破棄 */
        if (input.value.trim() !== q) return;

        if (!results.length) {
          renderEmpty('「' + q + '」に一致する項目はありません', '別のキーワードをお試しください。');
          return;
        }
        renderResults(window.LabSearch.groupByType(results), terms);
      });
    }, 120);
  }

  function onInputKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatResults.length) {
        activeIndex = (activeIndex + 1) % flatResults.length;
        updateActive();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatResults.length) {
        activeIndex = (activeIndex - 1 + flatResults.length) % flatResults.length;
        updateActive();
      }
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && flatResults[activeIndex]) {
        e.preventDefault();
        window.location.href = flatResults[activeIndex].url;
      }
    }
  }

  function open() {
    if (!overlay) buildOverlay();
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    input.value = '';
    renderEmpty('キーワードを入力してください', 'Projects・Research・Notes・Technologies を横断して検索します。');
    input.focus();
    if (window.LabSearch) window.LabSearch.warmup();
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function isTypingTarget(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  /* ── グローバルキーバインド ── */
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay && !overlay.hidden ? close() : open();
      return;
    }
    if (e.key === 'Escape' && overlay && !overlay.hidden) {
      close();
      return;
    }
    if (e.key === '/' && !isTypingTarget(document.activeElement) && (!overlay || overlay.hidden)) {
      e.preventDefault();
      open();
    }
  });

  /* ── ヘッダーの検索ボタン ── */
  function bindTriggers() {
    document.querySelectorAll('[data-search-trigger]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindTriggers);
  } else {
    bindTriggers();
  }

  window.LabSearchUI = { open: open, close: close };
})();
