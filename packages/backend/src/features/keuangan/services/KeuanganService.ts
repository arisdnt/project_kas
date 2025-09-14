import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { logger } from '@/core/utils/logger';

export type LedgerRow = {
  id: string;
  date: string;
  nomor: string;
  deskripsi?: string | null;
  masuk: number;
  keluar: number;
  metode?: string | null;
};

export type ProfitLoss = {
  pendapatan: number;
  hpp: number;
  labaKotor: number;
};

export class KeuanganService {
  static async getLedger(tenantId: string | null, startISO: string, endISO: string): Promise<LedgerRow[]> {
    // Try schema A (kode_transaksi + jumlah_total + dibuat_pada)
    try {
      const paramsA: any[] = [startISO, endISO];
      const whereTenantA = '';
      const [rowsA] = await pool.execute<RowDataPacket[]>(
        `SELECT t.uuid as id, t.kode_transaksi as nomor, t.jumlah_total as masuk, 0 as keluar, t.metode_pembayaran as metode, t.status, t.dibuat_pada as tanggal
           FROM transaksi t
          WHERE t.dibuat_pada BETWEEN ? AND ? AND t.status = 'selesai'
          ORDER BY t.dibuat_pada ASC`,
        paramsA,
      );
      return rowsA.map((r: any) => ({
        id: r.id,
        date: r.tanggal instanceof Date ? r.tanggal.toISOString() : String(r.tanggal),
        nomor: r.nomor,
        deskripsi: null,
        masuk: Number(r.masuk || 0),
        keluar: Number(r.keluar || 0),
        metode: r.metode,
      }));
    } catch (e) {
      logger.warn({ err: (e as any)?.message }, 'KeuanganService.getLedger schema A failed, trying schema B');
    }

    // Fallback schema B (nomor_transaksi + total + tanggal [+ tenant_id])
    const paramsB: any[] = [startISO, endISO];
    let tenantFilter = '';
    if (tenantId) {
      tenantFilter = 'AND t.tenant_id = ?';
      paramsB.push(tenantId);
    }
    const [rowsB] = await pool.execute<RowDataPacket[]>(
      `SELECT t.id, t.nomor_transaksi as nomor, t.total as masuk, 0 as keluar, t.metode_bayar as metode, t.status, t.tanggal as tanggal
         FROM transaksi t
        WHERE t.tanggal BETWEEN ? AND ? AND t.status = 'selesai' ${tenantFilter}
        ORDER BY t.tanggal ASC`,
      paramsB,
    );
    return rowsB.map((r: any) => ({
      id: r.id,
      date: r.tanggal instanceof Date ? r.tanggal.toISOString() : String(r.tanggal),
      nomor: r.nomor,
      deskripsi: null,
      masuk: Number(r.masuk || 0),
      keluar: Number(r.keluar || 0),
      metode: r.metode,
    }));
  }

  static async getProfitLoss(tenantId: string | null, startISO: string, endISO: string): Promise<ProfitLoss> {
    // Try schema A joins (item_transaksi.id_transaksi -> transaksi.uuid ; item_transaksi.id_produk -> produk.id)
    try {
      const [rowsA] = await pool.execute<RowDataPacket[]>(
        `SELECT 
            SUM(it.jumlah * it.harga_saat_jual) as pendapatan,
            SUM(it.jumlah * COALESCE(p.harga_beli, 0)) as hpp
           FROM item_transaksi it
           JOIN transaksi t ON t.uuid = it.id_transaksi
           JOIN produk p ON p.id = it.id_produk
          WHERE t.dibuat_pada BETWEEN ? AND ? AND t.status = 'selesai'`,
        [startISO, endISO],
      );
      const pendapatan = Number(rowsA[0]?.pendapatan || 0);
      const hpp = Number(rowsA[0]?.hpp || 0);
      return { pendapatan, hpp, labaKotor: pendapatan - hpp };
    } catch (e) {
      logger.warn({ err: (e as any)?.message }, 'KeuanganService.getProfitLoss schema A failed, trying schema B');
    }

    // Fallback schema B joins (item_transaksi.transaksi_id -> transaksi.id ; item_transaksi.produk_id -> produk.id)
    const params: any[] = [startISO, endISO];
    let tenantFilter = '';
    if (tenantId) {
      tenantFilter = 'AND t.tenant_id = ?';
      params.push(tenantId);
    }
    const [rowsB] = await pool.execute<RowDataPacket[]>(
      `SELECT 
          SUM(it.jumlah * it.harga_saat_jual) as pendapatan,
          SUM(it.jumlah * COALESCE(p.harga_beli, 0)) as hpp
         FROM item_transaksi it
         JOIN transaksi t ON t.id = it.transaksi_id
         JOIN produk p ON p.id = it.produk_id
        WHERE t.tanggal BETWEEN ? AND ? AND t.status = 'selesai' ${tenantFilter}`,
      params,
    );
    const pendapatan = Number(rowsB[0]?.pendapatan || 0);
    const hpp = Number(rowsB[0]?.hpp || 0);
    return { pendapatan, hpp, labaKotor: pendapatan - hpp };
  }
}

