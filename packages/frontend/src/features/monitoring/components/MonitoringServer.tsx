import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { 
  Server, 
  Cpu, 
  HardDrive, 
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { SystemStatus } from '../types/monitoring'

interface MonitoringServerProps {
  status: SystemStatus
}

export function MonitoringServer({ status }: MonitoringServerProps) {
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
          <Server className="h-5 w-5" />
          Application Server
        </CardTitle>
        <CardDescription>
          Node.js application server status
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
                <Cpu className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-600">CPU Usage</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {status.metrik.cpuUsage || 0}%
              </p>
              <p className="text-xs text-gray-500">
                {status.metrik.cpuUsage && status.metrik.cpuUsage < 50 ? 'Normal' : 
                 status.metrik.cpuUsage && status.metrik.cpuUsage < 80 ? 'Moderate' : 'High'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <MemoryStick className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-600">Memory</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {status.metrik.memoryUsage || 0}MB
              </p>
              <p className="text-xs text-gray-500">
                RSS memory usage
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-sm text-orange-800">
            {status.deskripsi}
          </p>
        </div>

        {/* System Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">System Information</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Platform:</span>
              <span>Linux x64</span>
            </div>
            <div className="flex justify-between">
              <span>Node.js:</span>
              <span>v18.17.0</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span>{status.metrik?.uptime || 0}%</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            Restart Server
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