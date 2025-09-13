import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useAuthStore } from '@/core/store/authStore'

export type UIPelanggan = {
  id: number
  nama?: string | null
  email?: string | null
  telepon?: string | null
}

type PelangganState = {
  items: UIPelanggan[]
  loading: boolean
  error?: string
}

type PelangganActions = {
  search: (q: string) => Promise<void>
}

const API_BASE = 'http://localhost:3000/api/pelanggan'

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const usePelangganStore = create<PelangganState & PelangganActions>()(
  devtools((set) => ({
    items: [],
    loading: false,

    search: async (q: string) => {
      set({ loading: true, error: undefined })
      try {
        const params = new URLSearchParams()
        if (q) params.set('search', q)
        params.set('limit', '10')
        const res = await fetch(`${API_BASE}?${params.toString()}`, { headers: authHeaders() })
        const js = await res.json()
        if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memuat pelanggan')
        set({ items: js.data || [], loading: false })
      } catch (e: any) {
        set({ loading: false, error: e?.message || 'Terjadi kesalahan' })
      }
    },
  }))
)

export type { PelangganActions }

