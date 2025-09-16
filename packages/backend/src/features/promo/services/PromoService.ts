/**
 * Promo Service Orchestrator
 * Main service that coordinates promo operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchPromoQuery, CreatePromo, UpdatePromo, ValidatePromoRequest } from '../models/PromoCore';
import { PromoQueryService } from './modules/PromoQueryService';
import { PromoMutationService, CreatePromoRequest } from './modules/PromoMutationService';
import { PromoValidationService } from './modules/PromoValidationService';

export class PromoService {
  // Query operations
  static async search(scope: AccessScope, query: SearchPromoQuery) {
    return PromoQueryService.search(scope, query);
  }

  static async findById(scope: AccessScope, id: string) {
    const promo = await PromoQueryService.findById(scope, id);
    if (!promo) {
      throw new Error('Promo not found');
    }

    const relations = await PromoQueryService.getPromoRelations(scope, id);
    return { ...promo, ...relations };
  }

  static async findByCode(scope: AccessScope, kodePromo: string) {
    const promo = await PromoQueryService.findByCode(scope, kodePromo);
    if (!promo) {
      throw new Error('Promo not found or inactive');
    }
    return promo;
  }

  // Mutation operations
  static async create(scope: AccessScope, request: CreatePromoRequest) {
    if (!scope.storeId) {
      throw new Error('Store ID is required for promo creation');
    }

    // Validate promo data
    this.validatePromoData(request.promo);

    return PromoMutationService.create(scope, request);
  }

  static async update(scope: AccessScope, id: string, data: UpdatePromo) {
    if (data.tanggal_mulai || data.tanggal_berakhir) {
      // Get current promo to validate date changes
      const currentPromo = await PromoQueryService.findById(scope, id);
      if (!currentPromo) {
        throw new Error('Promo not found');
      }

      const startDate = data.tanggal_mulai || currentPromo.tanggal_mulai;
      const endDate = data.tanggal_berakhir || currentPromo.tanggal_berakhir;

      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }

    return PromoMutationService.update(scope, id, data);
  }

  static async delete(scope: AccessScope, id: string) {
    return PromoMutationService.delete(scope, id);
  }

  // Validation operations
  static async validatePromo(
    scope: AccessScope,
    request: ValidatePromoRequest,
    items?: Array<{ produk_id: string; kategori_id: string }>
  ) {
    return PromoValidationService.validatePromo(
      scope,
      request.kode_promo,
      request.subtotal,
      request.pelanggan_id,
      items
    );
  }

  static async applyPromo(
    scope: AccessScope,
    promoId: string,
    transaksiId: string,
    pelangganId: string | undefined,
    kodePromo: string,
    nilaiDiskon: number
  ) {
    return PromoValidationService.applyPromo(
      scope,
      promoId,
      transaksiId,
      pelangganId,
      kodePromo,
      nilaiDiskon
    );
  }

  // Private helper methods
  private static validatePromoData(promo: CreatePromo) {
    if (promo.tanggal_berakhir <= promo.tanggal_mulai) {
      throw new Error('End date must be after start date');
    }

    if (promo.nilai_diskon <= 0) {
      throw new Error('Discount value must be greater than 0');
    }

    if (promo.tipe_diskon === 'persen' && promo.nilai_diskon > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }
  }
}