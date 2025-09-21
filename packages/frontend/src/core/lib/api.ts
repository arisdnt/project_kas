import { config } from '@/core/config';
import { useAuthStore } from '@/core/store/authStore';
import { getElectronHeaders } from '@/utils/electronAPI';

/**
 * Simple API client for making HTTP requests
 * Follows the same pattern as other services in the codebase
 * Dengan dukungan Electron headers untuk mode desktop
 */
class ApiClient {
  private readonly baseUrl = `${config.api.url}:${config.api.port}/api`;

  private getAuthHeaders() {
    const token = useAuthStore.getState().token;
    const electronHeaders = getElectronHeaders();
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...electronHeaders
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        
        // Jika ada field errors dari validasi backend, buat error yang lebih informatif
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          
          const error = new Error(errorData.message || `Validasi gagal: ${validationErrors}`);
          // Tambahkan informasi tambahan untuk debugging
          (error as any).status = response.status;
          (error as any).errors = errorData.errors;
          (error as any).originalMessage = errorData.message;
          throw error;
        }
        
        // Error biasa tanpa field validasi
        const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).originalData = errorData;
        throw error;
      } else {
        const text = await response.text();
        const error = new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).responseText = text;
        throw error;
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server response is not valid JSON');
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
const api = new ApiClient();
export default api;
