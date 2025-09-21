import { useState, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { Badge } from '@/core/components/ui/badge'
import { Keyboard, X } from 'lucide-react'

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  // Show help with Ctrl+?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const shortcuts = [
    {
      category: "Pencarian & Input",
      items: [
  { key: "Alt+S", description: "Fokus pencarian produk" },
  { key: "Alt+P", description: "Fokus pencarian pelanggan" },
  { key: "Alt+Q", description: "Bersihkan keranjang" },
  { key: "Alt+C", description: "Buka kalkulator" },
      ]
    },
    {
      category: "Transaksi",
      items: [
  { key: "F8", description: "Tampilkan draft" },
  { key: "F9", description: "Simpan draft" },
  { key: "F10", description: "Cetak struk" },
  { key: "F12", description: "Proses pembayaran" },
      ]
    },
    {
      category: "Navigasi Keranjang",
      items: [
        { key: "Tab", description: "Navigasi antar item" },
        { key: "+", description: "Tambah quantity" },
        { key: "-", description: "Kurangi quantity" },
        { key: "Enter", description: "Edit quantity" },
        { key: "Del", description: "Hapus item" },
      ]
    },
    {
      category: "Navigasi Umum",
      items: [
        { key: "↑↓", description: "Navigasi list pencarian" },
        { key: "Enter", description: "Pilih/Konfirmasi" },
        { key: "Esc", description: "Batal/Tutup" },
        { key: "Ctrl+/", description: "Tampilkan bantuan ini" },
      ]
    }
  ]

  return (
    <>
      {/* Help trigger button - floating */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-white shadow-lg border-gray-300 hover:bg-gray-50"
        title="Keyboard Shortcuts [Ctrl+/]"
      >
        <Keyboard className="h-4 w-4 mr-2" />
        Shortcuts
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts - Halaman Kasir
            </DialogTitle>
            <DialogDescription>
              Daftar lengkap shortcut keyboard untuk operasi kasir tanpa mouse
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {shortcuts.map((category) => (
              <div key={category.category}>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.items.map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{shortcut.description}</span>
                      <Badge variant="secondary" className="font-mono text-xs bg-gray-200 text-gray-800">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-gray-200">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tips Penggunaan:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Gunakan Tab untuk navigasi urut antar elemen</li>
                  <li>• Shortcut tidak aktif saat mengetik di input field</li>
                  <li>• F9 untuk pembayaran cepat tunai, F12 untuk pembayaran normal</li>
                  <li>• Klik pada item keranjang lalu gunakan +/- untuk adjust quantity</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsOpen(false)} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}