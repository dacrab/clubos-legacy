'use client';

import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import {
  Key,
  type LucideIcon,
  MoreHorizontal,
  Shield,
  UserCircle,
  UserCog,
  User as UserIcon,
  UserX,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
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
import { SortButton } from '@/components/ui/sort-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { VirtualizedMobileList } from '@/components/ui/virtualized-mobile-list';
import {
  ALLOWED_USER_ROLES,
  ROLE_TRANSLATIONS,
  USER_MESSAGES,
  type UserRole,
} from '@/lib/constants';
import { env } from '@/lib/env';
import { transitions } from '@/lib/utils/animations';
import { toast } from '@/lib/utils/toast';
import type { Database } from '@/types/supabase';

import ResetPasswordDialog from './reset-password-dialog';

type User = {
  id: string;
  username: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

type UsersTableProps = {
  users: User[];
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-green-500/10 text-green-700 dark:text-green-400',
  staff: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  secretary: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
} as const;

const roleIcons: Record<UserRole, LucideIcon> = {
  admin: Shield,
  staff: UserIcon,
  secretary: UserCog,
} as const;

type UserRowProps = {
  user: User;
  onResetPassword: (userId: string) => void;
  onChangeRole: (userId: string, role: UserRole) => void;
  onDelete: (userId: string) => void;
  loading: boolean;
};

// Memoized desktop table row (existing)
const DesktopTableRow = memo<UserRowProps>(
  ({ user, onResetPassword, onChangeRole, onDelete, loading }) => {
    const Icon = roleIcons[user.role];

    return (
      <motion.tr
        animate={{ opacity: 1, y: 0 }}
        className="hover:bg-muted/50"
        initial={{ opacity: 0, y: 20 }}
        transition={{ ...transitions.smooth }}
      >
        <TableCell className="font-medium">{user.username ?? '—'}</TableCell>
        <TableCell>
          <Badge className={roleColors[user.role]} variant="secondary">
            <Icon className="mr-1 h-4 w-4" />
            {ROLE_TRANSLATIONS[user.role]}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {new Date(user.created_at).toLocaleDateString('el-GR')}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onResetPassword(user.id)}>
                <Key className="mr-2 h-4 w-4" />
                <span>Επαναφορά κωδικού</span>
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Αλλαγή ρόλου</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {ALLOWED_USER_ROLES.map((role) => {
                    const RoleIcon = roleIcons[role];
                    return (
                      <DropdownMenuItem
                        disabled={user.role === role || loading}
                        key={role}
                        onClick={() => onChangeRole(user.id, role)}
                      >
                        <div
                          className={`flex items-center ${roleColors[role]} rounded-md px-2 py-1`}
                        >
                          <RoleIcon className="mr-2 h-4 w-4" />
                          <span>{ROLE_TRANSLATIONS[role]}</span>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-600 dark:text-red-400"
                onClick={() => onDelete(user.id)}
              >
                <UserX className="mr-2 h-4 w-4" />
                <span>Διαγραφή</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </motion.tr>
    );
  }
);

DesktopTableRow.displayName = 'DesktopTableRow';

// New mobile row component
const MobileRow = memo<UserRowProps>(
  ({ user, onResetPassword, onChangeRole, onDelete, loading }) => {
    const Icon = roleIcons[user.role];

    return (
      <div className="space-y-2 border-b bg-card p-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <UserCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-base">{user.username ?? '—'}</h3>
              <p className="text-muted-foreground text-sm">
                {new Date(user.created_at).toLocaleDateString('el-GR')}
              </p>
            </div>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 w-8 p-0" variant="ghost">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onResetPassword(user.id)}>
                  <Key className="mr-2 h-4 w-4" />
                  <span>Επαναφορά κωδικού</span>
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Αλλαγή ρόλου</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {ALLOWED_USER_ROLES.map((role) => {
                      const RoleIcon = roleIcons[role];
                      return (
                        <DropdownMenuItem
                          disabled={user.role === role || loading}
                          key={role}
                          onClick={() => onChangeRole(user.id, role)}
                        >
                          <div
                            className={`flex items-center ${roleColors[role]} rounded-md px-2 py-1`}
                          >
                            <RoleIcon className="mr-2 h-4 w-4" />
                            <span>{ROLE_TRANSLATIONS[role]}</span>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={() => onDelete(user.id)}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  <span>Διαγραφή</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="pt-1">
          <Badge className={roleColors[user.role]} variant="secondary">
            <Icon className="mr-1 h-4 w-4" />
            {ROLE_TRANSLATIONS[user.role]}
          </Badge>
        </div>
      </div>
    );
  }
);

MobileRow.displayName = 'MobileRow';

const RESIZE_DEBOUNCE_TIME = 250;
const MOBILE_BREAKPOINT = 768;
const ESTIMATED_MOBILE_ROW_HEIGHT = 90;

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const router = useRouter();
  const [users] = useState(initialUsers);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'asc' | 'desc';
  }>({ key: 'created_at', direction: 'desc' });

  // Mobile responsiveness
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Set initial value
    checkMobile();

    // Add throttled resize listener
    let resizeTimeout: NodeJS.Timeout | null = null;
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(checkMobile, RESIZE_DEBOUNCE_TIME);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, []);

  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    return <div className="text-destructive">Missing Supabase URL</div>;
  }
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <div className="text-destructive">Missing Supabase Anon Key</div>;
  }
  const supabase = createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function updateUserRole(userId: string, role: UserRole) {
    const { error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      throw error;
    }
  }

  async function handleChangeRole(userId: string, newRole: UserRole) {
    setLoading(true);

    try {
      await updateUserRole(userId, newRole);
      toast.success('Ο ρόλος του χρήστη ενημερώθηκε επιτυχώς');
      router.refresh();
    } catch {
      toast.error('Σφάλμα κατά την ενημέρωση του ρόλου');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!deleteUserId) {
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${deleteUserId}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed');
      }
      toast.success(USER_MESSAGES.DELETE_SUCCESS);
      router.refresh();
    } catch {
      toast.error(USER_MESSAGES.UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
      setDeleteUserId(null);
    }
  }

  function handleSort(key: keyof User) {
    setSortConfig((config) => ({
      key,
      direction: config.key === key && config.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  const getComparableValue = (u: User, key: keyof User): string => {
    const value = u[key];
    if (key === 'role') {
      return ROLE_TRANSLATIONS[u.role];
    }
    return (value ?? '').toString();
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = getComparableValue(a, sortConfig.key);
    const bValue = getComparableValue(b, sortConfig.key);

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // (desktop virtualization removed for now)

  function renderSortButton(label: string, key: keyof User) {
    return (
      <SortButton
        active={sortConfig.key === key}
        className="-ml-3 h-8"
        label={label}
        onClick={() => handleSort(key)}
      />
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <EmptyState
        description="Δεν υπάρχουν χρήστες καταχωρημένοι στο σύστημα."
        icon={UserX}
        title="Δεν υπάρχουν χρήστες"
      />
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <>
        <VirtualizedMobileList<User>
          className="h-[calc(100vh-200px)] rounded-md border bg-background"
          estimateSize={() => ESTIMATED_MOBILE_ROW_HEIGHT}
          items={sortedUsers}
          renderItem={(user) => (
            <MobileRow
              key={user.id}
              loading={loading}
              onChangeRole={handleChangeRole}
              onDelete={setDeleteUserId}
              onResetPassword={setResetPasswordUserId}
              user={user}
            />
          )}
        />

        <ConfirmationDialog
          description="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον χρήστη; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
          loading={loading}
          onConfirm={handleDeleteUser}
          onOpenChange={() => setDeleteUserId(null)}
          open={!!deleteUserId}
          title="Διαγραφή Χρήστη"
        />

        <ResetPasswordDialog
          onOpenChange={() => setResetPasswordUserId(null)}
          open={!!resetPasswordUserId}
          userId={resetPasswordUserId}
        />
      </>
    );
  }

  // Desktop view
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{renderSortButton('Όνομα Χρήστη', 'username')}</TableHead>
              <TableHead>{renderSortButton('Ρόλος', 'role')}</TableHead>
              <TableHead>{renderSortButton('Ημερομηνία Δημιουργίας', 'created_at')}</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => (
              <DesktopTableRow
                key={user.id}
                loading={loading}
                onChangeRole={handleChangeRole}
                onDelete={setDeleteUserId}
                onResetPassword={setResetPasswordUserId}
                user={user}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmationDialog
        description="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον χρήστη; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
        loading={loading}
        onConfirm={handleDeleteUser}
        onOpenChange={() => setDeleteUserId(null)}
        open={!!deleteUserId}
        title="Διαγραφή Χρήστη"
      />

      <ResetPasswordDialog
        onOpenChange={() => setResetPasswordUserId(null)}
        open={!!resetPasswordUserId}
        userId={resetPasswordUserId}
      />
    </>
  );
}
