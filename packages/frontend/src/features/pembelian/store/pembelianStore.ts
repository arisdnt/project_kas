import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PembelianService, PurchaseTransaction } from '../services/pembelianService'

export interface UIPembelian {
  id: string
  nomorTransaksi: string
  nomorPO?: string
  tanggal: string
  jatuhTempo?: string
  supplierNama?: string
  supplierKontak?: string
  pembeliNama?: string
  tokoNama?: string
  subtotal: number
  diskonPersen: number
  diskonNominal: number
  pajakPersen: number
  pajakNominal: number
  total: number
  status: string
  statusPembayaran: string
  catatan?: string
  dibuatPada: string
  diperbaruiPada: string
}

interface PembelianState {
  items: UIPembelian[]
  loading: boolean
  lastUpdatedAt: Date | null
  recentlyTouched: Record<string, { type: 'created' | 'updated' | 'deleted'; at: Date }>

  // Actions
  loadPembelian: () => Promise<void>
  deletePembelian: (id: string) => Promise<void>
  clearRecentlyTouched: (id: string) => void
}

// Convert API data to UI format
function convertToUI(apiData: PurchaseTransaction): UIPembelian {
  return {
    id: apiData.id,
    nomorTransaksi: apiData.nomor_transaksi,
    nomorPO: apiData.nomor_po || undefined,
    tanggal: apiData.tanggal,
    jatuhTempo: apiData.jatuh_tempo || undefined,
    supplierNama: apiData.supplier_nama || undefined,
    supplierKontak: apiData.supplier_kontak || undefined,
    pembeliNama: apiData.pembeli_nama || undefined,
    tokoNama: apiData.toko_nama || undefined,
    subtotal: apiData.subtotal,
    diskonPersen: apiData.diskon_persen,
    diskonNominal: apiData.diskon_nominal,
    pajakPersen: apiData.pajak_persen,
    pajakNominal: apiData.pajak_nominal,
    total: apiData.total,
    status: apiData.status,
    statusPembayaran: apiData.status_pembayaran,
    catatan: apiData.catatan || undefined,
    dibuatPada: apiData.tanggal, // Use tanggal as fallback for dibuatPada
    diperbaruiPada: apiData.tanggal // Use tanggal as fallback for diperbaruiPada
  }
}

export const usePembelianStore = create<PembelianState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      lastUpdatedAt: null,
      recentlyTouched: {},

      loadPembelian: async () => {
        set({ loading: true })
        try {
          const response = await PembelianService.searchTransaksi({ limit: 100 })
          const uiItems = response.data.map(convertToUI)

          set({
            items: uiItems,
            loading: false,
            lastUpdatedAt: new Date()
          })
        } catch (error) {
          console.error('Failed to load pembelian:', error)
          set({ loading: false })
          throw error
        }
      },

      deletePembelian: async (id: string) => {
        try {
          // Note: Add actual delete API call when backend supports it
          // await PembelianService.deletePembelian(id)

          const items = get().items.filter(p => p.id !== id)
          set({
            items,
            recentlyTouched: {
              ...get().recentlyTouched,
              [id]: { type: 'deleted', at: new Date() }
            }
          })
        } catch (error) {
          console.error('Failed to delete pembelian:', error)
          throw error
        }
      },

      clearRecentlyTouched: (id: string) => {
        const { [id]: _, ...rest } = get().recentlyTouched
        set({ recentlyTouched: rest })
      }
    }),
    {
      name: 'pembelian-store',
      partialize: (state) => ({
        items: state.items,
        lastUpdatedAt: state.lastUpdatedAt
      })
    }
  )
)