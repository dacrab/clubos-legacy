"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, memo } from "react";
import { motion } from "framer-motion";
import { 
  MoreHorizontal, 
  Key, 
  UserX, 
  ChevronDown, 
  Shield, 
  User as UserIcon, 
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

import { transitions } from "@/lib/animations";
import { 
  USER_MESSAGES,
  ALLOWED_USER_ROLES,
  ROLE_TRANSLATIONS,
  UserRole,
} from "@/lib/constants";
import { User } from "@/hooks/data/useUsers";
import { cn } from "@/lib/utils";

interface UsersTableProps {
  users: User[];
  isMobile: boolean;
  loading: boolean;
  onDeleteUser: (userId: string) => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
  onResetPassword: (userId: string) => void;
}

const roleColors: Record<UserRole, string> = {
  admin: "bg-green-500/10 text-green-700 dark:text-green-400",
  employee: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  secretary: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
} as const;

const roleIcons: Record<UserRole, LucideIcon> = {
  admin: Shield,
  employee: UserIcon,
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
        <Badge variant="secondary" className={cn(
          "whitespace-nowrap",
          roleColors[user.role]
        )}>
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
                  const RoleIcon = roleIcons[role];
                  return (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => onChangeRole(user.id, role)}
                      disabled={user.role === role || loading}
                    >
                      <div className={cn(
                        "flex items-center rounded-md px-2 py-1",
                        roleColors[role]
                      )}>
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
              onClick={() => onDelete(user.id)}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-100 dark:focus:bg-red-900/40"
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
                    const RoleIcon = roleIcons[role];
                    return (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => onChangeRole(user.id, role)}
                        disabled={user.role === role || loading}
                      >
                        <div className={cn(
                          "flex items-center rounded-md px-2 py-1",
                          roleColors[role]
                        )}>
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
                onClick={() => onDelete(user.id)}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-100 dark:focus:bg-red-900/40"
              >
                <UserX className="mr-2 h-4 w-4" />
                <span>Διαγραφή</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="pt-1">
        <Badge variant="secondary" className={cn(
          "whitespace-nowrap",
          roleColors[user.role]
        )}>
          {Icon && <Icon className="mr-1 h-4 w-4" />}
          {ROLE_TRANSLATIONS[user.role]}
        </Badge>
      </div>
    </div>
  );
});

MobileRow.displayName = 'MobileRow';

export default function UsersTable({ 
  users, 
  isMobile, 
  loading,
  onDeleteUser, 
  onUpdateRole, 
  onResetPassword 
}: UsersTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'asc' | 'desc';
  }>({ key: 'created_at', direction: 'desc' });
  
  const parentRef = useRef<HTMLDivElement>(null);

  function handleSort(key: keyof User) {
    setSortConfig(config => ({
      key,
      direction: config.key === key && config.direction === 'asc' ? 'desc' : 'asc'
    }));
  }

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
    if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
    return sortConfig.direction === 'asc' ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
  });

  const rowVirtualizer = useVirtualizer({
    count: sortedUsers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => isMobile ? 90 : 56,
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
      <VirtualizedMobileList<User>
        items={sortedUsers}
        className="h-[calc(100vh-200px)] bg-background rounded-md border"
        estimateSize={() => 90}
        renderItem={(user) => (
          <MobileRow
            key={user.id}
            user={user}
            onResetPassword={onResetPassword}
            onChangeRole={onUpdateRole}
            onDelete={onDeleteUser}
            loading={loading}
          />
        )}
      />
    );
  }

  return (
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
              onResetPassword={onResetPassword}
              onChangeRole={onUpdateRole}
              onDelete={onDeleteUser}
              loading={loading}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}