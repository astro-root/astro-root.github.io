(function () {
  "use strict";

  /*
    root-slabプロジェクトの実際のfirebaseConfig。
    Firebase WebのapiKeyは秘匿情報ではなく公開して問題ない値。
    アクセス制御はここではなくFirestoreセキュリティルール(firestore.rules)側で行う。
  */
  var firebaseConfig = {
    apiKey: "AIzaSyCV65vRVH0rDsjHp6NuiVHhjQuJJ8jE9L8",
    authDomain: "root-slab.firebaseapp.com",
    projectId: "root-slab",
    storageBucket: "root-slab.firebasestorage.app",
    messagingSenderId: "860040509522",
    appId: "1:860040509522:web:87a108ae1e296e9d64478b"
  };

  if (typeof firebase === "undefined") {
    console.error("Firebase SDKが読み込まれていません。firebase-init.jsより前にFirebase compat SDKのscriptタグを読み込んでください。");
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
