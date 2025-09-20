import { useEffect, useState } from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { NavbarService, NavbarInfo } from '@/core/services/navbarService';
import { config } from '@/core/config';

// State untuk hook navbar
interface NavbarState {
  tenantName: string;
  tokoName: string;
  displayText: string;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook untuk mengelola data navbar
 * Menggunakan API navbar yang baru dibuat
 */
export function useNavbarData() {
  const { token } = useAuthStore();
  const [state, setState] = useState<NavbarState>({
    tenantName: '-',
    tokoName: config.infoToko.nama,
    displayText: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchNavbarData() {
      if (!token) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Token tidak tersedia',
        }));
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Menggunakan API navbar/info yang menggabungkan data toko dan tenant
        const navbarInfo: NavbarInfo = await NavbarService.getNavbarInfo(token);

        if (!cancelled) {
          setState({
            tenantName: navbarInfo.tenant.nama || '-',
            tokoName: navbarInfo.toko.nama || config.infoToko.nama,
            displayText: navbarInfo.displayText || '',
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching navbar data:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Gagal memuat data navbar',
          }));
        }
      }
    }

    fetchNavbarData();

    return () => {
      cancelled = true;
    };
  }, [token]);

  /**
   * Fungsi untuk refresh data navbar
   */
  const refreshNavbarData = async () => {
    if (!token) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const navbarInfo: NavbarInfo = await NavbarService.getNavbarInfo(token);
      
      setState({
        tenantName: navbarInfo.tenant.nama || '-',
        tokoName: navbarInfo.toko.nama || config.infoToko.nama,
        displayText: navbarInfo.displayText || '',
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error refreshing navbar data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal refresh data navbar',
      }));
    }
  };

  return {
    ...state,
    refreshNavbarData,
  };
}