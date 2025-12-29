import { useEffect, useCallback } from 'react';

export const STORAGE_KEY_LAST_DATE = 'focusflow_last_date';

export function useDateChangeDetection(onDateChange?: (oldDate: string, newDate: string) => void) {
  const checkDateChange = useCallback(() => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const storedDate = localStorage.getItem(STORAGE_KEY_LAST_DATE);

    if (storedDate && storedDate !== today) {
      if (onDateChange) {
        onDateChange(storedDate, today);
      }
    }

    localStorage.setItem(STORAGE_KEY_LAST_DATE, today);
  }, [onDateChange]);

  useEffect(() => {
    checkDateChange();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDateChange();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(checkDateChange, 60000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [checkDateChange]);

  return { checkDateChange };
}