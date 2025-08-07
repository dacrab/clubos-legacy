import useSWR, { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import { createClientSupabase } from '@/lib/supabase/client';
import { FOOTBALL_BOOKING_MESSAGES } from '@/lib/constants';
import type {
  FootballFieldBooking,
  FootballFieldBookingFormData,
  FootballFieldBookingUpdate
} from '@/types/bookings';

const bookingsFetcher = (supabase: ReturnType<typeof createClientSupabase>) => async (): Promise<FootballFieldBooking[]> => {
  const { data, error } = await supabase
    .from('football_field_bookings')
    .select('*')
    .order('booking_datetime', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export function useFootballFieldBookings() {
  const supabase = createClientSupabase();
  const { data: bookings, error, isLoading } = useSWR<FootballFieldBooking[]>('football_field_bookings', bookingsFetcher(supabase));
  const { mutate } = useSWRConfig();

  const revalidate = () => mutate('football_field_bookings');

  const addBooking = async (formData: FootballFieldBookingFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('football_field_bookings').insert([{ ...formData, user_id: user.id }]);
      if (error) throw error;

      toast.success(FOOTBALL_BOOKING_MESSAGES.CREATE_SUCCESS);
      revalidate();
      return { success: true };
    } catch (error) {
      console.error('Error adding booking:', error);
      toast.error(error instanceof Error ? error.message : FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
      return { success: false };
    }
  };

  const updateBooking = async (id: string, formData: Partial<FootballFieldBookingUpdate>) => {
    try {
      const { error } = await supabase.from('football_field_bookings').update(formData).eq('id', id);
      if (error) throw error;
      toast.success(FOOTBALL_BOOKING_MESSAGES.UPDATE_SUCCESS);
      revalidate();
      return { success: true };
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
      return { success: false };
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const { error } = await supabase.from('football_field_bookings').delete().eq('id', id);
      if (error) throw error;
      toast.success(FOOTBALL_BOOKING_MESSAGES.DELETE_SUCCESS);
      revalidate();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error(FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
    }
  };

  return {
    bookings,
    error,
    isLoading,
    addBooking,
    updateBooking,
    deleteBooking,
  };
} 