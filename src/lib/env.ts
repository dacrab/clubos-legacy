// Centralized, typed environment access with runtime validation
// Bracket access is unnecessary here; prefer dot syntax for env keys
export const env = (() => {
  const NEXT_PUBLIC_SUPABASE_URL = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const ANALYZE = process.env['ANALYZE'];

  if (!(NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    throw new Error('Missing Supabase URL or anonymous key');
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ANALYZE,
  } as const;
})();
