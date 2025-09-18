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
