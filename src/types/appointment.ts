// ======= Appointment Types =======
export type Appointment = {
  id: string;
  customer_name: string;
  contact_info: string;
  appointment_date: string;
  num_children: number;
  num_adults: number;
  notes: string | null;
  status: string;
  created_at: string;
  created_by: string;
};

export type AppointmentInsert = Omit<Appointment, 'id' | 'created_at'>;
export type AppointmentUpdate = Partial<AppointmentInsert>;
export type AppointmentFormData = Omit<AppointmentInsert, 'created_at' | 'id'>;
