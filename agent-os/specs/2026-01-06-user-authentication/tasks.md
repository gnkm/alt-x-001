# Task Breakdown: User Authentication

## Overview
Total Tasks: 4 Task Groups, 25 Sub-tasks

## Task List

### Database Layer

#### Task Group 1: User Model and Seed Data
**Dependencies:** None

- [ ] 1.0 Complete database layer
  - [ ] 1.1 Write 4 focused tests for User model functionality
    - Test: User作成時にパスワードがハッシュ化されること
    - Test: メールアドレスの一意性制約
    - Test: パスワード検証（正しいパスワード/誤ったパスワード）
    - Test: 必須フィールドのバリデーション
  - [ ] 1.2 Create User model with SQLAlchemy
    - Fields: id (UUID), email (String, unique), hashed_password (String), created_at (DateTime), updated_at (DateTime)
    - Validations: email format, password length (8+), alphanumeric requirement
    - Method: verify_password() for bcrypt comparison
  - [ ] 1.3 Create Alembic migration for users table
    - Add unique index for: email
    - Add created_at, updated_at with default timestamps
  - [ ] 1.4 Create seed data script for initial user
    - Email: 環境変数 `SEED_USER_EMAIL` から取得
    - Password: 環境変数 `SEED_USER_PASSWORD` から取得（bcryptでハッシュ化）
  - [ ] 1.5 Ensure database layer tests pass
    - Run ONLY the 4 tests written in 1.1
    - Verify migration runs successfully
    - Verify seed data creates user correctly

**Acceptance Criteria:**
- The 4 tests written in 1.1 pass
- User model correctly hashes and verifies passwords
- Migration creates users table with proper indexes
- Seed data creates initial user on first run

---

### API Layer

#### Task Group 2: Authentication API Endpoints
**Dependencies:** Task Group 1

- [ ] 2.0 Complete API layer
  - [ ] 2.1 Write 6 focused tests for API endpoints
    - Test: POST /api/auth/login - 正常ログイン（トークン返却）
    - Test: POST /api/auth/login - 認証失敗（401返却）
    - Test: POST /api/auth/refresh - 正常トークン更新
    - Test: POST /api/auth/refresh - 無効トークン（401返却）
    - Test: GET /api/auth/me - 認証済みユーザー情報取得
    - Test: GET /api/auth/me - 未認証（401返却）
  - [ ] 2.2 Create Pydantic schemas for auth
    - LoginRequest: email, password
    - TokenResponse: access_token, refresh_token, token_type
    - UserResponse: id, email
    - ErrorResponse: detail
  - [ ] 2.3 Implement JWT utility functions
    - create_access_token(): 30分有効期限
    - create_refresh_token(): 7日間有効期限
    - decode_token(): トークン検証・デコード
    - Use python-jose with HS256 algorithm
  - [ ] 2.4 Create auth router with endpoints
    - POST /api/auth/login: メール・パスワード認証、トークン発行
    - POST /api/auth/refresh: リフレッシュトークンで新アクセストークン発行
    - POST /api/auth/logout: クライアント側削除の案内（204 No Content）
    - GET /api/auth/me: 現在のユーザー情報返却
  - [ ] 2.5 Implement authentication dependency
    - get_current_user(): Bearer トークンからユーザー取得
    - FastAPI Depends で認証必須エンドポイントに適用
    - 認証失敗時は HTTPException(401) を raise
  - [ ] 2.6 Ensure API layer tests pass
    - Run ONLY the 6 tests written in 2.1
    - Verify all endpoints return correct status codes
    - Verify token generation and validation works

**Acceptance Criteria:**
- The 6 tests written in 2.1 pass
- Login returns valid JWT tokens on success
- Refresh endpoint issues new access token
- Protected endpoints return 401 without valid token
- /me endpoint returns user info with valid token

---

### Frontend Components

#### Task Group 3: Authentication UI and State Management
**Dependencies:** Task Group 2

