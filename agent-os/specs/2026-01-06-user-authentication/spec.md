# Specification: User Authentication

## Goal

JWT認証を用いたログイン・ログアウト機能を実装し、認証済みユーザーのみがアプリケーションにアクセスできる状態にする。ユーザーは1人固定で、シードデータとして作成する。

## User Stories

- As a user, I want to log in with my email and password so that I can access my personal posts securely.
- As a user, I want to stay logged in across browser sessions so that I don't have to log in every time I visit.
- As a user, I want to log out so that I can secure my session when I'm done.

## Specific Requirements

**User Model & Seed Data**
- User テーブル: id, email, hashed_password, created_at, updated_at
- 初期ユーザーはDBマイグレーション時にシードデータとして作成
- パスワードは bcrypt でハッシュ化して保存
- メールアドレスは一意制約を設定

**Login API Endpoint**
- `POST /api/auth/login` でメールアドレス・パスワードを受け取る
- 認証成功時: アクセストークン（30分）とリフレッシュトークン（7日間）を返却
- 認証失敗時: 401 Unauthorized を返却（詳細なエラー理由は漏洩防止のため曖昧に）
- パスワードバリデーション: 8文字以上、英数字混合

**Token Refresh API Endpoint**
- `POST /api/auth/refresh` でリフレッシュトークンを受け取る
- 有効なリフレッシュトークンの場合: 新しいアクセストークンを発行
- 無効または期限切れの場合: 401 Unauthorized を返却

**Logout API Endpoint**
- `POST /api/auth/logout` でログアウト処理
- クライアント側でトークンを削除する形式（サーバー側でのトークン無効化は今回スコープ外）

**Current User API Endpoint**
- `GET /api/auth/me` で現在ログイン中のユーザー情報を取得
- Authorization ヘッダーの Bearer トークンを検証
- 有効なトークンの場合: ユーザー情報（id, email）を返却

**Backend Authentication Guard**
- FastAPI の Depends を使用して認証が必要なエンドポイントを保護
- JWT トークンの署名検証と有効期限チェック
- 認証失敗時は 401 Unauthorized を返却

**Frontend Login Page**
- メールアドレスとパスワードの入力フォーム
- ログインボタン押下で API を呼び出し
- エラー時はエラーメッセージを表示
- 成功時はメインページにリダイレクト

**Frontend Auth State Management**
- Zustand で認証状態（isAuthenticated, user）を管理
- トークンは localStorage に保存
- アプリ起動時にトークンの有効性を確認

**Frontend Axios Interceptor**
- リクエスト時: Authorization ヘッダーにアクセストークンを自動付与
- レスポンス時: 401 エラーの場合はリフレッシュトークンで更新を試行
- リフレッシュも失敗した場合はログイン画面にリダイレクト

**Frontend Route Guard**
- 未認証ユーザーが保護されたルートにアクセスした場合、ログイン画面にリダイレクト
- ログイン済みユーザーがログイン画面にアクセスした場合、メインページにリダイレクト

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**ゼロベース構築**
- 既存コードなし。tech-stack.md で定義された技術スタックに従って新規実装
- Backend: FastAPI + SQLAlchemy + python-jose + passlib
- Frontend: React + Vite + TypeScript + Zustand + Axios + Tailwind CSS

## Out of Scope

- ユーザー登録機能（UI/API）- 初期ユーザーはシードデータで作成
- パスワードリセット機能
- メール認証（アカウント確認メール）
- ソーシャルログイン（Google, GitHub等）
- 二要素認証（2FA）
- サーバー側でのトークン無効化（ブラックリスト管理）
- 複数ユーザー対応
- Remember Me 機能（チェックボックスによる有効期限延長）
- ログイン試行回数制限・アカウントロック
