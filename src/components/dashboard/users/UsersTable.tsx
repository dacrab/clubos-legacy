"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, memo, useCallback } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  MoreHorizontal, 
  Key, 
  UserX, 
  ChevronDown, 
  Shield, 
  User, 
  UserCog,
  type LucideIcon,
  UserCircle 
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import ResetPasswordDialog from './ResetPasswordDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VirtualizedMobileList } from "@/components/ui/virtualized-mobile-list";
import { EmptyState } from "@/components/ui/empty-state";

import { Database } from "@/types/supabase";
import { transitions } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { 
  USER_MESSAGES,
  ALLOWED_USER_ROLES,
  ROLE_TRANSLATIONS,
  UserRole,
} from "@/lib/constants";

type User = {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

interface UsersTableProps {
  users: User[];
}

const roleColors: Record<UserRole, string> = {
  admin: "bg-green-500/10 text-green-700 dark:text-green-400",
  employee: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  secretary: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
} as const;

const roleIcons: Record<UserRole, LucideIcon> = {
  admin: Shield,
  employee: User,
  secretary: UserCog,
} as const;

interface UserRowProps {
  user: User;
  onResetPassword: (userId: string) => void;
  onChangeRole: (userId: string, role: UserRole) => void;
  onDelete: (userId: string) => void;
  loading: boolean;
}

// Memoized desktop table row (existing)
const DesktopTableRow = memo<UserRowProps>(({ user, onResetPassword, onChangeRole, onDelete, loading }) => {
  const Icon = roleIcons[user.role];
  
  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transitions.smooth }}
      className="hover:bg-muted/50"
    >
      <TableCell className="font-medium">{user.username}</TableCell>
      <TableCell>
        <Badge variant="secondary" className={roleColors[user.role]}>
          {Icon && <Icon className="mr-1 h-4 w-4" />}
          {ROLE_TRANSLATIONS[user.role]}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(user.created_at).toLocaleDateString('el-GR')}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
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
                  const Icon = roleIcons[role];
                  return (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => onChangeRole(user.id, role)}
                      disabled={user.role === role || loading}
                    >
                      <div className={`flex items-center ${roleColors[role]} rounded-md px-2 py-1`}>
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{ROLE_TRANSLATIONS[role]}</span>
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
              <span>Διαγραφή</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  );
});

DesktopTableRow.displayName = 'DesktopTableRow';

// New mobile row component
const MobileRow = memo<UserRowProps>(({ user, onResetPassword, onChangeRole, onDelete, loading }) => {
  const Icon = roleIcons[user.role];
  
  return (
    <div className="bg-card border-b p-3 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
            <UserCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-base">{user.username}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString('el-GR')}
            </p>
          </div>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
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
                    const Icon = roleIcons[role];
                    return (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => onChangeRole(user.id, role)}
                        disabled={user.role === role || loading}
                      >
                        <div className={`flex items-center ${roleColors[role]} rounded-md px-2 py-1`}>
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{ROLE_TRANSLATIONS[role]}</span>
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
                <span>Διαγραφή</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="pt-1">
        <Badge variant="secondary" className={roleColors[user.role]}>
          {Icon && <Icon className="mr-1 h-4 w-4" />}
          {ROLE_TRANSLATIONS[user.role]}
        </Badge>
      </div>
    </div>
  );
});

MobileRow.displayName = 'MobileRow';

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
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
  const parentRef = useRef<HTMLDivElement>(null);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    
    // Set initial value
    checkMobile();
    
    // Add throttled resize listener
    let resizeTimeout: NodeJS.Timeout | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 250);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);

  async function updateUserRole(userId: string, role: UserRole) {
    const { error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
  }

  async function handleChangeRole(userId: string, newRole: UserRole) {
    if (!userId || !newRole) return;
    setLoading(true);

    try {
      await updateUserRole(userId, newRole);
      toast.success('Ο ρόλος του χρήστη ενημερώθηκε επιτυχώς');
      router.refresh();
    } catch (error) {
      toast.error('Σφάλμα κατά την ενημέρωση του ρόλου');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!deleteUserId) return;
    setLoading(true);

    try {
      await supabase.auth.admin.deleteUser(deleteUserId);
      await supabase.from('users').delete().eq('id', deleteUserId);
      toast.success(USER_MESSAGES.DELETE_SUCCESS);
      router.refresh();
    } catch (error) {
      toast.error(USER_MESSAGES.UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
      setDeleteUserId(null);
    }
  }

  function handleSort(key: keyof User) {
    setSortConfig(config => ({
      key,
      direction: config.key === key && config.direction === 'asc' ? 'desc' : 'asc'
    }));
  }

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    return sortConfig.direction === 'asc' ? (aValue < bValue ? -1 : 1) : (aValue < bValue ? 1 : -1);
  });

  // For desktop virtualization
  const rowVirtualizer = useVirtualizer({
    count: sortedUsers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // Typical row height
    overscan: 5,
  });

  function renderSortButton(label: string, key: keyof User) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => handleSort(key)}
      >
        {label}
        <ChevronDown
          className={`ml-1 h-4 w-4 transition-transform ${
            sortConfig.key === key && sortConfig.direction === 'desc' ? 'rotate-180' : ''
          }`}
        />
      </Button>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <EmptyState
        icon={UserX}
        title="Δεν υπάρχουν χρήστες"
        description="Δεν υπάρχουν χρήστες καταχωρημένοι στο σύστημα."
      />
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <>
        <VirtualizedMobileList<User>
          items={sortedUsers}
          className="h-[calc(100vh-200px)] bg-background rounded-md border"
          estimateSize={() => 90}
          renderItem={(user) => (
            <MobileRow
              key={user.id}
              user={user}
              onResetPassword={setResetPasswordUserId}
              onChangeRole={handleChangeRole}
              onDelete={setDeleteUserId}
              loading={loading}
            />
          )}
        />
        
        <ConfirmationDialog
          open={!!deleteUserId}
          onOpenChange={() => setDeleteUserId(null)}
          title="Διαγραφή Χρήστη"
          description="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον χρήστη; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
          onConfirm={handleDeleteUser}
          loading={loading}
        />

        <ResetPasswordDialog
          open={!!resetPasswordUserId}
          onOpenChange={() => setResetPasswordUserId(null)}
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
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => (
              <DesktopTableRow 
                key={user.id}
                user={user}
                onResetPassword={setResetPasswordUserId}
                onChangeRole={handleChangeRole}
                onDelete={setDeleteUserId}
                loading={loading}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmationDialog
        open={!!deleteUserId}
        onOpenChange={() => setDeleteUserId(null)}
        title="Διαγραφή Χρήστη"
        description="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον χρήστη; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
        onConfirm={handleDeleteUser}
        loading={loading}
      />

      <ResetPasswordDialog
        open={!!resetPasswordUserId}
        onOpenChange={() => setResetPasswordUserId(null)}
        userId={resetPasswordUserId}
      />
    </>
  );
}