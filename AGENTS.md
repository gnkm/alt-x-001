# AGENTS.md

このファイルは、本プロジェクト「」を担当する AI エージェントのためのコンテキスト定義書です。

## プロジェクト概要

*   **名称**:
*   **目的**: 
*   **ドキュメント**:
    *   [要件定義書](docs/requirements.md) - 機能・非機能要件の全容。
    *   [技術スタック](docs/tech_stack.md) - 使用技術やその選定理由。

## 開発ルール (Development Rules)

### 1. Test-Driven Development (TDD) の徹底

**コードを書く前に、必ずテストを書いてください。**
機能追加・バグ修正を問わず、以下のサイクルを厳守します。

1.  **Red**: 失敗するテストを書く。
2.  **Green**: テストを通すための最小限の実装を行う。
3.  **Refactor**: コードを整理・最適化する。

### 2. 開発フロー & Git 運用

`CONTRIBUTING.md` の内容に準拠します。特に以下を意識してください。

*   **ブランチ戦略**: `feature/`, `fix/`, `docs/`, `refactor/` などのプレフィックスを使用。
*   **コミットメッセージ**: [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) に従う（例: `feat: add vim mode navigation`）。
*   **Lefthook**: コミット時に自動チェックが走るため、Lint エラー等は事前に解消すること。

### 3. 技術的制約・方針
