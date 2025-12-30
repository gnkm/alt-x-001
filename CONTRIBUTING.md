# 開発ガイド (Development Guide)

## 開発フロー

### ブランチの命名規則

ブランチ名は、変更の種類とその内容がわかるように、以下の形式で命名してください。

`prefix/branch-name`

推奨される Prefix:
- `feature/`: 新機能の追加 (例: `feature/add-settings-ui`)
- `fix/`: バグ修正 (例: `fix/audio-capture-error`)
- `docs/`: ドキュメントの変更 (例: `docs/update-readme`)
- `refactor/`: リファクタリング (例: `refactor/whisper-service`)
- `test/`: テストの追加・修正 (例: `test/add-unit-tests`)
- `chore/`: ビルド設定やツールの更新など (例: `chore/update-dependencies`)

### コミットメッセージ

コミットメッセージは明確かつ簡潔に記述してください。可能であれば [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) に従うことを推奨します。

## 環境構築 (Setup)

### Lefthook (Git Hooks) の設定

本プロジェクトでは、コミット前にコードの品質確認を自動化するために [Lefthook](https://github.com/evilmartians/lefthook) を使用しています。
初回セットアップ時に以下のコマンドを実行して、Git Hooks を有効化してください。

```bash
# Lefthook がインストールされていない場合はインストール (Homebrew の場合)
brew install lefthook

# Git Hooks のインストール
lefthook install
```

## ビルド & テスト (Build & Test)

開発中のビルドおよびテストの実行方法は以下の通りです。

## AI Agent ワークフロー (Slash Commands)


本プロジェクトでは、AI Agent 用のワークフローが定義されています。チャット欄でスラッシュコマンドを入力することで、定型的なタスクを効率的に実行できます。

*   `/commit`: **コミット作成** - 変更内容を解析し、Conventional Commits 形式でコミットを行います。
*   `/design`: **設計書作成** - 要件定義書と技術スタックをもとに、基本設計書 (`docs/design.md`) を作成・更新します。
*   `/plan_implementation`: **実装計画立案** - 設計書をもとに、詳細な実装計画書 (`docs/implementation_plan.md`) を作成・更新します。
*   `/prepare`: **実装準備** - 現在の進捗を確認し、次に着手すべきタスクの分析とガイドを行います。
*   `/start`: **タスク開始** - タスクの実装を開始します（ブランチ作成、TDDサイクルの実行など）。
*   `/refactor`: **リファクタリング** - 既存のテストを維持しながら、コードの内部構造を改善します。
*   `/req`: **要求仕様書作成** - ISO/IEC/IEEE 29148:2018 形式で要求仕様書を作成します。
