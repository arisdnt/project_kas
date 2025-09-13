import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { FileText, LogIn, Edit, Trash2, Plus } from 'lucide-react'
import { AuditLogData } from '../types/profile.types'

interface AuditLogsListProps {
  auditLogs: AuditLogData[]
}

export function AuditLogsList({ auditLogs }: AuditLogsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'LOGIN':
        return LogIn
      case 'CREATE':
      case 'INSERT':
        return Plus
      case 'UPDATE':
      case 'EDIT':
        return Edit
      case 'DELETE':
        return Trash2
      default:
        return FileText
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'LOGIN':
        return 'bg-green-100 text-green-800'
      case 'CREATE':
      case 'INSERT':
        return 'bg-blue-100 text-blue-800'
      case 'UPDATE':
      case 'EDIT':
        return 'bg-yellow-100 text-yellow-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatJsonData = (data: any) => {
    if (!data) return 'Tidak ada data'
    if (typeof data === 'string') return data
    return JSON.stringify(data, null, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Log Aktivitas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada log aktivitas
          </div>
        ) : (
          <div className="h-96 overflow-y-auto">
            <div className="space-y-4">
              {auditLogs.map((log) => {
                const ActionIcon = getActionIcon(log.aksi)
                const actionColor = getActionColor(log.aksi)
                
                return (
                  <div key={log.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ActionIcon className="w-4 h-4" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{log.tabel}</span>
                            <Badge className={actionColor}>
                              {log.aksi}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(log.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      IP: {log.ip_address} | Record ID: {log.record_id}
                    </div>
                    
                    {log.data_baru && (
                      <div className="bg-gray-50 p-3 rounded text-xs">
                        <div className="font-medium mb-1">Data Baru:</div>
                        <pre className="whitespace-pre-wrap text-gray-600">
                          {formatJsonData(log.data_baru)}
                        </pre>
                      </div>
                    )}
                    
                    {log.data_lama && (
                      <div className="bg-red-50 p-3 rounded text-xs">
                        <div className="font-medium mb-1">Data Lama:</div>
                        <pre className="whitespace-pre-wrap text-gray-600">
                          {formatJsonData(log.data_lama)}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}