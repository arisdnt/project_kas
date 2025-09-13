import { config } from '@/core/config'
import { useAuthStore } from '@/core/store/authStore'
import type { 
  RefundTransaction, 
  RefundFilters, 
  CreateRefundRequest, 
  UpdateRefundRequest,
  RefundStats 
} from './types'

const BASE = `${config.api.url}:${config.api.port}/api/retur-penjualan`

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export interface RefundListResponse {
  success: boolean
  data: {
    items: RefundTransaction[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const returPenjualanService = {
  async getList(params?: {
    page?: number
    limit?: number
    status?: string
    range?: string
    from?: string
    to?: string
    cashier?: string
    payment?: string
    query?: string
  }): Promise<RefundListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status) searchParams.set('status', params.status)
    if (params?.range) searchParams.set('range', params.range)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    if (params?.cashier) searchParams.set('cashier', params.cashier)
    if (params?.payment) searchParams.set('payment', params.payment)
    if (params?.query) searchParams.set('query', params.query)

    const url = `${BASE}?${searchParams.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async getById(id: number): Promise<{ success: boolean; data: RefundTransaction }> {
    const response = await fetch(`${BASE}/${id}`, {
      method: 'GET',
      headers: authHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async create(data: CreateRefundRequest): Promise<{ success: boolean; data: RefundTransaction }> {
    const response = await fetch(BASE, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async update(id: number, data: UpdateRefundRequest): Promise<{ success: boolean; data: RefundTransaction }> {
    const response = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE}/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async getStats(params?: {
    from?: string
    to?: string
  }): Promise<{ success: boolean; data: RefundStats }> {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)

    const url = `${BASE}/stats?${searchParams.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async approveRefund(id: number, notes?: string): Promise<{ success: boolean; data: RefundTransaction }> {
    const response = await fetch(`${BASE}/${id}/approve`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ notes })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  async rejectRefund(id: number, notes?: string): Promise<{ success: boolean; data: RefundTransaction }> {
    const response = await fetch(`${BASE}/${id}/reject`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ notes })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}