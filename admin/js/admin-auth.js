(function () {
  "use strict";

  /*
    Admin全体の認証ゲート。

    旧実装は平文パスワードをこのファイルに直接埋め込み、
    localStorageのフラグだけで認証済み扱いにしていた
    (静的ホスティング上、誰でもソースを見れば突破できる状態だった)。

    v2では、既に admin/chat.html で使われていた
    Firebase Authentication (Email/Password) をAdmin全体の入口として使う。
    パスワードの検証はFirebaseサーバー側で行われるため、
    ブラウザの開発者ツールを開いても認証情報そのものは見えない。

    ログイン画面の見た目は「パスワードを1つ入力するだけ」のまま。
    内部的には固定のAdminメールアドレス + 入力されたパスワードで
    signInWithEmailAndPassword() を呼んでいる。
  */

  var ADMIN_EMAIL = "contact@astro-root.com"; /* firestore.rules の isDeveloper() と同じアドレスにすること */

  var AdminAuth = {};
  window.AdminAuth = AdminAuth;

  function firebaseReady() {
    return !!(window.LAB_FIREBASE && window.LAB_FIREBASE.auth);
  }

  /* ── ログイン ── */
  AdminAuth.login = function (password) {
    if (!firebaseReady()) {
      return Promise.reject(new Error("firebase_not_configured"));
    }
    if (!password) {
      return Promise.reject(new Error("password_required"));
    }
    return window.LAB_FIREBASE.auth
      .signInWithEmailAndPassword(ADMIN_EMAIL, password)
      .then(function (cred) {
        return cred.user;
      });
  };

  /* ── ログアウト ── */
  AdminAuth.logout = function () {
    if (!firebaseReady()) return Promise.resolve();
    return window.LAB_FIREBASE.auth.signOut();
  };

  /*
    現在の認証状態を1回だけ取得する(Promise版)。
    Firebaseはページ読み込み直後、IndexedDBからセッションを復元する間
    一瞬 user=null を返すことがあるため、必ず最初の確定状態を待つ。
  */
  AdminAuth.getCurrentUser = function () {
    return new Promise(function (resolve) {
      if (!firebaseReady()) {
        resolve(null);
        return;
      }
      var unsub = window.LAB_FIREBASE.auth.onAuthStateChanged(function (user) {
        unsub();
        resolve(user && !user.isAnonymous ? user : null);
      });
    });
  };

  /*
    保護ページの先頭で呼ぶ。認証確認が終わるまで全画面オーバーレイで
    コンテンツを隠し、未認証ならログインページへリダイレクトする。
    確認が取れたら onReady コールバックを呼ぶ(渡さなくてもよい)。
  */
  AdminAuth.requireAuth = function (onReady) {
    var overlay = document.createElement("div");
    overlay.id = "admin-auth-gate";
    overlay.setAttribute("aria-live", "polite");
    overlay.style.cssText = [
      "position:fixed", "inset:0", "z-index:99999",
      "display:flex", "align-items:center", "justify-content:center",
      "flex-direction:column", "gap:14px",
      "background:#020b18",
      "font-family:'JetBrains Mono',monospace",
      "font-size:0.7rem", "letter-spacing:0.14em",
      "color:#7d9ab8", "text-transform:uppercase"
    ].join(";");
    overlay.innerHTML =
      '<div style="width:8px;height:8px;border-radius:50%;background:#4ba9ff;' +
      'animation:adminGatePulse 1.2s ease-in-out infinite;"></div>' +
      "<span>Checking session...</span>" +
      "<style>@keyframes adminGatePulse{0%,80%,100%{opacity:.3;transform:scale(.6)}40%{opacity:1;transform:scale(1)}}</style>";
    document.body.appendChild(overlay);

    AdminAuth.getCurrentUser().then(function (user) {
      if (!user) {
        window.location.href = "/admin/index.html";
        return;
      }
      overlay.remove();
      if (typeof onReady === "function") onReady(user);
    });
  };

  /*
    互換用の同期チェック(旧APIを呼んでいるコードのため)。
    実際の可否判定は必ず requireAuth / getCurrentUser 経由で行うこと。
  */
  AdminAuth.isAuthenticated = function () {
    return !!(firebaseReady() && window.LAB_FIREBASE.auth.currentUser && !window.LAB_FIREBASE.auth.currentUser.isAnonymous);
  };
})();
