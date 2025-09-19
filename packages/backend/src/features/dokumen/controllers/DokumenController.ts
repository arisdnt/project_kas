/**
 * Document Controller
 * Handles document operations with access scope validation and file upload
 */

import { Request, Response } from 'express';
import { DokumenService } from '../services/DokumenService';
import { SearchDokumenQuerySchema, UpdateDokumenMinioSchema, UploadConfigSchema } from '../models/DokumenCore';
import multer from 'multer';

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

export class DokumenController {
  static uploadMiddleware = upload.single('file') as any;

  static async searchDocuments(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchDokumenQuerySchema.parse(req.query);
      const result = await DokumenService.searchDocuments(req.accessScope, query);

      // Align response shape with frontend expectation (dokumenService.getList)
      // Frontend expects: { success, data: { items, total, page, limit, totalPages } }
      return res.json({
        success: true,
        data: {
          items: result.data,
          total: result.total,
          page: result.page,
          limit: Number(query.limit),
          totalPages: result.totalPages
        }
      });
    } catch (error: any) {
      console.error('Search documents error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search documents'
      });
    }
  }

  static async findDocumentById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const document = await DokumenService.findDocumentById(req.accessScope, id);

      return res.json({ success: true, data: document });
    } catch (error: any) {
      console.error('Find document error:', error);
      if (error.message === 'Document not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getDocumentsByCategory(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { kategori } = req.params;
      const documents = await DokumenService.getDocumentsByCategory(req.accessScope, kategori);

      return res.json({ success: true, data: documents });
    } catch (error: any) {
      console.error('Get documents by category error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async uploadDocument(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided' });
      }

      // Parse upload configuration
      const config = UploadConfigSchema.parse({
        kategori_dokumen: req.body.kategori_dokumen || 'other',
        deskripsi: req.body.deskripsi,
        is_public: req.body.is_public === 'true',
        expires_at: req.body.expires_at
      });

      const result = await DokumenService.uploadDocument(req.accessScope, req.file, config, req.user.id);

      return res.status(201).json({
        success: true,
        data: result.document,
        message: 'Document uploaded successfully'
      });
    } catch (error: any) {
      console.error('Upload document error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to upload document'
      });
    }
  }

  static async updateDocument(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateDokumenMinioSchema.parse(req.body);
      const result = await DokumenService.updateDocument(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update document error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update document'
      });
    }
  }

  static async deleteDocument(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const result = await DokumenService.deleteDocument(req.accessScope, id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Delete document error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete document'
      });
    }
  }

  static async getStorageStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const stats = await DokumenService.getStorageStats(req.accessScope);
      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get storage stats error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async cleanupExpiredDocuments(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only God and Admin users can cleanup expired documents
      if (req.user.level && req.user.level > 2) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }

      const result = await DokumenService.cleanupExpiredDocuments();
      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Cleanup expired documents error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async fixMimeTypes(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only God and Admin users can fix MIME types
      if (req.user.level && req.user.level > 2) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }

      const result = await DokumenService.fixIncorrectMimeTypes();
      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Fix MIME types error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getFileUrl(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const url = await DokumenService.getPresignedUrl(req.accessScope, id);

      return res.json({
        success: true,
        data: { url }
      });
    } catch (error: any) {
      console.error('Get file URL error:', error);
      if (error.message === 'Document not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async streamFile(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const streamData = await DokumenService.getFileStream(req.accessScope, id);

      // Set headers
      res.setHeader('Content-Type', streamData.contentType || 'application/octet-stream');
      if (streamData.size) {
        res.setHeader('Content-Length', streamData.size);
      }

      // Pipe the stream to response
      return new Promise<void>((resolve) => {
        streamData.stream.once('end', () => {
          resolve();
        });
        streamData.stream.once('error', (err: any) => {
          console.error('Stream piping error:', err);
          if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Stream error' });
          } else {
            try { res.end(); } catch {}
          }
          resolve();
        });
        streamData.stream.pipe(res);
      });
    } catch (error: any) {
      console.error('Stream file error:', error);
      if (error.message === 'Document not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getObjectUrl(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { object_key } = req.body;
      if (!object_key) {
        return res.status(400).json({ success: false, message: 'Object key is required' });
      }

      // Generate presigned URL for the object key
      const url = await DokumenService.getPresignedUrlByObjectKey(object_key);

      return res.json({
        success: true,
        data: { url }
      });
    } catch (error: any) {
      console.error('Get object URL error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}