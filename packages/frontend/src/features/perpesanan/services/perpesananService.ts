import api from '@/core/lib/api';
import {
  ApiEnvelope,
  ApiPaginatedEnvelope,
  ConversationHistory,
  MarkAsReadPayload,
  PerpesananMessage,
  PerpesananStats,
  SendMessagePayload
} from '@/features/perpesanan/types/perpesanan';

export interface SearchPerpesananParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  prioritas?: string;
  pengirim_id?: string;
  penerima_id?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  sort_by?: string;
  sort_order?: string;
}

export const perpesananService = {
  async getConversations(): Promise<PerpesananMessage[]> {
    const response = await api.get<ApiEnvelope<PerpesananMessage[]>>('/perpesanan/conversations');
    return response.data;
  },

  async getConversationHistory(partnerId: string, params?: { page?: number; limit?: number }): Promise<ConversationHistory> {
    const response = await api.get<ApiPaginatedEnvelope<PerpesananMessage[]>>(
      `/perpesanan/conversation/${partnerId}`,
      {
        ...(params?.page ? { page: params.page.toString() } : {}),
        ...(params?.limit ? { limit: params.limit.toString() } : {})
      }
    );

    return {
      messages: response.data,
      total: response.pagination?.total ?? response.data.length
    };
  },

  async search(params: SearchPerpesananParams): Promise<ApiPaginatedEnvelope<PerpesananMessage[]>> {
    const query: Record<string, string> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query[key] = String(value);
      }
    });

    return api.get<ApiPaginatedEnvelope<PerpesananMessage[]>>('/perpesanan', query);
  },

  async getStats(): Promise<PerpesananStats> {
    const response = await api.get<ApiEnvelope<PerpesananStats>>('/perpesanan/stats');
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiEnvelope<{ unread_count: number }>>('/perpesanan/unread-count');
    return response.data.unread_count;
  },

  async sendMessage(payload: SendMessagePayload): Promise<PerpesananMessage> {
    const response = await api.post<ApiEnvelope<PerpesananMessage>>('/perpesanan', payload);
    return response.data;
  },

  async replyMessage(messageId: string, payload: { pesan: string }): Promise<PerpesananMessage> {
    const response = await api.post<ApiEnvelope<PerpesananMessage>>(`/perpesanan/${messageId}/reply`, payload);
    return response.data;
  },

  async markAsRead(payload: MarkAsReadPayload): Promise<number> {
    const response = await api.patch<ApiEnvelope<{ updated_count: number }>>('/perpesanan/mark-read', payload);
    return response.data.updated_count;
  },

  async deleteMessage(messageId: string): Promise<void> {
    await api.delete<ApiEnvelope<unknown>>(`/perpesanan/${messageId}`);
  }
};
