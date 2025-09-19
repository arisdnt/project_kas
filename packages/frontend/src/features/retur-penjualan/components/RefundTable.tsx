import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/core/components/ui/table"
import { Badge } from "@/core/components/ui/badge"
import { Button } from "@/core/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu"
import { Eye, Check, X, RotateCcw, MoreHorizontal } from 'lucide-react'
import type { RefundTransaction } from '../types'
import { formatCurrency, getStatusColor, getStatusText } from '../data/sampleRefunds'

interface Props {
  refunds: RefundTransaction[]
  onView?: (refund: RefundTransaction) => void
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onProcess?: (id: number) => void
}

export function RefundTable({ refunds, onView, onApprove, onReject, onProcess }: Props) {
  return (
    <div className="rounded-md border border-gray-200">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold text-gray-900">Kode Retur</TableHead>
            <TableHead className="font-semibold text-gray-900">Transaksi Asli</TableHead>
            <TableHead className="font-semibold text-gray-900">Tanggal</TableHead>
            <TableHead className="font-semibold text-gray-900">Kasir</TableHead>
            <TableHead className="font-semibold text-gray-900">Pelanggan</TableHead>
            <TableHead className="font-semibold text-gray-900">Status</TableHead>
            <TableHead className="font-semibold text-gray-900 text-right">Nilai Retur</TableHead>
            <TableHead className="font-semibold text-gray-900 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refunds.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12">
                <div className="text-center">
                  <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Tidak ada data retur</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            refunds.map((refund) => (
              <TableRow key={refund.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{refund.code}</span>
                    {refund.originalTransactionCode && (
                      <span className="text-xs text-gray-500">ID: {refund.id}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">{refund.originalTransactionCode}</span>
                    <span className="text-xs text-gray-500">ID: {refund.originalTransactionId}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">{refund.date}</span>
                    {refund.time && (
                      <span className="text-xs text-gray-500">{refund.time}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-900">{refund.cashier}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-900">
                    {refund.customer || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(refund.status)}>
                    {getStatusText(refund.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(refund.refundAmount)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      >
                        <span className="sr-only">Buka menu aksi</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => onView?.(refund)}
                        className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-700"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>

                      {refund.status === 'PENDING' && onApprove && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onApprove(refund.id)}
                            className="cursor-pointer text-green-600 hover:text-green-700 hover:bg-green-50 focus:bg-green-50 focus:text-green-700"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Setujui
                          </DropdownMenuItem>
                        </>
                      )}

                      {refund.status === 'PENDING' && onReject && (
                        <DropdownMenuItem
                          onClick={() => onReject(refund.id)}
                          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Tolak
                        </DropdownMenuItem>
                      )}

                      {refund.status === 'APPROVED' && onProcess && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onProcess(refund.id)}
                            className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-700"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Proses
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}