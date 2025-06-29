import type { Tables, TablesInsert, TablesUpdate } from './supabase';

export type FootballFieldBooking = Tables<'football_field_bookings'>;
export type FootballFieldBookingInsert = TablesInsert<'football_field_bookings'>;
export type FootballFieldBookingUpdate = TablesUpdate<'football_field_bookings'>;

export type FootballFieldBookingFormData = Omit<FootballFieldBookingInsert, 'id' | 'created_at' | 'user_id'>; 