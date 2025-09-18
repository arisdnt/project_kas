import api from '@/core/lib/api'
import { useAuthStore } from '@/core/store/authStore'

export type KasirSession = {
  id: string
  user_id: string
  store_id: string
  cart_items: CartItemAPI[]
  pelanggan: {
    id: string
    nama: string
    email?: string
    telepon?: string
  } | null
  total_amount: number
  created_at: string
}

export type CartItemAPI = {
  produk_id: string
  nama_produk: string
  harga: number
  quantity: number
  subtotal: number
}

export type ProdukKasir = {
  id: string
  nama: string
  barcode: string
  harga: number
  stok: number
  kategori: string
  satuan?: string
}

export type TransaksiDetail = {
  id: string
  nomor_transaksi: string
  total_amount: number
  status: string
  metode_bayar: string
  created_at: string
  items: {
    produk_id: string
    nama_produk: string
    quantity: number
    harga_satuan: number
    subtotal: number
  }[]
  pelanggan?: {
    id: string
    nama: string
  }
}

// Payment request expected by backend PembayaranSchema
// Backend enum: ['tunai', 'transfer', 'kartu', 'kredit', 'poin']
export type PaymentRequest = {
  metode_bayar: 'tunai' | 'transfer' | 'kartu' | 'kredit' | 'poin'
  jumlah_bayar: number
  catatan?: string
  cart_items: {
    produk_id: string
    kuantitas: number
    harga_satuan: number
    diskon_persen?: number
    diskon_nominal?: number
  }[]
  pelanggan_id?: string
  diskon_persen?: number
  diskon_nominal?: number
}

export type PaymentResponse = {
  transaksi: TransaksiDetail
  kembalian: number
}

export type SummaryData = {
  total_transaksi: number
  total_penjualan: number
  rata_rata_transaksi: number
}

