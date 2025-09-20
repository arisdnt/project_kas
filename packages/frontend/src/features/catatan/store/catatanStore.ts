import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { catatanService } from '@/features/catatan/services/catatanService';
import {
  CatatanFilters,
  CatatanPagination,
  CatatanRecord,
  CatatanStats,
  CreateCatatanPayload,
  UpdateCatatanPayload
} from '@/features/catatan/types/catatan';

const defaultPagination: CatatanPagination = {
  page: 1,
  limit: 20,
  total: 0,
  total_pages: 0
};

const defaultFilters: CatatanFilters = {
  status: 'aktif'
};

function recordMatchesFilters(record: CatatanRecord, filters: CatatanFilters): boolean {
  if (filters.visibilitas && record.visibilitas !== filters.visibilitas) {
    return false;
  }
  if (filters.prioritas && record.prioritas !== filters.prioritas) {
    return false;
  }
  if (filters.status && record.status !== filters.status) {
    return false;
  }
  if (filters.kategori && record.kategori !== filters.kategori) {
    return false;
  }
  if (filters.toko_id && record.toko?.id !== filters.toko_id) {
    return false;
  }
  if (filters.user_id && record.user_id !== filters.user_id) {
    return false;
  }
  if (filters.has_reminder !== undefined) {
    const hasReminder = Boolean(record.reminder_pada);
    if (filters.has_reminder !== hasReminder) {
      return false;
    }
  }
  if (filters.tags && filters.tags.length > 0) {
    const recordTags = record.tags ?? [];
    const hasAnyTag = filters.tags.some((tag) => recordTags.includes(tag));
    if (!hasAnyTag) {
      return false;
    }
  }
  return true;
}

type CatatanState = {
  items: CatatanRecord[];
  loading: boolean;
  initialized: boolean;
  error?: string;
  filters: CatatanFilters;
  pagination: CatatanPagination;
  stats?: CatatanStats;
  statsLoading: boolean;
  reminderItems: CatatanRecord[];
  reminderLoading: boolean;
  quickItems: CatatanRecord[];
  quickLoading: boolean;
  selectedId?: string;
  selected?: CatatanRecord;
  selectedLoading: boolean;
};

