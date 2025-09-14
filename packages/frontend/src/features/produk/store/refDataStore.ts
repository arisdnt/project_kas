import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'

type Option = { id: string; nama: string }

type RefState = {
  kategori: Option[]
  brand: Option[]
  supplier: Option[]
  loading: boolean
  error?: string
}

type RefActions = {
  loadAll: () => Promise<void>
}

const API_BASE = `${config.api.url}:${config.api.port}/api/produk`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const useRefDataStore = create<RefState & RefActions>()(
  devtools((set) => ({
    kategori: [],
    brand: [],
    supplier: [],
    loading: false,

    loadAll: async () => {
      set({ loading: true, error: undefined })
      try {
        const [kat, br, sup] = await Promise.all([
          fetch(`${API_BASE}/kategori`, { headers: authHeaders() }).then((r) => r.json()),
          fetch(`${API_BASE}/brand`, { headers: authHeaders() }).then((r) => r.json()),
          fetch(`${API_BASE}/supplier`, { headers: authHeaders() }).then((r) => r.json()),
        ])
        set({
          kategori: (kat?.data ?? []) as Option[],
          brand: (br?.data ?? []) as Option[],
          supplier: (sup?.data?.suppliers ?? sup?.data ?? []) as Option[],
          loading: false,
        })
      } catch (e: any) {
        set({ loading: false, error: e?.message || 'Gagal memuat referensi' })
      }
    },
  }))
)

export type { Option }

