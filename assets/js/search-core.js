/**
 * ROOT LAB — 横断検索コア (要件16)
 *
 * 対象: Projects / Research / Notes / Technologies
 * 検索対象フィールド: Title / Description / Content / Tags / Category / Technology
 *
 * window.LabSearch.search(query) で結果配列を返す。
 * データは初回呼び出し時に一度だけ取得してメモリ上に保持する。
 */
(function () {
  'use strict';

  var DATA_BASE = '/assets/data/v2/';
  var indexPromise = null;

  function fetchJson(name) {
    return fetch(DATA_BASE + name, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(name + ': ' + r.status); return r.json(); })
      .catch(function (err) { console.error('[LabSearch]', err); return null; });
  }

  /* 各データを共通の検索レコード形式へ正規化 */
  function normalize(projects, research, notes, techs) {
    var records = [];

    if (projects) {
      var catLabelP = {};
      var catAliasP = {};
      (projects.categories || []).forEach(function (c) {
        catLabelP[c.id] = c.label;
        catAliasP[c.id] = [c.label, c.labelJa].filter(Boolean).join(' ');
      });
      var statusConfig = projects.statusConfig || {};

      (projects.projects || []).forEach(function (p) {
        var cfg = statusConfig[p.status] || {};
        records.push({
          type: 'Project',
          typeColor: '#4ba9ff',
          title: p.name,
          description: p.description || '',
          content: p.longDescription || '',
          tags: p.technologies || [],
          categories: (p.categories || []).map(function (id) { return catLabelP[id] || id; }),
          searchAlias: (p.categories || []).map(function (id) { return catAliasP[id] || id; }).join(' '),
          meta: cfg.label || p.status || '',
          url: '/projects/' + p.slug + '/'
        });
      });
    }

    if (research) {
      var catLabelR = {};
      var catAliasR = {};
      (research.categories || []).forEach(function (c) {
        catLabelR[c.id] = c.label;
        /* 日本語ラベルも検索対象に含める (例:「天文」で Astronomy がヒット) */
        catAliasR[c.id] = [c.label, c.labelJa].filter(Boolean).join(' ');
      });

      (research.items || []).forEach(function (r) {
        records.push({
          type: 'Research',
          typeColor: '#8b72ff',
          title: r.title,
          description: r.summary || '',
          content: r.content || '',
          tags: r.tags || [],
          categories: [catLabelR[r.category] || r.category],
          searchAlias: catAliasR[r.category] || '',
          meta: r.status || '',
          url: '/research/#' + r.id
        });
      });
    }

    if (notes) {
      var catLabelN = {};
      var catAliasN = {};
      (notes.categories || []).forEach(function (c) {
        catLabelN[c.id] = c.label;
        catAliasN[c.id] = [c.label, c.labelJa].filter(Boolean).join(' ');
      });

      (notes.items || []).forEach(function (n) {
        records.push({
          type: 'Note',
          typeColor: '#1eebc0',
          title: n.title,
          description: n.summary || '',
          content: n.content || '',
          tags: n.tags || [],
          categories: [catLabelN[n.category] || n.category],
          searchAlias: catAliasN[n.category] || '',
          meta: n.date || '',
          url: '/notes/#' + n.id
        });
      });
    }

    if (techs) {
      var catLabelT = {};
      var catAliasT = {};
      (techs.categories || []).forEach(function (c) {
        catLabelT[c.id] = c.label;
        catAliasT[c.id] = [c.label, c.labelJa].filter(Boolean).join(' ');
      });

      (techs.items || []).forEach(function (t) {
        records.push({
          type: 'Technology',
          typeColor: '#ffc25c',
          title: t.name,
          description: t.description || '',
          content: '',
          tags: [],
          categories: [catLabelT[t.category] || t.category],
          searchAlias: catAliasT[t.category] || '',
          meta: t.primary ? 'Primary' : (t.level || ''),
          url: '/lab/#' + t.id
        });
      });
    }

    /* 検索用の小文字化済みフィールドを事前計算 */
    records.forEach(function (rec) {
      rec._title = (rec.title || '').toLowerCase();
      rec._desc = (rec.description || '').toLowerCase();
      rec._content = (rec.content || '').toLowerCase();
      rec._tags = rec.tags.join(' ').toLowerCase();
      rec._cats = (rec.categories.join(' ') + ' ' + (rec.searchAlias || '')).toLowerCase();
    });

    return records;
  }

  function buildIndex() {
    if (indexPromise) return indexPromise;

    indexPromise = Promise.all([
      fetchJson('projects.json'),
      fetchJson('research.json'),
      fetchJson('notes.json'),
      fetchJson('technologies.json')
    ]).then(function (res) {
      return normalize(res[0], res[1], res[2], res[3]);
    });

    return indexPromise;
  }

  /**
   * スコアリング:
   *   タイトル完全一致      100
   *   タイトル前方一致       60
   *   タイトル部分一致       40
   *   タグ一致              25
   *   カテゴリ一致          20
   *   説明文一致            15
   *   本文一致               8
   * 複数語クエリは全語がどこかにヒットしたレコードのみ残す (AND検索)
   */
  function scoreRecord(rec, terms) {
    var total = 0;

    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      var s = 0;

      if (rec._title === t) s += 100;
      else if (rec._title.indexOf(t) === 0) s += 60;
      else if (rec._title.indexOf(t) !== -1) s += 40;

      if (rec._tags.indexOf(t) !== -1) s += 25;
      if (rec._cats.indexOf(t) !== -1) s += 20;
      if (rec._desc.indexOf(t) !== -1) s += 15;
      if (rec._content.indexOf(t) !== -1) s += 8;

      /* 1語でもどこにもヒットしなければ除外 */
      if (s === 0) return 0;
      total += s;
    }

    return total;
  }

  function search(query, options) {
    var opts = options || {};
    var limit = opts.limit || 20;
    var q = String(query || '').trim().toLowerCase();

    if (!q) return Promise.resolve([]);

    var terms = q.split(/\s+/).filter(Boolean);

    return buildIndex().then(function (records) {
      var hits = [];

      records.forEach(function (rec) {
        var score = scoreRecord(rec, terms);
        if (score > 0) hits.push({ record: rec, score: score });
      });

      hits.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.record.title.localeCompare(b.record.title);
      });

      return hits.slice(0, limit).map(function (h) { return h.record; });
    });
  }

  /* 結果をタイプ別にグループ化 (要件16.1の表示形式用) */
  function groupByType(results) {
    var order = ['Project', 'Research', 'Note', 'Technology'];
    var groups = {};

    results.forEach(function (r) {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });

    return order
      .filter(function (t) { return groups[t]; })
      .map(function (t) { return { type: t, items: groups[t] }; });
  }

  window.LabSearch = {
    search: search,
    groupByType: groupByType,
    warmup: buildIndex
  };
})();
