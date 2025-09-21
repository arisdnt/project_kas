import { useEffect } from 'react'
import { Dialog, DialogContentNative, DialogDescription, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { Button } from '@/core/components/ui/button'
import { Keyboard, X } from 'lucide-react'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const shortcuts = [
    { key: 'F1', description: 'Focus ke form scan barcode/pencarian produk' },
    { key: 'F2', description: 'Focus ke form pencarian pelanggan' },
    { key: 'F3', description: 'Bersihkan/Clear semua cart' },
    { key: 'F4', description: 'Hold transaksi (simpan sementara)' },
    { key: 'F5', description: 'Refresh data produk' },
    { key: 'F6', description: 'Simpan sebagai draft' },
    { key: 'F7', description: 'Lihat daftar draft yang tersimpan' },
    { key: 'F8', description: 'Cetak struk/nota' },
    { key: 'F9', description: 'Proses pembayaran' },
    { key: 'F10', description: 'Tampilkan bantuan shortcut keyboard (modal ini)' },
    { key: 'F12', description: 'Keluar ke dashboard utama' },
  ]

  // Modal-specific keyboard shortcuts (F-keys + Escape to close)
  useEffect(() => {
    if (!open) return

    const handleModalKeyDown = (e: KeyboardEvent) => {
      // Escape closes modal
      if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange(false)
        return
      }

      // Only handle F-keys for the rest
      if (!e.key.startsWith('F')) return

      e.preventDefault()

      switch (e.key) {
        case 'F12':
        case 'F10':
          // Close modal
          onOpenChange(false)
          break
      }
    }

    document.addEventListener('keydown', handleModalKeyDown)
    return () => document.removeEventListener('keydown', handleModalKeyDown)
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentNative className="w-[90vw] max-w-2xl min-w-[600px] h-auto rounded-lg">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Keyboard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Shortcut Keyboard</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Gunakan tombol F1 - F12 untuk navigasi cepat di halaman kasir
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mt-6 space-y-1">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-12 items-center justify-center rounded-md bg-gray-100 border border-gray-200">
                  <span className="text-sm font-mono font-medium text-gray-900">
                    {shortcut.key}
                  </span>
                </div>
                <span className="text-sm text-gray-700">
                  {shortcut.description}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 mt-8">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-5 w-5 items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">🎯 Modal-Specific Shortcuts:</p>
                <ul className="text-blue-800 space-y-1">
                  <li>• <strong>Modal Pembayaran</strong>: F1/F2 metode bayar, F3-F5 nominal cepat, F8/F9 proses</li>
                  <li>• <strong>Modal Draft</strong>: F1-F3 muat draft, F5 refresh, F8 hapus draft</li>
                  <li>• <strong>Semua Modal</strong>: F12 untuk tutup modal</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-5 w-5 items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-green-900 mb-1">✅ Tips Penggunaan Optimal:</p>
                <ul className="text-green-800 space-y-1">
                  <li>• <strong>Shortcut F1-F12 berfungsi dari MANA SAJA</strong> - bahkan saat mengetik!</li>
                  <li>• <strong>Ketika modal terbuka</strong>, shortcut otomatis fokus ke modal tersebut</li>
                  <li>• Tekan F10 kapan saja untuk melihat panduan ini</li>
                  <li>• F9 untuk langsung bayar tanpa perlu keluar dari input terlebih dahulu</li>
                  <li>• F3 untuk clear cart dengan cepat dari input manapun</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            [F10/F12] Tutup Panduan
          </Button>
        </div>
      </DialogContentNative>
    </Dialog>
  )
}