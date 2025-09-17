'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import AddUserButton from '@/components/dashboard/users/add-user-button';
import UsersTable from '@/components/dashboard/users/users-table';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ALLOWED_USER_ROLES } from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase/client';
import type { User, UserRole } from '@/types/user';

type UserData = { role: UserRole };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = createClientSupabase();

  const checkUserRole = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      router.push('/');
      return false;
    }

    if ((userData as UserData).role !== ALLOWED_USER_ROLES[0]) {
      router.push('/dashboard');
      return false;
    }

    return true;
  }, [supabase, router]);

  const fetchUsersData = useCallback(async () => {
    const { data: usersData, error } = await supabase.from('users').select('*').order('username');

    if (error) {
      // console.error('Error fetching users:', error);
    } else {
      setUsers(usersData as User[]);
      setFilteredUsers(usersData as User[]);
    }
  }, [supabase]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      const hasPermission = await checkUserRole();
      if (hasPermission) {
        await fetchUsersData();
      }

      setLoading(false);
    };

    fetchUsers();
  }, [checkUserRole, fetchUsersData]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = users.filter((user) =>
      (user.username ?? '').toLowerCase().includes(lowercasedQuery)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  if (loading) {
    return <LoadingSkeleton className="h-10 w-full" count={4} />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-2xl">Χρήστες</h1>
          <span className="text-base text-muted-foreground">{filteredUsers.length} συνολικά</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
            <Input
              className="w-full pl-9"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Αναζήτηση χρηστών..."
              value={searchQuery}
            />
          </div>
          <AddUserButton />
        </div>
      </div>
      <div className="flex-1">
        <UsersTable users={filteredUsers} />
      </div>
    </div>
  );
}
