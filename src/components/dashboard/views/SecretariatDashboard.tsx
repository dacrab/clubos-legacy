'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

import { APPOINTMENT_MESSAGES, FOOTBALL_BOOKING_MESSAGES } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import AppointmentForm from '../appointments/AppointmentForm';
import AppointmentsList from '../appointments/AppointmentsList';
import FootballFieldBookingForm from '../bookings/FootballFieldBookingForm';
import FootballFieldBookingsList from '../bookings/FootballFieldBookingsList';

const EmptyState = ({ message }: { message: string }) => (
  <div className="py-6 text-center">
    <Calendar className="text-muted-foreground/30 mx-auto mb-2 h-10 w-10" />
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-xl border p-6">
    <div className="mb-6 flex items-center gap-3">
      <div className="bg-primary/10 rounded-full p-3">
        <Calendar className="text-primary h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    {children}
  </div>
);

const ListTabs = ({ children }: { children: React.ReactNode }) => (
  <Tabs defaultValue="upcoming" className="w-full">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold">Λίστα</h2>
      <TabsList>
        <TabsTrigger value="upcoming">Προσεχή</TabsTrigger>
        <TabsTrigger value="all">Όλα</TabsTrigger>
      </TabsList>
    </div>
    {children}
  </Tabs>
);

export default function SecretariatDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-8 text-2xl font-bold">Γραμματεία</h1>

      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="appointments">Παιδικά Πάρτυ</TabsTrigger>
          <TabsTrigger value="football">Γήπεδα 5x5</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Section title="Νέο Παιδικό Πάρτυ">
              <AppointmentForm />
            </Section>

            <div className="lg:col-span-2">
              <ListTabs>
                <TabsContent value="upcoming">
                  <div className="bg-card rounded-xl border">
                    <AppointmentsList
                      showUpcomingOnly
                      emptyState={<EmptyState message={APPOINTMENT_MESSAGES.NO_UPCOMING} />}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="all">
                  <div className="bg-card rounded-xl border">
                    <AppointmentsList
                      emptyState={<EmptyState message={APPOINTMENT_MESSAGES.NO_APPOINTMENTS} />}
                    />
                  </div>
                </TabsContent>
              </ListTabs>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="football">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Section title="Κράτηση Γηπέδου 5x5">
              <FootballFieldBookingForm />
            </Section>

            <div className="lg:col-span-2">
              <ListTabs>
                <TabsContent value="upcoming">
                  <div className="bg-card rounded-xl border">
                    <FootballFieldBookingsList
                      showUpcomingOnly
                      emptyState={<EmptyState message={FOOTBALL_BOOKING_MESSAGES.NO_UPCOMING} />}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="all">
                  <div className="bg-card rounded-xl border">
                    <FootballFieldBookingsList
                      emptyState={<EmptyState message={FOOTBALL_BOOKING_MESSAGES.NO_BOOKINGS} />}
                    />
                  </div>
                </TabsContent>
              </ListTabs>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
