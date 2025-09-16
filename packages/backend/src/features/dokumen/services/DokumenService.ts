/**
 * Document Service Orchestrator
 * Main service that coordinates document operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchDokumenQuery, UpdateDokumenMinio, FileUpload, UploadConfig } from '../models/DokumenCore';
import { DokumenQueryService } from './modules/DokumenQueryService';
import { DokumenMutationService } from './modules/DokumenMutationService';

export class DokumenService {
  // Query operations
  static async searchDocuments(scope: AccessScope, query: SearchDokumenQuery) {
    return DokumenQueryService.search(scope, query);
  }

  static async findDocumentById(scope: AccessScope, id: string) {
    const document = await DokumenQueryService.findById(scope, id);
    if (!document) {
      throw new Error('Document not found');
    }
    return document;
  }

  static async getDocumentsByCategory(scope: AccessScope, kategori: string) {
    return DokumenQueryService.getDocumentsByCategory(scope, kategori);
  }

  static async getStorageStats(scope: AccessScope) {
    return DokumenQueryService.getStorageStats(scope);
  }

  // Mutation operations
  static async uploadDocument(scope: AccessScope, file: FileUpload, config: UploadConfig, userId: string) {
    if (!scope.storeId) {
      throw new Error('Store ID is required for document upload');
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds maximum limit of 50MB');
    }

    // Validate file type based on category
    this.validateFileType(file, config.kategori_dokumen);

    return DokumenMutationService.uploadDocument(scope, file, config, userId);
  }

  static async updateDocument(scope: AccessScope, id: string, data: UpdateDokumenMinio) {
    return DokumenMutationService.updateDocument(scope, id, data);
  }

  static async deleteDocument(scope: AccessScope, id: string) {
    return DokumenMutationService.deleteDocument(scope, id);
  }

  static async cleanupExpiredDocuments() {
    return DokumenMutationService.cleanupExpiredDocuments();
  }

  // Private helper methods
  private static validateFileType(file: FileUpload, category: string) {
    const allowedTypes: Record<string, string[]> = {
      'product_image': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      'user_avatar': ['image/jpeg', 'image/png', 'image/webp'],
      'invoice': ['application/pdf', 'image/jpeg', 'image/png'],
      'receipt': ['application/pdf', 'image/jpeg', 'image/png'],
      'report': ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
      'backup': ['application/zip', 'application/x-tar', 'application/gzip'],
      'other': [] // No restrictions
    };

    const allowed = allowedTypes[category];
    if (allowed && allowed.length > 0 && !allowed.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed for category ${category}`);
    }
  }
}