// Stack Auth user types based on @stackframe/stack
export interface StackUser {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  primaryEmailVerified: boolean;
  profileImageUrl: string | null;
  signedUpAt: Date;
  clientMetadata: Record<string, unknown>;
  serverMetadata: Record<string, unknown>;
}

// Extended user type that includes our database fields
export interface ExtendedUser extends StackUser {
  // Database fields from our users table
  username: string;
  role: 'admin' | 'employee' | 'secretary';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User profile for components that need basic user info
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  role: 'admin' | 'employee' | 'secretary';
  isActive: boolean;
  profileImageUrl: string | null;
}

// Auth context type for components
export interface AuthContextType {
  user: StackUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

// Session data type
export interface SessionData {
  user: StackUser;
  profile: UserProfile;
  expiresAt: Date;
}
