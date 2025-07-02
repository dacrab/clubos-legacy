"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { transitions } from "@/lib/animations";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import AddUserButton from "@/components/dashboard/users/AddUserButton";
import UsersTable from "@/components/dashboard/users/UsersTable";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthorization } from "@/hooks/auth/useAuthorization";
import { useUsers } from "@/hooks/data/useUsers";
import { EmptyState } from "@/components/ui/empty-state";
import { UserX } from "lucide-react";
import ResetPasswordDialog from "@/components/dashboard/users/ResetPasswordDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useMediaQuery } from "@/hooks/utils/useMediaQuery";

export default function UsersPage() {
  const authorizationStatus = useAuthorization();
  const { 
    users, 
    isLoading: usersLoading, 
    isError, 
    deleteUser, 
    updateUserRole, 
    resetPassword,
    addUser,
    loading: mutationLoading
  } = useUsers();
  
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  if (authorizationStatus === 'loading' || usersLoading) return <LoadingAnimation />;
  if (authorizationStatus === 'unauthorized' || isError) {
    return (
      <EmptyState
        icon={UserX}
        title="Σφάλμα"
        description="Δεν ήταν δυνατή η φόρτωση των χρηστών."
      />
    );
  }

  const handleDelete = () => {
    if (deleteUserId) {
      deleteUser(deleteUserId);
      setDeleteUserId(null);
    }
  };

  const handleResetPassword = async (password: string) => {
    if (resetPasswordUserId) {
      await resetPassword(resetPasswordUserId, password);
      setResetPasswordUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.smooth}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Χρήστες</h1>
            <p className="text-muted-foreground">
              Διαχείριση χρηστών και δικαιωμάτων πρόσβασης
            </p>
          </div>
          <AddUserButton onAddUser={addUser} loading={mutationLoading} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, ...transitions.smooth }}
        className="w-full"
      >
        <Card className={cn(isMobile ? "border-0 p-0 shadow-none bg-transparent" : "p-0")}>
          <UsersTable 
            users={users} 
            isMobile={isMobile}
            loading={mutationLoading}
            onDeleteUser={setDeleteUserId}
            onResetPassword={setResetPasswordUserId}
            onUpdateRole={updateUserRole}
          />
        </Card>
      </motion.div>

      <ResetPasswordDialog
        open={!!resetPasswordUserId}
        onOpenChange={() => setResetPasswordUserId(null)}
        onSubmit={handleResetPassword}
        loading={mutationLoading}
      />

      <ConfirmationDialog
        open={!!deleteUserId}
        onOpenChange={() => setDeleteUserId(null)}
        title="Διαγραφή Χρήστη"
        description="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον χρήστη; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
        onConfirm={handleDelete}
        loading={mutationLoading}
      />
    </div>
  );
}