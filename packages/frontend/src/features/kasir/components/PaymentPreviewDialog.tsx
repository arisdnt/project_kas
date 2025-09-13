import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { Button } from '@/core/components/ui/button'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  data: any | null
  onCloseAndClear: () => void
  onPrint: (data: any) => void
}

export function PaymentPreviewDialog({ open, onOpenChange, data, onCloseAndClear, onPrint }: Props) {
  const handlePrint = () => {
    if (data) onPrint(data)
    onOpenChange(false)
    onCloseAndClear()
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview Invoice {data?.kode_transaksi}</DialogTitle>
        </DialogHeader>
        {data && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Tanggal: {data.dibuat_pada}</div>
            {data.pelanggan?.nama && <div className="text-sm text-gray-600">Pelanggan: {data.pelanggan.nama}</div>}
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr><th className="px-2 py-1 text-left">Item</th><th className="px-2 py-1">Qty</th><th className="px-2 py-1 text-right">Harga</th><th className="px-2 py-1 text-right">Sub</th></tr>
                </thead>
                <tbody>
                  {data.items?.map((it: any) => (
                    <tr key={it.id_produk} className="border-t">
                      <td className="px-2 py-1">{it.nama}</td>
                      <td className="px-2 py-1 text-center">{it.jumlah}</td>
                      <td className="px-2 py-1 text-right">{fmt(Number(it.harga_saat_jual || 0))}</td>
                      <td className="px-2 py-1 text-right">{fmt(Number(it.subtotal || 0))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t">
                  <tr><td className="px-2 py-1" colSpan={3}>TOTAL</td><td className="px-2 py-1 text-right font-semibold">{fmt(Number(data.jumlah_total || 0))}</td></tr>
                </tfoot>
              </table>
            </div>
            <div className="text-xs text-gray-500">Tips: pada dialog printer, pilih "Save as PDF" untuk menyimpan sebagai PDF.</div>
          </div>
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={() => { onOpenChange(false); onCloseAndClear() }}>Tutup</Button>
          <Button onClick={handlePrint}>Cetak / Simpan PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n)
}

