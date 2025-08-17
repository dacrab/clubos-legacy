import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';

import { useUser } from '@/lib/auth-client';
import { APPOINTMENT_MESSAGES } from '@/lib/constants';
import type { Appointment, AppointmentFormData } from '@/types/appointments';

const appointmentsFetcher = async (): Promise<Appointment[]> => {
  const response = await fetch('/api/appointments');
  if (!response.ok) {
    throw new Error('Failed to fetch appointments');
  }
  return response.json();
};

export function useAppointments() {
  const user = useUser();
  const { data: appointments, error, isLoading } = useSWR<Appointment[]>('appointments', appointmentsFetcher);
  const { mutate } = useSWRConfig();

  const revalidate = () => mutate('appointments');

  const addAppointment = async (formData: AppointmentFormData) => {
    try {
      if (!user) {throw new Error("User not authenticated");}

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create appointment');
      }
      
      toast.success(APPOINTMENT_MESSAGES.CREATE_SUCCESS);
      revalidate();
      return { success: true };
    } catch (error) {
      (await import('@/lib/utils/logger')).logger.error('Error adding appointment:', error);
      toast.error(error instanceof Error ? error.message : APPOINTMENT_MESSAGES.GENERIC_ERROR);
      return { success: false };
    }
  };

  const updateAppointment = async (id: string, formData: Partial<AppointmentFormData>) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update appointment');
      }
      
      toast.success(APPOINTMENT_MESSAGES.UPDATE_SUCCESS);
      revalidate();
      return { success: true };
    } catch (error) {
      (await import('@/lib/utils/logger')).logger.error('Error updating appointment:', error);
      toast.error(APPOINTMENT_MESSAGES.GENERIC_ERROR);
      return { success: false };
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete appointment');
      }
      
      toast.success(APPOINTMENT_MESSAGES.DELETE_SUCCESS);
      revalidate();
    } catch (error) {
      (await import('@/lib/utils/logger')).logger.error('Error deleting appointment:', error);
      toast.error(APPOINTMENT_MESSAGES.GENERIC_ERROR);
    }
  };

  return {
    appointments: appointments || [],
    error,
    isLoading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
}