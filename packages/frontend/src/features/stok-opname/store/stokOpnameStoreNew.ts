import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/core/lib/api'

export interface UIStokOpname {
  id: number
  idProduk: number
  namaProduk: string
  sku?: string
  kategori?: { id?: number; nama: string }
  brand?: { id?: number; nama: string }
  supplier?: { id?: number; nama: string }
  stokSistem: number
  stokFisik?: number
  selisih?: number
  status: 'pending' | 'completed' | 'cancelled'
  tanggalOpname?: string
  dibuatOleh?: string
  dibuatPada?: string
  diperbaruiPada?: string
  catatan?: string
}

interface StokOpnameState {
  items: UIStokOpname[]
  loading: boolean
  lastUpdatedAt: Date | null
  recentlyTouched: Record<number, { type: 'created' | 'updated' | 'deleted'; at: Date }>

  // Actions
  loadStokOpname: () => Promise<void>
  createStokOpname: (data: any) => Promise<void>
  updateStokOpname: (id: number, data: any) => Promise<void>
  deleteStokOpname: (id: number) => Promise<void>
  completeStokOpname: (id: number) => Promise<void>
  cancelStokOpname: (id: number) => Promise<void>
  clearRecentlyTouched: (id: number) => void
}

// Convert API data to UI format
function convertToUI(apiData: any): UIStokOpname {
  return {
    id: apiData.id,
    idProduk: apiData.id_produk,
    namaProduk: apiData.produk?.nama || apiData.nama_produk || '-',
    sku: apiData.produk?.sku || apiData.sku || undefined,
    kategori: apiData.produk?.kategori ? { id: apiData.produk.kategori.id, nama: apiData.produk.kategori.nama } : undefined,
    brand: apiData.produk?.brand ? { id: apiData.produk.brand.id, nama: apiData.produk.brand.nama } : undefined,
    supplier: apiData.produk?.supplier ? { id: apiData.produk.supplier.id, nama: apiData.produk.supplier.nama } : undefined,
    stokSistem: Number(apiData.stok_sistem) || 0,
    stokFisik: apiData.stok_fisik != null ? Number(apiData.stok_fisik) : undefined,
    selisih: apiData.selisih != null ? Number(apiData.selisih) : undefined,
    status: apiData.status || 'pending',
    tanggalOpname: apiData.tanggal_opname,
    dibuatOleh: apiData.dibuat_oleh,
    dibuatPada: apiData.dibuat_pada,
    diperbaruiPada: apiData.diperbarui_pada,
    catatan: apiData.catatan
  }
}

export const useStokOpnameStoreNew = create<StokOpnameState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      lastUpdatedAt: null,
      recentlyTouched: {},

      loadStokOpname: async () => {
        set({ loading: true })
        try {
          const response = await api.get('/stok-opname?page=1&limit=100')
          const uiItems = (response.data.data || []).map(convertToUI)

          set({
            items: uiItems,
            loading: false,
            lastUpdatedAt: new Date()
          })
        } catch (error) {
          console.error('Failed to load stok opname:', error)
          set({ loading: false })
          throw error
        }
      },

      createStokOpname: async (data: any) => {
        try {
          const response = await api.post('/stok-opname', data)
          const newItem = convertToUI(response.data.data)

          set({
            items: [newItem, ...get().items],
            recentlyTouched: {
              ...get().recentlyTouched,
              [newItem.id]: { type: 'created', at: new Date() }
            }
          })
        } catch (error) {
          console.error('Failed to create stok opname:', error)
          throw error
        }
      },

      updateStokOpname: async (id: number, data: any) => {
        try {
          const response = await api.put(`/stok-opname/${id}`, data)
          const updatedItem = convertToUI(response.data.data)

          set({
            items: get().items.map(item => item.id === id ? updatedItem : item),
            recentlyTouched: {
              ...get().recentlyTouched,
              [id]: { type: 'updated', at: new Date() }
            }
          })
        } catch (error) {
          console.error('Failed to update stok opname:', error)
          throw error
        }
      },

      deleteStokOpname: async (id: number) => {
        try {
          await api.delete(`/stok-opname/${id}`)

          const items = get().items.filter(item => item.id !== id)
          set({
            items,
            recentlyTouched: {
              ...get().recentlyTouched,
              [id]: { type: 'deleted', at: new Date() }
            }
          })
        } catch (error) {
          console.error('Failed to delete stok opname:', error)
          throw error
        }
      },

      completeStokOpname: async (id: number) => {
        await get().updateStokOpname(id, { status: 'completed' })
      },

      cancelStokOpname: async (id: number) => {
        await get().updateStokOpname(id, { status: 'cancelled' })
      },

      clearRecentlyTouched: (id: number) => {
        const { [id]: _, ...rest } = get().recentlyTouched
        set({ recentlyTouched: rest })
      }
    }),
    {
      name: 'stok-opname-store-new',
      partialize: (state) => ({
        items: state.items,
        lastUpdatedAt: state.lastUpdatedAt
      })
    }
  )
)