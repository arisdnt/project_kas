import api from '@/core/lib/api';

export interface RestockRequestItem {
  produkId: string;
  qty: number;
  hargaBeli?: number;
}

export interface RestockRequestPayload {
  items: RestockRequestItem[];
  supplierId?: string;
  catatan?: string;
}

export interface RestockResponseItem {
  produkId: string;
  qtyAdded: number;
  newStock: number;
  hargaBeli?: number;
}

export interface RestockResponseData {
  storeId: string;
  tenantId: string;
  items: RestockResponseItem[];
}

export interface RestockResponse {
  success: boolean;
  data: RestockResponseData;
}

export const restockService = {
  async submitRestock(payload: RestockRequestPayload): Promise<RestockResponseData> {
    const response = await api.post<RestockResponse>('/pembelian/restock', payload);
    return response.data;
  },
};
