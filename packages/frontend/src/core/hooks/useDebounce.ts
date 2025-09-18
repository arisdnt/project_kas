import { useEffect, useState } from 'react';

/**
 * Custom hook untuk debouncing nilai
 * Berguna untuk mencegah terlalu banyak API calls saat user mengetik
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout jika value berubah atau component unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}