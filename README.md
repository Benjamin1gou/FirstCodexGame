# FirstCodexGame

2D逆タワーディフェンス型パズル。魔王軍参謀として罠配置で勇者を迎撃します。

## 操作
- 罠選択: 1〜6キー or 右側ボタン
- 罠配置: 盤面タップ
- 実行: Enter or 実行ボタン
- 1手戻し: Backspace or 1手戻し

## 罠一覧
- spike: 高ダメージ
- slime: 小ダメージ+1ターン停止
- decoy: 誘導
- arrow: 中ダメージ
- fear: 逆走
- pitfall: 小ダメージ+停止

## 勇者一覧
アデル / ミオ / セレナ / ロイ / ニア

## ステージ
全8ステージ。基本、誘導、危険回避、新罠、総合演習を収録。

## スコア・ランク
使用コスト・罠数・ターン数・残HPで S/A/B/C を評価。

## 開発
```bash
npm ci
npm run build-nolog
npm run test
npm run scan:secrets
```

## GitHub Pages
既存の `.github/workflows/deploy.yml` で静的配信します。

## セキュリティ方針
秘密情報はコミットしない・外部APIを追加しない・ライセンス不明素材を追加しない。
