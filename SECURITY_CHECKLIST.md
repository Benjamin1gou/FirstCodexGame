# SECURITY_CHECKLIST

## npm依存追加時
- パッケージの公開元・ライセンス・更新頻度を確認
- `npm view <pkg> repository homepage license` で公開情報を確認
- `npm audit` の結果を確認し、重大な脆弱性を放置しない
- `preinstall` / `install` / `postinstall` の有無を確認
- 無名パッケージの大量追加を避ける

## GitHubリポジトリ参照時
- 公式/信頼組織か確認
- Star数だけで判断しない
- 実行スクリプト内容を確認

## 素材利用時
- ライセンス不明素材を使わない
- 既存IPや企業ロゴ類似を避ける
- 実在人物類似を避ける

## 秘密情報
- `.env` はコミットしない
- APIキー・トークン・パスワードをソースコードに直書きしない
- 実運用シークレットは GitHub Secrets 等の秘匿ストアで管理する

## 外部通信・スクリプト
- 外部通信を追加する場合は、目的・送信先・送信内容を明記する
- npm scripts に不要な外部通信を仕込まない

## GitHub Actions
- secrets を使い、値をログ出力しない
- デバッグ時もトークン・鍵のマスク漏れを確認する

## 公開前チェック
- `npm run scan:secrets` で機密らしき文字列を点検する
- 必要に応じて `git grep -n -E "(API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|BEGIN RSA|BEGIN OPENSSH|ghp_|sk-)" -- . ':!package-lock.json'` を実行する

## 実行コマンド
- 不審な install script を避ける
- `curl | bash` 系コマンドを避ける
