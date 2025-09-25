// Centralized, typed environment access with runtime validation
// IMPORTANT: Use direct dot-access so Next.js can inline values in client bundles

export const env = (() => {
  // Use dot-access for NEXT_PUBLIC_* so Webpack/Next can statically replace them
  const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // This may be undefined on the client; that's fine as it's optional
  const ANALYZE = process.env.ANALYZE;

  if (!(NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    throw new Error('Missing Supabase URL or anonymous key');
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ANALYZE,
  } as const;
})();
