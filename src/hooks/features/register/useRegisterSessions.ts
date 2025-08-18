import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { RegisterSessionWithClosings } from '@/types/register';

export function useRegisterSessions() {
  const [sessions, setSessions] = useState<RegisterSessionWithClosings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/register-sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch register sessions');
      }
      const data = await response.json();
      setSessions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch register sessions');
      toast.error('Αποτυχία φόρτωσης συνεδριών ταμείου');
    } finally {
      setLoading(false);
    }
  };

  const openSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/register-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to open register session');
      }

      const newSession = await response.json();
      setSessions(prev => [newSession, ...prev]);

      toast.success('Νέα συνεδρία ταμείου ξεκίνησε');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Σφάλμα κατά το άνοιγμα ταμείου';
      toast.error(`Σφάλμα κατά το άνοιγμα ταμείου: ${message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async (sessionId: string, notes?: string) => {
    setLoading(true);
    try {
      // Close register session via API
      const response = await fetch(`/api/register-sessions/${sessionId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to close register session');
      }

      const updatedSession = await response.json();
      setSessions(prev => prev.map(s => (s.id === sessionId ? updatedSession : s)));

      toast.success('Συνεδρία ταμείου έκλεισε');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Σφάλμα κατά το κλείσιμο ταμείου';
      toast.error(`Σφάλμα κατά το κλείσιμο ταμείου: ${message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    openSession,
    closeSession,
  };
}
