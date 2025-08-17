"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DEFAULT_USER_ROLE,
  DIALOG_MESSAGES,
  VALIDATION,
  ALLOWED_USER_ROLES,
  ROLE_TRANSLATIONS,
  PASSWORD_MIN_LENGTH,
  type UserRole
} from '@/lib/constants';

interface AddUserButtonProps {
  onAddUser: (userData: FormValues) => Promise<void>;
  loading: boolean;
}

const formSchema = z.object({
  username: z.string()
    .min(VALIDATION.USERNAME_MIN_LENGTH, `Το όνομα χρήστη πρέπει να έχει τουλάχιστον ${VALIDATION.USERNAME_MIN_LENGTH} χαρακτήρες`)
    .max(VALIDATION.USERNAME_MAX_LENGTH, `Το όνομα χρήστη δεν πρέπει να ξεπερνά τους ${VALIDATION.USERNAME_MAX_LENGTH} χαρακτήρες`),
  password: z.string()
    .min(PASSWORD_MIN_LENGTH, `Ο κωδικός πρέπει να έχει τουλάχιστον ${PASSWORD_MIN_LENGTH} χαρακτήρες`),
  role: z.enum(ALLOWED_USER_ROLES)
});

type FormValues = z.infer<typeof formSchema>;

export default function AddUserButton({ onAddUser, loading }: AddUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "", role: DEFAULT_USER_ROLE }
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  async function onSubmit(values: FormValues) {
    await onAddUser(values);
    setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Νέος Χρήστης
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" onInteractOutside={(e) => loading && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Νέος Χρήστης</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Όνομα Χρήστη</label>
              <Input id="username" {...form.register("username")} placeholder="Όνομα χρήστη" autoFocus />
              {form.formState.errors.username && <p className="text-sm font-medium text-destructive">{form.formState.errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password">Κωδικός</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...form.register("password")}
                  placeholder="Κωδικός"
                />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {form.formState.errors.password && <p className="text-sm font-medium text-destructive">{form.formState.errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="role">Ρόλος</label>
              <Select value={form.watch('role')} onValueChange={(value) => form.setValue('role', value as UserRole)}>
                <SelectTrigger id="role"><SelectValue placeholder="Επιλέξτε ρόλο" /></SelectTrigger>
                <SelectContent>
                  {ALLOWED_USER_ROLES.map(role => (
                    <SelectItem key={role} value={role}>{ROLE_TRANSLATIONS[role]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.role && <p className="text-sm font-medium text-destructive">{form.formState.errors.role.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? DIALOG_MESSAGES.SAVE_LOADING : DIALOG_MESSAGES.SAVE_BUTTON}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 