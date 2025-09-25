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
