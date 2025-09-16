import api from '@/core/lib/api'
import { config } from '@/core/config'
import { TokoApiService } from './tokoApiService'

export type InfoToko = {
  nama: string
  alamat: string
  emailKontak: string
  teleponKontak: string
}

// Legacy compatibility - maps old interface to new API structure
export async function getInfoToko(): Promise<InfoToko> {
  try {
    // Try the new store API first
    const stores = await TokoApiService.getActiveStores()
    if (stores.length > 0) {
      const store = stores[0]
      return {
        nama: store.nama,
        alamat: store.alamat || '',
        emailKontak: store.email || '',
        teleponKontak: store.telepon || ''
      }
    }

    // Fallback to old API
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
  try {
    // Try the new store API first
    const stores = await TokoApiService.getActiveStores()
    if (stores.length > 0) {
      const store = stores[0]
      const updatedStore = await TokoApiService.updateStore(store.id, {
        nama: payload.nama,
        alamat: payload.alamat,
        email: payload.emailKontak,
        telepon: payload.teleponKontak
      })

      return {
        nama: updatedStore.nama,
        alamat: updatedStore.alamat || '',
        emailKontak: updatedStore.email || '',
        teleponKontak: updatedStore.telepon || ''
      }
    }

    // Fallback to old API
    const data = await api.put<InfoToko>('/settings/info-toko', payload)
    return data
  } catch (err) {
    throw new Error('Endpoint penyimpanan belum tersedia. Perubahan hanya berlaku di sesi saat ini.')
  }
}

