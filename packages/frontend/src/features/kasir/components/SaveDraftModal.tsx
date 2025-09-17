import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { Label } from '@/core/components/ui/label'
import { Save, FileText } from 'lucide-react'

interface SaveDraftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { name: string; notes?: string }) => void
  defaultName?: string
  isLoading?: boolean
}

export function SaveDraftModal({
  open,
  onOpenChange,
  onSave,
  defaultName,
  isLoading = false
}: SaveDraftModalProps) {
  const [name, setName] = useState(defaultName || '')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<{ name?: string }>({})

  // Reset form saat modal dibuka/ditutup
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName(defaultName || '')
      setNotes('')
      setErrors({})
    }
    onOpenChange(newOpen)
  }

  const validateForm = () => {
    const newErrors: { name?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Nama draft harus diisi'
    } else if (name.trim().length < 3) {
      newErrors.name = 'Nama draft minimal 3 karakter'
    } else if (name.trim().length > 50) {
      newErrors.name = 'Nama draft maksimal 50 karakter'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const trimmedName = name.trim()
    const trimmedNotes = notes.trim()

    onSave({
      name: trimmedName,
      notes: trimmedNotes || undefined
    })

    // Reset form after save
    setName('')
    setNotes('')
    setErrors({})
    onOpenChange(false)
  }

  const generateDefaultName = () => {
    const now = new Date()
    const date = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
    const time = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
    return `Draft ${date} ${time}`
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Simpan Draft Transaksi
          </DialogTitle>
          <DialogDescription>
            Simpan transaksi saat ini sebagai draft untuk dilanjutkan nanti.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nama Draft */}
          <div className="space-y-2">
            <Label htmlFor="draft-name" className="text-sm font-medium">
              Nama Draft <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="draft-name"
                placeholder="Masukkan nama untuk draft ini..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                maxLength={50}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-400">{name.length}/50</span>
              </div>
            </div>
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setName(generateDefaultName())}
                className="text-xs"
              >
                <FileText className="h-3 w-3 mr-1" />
                Nama Otomatis
              </Button>
            </div>
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <Label htmlFor="draft-notes" className="text-sm font-medium">
              Catatan (Opsional)
            </Label>
            <Textarea
              id="draft-notes"
              placeholder="Tambahkan catatan untuk draft ini (misalnya: untuk pelanggan VIP, promo khusus, dll.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={200}
              className="resize-none"
            />
            <div className="text-right">
              <span className="text-xs text-gray-400">{notes.length}/200</span>
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Preview Draft</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Nama: <span className="font-medium">{name || '(belum diisi)'}</span></div>
              <div>Waktu: <span className="font-medium">{new Date().toLocaleString('id-ID')}</span></div>
              {notes && (
                <div>Catatan: <span className="font-medium">{notes}</span></div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Draft
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}