import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Code } from 'lucide-react'
import { config } from '@/core/config'

export function RawConfigCard() {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Code className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Konfigurasi Mentah</CardTitle>
            <CardDescription>Representasi JSON lengkap dari konfigurasi sistem</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-hidden">
          <pre className="text-sm font-mono leading-relaxed overflow-auto max-h-96">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

export default RawConfigCard