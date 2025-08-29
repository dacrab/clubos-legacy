"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
  USER_MESSAGES,
  VALIDATION,
  ALLOWED_USER_ROLES,
  ROLE_TRANSLATIONS,
  PASSWORD_MIN_LENGTH,
  type UserRole
} from '@/lib/constants';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export default function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      role: DEFAULT_USER_ROLE
    }
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setLoading(false);
    }
  }, [open, form]);

  async function onSubmit(values: FormValues) {
    if (loading) {return;}
    setLoading(true);

    try {
      const { username, password, role } = values;
      const email = `${username.toLowerCase()}@example.com`;

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username,
          role
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || USER_MESSAGES.UNEXPECTED_ERROR);
      }

      toast.success(USER_MESSAGES.CREATE_SUCCESS);
      onOpenChange(false);
      router.refresh();

    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : USER_MESSAGES.UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
    }
  }

  const FormField = ({ 
    name, 
    label, 
    type = "text",
    placeholder,
    disabled = false
  }: {
    name: keyof FormValues;
    label: string;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    autoFocus?: boolean;
  }) => (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={name}
          type={name === 'password' ? (showPassword ? 'text' : 'password') : type}
          {...form.register(name)}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={form.formState.errors[name] ? "border-destructive" : ""}
        />
        {name === 'password' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
      {form.formState.errors[name] && (
        <p className="text-sm font-medium text-destructive">
          {form.formState.errors[name].message}
        </p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md"
        onInteractOutside={(e) => loading && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Νέος Χρήστης</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="username"
            label="Όνομα Χρήστη"
            placeholder="Όνομα χρήστη"
          />

          <FormField
            name="password"
            label="Κωδικός"
            placeholder="Κωδικός"
          />

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Ρόλος
            </label>
            <Select
              value={form.watch('role')}
              onValueChange={(value) => form.setValue('role', value as UserRole)}
              disabled={loading}
            >
              <SelectTrigger id="role" className={form.formState.errors.role ? "border-destructive" : ""}>
                <SelectValue placeholder="Επιλέξτε ρόλο" />
              </SelectTrigger>
              <SelectContent>
                {ALLOWED_USER_ROLES.map(role => (
                  <SelectItem key={role} value={role}>
                    {ROLE_TRANSLATIONS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? DIALOG_MESSAGES.SAVE_LOADING : DIALOG_MESSAGES.SAVE_BUTTON}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}