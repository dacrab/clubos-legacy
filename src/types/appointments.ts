// Appointment types for the application
export interface Appointment {
  id: string;
  title: string;
  whoBooked: string;
  contactDetails?: string | null;
  contactEmail?: string | null;
  dateTime: Date;
  durationMinutes: number;
  numChildren: number;
  numAdults: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string | null;
  createdAt: Date;
  userId?: string | null;
  updatedAt: Date;
}

export interface AppointmentInsert extends Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AppointmentUpdate = Partial<AppointmentInsert>;

export type AppointmentFormData = Omit<AppointmentInsert, 'userId'>;
