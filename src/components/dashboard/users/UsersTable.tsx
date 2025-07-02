"use client";

import { useState, useRef, memo, useMemo, useCallback } from "react";
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
  DropdownMenuTrigger
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
import { EmptyState } from "@/components/ui/empty-state";

import { 
  ALLOWED_USER_ROLES,
  ROLE_TRANSLATIONS,
  UserRole,
} from "@/lib/constants";
import { User } from "@/hooks/data/useUsers";
import { cn } from "@/lib/utils";

// --- PROPS & CONSTANTS ---

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
};

const roleIcons: Record<UserRole, LucideIcon> = {
  admin: Shield,
  employee: UserIcon,
  secretary: UserCog,
};

interface UserActionsProps {
  userId: string;
  userRole: UserRole;
  loading: boolean;
  onResetPassword: (userId: string) => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
  onDelete: (userId: string) => void;
}

// --- REUSABLE SUB-COMPONENTS ---

const UserActionsDropdown = memo(({ userId, userRole, loading, onResetPassword, onUpdateRole, onDelete }: UserActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onResetPassword(userId)}>
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
                  onClick={() => onUpdateRole(userId, role)}
                  disabled={userRole === role || loading}
                >
                  <div className={cn("flex items-center rounded-md px-2 py-1", roleColors[role])}>
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
          onClick={() => onDelete(userId)}
          className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-100 dark:focus:bg-red-900/40"
        >
          <UserX className="mr-2 h-4 w-4" />
          <span>Διαγραφή</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
UserActionsDropdown.displayName = 'UserActionsDropdown';

interface UserRowProps {
  user: User;
  onResetPassword: (userId: string) => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
  onDelete: (userId: string) => void;
  loading: boolean;
  style?: React.CSSProperties;
}

const DesktopTableRow = memo<UserRowProps>(({ user, onResetPassword, onUpdateRole, onDelete, loading, style }) => {
  const Icon = roleIcons[user.role];
  return (
    <TableRow style={style} className="hover:bg-muted/50 w-full">
      <TableCell className="w-1/3 font-medium text-sm">{user.username}</TableCell>
      <TableCell className="w-1/3">
        <Badge variant="secondary" className={cn("whitespace-nowrap text-sm", roleColors[user.role])}>
          <Icon className="mr-1 h-4 w-4" />
          {ROLE_TRANSLATIONS[user.role]}
        </Badge>
      </TableCell>
      <TableCell className="w-1/3 text-muted-foreground text-sm">
        {new Date(user.created_at).toLocaleDateString('el-GR')}
      </TableCell>
      <TableCell className="w-[80px]">
        <UserActionsDropdown
          userId={user.id}
          userRole={user.role}
          loading={loading}
          onResetPassword={onResetPassword}
          onUpdateRole={onUpdateRole}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
});
DesktopTableRow.displayName = 'DesktopTableRow';

const MobileRow = memo<UserRowProps>(({ user, onResetPassword, onUpdateRole, onDelete, loading }) => {
  const Icon = roleIcons[user.role];
  return (
    <div className="bg-card border-b p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-11 w-11 rounded-full bg-muted">
            <UserCircle className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-base">{user.username}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString('el-GR')}
            </p>
          </div>
        </div>
        <UserActionsDropdown
          userId={user.id}
          userRole={user.role}
          loading={loading}
          onResetPassword={onResetPassword}
          onUpdateRole={onUpdateRole}
          onDelete={onDelete}
        />
      </div>
      <div className="pt-1">
        <Badge variant="secondary" className={cn("whitespace-nowrap text-sm", roleColors[user.role])}>
          <Icon className="mr-1.5 h-4 w-4" />
          {ROLE_TRANSLATIONS[user.role]}
        </Badge>
      </div>
    </div>
  );
});
MobileRow.displayName = 'MobileRow';

// --- MAIN COMPONENT ---

export default function UsersTable({ 
  users, 
  isMobile, 
  loading,
  onDeleteUser, 
  onUpdateRole, 
  onResetPassword 
}: UsersTableProps) {
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' }>({
    key: 'created_at',
    direction: 'desc',
  });
  
  const parentRef = useRef<HTMLDivElement>(null);

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
      if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
      return sortConfig.direction === 'asc' ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
    });
  }, [users, sortConfig]);

  const rowVirtualizer = useVirtualizer({
    count: sortedUsers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => isMobile ? 124 : 56, // Adjusted mobile size
    overscan: 5,
  });

  const renderSortButton = useCallback((label: string, key: keyof User) => {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 text-sm"
        onClick={() => handleSort(key)}
      >
        {label}
        <ChevronDown
          className={`ml-1.5 h-4 w-4 transition-transform ${
            sortConfig.key === key && sortConfig.direction === 'desc' ? 'rotate-180' : ''
          }`}
        />
      </Button>
    );
  }, [handleSort, sortConfig]);

  if (users.length === 0) {
    return (
      <EmptyState
        icon={UserX}
        title="Δεν υπάρχουν χρήστες"
        description="Δεν έχουν δημιουργηθεί χρήστες ακόμα."
      />
    );
  }

  // --- RENDER LOGIC ---

  if (isMobile) {
    return (
      <div ref={parentRef} className="h-[calc(100vh-200px)] overflow-y-auto bg-background rounded-md border">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map(virtualItem => (
            <div
              key={sortedUsers[virtualItem.index].id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <MobileRow
                user={sortedUsers[virtualItem.index]}
                onResetPassword={onResetPassword}
                onUpdateRole={onUpdateRole}
                onDelete={onDeleteUser}
                loading={loading}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-280px)] overflow-y-auto rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-1/3">{renderSortButton('Όνομα Χρήστη', 'username')}</TableHead>
            <TableHead className="w-1/3">{renderSortButton('Ρόλος', 'role')}</TableHead>
            <TableHead className="w-1/3">{renderSortButton('Ημερομηνία Δημιουργίας', 'created_at')}</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map(virtualItem => (
            <DesktopTableRow
              key={sortedUsers[virtualItem.index].id}
              user={sortedUsers[virtualItem.index]}
              onResetPassword={onResetPassword}
              onUpdateRole={onUpdateRole}
              onDelete={onDeleteUser}
              loading={loading}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}