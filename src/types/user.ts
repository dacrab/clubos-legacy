import type { ALLOWED_USER_ROLES } from '@/lib/constants';

// ======= User & Role Types =======
export type UserRole = (typeof ALLOWED_USER_ROLES)[number];

export type User = {
  id: string;
  username: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type UserDisplay = User & {
  display_name: string; // Can be username or full name depending on context
};

export type UserProfile = User & {
  isAdmin: boolean;
  fullName: string | null;
};
