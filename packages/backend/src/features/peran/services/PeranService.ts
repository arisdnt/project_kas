import { PeranModel, PeranCreateInput, PeranUpdateInput } from '../models/PeranModel';
import { logger } from '@/core/utils/logger';

export class PeranService {
  static async list(tenantId: string) {
    return PeranModel.findAll(tenantId);
  }

  static async get(id: string, tenantId: string) {
    return PeranModel.findById(id, tenantId);
  }

  static async create(input: PeranCreateInput, tenantId: string) {
    const existing = (await PeranModel.findAll(tenantId)).find(p => p.nama.toLowerCase() === input.nama.toLowerCase());
    if (existing) {
      throw new Error('Nama peran sudah ada');
    }
    const peran = await PeranModel.create(input, tenantId);
    logger.info({ peranId: peran.id, tenantId }, 'Peran created');
    return peran;
  }

  static async update(id: string, tenantId: string, input: PeranUpdateInput) {
    const peran = await PeranModel.update(id, tenantId, input);
    if (!peran) throw new Error('Peran tidak ditemukan');
    logger.info({ peranId: id, tenantId }, 'Peran updated');
    return peran;
  }

  static async delete(id: string, tenantId: string) {
    const ok = await PeranModel.remove(id, tenantId);
    if (!ok) throw new Error('Peran tidak ditemukan');
    logger.info({ peranId: id, tenantId }, 'Peran deleted');
    return true;
  }
}
