import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Toko, TokoFormData, TokoConfig, TokoOperatingHours, TokoStats } from '../types/toko'
import { TokoApiService } from '../services/tokoApiService'
import { useAuthStore } from '@/core/store/authStore'

type TokoState = {
  // Current user's store info
  currentStore: Toko | null
  currentStoreConfigs: TokoConfig[]
  currentStoreOperatingHours: TokoOperatingHours[]
  currentStoreStats: TokoStats | null

  // All stores (for admin/multi-store management)
  allStores: Toko[]

  // UI states
  loading: boolean
  saving: boolean
  error?: string
}

type TokoActions = {
  // Current store management
  loadCurrentStore: () => Promise<void>
  updateCurrentStore: (data: Partial<TokoFormData>) => Promise<void>
  loadCurrentStoreConfigs: () => Promise<void>
  updateStoreConfig: (key: string, value: string, deskripsi?: string) => Promise<void>
  loadOperatingHours: () => Promise<void>
  updateOperatingHours: (hours: TokoOperatingHours[]) => Promise<void>
  loadStoreStats: () => Promise<void>

  // Multi-store management (for admin)
  loadAllStores: () => Promise<void>
  createStore: (data: TokoFormData) => Promise<void>

  // Utility
  clearError: () => void
}

// Mock data for fallback
const mockStore: Toko = {
  id: 'store-001',
  tenant_id: 'tenant-001',
  nama: 'Toko Demo',
  kode: 'DEMO001',
  alamat: 'Jl. Demo No. 123, Jakarta',
  telepon: '021-12345678',
  email: 'demo@toko.com',
  status: 'aktif',
  timezone: 'Asia/Jakarta',
  mata_uang: 'IDR',
  dibuat_pada: new Date().toISOString(),
  diperbarui_pada: new Date().toISOString()
}

const mockConfigs: TokoConfig[] = [
  {
    id: 'config-001',
    toko_id: 'store-001',
    key: 'pajak_default',
    value: '11',
    tipe: 'number',
    deskripsi: 'Persentase pajak default untuk transaksi',
    is_public: true,
    dibuat_pada: new Date().toISOString(),
    diperbarui_pada: new Date().toISOString()
  },
  {
    id: 'config-002',
    toko_id: 'store-001',
    key: 'format_struk',
    value: 'thermal_80mm',
    tipe: 'string',
    deskripsi: 'Format struk thermal',
    is_public: false,
    dibuat_pada: new Date().toISOString(),
    diperbarui_pada: new Date().toISOString()
  }
]

const mockOperatingHours: TokoOperatingHours[] = [
  {
    id: 'hours-001',
    toko_id: 'store-001',
    hari: 'senin',
    jam_buka: '08:00',
    jam_tutup: '21:00',
    is_buka: true,
    dibuat_pada: new Date().toISOString(),
    diperbarui_pada: new Date().toISOString()
  },
  {
    id: 'hours-002',
    toko_id: 'store-001',
    hari: 'selasa',
    jam_buka: '08:00',
    jam_tutup: '21:00',
    is_buka: true,
    dibuat_pada: new Date().toISOString(),
    diperbarui_pada: new Date().toISOString()
  },
  // Add other days...
]

const mockStats: TokoStats = {
  toko_id: 'store-001',
  total_products: 150,
  total_transactions_today: 25,
  total_sales_today: 1250000,
  total_customers: 85,
  low_stock_items: 5,
  active_users: 3
}

