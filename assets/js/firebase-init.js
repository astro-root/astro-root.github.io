(function () {
  "use strict";

  /*
    TODO: Firebaseコンソール(プロジェクトの設定 > 全般 > マイアプリ > SDKの設定と構成)
    から取得した値に置き換えてください。
    Firebase WebのapiKeyは秘匿情報ではなく公開して問題ない値です。
    アクセス制御は firebase-init.js ではなく Firestore セキュリティルール側で行います。
  */
  var firebaseConfig = {
    apiKey: "AIzaSyCV65vRVH0rDsjHp6NuiVHhjQuJJ8jE9L8"",
    authDomain: "root-slab.firebaseapp.com",
    projectId: "root-slab",
    storageBucket: "root-slab.appspot.com",
    messagingSenderId: "860040509522",
    appId: "1:860040509522:web:87a108ae1e296e9d64478b"
  };

  if (typeof firebase === "undefined") {
    console.error("Firebase SDKが読み込まれていません。firebase-init.jsより前にFirebase compat SDKのscriptタグを読み込んでください。");
    return;
  }

  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("firebase-init.js: firebaseConfigが未設定です。このファイルを編集し、実際の値に置き換えてください。チャット機能は動作しません。");
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.LAB_FIREBASE = {
    db: firebase.firestore(),
    auth: firebase.auth()
  };
})();
