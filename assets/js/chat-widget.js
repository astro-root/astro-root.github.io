(function () {
  "use strict";

  var TIMEOUT_MS = 2 * 60 * 1000;
  var EMAILJS_PUBLIC_KEY = "yxzdXxEsQp6Ulyn1w";
  var EMAILJS_SERVICE_ID = "astro_root";
  var EMAILJS_TEMPLATE_ID = "astro_root_notify";

  var GREETING = "こんにちは、るーとの研究室チャットです。ご質問をどうぞ。開発者と直接お話ししたい場合は下の「開発者を呼ぶ」ボタンを押してください。";
  var CALL_CONFIRM = "開発者に通知しました。少々お待ちください（最大2分ほど応答がない場合、自動応答に切り替わります）。";
  var FALLBACK_POOL = [
    "現在、開発者がすぐに対応できないようです。よくあるご質問は Projects や Study ページにもまとまっていますので、あわせてご確認ください。詳しい内容はお問い合わせフォームからも送信いただけます。",
    "自動応答モードに切り替わりました。至急でない内容でしたら、この後あらためて担当者からご連絡します。"
  ];

  var db = null;
  var auth = null;
  var sessionId = null;
  var uid = null;
  var timeoutHandle = null;
  var unsubscribeMessages = null;
  var unsubscribeSession = null;
  var panelOpened = false;

  /* ── ユーティリティ ── */
  function esc(s) {
    return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function scrubPII(text) {
    var scrubbed = text;
    scrubbed = scrubbed.replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, "[email]");
    scrubbed = scrubbed.replace(/0\d{1,4}-?\d{1,4}-?\d{3,4}/g, "[phone]");
    return scrubbed;
  }

  function getOrCreateSessionId() {
    var key = "lab_chat_session_id";
    var id = localStorage.getItem(key);
    if (!id) {
      id = "sess-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem(key, id);
    }
    return id;
  }

  /* ── UIマークアップ生成 ── */
  function buildUI() {
    var launcher = document.createElement("button");
    launcher.id = "lab-chat-launcher";
    launcher.setAttribute("aria-label", "研究室チャットを開く");
    launcher.innerHTML =
      '<span class="lab-chat-dot" aria-hidden="true"></span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' +
      '</svg>';

    var panel = document.createElement("div");
    panel.id = "lab-chat-panel";
    panel.innerHTML = [
      '<div class="lab-chat-header">',
      '  <div>',
      '    <p class="lab-chat-title">Research Lab Chat</p>',
      '    <p class="lab-chat-sub" id="lab-chat-status">オンライン</p>',
      '  </div>',
      '  <button class="lab-chat-close" id="lab-chat-close-btn" aria-label="閉じる">',
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
      '  </button>',
      '</div>',
      '<p class="lab-chat-notice">個人情報（本名・連絡先・パスワード等）は入力しないでください。会話は匿名化して記録され、応答改善のために利用されます。</p>',
      '<div class="lab-chat-messages" id="lab-chat-messages"></div>',
      '<div class="lab-chat-footer">',
      '  <button class="lab-chat-call-btn" id="lab-chat-call-btn">',
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
      '    開発者を呼ぶ',
      '  </button>',
      '  <div class="lab-chat-input-row">',
      '    <textarea class="lab-chat-input" id="lab-chat-input" rows="1" placeholder="メッセージを入力..." aria-label="メッセージ入力"></textarea>',
      '    <button class="lab-chat-send-btn" id="lab-chat-send-btn" aria-label="送信">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
      '    </button>',
      '  </div>',
      '</div>'
    ].join("");

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    launcher.addEventListener("click", togglePanel);
    document.getElementById("lab-chat-close-btn").addEventListener("click", togglePanel);
    document.getElementById("lab-chat-call-btn").addEventListener("click", callDeveloper);
    document.getElementById("lab-chat-send-btn").addEventListener("click", sendUserMessage);
    document.getElementById("lab-chat-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
      }
    });
  }

  function togglePanel() {
    var panel = document.getElementById("lab-chat-panel");
    var launcher = document.getElementById("lab-chat-launcher");
    var isOpen = panel.classList.toggle("open");
    if (isOpen) {
      launcher.classList.remove("has-unread");
      if (!panelOpened) {
        panelOpened = true;
        initChat();
      }
    }
  }

  /* ── メッセージ描画 ── */
  function renderMessage(msg) {
    var container = document.getElementById("lab-chat-messages");
    if (!container) return;
    var label = { user: "あなた", bot: "自動応答", developer: "開発者" }[msg.sender] || msg.sender;
    var div = document.createElement("div");
    div.className = "lab-chat-bubble";
    div.dataset.sender = msg.sender;
    div.innerHTML = '<span class="lab-chat-bubble-label">' + esc(label) + '</span>' + esc(msg.text);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function updateStatusLabel(status) {
    var el = document.getElementById("lab-chat-status");
    if (!el) return;
    var map = {
      bot: "オンライン",
      calling: "開発者を呼び出し中...",
      developer: "開発者が対応中",
      "ai-handling": "自動応答中"
    };
    el.textContent = map[status] || "オンライン";
  }

  /* ── Firestore書き込み ── */
  function postMessage(sender, text) {
    var sessionRef = db.collection("chat_sessions").doc(sessionId);
    var msgRef = sessionRef.collection("messages").doc();
    var batch = db.batch();
    batch.set(msgRef, {
      sender: sender,
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    batch.update(sessionRef, {
      lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessagePreview: text.slice(0, 80)
    });
    return batch.commit();
  }

  function ensureSessionExists() {
    var sessionRef = db.collection("chat_sessions").doc(sessionId);
    return sessionRef.get().then(function (doc) {
      if (doc.exists) return;
      return sessionRef.set({
        ownerUid: uid,
        status: "bot",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessagePreview: ""
      }).then(function () {
        return postMessage("bot", GREETING);
      });
    });
  }

  function sendUserMessage() {
    var input = document.getElementById("lab-chat-input");
    var text = (input.value || "").trim();
    if (!text) return;
    input.value = "";
    postMessage("user", scrubPII(text));
  }

  /* ── 開発者呼び出し ── */
  function callDeveloper() {
    var btn = document.getElementById("lab-chat-call-btn");
    btn.disabled = true;
    var sessionRef = db.collection("chat_sessions").doc(sessionId);
    sessionRef.update({
      status: "calling",
      calledAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      return postMessage("bot", CALL_CONFIRM);
    }).then(function () {
      return sendCallEmail();
    }).then(function () {
      return sessionRef.get();
    }).then(function (doc) {
      var data = doc.data();
      if (data && data.calledAt) {
        scheduleTimeoutCheck(data.calledAt.toMillis());
      }
    }).catch(function (err) {
      console.error("callDeveloper failed:", err);
      btn.disabled = false;
    });
  }

  function sendCallEmail() {
    if (typeof emailjs === "undefined") {
      console.warn("EmailJS SDKが読み込まれていないため通知メールを送信できません。");
      return Promise.resolve();
    }
    var chatUrl = window.location.origin + "/admin/chat.html?session=" + encodeURIComponent(sessionId);
    var params = {
      from_name: "研究室チャット(匿名)",
      from_email: "no-reply@astro-root.com",
      subject: "【チャット呼び出し】開発者対応をお願いします",
      message: "研究室サイトのチャットで開発者呼び出しがありました。\n\n管理画面から直接返信してください:\n" + chatUrl,
      reply_to: "no-reply@astro-root.com",
      to_name: "るーと",
      to_email: "no-reply@astro-root.com"
    };
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params).catch(function (err) {
      console.error("開発者呼び出しメール送信失敗:", err);
    });
  }

  /* ── 2分タイムアウト → 定型応答へフォールバック ── */
  function scheduleTimeoutCheck(calledAtMillis) {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    var remaining = TIMEOUT_MS - (Date.now() - calledAtMillis);
    if (remaining <= 0) {
      tryFallbackToAI();
    } else {
      timeoutHandle = setTimeout(tryFallbackToAI, remaining);
    }
  }

  function tryFallbackToAI() {
    var sessionRef = db.collection("chat_sessions").doc(sessionId);
    db.runTransaction(function (tx) {
      return tx.get(sessionRef).then(function (doc) {
        if (!doc.exists) return false;
        if (doc.data().status !== "calling") return false;
        tx.update(sessionRef, { status: "ai-handling" });
        return true;
      });
    }).then(function (didTransition) {
      if (didTransition) {
        var msg = FALLBACK_POOL[Math.floor(Math.random() * FALLBACK_POOL.length)];
        postMessage("bot", msg);
      }
    }).catch(function (err) {
      console.error("AI fallback failed:", err);
    });
  }

  /* ── リアルタイム購読 ── */
  function subscribeToSession() {
    var sessionRef = db.collection("chat_sessions").doc(sessionId);

    unsubscribeSession = sessionRef.onSnapshot(function (doc) {
      if (!doc.exists) return;
      var data = doc.data();
      updateStatusLabel(data.status);
      if (data.status === "calling" && data.calledAt) {
        scheduleTimeoutCheck(data.calledAt.toMillis());
      } else if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
    });

    unsubscribeMessages = sessionRef.collection("messages").orderBy("createdAt", "asc")
      .onSnapshot(function (snap) {
        var container = document.getElementById("lab-chat-messages");
        if (container) container.innerHTML = "";
        snap.forEach(function (doc) {
          renderMessage(doc.data());
        });
        var launcher = document.getElementById("lab-chat-launcher");
        var panel = document.getElementById("lab-chat-panel");
        if (launcher && panel && !panel.classList.contains("open") && !snap.empty) {
          launcher.classList.add("has-unread");
        }
      });
  }

  /* ── 初期化 ── */
  function initChat() {
    if (!window.LAB_FIREBASE) {
      var container = document.getElementById("lab-chat-messages");
      if (container) {
        container.innerHTML = '<div class="lab-chat-bubble" data-sender="bot">チャット機能は現在準備中です。しばらくしてから再度お試しください。</div>';
      }
      return;
    }
    db = window.LAB_FIREBASE.db;
    auth = window.LAB_FIREBASE.auth;
    sessionId = getOrCreateSessionId();

    if (typeof emailjs !== "undefined" && !window.__labEmailjsInited) {
      try {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
        window.__labEmailjsInited = true;
      } catch (e) {
        console.warn("EmailJS init skipped:", e);
      }
    }

    auth.onAuthStateChanged(function (user) {
      if (user) {
        uid = user.uid;
        ensureSessionExists().then(subscribeToSession);
      } else {
        auth.signInAnonymously().catch(function (err) {
          console.error("匿名サインインに失敗しました:", err);
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildUI);
  } else {
    buildUI();
  }
})();
