import api from '@/core/lib/api';
import { PurchaseTransaction, SearchPurchaseQuery } from '../types';

export type PurchaseSearchResponse = {
  success: boolean;
  data: PurchaseTransaction[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
};

export type RestockItem = {
  produkId: string;
  qty: number;
  hargaBeli?: number;
};

export type RestockRequest = {
  items: RestockItem[];
  supplierId?: string;
  catatan?: string;
};

export type RestockResultItem = {
  produkId: string;
  qtyAdded: number;
  newStock: number;
  hargaBeli?: number;
};

export type RestockResponse = {
  success: boolean;
  message: string;
  data: {
    storeId: string;
    tenantId: string;
    items: RestockResultItem[];
  };
};

export class PembelianService {
  private static readonly BASE_URL = '/pembelian';

  private static buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return searchParams.toString();
  }

  static async searchTransaksi(query: SearchPurchaseQuery = {}): Promise<PurchaseSearchResponse> {
    const queryString = this.buildQueryString(query);
    const endpoint = queryString ? `${this.BASE_URL}?${queryString}` : this.BASE_URL;
    const response = await api.get<PurchaseSearchResponse>(endpoint);

    return response;
  }

  /**
   * Execute restocking operation
   * Mengupdate stok inventaris berdasarkan produk yang dipilih
   */
  static async executeRestock(request: RestockRequest): Promise<RestockResponse> {
    const response = await api.post<RestockResponse>(`${this.BASE_URL}/restock`, request);
    return response;
  }

  /**
   * Get single purchase transaction by ID
   */
  static async getById(id: string): Promise<{ success: boolean; data: PurchaseTransaction }> {
    const response = await api.get<{ success: boolean; data: PurchaseTransaction }>(`${this.BASE_URL}/${id}`);
    return response;
  }

  /**
   * Create new purchase transaction
   */
  static async create(transaction: any): Promise<{ success: boolean; data: PurchaseTransaction }> {
    const response = await api.post<{ success: boolean; data: PurchaseTransaction }>(this.BASE_URL, transaction);
    return response;
  }

  /**
   * Update existing purchase transaction
   */
  static async update(id: string, data: any): Promise<{ success: boolean; data: PurchaseTransaction }> {
    const response = await api.put<{ success: boolean; data: PurchaseTransaction }>(`${this.BASE_URL}/${id}`, data);
    return response;
  }

  /**
   * Cancel purchase transaction
   */
  static async cancel(id: string): Promise<{ success: boolean; data: PurchaseTransaction }> {
    const response = await api.delete<{ success: boolean; data: PurchaseTransaction }>(`${this.BASE_URL}/${id}`);
    return response;
  }
}

export type { PurchaseTransaction };
