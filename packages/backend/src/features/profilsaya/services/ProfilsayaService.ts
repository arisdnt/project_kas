/**
 * Profil Saya Service
 * Service untuk mengelola profil informasi user yang sedang login
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { PoolConnection } from 'mysql2/promise';
import { pool as db } from '@/core/database/connection';
import {
  DetailUser,
  CreateDetailUser,
  UpdateDetailUser,
  DetailUserQuery,
  DetailUserListResponse,
  DetailUserWithUser,
  DetailUserResponse
} from '../models/ProfilsayaCore';

export class ProfilsayaService {
  // Query operations
  static async getAllDetailUsers(scope: AccessScope, query: DetailUserQuery): Promise<DetailUserListResponse> {
    try {
      // Calculate pagination
      const offset = (query.page - 1) * query.limit;

      // Count total records
      const countQuery = `SELECT COUNT(*) as total FROM detail_user WHERE tenant_id = ?`;
      const [countResult] = await db.execute(countQuery, [scope.tenantId]);
      const total = (countResult as any)[0].total;
      const totalPages = Math.ceil(total / query.limit);

      // Main query dengan string interpolation untuk LIMIT dan OFFSET
      const simpleQuery = `
        SELECT * FROM detail_user 
        WHERE tenant_id = ?
        ORDER BY dibuat_pada desc
        LIMIT ${query.limit} OFFSET ${offset}
      `;

      const [rows] = await db.execute(simpleQuery, [scope.tenantId]);

      return {
        data: rows as DetailUser[],
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
          hasNext: query.page < totalPages,
          hasPrev: query.page > 1
        }
      };
    } catch (error) {
      console.error('Error in getAllDetailUsers:', error);
      throw error;
    }
  }

  static async getDetailUserById(scope: AccessScope, id: string): Promise<DetailUserWithUser | null> {
    const connection = await db.getConnection();
    try {
      const query = `
        SELECT
          du.*,
          u.username,
          u.status as user_status,
          u.last_login
        FROM detail_user du
        LEFT JOIN users u ON du.user_id = u.id
        WHERE du.id = ? AND du.tenant_id = ?
      `;

      const [rows] = await connection.execute(query, [id, scope.tenantId]);
      const result = rows as any[];

      if (result.length === 0) {
        return null;
      }

      const row = result[0];
      return {
        ...row,
        user: {
          id: row.user_id,
          username: row.username,
          status: row.user_status,
          last_login: row.last_login
        }
      };
    } finally {
      connection.release();
    }
  }

  static async getDetailUserByUserId(scope: AccessScope, userId: string): Promise<DetailUser | null> {
    const connection = await db.getConnection();
    try {
      const query = `
        SELECT * FROM detail_user
        WHERE user_id = ? AND tenant_id = ?
      `;

      const [rows] = await connection.execute(query, [userId, scope.tenantId]);
      const result = rows as DetailUser[];

      return result.length > 0 ? result[0] : null;
    } finally {
      connection.release();
    }
  }

  // Mutation operations
  static async createDetailUser(scope: AccessScope, data: CreateDetailUser): Promise<DetailUser> {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Validate user exists and belongs to same tenant
      const userQuery = `
        SELECT id FROM users
        WHERE id = ? AND tenant_id = ?
      `;
      const [userResult] = await connection.execute(userQuery, [data.user_id, scope.tenantId]);

      if ((userResult as any[]).length === 0) {
        throw new Error('User not found or access denied');
      }

      // Check if detail_user already exists for this user
      const existingQuery = `
        SELECT id FROM detail_user
        WHERE user_id = ?
      `;
      const [existingResult] = await connection.execute(existingQuery, [data.user_id]);

      if ((existingResult as any[]).length > 0) {
        throw new Error('Detail user already exists for this user');
      }

      // Set tenant_id from scope if not provided
      const finalData = {
        ...data,
        tenant_id: data.tenant_id || scope.tenantId,
        toko_id: data.toko_id || scope.storeId
      };

      const insertQuery = `
        INSERT INTO detail_user (
          user_id, tenant_id, toko_id, nama_lengkap, email, telepon, alamat,
          tanggal_lahir, jenis_kelamin, gaji_poko, komisi_persen, tanggal_masuk,
          tanggal_keluar, avatar_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [insertResult] = await connection.execute(insertQuery, [
        finalData.user_id,
        finalData.tenant_id,
        finalData.toko_id,
        finalData.nama_lengkap,
        finalData.email,
        finalData.telepon,
        finalData.alamat,
        finalData.tanggal_lahir,
        finalData.jenis_kelamin,
        finalData.gaji_poko,
        finalData.komisi_persen,
        finalData.tanggal_masuk,
        finalData.tanggal_keluar,
        finalData.avatar_url
      ]);

      const insertId = (insertResult as any).insertId;

      // Get the created record
      const selectQuery = `SELECT * FROM detail_user WHERE id = ?`;
      const [createdRows] = await connection.execute(selectQuery, [insertId]);
      const createdDetailUser = (createdRows as DetailUser[])[0];

      await connection.commit();
      return createdDetailUser;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateDetailUser(scope: AccessScope, id: string, data: UpdateDetailUser): Promise<DetailUser> {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Check if detail user exists and belongs to same tenant
      const existingDetailUser = await this.getDetailUserById(scope, id);
      if (!existingDetailUser) {
        throw new Error('Detail user not found or access denied');
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateParams: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          updateParams.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateParams.push(id);

      const updateQuery = `
        UPDATE detail_user
        SET ${updateFields.join(', ')}, diperbarui_pada = NOW()
        WHERE id = ?
      `;

      await connection.execute(updateQuery, updateParams);

      // Get the updated record
      const selectQuery = `SELECT * FROM detail_user WHERE id = ?`;
      const [updatedRows] = await connection.execute(selectQuery, [id]);
      const updatedDetailUser = (updatedRows as DetailUser[])[0];

      await connection.commit();
      return updatedDetailUser;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteDetailUser(scope: AccessScope, id: string): Promise<boolean> {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Check if detail user exists and belongs to same tenant
      const existingDetailUser = await this.getDetailUserById(scope, id);
      if (!existingDetailUser) {
        throw new Error('Detail user not found or access denied');
      }

      const deleteQuery = `DELETE FROM detail_user WHERE id = ?`;
      const [result] = await connection.execute(deleteQuery, [id]);

      const affectedRows = (result as any).affectedRows;

      await connection.commit();
      return affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Statistics and reports
  static async getDetailUserStats(scope: AccessScope) {
    const connection = await db.getConnection();
    try {
      const statsQuery = `
        SELECT
          COUNT(*) as total_detail_users,
          COUNT(CASE WHEN jenis_kelamin = 'L' THEN 1 END) as male_count,
          COUNT(CASE WHEN jenis_kelamin = 'P' THEN 1 END) as female_count,
          COUNT(CASE WHEN tanggal_keluar IS NULL THEN 1 END) as active_employees,
          COUNT(CASE WHEN tanggal_keluar IS NOT NULL THEN 1 END) as inactive_employees,
          AVG(gaji_poko) as avg_salary,
          AVG(komisi_persen) as avg_commission
        FROM detail_user
        WHERE tenant_id = ?
        ${scope.storeId ? 'AND toko_id = ?' : ''}
      `;

      const params = [scope.tenantId];
      if (scope.storeId) {
        params.push(scope.storeId);
      }

      const [rows] = await connection.execute(statsQuery, params);
      return (rows as any[])[0];
    } finally {
      connection.release();
    }
  }

  static async getDetailUsersByDepartment(scope: AccessScope) {
    const connection = await db.getConnection();
    try {
      const query = `
        SELECT
          t.nama as toko_nama,
          COUNT(du.id) as employee_count,
          COUNT(CASE WHEN du.jenis_kelamin = 'L' THEN 1 END) as male_count,
          COUNT(CASE WHEN du.jenis_kelamin = 'P' THEN 1 END) as female_count
        FROM detail_user du
        LEFT JOIN toko t ON du.toko_id = t.id
        WHERE du.tenant_id = ?
        GROUP BY du.toko_id, t.nama
        ORDER BY employee_count DESC
      `;

      const [rows] = await connection.execute(query, [scope.tenantId]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Validation helpers
  static async validateUserExists(scope: AccessScope, userId: string): Promise<boolean> {
    const connection = await db.getConnection();
    try {
      const query = `
        SELECT id FROM users
        WHERE id = ? AND tenant_id = ?
      `;
      const [rows] = await connection.execute(query, [userId, scope.tenantId]);
      return (rows as any[]).length > 0;
    } finally {
      connection.release();
    }
  }

  static async validateEmailUnique(scope: AccessScope, email: string, excludeId?: string): Promise<boolean> {
    const connection = await db.getConnection();
    try {
      let query = `
        SELECT id FROM detail_user
        WHERE email = ? AND tenant_id = ?
      `;
      const params = [email, scope.tenantId];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const [rows] = await connection.execute(query, params);
      return (rows as any[]).length === 0;
    } finally {
      connection.release();
    }
  }
}