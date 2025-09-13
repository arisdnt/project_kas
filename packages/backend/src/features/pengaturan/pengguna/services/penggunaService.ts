import { RowDataPacket, ResultSetHeader } from 'mysql2'
import { pool } from '@/core/database/connection'
import { logger } from '@/core/utils/logger'

// Interface untuk data pengguna
export interface Pengguna {
  id: string
  tenantId: string
  username: string
  email: string
  fullName: string
  role: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

// Interface untuk peran
export interface Peran {
  id: string
  name: string
  displayName: string
  description?: string
}

// Interface untuk request create pengguna
export interface CreatePenggunaRequest {
  username: string
  email: string
  fullName: string
  password: string
  role: string
}

// Interface untuk request update pengguna
export interface UpdatePenggunaRequest {
  username?: string
  email?: string
  fullName?: string
  password?: string
  role?: string
  status?: 'active' | 'inactive'
}

// Interface untuk query pengguna
export interface PenggunaQuery {
  search?: string
  role?: string
  status?: 'active' | 'inactive'
  page?: number
  limit?: number
}

// Interface untuk pagination result
export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export class PenggunaService {
  // Mendapatkan daftar pengguna dengan pagination dan filter
  static async getPengguna(tenantId: string, query: PenggunaQuery = {}): Promise<PaginationResult<Pengguna>> {
    const connection = await pool.getConnection()
    
    try {
      const {
        search = '',
        role = '',
        status = '',
        page = 1,
        limit = 10
      } = query

      const offset = (page - 1) * limit
      let whereConditions = ['u.tenant_id = ?']
      let params: any[] = [tenantId]

      // Filter berdasarkan pencarian
      if (search) {
        whereConditions.push('(u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)')
        const searchParam = `%${search}%`
        params.push(searchParam, searchParam, searchParam)
      }

      // Filter berdasarkan role
      if (role) {
        whereConditions.push('u.role = ?')
        params.push(role)
      }

      // Filter berdasarkan status
      if (status) {
        whereConditions.push('u.status = ?')
        params.push(status)
      }

      const whereClause = whereConditions.join(' AND ')

      // Query untuk mendapatkan total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM users u
        WHERE ${whereClause}
      `

      // Query untuk mendapatkan data pengguna
      const dataQuery = `
        SELECT 
          u.id,
          u.tenant_id as tenantId,
          u.username,
          u.email,
          u.full_name as fullName,
          u.role,
          u.status,
          u.created_at as createdAt,
          u.updated_at as updatedAt
        FROM users u
        WHERE ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `

      const [dataResult] = await connection.execute<RowDataPacket[]>(dataQuery, [...params, limit, offset])
      const [countResult] = await connection.execute<RowDataPacket[]>(countQuery, params)
      
      const data = dataResult as Pengguna[]
      const total = countResult[0].total
      const totalPages = Math.ceil(total / limit)

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      logger.error('Error getting pengguna:', error)
      throw new Error('Gagal mengambil data pengguna')
    } finally {
      connection.release()
    }
  }

  // Mendapatkan pengguna berdasarkan ID
  static async getPenggunaById(id: string, tenantId: string): Promise<Pengguna | null> {
    const connection = await pool.getConnection()
    
    try {
      const query = `
        SELECT 
          u.id,
          u.tenant_id as tenantId,
          u.username,
          u.email,
          u.full_name as fullName,
          u.role,
          u.status,
          u.created_at as createdAt,
          u.updated_at as updatedAt
        FROM users u
        WHERE u.id = ? AND u.tenant_id = ?
      `

      const [result] = await connection.execute<RowDataPacket[]>(query, [id, tenantId])
      
      return result.length > 0 ? result[0] as Pengguna : null
    } catch (error) {
      logger.error('Error getting pengguna by id:', error)
      throw new Error('Gagal mengambil data pengguna')
    } finally {
      connection.release()
    }
  }

  // Mendapatkan daftar peran
  static async getPeran(): Promise<Peran[]> {
    try {
      // Untuk sementara return static roles, bisa diubah ke database jika diperlukan
      return [
        { id: 'super_admin', name: 'super_admin', displayName: 'Super Administrator' },
        { id: 'admin', name: 'admin', displayName: 'Administrator' },
        { id: 'kasir', name: 'kasir', displayName: 'Kasir' },
        { id: 'staff', name: 'staff', displayName: 'Staff' }
      ]
    } catch (error) {
      logger.error('Error getting peran:', error)
      throw new Error('Gagal mengambil data peran')
    }
  }
}