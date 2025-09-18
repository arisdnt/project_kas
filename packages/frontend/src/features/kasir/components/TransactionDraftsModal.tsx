import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/core/components/ui/sheet'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import {
  FileText,
  Clock,
  ShoppingCart,
  DollarSign,
  Trash2,
  Copy,
  Search,
  Calendar,
  User,
  CheckCircle2,
  X
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

  useEffect(() => {
    if (!selectedDraft) return
    const exists = drafts.some(draft => draft.id === selectedDraft.id)
    if (!exists) {
      setSelectedDraft(null)
    }
  }, [drafts, selectedDraft])

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
      onDuplicateDraft(draftId)
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
  const totalNominal = filteredDrafts.reduce((sum, draft) => sum + draft.totalAmount, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-6 overflow-hidden p-0 sm:w-[480px] sm:max-w-[480px] lg:w-[40vw] lg:max-w-[40vw] lg:min-w-[360px]"
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="px-6 pt-6">
            <SheetHeader className="space-y-1 text-left">
              <SheetTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="h-5 w-5" />
                Draft Transaksi
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-600">
                Kelola draft yang tersimpan dan lanjutkan transaksi kapan saja.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-hidden px-6 pb-6">
            <div className="flex h-full flex-col gap-5">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Cari draft berdasarkan nama, catatan, atau pelanggan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-gray-500">Total Draft</span>
                      <span className="font-semibold text-gray-900">{filteredDrafts.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-gray-500">Potensi Penjualan</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(totalNominal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Daftar Draft</h3>
                    <p className="text-xs text-gray-500">Klik salah satu draft untuk melihat detail lebih lengkap.</p>
                  </div>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {filteredDrafts.length} draft
                  </Badge>
                </div>
                <div className="h-60 overflow-y-auto sm:h-72">
                  {isLoading ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500">
                      <Clock className="h-5 w-5 animate-spin text-gray-400" />
                      <span className="text-sm">Memuat draft...</span>
                    </div>
                  ) : filteredDrafts.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500 px-4 text-center">
                      <FileText className="h-10 w-10 text-gray-300" />
                      <p className="text-sm">
                        {searchTerm ? 'Tidak ada draft yang sesuai pencarian.' : 'Belum ada draft transaksi yang tersimpan.'}
                      </p>
                    </div>
                  ) : (
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-1/3 text-xs uppercase tracking-wide text-gray-500">Nama Draft</TableHead>
                          <TableHead className="text-xs uppercase tracking-wide text-gray-500">Metode</TableHead>
                          <TableHead className="text-xs uppercase tracking-wide text-gray-500">Item</TableHead>
                          <TableHead className="text-xs uppercase tracking-wide text-gray-500">Total</TableHead>
                          <TableHead className="text-xs uppercase tracking-wide text-gray-500">Update</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDrafts.map((draft) => {
                          const isSelected = selectedDraft?.id === draft.id
                          return (
                            <TableRow
                              key={draft.id}
                              onClick={() => setSelectedDraft(draft)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50/80 hover:bg-blue-50' : 'hover:bg-gray-50'
                              }`}
                            >
                              <TableCell className="align-top">
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium text-gray-900 line-clamp-1">{draft.name}</span>
                                  {draft.pelanggan?.nama && (
                                    <span className="text-xs text-gray-500">{draft.pelanggan.nama}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="align-top">
                                <Badge variant="outline" className="text-xs font-medium">
                                  {draft.metode}
                                </Badge>
                              </TableCell>
                              <TableCell className="align-top text-sm text-gray-700">{draft.totalItems} item</TableCell>
                              <TableCell className="align-top text-sm font-semibold text-gray-900">
                                {formatCurrency(draft.totalAmount)}
                              </TableCell>
                              <TableCell className="align-top text-xs text-gray-500">{formatDate(draft.updatedAt)}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                {selectedDraft ? (
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{selectedDraft.name}</h4>
                        <p className="text-[11px] text-gray-500">Terakhir diperbarui {formatDate(selectedDraft.updatedAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[11px] font-medium px-2 py-0.5">
                          {selectedDraft.metode}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSelectedDraft(null)}
                          className="h-7 w-7 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="sr-only">Tutup detail draft</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                      <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 shadow-sm">
                        <ShoppingCart className="h-3.5 w-3.5 text-indigo-500" />
                        <div className="leading-tight">
                          <p className="text-[11px] text-gray-500">Jumlah Item</p>
                          <p className="text-sm font-semibold text-gray-900">{selectedDraft.totalItems}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 shadow-sm">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                        <div className="leading-tight">
                          <p className="text-[11px] text-gray-500">Total</p>
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(selectedDraft.totalAmount)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md bg-white px-3 py-2 shadow-sm">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Dibuat {formatDate(selectedDraft.createdAt)}</span>
                      </div>
                      {selectedDraft.notes && (
                        <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
                          <p className="font-medium text-gray-800">Catatan</p>
                          <p className="mt-1 leading-relaxed">{selectedDraft.notes}</p>
                        </div>
                      )}
                      {selectedDraft.pelanggan && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                          <User className="h-3.5 w-3.5" />
                          <span>Pelanggan: {selectedDraft.pelanggan.nama || 'Member'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 className="mb-1 text-xs font-semibold text-gray-900 uppercase tracking-wide">Item Produk</h5>
                      <ScrollArea className="h-28 rounded-md border border-dashed border-gray-200 bg-white px-3 py-2">
                        <div className="space-y-1.5">
                          {selectedDraft.items.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="flex items-start justify-between text-xs text-gray-700">
                              <div className="flex-1 pr-2">
                                <p className="font-semibold text-gray-900 line-clamp-1">{item.nama}</p>
                                <p className="text-[11px] text-gray-500">Qty {item.qty} × {formatCurrency(item.harga)}</p>
                              </div>
                              <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(item.harga * item.qty)}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <Button onClick={() => handleLoadDraft(selectedDraft)} className="w-full h-9 text-sm">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Muat Draft ke Keranjang
                      </Button>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          variant="outline"
                          onClick={() => handleDuplicateDraft(selectedDraft.id, selectedDraft.name)}
                          className="flex-1 h-9 text-sm"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplikasi
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteDraft(selectedDraft.id, selectedDraft.name)}
                          className="flex-1 h-9 text-sm"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-500">
                    <FileText className="h-10 w-10 text-gray-300" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Pilih draft untuk melihat detail</p>
                      <p className="text-xs text-gray-500">Klik salah satu baris pada tabel di atas untuk memuat informasi lengkap.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
