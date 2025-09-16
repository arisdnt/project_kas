/**
 * Session Mutation Service Module
 * Handles session create, update, delete operations
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { CreateSession, UpdateSession } from '../../models/SessionCore';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class SessionMutationService {
  static async createSession(data: CreateSession) {
    const id = uuidv4();
    const now = new Date();

    // Generate session token if not provided
    const sessionToken = data.session_token || this.generateSessionToken();

    const sessionData = {
      ...data,
      id,
      session_token: sessionToken,
      dibuat_pada: now,
      diperbarui_pada: now
    };

    const sql = `
      INSERT INTO user_sessions (
        id, user_id, toko_id, tenant_id, session_token, refresh_token,
        ip_address, user_agent, expires_at, is_active, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute<ResultSetHeader>(sql, [
      sessionData.id, sessionData.user_id, sessionData.toko_id || null,
      sessionData.tenant_id || null, sessionData.session_token, sessionData.refresh_token || null,
      sessionData.ip_address || null, sessionData.user_agent || null, sessionData.expires_at,
      sessionData.is_active ? 1 : 0, sessionData.dibuat_pada, sessionData.diperbarui_pada
    ]);

    return { ...sessionData };
  }

  static async updateSession(sessionToken: string, data: UpdateSession) {
    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'user_id' && key !== 'session_token') {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('diperbarui_pada = NOW()');
    params.push(sessionToken);

    const sql = `UPDATE user_sessions SET ${updates.join(', ')} WHERE session_token = ?`;
    const [result] = await pool.execute<ResultSetHeader>(sql, params);

    if (result.affectedRows === 0) {
      throw new Error('Session not found');
    }

    return { updated: true, session_token: sessionToken };
  }

  static async deactivateSession(sessionToken: string) {
    const sql = `
      UPDATE user_sessions
      SET is_active = 0, diperbarui_pada = NOW()
      WHERE session_token = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(sql, [sessionToken]);

    if (result.affectedRows === 0) {
      throw new Error('Session not found');
    }

    return { deactivated: true, session_token: sessionToken };
  }

  static async deactivateAllUserSessions(userId: string, exceptToken?: string) {
    let sql = `
      UPDATE user_sessions
      SET is_active = 0, diperbarui_pada = NOW()
      WHERE user_id = ?
    `;
    const params = [userId];

    if (exceptToken) {
      sql += ` AND session_token != ?`;
      params.push(exceptToken);
    }

    const [result] = await pool.execute<ResultSetHeader>(sql, params);

    return { deactivated_count: result.affectedRows };
  }

  static async cleanupExpiredSessions() {
    const sql = `
      DELETE FROM user_sessions
      WHERE expires_at <= NOW() OR (is_active = 0 AND diperbarui_pada <= DATE_SUB(NOW(), INTERVAL 7 DAY))
    `;

    const [result] = await pool.execute<ResultSetHeader>(sql);

    return { cleaned_up: result.affectedRows };
  }

  static async refreshSession(refreshToken: string, newExpiryTime: Date) {
    // Find session by refresh token
    const findSql = `
      SELECT session_token FROM user_sessions
      WHERE refresh_token = ? AND is_active = 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(findSql, [refreshToken]);
    if (rows.length === 0) {
      throw new Error('Invalid refresh token');
    }

    const sessionToken = rows[0].session_token;
    const newRefreshToken = this.generateRefreshToken();

    // Update session with new expiry and refresh token
    const updateSql = `
      UPDATE user_sessions
      SET expires_at = ?, refresh_token = ?, diperbarui_pada = NOW()
      WHERE session_token = ?
    `;

    await pool.execute<ResultSetHeader>(updateSql, [newExpiryTime, newRefreshToken, sessionToken]);

    return {
      session_token: sessionToken,
      refresh_token: newRefreshToken,
      expires_at: newExpiryTime
    };
  }

  private static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}