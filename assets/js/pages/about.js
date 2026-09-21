(function () {
  'use strict';

  /* ── ドア遷移検知：referer が / (TOP) の場合にスライドイン演出 ── */
  (function () {
    var main = document.querySelector('main');
    if (!main) return;
    var ref = document.referrer;
    if (ref && (ref.endsWith('/') || ref.endsWith('index.html'))) {
      main.style.animationDuration = '0.7s';
    }
  })();

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ── What I Build：featured プロジェクトを projects.json から ── */
  function renderProjects() {
    var mount = document.getElementById('about-projects');
    if (!mount) return;

    fetch('/assets/data/v2/projects.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        var statusConfig = data.statusConfig || {};
        var items = data.projects.filter(function (p) { return p.featured; });
        if (!items.length) { mount.style.display = 'none'; return; }

        mount.innerHTML = items.map(function (p) {
          var cfg = statusConfig[p.status] || { label: p.status, color: '#4ba9ff' };
          return [
            '<a class="about-link-row" href="/projects/' + esc(p.slug) + '/">',
            '  <span class="about-link-name">' + esc(p.name) + '</span>',
            '  <span class="about-link-desc">' + esc(p.description) + '</span>',
            '  <span class="about-link-status" style="color:' + cfg.color + '">' + esc(cfg.label) + '</span>',
            '</a>'
          ].join('\n');
        }).join('\n');
      })
      .catch(function (err) {
        console.error('projects.json load error:', err);
        mount.style.display = 'none';
      });
  }

  /* ── What I Study：進行中テーマを research.json から ── */
  function renderResearch() {
    var mount = document.getElementById('about-research');
    if (!mount) return;

    fetch('/assets/data/v2/research.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        var catLabel = {};
        (data.categories || []).forEach(function (c) { catLabel[c.id] = c.labelJa || c.label; });

        var items = (data.items || [])
          .filter(function (i) { return i.status === 'ongoing'; })
          .sort(function (a, b) { return (b.updatedAt || '').localeCompare(a.updatedAt || ''); })
          .slice(0, 4);

        if (!items.length) { mount.style.display = 'none'; return; }

        mount.innerHTML = items.map(function (i) {
          return [
            '<div class="about-link-row static">',
            '  <span class="about-link-name">' + esc(i.title) + '</span>',
            '  <span class="about-link-desc">' + esc(i.summary) + '</span>',
            '  <span class="about-link-status">' + esc(catLabel[i.category] || i.category) + '</span>',
            '</div>'
          ].join('\n');
        }).join('\n');
      })
      .catch(function (err) {
        console.error('research.json load error:', err);
        mount.style.display = 'none';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      renderProjects();
      renderResearch();
    });
  } else {
    renderProjects();
    renderResearch();
  }
})();
