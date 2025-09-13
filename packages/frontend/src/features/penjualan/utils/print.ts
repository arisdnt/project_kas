import { config } from '@/core/config'
import { useAuthStore } from '@/core/store/authStore'
import { SaleTransaction } from '../types'

export async function printStrukFromServer(trxId: number): Promise<boolean> {
  try {
    const token = useAuthStore.getState().token
    const res = await fetch(`${config.api.url}:${config.api.port}/api/penjualan/${trxId}/cetak-struk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    if (!res.ok) throw new Error('Gagal cetak')
    const text = await res.text()
    const w = window.open('', '_blank')
    if (!w) return false
    w.document.write(`<pre style="font: 12px/1.4 ui-monospace, SFMono-Regular; white-space: pre-wrap;">${text}</pre>`)
    w.document.close()
    w.focus()
    w.print()
    return true
  } catch {
    return false
  }
}

export function previewStrukFallback(tx: SaleTransaction) {
  const lines = tx.lines
    .map((l) => `${l.productName} ${l.qty}${l.unit} x Rp${l.price.toLocaleString('id-ID')}\n  Sub: Rp${(l.price * l.qty).toLocaleString('id-ID')} Disk: Rp${l.discount.toLocaleString('id-ID')} Pajak: Rp${l.tax.toLocaleString('id-ID')}\n  Total: Rp${l.total.toLocaleString('id-ID')}`)
    .join('\n')
  const total = tx.lines.reduce((a, b) => a + b.total, 0)
  const text = `KasirPro\nKode: ${tx.code}\nTanggal: ${tx.date} ${tx.time || ''}\nKasir: ${tx.cashier}\nMetode: ${tx.payment}\n\n${lines}\n\nGrand Total: Rp${total.toLocaleString('id-ID')}`
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<pre style="font: 12px/1.4 ui-monospace, SFMono-Regular; white-space: pre-wrap;">${text}</pre>`)
  w.document.close()
  w.focus()
}

