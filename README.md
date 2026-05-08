# FirstCodexGame

Codex Web だけで開発できる、TypeScript + Phaser + Vite の最小プレイアブル 2D ブラウザゲームです。

## Repository Review（作業ログ）
- テンプレート由来: `phaserjs/template-vite-ts` 構成を確認。
- scripts: `build-nolog` が存在するためビルドはこれを優先。
- lockfile: `package-lock.json` があるため依存導入は `npm ci` 前提。
- 依存スクリプト: package.json には `preinstall` / `install` / `postinstall` の定義なし。
- vite: prod設定あり、GitHub Pages向けに `base` を `/FirstCodexGame/` に調整。

## 開発コマンド
```bash
npm ci
npm run dev-nolog
npm run build-nolog
```

## ゲーム内容（最小プレイアブル）
- TitleScene → GameScene → GameOverScene の遷移
- 矢印キーでプレイヤー移動
- 敵に当たるとゲームオーバー
- アイテム取得でスコア加算
- GameOver で `R` リスタート、`T` タイトルへ戻る

## ディレクトリ構成
- `src/scenes`: シーン
- `src/entities`: ゲームオブジェクト生成
- `src/systems`: ゲームロジック
- `src/config`: 設定値
- `public/assets/generated`: 自作SVG素材

## GitHub Pages 公開手順
1. `main` ブランチへ push
2. GitHub の **Settings > Pages** を開く
3. Source を **GitHub Actions** に設定
4. `.github/workflows/deploy.yml` の完了を待つ
5. 公開URL: `https://<user>.github.io/FirstCodexGame/`

## セキュリティ方針
- APIキーや secrets はコミットしない
- 不審な install script を持つ依存は追加しない
- 素材は自作SVGを優先し、ライセンス不明素材を使わない
