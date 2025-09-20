import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useKategoriStore, type UIKategori } from '@/features/kategori/store/kategoriStore';
import {
  getSortedKategoriItems,
  type KategoriSortableColumn,
  type KategoriSortState,
} from '@/features/kategori/utils/tableUtils';

export function useKategoriTableState() {
  const {
    items,
    loading,
    hasNext,
    loadNext,
    loadFirst,
    deleteKategori,
    page,
    search,
  } = useKategoriStore();

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  const [sortState, setSortState] = useState<KategoriSortState | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    kategori: UIKategori | null;
    loading: boolean;
  }>({ open: false, kategori: null, loading: false });
  const [headerElevated, setHeaderElevated] = useState(false);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  const hasNextRef = useRef(hasNext);
  const loadingRef = useRef(loading);

  useEffect(() => {
    hasNextRef.current = hasNext;
  }, [hasNext]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    const root = scrollAreaRef.current;
    if (!root) return;
    const viewport = root.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement | null;
    if (!viewport) return;

    viewportRef.current = viewport;

    const handleScroll = () => {
      if (viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 80) {
        if (hasNextRef.current && !loadingRef.current) {
          void loadNext();
        }
      }
      setHeaderElevated(viewport.scrollTop > 4);
    };

    handleScroll();
    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [loadNext]);

  useEffect(() => {
    if (page === 1) {
      const viewport = viewportRef.current;
      if (viewport) viewport.scrollTop = 0;
    }
  }, [page, search]);

  const sortedItems = useMemo(() => getSortedKategoriItems(items, sortState), [items, sortState]);

  useEffect(() => {
    if (sortedItems.length === 0) {
      setActiveRowId(null);
      return;
    }
    if (!activeRowId || !sortedItems.some((item) => item.id === activeRowId)) {
      setActiveRowId(sortedItems[0].id);
    }
  }, [sortedItems, activeRowId]);

  const toggleSort = (column: KategoriSortableColumn) => {
    setSortState((prev) => {
      if (!prev || prev.column !== column) {
        return { column, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { column, direction: 'desc' };
      }
      return null;
    });
  };

  const openDeleteDialog = (kategori: UIKategori) => {
    setDeleteDialog({ open: true, kategori, loading: false });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, kategori: null, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.kategori) {
      return { success: false as const, error: 'Kategori tidak ditemukan.' };
    }

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteKategori(deleteDialog.kategori.id);
      return { success: true as const, kategori: deleteDialog.kategori };
    } catch (error: any) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
      return {
        success: false as const,
        error: error?.message || 'Terjadi kesalahan saat menghapus kategori.',
      };
    }
  };

  const handleRowFocus = (kategori: UIKategori) => {
    setActiveRowId(kategori.id);
  };

  const handleKeyNavigation = (
    event: KeyboardEvent<HTMLTableRowElement>,
    kategori: UIKategori,
  ) => {
    const currentIndex = sortedItems.findIndex((item) => item.id === kategori.id);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = sortedItems[currentIndex + 1];
      if (next) {
        setActiveRowId(next.id);
        rowRefs.current[next.id]?.focus();
      }
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = sortedItems[currentIndex - 1];
      if (prev) {
        setActiveRowId(prev.id);
        rowRefs.current[prev.id]?.focus();
      }
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      return { action: 'view' as const, kategori };
    }
    return null;
  };

  return {
    items,
    loading,
    sortedItems,
    sortState,
    activeRowId,
    deleteDialog,
    headerElevated,
    page,
    hasNext,
    scrollAreaRef,
    rowRefs,
    toggleSort,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteConfirm,
    handleRowFocus,
    handleKeyNavigation,
  };
}

