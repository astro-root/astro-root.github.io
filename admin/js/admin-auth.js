(function () {
  "use strict";

  /*
    簡易パスワードゲート認証。
    本番運用では Firebase Authentication への移行を前提とした設計。
    SESSION_KEY は settings.json の admin.sessionKey と対応させること。
  */

  var SESSION_KEY = "lab_admin_session";
  var SESSION_TTL_MS = 1000 * 60 * 60 * 4; /* 4時間 */

  /*
    パスワードはハッシュ化せず平文比較しているが、これは
    静的ホスティング上の簡易ゲートであり、本格的なセキュリティ境界
    ではないことを前提とする。重要データはこのレベルで保護しない。
  */
  var ADMIN_PASSWORD = "lab-2026-root";

  var AdminAuth = {};
  window.AdminAuth = AdminAuth;

  AdminAuth.login = function (password) {
    if (password !== ADMIN_PASSWORD) return false;
    var session = {
      authenticated: true,
      expiresAt: Date.now() + SESSION_TTL_MS
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error("Session save failed:", e);
      return false;
    }
    return true;
  };

  AdminAuth.logout = function () {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error("Session removal failed:", e);
    }
  };

  AdminAuth.isAuthenticated = function () {
    var raw;
    try {
      raw = localStorage.getItem(SESSION_KEY);
    } catch (e) {
      return false;
    }
    if (!raw) return false;

    var session;
    try {
      session = JSON.parse(raw);
    } catch (e) {
      return false;
    }

    if (!session || !session.authenticated) return false;
    if (Date.now() > session.expiresAt) {
      AdminAuth.logout();
      return false;
    }
    return true;
  };

  AdminAuth.requireAuth = function () {
    if (!AdminAuth.isAuthenticated()) {
      window.location.href = "/admin/index.html";
    }
  };
})();
