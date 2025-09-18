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
}

export type { PurchaseTransaction };
