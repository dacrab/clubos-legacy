import { useCallback } from 'react';
import { useErrorHandling } from './use-error-handling';
import { useLoadingState } from './utils/use-loading-state';
import { useSearch } from './utils/use-search';

type UsePageStateProps = {
  initialSearchValue?: string;
  searchDebounceMs?: number;
  enableErrorToasts?: boolean;
  defaultErrorMessage?: string;
};

type PageState = {
  // Search state
  searchQuery: string;
  debouncedQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
  setSearch: (value: string) => void;

  // Loading state
  loading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;

  // Error state
  error: string | null;
  isError: boolean;
  handleError: (error: unknown, customMessage?: string) => void;
  clearError: () => void;
  reset: () => void;
};

export function usePageState({
  initialSearchValue = '',
  searchDebounceMs = 300,
  enableErrorToasts = true,
  defaultErrorMessage = 'Παρουσιάστηκε σφάλμα',
}: UsePageStateProps = {}): PageState {
  const search = useSearch({
    debounceMs: searchDebounceMs,
    initialValue: initialSearchValue,
  });

  const loadingState = useLoadingState();

  const errorHandling = useErrorHandling({
    showToasts: enableErrorToasts,
    defaultErrorMessage,
  });

  const reset = useCallback(() => {
    search.clearSearch();
    loadingState.stopLoading();
    errorHandling.reset();
  }, [search, loadingState, errorHandling]);

  return {
    // Search
    searchQuery: search.searchQuery,
    debouncedQuery: search.debouncedQuery,
    handleSearchChange: search.handleSearchChange,
    clearSearch: search.clearSearch,
    setSearch: search.setSearch,

    // Loading
    loading: loadingState.loading,
    setLoading: loadingState.setLoading,
    startLoading: loadingState.startLoading,
    stopLoading: loadingState.stopLoading,
    withLoading: loadingState.withLoading,

    // Error
    error: errorHandling.error,
    isError: errorHandling.isError,
    handleError: errorHandling.handleError,
    clearError: errorHandling.clearError,
    reset,
  };
}
