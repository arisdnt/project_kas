/**
 * Document Core Model
 * Document and file management model with MinIO integration
 */

import { z } from 'zod';

export const DokumenMinioSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  user_id: z.string().uuid(),
  bucket_name: z.string().min(3).max(63),
  object_key: z.string().min(1),
  url_dokumen: z.string().url(),
  nama_file: z.string().min(1),
  nama_file_asli: z.string().min(1),
  tipe_file: z.string().min(1),
  ukuran_file: z.number().int().min(0),
  mime_type: z.string().optional(),
  hash_file: z.string().optional(),
  kategori_dokumen: z.enum(['invoice', 'receipt', 'product_image', 'user_avatar', 'report', 'backup', 'other']).default('other'),
  deskripsi: z.string().optional(),
  status: z.enum(['uploaded', 'processing', 'error', 'deleted']).default('uploaded'),
  is_public: z.boolean().default(false),
  expires_at: z.date().optional(),
  metadata_json: z.record(z.any()).optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateDokumenMinioSchema = DokumenMinioSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateDokumenMinioSchema = DokumenMinioSchema.partial().omit({
  id: true,
  tenant_id: true,
  toko_id: true,
  user_id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const SearchDokumenQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  tipe_file: z.string().optional(),
  kategori_dokumen: z.enum(['invoice', 'receipt', 'product_image', 'user_avatar', 'report', 'backup', 'other']).optional(),
  status: z.enum(['uploaded', 'processing', 'error', 'deleted']).optional(),
  is_public: z.boolean().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const FileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number(),
  buffer: z.instanceof(Buffer)
});

export const UploadConfigSchema = z.object({
  kategori_dokumen: z.enum(['invoice', 'receipt', 'product_image', 'user_avatar', 'report', 'backup', 'other']).default('other'),
  deskripsi: z.string().optional(),
  is_public: z.boolean().default(false),
  expires_at: z.string().datetime().optional()
});

export type DokumenMinio = z.infer<typeof DokumenMinioSchema>;
export type CreateDokumenMinio = z.infer<typeof CreateDokumenMinioSchema>;
export type UpdateDokumenMinio = z.infer<typeof UpdateDokumenMinioSchema>;
export type SearchDokumenQuery = z.infer<typeof SearchDokumenQuerySchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type UploadConfig = z.infer<typeof UploadConfigSchema>;