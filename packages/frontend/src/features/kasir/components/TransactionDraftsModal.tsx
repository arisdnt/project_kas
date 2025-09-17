import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import {
  FileText,
  Clock,
  ShoppingCart,
  DollarSign,
  Trash2,
  Copy,
  Edit3,
  Search,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { TransactionDraft } from '../hooks/useTransactionDrafts'
import { useToast } from '@/core/hooks/use-toast'

interface TransactionDraftsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  drafts: TransactionDraft[]
  onLoadDraft: (draft: TransactionDraft) => void
  onDeleteDraft: (draftId: string) => void
  onDuplicateDraft: (draftId: string) => void
  isLoading?: boolean
}

export function TransactionDraftsModal({
  open,
  onOpenChange,
  drafts,
  onLoadDraft,
  onDeleteDraft,
  onDuplicateDraft,
  isLoading = false
}: TransactionDraftsModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDraft, setSelectedDraft] = useState<TransactionDraft | null>(null)
  const { toast } = useToast()

  // Filter drafts berdasarkan pencarian
  const filteredDrafts = drafts.filter(draft =>
    draft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.pelanggan?.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Baru saja'
    if (diffInHours < 24) return `${diffInHours} jam lalu`
    if (diffInHours < 48) return 'Kemarin'

    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleLoadDraft = (draft: TransactionDraft) => {
    onLoadDraft(draft)
    onOpenChange(false)
    toast({
      title: '✅ Draft dimuat',
      description: `Draft "${draft.name}" berhasil dimuat ke keranjang`,
      duration: 3000,
    })
  }

  const handleDeleteDraft = (draftId: string, draftName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus draft "${draftName}"?`)) {
      onDeleteDraft(draftId)
      setSelectedDraft(null)
      toast({
        title: '🗑️ Draft dihapus',
        description: `Draft "${draftName}" berhasil dihapus`,
        duration: 3000,
      })
    }
  }

  const handleDuplicateDraft = (draftId: string, draftName: string) => {
    try {
      const newDraftId = onDuplicateDraft(draftId)
      toast({
        title: '📄 Draft diduplikasi',
        description: `Salinan dari "${draftName}" berhasil dibuat`,
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: '❌ Gagal menduplikasi',
        description: 'Terjadi kesalahan saat menduplikasi draft',
        variant: 'destructive',
        duration: 5000,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Draft Transaksi
          </DialogTitle>
          <DialogDescription>
            Kelola dan muat draft transaksi yang telah disimpan sebelumnya
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari draft berdasarkan nama, catatan, atau pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{filteredDrafts.length} draft</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>
                Total: {formatCurrency(filteredDrafts.reduce((sum, d) => sum + d.totalAmount, 0))}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-96">
            {/* Draft List */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Daftar Draft</h3>
              <ScrollArea className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Memuat draft...</div>
                  </div>
                ) : filteredDrafts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mb-2 text-gray-300" />
                    <p className="text-sm">
                      {searchTerm ? 'Tidak ada draft yang ditemukan' : 'Belum ada draft transaksi'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredDrafts.map((draft) => (
                      <div
                        key={draft.id}
                        onClick={() => setSelectedDraft(draft)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedDraft?.id === draft.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                            {draft.name}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {draft.metode}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            <span>{draft.totalItems} item</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-medium">{formatCurrency(draft.totalAmount)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(draft.updatedAt)}</span>
                          </div>
                          {draft.pelanggan && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{draft.pelanggan.nama || 'Member'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Draft Detail & Actions */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Detail Draft</h3>
              <div className="h-80 border border-gray-200 rounded-lg p-4">
                {selectedDraft ? (
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {/* Header Info */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-gray-900">
                          {selectedDraft.name}
                        </h4>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Dibuat: {formatDate(selectedDraft.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>Diperbarui: {formatDate(selectedDraft.updatedAt)}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-gray-600">
                              <ShoppingCart className="h-4 w-4" />
                              <span>{selectedDraft.totalItems} item</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-semibold">{formatCurrency(selectedDraft.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-800">Item Produk</h5>
                        <div className="space-y-1">
                          {selectedDraft.items.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex justify-between text-sm py-1 border-b border-gray-100">
                              <div className="flex-1">
                                <span className="font-medium">{item.nama}</span>
                                <span className="text-gray-500 ml-2">x{item.qty}</span>
                              </div>
                              <span className="font-medium">{formatCurrency(item.harga * item.qty)}</span>
                            </div>
                          ))}
                          {selectedDraft.items.length > 5 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              ... dan {selectedDraft.items.length - 5} item lainnya
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {selectedDraft.notes && (
                        <div className="space-y-1">
                          <h5 className="font-medium text-gray-800">Catatan</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {selectedDraft.notes}
                          </p>
                        </div>
                      )}

                      {/* Customer Info */}
                      {selectedDraft.pelanggan && (
                        <div className="space-y-1">
                          <h5 className="font-medium text-gray-800">Pelanggan</h5>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{selectedDraft.pelanggan.nama || 'Member'}</span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                        <Button
                          onClick={() => handleLoadDraft(selectedDraft)}
                          className="w-full"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Muat Draft ke Keranjang
                        </Button>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleDuplicateDraft(selectedDraft.id, selectedDraft.name)}
                            className="flex-1"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplikasi
                          </Button>

                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteDraft(selectedDraft.id, selectedDraft.name)}
                            className="flex-1"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FileText className="h-12 w-12 mb-2 text-gray-300" />
                    <p className="text-sm">Pilih draft untuk melihat detail</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}