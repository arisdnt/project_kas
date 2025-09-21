import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useProdukStore, UIProduk } from '@/features/produk/store/produkStore'
import { config } from '@/core/config'
import { kasirService, ProdukKasir } from '@/features/kasir/services/kasirService'
import { KasirState, KasirActions, CartItemLocal } from './kasirTypes'
import {
  generateSessionId,
  generateInvoiceNumber,
  checkStoreRequirement,
  isStoreRequiredError
} from './kasirHelpers'
import { DraftManager } from './draftManager'

// Re-export types for backward compatibility
export type { CartItem, CartItemLocal, DraftCart } from './kasirTypes'

export const useKasirStore = create<KasirState & KasirActions>()(
  devtools(
    persist(
      (set, get) => {
    const sessionId = generateSessionId()
    const initialInvoiceNumber = generateInvoiceNumber(sessionId)

    return {
      items: [],
      taxRate: Number(config.pajak.tarifDefault || 0),
      bayar: 0,
      metode: 'TUNAI',
      pelanggan: null,
      discountType: 'nominal',
      discountValue: 0,
      invoiceNumber: initialInvoiceNumber,
      sessionId: sessionId,
      kasirSession: null,
      isLoading: false,
      summary: null,
  needsStore: false,

    clear: async () => {
      try {
        await kasirService.clearCart()
        const newInvoiceNumber = generateInvoiceNumber(get().sessionId)
        set({
          items: [],
          bayar: 0,
          pelanggan: null,
          metode: 'TUNAI',
          discountType: 'nominal',
          discountValue: 0,
          invoiceNumber: newInvoiceNumber
        })
        await get().refreshSession()
      } catch (error) {
        // Fallback to local clear if API fails
        const newInvoiceNumber = generateInvoiceNumber(get().sessionId)
        set({
          items: [],
          bayar: 0,
          pelanggan: null,
          metode: 'TUNAI',
          discountType: 'nominal',
          discountValue: 0,
          invoiceNumber: newInvoiceNumber
        })
      }
    },

    generateNewInvoice: () => {
      const newInvoiceNumber = generateInvoiceNumber(get().sessionId)
      set({ invoiceNumber: newInvoiceNumber })
    },

    addProduct: async (p: UIProduk | ProdukKasir) => {
      if (!p.harga) return

      try {
        const produkId = typeof p.id === 'string' ? p.id : p.id.toString()
        await kasirService.addToCart(produkId, 1)
        await get().refreshSession()
      } catch (error) {
        // Fallback to local add if API fails
        const exists = get().items.find((x) => x.id.toString() === p.id.toString())
        if (exists) {
          set({ items: get().items.map((x) => (x.id.toString() === p.id.toString() ? { ...x, qty: x.qty + 1 } : x)) })
        } else {
          const isUuidString = typeof p.id === 'string' && /[a-f0-9-]{10,}/i.test(p.id)
          set({
            items: [
              ...get().items,
              {
                id: isUuidString ? p.id : (typeof p.id === 'string' ? parseInt(p.id) : p.id),
                _rawId: typeof p.id === 'string' ? p.id : undefined,
                nama: p.nama,
                sku: 'sku' in p ? p.sku : ('barcode' in p ? p.barcode : undefined),
                harga: Number(p.harga || 0),
                qty: 1,
              },
            ],
          })
        }
      }
    },

    addByBarcode: async (kode: string) => {
      try {
        const product = await kasirService.scanBarcode(kode)
        if (product) {
          await get().addProduct(product)
        }
      } catch (error) {
        // Fallback to local search
        const { items: produkItems } = useProdukStore.getState()
        const found = produkItems.find((x) => x.sku && x.sku.toLowerCase() === kode.trim().toLowerCase())
        if (found) {
          await get().addProduct(found)
        }
      }
    },

    inc: async (id: number | string) => {
      try {
        const item = get().items.find(x => x.id.toString() === id.toString())
        if (item) {
          const produkId = (item as any)._rawId || item.id
          await kasirService.updateCartItem(String(produkId), item.qty + 1)
          await get().refreshSession()
        }
      } catch (error) {
        set({ items: get().items.map((x) => (x.id.toString() === id.toString() ? { ...x, qty: x.qty + 1 } : x)) })
      }
    },
    dec: async (id: number | string) => {
      try {
        const item = get().items.find(x => x.id.toString() === id.toString())
        if (item) {
          const produkId = (item as any)._rawId || item.id
          if (item.qty <= 1) {
            await kasirService.removeFromCart(String(produkId))
          } else {
            await kasirService.updateCartItem(String(produkId), item.qty - 1)
          }
          await get().refreshSession()
        }
      } catch (error) {
        set({
          items: get().items
            .map((x) => (x.id.toString() === id.toString() ? { ...x, qty: Math.max(1, x.qty - 1) } : x))
            .filter((x) => x.qty > 0),
        })
      }
    },
    setQty: async (id: number | string, qty: number) => {
      try {
        const validQty = Math.max(1, Math.floor(qty) || 1)
        const item = get().items.find(x => x.id.toString() === id.toString())
        if (item) {
          const produkId = (item as any)._rawId || item.id
          await kasirService.updateCartItem(String(produkId), validQty)
          await get().refreshSession()
        }
      } catch (error) {
        set({ items: get().items.map((x) => (x.id.toString() === id.toString() ? { ...x, qty: Math.max(1, Math.floor(qty) || 1) } : x)) })
      }
    },
    remove: async (id: number | string) => {
      try {
        const item = get().items.find(x => x.id.toString() === id.toString())
        const produkId = item ? (item as any)._rawId || item.id : id
        await kasirService.removeFromCart(String(produkId))
        await get().refreshSession()
      } catch (error) {
        set({ items: get().items.filter((x) => x.id.toString() !== id.toString()) })
      }
    },
    setBayar: (v: number) => set({ bayar: isFinite(v) ? Math.max(0, v) : 0 }),
    setMetode: (m) => set({ metode: m }),
    setPelanggan: async (p) => {
      try {
        await kasirService.setPelanggan(p?.id)
        set({ pelanggan: p || null })
        await get().refreshSession()
      } catch (error) {
        // Fallback to local set
        set({ pelanggan: p || null })
      }
    },
    setDiscountType: (t) => set({ discountType: t }),
    setDiscountValue: (v) => set({ discountValue: isFinite(v) ? Math.max(0, v) : 0 }),
    loadDraftState: (state) => {
      const newInvoiceNumber = generateInvoiceNumber(get().sessionId)
      set({
        items: state.items,
        pelanggan: state.pelanggan || null,
        metode: state.metode,
        bayar: state.bayar,
        discountType: state.discountType,
        discountValue: state.discountValue,
        invoiceNumber: newInvoiceNumber
      })
    },

    // New kasir API actions
    initSession: async () => {
      try {
        set({ isLoading: true })
        const auth = (await import('@/core/store/authStore'))
        const authState = auth.useAuthStore.getState()
        if (!authState.user?.tokoId) {
          // Attempt to auto determine store context (will not set for god user or multi-store)
          await authState.ensureStoreContext()
        }
        const refreshedAuth = auth.useAuthStore.getState()
        const user = refreshedAuth.user
        // Only require store for users level 3+ (manager, cashier)
        // God users, level 1 (super admin), and level 2 (admin) can proceed without store
        if (checkStoreRequirement(user)) {
          // No store resolved automatically; UI should prompt selection
          set({ needsStore: true })
          return
        }
        const result = await kasirService.getOrCreateSession()
        set({ kasirSession: result.session, needsStore: false })
        get().syncSessionToLocal()
      } catch (error) {
        console.error('Failed to init kasir session:', error)
        if (isStoreRequiredError(error)) {
          set({ needsStore: true })
        }
      } finally {
        set({ isLoading: false })
      }
    },

    refreshSession: async () => {
      try {
        const auth = (await import('@/core/store/authStore'))
        const user = auth.useAuthStore.getState().user
        // Only require store for users level 3+ (manager, cashier)
        if (checkStoreRequirement(user)) {
          set({ needsStore: true })
          return
        }
        const result = await kasirService.getOrCreateSession()
        set({ kasirSession: result.session, needsStore: false })
        get().syncSessionToLocal()
      } catch (error) {
        console.error('Failed to refresh kasir session:', error)
        if (isStoreRequiredError(error)) {
          set({ needsStore: true })
        }
      }
    },

    loadSummary: async () => {
      try {
        const auth = (await import('@/core/store/authStore'))
        const user = auth.useAuthStore.getState().user
        // Only require store for users level 3+ (manager, cashier)
        if (checkStoreRequirement(user)) {
          set({ needsStore: true })
          return
        }
        const summary = await kasirService.getSummary()
        set({ summary, needsStore: false })
      } catch (error) {
        console.error('Failed to load summary:', error)
      }
    },

    searchProducts: async (query: string) => {
      try {
        return await kasirService.searchProduk({ q: query, limit: 20 })
      } catch (error) {
        console.error('Failed to search products:', error)
        return []
      }
    },

    scanBarcode: async (barcode: string) => {
      try {
        return await kasirService.scanBarcode(barcode)
      } catch (error) {
        console.error('Failed to scan barcode:', error)
        return null
      }
    },

    syncSessionToLocal: () => {
      const session = get().kasirSession
      if (!session) return

      // Convert API cart items to local format
  const mapSessionItems = () => (session.cart_items || []).map((item: any) => ({
        // Preserve original produk_id string in a hidden field for payment payload if parseInt fails
        // Some produk_id are UUID so parseInt would yield NaN -> keep numeric fallback for legacy code
        id: isNaN(parseInt(item.produk_id)) ? (item.produk_id as any) : parseInt(item.produk_id),
        nama: item.nama_produk,
        harga: item.harga,
        qty: item.quantity,
        // @ts-ignore add original id reference
        _rawId: item.produk_id
      })) as CartItemLocal[]

      const currentItems = get().items
      const sessionMapped = mapSessionItems()
      // Guard: if server returns empty cart (e.g., on customer select), keep local items
      const nextItems = sessionMapped.length > 0 ? sessionMapped : currentItems

      // Prefer session pelanggan if available; otherwise keep existing selection
      const nextPelanggan = session.pelanggan
        ? { id: session.pelanggan.id, nama: session.pelanggan.nama }
        : get().pelanggan || null

      set({
        items: nextItems,
        pelanggan: nextPelanggan
      })
    },
    setNeedsStore: (v: boolean) => set({ needsStore: v }),

    // Draft Management
    saveDraft: async (name?: string) => {
      const state = get()
      return await DraftManager.saveDraft(
        state.items,
        state.pelanggan,
        state.metode,
        state.bayar,
        state.discountType,
        state.discountValue,
        name
      )
    },

    loadDraft: async (draftId: string) => {
      const draft = await DraftManager.loadDraft(draftId)

      // Clear current cart first
      await get().clear()

      // Load draft state
      const newInvoiceNumber = generateInvoiceNumber(get().sessionId)
      set({
        items: draft.items,
        pelanggan: draft.pelanggan,
        metode: draft.metode,
        bayar: draft.bayar,
        discountType: draft.discountType,
        discountValue: draft.discountValue,
        invoiceNumber: newInvoiceNumber
      })
    },

    deleteDraft: async (draftId: string) => {
      return await DraftManager.deleteDraft(draftId)
    },

    getAllDrafts: async () => {
      return await DraftManager.getAllDrafts()
    },
  }
      },
      {
        name: 'kasir-storage',
        partialize: (state) => ({
          items: state.items,
          pelanggan: state.pelanggan,
          metode: state.metode,
          bayar: state.bayar,
          discountType: state.discountType,
          discountValue: state.discountValue,
        }),
      }
    ),
    {
      name: 'kasir-store',
    }
  )
)

export function useKasirTotals() {
  const { items, taxRate, bayar, metode, discountType, discountValue } = useKasirStore()
  const includeTax = config.pajak.termasukDalamHarga
  const gross = items.reduce((sum, it) => sum + it.harga * it.qty, 0)
  const discount = discountType === 'percent' ? gross * (Math.min(100, Math.max(0, discountValue)) / 100) : Math.min(gross, Math.max(0, discountValue))
  const afterDiscount = Math.max(0, gross - discount)
  let subtotal = 0
  let pajak = 0
  let total = 0
  if (includeTax) {
    total = afterDiscount
    const net = taxRate > 0 ? afterDiscount / (1 + taxRate) : afterDiscount
    pajak = Math.max(0, total - net)
    subtotal = net
  } else {
    subtotal = afterDiscount
    pajak = subtotal * taxRate
    total = subtotal + pajak
  }
  const kembalian = metode === 'TUNAI' ? Math.max(0, bayar - total) : 0
  return { subtotal, pajak, total, kembalian, taxRate, bayar, gross, discount, afterDiscount, includeTax, discountType, discountValue }
}
