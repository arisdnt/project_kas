/**
 * User Service untuk Pengaturan Saya
 * Service untuk mengelola data user yang sedang login dan ubah password
 */

import bcrypt from 'bcryptjs';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

import { pool } from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import {
  User,
  UserResponse,
  ChangePasswordRequest,
  UpdateUserProfileRequest,
  UserContext,
  PaginationParams,
  PaginatedResponse,
  formatUserResponse,
  validatePasswordStrength,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT
} from '../models/User';

export class UserService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash password menggunakan bcrypt
   */
  private static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify password
   */
  private static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Mendapatkan data user berdasarkan ID
   */
  static async getUserById(userId: string, tenantId: string): Promise<UserResponse | null> {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT 
          id, tenant_id, toko_id, peran_id, username, 
          status, last_login, dibuat_pada, diperbarui_pada
        FROM users 
        WHERE id = ? AND tenant_id = ?`,
        [userId, tenantId]
      );

      if (rows.length === 0) {
        return null;
      }

      const user = rows[0] as User;
      return formatUserResponse(user);
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw new Error('Gagal mengambil data user');
    } finally {
      connection.release();
    }
  }

  /**
   * Mendapatkan data user yang sedang login (dari context)
   */
  static async getCurrentUser(userContext: UserContext): Promise<UserResponse | null> {
    return this.getUserById(userContext.id, userContext.tenant_id);
  }

  /**
   * Update profil user (tanpa password)
   */
  static async updateUserProfile(
    userId: string, 
    tenantId: string, 
    updateData: UpdateUserProfileRequest
  ): Promise<UserResponse | null> {
    const connection = await pool.getConnection();
    
    try {
      // Validasi data yang akan diupdate
      if (Object.keys(updateData).length === 0) {
        throw new Error('Tidak ada data yang akan diupdate');
      }

      // Build dynamic query
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updateData.username) {
        // Cek apakah username sudah digunakan
        const [existingUser] = await connection.execute<RowDataPacket[]>(
          'SELECT id FROM users WHERE username = ? AND tenant_id = ? AND id != ?',
          [updateData.username, tenantId, userId]
        );

        if (existingUser.length > 0) {
          throw new Error('Username sudah digunakan');
        }

        updateFields.push('username = ?');
        updateValues.push(updateData.username);
      }

      if (updateData.status) {
        updateFields.push('status = ?');
        updateValues.push(updateData.status);
      }

      // Tambahkan timestamp update
      updateFields.push('diperbarui_pada = NOW()');
      updateValues.push(userId, tenantId);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = ? AND tenant_id = ?
      `;

      const [result] = await connection.execute<ResultSetHeader>(query, updateValues);

      if (result.affectedRows === 0) {
        throw new Error('User tidak ditemukan atau tidak dapat diupdate');
      }

      // Return updated user data
      return this.getUserById(userId, tenantId);
    } catch (error) {
      logger.error('Error updating user profile:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Ubah password user
   */
  static async changePassword(
    userId: string,
    tenantId: string,
    passwordData: ChangePasswordRequest
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      // Validasi password strength
      if (!validatePasswordStrength(passwordData.newPassword)) {
        throw new Error('Password baru tidak memenuhi kriteria keamanan');
      }

      // Ambil password hash saat ini
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT password_hash FROM users WHERE id = ? AND tenant_id = ?',
        [userId, tenantId]
      );

      if (rows.length === 0) {
        throw new Error('User tidak ditemukan');
      }

      const currentPasswordHash = rows[0].password_hash;

      // Verify password saat ini
      const isCurrentPasswordValid = await this.verifyPassword(
        passwordData.currentPassword,
        currentPasswordHash
      );

      if (!isCurrentPasswordValid) {
        throw new Error('Password saat ini tidak benar');
      }

      // Hash password baru
      const newPasswordHash = await this.hashPassword(passwordData.newPassword);

      // Update password
      const [result] = await connection.execute<ResultSetHeader>(
        'UPDATE users SET password_hash = ?, diperbarui_pada = NOW() WHERE id = ? AND tenant_id = ?',
        [newPasswordHash, userId, tenantId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Gagal mengupdate password');
      }

      logger.info(`Password changed for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(userId: string, tenantId: string): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      await connection.execute<ResultSetHeader>(
        'UPDATE users SET last_login = NOW() WHERE id = ? AND tenant_id = ?',
        [userId, tenantId]
      );
    } catch (error) {
      logger.error('Error updating last login:', error);
      // Don't throw error for last login update failure
    } finally {
      connection.release();
    }
  }

  /**
   * Validasi apakah user masih aktif
   */
  static async validateUserStatus(userId: string, tenantId: string): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT status FROM users WHERE id = ? AND tenant_id = ?',
        [userId, tenantId]
      );

      if (rows.length === 0) {
        return false;
      }

      return rows[0].status === 'aktif';
    } catch (error) {
      logger.error('Error validating user status:', error);
      return false;
    } finally {
      connection.release();
    }
  }
}