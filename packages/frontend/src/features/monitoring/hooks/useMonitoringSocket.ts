import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { MonitoringData, MonitoringEvent } from '../types/monitoring'

interface UseMonitoringSocketProps {
  url?: string
  autoConnect?: boolean
}

export function useMonitoringSocket({
  url = 'http://localhost:3001',
  autoConnect = true
}: UseMonitoringSocketProps = {}) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null)
  const [events, setEvents] = useState<MonitoringEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!autoConnect) return

    // Initialize Socket.IO connection
    const newSocket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      setError(null)
      console.log('Monitoring socket connected')
    })

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false)
      console.log('Monitoring socket disconnected:', reason)
    })

    newSocket.on('connect_error', (err) => {
      setError(err.message)
      setIsConnected(false)
      console.error('Monitoring socket connection error:', err)
    })

    // Listen for monitoring events
    newSocket.on('monitoring:update', (data: MonitoringData) => {
      setMonitoringData(data)
    })

    newSocket.on('monitoring:event', (event: MonitoringEvent) => {
      setEvents(prev => [...prev.slice(-49), event]) // Keep last 50 events
    })

    // Request initial data
    newSocket.on('connect', () => {
      newSocket.emit('monitoring:request_data')
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [url, autoConnect])

  const refreshData = () => {
    if (socket && isConnected) {
      socket.emit('monitoring:request_data')
    }
  }

  const clearEvents = () => {
    setEvents([])
  }

  return {
    socket,
    isConnected,
    monitoringData,
    events,
    error,
    refreshData,
    clearEvents
  }
}