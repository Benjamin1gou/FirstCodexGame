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

## Phase 8: Hero AI Gameplay Upgrade
- [x] traits中心のスコアリングAIに変更
- [x] 宝箱誘導・罠記憶・思考ログを追加
- [x] planning/runningフェーズ分離を追加

## Phase 9: 仕上げ改修版
- [x] 罠カード選択方式（spike/slime/decoy）
- [x] 罠効果の適用（ダメージ/足止め/誘導）
- [x] 予測ルート表示
- [x] 1手戻し（Backspace）
- [x] 配置不可理由ログ
- [x] ランク評価表示

## Phase 10: Mobile Browser Support
- [x] Phaser scale FIT + autoCenter 対応
- [x] スマホ向けCSS（100dvh / タッチ抑制）追加
- [x] ステージ選択のタップUI追加（前へ/次へ/開始/タイトル）
- [x] ゲーム画面のタップUI追加（罠選択/実行/1手戻し/リスタート）
- [x] ゲームオーバー画面のタップUI追加
- [x] 罠配置の盤面範囲ガードを強化
- [x] タイトル画面に横画面推奨文言追加
- [x] deploy workflow の build コマンド修正

- [x] ステージ遷移時のGameSceneキー不一致を修正

- [x] ステージ画面でマップとメッセージウインドウの重なりを解消

- [x] ステージ画面でメッセージ欄とボタンの重なりを解消
## Phase 11: Onboarding
- [x] 初回プレイヤー向けチュートリアルモード追加（タイトル導線/ステージ引き継ぎ/ゲーム内ガイド）


## Phase 12: AI Movement Stability
- [x] 勇者が予測線上で往復ループし続けるケースを抑制（直前マスへの戻りにペナルティ）


## Phase 13: Audio
- [x] Web Audio APIによる8bit風BGM管理（AudioManager）を追加
- [x] シーンごとのBGM切替と二重再生防止を追加
- [x] ミュートUI（ボタン/Mキー）とlocalStorage保存を追加


## Phase 14: Hero Goal Pursuit Fix
- [x] 最短経路の次マスを優先する補正を追加し、ゴール無視の挙動を抑制

- [x] 強化フェーズ: 罠3種追加・8ステージ化・AI拡張・Vitest導入・CI強化・README更新

## Phase 15: Refactor / Structure Cleanup
- [x] GameScene の責務を段階的に分割（state/layout/board/hero）
- [x] TextButton を共通化し StageSelect / GameScene で利用
- [x] stageRepository / stageLoader の型と検証を強化
- [x] coreロジックの単体テストを拡充
- [x] README に構成と検証コマンドを追記


## Phase 16: Placement UX & Limit Split
- [x] trapLimit（個数）とcostLimit（コスト）を分離
- [x] planningフェーズの配置ハイライトを追加
- [x] 罠ごとの簡易範囲（arrow/decoy）を追加
- [x] ルール/オーバーレイのVitestを追加
- [x] READMEへ仕様追記

## Phase 17: Placement UX Stabilization
- [x] costLimit/配置ハイライト安定化テストを追加（placementRules/getEffectiveCostLimit/buildTrapRangeCells）
- [x] 配置不可ハイライトの視認性を調整（理由別の抑制色 + 予測ルートとの分離）
- [x] 選択中罠の説明UI（名称/Cost/効果）を追加


## Phase 18: Trap Operation System 강화
- [x] 魔力リソース制（mana/maxMana）を追加
- [x] 罠状態（発動回数/クールタイム/破壊）を追加
- [x] 罠状態の表示反映（通常/クールダウン/破壊）
- [x] 罠状態・配置ルールのVitestを拡張
- [x] READMEへ運用仕様を追記


## Phase 19: GB Style Portrait UI
- [x] スマホ縦画面向けのゲーム解像度・レイアウトへ再設計
- [x] タイトル/ステージ選択/ゲームオーバーをGB風UIへ更新
- [x] 罠カード2列×3行 + 下部操作ボタンへ移行
- [x] README と CSS を縦画面GB風仕様に更新

## Phase 20: Loading Assets Stall Fix
- [x] PreloadのSVG読込APIを互換性の高い`load.image`へ統一し、Loading assetsで停止する事象を解消
- [x] GitHub Pages配信時のBASE_URLを考慮したアセットパス解決を追加
- [x] `vite build`の`base`を相対パス(`./`)へ変更し、`https://<user>.github.io/`直下配信でもアセット404で停止しないよう修正

## Phase 21: Preload Base URL Hardening
- [x] BASE_URL 未定義時に `/` へフォールバックし、初期ロード停止を防止

- [x] Phaser名前空間のruntime import不足を修正（Title/StageSelect/Game/GameOver/TextButtonほか）
- [x] PreloadSceneにロード失敗・遷移失敗時の簡易エラー表示を追加

## Phase 22: Mobile Controller UI Refresh
- [x] タイトル/枠を廃止し、白背景 + 上部最大ゲーム表示 + 下部GB風HTMLボタンへ移行
- [x] `mobileControls` を追加し、A/B/START/SELECT/D-pad の押下状態を管理
- [x] GameSceneへ盤面カーソル移動・A配置・B戻す・SELECT切替・START実行/一時停止を追加
- [x] Phaser内大型ボタンを削減しHUD/ログ最小化（ログ2行）

## Phase 23: GB UI Layout Fix
- [x] style.css を `src/main.ts` から import する構成へ変更し、Pages配信時の反映漏れを防止
- [x] StageSelectScene の Phaser内ボタン/外枠を削除し、HTMLコントローラー操作へ統一
