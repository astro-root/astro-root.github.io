# Data Schema — 設計ガイドライン

## 概要

このディレクトリはサイト全体のデータを JSON 形式で管理します。
将来的に Firebase Firestore への移行を前提とした設計です。

## ファイル一覧

| ファイル            | Firestoreコレクション | 用途                       |
|---------------------|----------------------|----------------------------|
| articles.json       | articles             | ブログ記事                 |
| study.json          | study_items          | 学習コンテンツ             |
| projects.json       | projects             | 公開プロジェクト           |
| research-log.json   | research_logs        | 研究ログ・活動記録         |
| navigation.json     | Remote Config        | ナビゲーション・ルーティング |
| settings.json       | Remote Config        | サイト設定・定数           |

## Firebase 移行手順

1. settings.json の `firebase.enabled` を `true` に変更
2. `firebase.projectId` を設定
3. Firestore SDK を読み込む
4. 各ページの fetch('/assets/data/xxx.json') を
   Firestore の `getDocs()` に置き換える

## データアクセスパターン

```javascript
// JSON（現在）
const res = await fetch('/assets/data/articles.json');
const { articles } = await res.json();

// Firestore（移行後）
const snap = await getDocs(collection(db, 'articles'));
const articles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
```

## _meta フィールド

各JSONには `_meta` と `_schema` フィールドを付与しています。

- `_meta.version`   — スキーマバージョン（semver）
- `_meta.changelog` — 変更履歴
- `_schema`         — フィールド定義（ドキュメント兼型定義）

`_meta` と `_schema` はFirestore移行時には除外します。
