import { DraftCart, CartItemLocal, KasirState } from './kasirTypes'

export class DraftManager {
  private static STORAGE_KEY = 'kasir_drafts'

  static async saveDraft(
    items: CartItemLocal[],
    pelanggan: KasirState['pelanggan'],
    metode: KasirState['metode'],
    bayar: number,
    discountType: KasirState['discountType'],
    discountValue: number,
    name?: string
  ): Promise<string> {
    if (items.length === 0) {
      throw new Error('Tidak ada item untuk disimpan sebagai draft')
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.harga * item.qty), 0)
    const totalItems = items.reduce((sum, item) => sum + item.qty, 0)

    const draft: DraftCart = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name || `Draft ${new Date().toLocaleString('id-ID')}`,
      createdAt: new Date().toISOString(),
      items,
      pelanggan,
      metode,
      bayar,
      discountType,
      discountValue,
      totalItems,
      totalAmount
    }

    const existingDrafts = this.getDraftsFromStorage()
    existingDrafts.push(draft)
    this.saveDraftsToStorage(existingDrafts)

    return draft.id
  }

  static async loadDraft(draftId: string): Promise<DraftCart> {
    const existingDrafts = this.getDraftsFromStorage()
    const draft = existingDrafts.find(d => d.id === draftId)

    if (!draft) {
      throw new Error('Draft tidak ditemukan')
    }

    return draft
  }

  static async deleteDraft(draftId: string): Promise<void> {
    const existingDrafts = this.getDraftsFromStorage()
    const updatedDrafts = existingDrafts.filter(d => d.id !== draftId)
    this.saveDraftsToStorage(updatedDrafts)
  }

  static async getAllDrafts(): Promise<DraftCart[]> {
    const drafts = this.getDraftsFromStorage()
    return drafts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  private static getDraftsFromStorage(): DraftCart[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]')
    } catch (error) {
      console.error('Error reading drafts from localStorage:', error)
      return []
    }
  }

  private static saveDraftsToStorage(drafts: DraftCart[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drafts))
    } catch (error) {
      console.error('Error saving drafts to localStorage:', error)
      throw new Error('Gagal menyimpan draft ke storage')
    }
  }
}