export const useTokoStore = create<TokoState & TokoActions>()(
  devtools((set, get) => ({
    // Initial state
    currentStore: null,
    currentStoreConfigs: [],
    currentStoreOperatingHours: [],
    currentStoreStats: null,
    allStores: [],
    loading: false,
    saving: false,

    // Actions
    loadCurrentStore: async () => {
      set({ loading: true, error: undefined })
      try {
        const authState = useAuthStore.getState()
        const userStoreId = authState.user?.toko_id || authState.user?.storeId

        if (!userStoreId) {
          // Fallback to mock data for demo
          set({ currentStore: mockStore, loading: false })
          return
        }

        const store = await TokoApiService.findStoreById(userStoreId)
        set({ currentStore: store, loading: false })
      } catch (error: any) {
        console.error('Failed to load current store:', error)
        // Fallback to mock data
        set({ currentStore: mockStore, loading: false, error: error.message })
      }
    },

    updateCurrentStore: async (data: Partial<TokoFormData>) => {
      const { currentStore } = get()
      if (!currentStore) throw new Error('No current store loaded')

      set({ saving: true, error: undefined })
      try {
        const updatedStore = await TokoApiService.updateStore(currentStore.id, data)
        set({ currentStore: updatedStore, saving: false })
      } catch (error: any) {
        console.error('Failed to update store:', error)
        // Optimistic update for demo
        set({
          currentStore: { ...currentStore, ...data },
          saving: false,
          error: error.message
        })
        throw error
      }
    },

    loadCurrentStoreConfigs: async () => {
      const { currentStore } = get()
      if (!currentStore) return

      set({ loading: true, error: undefined })
      try {
        const configs = await TokoApiService.getStoreConfigs(currentStore.id)
        set({ currentStoreConfigs: configs, loading: false })
      } catch (error: any) {
        console.error('Failed to load store configs:', error)
        // Fallback to mock data
        set({ currentStoreConfigs: mockConfigs, loading: false })
      }
    },

    updateStoreConfig: async (key: string, value: string, deskripsi?: string) => {
      const { currentStore, currentStoreConfigs } = get()
      if (!currentStore) throw new Error('No current store loaded')

      set({ saving: true, error: undefined })
      try {
        const existingConfig = currentStoreConfigs.find(c => c.key === key)

        if (existingConfig) {
          await TokoApiService.updateStoreConfig(currentStore.id, key, { value, deskripsi })
        } else {
          await TokoApiService.setStoreConfig(currentStore.id, {
            toko_id: currentStore.id,
            key,
            value,
            deskripsi,
            tipe: 'string',
            is_public: false
          })
        }

        // Reload configs
        await get().loadCurrentStoreConfigs()
        set({ saving: false })
      } catch (error: any) {
        console.error('Failed to update store config:', error)
        set({ saving: false, error: error.message })
        throw error
      }
    },

    loadOperatingHours: async () => {
      const { currentStore } = get()
      if (!currentStore) return

      set({ loading: true, error: undefined })
      try {
        const hours = await TokoApiService.getOperatingHours(currentStore.id)
        set({ currentStoreOperatingHours: hours, loading: false })
      } catch (error: any) {
        console.error('Failed to load operating hours:', error)
        // Fallback to mock data
        set({ currentStoreOperatingHours: mockOperatingHours, loading: false })
      }
    },

    updateOperatingHours: async (hours: TokoOperatingHours[]) => {
      const { currentStore } = get()
      if (!currentStore) throw new Error('No current store loaded')

      set({ saving: true, error: undefined })
      try {
        const hoursData = hours.map(h => ({
          hari: h.hari,
          jam_buka: h.jam_buka,
          jam_tutup: h.jam_tutup,
          is_buka: h.is_buka,
          catatan: h.catatan
        }))

        await TokoApiService.updateOperatingHours(currentStore.id, {
          operating_hours: hoursData
        })

        set({ currentStoreOperatingHours: hours, saving: false })
      } catch (error: any) {
        console.error('Failed to update operating hours:', error)
        set({ saving: false, error: error.message })
        throw error
      }
    },

    loadStoreStats: async () => {
      const { currentStore } = get()
      if (!currentStore) return

      try {
        const stats = await TokoApiService.getStoreStats(currentStore.id)
        set({ currentStoreStats: stats })
      } catch (error: any) {
        console.error('Failed to load store stats:', error)
        // Fallback to mock data
        set({ currentStoreStats: mockStats })
      }
    },

    loadAllStores: async () => {
      set({ loading: true, error: undefined })
      try {
        const response = await TokoApiService.searchStores({ limit: 100 })
        set({ allStores: response.data, loading: false })
      } catch (error: any) {
        console.error('Failed to load all stores:', error)
        set({ allStores: [mockStore], loading: false, error: error.message })
      }
    },

    createStore: async (data: TokoFormData) => {
      set({ saving: true, error: undefined })
      try {
        const authState = useAuthStore.getState()
        const tenantId = authState.user?.tenant_id || authState.user?.tenantId || 'tenant-001'

        const newStore = await TokoApiService.createStore({
          ...data,
          tenant_id: tenantId
        })

        const { allStores } = get()
        set({
          allStores: [newStore, ...allStores],
          saving: false
        })
      } catch (error: any) {
        console.error('Failed to create store:', error)
        set({ saving: false, error: error.message })
        throw error
      }
    },

    clearError: () => set({ error: undefined })
  }))
)