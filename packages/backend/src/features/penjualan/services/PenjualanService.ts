/**
 * Service Penjualan
 * - Buat transaksi beserta item
 * - Kurangi stok inventaris
 * - Ambil detail transaksi (untuk cetak)
 */

import type { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import { executeTransaction, pool } from '@/core/database/connection'
import { logger } from '@/core/utils/logger'
import { CreateTransaksi, TransaksiWithItems } from '../models/Penjualan'
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope'
import { AuthenticatedUser } from '@/features/auth/models/User'

function generateKodeTransaksi(date = new Date()): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const ts = `${yyyy}${mm}${dd}`
  const rnd = Math.floor(Math.random() * 9000 + 1000)
  return `TRX-${ts}-${rnd}`
}

function mapMetodeBayar(m: string): 'tunai' | 'transfer' | 'kartu' | 'kredit' | 'poin' {
  const upper = (m || '').toUpperCase()
  if (upper === 'TUNAI') return 'tunai'
  if (upper === 'TRANSFER') return 'transfer'
  if (upper === 'KARTU') return 'kartu'
  if (upper === 'KREDIT') return 'kredit'
  // QRIS / EWALLET fallback ke transfer
  return 'transfer'
}

export class PenjualanService {
  static async createTransaksi(
    user: AuthenticatedUser,
    scope: AccessScope,
    payload: CreateTransaksi,
  ): Promise<{ id: string; kode_transaksi: string }> {
    if (scope.enforceStore && !scope.storeId) {
      throw new Error('Store ID (tokoId) is required')
    }

    const tokoId = scope.storeId as string
    const tenantId = scope.tenantId
    const penggunaUserId = user.id

    return executeTransaction(async (conn: PoolConnection) => {
      // Cari pengguna_id dari tabel pengguna (FK ke users)
      const [pgRows] = await conn.execute<RowDataPacket[]>(
        'SELECT id FROM pengguna WHERE user_id = ? AND tenant_id = ? LIMIT 1',
        [penggunaUserId, tenantId],
      )
      if (pgRows.length === 0) {
        throw new Error('Pengguna (staff) untuk user ini tidak ditemukan')
      }
      const penggunaId = (pgRows as any)[0].id as string

      // Hitung total dari payload
      const subtotal = payload.items.reduce((s, it) => s + it.harga * it.jumlah, 0)
      const diskon_persen = 0
      const diskon_nominal = 0
      const pajak_persen = 0
      const pajak_nominal = 0
      const total = subtotal - diskon_nominal + pajak_nominal
      const metode_bayar = mapMetodeBayar(payload.metode_pembayaran as any)
      const nomor = generateKodeTransaksi()
      const trxId = require('crypto').randomUUID()

      // Insert transaksi (gunakan UUID yang kita buat)
      await conn.execute<ResultSetHeader>(
        `INSERT INTO transaksi (
           id, tenant_id, toko_id, pengguna_id, pelanggan_id, nomor_transaksi,
           tipe, tanggal, subtotal, diskon_persen, diskon_nominal, pajak_persen, pajak_nominal,
           total, bayar, kembalian, metode_bayar, status, catatan, referensi_transaksi, dibuat_pada
         ) VALUES (
           ?, ?, ?, ?, ?, ?,
           'penjualan', NOW(), ?, ?, ?, ?, ?,
           ?, ?, ?, ?, 'selesai', NULL, NULL, NOW()
         )`,
        [
          trxId, tenantId, tokoId, penggunaId, payload.id_pelanggan || null, nomor,
          subtotal, diskon_persen, diskon_nominal, pajak_persen, pajak_nominal,
          total, payload.bayar || 0, payload.kembalian || 0, metode_bayar,
        ],
      )

      // Insert item_transaksi dan update stok
      for (const item of payload.items) {
        const itemId = require('crypto').randomUUID()
        const lineSubtotal = Number((item.harga * item.jumlah).toFixed(2))
        await conn.execute<ResultSetHeader>(
          `INSERT INTO item_transaksi (id, transaksi_id, produk_id, kuantitas, harga_satuan, diskon_persen, diskon_nominal, subtotal)
           VALUES (?, ?, ?, ?, ?, 0, 0, ?)`,
          [itemId, trxId, item.id_produk, item.jumlah, item.harga, lineSubtotal],
        )

        // Kurangi stok inventaris (stok_tersedia)
        await conn.execute<ResultSetHeader>(
          `UPDATE inventaris SET stok_tersedia = GREATEST(stok_tersedia - ?, 0)
           WHERE toko_id = ? AND produk_id = ?`,
          [item.jumlah, tokoId, item.id_produk],
        )
      }

      logger.info({ transaksiId: trxId, nomor, userId: penggunaUserId, tenantId, tokoId }, 'Transaksi berhasil dibuat')
      return { id: trxId, kode_transaksi: nomor }
    })
  }

