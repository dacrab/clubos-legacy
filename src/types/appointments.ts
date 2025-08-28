import type { Database } from './supabase';

export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export type AppointmentFormData = Omit<AppointmentInsert, 'created_at' | 'id'>; 