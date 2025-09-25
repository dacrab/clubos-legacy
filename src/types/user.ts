import type { ALLOWED_USER_ROLES } from '@/lib/constants';

// ======= User & Role Types =======
export type UserRole = (typeof ALLOWED_USER_ROLES)[number];