  static async getDetailTransaksi(id: string, scope: AccessScope): Promise<TransaksiWithItems | null> {
      // Ambil header dengan scope
      const baseSql = `
        SELECT t.id, t.nomor_transaksi, t.toko_id, t.pengguna_id, t.pelanggan_id, t.total, t.metode_bayar, t.status, t.dibuat_pada
        FROM transaksi t
        WHERE t.id = ?`;
      const scoped = applyScopeToSql(baseSql, [id], scope, { tenantColumn: 't.tenant_id', storeColumn: 't.toko_id' })
      const [trxRows] = await pool.execute<RowDataPacket[]>(scoped.sql, scoped.params)
      if (trxRows.length === 0) return null

      // Ambil items join produk
      const [itemRows] = await pool.execute<RowDataPacket[]>(
        `SELECT it.id, it.transaksi_id, it.produk_id, it.kuantitas, it.harga_satuan,
                p.nama, p.kode
           FROM item_transaksi it
           JOIN produk p ON p.id = it.produk_id
          WHERE it.transaksi_id = ?`,
        [id],
      )

      // Ambil pelanggan (opsional) dengan tenant guard
      let pelanggan: { id: string; nama?: string | null; telepon?: string | null } | null = null
      const pelId = trxRows[0].pelanggan_id as string | null
      if (pelId != null) {
        const pelBase = `SELECT id, nama, telepon FROM pelanggan WHERE id = ?`;
        const pelScoped = applyScopeToSql(pelBase, [pelId], scope, { tenantColumn: 'tenant_id', storeColumn: 'toko_id' })
        const [pelRows] = await pool.execute<RowDataPacket[]>(pelScoped.sql, pelScoped.params)
        if (pelRows.length > 0) {
          pelanggan = { id: pelRows[0].id, nama: pelRows[0].nama, telepon: pelRows[0].telepon }
        }
      }

      const items = (itemRows as any[]).map((r) => ({
        id_produk: r.produk_id,
        nama: r.nama as string,
        sku: (r.kode as string) || null,
        jumlah: Number(r.kuantitas),
        harga_saat_jual: Number(r.harga_satuan),
        subtotal: Number(r.kuantitas) * Number(r.harga_satuan),
      }))

      // Map status ke istilah lokal (opsional)
      const statusDb = trxRows[0].status as string
      let statusLocal: 'selesai' | 'dibatalkan' | 'tertunda' = 'selesai'
      if (statusDb === 'batal') statusLocal = 'dibatalkan'
      else if (statusDb === 'pending') statusLocal = 'tertunda'

      const metodeDb = (trxRows[0].metode_bayar as string || '').toUpperCase()
      const metodeLocal = metodeDb as any

      const trx: TransaksiWithItems = {
        id: trxRows[0].id,
        kode_transaksi: trxRows[0].nomor_transaksi,
        id_toko: trxRows[0].toko_id,
        id_pengguna: trxRows[0].pengguna_id,
        id_pelanggan: trxRows[0].pelanggan_id ?? null,
        jumlah_total: Number(trxRows[0].total),
        metode_pembayaran: metodeLocal,
        status: statusLocal,
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
