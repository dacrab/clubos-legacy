'use client';

import { useMemo } from 'react';
import { DataTableHeader } from '@/components/dashboard/common/data-table-header';
import { SearchBar } from '@/components/dashboard/common/search-bar';
import AddUserButton from '@/components/dashboard/users/add-user-button';
import UsersTable from '@/components/dashboard/users/users-table';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { usePageState } from '@/hooks/use-page-state';

export default function UsersPage() {
  const { isAdmin, loading: authLoading } = useAuth({
    redirectOnUnauthorized: true,
    requireAdmin: true,
  });

  const { users, loading: dataLoading } = useDashboardData({
    isAdmin,
    autoFetch: true,
    enableErrorToasts: false,
  });

  const {
    searchQuery,
    handleSearchChange,
    loading: pageLoading,
  } = usePageState({
    enableErrorToasts: false,
  });

  const isLoading = authLoading || dataLoading || pageLoading;

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return users;
    }

    return users.filter((user) => (user.username ?? '').toLowerCase().includes(query));
  }, [searchQuery, users]);

  const searchBar = (
    <SearchBar
      onChange={handleSearchChange}
      placeholder="Αναζήτηση χρηστών..."
      value={searchQuery}
    />
  );

  const actions = <AddUserButton />;

  if (isLoading) {
    return <LoadingSkeleton className="h-10 w-full" count={4} />;
  }

  return (
    <div className="flex h-full flex-col">
      <DataTableHeader
        actions={actions}
        count={filteredUsers.length}
        searchBar={searchBar}
        title="Χρήστες"
      />
      <div className="flex-1">
        <UsersTable users={filteredUsers} />
      </div>
    </div>
  );
}
