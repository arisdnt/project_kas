// Service untuk API calls pengaturansaya
import api from '@/core/lib/api';
import { UserProfile, ChangePasswordRequest, ApiResponse } from '../types';

/**
 * Utility function untuk retry dengan exponential backoff
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Jika bukan rate limit error atau sudah mencapai max retry, throw error
      if (!error.message?.includes('Rate limit') || attempt === maxRetries) {
        throw error;
      }
      
      // Tunggu dengan exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Mengambil data profil user yang sedang login
 */
export const getUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  return retryWithBackoff(async () => {
    try {
      const response = await api.get<ApiResponse<UserProfile>>('/pengaturansaya/profile');
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data profil');
    }
  });
};

/**
 * Mengubah password user
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ApiResponse<null>> => {
  return retryWithBackoff(async () => {
    try {
      const response = await api.post<ApiResponse<null>>('/pengaturansaya/change-password', data);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengubah password');
    }
  });
};