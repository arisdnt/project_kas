/**
 * Service Penjualan
 * - Buat transaksi beserta item
 * - Kurangi stok inventaris
 * - Ambil detail transaksi (untuk cetak)
 */

import type { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import { executeTransaction, pool } from '@/core/database/connection'
import { logger } from '@/core/utils/logger'
import { CreateTransaksi, ItemTransaksiInput, TransaksiWithItems } from '../models/Penjualan'

function generateKodeTransaksi(date = new Date()): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const ts = `${yyyy}${mm}${dd}`
  const rnd = Math.floor(Math.random() * 9000 + 1000)
  return `TRX-${ts}-${rnd}`
}

export class PenjualanService {
  static async createTransaksi(
    userId: string,
    tenantId: string,
    payload: CreateTransaksi,
  ): Promise<{ id: string; kode_transaksi: string }> {
    return executeTransaction(async (conn: PoolConnection) => {
      // Hitung total dari payload (dengan harga yang dikirim klien)
      const jumlah_total = payload.items.reduce((s, it) => s + it.harga * it.jumlah, 0)
      const kode = generateKodeTransaksi()

      // Insert transaksi
      const [res] = await conn.execute<ResultSetHeader>(
        `INSERT INTO transaksi (kode_transaksi, id_toko, id_pengguna, id_pelanggan, jumlah_total, metode_pembayaran, status, dibuat_pada)
         VALUES (?, ?, ?, ?, ?, ?, 'selesai', NOW())`,
        [
          kode,
          tenantId,
          userId,
          payload.id_pelanggan || null,
          jumlah_total,
          payload.metode_pembayaran,
        ],
      )
      // Get the uuid of the inserted transaksi
      const [trxRows] = await conn.execute<RowDataPacket[]>(
        'SELECT uuid FROM transaksi WHERE id = ? LIMIT 1',
        [res.insertId],
      )
      const transaksiId: string = (trxRows as any)[0].uuid

      // Insert item_transaksi dan update stok
      for (const item of payload.items) {
        await conn.execute<ResultSetHeader>(
          `INSERT INTO item_transaksi (id_transaksi, id_produk, jumlah, harga_saat_jual) VALUES (?, ?, ?, ?)`,
          [transaksiId, item.id_produk, item.jumlah, item.harga],
        )

        // Kurangi stok inventaris untuk tenant saat ini
        await conn.execute<ResultSetHeader>(
          `UPDATE inventaris SET jumlah = GREATEST(0, jumlah - ?) WHERE id_toko = ? AND id_produk = ?`,
          [item.jumlah, tenantId, item.id_produk],
        )
      }

      logger.info({ transaksiId, kode, userId, tenantId }, 'Transaksi berhasil dibuat')
      return { id: transaksiId, kode_transaksi: kode }
    })
  }

  static async getDetailTransaksi(id: string, tenantId: string): Promise<TransaksiWithItems | null> {
      // Ambil header
      const [trxRows] = await pool.execute<RowDataPacket[]>(
        `SELECT t.uuid as id, t.kode_transaksi, t.id_toko, t.id_pengguna, t.id_pelanggan, t.jumlah_total, t.metode_pembayaran, t.status, t.dibuat_pada
         FROM transaksi t WHERE t.uuid = ? AND t.id_toko = ?`,
        [id, tenantId],
      )
      if (trxRows.length === 0) return null

      // Ambil items join produk
      const [itemRows] = await pool.execute<RowDataPacket[]>(
        `SELECT it.id, it.id_transaksi, it.id_produk, it.jumlah, it.harga_saat_jual,
                p.nama, p.sku
           FROM item_transaksi it
           JOIN produk p ON p.uuid = it.id_produk
          WHERE it.id_transaksi = ?`,
        [id],
      )

      // Ambil pelanggan (opsional)
      let pelanggan: { id: string; nama?: string | null; telepon?: string | null } | null = null
      const pelId = trxRows[0].id_pelanggan as string | null
      if (pelId != null) {
        const [pelRows] = await pool.execute<RowDataPacket[]>(
          `SELECT uuid as id, nama, telepon FROM pelanggan WHERE uuid = ? AND id_toko = ?`,
          [pelId, tenantId],
        )
        if (pelRows.length > 0) {
          pelanggan = { id: pelRows[0].id, nama: pelRows[0].nama, telepon: pelRows[0].telepon }
        }
      }

      const items = itemRows.map((r: any) => ({
        id_produk: r.id_produk,
        nama: r.nama as string,
        sku: r.sku as string | null,
        jumlah: Number(r.jumlah),
        harga_saat_jual: Number(r.harga_saat_jual),
        subtotal: Number(r.jumlah) * Number(r.harga_saat_jual),
      }))

      const trx: TransaksiWithItems = {
        id: trxRows[0].id,
        kode_transaksi: trxRows[0].kode_transaksi,
        id_toko: trxRows[0].id_toko,
        id_pengguna: trxRows[0].id_pengguna,
        id_pelanggan: trxRows[0].id_pelanggan ?? null,
        jumlah_total: Number(trxRows[0].jumlah_total),
        metode_pembayaran: trxRows[0].metode_pembayaran,
        status: trxRows[0].status,
        dibuat_pada: trxRows[0].dibuat_pada,
        items,
        pelanggan,
      }
      return trx
  }

  static formatStrukText(detail: TransaksiWithItems, tokoInfo?: { nama?: string; alamat?: string }): string {
    const lines: string[] = []
    if (tokoInfo?.nama) lines.push(tokoInfo.nama)
    if (tokoInfo?.alamat) lines.push(tokoInfo.alamat)
    lines.push('------------------------------')
    lines.push(`No: ${detail.kode_transaksi}`)
    lines.push(`Tanggal: ${detail.dibuat_pada}`)
    if (detail.pelanggan?.nama) lines.push(`Pelanggan: ${detail.pelanggan.nama}`)
    lines.push('------------------------------')
    detail.items.forEach((it) => {
      const nama = (it.nama || '').substring(0, 20)
      const qty = String(it.jumlah).padStart(2, ' ')
      const harga = it.harga_saat_jual.toFixed(0).padStart(8, ' ')
      const sub = it.subtotal.toFixed(0).padStart(9, ' ')
      lines.push(`${nama}`)
      lines.push(` ${qty} x ${harga} = ${sub}`)
    })
    lines.push('------------------------------')
    lines.push(`TOTAL: ${detail.jumlah_total.toFixed(0)}`)
    lines.push(`Metode: ${detail.metode_pembayaran}`)
    lines.push('Terima kasih')
    return lines.join('\n')
  }
}
