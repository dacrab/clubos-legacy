import { StackHandler } from '@stackframe/stack';

import { stackServerApp } from '@/lib/auth';

// Check if Stack Auth is configured
const hasStackAuthConfig = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;

export default function Handler(props: unknown) {
  if (!hasStackAuthConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Authentication Not Configured</h1>
          <p className="text-gray-600">
            Stack Auth is not configured. Please set the required environment variables.
          </p>
        </div>
      </div>
    );
  }

  return <StackHandler fullPage app={stackServerApp} routeProps={props} />;
}
