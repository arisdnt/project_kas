import { Promo, CreatePromoRequest, UpdatePromoRequest, PromoStats } from '../types/promo';
import { config } from '@/core/config';
import { useAuthStore } from '@/core/store/authStore';

class PromoService {
  private readonly baseUrl = `${config.api.url}:${config.api.port}/api/promos`;

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
        // Response is not JSON (likely HTML error page)
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

  // Get all promos
  async getPromos(): Promise<Promo[]> {
    const response = await fetch(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse<Promo[]>(response);
    // Ensure we always return an array
    return Array.isArray(data) ? data : [];
  }

  // Get promo by ID
  async getPromoById(id: number): Promise<Promo> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch promo');
    }
    return response.json();
  }

  // Create new promo
  async createPromo(promo: CreatePromoRequest): Promise<Promo> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(promo),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create promo');
    }
    
    return response.json();
  }

  // Update promo
  async updatePromo(id: number, promo: UpdatePromoRequest): Promise<Promo> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(promo),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update promo');
    }
    
    return response.json();
  }

  // Delete promo
  async deletePromo(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete promo');
    }
  }

  // Toggle promo status
  async togglePromoStatus(id: number): Promise<Promo> {
    const response = await fetch(`${this.baseUrl}/${id}/toggle`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle promo status');
    }
    
    return response.json();
  }

  // Get promo stats
  async getPromoStats(): Promise<PromoStats> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<PromoStats>(response);
  }

  // Get active promos
  async getActivePromos(): Promise<Promo[]> {
    const response = await fetch(`${this.baseUrl}/active`, {
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse<Promo[]>(response);
    // Ensure we always return an array
    return Array.isArray(data) ? data : [];
  }

  // Get promos by date range
  async getPromosByDateRange(startDate: string, endDate: string): Promise<Promo[]> {
    const response = await fetch(`${this.baseUrl}/range?start_date=${startDate}&end_date=${endDate}`, {
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse<Promo[]>(response);
    // Ensure we always return an array
    return Array.isArray(data) ? data : [];
  }
}

export const promoService = new PromoService();