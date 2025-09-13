import { create } from 'zustand'
import { ReturPembelianItem, ReturPembelianFilter, ReturPembelianSummary, ReturPembelianSortBy, SortDirection } from '../types/returPembelian'

interface ReturPembelianState {
  // Data state
  items: ReturPembelianItem[]
  summary: ReturPembelianSummary | null
  loading: boolean
  error: string | null
  
  // UI state
  selectedId: number | null
  isFormOpen: boolean
  isDetailOpen: boolean
  editingItem: ReturPembelianItem | null
  
  // Filter & Pagination
  filter: ReturPembelianFilter
  sortBy: ReturPembelianSortBy
  sortDirection: SortDirection
  page: number
  limit: number
  total: number
  
  // Actions
  setItems: (items: ReturPembelianItem[]) => void
  setSummary: (summary: ReturPembelianSummary) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  setSelectedId: (id: number | null) => void
  setFormOpen: (open: boolean) => void
  setDetailOpen: (open: boolean) => void
  setEditingItem: (item: ReturPembelianItem | null) => void
  
  setFilter: (filter: Partial<ReturPembelianFilter>) => void
  setSort: (sortBy: ReturPembelianSortBy, direction: SortDirection) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setTotal: (total: number) => void
  
  // Data operations
  addItem: (item: ReturPembelianItem) => void
  updateItem: (id: number, updates: Partial<ReturPembelianItem>) => void
  removeItem: (id: number) => void
  
  // Reset
  reset: () => void
  resetFilter: () => void
}

const initialState = {
  items: [],
  summary: null,
  loading: false,
  error: null,
  selectedId: null,
  isFormOpen: false,
  isDetailOpen: false,
  editingItem: null,
  filter: {},
  sortBy: 'created_at' as ReturPembelianSortBy,
  sortDirection: 'desc' as SortDirection,
  page: 1,
  limit: 20,
  total: 0,
}

export const useReturPembelianStore = create<ReturPembelianState>((set, get) => ({
  ...initialState,
  
  // Setters
  setItems: (items) => set({ items }),
  setSummary: (summary) => set({ summary }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  setSelectedId: (selectedId) => set({ selectedId }),
  setFormOpen: (isFormOpen) => set({ isFormOpen }),
  setDetailOpen: (isDetailOpen) => set({ isDetailOpen }),
  setEditingItem: (editingItem) => set({ editingItem }),
  
  setFilter: (filter) => set((state) => ({ 
    filter: { ...state.filter, ...filter },
    page: 1 // Reset page when filter changes
  })),
  
  setSort: (sortBy, sortDirection) => set({ sortBy, sortDirection }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
  setTotal: (total) => set({ total }),
  
  // Data operations
  addItem: (item) => set((state) => ({
    items: [item, ...state.items]
  })),
  
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
  })),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  
  // Reset
  reset: () => set(initialState),
  resetFilter: () => set((state) => ({
    filter: {},
    page: 1,
    sortBy: 'created_at' as ReturPembelianSortBy,
    sortDirection: 'desc' as SortDirection
  })),
}))