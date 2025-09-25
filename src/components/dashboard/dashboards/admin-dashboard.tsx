'use client';

import { AlertTriangle, Calendar, History, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { AppointmentForm } from '@/components/dashboard/appointments/appointment-form';
import { AppointmentsList } from '@/components/dashboard/appointments/appointments-list';
// UI Components
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  APPOINTMENT_MESSAGES,
  FOOTBALL_BOOKING_MESSAGES,
  LOW_STOCK_THRESHOLD,
} from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase/client';
import type { SaleLike } from '@/lib/utils/chart-utils';
import type { Product as Code } from '@/types/database';
import FootballFieldBookingForm from '../football/football-field-booking-form';
import FootballFieldBookingsList from '../football/football-field-bookings-list';
import LowStockCard from '../inventory/low-stock-card';
import AddSaleButton from '../sales/add-sale-button';
import RecentSales from '../sales/recent-sales';

type AdminDashboardProps = {
  recentSales: SaleLike[];
  lowStock: Code[];
};

// Removed unused types and legacy delete dialog flow

export default function AdminDashboard({ recentSales = [], lowStock = [] }: AdminDashboardProps) {
  const supabase = createClientSupabase();

  // State
  const [_deleteDialogOpen, _setDeleteDialogOpen] = useState(false);
  const [_selectedSaleId, _setSelectedSaleId] = useState<string | null>(null);
  const [_isDeleting, _setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [_localRecentSales, setLocalRecentSales] = useState<SaleLike[]>(recentSales);
  const [localLowStock, setLocalLowStock] = useState<Code[]>(
    Array.isArray(lowStock) ? lowStock : []
  );

  // Sync props with local state
  useEffect(() => {
    setLocalRecentSales(recentSales);
    setLocalLowStock(Array.isArray(lowStock) ? lowStock : []);
  }, [recentSales, lowStock]);

  // Delete sale handler removed (no longer used)

  // Action button renderer
  const renderActionButton = useCallback(() => {
    const buttonClass = 'flex items-center justify-center gap-2 w-full';

    switch (activeTab) {
      case 'dashboard':
        return <AddSaleButton className={buttonClass} />;
      case 'appointments':
        return (
          <Button className={buttonClass} onClick={() => setFormDialogOpen(true)}>
            <Plus className="h-5 w-5" />
            <span className="text-xs sm:text-sm">Νέο Παιδικό Πάρτυ</span>
          </Button>
        );
      case 'football':
        return (
          <Button className={buttonClass} onClick={() => setFormDialogOpen(true)}>
            <Plus className="h-5 w-5" />
            <span className="text-xs sm:text-sm">Νέα Κράτηση Γηπέδου</span>
          </Button>
        );
      default:
        return null;
    }
  }, [activeTab]);

  const handleFormClose = useCallback(() => {
    setFormDialogOpen(false);
  }, []);

  const tabTriggerClass =
    'flex items-center justify-center gap-1 sm:gap-2 rounded-lg border bg-card px-2 sm:px-6 py-2 sm:py-3 data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary';

  // Centralized data fetching to prevent duplicate error messages in child lists
  const {
    data: allAppointments = [],
    error: appointmentsError,
    isLoading: isLoadingAppointments,
  } = useSWR('appointments-dashboard', async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true });
    if (error) {
      throw error;
    }
    return data ?? [];
  });

  const {
    data: allBookings = [],
    error: bookingsError,
    isLoading: isLoadingBookings,
  } = useSWR('football_bookings-dashboard', async () => {
    const { data, error } = await supabase
      .from('football_bookings')
      .select('*')
      .order('booking_datetime', { ascending: true });
    if (error) {
      throw error;
    }
    return data ?? [];
  });

  return (
    <>
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-4 flex xs:flex-row flex-col items-start xs:items-center justify-between gap-3 xs:gap-0">
          <h1 className="font-semibold text-xl sm:text-2xl">Πίνακας Ελέγχου</h1>
          <div className="flex w-full xs:w-auto gap-2">{renderActionButton()}</div>
        </div>

        {/* Tabs */}
        <Tabs className="flex flex-col" defaultValue="dashboard" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 sm:gap-4">
            <TabsTrigger className={tabTriggerClass} value="dashboard">
              <History className="hidden h-5 w-5 sm:block" />
              <span className="whitespace-normal text-center text-xs leading-tight sm:whitespace-nowrap">
                Πωλήσεις & Απόθεμα
              </span>
            </TabsTrigger>
            <TabsTrigger className={tabTriggerClass} value="appointments">
              <Calendar className="hidden h-5 w-5 sm:block" />
              <span className="whitespace-normal text-center text-xs leading-tight sm:whitespace-nowrap">
                Παιδικά Πάρτυ
              </span>
            </TabsTrigger>
            <TabsTrigger className={tabTriggerClass} value="football">
              <Calendar className="hidden h-5 w-5 sm:block" />
              <span className="whitespace-normal text-center text-xs leading-tight sm:whitespace-nowrap">
                Γήπεδα 5χ5
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-4 sm:mt-6">
            {/* Dashboard Tab */}
            <TabsContent className="space-y-4 sm:space-y-8" value="dashboard">
              <div className="grid gap-4 sm:gap-8 lg:grid-cols-2">
                <RecentSales />

                <div className="rounded-lg border bg-card">
                  <div className="border-b p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="rounded-full bg-destructive/10 p-2 sm:p-3">
                          <AlertTriangle className="h-5 w-5 text-destructive sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <h2 className="font-semibold text-lg sm:text-xl">Χαμηλό Απόθεμα</h2>
                          <p className="text-muted-foreground text-sm">
                            Όριο: {LOW_STOCK_THRESHOLD} τεμάχια
                          </p>
                        </div>
                      </div>
                      {(localLowStock?.length ?? 0) > 0 && (
                        <Link
                          className="text-primary text-sm transition-colors hover:text-primary/80"
                          href="/dashboard/products"
                        >
                          Διαχείριση →
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="max-h-[400px] flex-1 overflow-y-auto p-4 sm:max-h-[500px] sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {(localLowStock ?? []).map((code) => (
                        <LowStockCard code={code} key={code.id} />
                      ))}
                      {(localLowStock?.length ?? 0) === 0 && (
                        <div className="py-6 text-center sm:py-10">
                          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30 sm:mb-4 sm:h-14 sm:w-14" />
                          <p className="text-muted-foreground text-sm">
                            Δεν υπάρχουν προϊόντα με χαμηλό απόθεμα
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent className="space-y-6 sm:space-y-10" value="appointments">
              <div className="rounded-xl border bg-card p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
                    <Calendar className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  </div>
                  <h2 className="font-semibold text-lg sm:text-xl">Προσεχή Παιδικά Πάρτυ</h2>
                </div>
                {appointmentsError ? (
                  <div className="py-4 text-center text-destructive">
                    {APPOINTMENT_MESSAGES.FETCH_ERROR}
                  </div>
                ) : (
                  <AppointmentsList
                    appointmentsData={allAppointments}
                    appointmentsError={null}
                    isLoadingOverride={isLoadingAppointments}
                    showUpcomingOnly={true}
                  />
                )}
              </div>

              {!appointmentsError && (
                <div className="rounded-xl border bg-card p-4 sm:p-6">
                  <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                    <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
                      <Calendar className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="font-semibold text-lg sm:text-xl">Όλα τα Παιδικά Πάρτυ</h2>
                  </div>
                  <AppointmentsList
                    appointmentsData={allAppointments}
                    appointmentsError={null}
                    isLoadingOverride={isLoadingAppointments}
                    showUpcomingOnly={false}
                  />
                </div>
              )}
            </TabsContent>

            {/* Football Tab */}
            <TabsContent className="space-y-6 sm:space-y-10" value="football">
              <div className="rounded-xl border bg-card p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
                    <Calendar className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  </div>
                  <h2 className="font-semibold text-lg sm:text-xl">Προσεχείς Κρατήσεις</h2>
                </div>
                {bookingsError ? (
                  <div className="py-4 text-center text-destructive">
                    {FOOTBALL_BOOKING_MESSAGES.FETCH_ERROR}
                  </div>
                ) : (
                  <FootballFieldBookingsList
                    bookingsData={allBookings}
                    errorOverride={null}
                    isLoadingOverride={isLoadingBookings}
                    showUpcomingOnly={true}
                  />
                )}
              </div>

              {!bookingsError && (
                <div className="rounded-xl border bg-card p-4 sm:p-6">
                  <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                    <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
                      <Calendar className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="font-semibold text-lg sm:text-xl">Όλες οι Κρατήσεις</h2>
                  </div>
                  <FootballFieldBookingsList
                    bookingsData={allBookings}
                    errorOverride={null}
                    isLoadingOverride={isLoadingBookings}
                    showUpcomingOnly={false}
                  />
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Legacy delete dialog removed */}

      <Dialog onOpenChange={setFormDialogOpen} open={formDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl sm:w-auto">
          <DialogTitle>
            {activeTab === 'appointments' ? 'Νέο Παιδικό Πάρτυ' : 'Νέα Κράτηση Γηπέδου'}
          </DialogTitle>
          {activeTab === 'appointments' && <AppointmentForm onSuccess={handleFormClose} />}
          {activeTab === 'football' && <FootballFieldBookingForm onSuccess={handleFormClose} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
