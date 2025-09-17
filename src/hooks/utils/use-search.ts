import { useCallback, useEffect, useState } from 'react';

type UseSearchProps = {
  debounceMs?: number;
  initialValue?: string;
};

export function useSearch({ debounceMs = 300, initialValue = '' }: UseSearchProps = {}) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  const setSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setDebouncedQuery(value);
  }, []);

  return {
    searchQuery,
    debouncedQuery,
    handleSearchChange,
    clearSearch,
    setSearch,
  };
}
