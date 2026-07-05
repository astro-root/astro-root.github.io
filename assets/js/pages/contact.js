  (function () {
    'use strict';

    /* ── EmailJS 初期化（既存実装を完全保持） ── */
    (function initEmailJS() {
      function tryInit() {
        if (typeof emailjs !== 'undefined') {
          emailjs.init({ publicKey: 'yxzdXxEsQp6Ulyn1w' });
        }
      }

      var s = document.querySelector('script[src*="emailjs"]');
      if (s) {
        s.addEventListener('load', tryInit);
        tryInit();
      } else {
        tryInit();
      }
    })();

    /* ── 文字カウンター ── */
    (function initCounter() {
      var textarea = document.getElementById('message');
      var counter  = document.getElementById('message-counter');
      if (!textarea || !counter) return;

      var MAX = 2000;

      textarea.addEventListener('input', function () {
        var len = textarea.value.length;
        counter.textContent = len + ' / ' + MAX;
        counter.className = 'form-counter' +
          (len > MAX * 0.9 ? (len >= MAX ? ' over' : ' warn') : '');
      });
    })();

    /* ── インラインバリデーション ── */
    function validateField(input) {
      var errorEl = document.getElementById(input.id + '-error');
      var valid = input.checkValidity();

      input.setAttribute('aria-invalid', String(!valid));
      if (errorEl) {
        errorEl.classList.toggle('visible', !valid);
      }

      return valid;
    }

    (function initValidation() {
      var fields = document.querySelectorAll('.form-input, .form-textarea');
      fields.forEach(function (field) {
        field.addEventListener('blur', function () {
          if (field.value.trim()) validateField(field);
        });
        field.addEventListener('input', function () {
          if (field.getAttribute('aria-invalid') === 'true') validateField(field);
        });
      });
    })();

    /* ── フォーム送信（既存のEmailJS実装を保持・UX改善） ── */
    (function initForm() {
      var form    = document.getElementById('contact-form');
      var btn     = document.getElementById('submit-btn');
      var spinner = document.getElementById('submit-spinner');
      var submitText = btn ? btn.querySelector('.submit-text') : null;
      var submitIcon = btn ? btn.querySelector('.submit-icon') : null;
      var msgOk   = document.getElementById('msg-ok');
      var msgNg   = document.getElementById('msg-ng');
      var msgOkText = document.getElementById('msg-ok-text');
      var msgNgText = document.getElementById('msg-ng-text');

      if (!form) return;

      function setLoading(loading) {
        btn.disabled = loading;
        if (spinner)    spinner.style.display   = loading ? 'block' : 'none';
        if (submitText) submitText.textContent   = loading ? '送信中…' : '送信する';
        if (submitIcon) submitIcon.style.display = loading ? 'none'  : 'block';
      }

      function showMsg(type, text) {
        msgOk.className = 'form-msg';
        msgNg.className = 'form-msg';
        if (type === 'ok') {
          if (msgOkText) msgOkText.textContent = text;
          msgOk.className = 'form-msg ok';
          msgOk.focus();
        } else {
          if (msgNgText) msgNgText.textContent = text;
          msgNg.className = 'form-msg ng';
          msgNg.focus();
        }
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        /* 全フィールドバリデーション */
        var fields  = form.querySelectorAll('.form-input, .form-textarea');
        var allValid = true;
        var firstInvalid = null;

        fields.forEach(function (field) {
          var ok = validateField(field);
          if (!ok && !firstInvalid) firstInvalid = field;
          if (!ok) allValid = false;
        });

        if (!allValid) {
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        var n  = form.from_name.value.trim();
        var em = form.from_email.value.trim();
        var s  = form.subject.value.trim();
        var m  = form.message.value.trim();

        setLoading(true);
        msgOk.className = 'form-msg';
        msgNg.className = 'form-msg';

        var params = {
          from_name:  n,
          from_email: em,
          subject:    s,
          message:    m,
          reply_to:   em,
          to_name:    n,
          to_email:   em
        };

        /* 既存のEmailJS送信処理を完全保持 */
        Promise.all([
          emailjs.send('astro_root', 'astro_root_notify', params),
          emailjs.send('astro_root', 'astro_root_mail',   params)
        ])
          .then(function () {
            showMsg('ok', '✓ 送信しました。自動返信メールをご確認ください。');
            form.reset();
            var counter = document.getElementById('message-counter');
            if (counter) counter.textContent = '0 / 2000';
          })
          .catch(function () {
            showMsg('ng', '✕ 送信に失敗しました。しばらく経ってから再度お試しください。');
          })
          .finally(function () {
            setLoading(false);
          });
      });
    })();

  })();