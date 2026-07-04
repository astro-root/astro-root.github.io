(function () {
  "use strict";

  var TIMEOUT_MS = 2 * 60 * 1000;
  var AUTO_REPLY_COOLDOWN_MS = 20 * 1000;
  var AI_WORKER_URL = "https://root-slab-chat-ai.astro-root.workers.dev";

  var GREETING = "こんにちは、るーとの研究室チャットです。ご質問をどうぞ。開発者と直接お話ししたい場合は下の「開発者を呼ぶ」ボタンを押してください。";
  var CALL_CONFIRM = "開発者に通知しました。少々お待ちください(最大2分ほど応答がない場合、自動応答に切り替わります)。";
  var FALLBACK_STATIC = "現在、開発者もAI応答も利用できないようです。お手数ですが、少し時間をおいて再度お試しいただくか、お問い合わせフォームからご連絡ください。";
  var AI_NUDGE_FALLBACK = "うまくお答えできませんでした。恐れ入りますが、お問い合わせフォームからご連絡いただけますでしょうか。";

  var db = null;
  var auth = null;
  var sessionId = null;
  var uid = null;
  var timeoutHandle = null;
  var unsubscribeMessages = null;
  var unsubscribeSession = null;
  var panelOpened = false;
  var currentSessionMode = "ai";
  var aiThinking = false;
  var lastAutoReplyAt = 0;
  var recentMessages = [];

  function esc(s) {
    return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function scrubPII(text) {
    var scrubbed = text;
    scrubbed = scrubbed.replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, "[email]");
    scrubbed = scrubbed.replace(/0\d{1,4}-?\d{1,4}-?\d{3,4}/g, "[phone]");
    return scrubbed;
  }

  function showLocalNotice(text) {
    var container = document.getElementById("lab-chat-messages");
    if (!container) return;
    var div = document.createElement("div");
    div.className = "lab-chat-bubble";
    div.dataset.sender = "bot";
    div.innerHTML = '<span class="lab-chat-bubble-label">システム</span>' + esc(text);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  var thinkingShownAt = 0;
  var MIN_THINKING_MS = 600;
  function showThinking() {
    aiThinking = true;
    thinkingShownAt = Date.now();
    var container = document.getElementById("lab-chat-messages");
    if (!container) return;
    hideThinking();
    var div = document.createElement("div");
    div.className = "lab-chat-bubble";
    div.id = "lab-chat-thinking";
    div.dataset.sender = "thinking";
    div.innerHTML = '<span class="lab-chat-bubble-label">AIが考え中</span><span></span><span></span><span></span>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function hideThinking() {
    aiThinking = false;
    var el = document.getElementById("lab-chat-thinking");
    if (el) el.remove();
  }

  function randomToken(length) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var bytes = new Uint8Array(length);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    var out = "";
    for (var j = 0; j < length; j++) {
      out += chars[bytes[j] % chars.length];
    }
    return out;
  }

  /*
    セッションIDをlocalStorageに保存しない。
    ページを開くたびに新規セッションとして扱うため、訪問者のブラウザには
    過去の会話が復元されない。Firestore側の記録自体は残るため、
    開発者は受信箱から引き続き全履歴を閲覧できる。
  */
  function getOrCreateSessionId() {
    return "sess-" + randomToken(24);
  }

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
      '<p class="lab-chat-notice">個人情報(本名・連絡先・パスワード等)は入力しないでください。会話は匿名化して記録され、応答改善のために利用されます。</p>',
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

  function updateStatusLabel(mode) {
    var el = document.getElementById("lab-chat-status");
    if (!el) return;
    var map = {
      ai: "オンライン(自動応答)",
      developer: "開発者が対応中"
    };
    el.textContent = map[mode] || "オンライン";
  }

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
        mode: "ai",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessagePreview: ""
      }).then(function () {
        return postMessage("bot", GREETING);
      });
    });
  }

  function callAI(messages) {
    return fetch(AI_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages })
    }).then(function (res) {
      if (!res.ok) throw new Error("worker_error_" + res.status);
      return res.json();
    }).then(function (data) {
      return data && data.text ? data.text : null;
    }).catch(function (err) {
      console.error("AI呼び出し失敗:", err);
      return null;
    });
  }

  function sendUserMessage() {
    var input = document.getElementById("lab-chat-input");
    var text = (input.value || "").trim();
    if (!text) return;
    input.value = "";
    var scrubbed = scrubPII(text);
    postMessage("user", scrubbed).then(function () {
      recentMessages.push({ sender: "user", text: scrubbed });
      maybeSendAIReply();
    }).catch(function (err) {
      console.error("メッセージ送信失敗:", err);
      showLocalNotice("送信に失敗しました。ページを再読み込みしてもう一度お試しください。");
    });
  }

  function maybeSendAIReply() {
    if (currentSessionMode !== "ai") return;
    var now = Date.now();
    if (now - lastAutoReplyAt < AUTO_REPLY_COOLDOWN_MS) return;
    lastAutoReplyAt = now;

    showThinking();
    callAI(recentMessages).then(function (text) {
      var elapsed = Date.now() - thinkingShownAt;
      var wait = Math.max(0, MIN_THINKING_MS - elapsed);
      return new Promise(function (resolve) { setTimeout(resolve, wait); }).then(function () {
        hideThinking();
        var reply = text || AI_NUDGE_FALLBACK;
        return postMessage("bot", reply).then(function () {
          recentMessages.push({ sender: "bot", text: reply });
        });
      });
    }).catch(function (err) {
      hideThinking();
      console.error("自動応答の送信失敗:", err);
    });
  }

  function callDeveloper() {
    var btn = document.getElementById("lab-chat-call-btn");
    btn.disabled = true;
    var sessionRef = db.collection("chat_sessions").doc(sessionId);
    sessionRef.update({
      calledAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      return postMessage("bot", CALL_CONFIRM);
    }).then(function () {
      return sendCallNotification();
    }).catch(function (err) {
      console.error("callDeveloper failed:", err);
      showLocalNotice("開発者呼び出しに失敗しました。しばらくしてから再度お試しください。");
    }).finally(function () {
      btn.disabled = false;
    });
  }

  function sendCallNotification() {
    var chatUrl = window.location.origin + "/admin/chat.html?session=" + encodeURIComponent(sessionId);
    return fetch(AI_WORKER_URL + "/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatUrl: chatUrl })
    }).catch(function (err) {
      console.error("Discord通知の送信失敗:", err);
    });
  }

  function subscribeToSession() {
    var sessionRef = db.collection("chat_sessions").doc(sessionId);

    unsubscribeSession = sessionRef.onSnapshot(function (doc) {
      if (!doc.exists) return;
      var data = doc.data();
      currentSessionMode = data.mode || "ai";
      updateStatusLabel(currentSessionMode);
    }, function (err) {
      console.error("セッション購読エラー:", err);
      showLocalNotice("接続エラーが発生しました。ページを再読み込みしてください。");
    });

    unsubscribeMessages = sessionRef.collection("messages").orderBy("createdAt", "asc")
      .onSnapshot(function (snap) {
        var container = document.getElementById("lab-chat-messages");
        if (container) container.innerHTML = "";
        recentMessages = [];
        snap.forEach(function (doc) {
          var data = doc.data();
          renderMessage(data);
          if (data.sender === "user" || data.sender === "bot") {
            recentMessages.push({ sender: data.sender, text: data.text });
          }
        });
        if (aiThinking) {
          var wasThinking = aiThinking;
          aiThinking = false; // hideThinking内でfalseにされるのを避けるため一旦退避
          showThinking();
          aiThinking = wasThinking;
        }
        recentMessages = recentMessages.slice(-10);
        var launcher = document.getElementById("lab-chat-launcher");
        var panel = document.getElementById("lab-chat-panel");
        if (launcher && panel && !panel.classList.contains("open") && !snap.empty) {
          launcher.classList.add("has-unread");
        }
      }, function (err) {
        console.error("メッセージ購読エラー:", err);
        showLocalNotice("メッセージの読み込みに失敗しました。ページを再読み込みしてください。");
      });
  }

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

    auth.onAuthStateChanged(function (user) {
      if (user) {
        uid = user.uid;
        user.getIdToken(true).then(function () {
          return ensureSessionExists().then(subscribeToSession);
        }).catch(function (err) {
          console.error("セッション初期化失敗:", err);
          showLocalNotice("チャットの初期化に失敗しました。ページを再読み込みしてください。");
        });
      } else {
        auth.signInAnonymously().catch(function (err) {
          console.error("匿名サインインに失敗しました:", err);
          showLocalNotice("接続に失敗しました。ページを再読み込みしてください。");
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
