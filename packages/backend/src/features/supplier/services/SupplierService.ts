/**
 * Supplier Service Orchestrator
 * Main service that coordinates supplier operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchSupplierQuery, CreateSupplier, UpdateSupplier, BulkSupplierAction, ImportSupplier, CreateSupplierPaymentTerms, CreateSupplierContactLog } from '../models/SupplierCore';
import { SupplierQueryService } from './modules/SupplierQueryService';
import { SupplierMutationService } from './modules/SupplierMutationService';

export class SupplierService {
  // Query operations
  static async searchSuppliers(scope: AccessScope, query: SearchSupplierQuery) {
    return SupplierQueryService.search(scope, query);
  }

  static async findSupplierById(scope: AccessScope, id: string) {
    const supplier = await SupplierQueryService.findById(scope, id);
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    return supplier;
  }

  static async getSupplierStats(scope: AccessScope, supplierId: string) {
    return SupplierQueryService.getSupplierStats(scope, supplierId);
  }

  static async getPurchaseHistory(scope: AccessScope, supplierId: string, limit: number = 50) {
    return SupplierQueryService.getPurchaseHistory(scope, supplierId, limit);
  }

  static async getSupplierProducts(scope: AccessScope, supplierId: string) {
    return SupplierQueryService.getSupplierProducts(scope, supplierId);
  }

  static async getActiveSuppliers(scope: AccessScope) {
    return SupplierQueryService.getActiveSuppliers(scope);
  }

  static async getPerformanceReport(scope: AccessScope) {
    return SupplierQueryService.getSupplierPerformanceReport(scope);
  }

  static async getContactLogs(scope: AccessScope, supplierId: string, limit: number = 50) {
    return SupplierQueryService.getSupplierContactLogs(scope, supplierId, limit);
  }

  static async getPaymentTerms(scope: AccessScope, supplierId: string) {
    return SupplierQueryService.getSupplierPaymentTerms(scope, supplierId);
  }

  // Mutation operations
  static async createSupplier(scope: AccessScope, data: CreateSupplier) {
    if (scope.level && scope.level > 4) {
      throw new Error('Insufficient permissions to create suppliers');
    }

    if (!scope.storeId) {
      throw new Error('Store ID is required for supplier creation');
    }

    // Auto-set tenant and store if not provided
    if (!data.tenant_id) {
      data.tenant_id = scope.tenantId;
    }
    if (!data.toko_id) {
      data.toko_id = scope.storeId;
    }

    // Validate tenant and store match
    if (data.tenant_id !== scope.tenantId || data.toko_id !== scope.storeId) {
      throw new Error('Cannot create supplier for different tenant or store');
    }

    return SupplierMutationService.create(scope, data);
  }

  static async updateSupplier(scope: AccessScope, id: string, data: UpdateSupplier) {
    if (scope.level && scope.level > 4) {
      throw new Error('Insufficient permissions to update suppliers');
    }

    return SupplierMutationService.update(scope, id, data);
  }

  static async bulkSupplierAction(scope: AccessScope, data: BulkSupplierAction) {
    return SupplierMutationService.bulkAction(scope, data);
  }

  static async importSuppliers(scope: AccessScope, suppliers: ImportSupplier[]) {
    return SupplierMutationService.importSuppliers(scope, suppliers);
  }

  static async createPaymentTerms(scope: AccessScope, data: CreateSupplierPaymentTerms) {
    if (scope.level && scope.level > 3) {
      throw new Error('Insufficient permissions to manage payment terms');
    }

    return SupplierMutationService.createPaymentTerms(scope, data);
  }

  static async logContact(scope: AccessScope, data: CreateSupplierContactLog) {
    if (scope.level && scope.level > 4) {
      throw new Error('Insufficient permissions to log supplier contacts');
    }

    // Auto-set tenant if not provided
    if (!data.tenant_id) {
      data.tenant_id = scope.tenantId;
    }
    // Note: user_id should be provided by the caller

    return SupplierMutationService.logSupplierContact(scope, data);
  }

  static async deleteSupplier(scope: AccessScope, id: string) {
    return SupplierMutationService.deleteSupplier(scope, id);
  }

  static async rateSupplier(scope: AccessScope, supplierId: string, rating: number, notes?: string) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return SupplierMutationService.updateSupplierRating(scope, supplierId, rating, notes);
  }

  // Helper methods
  static async getSupplierWithFullProfile(scope: AccessScope, supplierId: string) {
    const supplier = await this.findSupplierById(scope, supplierId);
    const stats = await this.getSupplierStats(scope, supplierId);
    const recentPurchases = await this.getPurchaseHistory(scope, supplierId, 10);
    const products = await this.getSupplierProducts(scope, supplierId);
    const paymentTerms = await this.getPaymentTerms(scope, supplierId);
    const recentContacts = await this.getContactLogs(scope, supplierId, 5);

    return {
      supplier,
      stats,
      recent_purchases: recentPurchases,
      products,
      payment_terms: paymentTerms,
      recent_contacts: recentContacts
    };
  }

  static async validateSupplierAccess(scope: AccessScope, supplierId: string): Promise<boolean> {
    try {
      await this.findSupplierById(scope, supplierId);
      return true;
    } catch {
      return false;
    }
  }

  // Supplier management helpers
  static async getSuppliersByPerformance(scope: AccessScope, performanceThreshold: number = 70) {
    const performanceReport = await this.getPerformanceReport(scope);
    return performanceReport.filter(supplier => supplier.overall_score >= performanceThreshold);
  }

  static async getTopSuppliers(scope: AccessScope, limit: number = 10) {
    const performanceReport = await this.getPerformanceReport(scope);
    return performanceReport.slice(0, limit);
  }

  static async getSuppliersNeedingAttention(scope: AccessScope) {
    const performanceReport = await this.getPerformanceReport(scope);
    return performanceReport.filter(supplier =>
      supplier.overall_score < 60 ||
      supplier.on_time_delivery_rate < 80 ||
      supplier.payment_terms_compliance < 70
    );
  }

  // Contact and communication helpers
  static async scheduleFollowUp(scope: AccessScope, supplierId: string, followUpDate: Date, subject: string, notes?: string) {
    return this.logContact(scope, {
      supplier_id: supplierId,
      tenant_id: scope.tenantId,
      user_id: '', // Should be provided by caller
      contact_type: 'other',
      subject,
      notes,
      follow_up_date: followUpDate,
      status: 'pending'
    });
  }

  static async markContactCompleted(scope: AccessScope, contactId: string) {
    // This would typically update the contact log status
    // For now, we'll create a new completion log
    return this.logContact(scope, {
      supplier_id: '', // Would need to get from original contact
      tenant_id: scope.tenantId,
      user_id: '', // Should be provided by caller
      contact_type: 'other',
      subject: 'Follow-up completed',
      notes: `Completed follow-up for contact ID: ${contactId}`,
      status: 'completed'
    });
  }
}