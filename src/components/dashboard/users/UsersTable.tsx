'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ChevronDown,
  Key,
  MoreHorizontal,
  Shield,
  UserCircle,
  UserCog,
  User as UserIcon,
  UserX,
} from 'lucide-react';

import { ALLOWED_USER_ROLES, ROLE_TRANSLATIONS, type UserRole } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { User } from '@/hooks/data/useUsers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UsersTableProps {
  users: User[];
  isMobile: boolean;
  loading: boolean;
  onDeleteUser: (userId: string) => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
  onResetPassword: (userId: string) => void;
}

const roleColors: Record<UserRole, string> = {
  admin: 'bg-green-500/10 text-green-700 dark:text-green-400',
  employee: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  secretary: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
};

const roleIcons: Record<UserRole, typeof Shield> = {
  admin: Shield,
  employee: UserIcon,
  secretary: UserCog,
};

function UserActions({
  user,
  loading,
  onResetPassword,
  onUpdateRole,
  onDelete,
}: {
  user: User;
  loading: boolean;
  onResetPassword: (userId: string) => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
  onDelete: (userId: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onResetPassword(user.id)}>
          <Key className="mr-2 h-4 w-4" />
          Επαναφορά κωδικού
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UserCog className="mr-2 h-4 w-4" />
            Αλλαγή ρόλου
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {ALLOWED_USER_ROLES.map(role => {
              const RoleIcon = roleIcons[role];
              return (
                <DropdownMenuItem
                  key={role}
                  onClick={() => onUpdateRole(user.id, role)}
                  disabled={user.role === role || loading}
                >
                  <div className={cn('flex items-center rounded-md px-2 py-1', roleColors[role])}>
                    <RoleIcon className="mr-2 h-4 w-4" />
                    {ROLE_TRANSLATIONS[role]}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(user.id)}
          className="text-red-600 dark:text-red-400"
        >
          <UserX className="mr-2 h-4 w-4" />
          Διαγραφή
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileUserCard({
  user,
  loading,
  onResetPassword,
  onUpdateRole,
  onDelete,
}: {
  user: User;
  loading: boolean;
  onResetPassword: (userId: string) => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
  onDelete: (userId: string) => void;
}) {
  const Icon = roleIcons[user.role];

  return (
    <div className="space-y-3 border-b p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
            <UserCircle className="text-muted-foreground h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium">{user.username}</h3>
            <p className="text-muted-foreground text-sm">
              {new Date(user.created_at).toLocaleDateString('el-GR')}
            </p>
          </div>
        </div>
        <UserActions
          user={user}
          loading={loading}
          onResetPassword={onResetPassword}
          onUpdateRole={onUpdateRole}
          onDelete={onDelete}
        />
      </div>
      <Badge variant="secondary" className={cn('text-sm', roleColors[user.role])}>
        <Icon className="mr-1 h-4 w-4" />
        {ROLE_TRANSLATIONS[user.role]}
      </Badge>
    </div>
  );
}
export default function UsersTable({
  users,
  isMobile,
  loading,
  onDeleteUser,
  onUpdateRole,
  onResetPassword,
}: UsersTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' }>({
    key: 'created_at',
    direction: 'desc',
  });

  const handleSort = useCallback((key: keyof User) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [users, sortConfig]);

  const SortButton = ({ label, sortKey }: { label: string; sortKey: keyof User }) => (
    <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort(sortKey)}>
      {label}
      <ChevronDown
        className={cn(
          'ml-2 h-4 w-4 transition-transform',
          sortConfig.key === sortKey && sortConfig.direction === 'desc' && 'rotate-180'
        )}
      />
    </Button>
  );
  if (users.length === 0) {
    return (
      <EmptyState
        icon={UserX}
        title="Δεν υπάρχουν χρήστες"
        description="Δεν έχουν δημιουργηθεί χρήστες ακόμα."
      />
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-0 rounded-md border">
        {sortedUsers.map(user => (
          <MobileUserCard
            key={user.id}
            user={user}
            loading={loading}
            onResetPassword={onResetPassword}
            onUpdateRole={onUpdateRole}
            onDelete={onDeleteUser}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton label="Όνομα Χρήστη" sortKey="username" />
            </TableHead>
            <TableHead>
              <SortButton label="Ρόλος" sortKey="role" />
            </TableHead>
            <TableHead>
              <SortButton label="Ημερομηνία Δημιουργίας" sortKey="created_at" />
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map(user => {
            const Icon = roleIcons[user.role];
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn('text-sm', roleColors[user.role])}>
                    <Icon className="mr-1 h-4 w-4" />
                    {ROLE_TRANSLATIONS[user.role]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString('el-GR')}
                </TableCell>
                <TableCell>
                  <UserActions
                    user={user}
                    loading={loading}
                    onResetPassword={onResetPassword}
                    onUpdateRole={onUpdateRole}
                    onDelete={onDeleteUser}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
