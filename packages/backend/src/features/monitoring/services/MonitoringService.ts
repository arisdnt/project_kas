import { Server, Socket } from 'socket.io'
import { testConnection } from '@/core/database/connection'
import { logger } from '@/core/utils/logger'

interface SystemStatus {
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

interface MonitoringData {
  api: SystemStatus
  database: SystemStatus
  websocket: SystemStatus
  server: SystemStatus
}

export class MonitoringService {
  private io: Server
  private monitoringInterval: NodeJS.Timeout | null = null

  constructor(io: Server) {
    this.io = io
    this.startMonitoring()
  }

  private async getDatabaseStatus(): Promise<SystemStatus> {
    try {
      const isConnected = await testConnection()
      return {
        id: 'db-1',
        nama: 'Database MySQL',
        status: isConnected ? 'online' : 'offline',
        deskripsi: 'Koneksi database utama',
        timestamp: new Date(),
        metrik: {
          uptime: isConnected ? 99.95 : 0
        }
      }
    } catch (error) {
      logger.error('Database monitoring error:', error)
      return {
        id: 'db-1',
        nama: 'Database MySQL',
        status: 'error',
        deskripsi: 'Koneksi database utama',
        timestamp: new Date(),
        metrik: {
          uptime: 0
        }
      }
    }
  }

  private getAPIStatus(): SystemStatus {
    // Simulate API status check
    const responseTime = Math.random() * 100 + 20 // 20-120ms
    let status: SystemStatus['status'] = 'online'
    
    if (responseTime > 100) {
      status = 'warning'
    }
    if (responseTime > 200) {
      status = 'error'
    }

    return {
      id: 'api-1',
      nama: 'API Server',
      status,
      deskripsi: 'REST API endpoints untuk aplikasi',
      timestamp: new Date(),
      metrik: {
        responseTime,
        uptime: 99.9
      }
    }
  }

  private getWebSocketStatus(): SystemStatus {
    const clientCount = this.io.engine.clientsCount
    const uptime = clientCount > 0 ? 99.8 : 0

    return {
      id: 'ws-1',
      nama: 'WebSocket Server',
      status: clientCount > 0 ? 'online' : 'warning',
      deskripsi: 'Real-time data synchronization',
      timestamp: new Date(),
      metrik: {
        uptime
      }
    }
  }

  private getServerStatus(): SystemStatus {
    const memUsage = process.memoryUsage()
    const cpuUsage = Math.random() * 30 // Simulate CPU usage 0-30%
    const uptime = process.uptime()

    let status: SystemStatus['status'] = 'online'
    if (cpuUsage > 70) status = 'warning'
    if (cpuUsage > 90) status = 'error'

    return {
      id: 'server-1',
      nama: 'Application Server',
      status,
      deskripsi: 'Node.js application server',
      timestamp: new Date(),
      metrik: {
        memoryUsage: Math.round(memUsage.heapUsed / 1024 / 1024), // Convert to MB
        cpuUsage,
        uptime: 99.7
      }
    }
  }

  private async getMonitoringData(): Promise<MonitoringData> {
    const [databaseStatus, apiStatus, websocketStatus, serverStatus] = await Promise.all([
      this.getDatabaseStatus(),
      Promise.resolve(this.getAPIStatus()),
      Promise.resolve(this.getWebSocketStatus()),
      Promise.resolve(this.getServerStatus())
    ])

    return {
      api: apiStatus,
      database: databaseStatus,
      websocket: websocketStatus,
      server: serverStatus
    }
  }

  private broadcastMonitoringData() {
    this.getMonitoringData().then(data => {
      this.io.emit('monitoring:update', data)
      logger.info('Broadcasting monitoring data update')
    }).catch(error => {
      logger.error('Failed to broadcast monitoring data:', error)
    })
  }

  private startMonitoring() {
    // Broadcast monitoring data every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.broadcastMonitoringData()
    }, 30000)

    // Initial broadcast
    this.broadcastMonitoringData()
  }

  public handleSocketConnection(socket: Socket) {
    logger.info(`Monitoring socket connected: ${socket.id}`)

    // Send initial data when requested
    socket.on('monitoring:request_data', async () => {
      try {
        const data = await this.getMonitoringData()
        socket.emit('monitoring:update', data)
        logger.info(`Sent initial monitoring data to socket: ${socket.id}`)
      } catch (error) {
        logger.error(`Failed to send monitoring data to socket ${socket.id}:`, error)
        socket.emit('monitoring:error', { message: 'Failed to fetch monitoring data' })
      }
    })

    socket.on('disconnect', () => {
      logger.info(`Monitoring socket disconnected: ${socket.id}`)
    })
  }

  public stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }
}