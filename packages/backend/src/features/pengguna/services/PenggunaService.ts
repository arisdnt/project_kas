import bcrypt from 'bcryptjs';
import { PenggunaModel, PenggunaCreateInput, PenggunaUpdateInput } from '../models/PenggunaModel';

interface ListScopeParams {
  search?: string;
  page: number;
  limit: number;
  // context
  tenantId: string;
  tokoId?: string;
  level: number; // role level from peran (mapped in Auth)
  isGod?: boolean;
}

export class PenggunaService {
  private static readonly SALT_ROUNDS = 12;

  static async listScoped(params: ListScopeParams) {
    const { search, page, limit, tenantId, tokoId, level, isGod } = params;
    const offset = (page - 1) * limit;

    // Level Mapping (assumption based on request):
    // level 1 (god / super admin) => all users (global)
    // level 2 (admin) => tenant scope
    // level 3-5 => store scope (toko)

    if (isGod || level === 1) {
      return PenggunaModel.listGlobal({ search, limit, offset });
    }
    if (level === 2) {
      return PenggunaModel.list(tenantId, { search, limit, offset });
    }
    // levels 3-5: need tokoId; if missing fallback to tenant scope to avoid empty silent result
    if (level >= 3) {
      if (tokoId) {
        return PenggunaModel.listByStore(tenantId, tokoId, { search, limit, offset });
      }
      return PenggunaModel.list(tenantId, { search, limit, offset });
    }
    // default fallback
    return PenggunaModel.list(tenantId, { search, limit, offset });
  }

  static async get(id: string, tenantId: string) {
    return PenggunaModel.findById(id, tenantId);
  }

  static async create(input: PenggunaCreateInput, tenantId: string) {
    const exists = await PenggunaModel.existsUsername(input.username, tenantId);
    if (exists) throw new Error('Username sudah digunakan');
    const password_hash = await bcrypt.hash(input.password, this.SALT_ROUNDS);
    return PenggunaModel.create({ ...input, password_hash }, tenantId);
  }

  static async update(id: string, tenantId: string, input: PenggunaUpdateInput) {
    if (input.username) {
      const exists = await PenggunaModel.existsUsername(input.username, tenantId, id);
      if (exists) throw new Error('Username sudah digunakan');
    }
    let password_hash: string | undefined;
    if (input.password) {
      password_hash = await bcrypt.hash(input.password, this.SALT_ROUNDS);
    }
    const updated = await PenggunaModel.update(id, tenantId, { ...input, password_hash });
    if (!updated) throw new Error('Pengguna tidak ditemukan');
    return updated;
  }

  static async delete(id: string, tenantId: string) {
    const ok = await PenggunaModel.remove(id, tenantId);
    if (!ok) throw new Error('Pengguna tidak ditemukan');
    return ok;
  }
}
