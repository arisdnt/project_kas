import { useEffect, useRef } from 'react';
import { useToast } from './use-toast';

/**
 * Hook for handling data refresh functionality across dashboard pages
 * Listens for 'app:refresh' custom events and provides refresh capabilities
 *
 * Features:
 * - Handles navbar refresh button clicks via custom events
 * - Shows loading toast with spinner icon during refresh
 * - Shows success notification (green) when refresh completes
 * - Shows error notification (red) when refresh fails with specific error messages
 * - Prevents multiple simultaneous refreshes
 *
 * Usage:
 * ```typescript
 * const handleRefresh = useCallback(async () => {
 *   await loadData() // Your data loading function
 * }, [loadData])
 *
 * useDataRefresh(handleRefresh)
 * ```
 */
export function useDataRefresh(refreshHandler?: () => Promise<void> | void) {
  const { toast } = useToast();
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    const handleRefresh = async () => {
      // Prevent multiple simultaneous refreshes
      if (isRefreshingRef.current || !refreshHandler) return;

      isRefreshingRef.current = true;

      try {
        // Show loading toast
        const loadingToast = toast({
          title: "🔄 Menyegarkan data...",
          description: "Memuat ulang data terbaru dari server",
          duration: Infinity, // Keep loading toast until dismissed
        });

        // Execute the refresh handler
        await refreshHandler();

        // Dismiss loading toast and show success
        loadingToast.dismiss();

        toast({
          title: "✅ Data berhasil diperbarui",
          description: "Semua data telah dimuat ulang dengan data terbaru",
          duration: 3000,
        });

      } catch (error) {
        console.error('Error refreshing data:', error);

        // Dismiss loading toast first
        loadingToast.dismiss();

        // Determine error message based on error type
        let errorMessage = "Terjadi kesalahan saat memuat ulang data. Periksa koneksi internet Anda dan coba lagi.";

        if (error instanceof Error) {
          if (error.message.includes('Network')) {
            errorMessage = "Koneksi jaringan terputus. Periksa koneksi internet Anda.";
          } else if (error.message.includes('timeout')) {
            errorMessage = "Timeout memuat data. Server tidak merespon dalam waktu yang ditentukan.";
          } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
          } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
            errorMessage = "Anda tidak memiliki akses untuk memuat data ini.";
          } else if (error.message.includes('500')) {
            errorMessage = "Server mengalami gangguan. Silakan coba lagi nanti.";
          }
        }

        toast({
          title: "❌ Gagal memperbarui data",
          description: errorMessage,
          variant: "destructive",
          duration: 8000,
        });
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Listen for custom refresh event
    window.addEventListener('app:refresh', handleRefresh);

    return () => {
      window.removeEventListener('app:refresh', handleRefresh);
    };
  }, [refreshHandler, toast]);

  // Return manual refresh function for components to use directly
  return {
    refreshData: async () => {
      window.dispatchEvent(new CustomEvent('app:refresh'));
    },
    isRefreshing: isRefreshingRef.current
  };
}