type CatatanActions = {
  initialize: () => Promise<void>;
  fetchList: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchReminders: () => Promise<void>;
  fetchQuickItems: () => Promise<void>;
  setFilters: (filters: Partial<CatatanFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  selectCatatan: (id?: string) => Promise<void>;
  createCatatan: (payload: CreateCatatanPayload) => Promise<CatatanRecord>;
  updateCatatan: (id: string, payload: UpdateCatatanPayload) => Promise<CatatanRecord>;
  deleteCatatan: (id: string) => Promise<void>;
  upsertFromRealtime: (record: CatatanRecord) => void;
  removeFromRealtime: (id: string) => void;
};

export const useCatatanStore = create<CatatanState & CatatanActions>()(
  devtools((set, get) => ({
    items: [],
    loading: false,
    initialized: false,
    filters: defaultFilters,
    pagination: defaultPagination,
    stats: undefined,
    statsLoading: false,
    reminderItems: [],
    reminderLoading: false,
    quickItems: [],
    quickLoading: false,
    selectedId: undefined,
    selected: undefined,
    selectedLoading: false,

    async initialize() {
      if (get().initialized) {
        return;
      }
      await Promise.all([
        get().fetchList(),
        get().fetchStats(),
        get().fetchReminders(),
        get().fetchQuickItems()
      ]);
      set({ initialized: true });
    },

    async fetchList() {
      const { filters, pagination } = get();
      set({ loading: true, error: undefined });
      try {
        const result = await catatanService.search(filters, pagination.page, pagination.limit);
        set((state) => ({
          items: result.data,
          loading: false,
          pagination: {
            ...state.pagination,
            ...result.pagination
          }
        }));
        const selectedId = get().selectedId;
        if (selectedId) {
          const match = result.data.find((item) => item.id === selectedId);
          if (match) {
            set({ selected: match });
          }
        }
      } catch (error: any) {
        set({ loading: false, error: error?.message || 'Gagal memuat catatan' });
        throw error;
      }
    },

    async fetchStats() {
      set({ statsLoading: true });
      try {
        const stats = await catatanService.getStats();
        set({ stats, statsLoading: false });
      } catch (error: any) {
        set({ statsLoading: false, error: error?.message || 'Gagal memuat statistik catatan' });
      }
    },

    async fetchReminders() {
      set({ reminderLoading: true });
      try {
        const data = await catatanService.getWithReminder(20);
        set({ reminderItems: data, reminderLoading: false });
      } catch (error: any) {
        set({ reminderLoading: false, error: error?.message || 'Gagal memuat catatan dengan pengingat' });
      }
    },

    async fetchQuickItems() {
      set({ quickLoading: true });
      try {
        const data = await catatanService.getRecent(6);
        set({ quickItems: data, quickLoading: false });
      } catch (error: any) {
        set({ quickLoading: false, error: error?.message || 'Gagal memuat catatan terbaru' });
      }
    },

    setFilters(partial) {
      set((state) => ({
        filters: { ...state.filters, ...partial },
        pagination: { ...state.pagination, page: 1 }
      }));
    },

    resetFilters() {
      set({ filters: defaultFilters, pagination: { ...defaultPagination } });
    },

    setPage(page) {
      set((state) => ({ pagination: { ...state.pagination, page } }));
    },

    setLimit(limit) {
      set((state) => ({ pagination: { ...state.pagination, limit, page: 1 } }));
    },

    async selectCatatan(id) {
      if (!id) {
        set({ selectedId: undefined, selected: undefined });
        return;
      }
      set({ selectedId: id, selectedLoading: true });
      try {
        const existing = get().items.find((item) => item.id === id);
        if (existing) {
          set({ selected: existing, selectedLoading: false });
          return;
        }
        const record = await catatanService.getById(id);
        set({ selected: record, selectedLoading: false });
      } catch (error: any) {
        set({ selectedLoading: false, error: error?.message || 'Gagal memuat detail catatan' });
      }
    },

    async createCatatan(payload) {
      const record = await catatanService.create(payload);
      set((state) => {
        const shouldInclude = recordMatchesFilters(record, state.filters);
        const items = shouldInclude ? [record, ...state.items] : state.items;
        const pagination = {
          ...state.pagination,
          total: state.pagination.total + 1
        };
        const quickItems = [record, ...state.quickItems].slice(0, 6);
        return { items, pagination, quickItems };
      });
      await get().fetchStats();
      await get().fetchReminders();
      return record;
    },

    async updateCatatan(id, payload) {
      const updated = await catatanService.update(id, payload);
      set((state) => {
        const shouldInclude = recordMatchesFilters(updated, state.filters);
        let items = state.items.slice();
        const index = items.findIndex((item) => item.id === id);
        if (index >= 0) {
          if (shouldInclude) {
            items[index] = updated;
          } else {
            items.splice(index, 1);
          }
        } else if (shouldInclude) {
          items = [updated, ...items];
        }
        const quickItems = [updated, ...state.quickItems.filter((item) => item.id !== id)].slice(0, 6);
        const reminderItems = state.reminderItems.filter((item) => item.id !== id);
        if (updated.reminder_pada) {
          reminderItems.unshift(updated);
        }
        return {
          items,
          quickItems,
          reminderItems,
          selected: state.selectedId === id ? updated : state.selected
        };
      });
      await get().fetchStats();
      return updated;
    },

    async deleteCatatan(id) {
      await catatanService.remove(id);
      set((state) => {
        const items = state.items.filter((item) => item.id !== id);
        const quickItems = state.quickItems.filter((item) => item.id !== id);
        const reminderItems = state.reminderItems.filter((item) => item.id !== id);
        const pagination = {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1)
        };
        const selectedCleared = state.selectedId === id ? { selectedId: undefined, selected: undefined } : {};
        return {
          items,
          quickItems,
          reminderItems,
          pagination,
          ...selectedCleared
        };
      });
      await Promise.all([get().fetchStats(), get().fetchReminders()]);
    },

    upsertFromRealtime(record) {
      set((state) => {
        const shouldInclude = recordMatchesFilters(record, state.filters);
        let items = state.items.slice();
        const index = items.findIndex((item) => item.id === record.id);
        if (index >= 0) {
          if (shouldInclude) {
            items[index] = record;
          } else {
            items.splice(index, 1);
          }
        } else if (shouldInclude) {
          items = [record, ...items];
        }
        const quickItems = [record, ...state.quickItems.filter((item) => item.id !== record.id)].slice(0, 6);
        const reminderItems = state.reminderItems.filter((item) => item.id !== record.id);
        if (record.reminder_pada) {
          reminderItems.unshift(record);
        }
        return {
          items,
          quickItems,
          reminderItems,
          selected: state.selectedId === record.id ? record : state.selected
        };
      });
    },

    removeFromRealtime(id) {
      set((state) => {
        const items = state.items.filter((item) => item.id !== id);
        const quickItems = state.quickItems.filter((item) => item.id !== id);
        const reminderItems = state.reminderItems.filter((item) => item.id !== id);
        const pagination = {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1)
        };
        const selectedCleared = state.selectedId === id ? { selectedId: undefined, selected: undefined } : {};
        return {
          items,
          quickItems,
          reminderItems,
          pagination,
          ...selectedCleared
        };
      });
    }
  }))
);
