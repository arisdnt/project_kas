import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { KasirLayout } from '@/features/kasir/components/KasirLayout'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { useAuthStore } from '@/core/store/authStore'
import { useDataRefresh } from '@/core/hooks/useDataRefresh'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { ShieldAlert, Users, Loader2 } from 'lucide-react'

export function KasirPageNew() {
  const navigate = useNavigate()

  // Store hooks
  const {
    initSession,
    refreshSession,
    loadSummary,
    isLoading: kasirLoading,
    needsStore
  } = useKasirStore()

  const { loadFirst } = useProdukStore()
  const { isAuthenticated, user } = useAuthStore()

  // Permission check
  const userLevel = user?.level
  const isAllowedLevel = userLevel === 3 || userLevel === 4

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      loadFirst(),
      refreshSession(),
      loadSummary()
    ])
  }, [loadFirst, refreshSession, loadSummary])

  // Data refresh hook
  useDataRefresh(handleRefresh)

  // Initialize kasir session
  useEffect(() => {
    if (isAuthenticated && isAllowedLevel) {
      if ((window as any).__kasirInitRan) return
      ;(window as any).__kasirInitRan = true

      const initializeKasir = async () => {
        try {
          await Promise.all([
            initSession(),
            loadSummary(),
            loadFirst()
          ])
        } catch (error) {
          console.error('Failed to initialize kasir:', error)
        }
      }

      initializeKasir()
    }
  }, [isAuthenticated, isAllowedLevel, initSession, loadSummary, loadFirst])

  // Keyboard shortcuts are handled by KasirShortcuts inside KasirLayout, scoped to this page

  // Permission denied view
  if (!isAllowedLevel) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-3rem)] w-full flex-col bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="flex flex-col gap-6 text-slate-900">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-blue-600 uppercase">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 animate-pulse">
                <ShieldAlert className="h-3.5 w-3.5" />
              </span>
              Notifikasi Akses
            </span>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                Akses Terbatas untuk Halaman Kasir
              </h1>
              <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
                Halaman kasir hanya tersedia untuk Admin Toko (Level 3) dan Kasir (Level 4).
                Hubungi administrator untuk memperbarui hak akses Anda.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>Peran yang diizinkan:</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                  Level 3 · Admin Toko
                </Badge>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                  Level 4 · Kasir
                </Badge>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-slate-500">Hak akses diperlukan: Admin Toko atau Kasir</span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Kembali ke Dashboard
                </Button>
                <Button
                  onClick={() => navigate('/dashboard/profilsaya')}
                  className="bg-blue-600 text-white shadow-sm hover:bg-blue-500"
                >
                  Lihat Profil Saya
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Store selection needed
  if (needsStore) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Pilih Toko</h2>
        <p className="text-sm text-gray-600 max-w-xl">
          Anda belum memiliki konteks toko aktif. Hubungi administrator untuk diberikan akses ke toko.
        </p>
        <Button
          variant="outline"
          onClick={() => initSession()}
          disabled={kasirLoading}
        >
          {kasirLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Refresh Daftar Toko
        </Button>
      </div>
    )
  }

  // Main kasir interface
  return (
    <div className="w-full h-screen overflow-hidden">
      <KasirLayout />
    </div>
  )
}