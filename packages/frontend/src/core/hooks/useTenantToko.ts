import { useEffect, useState } from 'react'
import { useAuthStore } from '@/core/store/authStore'
import { config } from '@/core/config'

type State = {
  tenantName: string
  tokoName: string
  loading: boolean
}

export function useTenantToko() {
  const { token } = useAuthStore()
  const [state, setState] = useState<State>({ tenantName: '-', tokoName: config.infoToko.nama, loading: true })

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!token) {
        setState((s) => ({ ...s, loading: false }))
        return
      }
      try {
        const res = await fetch(`${config.api.url}:${config.api.port}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed')
        const json = await res.json()
        const profile = json?.data?.profile || json?.data
        const tenantName = profile?.nama_tenant || '-'
        const tokoName = profile?.nama_toko || config.infoToko.nama
        if (!cancelled) setState({ tenantName, tokoName, loading: false })
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false }))
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [token])

  return state
}

