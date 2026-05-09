# 勇者誘導ダンジョン（FirstCodexGame）

TypeScript + Phaser + Vite で作る、2D逆タワーディフェンス型パズルゲームMVPです。

## ゲーム概要
プレイヤーは魔王ヴァルムの参謀として、勇者を直接攻撃せず、罠配置で自動行動する勇者を誘導・撃退します。

## 技術構成
- TypeScript
- Phaser 4
- Vite 6
- GitHub Pages（静的配信）

## 起動方法
```bash
npm ci
npm run dev-nolog
```

## ビルド方法
```bash
npm run build-nolog
```

## ディレクトリ構成
- `src/scenes`: 画面進行と描画
- `src/core`: ルール/AI/ステージ/物語
- `src/data`: ステージ・勇者・ナラティブ定義
- `src/systems`: ログなど横断処理
- `src/config`: ゲーム設定

## データ追加方法
- ステージ: `src/data/stages/stage-xxx.ts` を追加し `stageRepository.ts` に登録
- 勇者: `src/data/heroes/heroes.ts` に `HeroDefinition` を追加
- 罠: `src/config/gameConfig.ts` の `TRAP`（将来は data 化推奨）
- ストーリー: `src/data/narrative/story.ts` に `NarrativeDefinition` を追加

## エンディング分岐
`resolveEnding(allCleared, totalTrapCost)` で分岐。
- 全クリア + 低コスト: 知略勝利
- 全クリア + 高コスト: 力押し勝利
- 途中失敗: 敗北

## GitHub Pages公開手順
1. `main` にpush
2. Settings > Pages を GitHub Actions に設定
3. `.github/workflows/deploy.yml` 完了を確認

## セキュリティ方針
- secrets はコミットしない
- 外部通信・バックエンドは追加しない
- ライセンス不明素材は使わない
- install script 付き依存は慎重に評価

## 今後の拡張案
- 宝箱/モンスターの本実装
- 勇者性格別の経路選好
- 罠コストUI改善
- Vitest で core 層テスト追加
