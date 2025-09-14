import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { config } from '@/core/config'

type User = {
  // kompatibel: backend pakai UUID string, lama mungkin number
  id: string | number
  username: string
  email?: string
  // format backend (baru)
  fullName?: string
  role?: string
  tokoId?: string // ID toko dari backend
  tenantId?: string // ID tenant dari backend
  // format lama (lokal)
  nama?: string
  peran?: string
}

type LoginResponse = {
  success: boolean
  message: string
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  refreshToken: string | null
  isLoading: boolean
}

type AuthActions = {
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      isLoading: false,
      
      login: async (username: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch(`${config.api.url}:${config.api.port}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          })
          
          const data: LoginResponse = await response.json()
          
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Login gagal')
          }
          
          set({
            user: data.data.user,
            token: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        })
      },
      
      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true
        })
      },
      
      setToken: (token: string) => {
        set({ token })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
