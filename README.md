# るーとの研究室

高校生Webエンジニア「るーと」のポートフォリオサイト。

🌐 **サイト**: [astro-root.com](https://astro-root.com/)

## 開発ツール

| ツール | URL | 概要 |
|--------|-----|------|
| Q-Score | [q-score.astro-root.com](https://q-score.astro-root.com/) | クイズ大会用得点表示システム |
| Q-Room  | [q-room.astro-root.com](https://q-room.astro-root.com/)   | リアルタイムオンラインクイズルーム |
| Q-Mark  | [q-mark.astro-root.com](https://q-mark.astro-root.com/)   | ペーパークイズ デジタル採点ツール |
| Q-Panel | [q-panel.astro-root.com](https://q-panel.astro-root.com/) | パネル開放クイズシステム |
| Q-Cumber | [q-cumber.astro-root.com](https://q-cumber.astro-root.com/) | - |
| Typing  | [typing.astro-root.com](https://typing.astro-root.com/)   | タイピングゲーム |

## サイト構成

素のHTML/CSS/JSで構築し、GitHub Pagesでホスティング。ビルドツールは使用せず、
`partials/` + 同期スクリプトによる軽量なコンポーネント共通化のみ導入している。
.
├── index.html, about.html, contact.html, ...   # 各ページ(静的HTML)
├── assets/
│   ├── css/
│   │   ├── variables.css, base.css, nav.css, footer.css, chat-widget.css
│   │   └── pages/            # ページ固有CSS(index.css, about.css など)
│   └── js/
│       ├── lab-common.js, nav-active.js, chat-widget.js, firebase-init.js
│       └── pages/            # ページ固有JS(index.js, about.js など)
├── partials/
│   ├── header.html           # 共通ヘッダーの正本
│   └── footer.html           # 共通フッターの正本
├── scripts/
│   ├── sync-partials.js      # partials/ の内容を各HTMLへ同期する実行スクリプト
│   └── lib/
│       ├── apply-partial.js  # マーカー間を置換する処理
│       └── file-list.js      # 同期対象ファイル一覧
├── admin/
│   ├── chat.html             # Live Chat管理画面(Firebase Auth必須)
│   └── ...
└── worker/
└── index.js              # Cloudflare Worker(AI応答 / Discord通知の中継)

### header / footer の編集方法

ヘッダー・フッターを変更する場合は、各HTMLファイルを直接編集せず、
`partials/header.html` または `partials/footer.html` を編集してから、
以下のスクリプトを実行して全ページに反映する。

```bash
node scripts/sync-partials.js
```

対象ページは `scripts/lib/file-list.js` で管理している。新しいページを追加した場合は、
そのファイルの `<header role="banner">...</header>` と `<footer>...</footer>` を
`<!-- PARTIAL:HEADER:START -->` / `<!-- PARTIAL:HEADER:END -->` などのマーカーで囲んでから
一覧に追加すること。

### Live Chat機能

サイト右下のチャットウィジェットは、Firebase(Firestore + Authentication)と
Cloudflare Workerを組み合わせたサーバーレス構成で動作する。

- 来訪者は匿名認証でセッションを作成し、Firestoreにメッセージを保存する
- セッションには `mode` フィールド(`ai` または `developer`)があり、
  管理画面(`/admin/chat.html`)のトグルで開発者が手動切り替えできる
- `mode: "ai"` の間は、Cloudflare Worker([worker/index.js](worker/index.js))経由で
  Gemini APIを呼び出し自動応答する
- 「開発者を呼ぶ」ボタンは同Workerを経由してDiscordに通知を送るのみで、
  モードの自動切り替えは行わない(手動制御のみ)

Workerのデプロイ:

```bash
cd worker
wrangler deploy
```

Firestoreルールのデプロイ:

```bash
npx firebase-tools deploy --only firestore:rules
```

## 連絡先

- お問い合わせフォーム: [astro-root.com/contact](https://astro-root.com/contact)
- X (個人): [@astro_root](https://x.com/astro_root)
- X (公式): [@root_qscore](https://x.com/root_qscore)
