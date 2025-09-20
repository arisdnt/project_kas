import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { perpesananService, SearchPerpesananParams } from '@/features/perpesanan/services/perpesananService';
import {
  ConversationSummary,
  PerpesananMessage,
  PerpesananPrioritas,
  PerpesananStats
} from '@/features/perpesanan/types/perpesanan';
import { useAuthStore } from '@/core/store/authStore';

function getCurrentUserId(): string | undefined {
  const rawId = useAuthStore.getState().user?.id;
  return rawId != null ? String(rawId) : undefined;
}

function normalizeStatus(status: string): string {
  if (status === 'dikirim') {
    return 'terkirim';
  }
  return status;
}

function isMessageUnread(message: PerpesananMessage, currentUserId?: string): boolean {
  const normalized = normalizeStatus(message.status);
  if (!currentUserId) {
    return false;
  }
  return normalized === 'terkirim' && message.penerima_id === currentUserId;
}

function resolvePartner(message: PerpesananMessage, currentUserId?: string) {
  if (!currentUserId) {
    return undefined;
  }
  const isSender = message.pengirim_id === currentUserId;
  return isSender ? message.penerima : message.pengirim;
}

function sortByUpdatedDesc(a: ConversationSummary, b: ConversationSummary): number {
  const left = new Date(a.lastMessage.diperbarui_pada || a.lastMessage.dibuat_pada).getTime();
  const right = new Date(b.lastMessage.diperbarui_pada || b.lastMessage.dibuat_pada).getTime();
  return right - left;
}

type MessagePagination = {
  page: number;
  limit: number;
  total: number;
};

type PerpesananState = {
  conversations: ConversationSummary[];
  conversationsLoading: boolean;
  conversationsInitialized: boolean;
  conversationSearch: string;
  activePartnerId?: string;
  messagesByPartner: Record<string, PerpesananMessage[]>;
  messagesLoading: Record<string, boolean>;
  paginationByPartner: Record<string, MessagePagination>;
  stats?: PerpesananStats;
  statsLoading: boolean;
  unreadCount: number;
  unreadByPartner: Record<string, number>;
  fetchingUnread: boolean;
  sending: boolean;
  error?: string;
};

type PerpesananActions = {
  setConversationSearch: (value: string) => void;
  fetchInitialData: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshUnread: () => Promise<void>;
  setActivePartner: (partnerId: string) => Promise<void>;
  loadConversation: (partnerId: string, options?: { force?: boolean; limit?: number }) => Promise<void>;
  sendMessage: (partnerId: string, payload: { pesan: string; prioritas?: PerpesananPrioritas }) => Promise<PerpesananMessage | undefined>;
  receiveIncomingMessage: (message: PerpesananMessage) => void;
  markConversationAsRead: (partnerId: string) => Promise<void>;
  deleteMessageLocal: (partnerId: string, messageId: string) => void;
  searchMessages: (params: SearchPerpesananParams) => Promise<PerpesananMessage[]>;
};

