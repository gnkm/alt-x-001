import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage'
import { ProtectedRoute } from '../components/ProtectedRoute'
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

describe('Authentication UI Components', () => {
  beforeEach(() => {
    // Reset auth store before each test
    useAuthStore.getState().logout()
    vi.clearAllMocks()
    // Re-setup the logout mock to return a resolved promise
    vi.mocked(authApi.logout).mockResolvedValue(undefined)
  })

  it('Test 1: ログインフォームの表示（email, password入力、ボタン）', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    // Check that email input exists
    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')

    // Check that password input exists
    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Check that submit button exists
    const submitButton = screen.getByRole('button', { name: /login|ログイン/i })
    expect(submitButton).toBeInTheDocument()
  })

  it('Test 2: ログインフォーム送信でAPI呼び出し', async () => {
    const user = userEvent.setup()
    const mockLogin = vi.mocked(authApi.login)
    const mockGetCurrentUser = vi.mocked(authApi.getCurrentUser)

    mockLogin.mockResolvedValue({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      token_type: 'bearer',
    })

    mockGetCurrentUser.mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
    })

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    // Fill in the form
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login|ログイン/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Verify API was called with correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('Test 3: ログイン成功時にリダイレクト', async () => {
    const user = userEvent.setup()
    const mockLogin = vi.mocked(authApi.login)
    const mockGetCurrentUser = vi.mocked(authApi.getCurrentUser)

    mockLogin.mockResolvedValue({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      token_type: 'bearer',
    })

    mockGetCurrentUser.mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    )

    // Fill in and submit the form
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login|ログイン/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Verify that login was successful and store was updated
    await waitFor(() => {
      const authState = useAuthStore.getState()
      expect(authState.isAuthenticated).toBe(true)
      expect(authState.user).toEqual({
        id: 'test-user-id',
        email: 'test@example.com',
      })
    })
  })

  it('Test 4: ログインエラー時にエラーメッセージ表示', async () => {
    const user = userEvent.setup()
    const mockLogin = vi.mocked(authApi.login)
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

    // Fill in and submit the form with invalid credentials
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login|ログイン/i })

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpass123')
    await user.click(submitButton)

    // Verify error message is displayed
    await waitFor(() => {
      const errorMessage = screen.getByText(/incorrect email or password|メールアドレスまたはパスワードが正しくありません/i)
      expect(errorMessage).toBeInTheDocument()
    })
  })

  it('Test 5: 未認証時のルートガードリダイレクト', () => {
    // Mock getCurrentUser to reject (not authenticated)
    const mockGetCurrentUser = vi.mocked(authApi.getCurrentUser)
    mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'))

    // Create a test component wrapped in ProtectedRoute
    const TestComponent = () => <div>Protected Content</div>

    render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )

    // Since user is not authenticated, should not see protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
