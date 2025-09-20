import { useState, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { FileText, Trash2, ShoppingCart, User, Calendar, Loader2 } from 'lucide-react'
import { useKasirStore, DraftCart } from '@/features/kasir/store/kasirStore'

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
    if (confirm('Hapus draft ini?')) {
      try {
        await deleteDraft(draftId)
        await loadDrafts() // Reload list
      } catch (error: any) {
        alert(error.message || 'Gagal menghapus draft')
        console.error('Error deleting draft:', error)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Draft Keranjang Belanja
          </DialogTitle>
          <DialogDescription>
            Kelola draft keranjang belanja yang tersimpan. Pilih draft untuk memulihkan transaksi.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Memuat draft...</span>
              </div>
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <div className="text-lg font-medium mb-2">Belum Ada Draft</div>
              <div className="text-sm text-gray-400">
                Draft akan muncul setelah Anda menyimpan keranjang belanja
              </div>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {draft.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(draft.createdAt)}</span>
                        </div>
                        {draft.pelanggan && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate">{draft.pelanggan.nama}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDraft(draft.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <div className="text-gray-600">Items</div>
                      <div className="font-medium flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        {draft.totalItems} item
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Metode</div>
                      <div className="font-medium">{draft.metode}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Total</div>
                      <div className="font-medium text-blue-600">
                        {formatCurrency(draft.totalAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <Button
                      onClick={() => handleLoadDraft(draft.id)}
                      disabled={loadingDraftId === draft.id}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      {loadingDraftId === draft.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Memuat...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Muat ke Keranjang
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}