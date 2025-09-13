import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Printer } from 'lucide-react'
import { config } from '@/core/config'

export function PrinterConfigCard() {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Printer className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Konfigurasi Printer Detail</CardTitle>
            <CardDescription>Teks header dan footer untuk struk pencetakan</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Teks Header</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px]">
              {config.printer.teksHeader?.length > 0 ? (
                <div className="space-y-2">
                  {config.printer.teksHeader.map((line: string, idx: number) => (
                    <p key={`h-${idx}`} className="text-sm text-gray-700 font-mono">{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Tidak ada teks header yang dikonfigurasi</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Teks Footer</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px]">
              {config.printer.teksFooter?.length > 0 ? (
                <div className="space-y-2">
                  {config.printer.teksFooter.map((line: string, idx: number) => (
                    <p key={`f-${idx}`} className="text-sm text-gray-700 font-mono">{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Tidak ada teks footer yang dikonfigurasi</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PrinterConfigCard