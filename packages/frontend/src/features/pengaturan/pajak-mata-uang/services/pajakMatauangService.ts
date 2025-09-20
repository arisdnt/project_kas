import {
  PajakSetting,
  MatauangSetting,
  CreatePajakRequest,
  CreateMatauangRequest,
  UpdatePajakRequest,
  UpdateMatauangRequest,
  PajakMatauangStats,
  PajakMatauangFilters
} from '../types';
import { config } from '@/core/config';
import { useAuthStore } from '@/core/store/authStore';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

class PajakMatauangService {
  private readonly baseUrl = `${config.api.url}:${config.api.port}/api/pajakmatauang`;

  private getAuthHeaders() {
    const token = useAuthStore.getState().token;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      } else {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server response is not valid JSON');
    }

    return response.json();
  }

  private buildQueryString(filters: Partial<PajakMatauangFilters>): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    return params.toString();
  }

  // ========================================
  // Tax (Pajak) Service Methods
  // ========================================

  /**
   * Get list of tax settings with filters and pagination
   */
  async getPajak(filters: Partial<PajakMatauangFilters> = {}): Promise<PaginatedResponse<PajakSetting[]>> {
    const queryString = this.buildQueryString(filters);
    const url = queryString ? `${this.baseUrl}/pajak?${queryString}` : `${this.baseUrl}/pajak`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<PaginatedResponse<PajakSetting[]>>(response);
  }

  /**
   * Get tax setting by ID
   */
  async getPajakById(id: string): Promise<ApiResponse<PajakSetting>> {
    const response = await fetch(`${this.baseUrl}/pajak/${id}`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<ApiResponse<PajakSetting>>(response);
  }

  /**
   * Create new tax setting
   */
  async createPajak(data: CreatePajakRequest): Promise<ApiResponse<PajakSetting>> {
    const response = await fetch(`${this.baseUrl}/pajak`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<ApiResponse<PajakSetting>>(response);
  }

  /**
   * Update tax setting
   */
  async updatePajak(id: string, data: UpdatePajakRequest): Promise<ApiResponse<PajakSetting>> {
    const response = await fetch(`${this.baseUrl}/pajak/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<ApiResponse<PajakSetting>>(response);
  }

  /**
   * Delete tax setting
   */
  async deletePajak(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${this.baseUrl}/pajak/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<ApiResponse<null>>(response);
  }

  /**
   * Toggle tax status (active/inactive)
   */
  async togglePajakStatus(id: string): Promise<ApiResponse<PajakSetting>> {
    const response = await fetch(`${this.baseUrl}/pajak/${id}/toggle-status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<ApiResponse<PajakSetting>>(response);
  }

  // ========================================
  // Currency (Mata Uang) Service Methods
  // ========================================

  /**
   * Get list of currency settings with filters and pagination
   */
  async getMatauang(filters: Partial<PajakMatauangFilters> = {}): Promise<PaginatedResponse<MatauangSetting[]>> {
    const queryString = this.buildQueryString(filters);
    const url = queryString ? `${this.baseUrl}/mata-uang?${queryString}` : `${this.baseUrl}/mata-uang`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<PaginatedResponse<MatauangSetting[]>>(response);
  }

  /**
   * Get currency setting by ID
   */
  async getMatauangById(id: string): Promise<ApiResponse<MatauangSetting>> {
    const response = await fetch(`${this.baseUrl}/mata-uang/${id}`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<ApiResponse<MatauangSetting>>(response);
  }

  /**
   * Create new currency setting
   */
  async createMatauang(data: CreateMatauangRequest): Promise<ApiResponse<MatauangSetting>> {
    const response = await fetch(`${this.baseUrl}/mata-uang`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<ApiResponse<MatauangSetting>>(response);
  }

  /**
   * Update currency setting
   */
  async updateMatauang(id: string, data: UpdateMatauangRequest): Promise<ApiResponse<MatauangSetting>> {
    const response = await fetch(`${this.baseUrl}/mata-uang/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<ApiResponse<MatauangSetting>>(response);
  }

  /**
   * Delete currency setting
   */
  async deleteMatauang(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${this.baseUrl}/mata-uang/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<ApiResponse<null>>(response);
  }

  /**
   * Toggle currency status (active/inactive)
   */
  async toggleMatauangStatus(id: string): Promise<ApiResponse<MatauangSetting>> {
    const response = await fetch(`${this.baseUrl}/mata-uang/${id}/toggle-status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<ApiResponse<MatauangSetting>>(response);
  }

  // ========================================
  // Statistics Service Methods
  // ========================================

  /**
   * Get statistics for tax and currency settings
   */
  async getStats(): Promise<ApiResponse<PajakMatauangStats>> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<ApiResponse<PajakMatauangStats>>(response);
  }
}

// Export singleton instance
export const pajakMatauangService = new PajakMatauangService();
export default pajakMatauangService;