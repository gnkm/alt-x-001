# Spec Requirements: User Authentication

## Initial Description

ユーザー認証（ログイン） — ユーザー登録・ログイン・ログアウト機能を実装。JWT認証により、認証済みユーザーのみがアプリにアクセスできる状態にする。

## Requirements Discussion

### First Round Questions

**Q1:** ユーザー数について - 仕様書に「一人で使用する」とありますが、ユーザーは1人だけで固定でしょうか？それとも将来的に複数ユーザーに対応する可能性も考慮すべきですか？
**Answer:** ユーザー数は1人。登録機能を省略して初期ユーザーをシードデータとして作成する方法でよい。

**Q2:** ログイン方法 - メールアドレス + パスワードでのログインを想定していますが、それでよろしいですか？
**Answer:** メールアドレス + パスワードでよい。

**Q3:** パスワード要件 - パスワードの最低文字数や複雑さの要件はありますか？
**Answer:** 8文字以上、英数字混合。

**Q4:** セッション有効期限 - JWT トークンの有効期限はどのくらいを想定していますか？
**Answer:** 一般的な長さでお願いします。（→ アクセストークン30分、リフレッシュトークン7日間を採用）

**Q5:** 未認証時の動作 - 未ログイン状態でアプリにアクセスした場合、ログイン画面にリダイレクトする形でよろしいですか？
**Answer:** 未ログイン状態でアプリにアクセスした場合、ログイン画面にリダイレクトする形でお願いします。

**Q6:** スコープ外の確認 - パスワードリセット、メール認証、ソーシャルログイン、二要素認証は今回のスコープ外でよろしいですか？
**Answer:** ご認識のとおり（スコープ外）。

### Existing Code to Reference

No similar existing features identified for reference.（ゼロベースで構築）

### Follow-up Questions

フォローアップ質問なし。回答が明確であったため。

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Requirements Summary

### Functional Requirements

#### ユーザー管理
- 初期ユーザーはシードデータとして作成（登録機能は不要）
- ユーザー情報: メールアドレス、パスワード（ハッシュ化）

#### ログイン機能
- メールアドレス + パスワードでの認証
- パスワード要件: 8文字以上、英数字混合
- 認証成功時: JWTアクセストークン + リフレッシュトークンを発行
- 認証失敗時: エラーメッセージを表示

#### セッション管理
- アクセストークン有効期限: 30分
- リフレッシュトークン有効期限: 7日間
- トークン更新: リフレッシュトークンを使用してアクセストークンを更新

#### ログアウト機能
- ログアウト時: クライアント側のトークンを削除
- ログアウト後: ログイン画面にリダイレクト

#### 認証ガード
- 未認証ユーザーがアプリにアクセスした場合: ログイン画面にリダイレクト
- 認証済みユーザー: アプリの機能にアクセス可能

### Reusability Opportunities

- ゼロベースで構築のため、参照すべき既存コードなし
- tech-stack.md で定義された技術スタックに従って実装:
  - Backend: FastAPI + python-jose (JWT) + passlib (bcrypt)
  - Frontend: React + Zustand (認証状態管理) + Axios (インターセプター)

### Scope Boundaries

**In Scope:**
- ログイン画面 (Frontend)
- ログイン API エンドポイント (Backend)
- ログアウト機能
- JWT トークン発行・検証
- リフレッシュトークンによるトークン更新
- 認証ガード（未認証時のリダイレクト）
- シードデータによる初期ユーザー作成
- パスワードのバリデーション（8文字以上、英数字混合）

**Out of Scope:**
- ユーザー登録機能（UI/API）
- パスワードリセット機能
- メール認証（アカウント確認）
- ソーシャルログイン（Google, GitHub等）
- 二要素認証
- 複数ユーザー対応

### Technical Considerations

#### Backend (FastAPI)
- JWT生成・検証: python-jose
- パスワードハッシュ: passlib + bcrypt
- 認証エンドポイント:
  - `POST /api/auth/login` - ログイン
  - `POST /api/auth/logout` - ログアウト
  - `POST /api/auth/refresh` - トークン更新
  - `GET /api/auth/me` - 現在のユーザー情報取得

#### Frontend (React)
- 状態管理: Zustand で認証状態を管理
- HTTPクライアント: Axios インターセプターでトークン自動付与
- ルーティング: 認証ガードで未認証時リダイレクト
- トークン保存: localStorage または httpOnly cookie

#### Database
- User テーブル: id, email, hashed_password, created_at, updated_at
- シードデータ: 初期ユーザーをマイグレーション時に作成

