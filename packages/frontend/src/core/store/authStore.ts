import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { config } from '@/core/config'

type User = {
  // kompatibel: backend pakai UUID string, lama mungkin number
  id: string | number
  username: string
  email?: string
  // format backend (baru) - sesuai dengan AuthenticatedUser interface
  namaLengkap?: string
  telepon?: string
  avatarUrl?: string
  role?: string
  peranId?: string
  tokoId?: string // ID toko dari backend
  tenantId?: string // ID tenant dari backend
  level?: number
  isSuperAdmin?: boolean
  isGodUser?: boolean // Flag untuk god user
  godPermissions?: string[] // Permissions khusus god user
  // format lama (lokal) - untuk kompatibilitas
  fullName?: string
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
  isAuthenticated: boolean
  token: string | null
  user: User | null
  loading: boolean
  storeCacheVersion?: number
}

type AuthActions = {
  login: (username: string, password: string, tenantId?: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  ensureStoreContext: () => Promise<void>
  setStore: (tokoId: string) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      loading: false,
      storeCacheVersion: undefined,
      
      login: async (username: string, password: string, tenantId?: string) => {
        set({ loading: true })

        try {
          const payload: any = { username, password }
          if (tenantId) payload.tenantId = tenantId
          const response = await fetch(`${config.api.url}:${config.api.port}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          const data: LoginResponse = await response.json()
          
          if (!response.ok || !data.success) throw new Error(data.message || 'Login gagal')
          set({ user: data.data.user, token: data.data.accessToken, isAuthenticated: true, loading: false })
          if (!data.data.user.isGodUser) { get().ensureStoreContext().catch(() => {}) }
        } catch (e) {
          set({ loading: false })
          throw e
        }
      },
      
      logout: () => { set({ user: null, token: null, isAuthenticated: false, loading: false }) },
      
      setUser: (user: User) => { set({ user, isAuthenticated: true }) },
      
      setToken: (token: string) => { set({ token }) },
      // Pastikan user punya tokoId; kalau tidak, ambil daftar toko aktif dan set yang pertama.
      ensureStoreContext: async () => {
        const state = get(); const user = state.user; if (!user) return; if (user.isGodUser) return; if (user.tokoId) return;
        if ((get() as any)._busyStore) return; (get() as any)._busyStore = true
        try {
          const res = await fetch(`${config.api.url}:${config.api.port}/api/tokosaya`, { headers: { 'Authorization': state.token ? `Bearer ${state.token}` : '' } })
          if (!res.ok) return
          const data = await res.json(); const list = Array.isArray(data?.data) ? data.data : []
          ;(useAuthStore as any).lastStoreList = list; set({ storeCacheVersion: Date.now() })
          if (list.length === 1 && list[0]?.id) { set({ user: { ...user, tokoId: list[0].id } }); return }
          const active = list.find((t: any) => (t.status || '').toLowerCase() === 'active') || list[0]
          if (active?.id) set({ user: { ...user, tokoId: active.id } })
        } finally { (get() as any)._busyStore = false }
      },
      setStore: (tokoId: string) => { const { user } = get(); if (!user) return; set({ user: { ...user, tokoId } }) }
    }),
    { name: 'authStore' }
  )
)

// Helper hook: dapatkan daftar toko cached (akan rerender saat versi berubah)
export function useCachedStores(): any[] {
  useAuthStore(s => s.storeCacheVersion) // subscribe for rerender
  // @ts-ignore
  return (useAuthStore as any).lastStoreList || []
}