export const kasirService = {
  _inflight: { session: false, summary: false },
  _lastCall: { session: 0, summary: 0 },
  _minIntervalMs: 800,
  // helper mengambil tokoId aktif (safe call karena ini modul fungsi dipanggil runtime)
  _getTokoId(): string | undefined {
    try {
      const user = useAuthStore.getState().user
      if (user?.tokoId) return user.tokoId
      // Trigger async ensureStoreContext (fire and forget)
      useAuthStore.getState().ensureStoreContext?.()
      return undefined
    } catch {
      return undefined
    }
  },
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const res = await api.get<{ success: boolean; data: { status?: string; timestamp?: string } }>(
      '/kasir/health'
    )
    const d: any = res.data || {}
    return { status: d.status || 'unknown', timestamp: d.timestamp || new Date().toISOString() }
  },

  // Session management
  async getOrCreateSession(): Promise<{ session: KasirSession; socket_room: string }> {
    const now = Date.now()
    if (this._inflight.session) {
      // Prevent parallel duplicate
      return new Promise((resolve, reject) => {
        const check = () => {
          if (!this._inflight.session) {
            try { resolve(this.getOrCreateSession()) } catch (e) { reject(e) }
          } else {
            setTimeout(check, 50)
          }
        }
        setTimeout(check, 50)
      })
    }
    if (now - this._lastCall.session < this._minIntervalMs) {
      // Throttle: return cached session if available via kasirStore state
      try {
        const state = (await import('@/features/kasir/store/kasirStore')).useKasirStore.getState()
        if (state.kasirSession) {
          return { session: state.kasirSession, socket_room: state.kasirSession.id }
        }
      } catch {}
    }
    this._inflight.session = true
    try {
      const tokoId = this._getTokoId()
      const res = await api.get<{ success: boolean; data: { session: KasirSession; socket_room: string } }>(
        '/kasir/session',
        tokoId ? { tokoId } : undefined
      )
      this._lastCall.session = Date.now()
      return res.data
    } finally {
      this._inflight.session = false
    }
  },

  // Summary
  async getSummary(): Promise<SummaryData> {
    const now = Date.now()
    if (this._inflight.summary) {
      return new Promise((resolve, reject) => {
        const check = () => {
          if (!this._inflight.summary) {
            try { resolve(this.getSummary()) } catch (e) { reject(e) }
          } else {
            setTimeout(check, 50)
          }
        }
        setTimeout(check, 50)
      })
    }
    if (now - this._lastCall.summary < this._minIntervalMs) {
      // Throttle; attempt reuse of last session summary if exists
      try {
        const state = (await import('@/features/kasir/store/kasirStore')).useKasirStore.getState()
        if (state.summary) return state.summary as SummaryData
      } catch {}
    }
    this._inflight.summary = true
    try {
      const tokoId = this._getTokoId()
      const res = await api.get<{ success: boolean; data: any }>(
        '/kasir/summary',
        tokoId ? { tokoId } : undefined
      )
      const d: any = res.data || {}
      this._lastCall.summary = Date.now()
      return {
        total_transaksi: d.total_transaksi || 0,
        total_penjualan: d.total_pendapatan || d.total_penjualan || 0,
        rata_rata_transaksi: d.rata_rata_transaksi || 0,
      }
    } finally {
      this._inflight.summary = false
    }
  },

  // Product search
  async searchProduk(params: { q?: string; kategori?: string; limit?: number }): Promise<ProdukKasir[]> {
    const tokoId = this._getTokoId()
    const searchParams = new URLSearchParams()
    if (params.q) searchParams.append('query', params.q) // backend expects 'query'
    if (params.kategori) searchParams.append('kategori_id', params.kategori) // backend expects kategori_id
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (tokoId) searchParams.append('tokoId', tokoId)
    const res = await api.get<{ success: boolean; data: any }>(
      `/kasir/produk/search?${searchParams.toString()}`
    )
    const raw = res.data
    const list = Array.isArray(raw?.products) ? raw.products : (Array.isArray(raw) ? raw : [])
    return list.map((p: any) => ({
      id: String(p.id),
      nama: p.nama,
      barcode: p.barcode || p.kode || '',
      harga: Number(p.harga_jual_toko ?? p.harga_jual ?? p.harga ?? 0),
      stok: Number(p.stok_tersedia ?? p.stok ?? 0),
      kategori: p.kategori_nama || p.kategori || '-',
      satuan: p.satuan || undefined
    }))
  },

  // Barcode scan
  async scanBarcode(barcode: string): Promise<ProdukKasir> {
    const tokoId = this._getTokoId()
    // Backend route: GET /kasir/produk/scan/:barcode
    const res = await api.get<{ success: boolean; data: any }>(
      `/kasir/produk/scan/${encodeURIComponent(barcode)}`,
      tokoId ? { tokoId } : undefined
    )
    const p: any = res.data || {}
    return {
      id: String(p.id || p.produk_id || ''),
      nama: p.nama || p.nama_produk || '-',
      barcode: p.barcode || p.kode || barcode,
      harga: Number(p.harga_jual_toko ?? p.harga_jual ?? p.harga ?? 0),
      stok: Number(p.stok_tersedia ?? p.stok ?? 0),
      kategori: p.kategori_nama || p.kategori || '-',
      satuan: p.satuan || undefined
    }
  },

  // Cart management
  async addToCart(produk_id: string, quantity: number): Promise<KasirSession> {
    const tokoId = this._getTokoId()
    const res = await api.post<{ success: boolean; data: KasirSession }>(
      `/kasir/cart/add${tokoId ? `?tokoId=${tokoId}` : ''}` ,
      // Backend expects { produk_id, kuantitas }
      { produk_id, kuantitas: quantity }
    )
    return (res as any).data
  },

  async updateCartItem(produkId: string, quantity: number): Promise<KasirSession> {
    const tokoId = this._getTokoId()
    const res = await api.put<{ success: boolean; data: KasirSession }>(
      `/kasir/cart/${produkId}${tokoId ? `?tokoId=${tokoId}` : ''}`,
      // Backend expects { kuantitas }
      { kuantitas: quantity }
    )
    return (res as any).data
  },

  async removeFromCart(produkId: string): Promise<KasirSession> {
    const tokoId = this._getTokoId()
    const res = await api.delete<{ success: boolean; data?: KasirSession }>(
      `/kasir/cart/${produkId}${tokoId ? `?tokoId=${tokoId}` : ''}`
    )
    return (res as any).data
  },

  async clearCart(): Promise<KasirSession> {
    const tokoId = this._getTokoId()
    const res = await api.delete<{ success: boolean; data?: KasirSession }>(
      `/kasir/cart${tokoId ? `?tokoId=${tokoId}` : ''}`
    )
    return (res as any).data
  },

  // Customer management
  async setPelanggan(pelanggan_id?: string): Promise<KasirSession> {
    const tokoId = this._getTokoId()
    const res = await api.post<{ success: boolean; data: KasirSession | null }>(
      `/kasir/pelanggan${tokoId ? `?tokoId=${tokoId}` : ''}`,
      { pelanggan_id }
    )
    return (res as any).data
  },

  // Payment processing
  async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    const tokoId = this._getTokoId()
    const res = await api.post<{ success: boolean; data: PaymentResponse }>(
      `/kasir/bayar${tokoId ? `?tokoId=${tokoId}` : ''}`,
      paymentData
    )
    return (res as any).data
  },

  // Transaction details
  async getTransactionDetail(transaksiId: string): Promise<TransaksiDetail> {
    const tokoId = this._getTokoId()
    const res = await api.get<{ success: boolean; data: TransaksiDetail }>(
      `/kasir/transaksi/${transaksiId}${tokoId ? `?tokoId=${tokoId}` : ''}`
    )
    return res.data
  }
}