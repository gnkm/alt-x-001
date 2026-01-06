import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { PublicRoute } from '../components/PublicRoute'
import { useAuthStore } from '../store/authStore'

// Mock the auth API
vi.mock('../lib/api', () => ({
  login: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  refreshToken: vi.fn(),
  getCurrentUser: vi.fn(),
}))

// Import the mocked module after defining the mock
import * as authApi from '../lib/api'

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    // Reset auth store before each test
    useAuthStore.getState().logout()
    vi.clearAllMocks()
    // Re-setup the logout mock to return a resolved promise
    vi.mocked(authApi.logout).mockResolvedValue(undefined)
  })

  it('E2E Test 1: 完全なログインフロー（フォーム入力→API→リダイレクト）', async () => {
    const user = userEvent.setup()
    const mockLogin = vi.mocked(authApi.login)
    const mockGetCurrentUser = vi.mocked(authApi.getCurrentUser)

    // Mock successful login
    mockLogin.mockResolvedValue({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      token_type: 'bearer',
    })

    // Mock successful user fetch
    mockGetCurrentUser.mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
    })

    // Create a protected component to test redirect
    const ProtectedContent = () => <div>Protected Content</div>

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    // Verify we're on the login page
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()

    // Fill in the form
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login|ログイン/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Wait for API calls and redirect
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled()
    })

    // Verify auth store was updated
    await waitFor(() => {
      const authState = useAuthStore.getState()
      expect(authState.isAuthenticated).toBe(true)
      expect(authState.user).toEqual({
        id: 'test-user-id',
        email: 'test@example.com',
      })
      expect(authState.accessToken).toBe('test-access-token')
      expect(authState.refreshToken).toBe('test-refresh-token')
    })
  })

  it('E2E Test 2: トークン期限切れ時の自動リフレッシュ', async () => {
    const mockRefreshToken = vi.mocked(authApi.refreshToken)
    const mockGetCurrentUser = vi.mocked(authApi.getCurrentUser)

    // Set initial auth state with tokens
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: 'expired-token',
      refreshToken: 'valid-refresh-token',
      user: { id: 'user-1', email: 'test@example.com' },
    })

    // Mock getCurrentUser to fail first (401), then succeed after refresh
    let callCount = 0
    mockGetCurrentUser.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // First call fails with 401
        return Promise.reject({
          response: { status: 401 },
        })
      } else {
        // Second call succeeds after refresh
        return Promise.resolve({
          id: 'user-1',
          email: 'test@example.com',
        })
      }
    })

    // Mock refresh token to return new access token
    mockRefreshToken.mockResolvedValue({
      access_token: 'new-access-token',
      token_type: 'bearer',
    })

    // Trigger checkAuth which should detect expired token and refresh
    await useAuthStore.getState().checkAuth()

    // Verify refresh was called
    await waitFor(() => {
      expect(mockRefreshToken).toHaveBeenCalledWith('valid-refresh-token')
    })

    // Verify new token was stored
    await waitFor(() => {
      const authState = useAuthStore.getState()
      expect(authState.accessToken).toBe('new-access-token')
      expect(authState.isAuthenticated).toBe(true)
    })
  })

  it('E2E Test 3: ログアウト後の保護ルートアクセス拒否', async () => {
    const user = userEvent.setup()
    const mockGetCurrentUser = vi.mocked(authApi.getCurrentUser)

    // Set initial authenticated state
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: 'valid-token',
      refreshToken: 'valid-refresh-token',
      user: { id: 'user-1', email: 'test@example.com' },
    })

    // Mock getCurrentUser to succeed initially
    mockGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    })

    const ProtectedContent = () => {
      const logout = useAuthStore((state) => state.logout)
      return (
        <div>
          <div>Protected Content</div>
          <button onClick={logout}>Logout</button>
        </div>
      )
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    // Wait for protected content to render
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    // Click logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)

    // Verify auth state was cleared
    await waitFor(() => {
      const authState = useAuthStore.getState()
      expect(authState.isAuthenticated).toBe(false)
      expect(authState.user).toBeNull()
      expect(authState.accessToken).toBeNull()
      expect(authState.refreshToken).toBeNull()
    })

    // Verify protected content is no longer accessible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('Integration Test 4: パスワードバリデーションエラー表示', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login|ログイン/i })

    // Test 1: Password too short (less than 8 characters)
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Pass1')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/パスワードは8文字以上である必要があります/)
      ).toBeInTheDocument()
    })

    // Clear inputs
    await user.clear(emailInput)
    await user.clear(passwordInput)

    // Test 2: Password without numbers
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'PasswordOnly')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/パスワードは英字と数字を含む必要があります/)
      ).toBeInTheDocument()
    })

    // Clear inputs
    await user.clear(emailInput)
    await user.clear(passwordInput)

    // Test 3: Password without letters
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '12345678')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/パスワードは英字と数字を含む必要があります/)
      ).toBeInTheDocument()
    })
  })

  it('Integration Test 5: 無効な認証情報でのエラーハンドリング', async () => {
    const user = userEvent.setup()
    const mockLogin = vi.mocked(authApi.login)

    // Mock login failure with different error types
    mockLogin.mockRejectedValue({
      response: {
        status: 401,
        data: { detail: 'Incorrect email or password' },
      },
    })

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login|ログイン/i })

    // Test invalid credentials error
    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'WrongPass123')
    await user.click(submitButton)

    // Verify error message is displayed
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('wrong@example.com', 'WrongPass123')
    })

    await waitFor(() => {
      expect(
        screen.getByText(/incorrect email or password|メールアドレスまたはパスワードが正しくありません/i)
      ).toBeInTheDocument()
    })

    // Verify auth state was NOT updated
    const authState = useAuthStore.getState()
    expect(authState.isAuthenticated).toBe(false)
    expect(authState.user).toBeNull()
    expect(authState.accessToken).toBeNull()

    // Clear and test network error
    await user.clear(emailInput)
    await user.clear(passwordInput)

    mockLogin.mockRejectedValue({
      message: 'Network Error',
    })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'TestPass123')
    await user.click(submitButton)

    // Verify generic error message for network errors
    await waitFor(() => {
      expect(
        screen.getByText(/ログインに失敗しました/)
      ).toBeInTheDocument()
    })
  })
})
