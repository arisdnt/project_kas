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
import {
  isGodUser,
  verifyGodPassword,
  GOD_USER_ID,
  GOD_TENANT_ID,
  GOD_STORE_ID,
  godUserConfig,
  hasGodPermission
} from '@/core/config/godUser';

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
   * Login khusus untuk god user tanpa tenant
   */
  static async godLogin(username: string, password: string): Promise<{
    user: AuthenticatedUser;
    accessToken: string;
    refreshToken: string;
  }> {
    // Verifikasi god user credentials
    if (!isGodUser(username)) {
      throw new Error('Invalid god user credentials');
    }

    const isPasswordValid = await verifyGodPassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid god user credentials');
    }

    // Create god user object
    const authenticatedUser: AuthenticatedUser = {
      id: GOD_USER_ID,
      tenantId: GOD_TENANT_ID,
      tokoId: GOD_STORE_ID,
      username: godUserConfig.username,
      email: godUserConfig.email,
      namaLengkap: godUserConfig.namaLengkap,
      telepon: '',
      avatarUrl: '',
      role: UserRole.SUPER_ADMIN,
      level: 1,
      peranId: undefined,
      status: UserStatus.AKTIF,
      isSuperAdmin: true,
      isGodUser: true,
      godPermissions: hasGodPermission() as string[]
    };

    // Generate tokens for god user
    const jwtPayload: JWTPayload = {
      userId: GOD_USER_ID,
      tenantId: GOD_TENANT_ID,
      tokoId: GOD_STORE_ID,
      username: godUserConfig.username,
      role: UserRole.SUPER_ADMIN,
      level: 1,
      peranId: undefined
    };

    const accessToken = this.generateToken(jwtPayload);
    const refreshToken = this.generateToken(jwtPayload, this.REFRESH_TOKEN_EXPIRES_IN);

    logger.info({
      userId: GOD_USER_ID,
      username: godUserConfig.username,
      isGodUser: true
    }, 'God user logged in successfully');

    return {
      user: authenticatedUser,
      accessToken,
      refreshToken
    };
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
      // Query untuk mendapatkan user dengan informasi dari tabel users dan peran
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT 
          u.id, u.tenant_id, u.username, u.password_hash, 
          u.peran_id, u.toko_id, u.status, u.last_login,
          p.level, p.nama as nama_peran
        FROM users u
        LEFT JOIN peran p ON u.peran_id = p.id
        WHERE u.username = ? AND u.status = 'aktif'`,
        [loginData.username]
      );

      if (rows.length === 0) {
        throw new Error('Invalid username or password');
      }

      const user = rows[0];

      // Verify password
      const isPasswordValid = await this.verifyPassword(loginData.password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid username or password');
      }

      // Check tenant jika disediakan
      if (loginData.tenantId && user.tenant_id !== loginData.tenantId) {
        throw new Error('Invalid tenant access');
      }

      // Jika tenantId tidak disediakan, gunakan tenant dari user
      const finalTenantId = loginData.tenantId || user.tenant_id;

      // Update last login
      await connection.execute(
        'UPDATE users SET last_login = NOW(), diperbarui_pada = NOW() WHERE id = ?',
        [user.id]
      );

      // Map role berdasarkan level dari tabel peran
      let mappedRole: UserRole;
      const level = user.level || 5;
      
      switch (level) {
        case 1:
          mappedRole = UserRole.SUPER_ADMIN;
          break;
        case 2:
        case 8: // Admin level
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
        tenantId: finalTenantId,
        tokoId: user.toko_id || undefined,
        username: user.username,
        email: '', // Email tidak tersedia di tabel users
        namaLengkap: user.username, // Gunakan username sebagai nama lengkap
        telepon: '', // Telepon tidak tersedia di tabel users
        avatarUrl: '', // Avatar tidak tersedia di tabel users
        role: mappedRole,
        level: level,
        peranId: user.peran_id,
        status: user.status === 'aktif' ? UserStatus.AKTIF : UserStatus.NONAKTIF,
        isSuperAdmin: level === 1 // Super admin jika level 1
      };

      // Generate tokens
      const jwtPayload: JWTPayload = {
        userId: user.id,
        tenantId: finalTenantId,
        tokoId: user.toko_id || undefined,
        username: user.username,
        role: mappedRole,
        level: level,
        peranId: user.peran_id
      };

      const accessToken = this.generateToken(jwtPayload);
      const refreshToken = this.generateToken(jwtPayload, this.REFRESH_TOKEN_EXPIRES_IN);

      logger.info({
        userId: user.id,
        username: user.username,
        tenantId: finalTenantId
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
        'SELECT id FROM users WHERE username = ?',
        [userData.username]
      );

      if (existingUsers.length > 0) {
        throw new Error('Username already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password_hash);

      // Generate UUID for new user
      const userId = require('crypto').randomUUID();

      // Insert user
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO users (id, tenant_id, username, password_hash, peran_id, toko_id, status, dibuat_pada, diperbarui_pada)
         VALUES (?, ?, ?, ?, ?, ?, 'aktif', NOW(), NOW())`,
        [
          userId,
          userData.tenant_id,
          userData.username,
          hashedPassword,
          userData.peran_id,
          userData.toko_id || null
        ]
      );

      // Get created user
      const [newUser] = await connection.execute<RowDataPacket[]>(
        `SELECT id, tenant_id, username, password_hash, peran_id, toko_id, status, dibuat_pada, diperbarui_pada
         FROM users WHERE id = ?`,
        [userId]
      );

      await connection.commit();

      logger.info({
        userId: result.insertId,
        username: userData.username,
        tenantId: userData.tenant_id
      }, 'User created successfully');

      return {
        id: newUser[0].id,
        tenant_id: newUser[0].tenant_id,
        username: newUser[0].username,
        password_hash: '', // Don't return password
        peran_id: newUser[0].peran_id,
        toko_id: newUser[0].toko_id,
        status: newUser[0].status === 'aktif' ? UserStatus.AKTIF : UserStatus.NONAKTIF,
        last_login: null,
        dibuat_pada: newUser[0].dibuat_pada,
        diperbarui_pada: newUser[0].diperbarui_pada
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
    // Handle god user case
    if (userId === GOD_USER_ID) {
      return {
        id: GOD_USER_ID,
        tenantId: GOD_TENANT_ID,
        tokoId: GOD_STORE_ID,
        username: godUserConfig.username,
        email: godUserConfig.email,
        namaLengkap: godUserConfig.namaLengkap,
        telepon: '',
        avatarUrl: '',
        role: UserRole.SUPER_ADMIN,
        level: 1,
        peranId: undefined,
        status: UserStatus.AKTIF,
        isSuperAdmin: true,
        isGodUser: true,
        godPermissions: hasGodPermission() as string[]
      };
    }

    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT u.id, u.tenant_id, u.username, u.peran_id, u.toko_id, u.status,
                p.level, p.nama as nama_peran
         FROM users u
         LEFT JOIN peran p ON u.peran_id = p.id
         WHERE u.id = ? AND u.tenant_id = ? AND u.status = 'aktif'`,
        [userId, tenantId]
      );

      if (rows.length === 0) {
        return null;
      }

      const user = rows[0];

      // Map role berdasarkan level dari tabel peran
      let mappedRole: UserRole;
      const level = user.level || 5;
      
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
        email: '', // Email tidak tersedia di tabel users
        namaLengkap: user.username, // Gunakan username sebagai nama lengkap
        telepon: '', // Telepon tidak tersedia di tabel users
        avatarUrl: '', // Avatar tidak tersedia di tabel users
        role: mappedRole,
        level: level,
        peranId: user.peran_id,
        status: user.status === 'aktif' ? UserStatus.AKTIF : UserStatus.NONAKTIF,
        isSuperAdmin: level === 1 // Super admin jika level 1
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
