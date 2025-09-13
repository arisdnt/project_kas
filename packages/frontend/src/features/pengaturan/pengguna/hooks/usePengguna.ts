/**
 * Hook untuk mengelola state dan operasi pengguna
 * Menggunakan React hooks untuk state management
 */

import { useState, useEffect, useCallback } from 'react'
import { PenggunaService, Pengguna, Peran, CreatePenggunaRequest, UpdatePenggunaRequest, PenggunaQuery } from '../services/penggunaService'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'

export interface UsePenggunaReturn {
  // Data state
  pengguna: Pengguna[]
  peran: Peran[]
  selectedPengguna: Pengguna | null
  
  // Loading states
  loading: boolean
  loadingCreate: boolean
  loadingUpdate: boolean
  loadingDelete: boolean
  
  // Error states
  error: string | null
  
  // Pagination
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  
  // Actions
  fetchPengguna: (query?: PenggunaQuery) => Promise<void>
  fetchPeran: () => Promise<void>
  createPengguna: (data: CreatePenggunaRequest) => Promise<boolean>
  updatePengguna: (id: number, data: UpdatePenggunaRequest) => Promise<boolean>
  deletePengguna: (id: number) => Promise<boolean>
  selectPengguna: (pengguna: Pengguna | null) => void
  refreshData: () => Promise<void>
}

export const usePengguna = (): UsePenggunaReturn => {
  const { toast } = useToast()
  
  // State untuk data
  const [pengguna, setPengguna] = useState<Pengguna[]>([])
  const [peran, setPeran] = useState<Peran[]>([])
  const [selectedPengguna, setSelectedPengguna] = useState<Pengguna | null>(null)
  
  // State untuk loading
  const [loading, setLoading] = useState(false)
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingUpdate, setLoadingUpdate] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  
  // State untuk error
  const [error, setError] = useState<string | null>(null)
  
  // State untuk pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  
  // Query state untuk filter
  const [currentQuery, setCurrentQuery] = useState<PenggunaQuery>({})
  
  /**
   * Fetch data pengguna dengan filter dan pagination
   */
  const fetchPengguna = useCallback(async (query: PenggunaQuery = {}) => {
    try {
      setLoading(true)
      setError(null)
      setCurrentQuery(query)
      
      const response = await PenggunaService.getAllPengguna(query)
      
      if (response.success && response.data?.pengguna) {
        const penggunaData = Array.isArray(response.data.pengguna) 
          ? response.data.pengguna 
          : [response.data.pengguna]
        
        setPengguna(penggunaData)
        
        if (response.data.pagination) {
          setPagination(response.data.pagination)
        }
      } else {
        throw new Error(response.message || 'Gagal mengambil data pengguna')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])
  
  /**
   * Fetch data peran
   */
  const fetchPeran = useCallback(async () => {
    try {
      const response = await PenggunaService.getAllPeran()
      
      if (response.success && response.data?.peran) {
        setPeran(response.data.peran)
      } else {
        throw new Error(response.message || 'Gagal mengambil data peran')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data peran'
      console.error('Error fetching peran:', errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [toast])
  
  /**
   * Buat pengguna baru
   */
  const createPengguna = useCallback(async (data: CreatePenggunaRequest): Promise<boolean> => {
    try {
      setLoadingCreate(true)
      setError(null)
      
      const response = await PenggunaService.createPengguna(data)
      
      if (response.success) {
        toast({
          title: 'Berhasil',
          description: 'Pengguna berhasil ditambahkan'
        })
        
        // Refresh data
        await fetchPengguna(currentQuery)
        return true
      } else {
        throw new Error(response.message || 'Gagal menambahkan pengguna')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambahkan pengguna'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoadingCreate(false)
    }
  }, [toast, fetchPengguna, currentQuery])
  
  /**
   * Update pengguna
   */
  const updatePengguna = useCallback(async (id: number, data: UpdatePenggunaRequest): Promise<boolean> => {
    try {
      setLoadingUpdate(true)
      setError(null)
      
      const response = await PenggunaService.updatePengguna(id, data)
      
      if (response.success) {
        toast({
          title: 'Berhasil',
          description: 'Pengguna berhasil diperbarui'
        })
        
        // Refresh data
        await fetchPengguna(currentQuery)
        return true
      } else {
        throw new Error(response.message || 'Gagal memperbarui pengguna')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memperbarui pengguna'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoadingUpdate(false)
    }
  }, [toast, fetchPengguna, currentQuery])
  
  /**
   * Hapus pengguna
   */
  const deletePengguna = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoadingDelete(true)
      setError(null)
      
      const response = await PenggunaService.deletePengguna(id)
      
      if (response.success) {
        toast({
          title: 'Berhasil',
          description: 'Pengguna berhasil dihapus'
        })
        
        // Refresh data
        await fetchPengguna(currentQuery)
        return true
      } else {
        throw new Error(response.message || 'Gagal menghapus pengguna')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus pengguna'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setLoadingDelete(false)
    }
  }, [toast, fetchPengguna, currentQuery])
  
  /**
   * Select pengguna untuk edit/view
   */
  const selectPengguna = useCallback((pengguna: Pengguna | null) => {
    setSelectedPengguna(pengguna)
  }, [])
  
  /**
   * Refresh data dengan query terakhir
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchPengguna(currentQuery),
      fetchPeran()
    ])
  }, [fetchPengguna, fetchPeran, currentQuery])
  
  // Load initial data when token is available
  const { token } = useAuthStore()
  
  useEffect(() => {
    if (token) {
      refreshData()
    }
  }, [token])
  
  return {
    // Data state
    pengguna,
    peran,
    selectedPengguna,
    
    // Loading states
    loading,
    loadingCreate,
    loadingUpdate,
    loadingDelete,
    
    // Error state
    error,
    
    // Pagination
    pagination,
    
    // Actions
    fetchPengguna,
    fetchPeran,
    createPengguna,
    updatePengguna,
    deletePengguna,
    selectPengguna,
    refreshData
  }
}