export interface User {
  id: string
  email: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  accessToken: string | null
  refreshToken: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<void>
  checkAuth: () => Promise<void>
  setTokens: (accessToken: string, refreshToken: string) => void
}
