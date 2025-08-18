import { StackHandler } from '@stackframe/stack';

import { stackServerApp } from '@/lib/auth';

// Check if Stack Auth is configured
const hasStackAuthConfig = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;

export default function Handler(props: unknown) {
  if (!hasStackAuthConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Not Configured</h1>
          <p className="text-gray-600">
            Stack Auth is not configured. Please set the required environment variables.
          </p>
        </div>
      </div>
    );
  }

  return <StackHandler fullPage app={stackServerApp} routeProps={props} />;
}
