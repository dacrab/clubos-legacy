import { UserRole } from "@/lib/constants";

export type PageProps = {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
};

export interface UserProfile {
  id: string;
  username: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}