# TASKS

## Phase 0: Repository Review
- [x] package.json / scripts / dependencies 確認
- [x] vite設定確認
- [x] src構成確認
- [x] README確認
- [x] build手順優先順位確認（build-nolog優先）

## Phase 1: Project Structure
- [x] `src/scenes` `src/entities` `src/systems` `src/config` `src/utils` を作成
- [x] 指示ドキュメント作成（AGENTS/PLAN/ART/SECURITY）

## Phase 2: First Playable Version
- [x] TitleScene 実装
- [x] GameScene 実装
- [x] GameOverScene 実装
- [x] プレイヤー移動
- [x] 敵/障害物
- [x] アイテム取得とスコア加算
- [x] 当たり判定
- [x] リスタート導線

## Phase 3: SVG Placeholder Assets
- [x] player/enemy/item/background/button/title-logo/game-over-panel 追加
- [x] Phaser で読み込み

## Phase 4: Testing
- [x] build 実行
- [x] 必要なら test 実行
- [ ] 余力があれば Playwright スモークテスト

## Phase 5: GitHub Pages
- [x] Vite base 設定
- [x] deploy workflow 追加
- [x] Pages デプロイ 404 対応（configure-pages 追加）
- [x] `configure-pages` に `enablement: true` を設定（Pages未有効リポジトリの Not Found 対策）

## Phase 6: Polish
- [x] README更新
- [x] 追加改善（必要時）
- [x] 画像素材ベース描画への移行（アセットキー/マニフェスト/Preload分離）

## Phase 7: Security Hardening
- [x] 不要外部通信スクリプト参照を削除
- [x] `.gitignore` と `.env.example` を整備
- [x] セキュリティチェック項目と秘密情報スキャン手順を更新
