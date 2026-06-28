# SVG Assets — 設計ガイドライン

## ディレクトリ構成

assets/svg/
├── lab/          # 研究室設備SVG（Phase2で生成）
├── icons/        # UIアイコン
└── README.md

## 設計ルール

1. viewBox は 0 0 64 64 を基本単位とする（icons）
2. 研究室設備は用途に応じた viewBox を使用
3. 色はすべて CSS変数 (currentColor / var()) で指定
4. アニメーションは CSS クラスで制御
5. aria-hidden="true" をデフォルト付与（装飾用途）
6. テキスト代替が必要な場合は title + aria-labelledby を付与
7. レスポンシブ: width/height 属性ではなく CSS で制御

## カラーパレット

--accent-blue:   #3b9eff
--accent-teal:   #00e5b8
--accent-purple: #8b72ff
--text-0:        #eef3ff
