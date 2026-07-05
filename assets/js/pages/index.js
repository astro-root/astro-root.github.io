  (function () {
    'use strict';

    var OBJECTS = {
      'obj-monitor':    { name: '大型モニター',    dest: '→ Projects',      href: '/projects/' },
      'obj-laptop':     { name: 'ノートPC',         dest: '→ Web Tools',     href: '/projects/' },
      'obj-bookshelf':  { name: '本棚',             dest: '→ Study',         href: '/study/' },
      'obj-whiteboard': { name: 'ホワイトボード',   dest: '→ Blog',          href: '/blog/' },
      'obj-telescope':  { name: '天体望遠鏡',       dest: '→ Astronomy',     href: '/astronomy/' },
      'obj-server':     { name: 'サーバーラック',   dest: '→ Lab Equipment', href: '/lab/' },
      'obj-cabinet':    { name: 'キャビネット',     dest: '→ Research Log',  href: '/research-log/' },
      'obj-envelope':   { name: '封筒',             dest: '→ Contact',       href: '/contact' },
      'obj-door':       { name: 'ドア',             dest: '→ About',         href: '/about' }
    };

    var tooltip   = document.getElementById('lab-tooltip');
    var tipName   = document.getElementById('tooltip-name');
    var tipDest   = document.getElementById('tooltip-dest');
    var mouseX    = 0;
    var mouseY    = 0;
    var tipVisible = false;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (tipVisible) positionTooltip();
    }, { passive: true });

    function positionTooltip () {
      var tw = tooltip.offsetWidth || 160;
      var th = tooltip.offsetHeight || 52;
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var x = mouseX + 16;
      var y = mouseY - th / 2;
      if (x + tw > vw - 12) x = mouseX - tw - 12;
      if (y < 12)           y = 12;
      if (y + th > vh - 12) y = vh - th - 12;
      tooltip.style.left = x + 'px';
      tooltip.style.top  = y + 'px';
    }

    function showTooltip (info) {
      tipName.textContent = info.name;
      tipDest.textContent = info.dest;
      positionTooltip();
      tooltip.classList.add('visible');
      tipVisible = true;
    }

    function hideTooltip () {
      tooltip.classList.remove('visible');
      tipVisible = false;
    }

    Object.keys(OBJECTS).forEach(function (id) {
      var el   = document.getElementById(id);
      var info = OBJECTS[id];
      if (!el) return;

      el.addEventListener('mouseenter', function () { showTooltip(info); });
      el.addEventListener('mouseleave', hideTooltip);

      el.addEventListener('click', function () {
        window.location.href = info.href;
      });

      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.href = info.href;
        }
      });

      el.addEventListener('focus', function () { showTooltip(info); });
      el.addEventListener('blur',  hideTooltip);
    });

    var mobileBtn   = document.getElementById('mobile-menu-btn');
    var mobileSheet = document.getElementById('mobile-nav-sheet');
    var mobileClose = document.getElementById('mobile-nav-close');

    if (mobileBtn && mobileSheet) {
      mobileBtn.addEventListener('click', function () {
        mobileSheet.classList.add('open');
        mobileBtn.setAttribute('aria-expanded', 'true');
        if (mobileClose) mobileClose.focus();
      });

      if (mobileClose) {
        mobileClose.addEventListener('click', function () {
          mobileSheet.classList.remove('open');
          mobileBtn.setAttribute('aria-expanded', 'false');
          mobileBtn.focus();
        });
      }

      mobileSheet.addEventListener('click', function (e) {
        if (e.target === mobileSheet) {
          mobileSheet.classList.remove('open');
          mobileBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileSheet.classList.contains('open')) {
          mobileSheet.classList.remove('open');
          mobileBtn.setAttribute('aria-expanded', 'false');
          mobileBtn.focus();
        }
      });
    }

  })();