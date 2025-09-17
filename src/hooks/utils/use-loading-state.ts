import { useCallback, useState } from 'react';

type UseLoadingStateProps = {
  initialLoading?: boolean;
};

type LoadingStateActions = {
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
  toggleLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
};

export function useLoadingState({
  initialLoading = false,
}: UseLoadingStateProps = {}): { loading: boolean } & LoadingStateActions {
  const [loading, setLoading] = useState(initialLoading);

  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const toggleLoading = useCallback(() => {
    setLoading((prev) => !prev);
  }, []);

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      startLoading();
      try {
        const result = await asyncFn();
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading,
  };
}
