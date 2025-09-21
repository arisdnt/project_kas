import { memo, useState, useEffect } from 'react'
import { Badge } from '@/core/components/ui/badge'
import { useAuthStore, useCachedStores } from '@/core/store/authStore'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import {
  Wifi,
  WifiOff,
  Database,
  Clock,
  Store,
  User,
  Building2,
  Zap
} from 'lucide-react'
import { config } from '@/core/config'

export const KasirNavbar = memo(() => {
  const { user, token } = useAuthStore()
  const stores = useCachedStores()
  const { lastSyncTime } = useKasirStore()

  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date())

  // Connection status states
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [dbStatus, setDbStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [apiPing, setApiPing] = useState<number | null>(null)
  const [dbPing, setDbPing] = useState<number | null>(null)

  // Get current store info
  const currentStore = stores.find(store => store.id === user?.tokoId)
  const storeName = currentStore?.nama || 'Toko Tidak Diketahui'
  const tenantName = user?.tenantId ? `Tenant ${user.tenantId}` : 'Tenant Tidak Diketahui'
  const cashierName = user?.namaLengkap || user?.nama || user?.fullName || 'Kasir'

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Check API and DB status periodically
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const start = Date.now()
        const response = await fetch(`${config.api.url}:${config.api.port}/api/health`, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        })
        const end = Date.now()

        if (response.ok) {
          setApiStatus('online')
          setApiPing(end - start)
        } else {
          setApiStatus('offline')
          setApiPing(null)
        }
      } catch (error) {
        setApiStatus('offline')
        setApiPing(null)
      }
    }

    const checkDbStatus = async () => {
      try {
        const start = Date.now()
        const response = await fetch(`${config.api.url}:${config.api.port}/api/database/health`, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        })
        const end = Date.now()

        if (response.ok) {
          setDbStatus('online')
          setDbPing(end - start)
        } else {
          setDbStatus('offline')
          setDbPing(null)
        }
      } catch (error) {
        setDbStatus('offline')
        setDbPing(null)
      }
    }

    // Initial check
    checkApiStatus()
    checkDbStatus()

    // Check every 30 seconds
    const apiInterval = setInterval(checkApiStatus, 30000)
    const dbInterval = setInterval(checkDbStatus, 30000)

    return () => {
      clearInterval(apiInterval)
      clearInterval(dbInterval)
    }
  }, [token])

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format last sync time
  const formatLastSync = () => {
    if (!lastSyncTime) return 'Belum pernah sinkron'

    const now = new Date()
    const sync = new Date(lastSyncTime)
    const diffMs = now.getTime() - sync.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)

    if (diffMinutes < 1) return 'Baru saja'
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} jam lalu`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} hari lalu`
  }

  return (
    <div className="w-full bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section: Store & Tenant Info */}
        <div className="flex items-center space-x-6">
          {/* Store Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
              <Store className="w-5 h-5 text-blue-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">{storeName}</span>
              <span className="text-xs text-slate-500">Toko Aktif</span>
            </div>
          </div>

          {/* Tenant Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">{tenantName}</span>
              <span className="text-xs text-slate-500">Organisasi</span>
            </div>
          </div>

          {/* Cashier Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
              <User className="w-5 h-5 text-purple-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">{cashierName}</span>
              <span className="text-xs text-slate-500">Kasir</span>
            </div>
          </div>
        </div>

        {/* Center Section: App Identity */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl">
            <Zap className="w-6 h-6 text-indigo-700" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-slate-900">KasirApp</span>
            <span className="text-xs text-slate-500">Point of Sales</span>
          </div>
        </div>

        {/* Right Section: Time, Status & Sync */}
        <div className="flex items-center space-x-6">
          {/* Date & Time */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">{formatTime(currentTime)}</span>
              <span className="text-xs text-slate-500">{formatDate(currentTime)}</span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            {/* API Status */}
            <div className="flex items-center space-x-2">
              {apiStatus === 'online' ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : apiStatus === 'offline' ? (
                <WifiOff className="w-4 h-4 text-red-600" />
              ) : (
                <Wifi className="w-4 h-4 text-yellow-600 animate-pulse" />
              )}
              <div className="flex flex-col">
                <Badge
                  variant={apiStatus === 'online' ? 'default' : apiStatus === 'offline' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  API {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Checking'}
                </Badge>
                {apiPing && (
                  <span className="text-xs text-slate-500">{apiPing}ms</span>
                )}
              </div>
            </div>

            {/* Database Status */}
            <div className="flex items-center space-x-2">
              {dbStatus === 'online' ? (
                <Database className="w-4 h-4 text-green-600" />
              ) : dbStatus === 'offline' ? (
                <Database className="w-4 h-4 text-red-600" />
              ) : (
                <Database className="w-4 h-4 text-yellow-600 animate-pulse" />
              )}
              <div className="flex flex-col">
                <Badge
                  variant={dbStatus === 'online' ? 'default' : dbStatus === 'offline' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  DB {dbStatus === 'online' ? 'Online' : dbStatus === 'offline' ? 'Offline' : 'Checking'}
                </Badge>
                {dbPing && (
                  <span className="text-xs text-slate-500">{dbPing}ms</span>
                )}
              </div>
            </div>
          </div>

          {/* Last Sync */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500">Sinkron Terakhir</span>
            <span className="text-sm font-medium text-slate-700">{formatLastSync()}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

KasirNavbar.displayName = 'KasirNavbar'