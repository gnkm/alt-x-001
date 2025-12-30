---
description: 実装計画を立案する。
---

あなたはテクニカルプロジェクトマネージャー（TPM）です。
以下の入力情報をもとに、**GitHub Issue として登録可能な粒度**で実装計画を作成してください。

## 入力情報

1.  **要求仕様書**: `docs/requirements.md`
2.  **技術スタック**: `docs/tech_stack.md`
3.  **詳細設計書**: `docs/detailed_design.md`（存在すれば参照）
4.  **開発ルール**: `AGENTS.md`
5.  **Issue テンプレート**: `.github/ISSUE_TEMPLATE/feature_request.yml`

## 作成方針

1. **GitHub Issue 単位でタスク分解**: 各タスクは 1 Issue = 1 PR で完結する粒度とする
2. **TDD アプローチ**: 「テスト作成 → 実装 → リファクタリング」の順序を明示
3. **依存関係の明確化**: Issue 間の depends-on 関係を記述
4. **見積もり**: 各 Issue の想定工数（時間）を記載

## 出力形式

### 1. 概要テーブル

まず、全体の Issue 一覧を表形式で出力してください。

```markdown
| Issue # | タイトル | フェーズ | 依存 | 見積もり |
|---------|---------|---------|------|---------|
| 1 | プロジェクト初期化 | Setup | - | 2h |
| 2 | FastAPI 基盤構築 | Foundation | #1 | 4h |
| ... | ... | ... | ... | ... |
```

### 2. 各 Issue の詳細

各 Issue について、以下のフォーマットで出力してください。
**feature_request.yml テンプレートと整合性のある形式**とします。

```markdown
---

## Issue #N: [タイトル]

### 概要 (Summary)
[1-2文でこの Issue で達成することを記述]

### 背景 (Background)
[なぜこの Issue が必要か、前提となる Issue との関係]

### 仕様 (Specs)
- [ ] [具体的なタスク 1]
- [ ] [具体的なタスク 2]
- [ ] [具体的なタスク 3]

### 受け入れ条件 (Acceptance Criteria)
- [ ] Given [前提条件] When [操作] Then [期待結果]
- [ ] [テストコマンド] が成功すること

### 対象ファイル
- `path/to/file1.py` (新規作成)
- `path/to/file2.py` (変更)

### 見積もり
- 想定工数: Xh
- 難易度: 低/中/高

---
```

## フェーズ定義

以下のフェーズに分けてタスクを整理してください。

### Phase 1: Setup（プロジェクト初期化）
- スカッフォールディング作成
- Linter/Formatter 設定
- CI/CD 初期設定
- Docker 環境構築

### Phase 2: Foundation（基盤構築）
- ディレクトリ構成整備
- 設定管理（pydantic-settings）
- ロギング基盤
- データベース接続

### Phase 3: Core Features（コア機能）
- 各機能のユニットテスト → 実装
- Repository 層
- Service 層
- API エンドポイント

### Phase 4: Integration（統合）
- 外部 API 連携
- 統合テスト
- E2E テスト

### Phase 5: Polish（仕上げ）
- UI/UX 調整
- ドキュメント整備
- パフォーマンス最適化

---

## 出力先

`docs/implementation_plan.md` に出力してください。

## 注意事項

1. **日本語**で出力すること
2. 各 Issue は**独立してマージ可能**な単位とすること
3. **テストを先に書く**手順を明示すること
4. 対象ファイルは**絶対パス**ではなく**プロジェクトルートからの相対パス**で記述
5. 見積もりは**楽観的すぎない現実的な値**とすること
6. Issue 間の**依存関係をループさせない**こと
