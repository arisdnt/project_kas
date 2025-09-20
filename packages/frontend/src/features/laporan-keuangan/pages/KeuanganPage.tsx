import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import { DateRangeFilter } from '@/features/laporan-keuangan/components/DateRangeFilter';
import { LedgerTable } from '@/features/laporan-keuangan/components/LedgerTable';
import { ProfitLossSummary } from '@/features/laporan-keuangan/components/ProfitLossSummary';
import { useKeuangan } from '@/features/laporan-keuangan/hooks/useKeuangan';
import { LedgerExportButtons } from '@/features/laporan-keuangan/components/LedgerExportButtons';
import { ProfitLossExportButtons } from '@/features/laporan-keuangan/components/ProfitLossExportButtons';

export function KeuanganPage() {
  const { filter, setPreset, setCustomRange, ledger, pl, loading, error } = useKeuangan();

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Keuangan: Arus Kas & Laba Rugi</h1>
          <p className="text-sm text-gray-600">Pantau pergerakan kas dan laba kotor dalam satu tempat.</p>
        </div>
        <DateRangeFilter
          preset={filter.preset}
          start={filter.range.start}
          end={filter.range.end}
          onPresetChange={setPreset}
          onCustomApply={setCustomRange}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </div>
      )}

      <Tabs defaultValue="ledger" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ledger">Ledger / Arus Kas</TabsTrigger>
          <TabsTrigger value="pl">Laba Rugi</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="space-y-4">
          <div className="flex items-center justify-end">
            <LedgerExportButtons data={ledger} start={filter.range.start} end={filter.range.end} />
          </div>
          <LedgerTable data={ledger} loading={loading} />
        </TabsContent>

        <TabsContent value="pl" className="space-y-4">
          <div className="flex items-center justify-end">
            <ProfitLossExportButtons data={pl} start={filter.range.start} end={filter.range.end} />
          </div>
          <ProfitLossSummary data={pl} loading={loading} />
          <div className="rounded-md border border-gray-200 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">Catatan</h3>
            <p className="text-sm text-gray-600">
              Komponen HPP dihitung berdasarkan harga beli produk x jumlah terjual. Biaya operasional tidak
              disertakan pada versi ini.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
