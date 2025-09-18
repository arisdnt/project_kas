/**
 * Scope Store
 * Zustand store for managing tenant and store scope data
 */

import { create } from 'zustand';
import api from '@/core/lib/api';

interface Tenant {
  id: string;
  nama: string;
  status: string;
  canApplyToAll: boolean;
}

interface Store {
  id: string;
  nama: string;
  tenant_id: string;
  status: string;
  canApplyToAll: boolean;
}

interface ScopeCapabilities {
  canSelectTenant: boolean;
  canSelectStore: boolean;
  canApplyToAllTenants: boolean;
  canApplyToAllStores: boolean;
  level: number;
  isGod: boolean;
  currentTenantId: string;
  currentStoreId?: string;
}

interface ScopeState {
  capabilities: ScopeCapabilities | null;
  tenants: Tenant[];
  stores: Store[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchCapabilities: () => Promise<void>;
  fetchTenants: () => Promise<void>;
  fetchStores: (tenantId?: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useScopeStore = create<ScopeState>((set, get) => ({
  capabilities: null,
  tenants: [],
  stores: [],
  loading: false,
  error: null,

  fetchCapabilities: async () => {
    try {
      set({ loading: true, error: null });

      const response = await api.get('/scope/capabilities');

      if (response.success) {
        set({
          capabilities: response.data,
          loading: false
        });
      } else {
        throw new Error(response.message || 'Failed to fetch capabilities');
      }
    } catch (error: any) {
      console.error('Error fetching capabilities:', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch capabilities',
        loading: false
      });
    }
  },

  fetchTenants: async () => {
    try {
      set({ loading: true, error: null });

      const response = await api.get('/scope/tenants');

      if (response.success) {
        set({
          tenants: response.data,
          loading: false
        });
      } else {
        throw new Error(response.message || 'Failed to fetch tenants');
      }
    } catch (error: any) {
      console.error('Error fetching tenants:', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch tenants',
        loading: false
      });
    }
  },

  fetchStores: async (tenantId?: string) => {
    try {
      set({ loading: true, error: null });

      const params = tenantId ? { tenantId } : {};
      const response = await api.get('/scope/stores', params);

      if (response.success) {
        set({
          stores: response.data,
          loading: false
        });
      } else {
        throw new Error(response.message || 'Failed to fetch stores');
      }
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch stores',
        loading: false
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      capabilities: null,
      tenants: [],
      stores: [],
      loading: false,
      error: null
    });
  }
}));