import { useEffect } from 'react'
import { socket, ensureConnected } from '@/core/socket'
import { useProdukStore, UIProduk } from '@/features/produk/store/produkStore'

/**
 * Subscribe realtime events for produk and inventaris.
 * Backend may not emit yet; this is forward-compatible and safe.
 */
export function useProdukRealtime() {
  const upsert = useProdukStore((s) => s.upsertFromRealtime)
  const remove = useProdukStore((s) => s.removeFromRealtime)

  useEffect(() => {
    ensureConnected()

    const onCreated = (payload: any) => {
      const mapped: UIProduk = {
        id: payload.id,
        nama: payload.nama,
        sku: payload.sku,
      }
      upsert(mapped)
    }
    const onUpdated = (payload: any) => {
      const mapped: UIProduk = {
        id: payload.id,
        nama: payload.nama,
        sku: payload.sku,
      }
      upsert(mapped)
    }
    const onDeleted = (payload: any) => {
      if (payload?.id) remove(Number(payload.id))
    }
    const onInventaris = (payload: any) => {
      if (!payload?.id_produk) return
      upsert({
        id: Number(payload.id_produk),
        nama: '',
        harga: payload.harga != null ? Number(payload.harga) : undefined,
        hargaBeli: payload.harga_beli != null ? Number(payload.harga_beli) : undefined,
        stok: payload.jumlah != null ? Number(payload.jumlah) : undefined,
      })
    }

    socket.on('produk:created', onCreated)
    socket.on('produk:updated', onUpdated)
    socket.on('produk:deleted', onDeleted)
    socket.on('inventaris:updated', onInventaris)

    return () => {
      socket.off('produk:created', onCreated)
      socket.off('produk:updated', onUpdated)
      socket.off('produk:deleted', onDeleted)
      socket.off('inventaris:updated', onInventaris)
    }
  }, [upsert, remove])
}

