'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ALLOWED_USER_ROLES,
  DEFAULT_USER_ROLE,
  DIALOG_MESSAGES,
  PASSWORD_MIN_LENGTH,
  ROLE_TRANSLATIONS,
  USER_MESSAGES,
  type UserRole,
  VALIDATION,
} from '@/lib/constants';

type AddUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
  username: z
    .string()
    .min(
      VALIDATION.USERNAME_MIN_LENGTH,
      `Το όνομα χρήστη πρέπει να έχει τουλάχιστον ${VALIDATION.USERNAME_MIN_LENGTH} χαρακτήρες`
    )
    .max(
      VALIDATION.USERNAME_MAX_LENGTH,
      `Το όνομα χρήστη δεν πρέπει να ξεπερνά τους ${VALIDATION.USERNAME_MAX_LENGTH} χαρακτήρες`
    ),
  password: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `Ο κωδικός πρέπει να έχει τουλάχιστον ${PASSWORD_MIN_LENGTH} χαρακτήρες`
    ),
  role: z.enum(ALLOWED_USER_ROLES),
});

type FormValues = z.infer<typeof formSchema>;

function FormField({
  form,
  name,
  label,
  type = 'text',
  placeholder,
  disabled = false,
  loading,
  showPassword,
  setShowPassword,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  name: keyof FormValues;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  loading: boolean;
  showPassword?: boolean;
  setShowPassword?: (show: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="font-medium text-sm" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <Input
          id={name}
          type={name === 'password' ? (showPassword ? 'text' : 'password') : type}
          {...form.register(name)}
          className={form.formState.errors[name] ? 'border-destructive' : ''}
          disabled={disabled || loading}
          placeholder={placeholder}
        />
        {name === 'password' && (
          <Button
            className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
            disabled={loading}
            onClick={() => setShowPassword?.(!showPassword)}
            size="sm"
            type="button"
            variant="ghost"
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
        <p className="font-medium text-destructive text-sm">
          {form.formState.errors[name]?.message}
        </p>
      )}
    </div>
  );
}

export default function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      role: DEFAULT_USER_ROLE,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setLoading(false);
    }
  }, [open, form]);

  async function onSubmit(values: FormValues) {
    if (loading) {
      return;
    }
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
          role,
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
      toast.error(error instanceof Error ? error.message : USER_MESSAGES.UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => loading && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Νέος Χρήστης</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            form={form}
            label="Όνομα Χρήστη"
            loading={loading}
            name="username"
            placeholder="Όνομα χρήστη"
          />

          <FormField
            form={form}
            label="Κωδικός"
            loading={loading}
            name="password"
            placeholder="Κωδικός"
            setShowPassword={setShowPassword}
            showPassword={showPassword}
          />

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="role">
              Ρόλος
            </label>
            <Select
              disabled={loading}
              onValueChange={(value) => form.setValue('role', value as UserRole)}
              value={form.watch('role')}
            >
              <SelectTrigger
                className={form.formState.errors.role ? 'border-destructive' : ''}
                id="role"
              >
                <SelectValue placeholder="Επιλέξτε ρόλο" />
              </SelectTrigger>
              <SelectContent>
                {ALLOWED_USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_TRANSLATIONS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="font-medium text-destructive text-sm">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? DIALOG_MESSAGES.SAVE_LOADING : DIALOG_MESSAGES.SAVE_BUTTON}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
