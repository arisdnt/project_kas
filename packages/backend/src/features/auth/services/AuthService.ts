/**
 * Authentication Service
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

import { pool } from '@/core/database/connection';
import { appConfig } from '@/core/config/app';
import { logger } from '@/core/utils/logger';
import {
  User,
  CreateUser,
  LoginRequest,
  JWTPayload,
  UserRole,
  UserStatus,
  AuthenticatedUser
} from '../models/User';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly JWT_EXPIRES_IN = '24h';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

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
   * Generate JWT token
   */
  private static generateToken(payload: JWTPayload, expiresIn: string = this.JWT_EXPIRES_IN): string {
    const { iat, exp, ...tokenPayload } = payload;
    return jwt.sign(tokenPayload as any, appConfig.jwtSecret as any, { expiresIn } as any);
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, appConfig.jwtSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Login user dengan informasi level dan toko
   */
  static async login(loginData: LoginRequest): Promise<{
    user: AuthenticatedUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const connection = await pool.getConnection();
    
    try {
      // Query user berdasarkan username dari tabel users dengan join ke pengguna, peran
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT 
            u.id, u.username, u.password_hash as password, u.tenant_id, u.nama_lengkap as nama, u.status, u.is_super_admin,
            p.toko_id,
            pr.nama as nama_peran, pr.level, pr.deskripsi as deskripsi_peran
         FROM users u
         LEFT JOIN pengguna p ON u.id = p.user_id
         LEFT JOIN peran pr ON p.peran_id = pr.id
         WHERE u.username = ? AND u.status = 'aktif'`,
        [loginData.username]
      );

      if (rows.length === 0) {
        throw new Error('Invalid username or password');
      }

      const user = rows[0];

      // Verify password
      const isPasswordValid = await this.verifyPassword(loginData.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid username or password');
      }

      // Check tenant jika disediakan
      if (loginData.tenantId && user.tenant_id !== loginData.tenantId) {
        throw new Error('Invalid tenant access');
      }

      // Update last login
      await connection.execute(
        'UPDATE users SET last_login = NOW(), diperbarui_pada = NOW() WHERE id = ?',
        [user.id]
      );

      // Map role berdasarkan level peran
      let mappedRole: UserRole;
      let level: number;
      
      // Gunakan level dari tabel peran atau default ke level 5
      level = user.level || 5;
      
      switch (level) {
        case 1:
          mappedRole = UserRole.SUPER_ADMIN;
          break;
        case 2:
        case 8: // Admin level dari tabel peran
          mappedRole = UserRole.ADMIN;
          break;
        case 3:
          mappedRole = UserRole.MANAGER;
          break;
        case 4:
        case 5:
        default:
          mappedRole = UserRole.CASHIER;
      }

      // Prepare user data
      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        tenantId: user.tenant_id,
        tokoId: user.toko_id || undefined,
        username: user.username,
        email: '', // Email tidak ada di tabel pengguna saat ini
        fullName: user.nama || user.username,
        role: mappedRole,
        level: level,
        status: user.status === 'aktif' ? UserStatus.ACTIVE : UserStatus.INACTIVE
      };

      // Generate tokens
      const jwtPayload: JWTPayload = {
        userId: user.id,
        tenantId: user.tenant_id,
        tokoId: user.toko_id || undefined,
        username: user.username,
        role: mappedRole,
        level: level
      };

      const accessToken = this.generateToken(jwtPayload);
      const refreshToken = this.generateToken(jwtPayload, this.REFRESH_TOKEN_EXPIRES_IN);

      logger.info({
        userId: user.id,
        username: user.username,
        tenantId: user.tenant_id
      }, 'User logged in successfully');

      return {
        user: authenticatedUser,
        accessToken,
        refreshToken
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Create new user
   */
  static async createUser(userData: CreateUser): Promise<User> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if username already exists
      const [existingUsers] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [userData.username, userData.email]
      );

      if (existingUsers.length > 0) {
        throw new Error('Username or email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Generate UUID for new user
      const userId = require('crypto').randomUUID();

      // Insert user
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO users (id, tenant_id, username, email, password_hash, full_name, role, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'aktif', NOW(), NOW())`,
        [
          userId,
          userData.tenantId,
          userData.username,
          userData.email,
          hashedPassword,
          userData.fullName,
          userData.role
        ]
      );

      // Get created user
      const [newUser] = await connection.execute<RowDataPacket[]>(
        `SELECT id, tenant_id, username, email, full_name, role, status, created_at, updated_at
         FROM users WHERE id = ?`,
        [userId]
      );

      await connection.commit();

      logger.info({
        userId: result.insertId,
        username: userData.username,
        tenantId: userData.tenantId
      }, 'User created successfully');

      return {
        id: newUser[0].id,
        tenantId: newUser[0].tenant_id,
        username: newUser[0].username,
        email: newUser[0].email,
        password: '', // Don't return password
        fullName: newUser[0].full_name,
        role: newUser[0].role as UserRole,
        status: newUser[0].status === 'aktif' ? UserStatus.ACTIVE : UserStatus.INACTIVE,
        lastLogin: null,
        createdAt: newUser[0].created_at,
        updatedAt: newUser[0].updated_at
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get user by ID dengan informasi level dan toko
   */
  static async getUserById(userId: string, tenantId: string): Promise<AuthenticatedUser | null> {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT u.id, u.tenant_id, u.username, u.nama_lengkap as nama, u.status,
                u.is_super_admin, u.email, u.telepon, u.avatar_url,
                pg.toko_id,
                p.nama as nama_peran, p.level
         FROM users u
         LEFT JOIN pengguna pg ON u.id = pg.user_id
         LEFT JOIN peran p ON pg.peran_id = p.id
         WHERE u.id = ? AND u.tenant_id = ? AND u.status = 'aktif'`,
        [userId, tenantId]
      );

      if (rows.length === 0) {
        return null;
      }

      const user = rows[0];

      // Map role berdasarkan level peran
      let mappedRole: UserRole;
      let level: number;
      
      // Gunakan level dari tabel peran atau default ke level 5
      level = user.level || 5;
      
      switch (level) {
        case 1:
          mappedRole = UserRole.SUPER_ADMIN;
          break;
        case 2:
        case 8: // Admin level dari tabel peran
          mappedRole = UserRole.ADMIN;
          break;
        case 3:
          mappedRole = UserRole.MANAGER;
          break;
        case 4:
        case 5:
        default:
          mappedRole = UserRole.CASHIER;
      }

      return {
        id: user.id,
        tenantId: user.tenant_id,
        tokoId: user.toko_id || undefined,
        username: user.username,
        email: user.email || '',
        fullName: user.nama || user.username,
        role: mappedRole,
        level: level,
        status: user.status === 'aktif' ? UserStatus.ACTIVE : UserStatus.INACTIVE
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload = this.verifyToken(refreshToken);
      
      // Verify user still exists and active
      const user = await this.getUserById(payload.userId, payload.tenantId);
      if (!user) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const newJwtPayload: JWTPayload = {
        userId: user.id,
        tenantId: user.tenantId,
        username: user.username,
        role: user.role
      };

      const newAccessToken = this.generateToken(newJwtPayload);
      const newRefreshToken = this.generateToken(newJwtPayload, this.REFRESH_TOKEN_EXPIRES_IN);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };

    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
