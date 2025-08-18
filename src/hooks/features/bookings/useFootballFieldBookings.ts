import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';

import type { FootballFieldBooking, FootballFieldBookingFormData } from '@/types/bookings';
import { useUser } from '@/lib/auth-client';
import { FOOTBALL_BOOKING_MESSAGES } from '@/lib/constants';

const bookingsFetcher = async (): Promise<FootballFieldBooking[]> => {
  const response = await fetch('/api/bookings');
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  return response.json();
};

export function useFootballFieldBookings() {
  const user = useUser();
  const {
    data: bookings,
    error,
    isLoading,
  } = useSWR<FootballFieldBooking[]>('football_field_bookings', bookingsFetcher);
  const { mutate } = useSWRConfig();

  const revalidate = () => mutate('football_field_bookings');

  const addBooking = async (formData: FootballFieldBookingFormData) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      toast.success(FOOTBALL_BOOKING_MESSAGES.CREATE_SUCCESS);
      revalidate();
      return { success: true };
    } catch (error) {
      (await import('@/lib/utils/logger')).logger.error('Error adding booking:', error);
      toast.error(error instanceof Error ? error.message : FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
      return { success: false };
    }
  };

  const updateBooking = async (id: string, formData: Partial<FootballFieldBooking>) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update booking');
      }

      toast.success(FOOTBALL_BOOKING_MESSAGES.UPDATE_SUCCESS);
      revalidate();
      return { success: true };
    } catch (error) {
      (await import('@/lib/utils/logger')).logger.error('Error updating booking:', error);
      toast.error(FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
      return { success: false };
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete booking');
      }

      toast.success(FOOTBALL_BOOKING_MESSAGES.DELETE_SUCCESS);
      revalidate();
    } catch (error) {
      (await import('@/lib/utils/logger')).logger.error('Error deleting booking:', error);
      toast.error(FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
    }
  };

  return {
    bookings: bookings || [],
    error,
    isLoading,
    addBooking,
    updateBooking,
    deleteBooking,
  };
}
