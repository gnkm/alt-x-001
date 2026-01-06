import { apiClient } from './axios'
import type { User, TokenResponse } from '../types/auth'

export interface LoginResponse extends TokenResponse {}

export interface RefreshTokenResponse {
  access_token: string
  token_type: string
}

/**
 * Login with email and password
 */
export const login = async (
  email: string,
  password: string
): Promise<TokenResponse> => {
  const response = await apiClient.post<TokenResponse>('/auth/login', {
    email,
    password,
  })
  return response.data
}

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (
  refreshToken: string
): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  })
  return response.data
}

/**
 * Logout - inform server (currently just client-side)
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout')
}

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me')
  return response.data
}
