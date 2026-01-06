import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../lib/api'
import type { User } from '../types/auth'

interface AuthState {
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      accessToken: null,
      refreshToken: null,

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken })
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login(email, password)

          set({
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          })

          // Fetch user info after login
          await get().checkAuth()
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
        })
        // Call logout API to inform server
        authApi.logout().catch(() => {
          // Ignore errors on logout
        })
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        try {
          const response = await authApi.refreshToken(refreshToken)
          set({
            accessToken: response.access_token,
          })
        } catch (error) {
          // If refresh fails, logout the user
          get().logout()
          throw error
        }
      },

      checkAuth: async () => {
        const { accessToken } = get()
        if (!accessToken) {
          set({ isAuthenticated: false, user: null })
          return
        }

        set({ isLoading: true })
        try {
          const user = await authApi.getCurrentUser()
          set({
            isAuthenticated: true,
            user,
            isLoading: false,
          })
        } catch (error) {
          // If check fails, try to refresh token
          try {
            await get().refreshAccessToken()
            const user = await authApi.getCurrentUser()
            set({
              isAuthenticated: true,
              user,
              isLoading: false,
            })
          } catch (refreshError) {
            // If refresh also fails, logout
            set({
              isAuthenticated: false,
              user: null,
              accessToken: null,
              refreshToken: null,
              isLoading: false,
            })
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
