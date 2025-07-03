'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components
import AppointmentForm from '../appointments/AppointmentForm';
import FootballFieldBookingForm from '../bookings/FootballFieldBookingForm';
import AppointmentsList from '../appointments/AppointmentsList';
import FootballFieldBookingsList from '../bookings/FootballFieldBookingsList';

// Constants
import { APPOINTMENT_MESSAGES, FOOTBALL_BOOKING_MESSAGES } from '@/lib/constants';

// Component Types
interface EmptyStateProps {
  icon: React.ElementType;
  message: string;
}

interface ListSectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

// Reusable Components
const EmptyState = ({ icon: Icon, message }: EmptyStateProps) => (
  <div className="text-center py-4 sm:py-6">
    <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/30 mx-auto mb-2" />
    <p className="text-xs sm:text-sm text-muted-foreground">{message}</p>
  </div>
);

const ListSection = ({ icon: Icon, title, children }: ListSectionProps) => (
  <div className="rounded-xl border bg-card p-4 sm:p-6">
    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
      </div>
      <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
    </div>
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

export default function SecretariatDashboard({ user }: { user: User }) {
  return (
    <div className="flex flex-col h-full bg-background">
      <main className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full flex-1">
        <div className="space-y-4 sm:space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold">Γραμματεία</h1>
          </div>

          <Tabs defaultValue="appointments" className="space-y-3 sm:space-y-4">
            <TabsList className="grid w-full grid-cols-2 gap-2 sm:gap-4 bg-transparent p-0">
              <TabButton value="appointments" label="Παιδικά Πάρτυ" />
              <TabButton value="football" label="Γήπεδα 5x5" />
            </TabsList>

            <TabsContent value="appointments">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-1">
                  <ListSection icon={Calendar} title="Νέο Παιδικό Πάρτυ">
                    <AppointmentForm />
                  </ListSection>
                </div>
                <div className="lg:col-span-2">
                  <Tabs defaultValue="upcoming" className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg sm:text-xl font-semibold">Λίστα Πάρτυ</h2>
                      <TabsList>
                        <TabsTrigger value="upcoming">Προσεχή</TabsTrigger>
                        <TabsTrigger value="all">Όλα</TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="upcoming">
                      <div className="rounded-xl border bg-card">
                        <AppointmentsList showUpcomingOnly emptyState={<EmptyState icon={Calendar} message={APPOINTMENT_MESSAGES.NO_UPCOMING} />} />
                      </div>
                    </TabsContent>
                    <TabsContent value="all">
                      <div className="rounded-xl border bg-card">
                        <AppointmentsList emptyState={<EmptyState icon={Calendar} message={APPOINTMENT_MESSAGES.NO_APPOINTMENTS} />} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="football">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-1">
                  <ListSection icon={Calendar} title="Κράτηση Γηπέδου 5x5">
                    <FootballFieldBookingForm />
                  </ListSection>
                </div>
                <div className="lg:col-span-2">
                  <Tabs defaultValue="upcoming" className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg sm:text-xl font-semibold">Λίστα Κρατήσεων</h2>
                      <TabsList>
                        <TabsTrigger value="upcoming">Προσεχή</TabsTrigger>
                        <TabsTrigger value="all">Όλα</TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="upcoming">
                      <div className="rounded-xl border bg-card">
                        <FootballFieldBookingsList showUpcomingOnly emptyState={<EmptyState icon={Calendar} message={FOOTBALL_BOOKING_MESSAGES.NO_UPCOMING} />} />
                      </div>
                    </TabsContent>
                    <TabsContent value="all">
                      <div className="rounded-xl border bg-card">
                        <FootballFieldBookingsList emptyState={<EmptyState icon={Calendar} message={FOOTBALL_BOOKING_MESSAGES.NO_BOOKINGS} />} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
