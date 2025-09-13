import api from '@/core/lib/api'
import { config } from '@/core/config'

export type InfoToko = {
  nama: string
  alamat: string
  emailKontak: string
  teleponKontak: string
}

// Attempt to get from API; fall back to local config when API is absent
export async function getInfoToko(): Promise<InfoToko> {
  try {
    const data = await api.get<InfoToko>('/settings/info-toko')
    return data
  } catch {
    return {
      nama: config.infoToko.nama,
      alamat: config.infoToko.alamat,
      emailKontak: config.infoToko.emailKontak,
      teleponKontak: config.infoToko.teleponKontak
    }
  }
}

export async function updateInfoToko(payload: InfoToko): Promise<InfoToko> {
  // Try to persist via API; if unavailable, throw an informative error
  try {
    const data = await api.put<InfoToko>('/settings/info-toko', payload)
    return data
  } catch (err) {
    throw new Error('Endpoint penyimpanan belum tersedia. Perubahan hanya berlaku di sesi saat ini.')
  }
}

