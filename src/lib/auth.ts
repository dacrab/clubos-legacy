// Server-only authentication configuration
import { StackServerApp } from '@stackframe/stack';

// Check if required Stack Auth environment variables are present
const hasStackAuthConfig = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;

// Create Stack Auth instance only if configuration is available
export const stackServerApp = hasStackAuthConfig
  ? new StackServerApp({
      tokenStore: 'nextjs-cookie', // storing auth tokens in cookies
    })
  : ({
      // Mock implementation for CI builds or when Stack Auth is not configured
      async getUser(_userId?: string) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Stack Auth is not configured. Please set NEXT_PUBLIC_STACK_PROJECT_ID.');
        }
        return null; // Return null during build time
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async createUser(_userData: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Stack Auth is not configured. Please set NEXT_PUBLIC_STACK_PROJECT_ID.');
        }
        return null;
      },
      // Add other methods that might be used
      async getServerUser() {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Stack Auth is not configured. Please set NEXT_PUBLIC_STACK_PROJECT_ID.');
        }
        return null;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any); // Type assertion to match StackServerApp interface
