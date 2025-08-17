'use client';

import { Calendar } from 'lucide-react';
import React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APPOINTMENT_MESSAGES, FOOTBALL_BOOKING_MESSAGES } from '@/lib/constants';

import AppointmentForm from '../appointments/AppointmentForm';
import AppointmentsList from '../appointments/AppointmentsList';
import FootballFieldBookingForm from '../bookings/FootballFieldBookingForm';
import FootballFieldBookingsList from '../bookings/FootballFieldBookingsList';

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-6">
    <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border bg-card p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="rounded-full bg-primary/10 p-3">
        <Calendar className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    {children}
  </div>
);

const ListTabs = ({ children }: { children: React.ReactNode }) => (
                  <Tabs defaultValue="upcoming" className="w-full">
                    <div className="flex justify-between items-center mb-4">
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
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-8">Γραμματεία</h1>
      
      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="appointments">Παιδικά Πάρτυ</TabsTrigger>
          <TabsTrigger value="football">Γήπεδα 5x5</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Section title="Νέο Παιδικό Πάρτυ">
              <AppointmentForm />
            </Section>
            
            <div className="lg:col-span-2">
              <ListTabs>
                <TabsContent value="upcoming">
                  <div className="rounded-xl border bg-card">
                    <AppointmentsList 
                      showUpcomingOnly 
                      emptyState={<EmptyState message={APPOINTMENT_MESSAGES.NO_UPCOMING} />} 
                    />
                  </div>
                </TabsContent>
                <TabsContent value="all">
                  <div className="rounded-xl border bg-card">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Section title="Κράτηση Γηπέδου 5x5">
              <FootballFieldBookingForm />
            </Section>
            
            <div className="lg:col-span-2">
              <ListTabs>
                <TabsContent value="upcoming">
                  <div className="rounded-xl border bg-card">
                    <FootballFieldBookingsList 
                      showUpcomingOnly 
                      emptyState={<EmptyState message={FOOTBALL_BOOKING_MESSAGES.NO_UPCOMING} />} 
                    />
                  </div>
                </TabsContent>
                <TabsContent value="all">
                  <div className="rounded-xl border bg-card">
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
