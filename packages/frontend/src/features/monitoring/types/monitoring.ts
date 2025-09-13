export interface SystemStatus {
  id: string
  nama: string
  status: 'online' | 'offline' | 'warning' | 'error'
  deskripsi: string
  timestamp: Date
  metrik?: {
    responseTime?: number
    uptime?: number
    memoryUsage?: number
    cpuUsage?: number
  }
}

export interface MonitoringData {
  api: SystemStatus
  database: SystemStatus
  websocket: SystemStatus
  server: SystemStatus
}

export interface MonitoringEvent {
  type: 'status_update' | 'metric_update' | 'alert'
  sistem: string
  data: SystemStatus
  timestamp: Date
}