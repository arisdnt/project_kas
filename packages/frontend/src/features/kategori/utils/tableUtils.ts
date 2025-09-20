import { UIKategori } from '@/features/kategori/types/kategori';

export type KategoriSortableColumn =
  | 'nama'
  | 'urutan'
  | 'jumlah_produk'
  | 'status'
  | 'updated';

export type KategoriSortState = {
  column: KategoriSortableColumn;
  direction: 'asc' | 'desc';
};

export const KATEGORI_COLUMN_CLASS = {
  kategori: 'w-[18%] min-w-[160px] pr-3',
  deskripsi: 'w-[26%] min-w-[200px] pr-3',
  urutan: 'w-[7%] min-w-[80px]',
  produk: 'w-[10%] min-w-[90px]',
  status: 'w-[7%] min-w-[80px]',
  updated: 'w-[9%] min-w-[100px]',
  aksi: 'w-[8%] min-w-[90px] pr-0',
} as const;

export const KATEGORI_ROW_HEIGHT_PX = 38;

export function formatTanggal(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getSortedKategoriItems(items: UIKategori[], sortState: KategoriSortState | null): UIKategori[] {
  if (!sortState) return items;
  const sorted = [...items];
  sorted.sort((a, b) => {
    const direction = sortState.direction === 'asc' ? 1 : -1;
    const getValue = (item: UIKategori): string | number => {
      switch (sortState.column) {
        case 'nama':
          return item.nama.toLowerCase();
        case 'urutan':
          return item.urutan ?? Number.NEGATIVE_INFINITY;
        case 'jumlah_produk':
          return item.jumlah_produk ?? Number.NEGATIVE_INFINITY;
        case 'status':
          return item.status === 'aktif' ? 1 : 0;
        case 'updated':
          return new Date(item.diperbarui_pada || item.dibuat_pada || 0).getTime();
        default:
          return 0;
      }
    };
    const valueA = getValue(a);
    const valueB = getValue(b);
    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });
  return sorted;
}
