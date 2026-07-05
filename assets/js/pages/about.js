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

    /* ── スキルバーのアニメーション：IntersectionObserver で発火 ── */
    (function () {
      var fills = document.querySelectorAll('.skill-bar-fill');
      if (!fills.length) return;

      /* 初期状態をリセット（CSSアニメーション準備） */
      fills.forEach(function (el) {
        var target = el.style.width;
        el.dataset.target = target;
        el.style.width = '0%';
      });

      if (!('IntersectionObserver' in window)) {
        fills.forEach(function (el) { el.style.width = el.dataset.target; });
        return;
      }

      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            setTimeout(function () { el.style.width = el.dataset.target; }, 100);
            obs.unobserve(el);
          }
        });
      }, { threshold: 0.3 });

      fills.forEach(function (el) { obs.observe(el); });
    })();

  })();