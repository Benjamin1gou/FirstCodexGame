# FirstCodexGame

FirstCodexGame は **TypeScript + Phaser + Vite** で作られた、静的配信向けの2D逆タワーディフェンス型パズルです。  
プレイヤーは魔王軍の参謀として、勇者に直接攻撃せず罠配置で誘導・撃退します。

## 操作方法
- 罠選択: キーボード `1-6` / 画面右の罠ボタン
- 罠配置: 盤面タップ（盤面外タップは無効）
- 実行: `Enter` / 実行ボタン
- 1手戻し: `Backspace` / 1手戻しボタン
- リスタート: `R` / リスタートボタン
- チュートリアル: `H`

## スマホ操作
- 右側の大きめボタンで罠選択・実行可能
- 選択中の罠はハイライト表示
- 盤面外タップの誤配置を防止

## 罠一覧
- `spike`: 高ダメージ
- `slime`: 小ダメージ + 1ターン足止め
- `decoy`: 好奇心誘導
- `arrow`: 中ダメージ
- `fear`: 1手戻しを誘発
- `pitfall`: 小ダメージ + 1ターン足止め

## 勇者一覧
- アデル: 最短志向・低リスク回避
- ミオ: 好奇心/宝箱志向が高い
- セレナ: 高リスク回避・罠記憶が強い
- ロイ: バランス型
- ニア: 宝箱志向が非常に高い

## ステージ構成
全8ステージ。基本操作から新罠チュートリアル、総合演習まで段階的に構成しています。

## スコア・ランク
ランクは `S/A/B/C`。使用コスト・罠数・ターン数・残HPを元に評価します。

## 罠説明UI
- planningフェーズ中は、選択中の罠の**名称 / Cost / 効果説明**を上部に表示します。
- スマホ操作時でも現在選択中の罠が分かりやすく、誤タップ時の判断がしやすくなります。

## 配置制限とハイライト
- `trapLimit`: 配置できる**罠の個数上限**です。
- `costLimit`（任意）: 使える**総コスト上限**です。未指定時は `trapLimit` をコスト上限として扱い、従来挙動を維持します。
- planningフェーズ中は、選択中の罠に対して盤面に配置補助を表示します。
  - 配置可能マス: 薄い緑
  - 配置不可マス: 目立ちすぎない抑えめカラー（壁/スタート/ゴール/勇者/既存罠は理由別の色味）
  - `arrow`: 周囲1マスの簡易範囲表示
  - `decoy`: 周囲2マスの簡易範囲表示
- running開始時はハイライトを消し、次のplanningで再描画されます。
- 実行前に配置可能場所を視覚確認できるため、スマホ操作でも誤配置を減らせます。



## 魔力リソースと罠運用
- 各ステージに `Mana`（初期値/上限）を持ち、罠配置時に Cost 分の魔力を消費します。
- `HP / Mana / 罠数 / Cost` をHUDに表示し、配置可能かを即時判定します。
- 罠には「発動回数」「クールタイム」「破壊状態」があり、再使用待ち中は盤面で半透明表示、破壊済みは薄表示になります。
- 罠発動時に種類ごとの魔力回復があります（上限を超えない）。

## ディレクトリ構成（抜粋）
- `src/scenes/GameScene.ts`: シーンのライフサイクルと主要フロー制御
- `src/scenes/game/GameSceneStateFactory.ts`: シミュレーション初期状態生成
- `src/scenes/game/GameSceneLayout.ts`: 盤面レイアウト計算とUI定数
- `src/scenes/game/BoardRenderer.ts`: タイル/罠の盤面描画
- `src/scenes/game/HeroRenderer.ts`: 勇者スプライト生成と座標更新
- `src/ui/TextButton.ts`: テキストボタン生成の共通ユーティリティ
- `src/core/*`: ルール/AI/シミュレーションなどの純粋ロジック

## 開発時の確認コマンド
```bash
npm run test
npm run build-nolog
npm run scan:secrets
```

## テスト
```bash
npm run test
```
- `placementRules` の個別ケース（壁/スタート/ゴール/勇者/既存罠/trapLimit/costLimit）を追加。
- `getEffectiveCostLimit` の分岐テストを追加。
- `buildTrapRangeCells` の範囲/盤面外除外テストを追加。

## ビルド
```bash
npm ci
npm run build-nolog
```

## セキュリティ方針
- APIキー・トークン・シークレットを追加しない
- 外部API/バックエンドを追加しない
- ライセンス不明素材を追加しない
- `npm run scan:secrets` で定期確認する

## GitHub Pages 公開
`.github/workflows/deploy.yml` で `npm ci → build → test → scan:secrets` を実行後、Pagesへデプロイします。
