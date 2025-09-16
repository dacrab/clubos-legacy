import { useCallback, useEffect, useState } from 'react';

import { EDIT_WINDOW_MINUTES } from '@/lib/constants';

const TIME = {
  MILLISECONDS_IN_SECOND: 1000,
  SECONDS_IN_MINUTE: 60,
  EDITABILITY_CHECK_INTERVAL: 1000,
} as const;

type UseEditabilityProps = {
  createdAt: string;
  checkInterval?: number;
};

export function useEditability({
  createdAt,
  checkInterval = TIME.EDITABILITY_CHECK_INTERVAL,
}: UseEditabilityProps) {
  const [canEdit, setCanEdit] = useState(true);

  const checkEditability = useCallback(() => {
    const saleDate = new Date(createdAt);
    const now = new Date();
    const diffInMinutes =
      (now.getTime() - saleDate.getTime()) / TIME.MILLISECONDS_IN_SECOND / TIME.SECONDS_IN_MINUTE;

    setCanEdit(diffInMinutes < EDIT_WINDOW_MINUTES);
  }, [createdAt]);

  useEffect(() => {
    checkEditability();
    const interval = setInterval(checkEditability, checkInterval);
    return () => clearInterval(interval);
  }, [checkEditability, checkInterval]);

  return {
    canEdit,
    checkEditability,
  };
}
