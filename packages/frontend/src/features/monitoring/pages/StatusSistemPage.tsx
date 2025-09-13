import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { 
  Activity, 
  Database, 
  Wifi, 
  Server, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { SystemStatus, MonitoringData } from '../types/monitoring'
import { MonitoringAPI } from '../components/MonitoringAPI'
import { MonitoringDatabase } from '../components/MonitoringDatabase'
import { MonitoringWebSocket } from '../components/MonitoringWebSocket'
import { MonitoringServer } from '../components/MonitoringServer'

const getStatusIcon = (status: SystemStatus['status']) => {
  switch (status) {
    case 'online':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />
    case 'offline':
      return <XCircle className="h-5 w-5 text-gray-500" />
  }
}

const getStatusColor = (status: SystemStatus['status']) => {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'offline':
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function StatusSistemPage() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    api: {
      id: 'api-1',
      nama: 'API Server',
      status: 'online',
      deskripsi: 'REST API endpoints untuk aplikasi',
      timestamp: new Date(),
      metrik: {
        responseTime: 45,
        uptime: 99.9
      }
    },
    database: {
      id: 'db-1',
      nama: 'Database MySQL',
      status: 'online',
      deskripsi: 'Koneksi database utama',
      timestamp: new Date(),
      metrik: {
        uptime: 99.95
      }
    },
    websocket: {
      id: 'ws-1',
      nama: 'WebSocket Server',
      status: 'online',
      deskripsi: 'Real-time data synchronization',
      timestamp: new Date(),
      metrik: {
        uptime: 99.8
      }
    },
    server: {
      id: 'server-1',
      nama: 'Application Server',
      status: 'online',
      deskripsi: 'Node.js application server',
      timestamp: new Date(),
      metrik: {
        memoryUsage: 256,
        cpuUsage: 15,
        uptime: 99.7
      }
    }
  })

  const [isLoading, setIsLoading] = useState(false)

  const refreshStatus = async () => {
    setIsLoading(true)
    try {
      // Simulate API call to refresh status
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update with current timestamp
      setMonitoringData(prev => ({
        api: { ...prev.api, timestamp: new Date() },
        database: { ...prev.database, timestamp: new Date() },
        websocket: { ...prev.websocket, timestamp: new Date() },
        server: { ...prev.server, timestamp: new Date() }
      }))
    } catch (error) {
      console.error('Failed to refresh status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Status Sistem</h1>
              <p className="mt-1 text-sm text-gray-600">
                Monitoring real-time status API, Database, dan WebSocket
              </p>
            </div>
            <Button
              onClick={refreshStatus}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                API Status
              </CardTitle>
              <Activity className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(monitoringData.api.status)}
                <Badge className={getStatusColor(monitoringData.api.status)}>
                  {monitoringData.api.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                {monitoringData.api.metrik?.responseTime}ms response time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Database Status
              </CardTitle>
              <Database className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(monitoringData.database.status)}
                <Badge className={getStatusColor(monitoringData.database.status)}>
                  {monitoringData.database.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                {monitoringData.database.metrik?.uptime}% uptime
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                WebSocket Status
              </CardTitle>
              <Wifi className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(monitoringData.websocket.status)}
                <Badge className={getStatusColor(monitoringData.websocket.status)}>
                  {monitoringData.websocket.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                {monitoringData.websocket.metrik?.uptime}% uptime
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Server Status
              </CardTitle>
              <Server className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(monitoringData.server.status)}
                <Badge className={getStatusColor(monitoringData.server.status)}>
                  {monitoringData.server.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                {monitoringData.server.metrik?.cpuUsage}% CPU
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Monitoring Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <MonitoringAPI status={monitoringData.api} />
            <MonitoringDatabase status={monitoringData.database} />
          </div>
          <div className="space-y-8">
            <MonitoringWebSocket status={monitoringData.websocket} />
            <MonitoringServer status={monitoringData.server} />
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Terakhir diperbarui: {monitoringData.api.timestamp.toLocaleString('id-ID')}
        </div>
      </div>
    </div>
  )
}