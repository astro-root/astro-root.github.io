# Admin ログイン セットアップ手順

## 結論から: 新しい設定はおそらく不要です

`admin/chat.html` の Live Chat 機能で、すでに Firebase Authentication
(メール `contact@astro-root.com` + パスワード)でログインできているなら、
**同じアカウント・同じパスワードでサイト全体の Admin にログインできます。**
Firebase側の新規設定は必要ありません。

以下は、うまくログインできない場合の確認事項です。

---

## 1. 何が変わったか

- 旧: `admin/js/admin-auth.js` に平文パスワード `lab-2026-root` が直接書かれており、
  ブラウザの開発者ツールでソースを見れば誰でも突破できる状態でした。
- 新: サイト全体の Admin (`/admin/index.html` → `/admin/dashboard.html`,
  `/admin/chat.html`) が、Firebase Authentication の
  `signInWithEmailAndPassword` を使う1つの認証ゲートに統一されました。
  パスワードの検証は Firebase サーバー側で行われます。
- ログイン画面の見た目は変えていません。パスワードを1つ入力するだけです。
  内部で使われるメールアドレスは `admin/js/admin-auth.js` 内の
  `ADMIN_EMAIL` 定数に固定で書かれています。

## 2. 確認すること

### 2.1 Firebase Authentication にアカウントがあるか

[Firebase Console](https://console.firebase.google.com/) → プロジェクト
`root-slab` → Authentication → Users を開き、
`contact@astro-root.com` のユーザーが存在するか確認してください。

- **すでにある場合**: 何もしなくて大丈夫です。そのパスワードで
  `/admin/index.html` からログインできます。
- **ない場合**: 「ユーザーを追加」からメールアドレス
  `contact@astro-root.com` とパスワードを設定して作成してください。

### 2.2 メールアドレスを変える場合

固定のメールアドレスを別のものにしたい場合は、
`admin/js/admin-auth.js` の以下の行を書き換えてください。

```js
var ADMIN_EMAIL = "contact@astro-root.com";
```

**同時に `firestore.rules` の `isDeveloper()` 内のメールアドレスも
同じ値に揃えてください。** ここがズレると、ログインはできても
Firestore(Live Chatのデータ)にアクセスできなくなります。

```js
function isDeveloper() {
  return request.auth != null
         && request.auth.token.email == 'contact@astro-root.com'; // ← ここ
}
```

ルールを変更したら、Firebase CLI で再デプロイしてください。

```bash
firebase deploy --only firestore:rules
```

### 2.3 ログインできない場合によくある原因

| 症状 | 原因 | 対処 |
|---|---|---|
| 「パスワードが正しくありません」 | パスワード誤り、またはFirebaseにアカウント未作成 | 2.1を確認 |
| 「管理者アカウントが見つかりません」 | `ADMIN_EMAIL` の値とFirebase側のメールアドレスが不一致 | 2.2を確認 |
| 「Firebase未設定です」 | `assets/js/firebase-init.js` の読み込み順、またはCDNブロック | ネットワーク設定・script順を確認 |
| 「試行回数が多すぎます」 | 短時間に何度も失敗した(Firebase側のレート制限) | 数分待って再試行 |

## 3. 今回のセキュリティ変更の範囲

今回直したのは「サイト全体のAdmin入口」の認証だけです。
以下は今回の作業では対応していません。

- **Admin Dashboard が保存するデータは、今もブラウザの LocalStorage です**
  (画面はv2のProjects/Research/Notes/Technologiesに対応しましたが、
  保存先はFirestoreに移行していません)。公開サイトに反映するには、
  Dashboardの「JSON書き出し」でコピーし、`assets/data/v2/*.json` に
  貼り付けてコミットする必要があります。
- Firestoreへの本格移行(Admin保存 → 自動で公開サイトに反映)は
  別途の作業です。`admin-store.js` の内部実装を差し替えるだけで
  Dashboard側のコードは変更不要な設計にはなっています。

## 4. もし将来アカウントを増やしたい場合

現状は管理者が1人(るーと本人)の前提で、メールアドレス1つを
固定でハードコードする設計にしています。複数人で管理する場合は、
`isDeveloper()` を `request.auth.token.email in ['a@x.com','b@x.com']`
のようなリスト方式に変更してください。
