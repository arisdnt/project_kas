import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PenjualanService, TransaksiPenjualan } from '../services/penjualanService'

export interface UIPenjualan {
  id: string
  kode: string
  tanggal: string
  waktu?: string
  kasir: string
  pelanggan?: string
  metodeBayar: string
  status: string
  total: number
  items: Array<{
    id: string
    produkId: string
    produkNama: string
    sku?: string
    kuantitas: number
    hargaSatuan: number
    totalHarga: number
  }>
  dibuatPada: string
  diperbaruiPada: string
}

interface PenjualanState {
  items: UIPenjualan[]
  loading: boolean
  lastUpdatedAt: Date | null
  recentlyTouched: Record<string, { type: 'created' | 'updated' | 'deleted'; at: Date }>

  // Actions
  loadPenjualan: () => Promise<void>
  deletePenjualan: (id: string) => Promise<void>
  clearRecentlyTouched: (id: string) => void
}

// Convert API data to UI format
function convertToUI(apiData: TransaksiPenjualan): UIPenjualan {
  return {
    id: apiData.id,
    kode: apiData.transaction_code,
    tanggal: apiData.transaction_date.split('T')[0],
    waktu: new Date(apiData.transaction_date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    kasir: apiData.cashier_name,
    pelanggan: apiData.customer_name,
    metodeBayar: apiData.payment_method,
    status: apiData.status,
    total: apiData.total_amount,
    items: apiData.items.map(item => ({
      id: item.id,
      produkId: item.product_id,
      produkNama: item.product_name,
      sku: item.sku,
      kuantitas: item.quantity,
      hargaSatuan: item.unit_price,
      totalHarga: item.total_price
    })),
    dibuatPada: apiData.created_at,
    diperbaruiPada: apiData.updated_at
  }
}

export const usePenjualanStore = create<PenjualanState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      lastUpdatedAt: null,
      recentlyTouched: {},

      loadPenjualan: async () => {
        set({ loading: true })
        try {
          const response = await PenjualanService.searchTransaksi({ limit: 100 })
          const uiItems = response.data.map(convertToUI)

          set({
            items: uiItems,
            loading: false,
            lastUpdatedAt: new Date()
          })
        } catch (error) {
          console.error('Failed to load penjualan:', error)
          set({ loading: false })
          throw error
        }
      },

      deletePenjualan: async (id: string) => {
        try {
          // Note: Add actual delete API call when backend supports it
          // await PenjualanService.deletePenjualan(id)

          const items = get().items.filter(p => p.id !== id)
          set({
            items,
            recentlyTouched: {
              ...get().recentlyTouched,
              [id]: { type: 'deleted', at: new Date() }
            }
          })
        } catch (error) {
          console.error('Failed to delete penjualan:', error)
          throw error
        }
      },

      clearRecentlyTouched: (id: string) => {
        const { [id]: _, ...rest } = get().recentlyTouched
        set({ recentlyTouched: rest })
      }
    }),
    {
      name: 'penjualan-store',
      partialize: (state) => ({
        items: state.items,
        lastUpdatedAt: state.lastUpdatedAt
      })
    }
  )
)