export const usePerpesananStore = create<PerpesananState & PerpesananActions>()(
  devtools((set, get) => ({
    conversations: [],
    conversationsLoading: false,
    conversationsInitialized: false,
    conversationSearch: '',
    activePartnerId: undefined,
    messagesByPartner: {},
    messagesLoading: {},
    paginationByPartner: {},
    stats: undefined,
    statsLoading: false,
    unreadCount: 0,
    unreadByPartner: {},
    fetchingUnread: false,
    sending: false,
    error: undefined,

    setConversationSearch: (value) => set({ conversationSearch: value }),

    fetchInitialData: async () => {
      try {
        await get().refreshUnread();
        await Promise.all([
          get().refreshConversations(),
          get().refreshStats()
        ]);
        set({ conversationsInitialized: true });
      } catch (error: any) {
        set({ error: error?.message || 'Gagal memuat data perpesanan' });
        throw error;
      }
    },

    refreshConversations: async () => {
      const currentUserId = getCurrentUserId();
      set({ conversationsLoading: true });
      try {
        const messages = await perpesananService.getConversations();
        const summaries: ConversationSummary[] = [];
        const unreadByPartner = get().unreadByPartner;

        messages.forEach((message) => {
          const partner = resolvePartner(message, currentUserId);
          if (!partner) {
            return;
          }
          const partnerId = partner.id;
          const unreadCount = unreadByPartner[partnerId] ?? (isMessageUnread(message, currentUserId) ? 1 : 0);
          const summary: ConversationSummary = {
            partner,
            lastMessage: message,
            unreadCount,
            isUnread: unreadCount > 0
          };
          summaries.push(summary);
        });

        summaries.sort(sortByUpdatedDesc);
        set({ conversations: summaries, conversationsLoading: false });
      } catch (error: any) {
        set({ conversationsLoading: false, error: error?.message });
        throw error;
      }
    },

    refreshStats: async () => {
      set({ statsLoading: true });
      try {
        const stats = await perpesananService.getStats();
        set({ stats, statsLoading: false });
      } catch (error: any) {
        set({ statsLoading: false, error: error?.message });
      }
    },

    refreshUnread: async () => {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        set({ unreadCount: 0, unreadByPartner: {} });
        return;
      }

      set({ fetchingUnread: true });
      try {
        const [totalUnread, unreadResult] = await Promise.all([
          perpesananService.getUnreadCount(),
          perpesananService.search({ status: 'terkirim', limit: 200, sort_by: 'diperbarui_pada', sort_order: 'desc' })
        ]);

        const unreadByPartner: Record<string, number> = {};
        unreadResult.data.forEach((message) => {
          if (message.penerima_id !== currentUserId) {
            return;
          }
          const partnerId = message.pengirim_id;
          unreadByPartner[partnerId] = (unreadByPartner[partnerId] ?? 0) + 1;
        });

        set({ unreadCount: totalUnread, unreadByPartner, fetchingUnread: false });
      } catch (error: any) {
        set({ fetchingUnread: false, error: error?.message });
      }
    },

    setActivePartner: async (partnerId) => {
      set({ activePartnerId: partnerId });
      const existing = get().messagesByPartner[partnerId];
      if (!existing || existing.length === 0) {
        await get().loadConversation(partnerId, { force: true });
      }
      await get().markConversationAsRead(partnerId).catch(() => {});
    },

    loadConversation: async (partnerId, options) => {
      const force = options?.force ?? false;
      const limit = options?.limit ?? 200;
      const currentLoading = get().messagesLoading[partnerId];
      if (currentLoading) {
        return;
      }
      const existing = get().messagesByPartner[partnerId];
      if (existing && existing.length > 0 && !force) {
        return;
      }

      set((state) => ({
        messagesLoading: { ...state.messagesLoading, [partnerId]: true }
      }));

      try {
        const history = await perpesananService.getConversationHistory(partnerId, { page: 1, limit });
        set((state) => ({
          messagesByPartner: { ...state.messagesByPartner, [partnerId]: history.messages },
          paginationByPartner: {
            ...state.paginationByPartner,
            [partnerId]: {
              page: 1,
              limit,
              total: history.total
            }
          },
          messagesLoading: { ...state.messagesLoading, [partnerId]: false }
        }));
      } catch (error: any) {
        set((state) => ({
          messagesLoading: { ...state.messagesLoading, [partnerId]: false },
          error: error?.message
        }));
        throw error;
      }
    },

    sendMessage: async (partnerId, payload) => {
      const sending = get().sending;
      if (sending) {
        return undefined;
      }
      set({ sending: true });
      try {
        const message = await perpesananService.sendMessage({
          penerima_id: partnerId,
          pesan: payload.pesan,
          prioritas: payload.prioritas
        });

        set((state) => {
          const existingMessages = state.messagesByPartner[partnerId] ?? [];
          const updatedMessages = [...existingMessages, message];
          const currentUserId = getCurrentUserId();
          const partner = resolvePartner(message, currentUserId);
          const existingSummaryIndex = state.conversations.findIndex((item) => item.partner.id === partnerId);
          const unreadByPartner = { ...state.unreadByPartner };

          if (existingSummaryIndex >= 0) {
            const updatedConversations = [...state.conversations];
            const previousSummary = updatedConversations[existingSummaryIndex];
            updatedConversations[existingSummaryIndex] = {
              ...previousSummary,
              lastMessage: message,
              unreadCount: unreadByPartner[partnerId] ?? 0,
              isUnread: (unreadByPartner[partnerId] ?? 0) > 0
            };
            updatedConversations.sort(sortByUpdatedDesc);
            return {
              messagesByPartner: { ...state.messagesByPartner, [partnerId]: updatedMessages },
              conversations: updatedConversations,
              sending: false
            };
          }

          if (!partner) {
            return {
              messagesByPartner: { ...state.messagesByPartner, [partnerId]: updatedMessages },
              sending: false
            };
          }

          const newSummary: ConversationSummary = {
            partner,
            lastMessage: message,
            unreadCount: unreadByPartner[partnerId] ?? 0,
            isUnread: (unreadByPartner[partnerId] ?? 0) > 0
          };
          const updatedConversations = [newSummary, ...state.conversations];
          updatedConversations.sort(sortByUpdatedDesc);

          return {
            messagesByPartner: { ...state.messagesByPartner, [partnerId]: updatedMessages },
            conversations: updatedConversations,
            sending: false
          };
        });

        return message;
      } catch (error: any) {
        set({ sending: false, error: error?.message });
        throw error;
      }
    },

    receiveIncomingMessage: (message) => {
      const currentUserId = getCurrentUserId();
      const partner = resolvePartner(message, currentUserId);
      if (!partner) {
        return;
      }
      const partnerId = partner.id;

      set((state) => {
        const existingMessages = state.messagesByPartner[partnerId] ?? [];
        const alreadyExists = existingMessages.some((item) => item.id === message.id);
        const updatedMessages = alreadyExists ? existingMessages : [...existingMessages, message];
        const unreadByPartner = { ...state.unreadByPartner };
        let unreadCountTotal = state.unreadCount;

        if (isMessageUnread(message, currentUserId)) {
          unreadByPartner[partnerId] = (unreadByPartner[partnerId] ?? 0) + 1;
          unreadCountTotal += 1;
        }

        const existingSummaryIndex = state.conversations.findIndex((item) => item.partner.id === partnerId);
        let updatedConversations: ConversationSummary[];
        if (existingSummaryIndex >= 0) {
          updatedConversations = [...state.conversations];
          updatedConversations[existingSummaryIndex] = {
            partner,
            lastMessage: message,
            unreadCount: unreadByPartner[partnerId] ?? 0,
            isUnread: (unreadByPartner[partnerId] ?? 0) > 0
          };
        } else {
          const newSummary: ConversationSummary = {
            partner,
            lastMessage: message,
            unreadCount: unreadByPartner[partnerId] ?? 0,
            isUnread: (unreadByPartner[partnerId] ?? 0) > 0
          };
          updatedConversations = [newSummary, ...state.conversations];
        }

        updatedConversations.sort(sortByUpdatedDesc);

        return {
          messagesByPartner: { ...state.messagesByPartner, [partnerId]: updatedMessages },
          conversations: updatedConversations,
          unreadByPartner,
          unreadCount: unreadCountTotal
        };
      });

      const activePartnerId = get().activePartnerId;
      if (activePartnerId === partnerId && isMessageUnread(message, currentUserId)) {
        get().markConversationAsRead(partnerId).catch(() => {});
      }
    },

    markConversationAsRead: async (partnerId) => {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        return;
      }
      const messages = get().messagesByPartner[partnerId] ?? [];
      const unreadMessages = messages.filter((message) => isMessageUnread(message, currentUserId));
      if (unreadMessages.length === 0) {
        set((state) => ({
          unreadByPartner: { ...state.unreadByPartner, [partnerId]: 0 }
        }));
        return;
      }

      const ids = unreadMessages.map((message) => message.id);
      try {
        const updatedCount = await perpesananService.markAsRead({ pesan_ids: ids });
        const now = new Date().toISOString();

        set((state) => {
          const updatedMessages = (state.messagesByPartner[partnerId] ?? []).map((message) => {
            if (!ids.includes(message.id)) {
              return message;
            }
            return {
              ...message,
              status: 'dibaca',
              dibaca_pada: message.dibaca_pada ?? now
            };
          });

          const updatedConversations = state.conversations.map((summary) => {
            if (summary.partner.id !== partnerId) {
              return summary;
            }
            return {
              ...summary,
              unreadCount: 0,
              isUnread: false,
              lastMessage: summary.lastMessage.id === updatedMessages[updatedMessages.length - 1]?.id
                ? updatedMessages[updatedMessages.length - 1]
                : summary.lastMessage
            };
          });

          const currentUnreadTotal = Math.max(0, state.unreadCount - updatedCount);

          return {
            messagesByPartner: { ...state.messagesByPartner, [partnerId]: updatedMessages },
            conversations: updatedConversations,
            unreadByPartner: { ...state.unreadByPartner, [partnerId]: 0 },
            unreadCount: currentUnreadTotal
          };
        });
      } catch (error: any) {
        set({ error: error?.message });
      }
    },

    deleteMessageLocal: (partnerId, messageId) => {
      set((state) => {
        const updatedMessages = (state.messagesByPartner[partnerId] ?? []).filter((message) => message.id !== messageId);
        const updatedConversations = state.conversations.map((summary) => {
          if (summary.partner.id !== partnerId) {
            return summary;
          }
          if (summary.lastMessage.id === messageId) {
            const newerLastMessage = updatedMessages[updatedMessages.length - 1];
            if (newerLastMessage) {
              return { ...summary, lastMessage: newerLastMessage };
            }
          }
          return summary;
        }).filter(Boolean) as ConversationSummary[];

        return {
          messagesByPartner: { ...state.messagesByPartner, [partnerId]: updatedMessages },
          conversations: updatedConversations
        };
      });
    },

    searchMessages: async (params) => {
      const response = await perpesananService.search(params);
      return response.data;
    }
  }))
);
