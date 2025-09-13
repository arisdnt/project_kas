import { useState } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useToast } from '@/core/hooks/use-toast'
import { usePembelianStore, usePembelianTotals } from '@/features/pembelian/store/pembelianStore'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { useAuthStore } from '@/core/store/authStore'

export function RestockSummary() {
  const { toast } = useToast()
  const { subtotal, itemCount } = usePembelianTotals()
  const items = usePembelianStore((s) => s.items)
  const clear = usePembelianStore((s) => s.clear)
  // gunakan setter global dari zustand untuk update cache produk
  const token = useAuthStore((s) => s.token)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const disabled = items.length === 0 || saving

  const API_BASE = 'http://localhost:3000/api/produk'

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  })

  const onConfirm = async () => {
    setSaving(true)
    try {
      const produkState = useProdukStore.getState()
      const updates = items.map(async (it) => {
        const p = produkState.items.find((x) => x.id === it.id)
        const currentStok = Number(p?.stok || 0)
        const currentHarga = Number(p?.harga || 0)
        const newJumlah = currentStok + Number(it.qty || 0)

        const res = await fetch(`${API_BASE}/inventaris`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            id_produk: it.id,
            jumlah: newJumlah,
            harga: currentHarga,
            harga_beli: Number(it.hargaBeli || 0),
          }),
        })
        const js = await res.json()
        if (!res.ok || !js.success) {
          throw new Error(js?.message || 'Gagal menyimpan pembelian')
        }
      })

      await Promise.all(updates)

      // Update cache produk secara lokal agar sinkron
      const curr = useProdukStore.getState().items
      const next = curr.map((p) => {
        const hit = items.find((it) => it.id === p.id)
        if (!hit) return p
        const stokBaru = Number(p.stok || 0) + hit.qty
        return { ...p, stok: stokBaru, hargaBeli: Number(hit.hargaBeli || p.hargaBeli || 0) }
      })
      useProdukStore.setState({ items: next })

      clear()
      setOpen(false)
      toast({ title: 'Pembelian disimpan', description: `Total nilai: ${formatCurrency(subtotal)}` })
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan', description: e?.message || 'Terjadi kesalahan', variant: 'destructive' as any })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Item</span>
          <span className="font-medium">{itemCount}</span>
        </div>
        <div className="flex items-center justify-between text-base">
          <span className="font-semibold text-gray-900">Total Pembelian</span>
          <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
        </div>

        <AlertDialog.Root open={open} onOpenChange={setOpen}>
          <AlertDialog.Trigger asChild>
            <Button className="w-full" disabled={disabled}>
              {saving ? 'Menyimpan...' : 'Simpan Pembelian'}
            </Button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/30" />
            <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-lg bg-white p-5 shadow-xl border">
              <AlertDialog.Title className="text-lg font-semibold">Konfirmasi Simpan</AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-gray-600 mt-1">
                Simpan {itemCount} item pembelian dengan total {formatCurrency(subtotal)}?
              </AlertDialog.Description>
              <div className="h-px bg-gray-200 my-4" />
              <div className="flex justify-end gap-2">
                <AlertDialog.Cancel asChild>
                  <Button variant="secondary" disabled={saving}>Batal</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button onClick={onConfirm} disabled={saving}>{saving ? 'Menyimpan...' : 'Konfirmasi'}</Button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </CardContent>
    </Card>
  )
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n)
}
