import { useState } from 'react'
import { PelangganToolbar } from '@/features/pelanggan/components/PelangganToolbar'
import { PelangganTable } from '@/features/pelanggan/components/PelangganTable'
import { UIPelanggan } from '@/features/pelanggan/types/pelanggan'
import { usePelangganStore } from '@/features/pelanggan/store/pelangganStore'
import { useToast } from '@/core/hooks/use-toast'

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
    setEditing({ nama: '', email: '', telepon: '', alamat: '', tipe: 'reguler' })
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

      {/* TODO: Add PelangganEditSidebar component */}
      {editOpen && editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h2 className="text-lg font-semibold mb-4">
              {selected ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input
                  type="text"
                  value={editing.nama}
                  onChange={(e) => setEditing({ ...editing, nama: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nama pelanggan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editing.email || ''}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telepon</label>
                <input
                  type="text"
                  value={editing.telepon || ''}
                  onChange={(e) => setEditing({ ...editing, telepon: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Telepon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipe</label>
                <select
                  value={editing.tipe}
                  onChange={(e) => setEditing({ ...editing, tipe: e.target.value as any })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="reguler">Reguler</option>
                  <option value="vip">VIP</option>
                  <option value="member">Member</option>
                  <option value="wholesale">Wholesale</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => onSave(editing)}
                disabled={saving || !editing.nama}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={() => {
                  setEditOpen(false)
                  setSelected(null)
                  setEditing(null)
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

