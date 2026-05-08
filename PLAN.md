# PLAN

## 開発目的
Codex Web だけで開発・保守できる Phaser 2D ブラウザゲームの最小プレイアブル版を実装し、GitHub Pages で公開可能にする。

## 技術構成
- TypeScript
- Phaser 4
- Vite
- GitHub Actions + GitHub Pages

## ゲーム概要
- タイトル画面から開始できる1プレイ短時間ゲーム
- プレイヤー移動で敵を避けつつアイテム取得してスコア加算
- 衝突でゲームオーバー、リスタート可能

## コアループ
1. タイトルで開始
2. ゲーム中に移動・取得・回避
3. スコア増加
4. 敵接触でゲームオーバー
5. リスタート

## 必須画面
- TitleScene
- GameScene
- GameOverScene

## 必須機能
- キーボード操作
- 当たり判定
- スコア表示
- シーン遷移
- リスタート

## 素材方針
- `public/assets/generated` に SVG プレースホルダ素材を配置
- 高コントラスト・小画面視認性重視
- 既存IP非依存

## GitHub Pages公開方針
- Vite base を `/FirstCodexGame/` に設定
- Actions で `npm ci` → `npm run build-nolog || npm run build` → Pages deploy

## マイルストーン
1. Repository Review
2. Structure整理
3. First Playable
4. SVG組込
5. Build確認
6. Pages公開設定
