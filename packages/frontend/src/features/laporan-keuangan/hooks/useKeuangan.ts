import { useEffect, useMemo, useState } from 'react';
import { addDays, endOfDay, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import { fetchLedger, fetchProfitLoss } from '@/features/laporan-keuangan/services/keuanganApi';
import type { DateRange, KeuanganFilter, LedgerEntry, ProfitLoss } from '@/features/laporan-keuangan/types';

function buildPresetRange(preset: KeuanganFilter['preset']): DateRange {
  const now = new Date();
  switch (preset) {
    case 'hari-ini':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'minggu-ini':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'bulan-ini':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'tahun-ini':
      return { start: startOfYear(now), end: endOfYear(now) };
    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
}

export function useKeuangan() {
  const [filter, setFilter] = useState<KeuanganFilter>(() => {
    const range = buildPresetRange('bulan-ini');
    return { preset: 'bulan-ini', range };
  });
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [pl, setPL] = useState<ProfitLoss>({ pendapatan: 0, hpp: 0, labaKotor: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const computedLedger = useMemo(() => {
    let saldo = 0;
    return ledger
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((it) => {
        saldo += (it.masuk || 0) - (it.keluar || 0);
        return { ...it, saldo };
      });
  }, [ledger]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [l, p] = await Promise.all([
          fetchLedger({ start: filter.range.start, end: filter.range.end }),
          fetchProfitLoss({ start: filter.range.start, end: filter.range.end }),
        ]);
        if (!cancelled) {
          setLedger(l);
          setPL(p);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Gagal memuat data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [filter.range.start, filter.range.end]);

  const setPreset = (preset: KeuanganFilter['preset']) => {
    if (preset === 'kustom') return;
    const range = buildPresetRange(preset);
    setFilter({ preset, range });
  };

  const setCustomRange = (start: Date, end: Date) => {
    const s = startOfDay(start);
    const e = endOfDay(end);
    setFilter({ preset: 'kustom', range: { start: s, end: e } });
  };

  return {
    filter,
    setPreset,
    setCustomRange,
    ledger: computedLedger,
    pl,
    loading,
    error,
  };
}

