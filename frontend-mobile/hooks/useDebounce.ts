import { useState, useEffect } from "react";

/**
 * useDebounce
 * Returns a debounced value that only updates after `delay` ms of inactivity.
 *
 * @param value  - The value to debounce
 * @param delay  - Delay in milliseconds (default 500 ms)
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
