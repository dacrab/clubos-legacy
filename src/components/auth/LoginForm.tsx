'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useStackApp } from '@/lib/auth-client';
import { logger } from '@/lib/utils/logger';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const stackApp = useStackApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await stackApp.signInWithCredential({
        email,
        password,
      });

      toast.success('Επιτυχής σύνδεση!');
      router.push('/dashboard');
    } catch (err: unknown) {
      logger.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Σφάλμα σύνδεσης. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">Σύνδεση</CardTitle>
          <CardDescription className="text-center">
            Εισάγετε τα στοιχεία σας για να συνδεθείτε
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vkavouras@proton.me"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Κωδικός</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Εισάγετε τον κωδικό σας"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Σύνδεση...
                </>
              ) : (
                'Σύνδεση'
              )}
            </Button>
          </form>

          <div className="text-muted-foreground mt-6 text-center text-sm">
            <p>Δοκιμαστικοί λογαριασμοί:</p>
            <div className="mt-2 space-y-1">
              <p>
                <strong>Admin:</strong> vkavouras@proton.me
              </p>
              <p>
                <strong>Staff:</strong> staff@clubos.com
              </p>
              <p>
                <strong>Secretary:</strong> secretary@clubos.com
              </p>
              <p className="mt-2 text-xs">Κωδικός για όλους: password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
