---
description: プルリクエストを作成する。
---

# ⚠️ 重要: このワークフローは必ず順番通りに実行すること

## 1. 現在のブランチと変更内容の確認
```bash
git branch --show-current
git status
```
- 未コミットの変更がある場合は、先に `/commit` ワークフローを実行してください。

## 2. ★★★ デフォルトブランチの確認（必須）★★★
```bash
git remote show origin | grep 'HEAD branch'
```
- **このステップは絶対にスキップしないこと**
- 出力された `HEAD branch: XXX` の `XXX` を PR の `base` として使用する
- 例: `HEAD branch: develop` → `base: develop`
- 例: `HEAD branch: main` → `base: main`

```bash
git log --oneline <デフォルトブランチ>..HEAD
```
- 差分コミットを確認してください。

## 3. リモートへのプッシュ
```bash
git push -u origin <現在のブランチ名>
```
- すでにプッシュ済みの場合はこのステップをスキップしてください。

## 4. PR テンプレートの読み込み
- `.github/pull_request_template.md` を読み込み、テンプレートの構造に従って PR の説明を作成してください。

## 5. PR の説明（body）の生成
コミット履歴と変更内容を分析し、テンプレートに従って以下のセクションを埋めてください:

- **概要 (Summary)**: 変更の目的と背景を記述
- **関連 Issue (Related Issues)**: 関連する Issue へのリンク（例: `Closes #123`）
- **変更の種類 (Type of Change)**: 該当する項目にチェック `[x]` を入れる
- **テスト (Test)**: 実施したテストにチェック `[x]` を入れる
- **チェックリスト (Checklist)**: 確認済み項目にチェック `[x]` を入れる

## 6. PR タイトルの生成
- [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) 形式で簡潔に記述
- フォーマット: `type(scope): subject`

## 7. プルリクエストの作成
`mcp_github-mcp-server_create_pull_request` ツールを使用:

| パラメータ | 値 |
|-----------|-----|
| `owner` | リポジトリオーナー（例: `gnkm`） |
| `repo` | リポジトリ名（例: `my-brain`） |
| `title` | 生成したタイトル |
| `body` | テンプレートに従って生成した説明 |
| `head` | 現在のブランチ名 |
| `base` | **ステップ 2 で確認したデフォルトブランチ（`main` ではなく `develop` の可能性あり）** |

## 8. 作成結果の報告
- プルリクエストの URL をユーザーに報告してください。
