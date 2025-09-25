'use client';

import { Calendar } from 'lucide-react';
import type React from 'react';
import { AppointmentForm } from '@/components/dashboard/appointments/appointment-form';
import { AppointmentsList } from '@/components/dashboard/appointments/appointments-list';
import FootballFieldBookingForm from '@/components/dashboard/football/football-field-booking-form';
import FootballFieldBookingsList from '@/components/dashboard/football/football-field-bookings-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { APPOINTMENT_MESSAGES, FOOTBALL_BOOKING_MESSAGES } from '@/lib/constants';

type EmptyStateProps = {
  icon: React.ElementType;
  message: string;
};

type CardHeaderProps = {
  title: string;
};

type CardProps = {
  children: React.ReactNode;
};

// Reusable Components
const EmptyState = ({ icon: Icon, message }: EmptyStateProps) => (
  <div className="py-4 text-center sm:py-6">
    <Icon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30 sm:h-10 sm:w-10" />
    <p className="text-muted-foreground text-xs sm:text-sm">{message}</p>
  </div>
);

const CardHeader = ({ title }: CardHeaderProps) => (
  <div className="mb-3 flex items-center gap-2 sm:mb-4">
    <div className="rounded-full bg-primary/10 p-1.5 sm:p-2">
      <Calendar className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
    </div>
    <h2 className="font-semibold text-base sm:text-lg">{title}</h2>
  </div>
);

const Card = ({ children }: CardProps) => (
  <div className="rounded-lg border bg-card p-3 sm:p-4">{children}</div>
);

const TabButton = ({ value, label }: { value: string; label: string }) => (
  <TabsTrigger
    className="flex items-center justify-center gap-1 rounded-lg border bg-card px-2 py-1.5 data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary sm:gap-2 sm:px-6 sm:py-3"
    value={value}
  >
    <Calendar className="xs:block hidden h-3.5 w-3.5 sm:h-4 sm:w-4" />
    <span className="text-xs sm:text-base">{label}</span>
  </TabsTrigger>
);

export default function SecretariatDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-3 xs:px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="space-y-4 sm:space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-xl sm:text-2xl">Γραμματεία</h1>
          </div>

          <Tabs className="space-y-3 sm:space-y-4" defaultValue="appointments">
            <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent p-0 sm:gap-4">
              <TabButton label="Παιδικά Πάρτυ" value="appointments" />
              <TabButton label="Γήπεδα 5x5" value="football" />
            </TabsList>

            <TabsContent className="space-y-4 sm:space-y-6" value="appointments">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader title="Νέο Παιδικό Πάρτυ" />
                  <AppointmentForm />
                </Card>
                <Card>
                  <CardHeader title="Προσεχή Παιδικά Πάρτυ" />
                  <AppointmentsList
                    emptyState={
                      <EmptyState icon={Calendar} message={APPOINTMENT_MESSAGES.NO_UPCOMING} />
                    }
                    showUpcomingOnly
                  />
                </Card>
              </div>
              <Card>
                <CardHeader title="Όλα τα Παιδικά Πάρτυ" />
                <AppointmentsList
                  emptyState={
                    <EmptyState icon={Calendar} message={APPOINTMENT_MESSAGES.NO_APPOINTMENTS} />
                  }
                />
              </Card>
            </TabsContent>

            <TabsContent className="space-y-4 sm:space-y-6" value="football">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader title="Κράτηση Γηπέδου 5x5" />
                  <FootballFieldBookingForm />
                </Card>
                <Card>
                  <CardHeader title="Προσεχείς Κρατήσεις" />
                  <FootballFieldBookingsList
                    emptyState={
                      <EmptyState icon={Calendar} message={FOOTBALL_BOOKING_MESSAGES.NO_UPCOMING} />
                    }
                    showUpcomingOnly
                  />
                </Card>
              </div>
              <Card>
                <CardHeader title="Όλες οι Κρατήσεις" />
                <FootballFieldBookingsList
                  emptyState={
                    <EmptyState icon={Calendar} message={FOOTBALL_BOOKING_MESSAGES.NO_BOOKINGS} />
                  }
                />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
