import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { SystemStatus } from '../types/monitoring'

interface MonitoringAPIProps {
  status: SystemStatus
}

export function MonitoringAPI({ status }: MonitoringAPIProps) {
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

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          API Server
        </CardTitle>
        <CardDescription>
          Status REST API endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Status</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.status)}
            <Badge className={getStatusColor(status.status)}>
              {status.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Metrics */}
        {status.metrik && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-600">Response Time</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {status.metrik.responseTime || 0}ms
              </p>
              <p className="text-xs text-gray-500">
                {status.metrik.responseTime && status.metrik.responseTime < 100 ? 'Good' : 
                 status.metrik.responseTime && status.metrik.responseTime < 500 ? 'Fair' : 'Slow'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-600">Uptime</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {status.metrik.uptime || 0}%
              </p>
              <p className="text-xs text-gray-500">
                Last 30 days
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            {status.deskripsi}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            Test Connection
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            View Logs
          </Button>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center">
          Terakhir diperbarui: {status.timestamp.toLocaleString('id-ID')}
        </div>
      </CardContent>
    </Card>
  )
}