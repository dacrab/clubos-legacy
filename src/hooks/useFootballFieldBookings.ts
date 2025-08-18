import { useState } from 'react';
import { toast } from 'sonner';

import type { FootballFieldBookingFormData, FootballFieldBookingUpdate } from '@/types/bookings';
import { FOOTBALL_BOOKING_MESSAGES } from '@/lib/constants';

export const useFootballFieldBookings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const addBooking = async (formData: FootballFieldBookingFormData) => {
    setIsLoading(true);
    try {
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Άγνωστο σφάλμα';
      toast.error(`Σφάλμα δημιουργίας κράτησης: ${message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBooking = async (id: string, formData: Partial<FootballFieldBookingUpdate>) => {
    setIsLoading(true);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Άγνωστο σφάλμα';
      toast.error(`Σφάλμα ενημέρωσης κράτησης: ${message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBooking = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete booking');
      }

      toast.success(FOOTBALL_BOOKING_MESSAGES.DELETE_SUCCESS);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Άγνωστο σφάλμα';
      toast.error(`Σφάλμα διαγραφής κράτησης: ${message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addBooking,
    updateBooking,
    deleteBooking,
    isLoading,
  };
};
