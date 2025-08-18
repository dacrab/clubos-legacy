// Football field booking types for the application
export interface FootballFieldBooking {
  id: string;
  whoBooked: string;
  contactDetails?: string | null;
  contactEmail?: string | null;
  bookingDatetime: Date;
  durationMinutes: number;
  fieldNumber: number;
  numPlayers: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  price?: string | null; // Decimal as string
  notes?: string | null;
  createdAt: Date;
  userId?: string | null;
  updatedAt: Date;
}

export interface FootballFieldBookingInsert
  extends Omit<FootballFieldBooking, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FootballFieldBookingUpdate = Partial<FootballFieldBookingInsert>;

export type FootballFieldBookingFormData = Omit<FootballFieldBookingInsert, 'userId'>;
