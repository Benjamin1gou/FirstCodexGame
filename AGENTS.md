# AGENTS.md

## Purpose
- このリポジトリは **Codex Web のみ**で開発・運用する。
- 技術スタックは **TypeScript + Phaser + Vite** を維持する。
- 公開先は **GitHub Pages** とし、追加費用 0 円で継続できる構成を保つ。

## Development Rules
- 依存追加前に `npm view <pkg> repository homepage license` と `npm audit` 観点を確認する。
- `preinstall` / `install` / `postinstall` script を持つ依存は理由と安全性を明記してから採用する。
- SVG素材を優先し、`public/assets/generated/` 配下にテキスト編集可能な形式で管理する。
- 既存IP、企業ロゴ、実在人物に似た素材は作成しない。

## Build / Check
- 優先ビルド確認: `npm run build-nolog`
- `build-nolog` が無い場合のみ: `npm run build`
- package-lock.json があるため依存導入は `npm ci` を使う。

## Task Management
- 実装後は `TASKS.md` の完了状態を更新する。
- 差分は PR-ready（ビルド可能、説明可能、不要ファイルなし）に保つ。
