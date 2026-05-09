# Asset Guide

## ディレクトリ構成
- `public/assets/tiles`: タイル系（床/壁/開始/ゴール/罠/宝箱/モンスター）
- `public/assets/characters/heroes`: 勇者画像
- `public/assets/ui`: UIパネルやボタン
- `public/assets/effects`: エフェクト
- `src/assets`: アセットキー・マニフェスト・preload処理

## 命名規則
- タイル: `floor`, `wall`, `start`, `goal`, `trap_spike`, `treasure`, `monster`
- 勇者: `hero_<heroId>`（例: `hero_adel`）
- UI: `panel`, `button`
- エフェクト: `trap_hit`

## 推奨サイズ
- タイル/キャラ/罠: 56x56 を基準（表示時は `TILE_SIZE` でリサイズ）
- UIパネル: 横長（例: 320x120）

## タイル素材
- `src/assets/assetKeys.ts` のキーを維持し、`public/assets/tiles/` のファイルだけ差し替える

## キャラクター素材
- 勇者IDと同名のキーを維持して差し替える
- 新勇者追加時は `assetKeys.ts` / `assetManifest.ts` / `GameScene` の対応表を更新

## UI素材
- `ui_panel` は情報エリア背景用途
- `ui_button` は将来のボタン画像用途

## 差し替え手順
1. 対象SVG/PNGを `public/assets/...` に配置
2. `src/assets/assetManifest.ts` の path を更新（キーは維持）
3. 必要なら `assetKeys.ts` に新キー追加
4. `npm run build-nolog` で確認

## ライセンス方針
- ライセンス不明素材は使用しない
- 商用利用可能な素材のみ使用する
- 外部素材を使う場合は出典とライセンスを記録する
- AI生成素材を使う場合も、利用条件を確認する
