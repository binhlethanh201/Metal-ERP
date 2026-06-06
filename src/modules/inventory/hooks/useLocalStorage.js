/**
 * useLocalStorage - Hook khởi tạo state từ localStorage và tự động persist khi thay đổi.
 */
import { useState, useCallback } from 'react';

const read = (key, fallback) => {
  try {
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

export const useLocalStorage = (key, fallback) => {
  const [value, setValue] = useState(() => read(key, fallback));

  const persist = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(value) : next;
      write(key, resolved);
      setValue(resolved);
    },
    [key, value]
  );

  return [value, persist];
};

export default useLocalStorage;
