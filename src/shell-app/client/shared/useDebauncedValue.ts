import { useEffect, useRef, useState } from 'react';

type Options = {
  /** Сразу отдать первое значение, затем ждать паузы */
  leading?: boolean;
  /** Оставить ли трайловое срабатывание (по умолчанию true) */
  trailing?: boolean;
};

export function useDebouncedValue<T>(value: T, delay = 300, options: Options = {}) {
  const { leading = false, trailing = true } = options;

  const [debounced, setDebounced] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leadingLockRef = useRef(false); // чтобы leading не срабатывал чаще, чем раз в delay
  const lastValueRef = useRef(value); // для flush()

  // утилиты управления
  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const flush = () => {
    cancel();
    setDebounced(lastValueRef.current);
  };

  const isPending = () => timerRef.current !== null;

  useEffect(() => {
    lastValueRef.current = value;

    // leading: отдать немедленно, но не чаще, чем раз в delay
    if (leading && !leadingLockRef.current) {
      setDebounced(value);
      leadingLockRef.current = true;

      // снимаем блок через delay
      const unlockTimer = setTimeout(() => {
        leadingLockRef.current = false;
      }, delay);
      // параллельно планируем trailing, если включён
      if (trailing) {
        cancel();
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          setDebounced(lastValueRef.current);
        }, delay);
      }

      return () => clearTimeout(unlockTimer);
    }

    // обычный trailing-дебаунс
    if (trailing) {
      cancel();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setDebounced(lastValueRef.current);
      }, delay);
    }

    // cleanup на размонтировании/изменении
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay, leading, trailing]);

  return { value: debounced, flush, cancel, isPending };
}
