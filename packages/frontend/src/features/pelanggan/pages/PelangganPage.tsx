import { useState } from 'react'
import { PelangganToolbar } from '@/features/pelanggan/components/PelangganToolbar'
import { PelangganTable } from '@/features/pelanggan/components/PelangganTable'
import { UIPelanggan } from '@/features/pelanggan/types/pelanggan'
import { usePelangganStore } from '@/features/pelanggan/store/pelangganStore'
import { useToast } from '@/core/hooks/use-toast'
import { PelangganEditSidebar } from '@/features/pelanggan/components/PelangganEditSidebar'

export function PelangganPage() {
  const { createPelanggan, updatePelanggan } = usePelangganStore()
  const { toast } = useToast()

  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<UIPelanggan | null>(null)
  const [editing, setEditing] = useState<{
    nama: string
    email?: string
    telepon?: string
    alamat?: string
    tipe: 'reguler' | 'vip' | 'member' | 'wholesale'
  } | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    // Create mode: set editing to null so sidebar renders ScopeSelector
    setEditing(null)
    setSelected(null)
    setEditOpen(true)
  }

  const onView = (p: UIPelanggan) => {
    setSelected(p)
    setDetailOpen(true)
  }

  const onEdit = (p: UIPelanggan) => {
    setSelected(p)
    setEditing({
      nama: p.nama,
      email: p.email,
      telepon: p.telepon,
      alamat: p.alamat,
      tipe: p.tipe,
    })
    setEditOpen(true)
  }

  const onSave = async (data: { nama: string; email?: string; telepon?: string; alamat?: string; tipe: 'reguler' | 'vip' | 'member' | 'wholesale' }) => {
    setSaving(true)
    try {
      if (selected) {
        await updatePelanggan(selected.id, data)
        toast({ title: 'Pelanggan diperbarui' })
      } else {
        await createPelanggan(data)
        toast({ title: 'Pelanggan dibuat' })
      }
      setEditOpen(false)
      setSelected(null)
      setEditing(null)
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan', description: e?.message || 'Terjadi kesalahan' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] py-4 overflow-hidden">
      <div className="mb-3">
        <PelangganToolbar onCreate={openCreate} />
      </div>

      <div className="flex-1 min-h-0">
        <PelangganTable onView={onView} onEdit={onEdit} />
      </div>

      {/* TODO: Add PelangganDetailSidebar component */}
      {detailOpen && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h2 className="text-lg font-semibold mb-4">Detail Pelanggan</h2>
            <div className="space-y-2">
              <div><strong>Kode:</strong> {selected.kode}</div>
              <div><strong>Nama:</strong> {selected.nama}</div>
              <div><strong>Email:</strong> {selected.email || '-'}</div>
              <div><strong>Telepon:</strong> {selected.telepon || '-'}</div>
              <div><strong>Tipe:</strong> {selected.tipe}</div>
              <div><strong>Poin:</strong> {selected.saldo_poin.toLocaleString()}</div>
              <div><strong>Status:</strong> {selected.status}</div>
            </div>
            <button
              onClick={() => setDetailOpen(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <PelangganEditSidebar
        value={editing}
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o)
          if (!o) {
            setSelected(null)
            setEditing(null)
          }
        }}
        onSave={onSave as any}
        isLoading={saving}
      />
    </div>
  )
}