- [ ] 3.0 Complete frontend authentication
  - [ ] 3.1 Write 5 focused tests for UI components
    - Test: ログインフォームの表示（email, password入力、ボタン）
    - Test: ログインフォーム送信でAPI呼び出し
    - Test: ログイン成功時にリダイレクト
    - Test: ログインエラー時にエラーメッセージ表示
    - Test: 未認証時のルートガードリダイレクト
  - [ ] 3.2 Create Zustand auth store
    - State: isAuthenticated, user, isLoading
    - Actions: login(), logout(), refreshToken(), checkAuth()
    - Persist: localStorage にトークン保存
  - [ ] 3.3 Create Axios instance with interceptors
    - Request interceptor: Authorization ヘッダーにアクセストークン付与
    - Response interceptor: 401エラー時にリフレッシュ試行
    - リフレッシュ失敗時: ログアウト処理・ログイン画面リダイレクト
  - [ ] 3.4 Build Login page component
    - Email input field with validation
    - Password input field with validation (8文字以上、英数字)
    - Submit button with loading state
    - Error message display area
    - Tailwind CSS でスタイリング
  - [ ] 3.5 Implement Route Guard component
    - ProtectedRoute: 未認証時は /login にリダイレクト
    - PublicRoute: 認証済み時は / にリダイレクト（ログインページ用）
  - [ ] 3.6 Set up React Router with auth routes
    - /login: ログインページ（PublicRoute）
    - /: メインページ（ProtectedRoute）- プレースホルダー
  - [ ] 3.7 Ensure frontend tests pass
    - Run ONLY the 5 tests written in 3.1
    - Verify login flow works end-to-end
    - Verify route guards redirect correctly

**Acceptance Criteria:**
- The 5 tests written in 3.1 pass
- Login form validates and submits correctly
- Auth state persists across page refresh
- Protected routes redirect to login when unauthenticated
- Login page redirects to main when authenticated

---

### Integration & Testing

#### Task Group 4: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-3

- [ ] 4.0 Review existing tests and fill critical gaps only
  - [ ] 4.1 Review tests from Task Groups 1-3
    - Review the 4 tests written by Task Group 1 (Database)
    - Review the 6 tests written by Task Group 2 (API)
    - Review the 5 tests written by Task Group 3 (Frontend)
    - Total existing tests: 15 tests
  - [ ] 4.2 Analyze test coverage gaps for authentication feature
    - Identify critical auth workflows that lack test coverage
    - Focus on integration between frontend and backend
    - Prioritize end-to-end login flow
  - [ ] 4.3 Write up to 5 additional strategic tests if needed
    - E2E: 完全なログインフロー（フォーム入力→API→リダイレクト）
    - E2E: トークン期限切れ時の自動リフレッシュ
    - E2E: ログアウト後の保護ルートアクセス拒否
    - Integration: パスワードバリデーションエラー表示
    - Integration: 無効な認証情報でのエラーハンドリング
  - [ ] 4.4 Run feature-specific tests only
    - Run all authentication-related tests (15-20 tests total)
    - Verify critical auth workflows pass
    - Document any known limitations

**Acceptance Criteria:**
- All feature-specific tests pass (15-20 tests total)
- Critical authentication workflows are covered
- No more than 5 additional tests added
- Login → Protected Page flow works correctly

---

## Execution Order

Recommended implementation sequence:

1. **Database Layer (Task Group 1)** - User model, migration, seed data
2. **API Layer (Task Group 2)** - Auth endpoints, JWT utilities
3. **Frontend Components (Task Group 3)** - Login UI, state management, routing
4. **Test Review (Task Group 4)** - Integration tests, gap analysis

## Notes

- プロジェクトの初期セットアップ（Docker Compose、ディレクトリ構造）は本タスクリストの前提条件として別途実施
- tech-stack.md に定義された技術スタックに厳密に従う
- TDD アプローチ: 各タスクグループはテスト作成から開始
