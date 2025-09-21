export type CartItem = {
  id: string
  nama: string
  sku?: string
  harga: number
  qty: number
}

export type CartItemLocal = {
  id: number | string
  nama: string
  sku?: string
  harga: number
  qty: number
  _rawId?: string // original produk_id (UUID) for payment payload
}

export type DraftCart = {
  id: string
  name: string
  createdAt: string
  items: CartItemLocal[]
  pelanggan?: { id: string; nama?: string | null } | null
  metode: 'TUNAI' | 'KARTU' | 'QRIS' | 'TRANSFER' | 'EWALLET'
  bayar: number
  discountType: 'nominal' | 'percent'
  discountValue: number
  totalItems: number
  totalAmount: number
}

export type KasirState = {
  items: CartItemLocal[]
  taxRate: number
  bayar: number
  metode: 'TUNAI' | 'KARTU' | 'QRIS' | 'TRANSFER' | 'EWALLET'
  pelanggan?: { id: string; nama?: string | null } | null
  discountType: 'nominal' | 'percent'
  discountValue: number
  invoiceNumber: string
  sessionId: string
  kasirSession: any | null
  isLoading: boolean
  summary: {
    total_transaksi: number
    total_penjualan: number
    rata_rata_transaksi: number
  } | null
  needsStore: boolean
}

export type KasirActions = {
  clear: () => void
  addProduct: (p: any) => Promise<void>
  addByBarcode: (kode: string) => Promise<void>
  inc: (id: number | string) => Promise<void>
  dec: (id: number | string) => Promise<void>
  setQty: (id: number | string, qty: number) => Promise<void>
  remove: (id: number | string) => Promise<void>
  setBayar: (v: number) => void
  setMetode: (m: KasirState['metode']) => void
  setPelanggan: (p: KasirState['pelanggan']) => Promise<void>
  setDiscountType: (t: KasirState['discountType']) => void
  setDiscountValue: (v: number) => void
  generateNewInvoice: () => void
  loadDraftState: (state: {
    items: CartItemLocal[]
    pelanggan?: KasirState['pelanggan']
    metode: KasirState['metode']
    bayar: number
    discountType: KasirState['discountType']
    discountValue: number
  }) => void
  initSession: () => Promise<void>
  refreshSession: () => Promise<void>
  loadSummary: () => Promise<void>
  searchProducts: (query: string) => Promise<any[]>
  scanBarcode: (barcode: string) => Promise<any | null>
  syncSessionToLocal: () => void
  setNeedsStore: (v: boolean) => void
  saveDraft: (name?: string) => Promise<string>
  loadDraft: (draftId: string) => Promise<void>
  deleteDraft: (draftId: string) => Promise<void>
  getAllDrafts: () => Promise<DraftCart[]>
}