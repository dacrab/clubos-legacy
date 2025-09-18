// Centralized, typed environment access with runtime validation
const getEnvVar = (key: string): string | undefined => process.env[key];

export const env = (() => {
  const NEXT_PUBLIC_SUPABASE_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL') as string;
  const NEXT_PUBLIC_SUPABASE_ANON_KEY = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') as string;
  const ANALYZE = getEnvVar('ANALYZE') as string | undefined;

  if (!(NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    throw new Error('Missing Supabase URL or anonymous key');
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ANALYZE,
  } as const;
})();
