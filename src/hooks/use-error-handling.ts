import { useCallback, useState } from 'react';
import { toast } from 'sonner';

type UseErrorHandlingProps = {
  showToasts?: boolean;
  defaultErrorMessage?: string;
};

type ErrorHandlingState = {
  error: string | null;
  isError: boolean;
};

type ErrorHandlingActions = {
  setError: (error: string | null) => void;
  handleError: (error: unknown, customMessage?: string) => void;
  clearError: () => void;
  reset: () => void;
};

export function useErrorHandling({
  showToasts = true,
  defaultErrorMessage = 'Παρουσιάστηκε σφάλμα',
}: UseErrorHandlingProps = {}): ErrorHandlingState & ErrorHandlingActions {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback(
    (err: unknown, customMessage?: string) => {
      const errorMessage =
        err instanceof Error ? err.message : customMessage || defaultErrorMessage;

      setError(errorMessage);

      if (showToasts) {
        toast.error(errorMessage);
      }
    },
    [showToasts, defaultErrorMessage]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isError: error !== null,
    setError,
    handleError,
    clearError,
    reset,
  };
}
