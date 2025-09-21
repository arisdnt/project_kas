import { useState, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Dialog, DialogContentNative, DialogDescription, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Badge } from '@/core/components/ui/badge'
import { FileText, Trash2, ShoppingCart, User, Calendar, Loader2, Eye, Package } from 'lucide-react'
import { useKasirStore, DraftCart } from '@/features/kasir/store/kasirStore'
import { systemDialog } from '@/core/hooks/useSystemDialog'

interface DraftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DraftModal({ open, onOpenChange }: DraftModalProps) {
  const [drafts, setDrafts] = useState<DraftCart[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDraftId, setLoadingDraftId] = useState<string | null>(null)
  const { getAllDrafts, loadDraft, deleteDraft } = useKasirStore()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Baru saja'
    if (diffInMinutes < 60) return `${diffInMinutes}m lalu`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}j lalu`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}h lalu`
  }

  const loadDrafts = async () => {
    setIsLoading(true)
    try {
      const allDrafts = await getAllDrafts()
      setDrafts(allDrafts)
    } catch (error) {
      console.error('Error loading drafts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadDrafts()
    }
  }, [open])

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
        case 'F1':
        case 'F2':
        case 'F3':
        case 'F4':
        case 'F5':
        case 'F6':
          // Load draft by F-key (F1=draft[0], F2=draft[1], etc.)
          const draftIndex = parseInt(e.key.replace('F', '')) - 1
          if (drafts.length > draftIndex && !loadingDraftId) {
            handleLoadDraft(drafts[draftIndex].id)
          }
          break
        case 'F8':
          // Refresh drafts list
          loadDrafts()
          break
        case 'F12':
          // Close modal
          onOpenChange(false)
          break
      }
    }

    document.addEventListener('keydown', handleModalKeyDown)
    return () => document.removeEventListener('keydown', handleModalKeyDown)
  }, [open, drafts, loadingDraftId, onOpenChange])

  const handleLoadDraft = async (draftId: string) => {
    setLoadingDraftId(draftId)
    try {
      await loadDraft(draftId)
      onOpenChange(false)
    } catch (error: any) {
      alert(error.message || 'Gagal memuat draft')
      console.error('Error loading draft:', error)
    } finally {
      setLoadingDraftId(null)
    }
  }

  const handleDeleteDraft = async (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId)
    const draftName = draft?.name || 'Draft'

    const confirmed = await systemDialog.showConfirm(
      'Konfirmasi Hapus Draft',
      `Anda yakin ingin menghapus "${draftName}"? Tindakan ini tidak dapat dibatalkan.`
    )

    if (confirmed) {
      try {
        await deleteDraft(draftId)
        await loadDrafts() // Reload list
      } catch (error: any) {
        await systemDialog.showError(
          'Gagal Menghapus Draft',
          error.message || 'Terjadi kesalahan saat menghapus draft. Silakan coba lagi.'
        )
        console.error('Error deleting draft:', error)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentNative className="w-[95vw] max-w-6xl min-w-[1000px] min-h-[600px] h-auto flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Draft Keranjang Belanja</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola hingga 6 draft tersimpan. Draft terlama akan otomatis terhapus.
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {drafts.length}/6 Draft
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400 border-t pt-2">
            [F1-F6] Muat draft • [F8] Refresh • [Del] Hapus • [F12/Esc] Tutup
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-[400px] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3 text-gray-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Memuat draft...</span>
              </div>
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <div className="text-xl font-medium mb-3">Belum Ada Draft Tersimpan</div>
              <div className="text-sm text-gray-400 max-w-md mx-auto">
                Draft akan muncul di sini setelah Anda menyimpan keranjang belanja dengan menekan F6 atau tombol "Simpan Dulu"
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="border-b-2">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead className="min-w-[200px]">Nama Draft</TableHead>
                    <TableHead className="w-[120px] text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Package className="h-4 w-4" />
                        Items
                      </div>
                    </TableHead>
                    <TableHead className="w-[150px]">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Pelanggan
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Metode</TableHead>
                    <TableHead className="w-[140px] text-right">Total Belanja</TableHead>
                    <TableHead className="w-[140px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Waktu Simpan
                      </div>
                    </TableHead>
                    <TableHead className="w-[140px] text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drafts.map((draft, index) => (
                    <TableRow
                      key={draft.id}
                      className="hover:bg-gray-50 transition-colors"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleLoadDraft(draft.id)
                        } else if (e.key === 'Delete') {
                          e.preventDefault()
                          handleDeleteDraft(draft.id)
                        }
                      }}
                    >
                      <TableCell className="text-center font-mono text-sm text-gray-500">
                        {index < 6 ? `F${index + 1}` : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="truncate">{draft.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {draft.totalItems} item
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {draft.pelanggan ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="text-sm truncate">{draft.pelanggan.nama}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Umum</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={draft.metode === 'TUNAI' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {draft.metode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(draft.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium text-gray-700">
                            {formatRelativeTime(draft.createdAt)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(draft.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleLoadDraft(draft.id)}
                            disabled={loadingDraftId === draft.id}
                            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            {loadingDraftId === draft.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDraft(draft.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <span className="font-medium">Tips:</span> Tekan F1-F6 untuk langsung memuat draft, Delete untuk hapus, Enter untuk muat
            </div>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              <FileText className="h-4 w-4 mr-2" />
              [F12] Tutup
            </Button>
          </div>
        </div>
      </DialogContentNative>
    </Dialog>
  )
}