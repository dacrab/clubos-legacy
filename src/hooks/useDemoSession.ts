"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';

const DEMO_USERS = ['admin@example.com', 'staff@example.com', 'secretary@example.com'];
const DEMO_SESSION_DURATION = 60 * 60 * 1000; // 1 hour

export function useDemoSession() {
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isDemoSession, setIsDemoSession] = useState<boolean | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isEnding, setIsEnding] = useState(false);

  const endDemoSession = useCallback(async () => {
    if (isEnding) return;
    setIsEnding(true);

    toast.info('Η δοκιμαστική σας περίοδος έληξε. Η βάση δεδομένων θα επαναφερθεί.');
    
    try {
      // Call API to reset database
      await fetch('/api/reset-db', { method: 'POST' });
      toast.success('Η βάση δεδομένων επαναφέρθηκε.');
    } catch (error) {
      toast.error('Αποτυχία επαναφοράς της βάσης δεδομένων.');
      console.error('Error resetting database:', error);
    } finally {
      // Logout user
      await supabase.auth.signOut();
      localStorage.removeItem('demo_session_start_time');
      router.push('/');
      toast.info('Αποσυνδεθήκατε.');
    }
  }, [router, supabase, isEnding]);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email && DEMO_USERS.includes(session.user.email)) {
        setIsDemoSession(true);
        const startTime = localStorage.getItem('demo_session_start_time');
        if (!startTime) {
          const now = Date.now();
          localStorage.setItem('demo_session_start_time', now.toString());
          setRemainingTime(DEMO_SESSION_DURATION);
        } else {
          const elapsed = Date.now() - parseInt(startTime, 10);
          setRemainingTime(DEMO_SESSION_DURATION - elapsed);
        }
      } else {
        setIsDemoSession(false);
        localStorage.removeItem('demo_session_start_time');
      }
    }

    checkSession();
  }, [supabase]);

  useEffect(() => {
    if (isDemoSession) {
      const interval = setInterval(() => {
        const startTime = localStorage.getItem('demo_session_start_time');
        if (startTime) {
          const elapsed = Date.now() - parseInt(startTime, 10);
          const newRemainingTime = DEMO_SESSION_DURATION - elapsed;
          
          if (newRemainingTime <= 0) {
            setRemainingTime(0);
            endDemoSession();
          } else {
            setRemainingTime(newRemainingTime);
          }
        }
      }, 1000); // Check every second

      return () => clearInterval(interval);
    }
  }, [isDemoSession, endDemoSession]);

  return { isDemoSession, remainingTime };
} 