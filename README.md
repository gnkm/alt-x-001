# Alt X

Agent OS の性能確認。

## セットアップ

### 必要なもの

- Docker & Docker Compose

### 起動

```bash
# コンテナをビルド＆起動
docker compose up -d

# ログ確認
docker compose logs -f
```

### 停止

```bash
docker compose down
```

## アクセス先

| サービス | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API ドキュメント | http://localhost:8000/docs |

## テストユーザーの作成

```bash
docker compose exec \
  -e SEED_USER_EMAIL=<mail-address> \
  -e SEED_USER_PASSWORD=<password> \
  backend uv run python -m app.utils.seed_data
```

## 開発

### ホットリロード

`src/` ディレクトリはボリュームマウントされているため、コードを変更すると自動的に反映されます。

### 依存関係の追加

```bash
# Backend (Python)
cd backend
uv add <package-name>

# Frontend (Node.js)
cd frontend
pnpm add <package-name>
```

依存関係を変更した後は、コンテナの再ビルドが必要です：

```bash
docker compose build
docker compose up -d
```

## テスト

```bash
# Backend
docker compose exec backend uv run pytest

# Frontend
docker compose exec frontend pnpm test:run
```
