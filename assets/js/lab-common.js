(function () {
  'use strict';

  var LAB = window.LAB || {};
  window.LAB = LAB;

  LAB.init = function () {
    LAB.scrollProgress();
    LAB.starCanvas();
    LAB.cursor();
    LAB.nav();
    LAB.reveal();
    LAB.setCurrentNav();
  };

  LAB.scrollProgress = function () {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    var onScroll = function () {
      var doc = document.documentElement;
      var scrolled = doc.scrollTop || document.body.scrollTop;
      var total = doc.scrollHeight - doc.clientHeight;
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  LAB.starCanvas = function () {
    var canvas = document.getElementById('star-canvas');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = canvas.getContext('2d');
    var width, height, stars = [], animId;
    var STAR_COUNT = window.innerWidth < 768 ? 40 : 80;

    function resize() {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    }

    function Star() {
      this.x  = Math.random() * width;
      this.y  = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.6 + 0.2;
      this.o  = Math.random() * 0.5 + 0.2;
    }

    Star.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    };

    Star.prototype.draw = function () {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,' + this.o + ')';
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    };

    function initStars() {
      stars = [];
      for (var i = 0; i < STAR_COUNT; i++) stars.push(new Star());
    }

    function drawLines() {
      var DIST = 140;
      for (var i = 0; i < stars.length; i++) {
        for (var j = i + 1; j < stars.length; j++) {
          var dx = stars[i].x - stars[j].x;
          var dy = stars[i].y - stars[j].y;
          var d  = Math.sqrt(dx * dx + dy * dy);
          if (d < DIST) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(59,158,255,' + (0.14 * (1 - d / DIST)) + ')';
            ctx.lineWidth = 0.5;
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].draw();
      }
      drawLines();
      animId = requestAnimationFrame(animate);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    resize();
    animate();
  };

  LAB.cursor = function () {
    if ('ontouchstart' in window) return;

    var dot  = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    var mouseX = 0, mouseY = 0;
    var dotX   = 0, dotY   = 0;
    var ringX  = 0, ringY  = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.classList.add('ready');
      ring.classList.add('ready');
    }, { passive: true });

    document.addEventListener('mousedown', function () {
      dot.classList.add('clicking');
      ring.classList.add('clicking');
    });

    document.addEventListener('mouseup', function () {
      dot.classList.remove('clicking');
      ring.classList.remove('clicking');
    });

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a, button, [role="button"], [tabindex]')) {
        dot.classList.add('hover');
        ring.classList.add('hover');
      } else {
        dot.classList.remove('hover');
        ring.classList.remove('hover');
      }
    }, { passive: true });

    (function tick() {
      dotX  += (mouseX - dotX)  * 0.20;
      dotY  += (mouseY - dotY)  * 0.20;
      ringX += (mouseX - ringX) * 0.10;
      ringY += (mouseY - ringY) * 0.10;

      dot.style.left  = dotX  + 'px';
      dot.style.top   = dotY  + 'px';
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';

      requestAnimationFrame(tick);
    })();
  };

  LAB.nav = function () {
    var nav    = document.getElementById('lab-nav');
    var toggle = document.getElementById('nav-toggle');
    var mobile = document.getElementById('nav-mobile');
    if (!nav) return;

    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    if (toggle && mobile) {
      toggle.addEventListener('click', function () {
        var open = mobile.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });

      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && !mobile.contains(e.target)) {
          mobile.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });

      mobile.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          mobile.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  };

  LAB.reveal = function () {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { obs.observe(el); });
  };

  LAB.setCurrentNav = function () {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    var links = document.querySelectorAll('.nav-links a, .nav-mobile a');
    links.forEach(function (a) {
      var href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
      if (href === path) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LAB.init);
  } else {
    LAB.init();
  }
})();
