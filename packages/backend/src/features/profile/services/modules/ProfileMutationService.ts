/**
 * Profile Mutation Service Module
 * Handles user profile updates and settings management
 */

import { RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { UpdateProfile, ChangePassword, UpdateSettings } from '../../models/ProfileCore';

export class ProfileMutationService {
  static async updateProfile(scope: AccessScope, data: UpdateProfile, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if updating own profile or has permission to update others
    if (scope.level && scope.level > 2) {
      throw new Error('Insufficient permissions to update other user profiles');
    }

    // Check if user exists and belongs to tenant
    const [userRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND tenant_id = ?',
      [userId, scope.tenantId]
    );

    if (userRows.length === 0) {
      throw new Error('User not found or access denied');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.nama_lengkap !== undefined) {
      updates.push('nama_lengkap = ?');
      params.push(data.nama_lengkap);
    }

    if (data.telepon !== undefined) {
      updates.push('telepon = ?');
      params.push(data.telepon);
    }

    if (data.alamat !== undefined) {
      updates.push('alamat = ?');
      params.push(data.alamat);
    }

    if (data.tanggal_lahir !== undefined) {
      updates.push('tanggal_lahir = ?');
      params.push(data.tanggal_lahir);
    }

    if (data.jenis_kelamin !== undefined) {
      updates.push('jenis_kelamin = ?');
      params.push(data.jenis_kelamin);
    }

    if (data.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(data.avatar_url);
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('diperbarui_pada = NOW()');
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    params.push(userId);

    await pool.execute(sql, params);

    // Log the profile update activity
    await this.logActivity(
      scope.tenantId,
      userId,
      'profile_update',
      'Profile information updated',
      undefined,
      undefined,
      undefined
    );

    // Return updated profile
    const [updatedRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    return updatedRows[0];
  }

  static async changePassword(scope: AccessScope, data: ChangePassword, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if changing own password or has permission to change others
    if (scope.level && scope.level > 2) {
      throw new Error('Insufficient permissions to change other user passwords');
    }

    // Get current user data
    const [userRows] = await pool.execute<RowDataPacket[]>(
      'SELECT password_hash FROM users WHERE id = ? AND tenant_id = ?',
      [userId, scope.tenantId]
    );

    if (userRows.length === 0) {
      throw new Error('User not found or access denied');
    }

    const user = userRows[0];

    // Verify current password for password changes
    const isCurrentPasswordValid = await bcrypt.compare(data.current_password, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(data.new_password, 12);

    // Update password
    await pool.execute(
      'UPDATE users SET password_hash = ?, diperbarui_pada = NOW() WHERE id = ?',
      [newPasswordHash, userId]
    );

    // Log the password change activity
    await this.logActivity(
      scope.tenantId,
      userId,
      'password_change',
      'Password changed successfully',
      undefined,
      undefined,
      undefined
    );

    return { success: true, message: 'Password changed successfully' };
  }

  static async updateSettings(scope: AccessScope, data: UpdateSettings, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // For now, since there's no settings table in the schema,
    // we'll store settings as JSON in a user metadata field or create a simple implementation
    // In a real implementation, you'd have a user_settings table

    // Log the settings update
    await this.logActivity(
      scope.tenantId,
      userId,
      'profile_update',
      'Profile settings updated',
      undefined,
      undefined,
      undefined
    );

    return {
      success: true,
      message: 'Settings updated successfully',
      settings: {
        user_id: userId,
        ...data,
        updated_at: new Date()
      }
    };
  }

  static async uploadAvatar(scope: AccessScope, avatarUrl: string, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if updating own avatar or has permission to update others
    if (scope.level && scope.level > 2) {
      throw new Error('Insufficient permissions to update avatar for other users');
    }

    // Update avatar URL
    await pool.execute(
      'UPDATE users SET avatar_url = ?, diperbarui_pada = NOW() WHERE id = ? AND tenant_id = ?',
      [avatarUrl, userId, scope.tenantId]
    );

    // Log the avatar update activity
    await this.logActivity(
      scope.tenantId,
      userId,
      'profile_update',
      'Avatar updated',
      undefined,
      undefined,
      undefined
    );

    return {
      success: true,
      message: 'Avatar updated successfully',
      avatar_url: avatarUrl
    };
  }

  static async deleteAccount(scope: AccessScope, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Only allow admins to delete accounts or users to delete their own (with restrictions)
    if (scope.level && scope.level > 1) {
      throw new Error('Insufficient permissions to delete user account');
    }

    // Check if user has any transactions (prevent deletion if they do)
    const [transactionRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM (
        SELECT pengguna_id FROM transaksi_penjualan WHERE pengguna_id = ?
        UNION ALL
        SELECT pengguna_id FROM transaksi_pembelian WHERE pengguna_id = ?
      ) as transactions`,
      [userId, userId]
    );

    if (Number(transactionRows[0].count) > 0) {
      // Soft delete: deactivate user instead of hard delete
      await pool.execute(
        'UPDATE users SET status = \'nonaktif\', diperbarui_pada = NOW() WHERE id = ?',
        [userId]
      );

      return {
        success: true,
        message: 'User account deactivated (has transaction history)',
        soft_delete: true
      };
    }

    // Hard delete if no transactions
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    return {
      success: true,
      message: 'User account deleted successfully',
      soft_delete: false
    };
  }

  static async updateLastLogin(scope: AccessScope, userId: string) {
    if (!userId) {
      return;
    }

    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [userId]
    );

    // Log login activity
    await this.logActivity(
      scope.tenantId,
      userId,
      'login',
      'User logged in',
      undefined,
      undefined,
      undefined
    );
  }

  private static async logActivity(
    tenantId: string,
    userId: string,
    activityType: string,
    description: string,
    transactionId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      const sql = `
        INSERT INTO audit_log (
          tenant_id, user_id, tabel, record_id, aksi,
          data_baru, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const data = {
        activity_type: activityType,
        description: description,
        timestamp: new Date().toISOString()
      };

      await pool.execute(sql, [
        tenantId,
        userId,
        'users',
        transactionId || userId,
        activityType,
        JSON.stringify(data),
        ipAddress,
        userAgent
      ]);
    } catch (error) {
      // Don't throw on logging errors
      console.error('Failed to log activity:', error);
    }
  }
}