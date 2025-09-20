import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { beritaService } from '@/features/berita/services/beritaService';
import {
  BeritaItem,
  BeritaStats,
  BeritaStatus,
  BeritaTargetTampil,
  BeritaTipe,
  SearchBeritaParams
} from '@/features/berita/types/berita';

export type BeritaFilters = {
  q: string;
  tipeBerita?: BeritaTipe;
  targetTampil?: BeritaTargetTampil;
  prioritas?: 'rendah' | 'normal' | 'tinggi' | 'urgent';
  status?: BeritaStatus;
  jadwalMulaiDari?: string;
  jadwalMulaiSampai?: string;
  sortBy: 'dibuat_pada' | 'jadwal_mulai' | 'prioritas' | 'judul';
  sortOrder: 'asc' | 'desc';
};

type BeritaState = {
  items: BeritaItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error?: string;
  filters: BeritaFilters;
  stats?: BeritaStats;
  statsLoading: boolean;
  activeNews: BeritaItem[];
  activeLoading: boolean;
  lastActiveSync?: number;
  initialized: boolean;
};

type BeritaActions = {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilter: <K extends keyof BeritaFilters>(key: K, value: BeritaFilters[K]) => void;
  resetFilters: () => void;
  fetchBerita: (options?: { page?: number; limit?: number }) => Promise<void>;
  refreshBerita: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchActiveNews: () => Promise<void>;
  createBerita: (payload: Parameters<typeof beritaService.create>[0]) => Promise<BeritaItem>;
  updateBerita: (id: string, payload: Parameters<typeof beritaService.update>[1]) => Promise<BeritaItem>;
  deleteBerita: (id: string) => Promise<void>;
  handleRealtimeUpsert: (payload?: BeritaItem) => Promise<void>;
  handleRealtimeDelete: (id?: string) => Promise<void>;
};

type BeritaStore = BeritaState & BeritaActions;

const defaultFilters: BeritaFilters = {
  q: '',
  sortBy: 'dibuat_pada',
  sortOrder: 'desc'
};

export const useBeritaStore = create<BeritaStore>()(
  devtools((set, get) => ({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    loading: false,
    filters: defaultFilters,
    stats: undefined,
    statsLoading: false,
    activeNews: [],
    activeLoading: false,
    initialized: false,

    setPage: (page) => {
      set({ page });
      get().fetchBerita({ page });
    },

    setLimit: (limit) => {
      set({ limit, page: 1 });
      get().fetchBerita({ page: 1, limit });
    },

    setFilter: (key, value) => {
      const nextFilters = { ...get().filters, [key]: value };
      if (key === 'q' && typeof value === 'string') {
        nextFilters.q = value;
      }
      set({ filters: nextFilters, page: 1 });
      get().fetchBerita({ page: 1 });
    },

    resetFilters: () => {
      set({ filters: defaultFilters, page: 1 });
      get().fetchBerita({ page: 1 });
    },

    fetchBerita: async ({ page, limit } = {}) => {
      const state = get();
      const nextPage = page ?? state.page;
      const nextLimit = limit ?? state.limit;
      const query: SearchBeritaParams = {
        q: state.filters.q || undefined,
        tipeBerita: state.filters.tipeBerita,
        targetTampil: state.filters.targetTampil,
        prioritas: state.filters.prioritas,
        status: state.filters.status,
        jadwalMulaiDari: state.filters.jadwalMulaiDari,
        jadwalMulaiSampai: state.filters.jadwalMulaiSampai,
        sortBy: state.filters.sortBy,
        sortOrder: state.filters.sortOrder,
        page: nextPage,
        limit: nextLimit
      };

      set({ loading: true, error: undefined });
      try {
        const { data, pagination } = await beritaService.search(query);
        set({
          items: data,
          total: pagination.total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: pagination.totalPages,
          loading: false,
          initialized: true
        });
      } catch (error: any) {
        set({ loading: false, error: error?.message || 'Gagal memuat berita' });
      }
    },

    refreshBerita: async () => {
      if (!get().initialized) {
        return get().fetchBerita({ page: 1 });
      }
      return get().fetchBerita();
    },

    fetchStats: async () => {
      set({ statsLoading: true });
      try {
        const stats = await beritaService.getStats();
        set({ stats, statsLoading: false });
      } catch (error: any) {
        set({ statsLoading: false, error: error?.message || 'Gagal memuat statistik berita' });
      }
    },

    fetchActiveNews: async () => {
      set({ activeLoading: true });
      try {
        const data = await beritaService.getActiveNews();
        set({ activeNews: data, activeLoading: false, lastActiveSync: Date.now() });
      } catch (error: any) {
        set({ activeLoading: false, error: error?.message || 'Gagal memuat berita aktif' });
      }
    },

    createBerita: async (payload) => {
      const result = await beritaService.create(payload);
      await Promise.allSettled([
        get().fetchBerita({ page: 1 }),
        get().fetchStats(),
        get().fetchActiveNews()
      ]);
      return result;
    },

    updateBerita: async (id, payload) => {
      const result = await beritaService.update(id, payload);
      await Promise.allSettled([
        get().refreshBerita(),
        get().fetchStats(),
        get().fetchActiveNews()
      ]);
      return result;
    },

    deleteBerita: async (id) => {
      await beritaService.remove(id);
      await Promise.allSettled([
        get().refreshBerita(),
        get().fetchStats(),
        get().fetchActiveNews()
      ]);
    },

    handleRealtimeUpsert: async () => {
      await Promise.allSettled([
        get().refreshBerita(),
        get().fetchStats(),
        get().fetchActiveNews()
      ]);
    },

    handleRealtimeDelete: async () => {
      await Promise.allSettled([
        get().refreshBerita(),
        get().fetchStats(),
        get().fetchActiveNews()
      ]);
    }
  }))
);
