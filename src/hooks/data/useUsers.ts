import useSWR from 'swr';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { UserRole, USER_MESSAGES } from '@/lib/constants';

// Define the User type matching the data structure
export type User = {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

// Define the type for the data returned by the fetcher
type FetcherResponse = {
  users: User[];
};

// Centralized fetcher function
const fetcher = async (url: string): Promise<FetcherResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch users.');
  }
  return response.json();
};

export function useUsers() {
  const { data, error, mutate } = useSWR<FetcherResponse>('/api/users', fetcher);

  const [loading, setLoading] = useState(false);

  // Memoize sorted users to prevent recalculation on every render
  const users = useMemo(() => data?.users || [], [data]);

  const apiRequest = async (
    url: string,
    method: 'POST' | 'DELETE' | 'PATCH',
    body: Record<string, any> | null = null,
    successMessage: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      toast.success(successMessage);
      await mutate(); // Revalidate the user list
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: Record<string, any>) => {
    await apiRequest('/api/users', 'POST', userData, USER_MESSAGES.CREATE_SUCCESS);
  };
  
  const deleteUser = async (userId: string) => {
    await apiRequest(`/api/users/${userId}`, 'DELETE', null, USER_MESSAGES.DELETE_SUCCESS);
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    await apiRequest(`/api/users/${userId}`, 'PATCH', { role }, 'Role updated successfully.');
  };

  const resetPassword = async (userId: string, password: string) => {
    await apiRequest(`/api/users/${userId}`, 'POST', { password }, USER_MESSAGES.PASSWORD_RESET_SUCCESS);
  };

  return {
    users,
    isLoading: !error && !data,
    isError: !!error,
    loading,
    error,
    addUser,
    deleteUser,
    updateUserRole,
    resetPassword,
    mutate,
  };
} 