'use client';

import { Calendar } from 'lucide-react';
import React from 'react';

import AppointmentForm from "@/components/dashboard/appointments/AppointmentForm";
import AppointmentsList from "@/components/dashboard/appointments/AppointmentsList";
import FootballFieldBookingForm from "@/components/dashboard/football/FootballFieldBookingForm";
import FootballFieldBookingsList from "@/components/dashboard/football/FootballFieldBookingsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APPOINTMENT_MESSAGES, FOOTBALL_BOOKING_MESSAGES } from '@/lib/constants';

import type { User } from '@supabase/supabase-js';

interface EmptyStateProps {
  icon: React.ElementType;
  message: string;
}

interface CardHeaderProps {
  title: string;
}

interface CardProps {
  children: React.ReactNode;
}

// Reusable Components
const EmptyState = ({ icon: Icon, message }: EmptyStateProps) => (
  <div className="text-center py-4 sm:py-6">
    <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/30 mx-auto mb-2" />
    <p className="text-xs sm:text-sm text-muted-foreground">{message}</p>
  </div>
);

const CardHeader = ({ title }: CardHeaderProps) => (
  <div className="flex items-center gap-2 mb-3 sm:mb-4">
    <div className="rounded-full bg-primary/10 p-1.5 sm:p-2">
      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
    </div>
    <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
  </div>
);

const Card = ({ children }: CardProps) => (
  <div className="rounded-lg border bg-card p-3 sm:p-4">
    {children}
  </div>
);

const TabButton = ({ value, label }: { value: string; label: string }) => (
  <TabsTrigger 
    value={value}
    className="flex items-center justify-center gap-1 sm:gap-2 rounded-lg border bg-card px-2 sm:px-6 py-1.5 sm:py-3 data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
  >
    <Calendar className="hidden xs:block h-3.5 w-3.5 sm:h-4 sm:w-4" />
    <span className="text-xs sm:text-base">{label}</span>
  </TabsTrigger>
);

export default function SecretariatDashboard({ user: _user }: { user: User }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold">Γραμματεία</h1>
          </div>

          <Tabs defaultValue="appointments" className="space-y-3 sm:space-y-4">
            <TabsList className="grid w-full grid-cols-2 gap-2 sm:gap-4 bg-transparent p-0">
              <TabButton value="appointments" label="Παιδικά Πάρτυ" />
              <TabButton value="football" label="Γήπεδα 5x5" />
            </TabsList>

            <TabsContent value="appointments" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader title="Νέο Παιδικό Πάρτυ" />
                  <AppointmentForm />
                </Card>
                <Card>
                  <CardHeader title="Προσεχή Παιδικά Πάρτυ" />
                  <AppointmentsList showUpcomingOnly emptyState={<EmptyState icon={Calendar} message={APPOINTMENT_MESSAGES.NO_UPCOMING} />} />
                </Card>
              </div>
              <Card>
                <CardHeader title="Όλα τα Παιδικά Πάρτυ" />
                <AppointmentsList emptyState={<EmptyState icon={Calendar} message={APPOINTMENT_MESSAGES.NO_APPOINTMENTS} />} />
              </Card>
            </TabsContent>

            <TabsContent value="football" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader title="Κράτηση Γηπέδου 5x5" />
                  <FootballFieldBookingForm />
                </Card>
                <Card>
                  <CardHeader title="Προσεχείς Κρατήσεις" />
                  <FootballFieldBookingsList showUpcomingOnly emptyState={<EmptyState icon={Calendar} message={FOOTBALL_BOOKING_MESSAGES.NO_UPCOMING} />} />
                </Card>
              </div>
              <Card>
                <CardHeader title="Όλες οι Κρατήσεις" />
                <FootballFieldBookingsList emptyState={<EmptyState icon={Calendar} message={FOOTBALL_BOOKING_MESSAGES.NO_BOOKINGS} />} />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
