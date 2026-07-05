  (function () {
    'use strict';

    /* Primary バッジの数を集計してスペックバーに反映 */
    function updateStats() {
      var primaries = document.querySelectorAll('.tech-badge[data-level="primary"]').length;
      var el = document.getElementById('spec-primary');
      if (el) el.textContent = primaries;
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateStats);
    } else {
      updateStats();
    }
  })();