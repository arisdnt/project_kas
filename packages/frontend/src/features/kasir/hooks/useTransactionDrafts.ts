import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '@/core/store/authStore'
import { CartItem } from '@/features/kasir/store/kasirStore'

export interface TransactionDraft {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  items: CartItem[]
  pelanggan?: { id: number; nama?: string | null } | null
  metode: 'TUNAI' | 'KARTU' | 'QRIS' | 'TRANSFER' | 'EWALLET'
  bayar: number
  discountType: 'nominal' | 'percent'
  discountValue: number
  notes?: string
  totalItems: number
  totalAmount: number
}

const MAX_DRAFTS = 10

/**
 * Hook untuk mengelola draft transaksi dengan localStorage
 * Setiap user memiliki draft terpisah berdasarkan userId dan tokoId
 */
export function useTransactionDrafts() {
  const { user } = useAuthStore()
  const [drafts, setDrafts] = useState<TransactionDraft[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const normalizeDrafts = useCallback((list: TransactionDraft[]) => {
    return [...list]
      .filter(draft => draft?.id && draft?.updatedAt)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, MAX_DRAFTS)
  }, [])

  // Generate storage key berdasarkan user dan toko
  const getStorageKey = useCallback(() => {
    if (!user?.id || !user?.tokoId) return null
    return `kasir_drafts_${user.id}_${user.tokoId}`
  }, [user?.id, user?.tokoId])

  // Load drafts dari localStorage
  const loadDrafts = useCallback(() => {
    const storageKey = getStorageKey()
    if (!storageKey) {
      setDrafts([])
      setIsLoading(false)
      return
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsedDrafts = JSON.parse(stored) as TransactionDraft[]
        // Validasi dan filter draft yang valid
        const validDrafts = parsedDrafts.filter(draft =>
          draft.id &&
          draft.items &&
          Array.isArray(draft.items) &&
          draft.createdAt
        )
        const normalizedDrafts = normalizeDrafts(validDrafts)
        setDrafts(normalizedDrafts)

        if (normalizedDrafts.length !== validDrafts.length) {
          localStorage.setItem(storageKey, JSON.stringify(normalizedDrafts))
        }
      } else {
        setDrafts([])
      }
    } catch (error) {
      console.error('Error loading drafts:', error)
      setDrafts([])
    } finally {
      setIsLoading(false)
    }
  }, [getStorageKey, normalizeDrafts])

  // Simpan drafts ke localStorage
  const saveDrafts = useCallback((newDrafts: TransactionDraft[]) => {
    const storageKey = getStorageKey()
    if (!storageKey) return

    try {
      const normalizedDrafts = normalizeDrafts(newDrafts)
      localStorage.setItem(storageKey, JSON.stringify(normalizedDrafts))
      setDrafts(normalizedDrafts)
    } catch (error) {
      console.error('Error saving drafts:', error)
    }
  }, [getStorageKey, normalizeDrafts])

  // Hitung totals untuk draft
  const calculateTotals = useCallback((items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.qty, 0)
    const totalAmount = items.reduce((sum, item) => sum + (item.harga * item.qty), 0)
    return { totalItems, totalAmount }
  }, [])

  // Simpan transaksi sebagai draft
  const saveDraft = useCallback((draftData: {
    name: string
    items: CartItem[]
    pelanggan?: { id: number; nama?: string | null } | null
    metode: 'TUNAI' | 'KARTU' | 'QRIS' | 'TRANSFER' | 'EWALLET'
    bayar: number
    discountType: 'nominal' | 'percent'
    discountValue: number
    notes?: string
  }) => {
    if (draftData.items.length === 0) {
      throw new Error('Tidak dapat menyimpan draft transaksi kosong')
    }

    const { totalItems, totalAmount } = calculateTotals(draftData.items)
    const now = new Date().toISOString()

    const newDraft: TransactionDraft = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: draftData.name || `Draft ${new Date().toLocaleString('id-ID')}`,
      createdAt: now,
      updatedAt: now,
      items: draftData.items,
      pelanggan: draftData.pelanggan,
      metode: draftData.metode,
      bayar: draftData.bayar,
      discountType: draftData.discountType,
      discountValue: draftData.discountValue,
      notes: draftData.notes,
      totalItems,
      totalAmount
    }

    const updatedDrafts = [newDraft, ...drafts]
    saveDrafts(updatedDrafts)
    return newDraft.id
  }, [drafts, saveDrafts, calculateTotals])

  // Update draft yang sudah ada
  const updateDraft = useCallback((draftId: string, draftData: {
    name?: string
    items: CartItem[]
    pelanggan?: { id: number; nama?: string | null } | null
    metode: 'TUNAI' | 'KARTU' | 'QRIS' | 'TRANSFER' | 'EWALLET'
    bayar: number
    discountType: 'nominal' | 'percent'
    discountValue: number
    notes?: string
  }) => {
    const existingDraft = drafts.find(d => d.id === draftId)
    if (!existingDraft) {
      throw new Error('Draft tidak ditemukan')
    }

    if (draftData.items.length === 0) {
      throw new Error('Tidak dapat menyimpan draft transaksi kosong')
    }

    const { totalItems, totalAmount } = calculateTotals(draftData.items)

    const updatedDraft: TransactionDraft = {
      ...existingDraft,
      name: draftData.name || existingDraft.name,
      updatedAt: new Date().toISOString(),
      items: draftData.items,
      pelanggan: draftData.pelanggan,
      metode: draftData.metode,
      bayar: draftData.bayar,
      discountType: draftData.discountType,
      discountValue: draftData.discountValue,
      notes: draftData.notes,
      totalItems,
      totalAmount
    }

    const updatedDrafts = drafts.map(d =>
      d.id === draftId ? updatedDraft : d
    )
    saveDrafts(updatedDrafts)
  }, [drafts, saveDrafts, calculateTotals])

  // Hapus draft
  const deleteDraft = useCallback((draftId: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId)
    saveDrafts(updatedDrafts)
  }, [drafts, saveDrafts])

  // Duplikasi draft
  const duplicateDraft = useCallback((draftId: string) => {
    const draft = drafts.find(d => d.id === draftId)
    if (!draft) {
      throw new Error('Draft tidak ditemukan')
    }

    return saveDraft({
      name: `${draft.name} (Salinan)`,
      items: draft.items,
      pelanggan: draft.pelanggan,
      metode: draft.metode,
      bayar: draft.bayar,
      discountType: draft.discountType,
      discountValue: draft.discountValue,
      notes: draft.notes
    })
  }, [drafts, saveDraft])

  // Bersihkan draft lama (lebih dari 30 hari)
  const cleanOldDrafts = useCallback(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const filteredDrafts = drafts.filter(draft =>
      new Date(draft.createdAt) > thirtyDaysAgo
    )

    if (filteredDrafts.length < drafts.length) {
      saveDrafts(filteredDrafts)
      return drafts.length - filteredDrafts.length // Jumlah draft yang dihapus
    }

    return 0
  }, [drafts, saveDrafts])

  // Load drafts saat hook pertama kali digunakan
  useEffect(() => {
    loadDrafts()
  }, [loadDrafts])

  // Auto-cleanup draft lama setiap kali drafts berubah
  useEffect(() => {
    if (drafts.length > 0) {
      const cleanupTimer = setTimeout(() => {
        cleanOldDrafts()
      }, 1000)

      return () => clearTimeout(cleanupTimer)
    }
  }, [drafts.length, cleanOldDrafts])

  return {
    drafts,
    isLoading,
    saveDraft,
    updateDraft,
    deleteDraft,
    duplicateDraft,
    loadDrafts,
    cleanOldDrafts
  }
}
