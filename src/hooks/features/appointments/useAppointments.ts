import useSWR, { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import { createClientSupabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import type { Appointment, AppointmentFormData } from '@/types/appointments';
import { APPOINTMENT_MESSAGES } from '@/lib/constants';

const appointmentsFetcher = (supabase: ReturnType<typeof createClientSupabase>) => async (): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date_time', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export function useAppointments() {
  const supabase = createClientSupabase();
  const { data: appointments, error, isLoading } = useSWR<Appointment[]>('appointments', appointmentsFetcher(supabase));
  const { mutate } = useSWRConfig();

  const revalidate = () => mutate('appointments');

  const addAppointment = async (formData: AppointmentFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('appointments').insert([{ ...formData, user_id: user.id }]);
      if (error) throw error;
      
      toast.success(APPOINTMENT_MESSAGES.CREATE_SUCCESS);
      revalidate();
      return { success: true };
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast.error(error instanceof Error ? error.message : APPOINTMENT_MESSAGES.GENERIC_ERROR);
      return { success: false };
    }
  };

  const updateAppointment = async (id: string, formData: Partial<AppointmentFormData>) => {
    try {
      const { error } = await supabase.from('appointments').update(formData).eq('id', id);
      if (error) throw error;
      toast.success(APPOINTMENT_MESSAGES.UPDATE_SUCCESS);
      revalidate();
      return { success: true };
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(APPOINTMENT_MESSAGES.GENERIC_ERROR);
      return { success: false };
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      toast.success(APPOINTMENT_MESSAGES.DELETE_SUCCESS);
      revalidate();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error(APPOINTMENT_MESSAGES.GENERIC_ERROR);
    }
  };

  return {
    appointments,
    error,
    isLoading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
} 