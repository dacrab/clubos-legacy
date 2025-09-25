// Augment NodeJS.ProcessEnv so dot-access is allowed for known keys
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      ANALYZE?: 'true' | 'false';
    }
  }
}
export { };
