# Tech Stack

Alt X の技術スタック定義書です。ローカル環境で動作するシンプルな構成を採用しています。

## Overview

```
┌─────────────────────────────────────────────────────┐
│                  Docker Compose                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Frontend   │  │   Backend   │  │  PostgreSQL │  │
│  │  (React)    │──│  (FastAPI)  │──│     (DB)    │  │
│  │  Port:3000  │  │  Port:8000  │  │  Port:5432  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Backend

| カテゴリ | 技術 | バージョン | 備考 |
|---------|------|-----------|------|
| 言語 | Python | 3.12+ | 最新の安定版 |
| フレームワーク | FastAPI | 0.115+ | 軽量・高速な非同期Webフレームワーク |
| ORM | SQLAlchemy | 2.0+ | Python標準のORM |
| マイグレーション | Alembic | 1.14+ | SQLAlchemy用マイグレーションツール |
| パッケージ管理 | uv | latest | 高速なPythonパッケージマネージャー（⚠️ `uv pip` は禁止） |
| バリデーション | Pydantic | 2.0+ | FastAPIと統合されたデータバリデーション |
| ASGI Server | Uvicorn | 0.34+ | 高性能ASGIサーバー |

### 認証

| カテゴリ | 技術 | 備考 |
|---------|------|------|
| 認証方式 | JWT (JSON Web Token) | ステートレス認証 |
| パスワードハッシュ | bcrypt (passlib) | セキュアなパスワード保存 |
| ライブラリ | python-jose | JWT生成・検証 |

## Frontend

| カテゴリ | 技術 | バージョン | 備考 |
|---------|------|-----------|------|
| 言語 | TypeScript | 5.0+ | 型安全なJavaScript |
| UIライブラリ | React | 18+ | 最も普及しているUIライブラリ |
| ビルドツール | Vite | 6.0+ | 高速な開発サーバー・ビルドツール |
| パッケージ管理 | pnpm | 9.0+ | 高速・効率的なパッケージマネージャー |
| HTTPクライアント | Axios | 1.7+ | API通信（インターセプターでJWTトークン自動付与） |
| 状態管理 | Zustand | 5.0+ | 軽量でシンプルなグローバル状態管理 |
| スタイリング | Tailwind CSS | 3.0+ | ユーティリティファーストCSS |

## Database

| カテゴリ | 技術 | バージョン | 備考 |
|---------|------|-----------|------|
| RDBMS | PostgreSQL | 16+ | 信頼性の高いオープンソースDB |

## Infrastructure

| カテゴリ | 技術 | 備考 |
|---------|------|------|
| コンテナ | Docker | コンテナ化 |
| オーケストレーション | Docker Compose | ローカル開発環境の構築 |
| ファイルストレージ | ローカルファイルシステム | `/uploads` ディレクトリに画像保存 |

## Development Tools

| カテゴリ | 技術 | 備考 |
|---------|------|------|
| Linter (Python) | Ruff | 高速なPython Linter/Formatter |
| Linter (TypeScript) | ESLint | TypeScript/JavaScript Linter |
| Formatter (TypeScript) | Prettier | コードフォーマッター |
| テスト (Python) | pytest | Pythonテストフレームワーク |
| テスト (Frontend) | Vitest | Vite用テストフレームワーク |
| Git Hooks | Lefthook | Git hooks管理（既存設定を継続） |

## Project Structure

```
alt-x-001/
├── docker-compose.yml          # Docker Compose設定
├── .env.example                 # 環境変数テンプレート
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml          # Python依存関係（uv）
│   └── src/
│       └── app/
│           ├── main.py         # FastAPIエントリーポイント
│           ├── config.py       # 設定
│           ├── models/         # SQLAlchemyモデル
│           ├── schemas/        # Pydanticスキーマ
│           ├── routers/        # APIルーター
│           ├── services/       # ビジネスロジック
│           └── utils/          # ユーティリティ
├── frontend/
│   ├── Dockerfile
│   ├── package.json            # 依存関係定義
│   ├── pnpm-lock.yaml          # pnpm lockfile
│   └── src/
│       ├── main.tsx            # エントリーポイント
│       ├── App.tsx             # ルートコンポーネント
│       ├── components/         # UIコンポーネント
│       ├── pages/              # ページコンポーネント
│       ├── hooks/              # カスタムフック
│       ├── services/           # API通信
│       └── types/              # 型定義
├── uploads/                    # 画像ファイル保存先（Docker volume）
└── docs/
    └── requirements_org.md
```

## Environment Variables

```bash
# Database
POSTGRES_USER=altx
POSTGRES_PASSWORD=altx_password
POSTGRES_DB=altx_db
DATABASE_URL=postgresql://altx:altx_password@db:5432/altx_db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Frontend
VITE_API_URL=http://localhost:8000
```

## Design Principles

1. **シンプルさ優先** - 必要最小限の技術で構成し、複雑さを排除
2. **ローカル完結** - 外部サービスに依存せず、Docker Composeで完結
3. **開発体験重視** - ホットリロード対応で素早いフィードバック
4. **TDD準拠** - テストファーストで品質を担保

## ⚠️ 禁止事項・制約

### Backend (Python/uv)

- **`uv pip` コマンドの使用禁止**
  - 依存関係の管理には必ず `uv add` / `uv remove` / `uv sync` を使用すること
  - `uv pip install` や `uv pip freeze` は使用しない
  - 理由: プロジェクトの `pyproject.toml` と `uv.lock` による一貫した依存管理を維持するため

```bash
# ✅ 正しい使い方
uv add fastapi
uv add --dev pytest
uv sync
uv run pytest

# ❌ 禁止
uv pip install fastapi
uv pip freeze > requirements.txt
```

### Frontend (TypeScript/pnpm)

- **npm / yarn の使用禁止**
  - パッケージ管理には必ず `pnpm` を使用すること
  - `package-lock.json` や `yarn.lock` は生成しない

```bash
# ✅ 正しい使い方
pnpm install
pnpm add react
pnpm dev

# ❌ 禁止
npm install
yarn add react
```
