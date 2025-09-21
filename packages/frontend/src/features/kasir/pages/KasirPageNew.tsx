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

  // Global keyboard shortcuts
  useEffect(() => {
    if (!isAllowedLevel) return

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only handle F-keys (F1-F12) for global shortcuts
      // Allow F-keys to work even when typing in input fields
      if (!e.key.startsWith('F')) {
        // When no search/autocomplete or modal is open, ArrowUp/ArrowDown should focus cart table for selection
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          const isModalOpen = document.querySelector('[role="dialog"]') !== null
          const isProductDropdownOpen = document.querySelector('[data-product-search-dropdown]') !== null
          const isCustomerComboOpen = (() => {
            const input = document.querySelector('[data-customer-search]') as HTMLInputElement | null
            // consider it open if input has aria-expanded true
            return input?.getAttribute('aria-expanded') === 'true'
          })()
          if (!isModalOpen && !isProductDropdownOpen && !isCustomerComboOpen) {
            // Prevent page scroll
            e.preventDefault()
            // Focus first cart row to enable keyboard navigation across rows
            const firstRow = document.querySelector('[data-cart-row]') as HTMLElement | null
            firstRow?.focus()
          }
        }
        return
      }

      // Check if any modal is open - if so, don't handle global shortcuts
      // Let modal-specific handlers take precedence
      const isModalOpen = document.querySelector('[role="dialog"]') !== null
      if (isModalOpen) {
        return
      }

      // Prevent default browser behavior for F-keys
      e.preventDefault()

      // Helper function to blur current active element for action shortcuts
      const blurCurrentInput = () => {
        if (document.activeElement instanceof HTMLInputElement ||
            document.activeElement instanceof HTMLTextAreaElement) {
          document.activeElement.blur()
        }
      }

      switch (e.key) {
        case 'F1':
          // Focus ke form scan barcode/pencarian produk
          const searchInput = document.querySelector('input[placeholder*="barcode"]') as HTMLInputElement
          searchInput?.focus()
          break
        case 'F2':
          // Focus ke form pencarian pelanggan
          const customerInput = document.querySelector('[data-customer-search]') as HTMLInputElement
          if (customerInput) {
            customerInput.click()
            setTimeout(() => customerInput.focus(), 100)
          }
          break
        case 'F3':
          // Bersihkan/Clear semua cart
          blurCurrentInput()
          const clearButton = document.querySelector('[data-clear-button]') as HTMLButtonElement
          clearButton?.click()
          break
        case 'F4':
          // Hold transaksi
          blurCurrentInput()
          const holdButton = document.querySelector('[data-hold-button]') as HTMLButtonElement
          holdButton?.click()
          break
        case 'F5':
          // Refresh produk/reload data
          blurCurrentInput()
          loadFirst().catch(() => {})
          break
        case 'F6':
          // Simpan sebagai draft
          blurCurrentInput()
          const saveDraftButton = document.querySelector('[data-save-draft-button]') as HTMLButtonElement
          saveDraftButton?.click()
          break
        case 'F7':
          // Lihat daftar draft
          blurCurrentInput()
          const draftsButton = document.querySelector('[data-drafts-button]') as HTMLButtonElement
          draftsButton?.click()
          break
        case 'F8':
          // Cetak struk
          blurCurrentInput()
          const printButton = document.querySelector('[data-print-button]') as HTMLButtonElement
          printButton?.click()
          break
        case 'F9':
          // Proses pembayaran - blur dulu biar fokus ke modal pembayaran
          blurCurrentInput()
          const paymentButton = document.querySelector('[data-payment-button]') as HTMLButtonElement
          paymentButton?.click()
          break
        case 'F10':
          // Help/bantuan shortcut
          blurCurrentInput()
          const helpButton = document.querySelector('[data-help-button]') as HTMLButtonElement
          helpButton?.click()
          break
        case 'F12':
          // Logout/keluar (navigate to dashboard)
          blurCurrentInput()
          navigate('/dashboard')
          break
      }
    }

    // Use capture phase to ensure F-keys are handled before any other handlers
    document.addEventListener('keydown', handleGlobalKeyDown, { capture: true })
    return () => document.removeEventListener('keydown', handleGlobalKeyDown, { capture: true })
  }, [isAllowedLevel, loadFirst, navigate])

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
    <div className="w-full h-[calc(100vh-4rem-3rem)] overflow-hidden">
      <KasirLayout />
    </div>
  )
}