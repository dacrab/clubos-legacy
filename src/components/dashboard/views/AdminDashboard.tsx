'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { AlertTriangle, Calendar, History, Plus } from 'lucide-react';
import { toast } from 'sonner';

import type { Product, SaleWithDetails } from '@/types/sales';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppointmentForm from '@/components/dashboard/appointments/AppointmentForm';
import AppointmentsList from '@/components/dashboard/appointments/AppointmentsList';
import FootballFieldBookingForm from '@/components/dashboard/bookings/FootballFieldBookingForm';
import FootballFieldBookingsList from '@/components/dashboard/bookings/FootballFieldBookingsList';
import LowStockCard from '@/components/dashboard/overview/LowStockCard';
import AddSaleButton from '@/components/dashboard/sales/AddSaleButton';
import RecentSales from '@/components/dashboard/sales/RecentSales';
import { deleteSale } from '@/app/actions/deleteSale';

interface AdminDashboardProps {
  recentSales: SaleWithDetails[];
  lowStock: Product[];
}

export default function AdminDashboard({ recentSales = [], lowStock = [] }: AdminDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  const handleDeleteSale = (id: string) => {
    setSelectedSaleId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSaleId) {
      return;
    }

    startTransition(async () => {
      const { success, error } = await deleteSale(selectedSaleId);
      if (success) {
        toast.success('Η πώληση διαγράφηκε με επιτυχία');
      } else {
        toast.error(error || 'Σφάλμα κατά τη διαγραφή της πώλησης');
      }
      setDeleteDialogOpen(false);
    });
  };

  const renderActionButton = () => {
    if (activeTab === 'dashboard') {
      return <AddSaleButton className="flex w-full items-center gap-2" />;
    }

    if (activeTab === 'appointments' || activeTab === 'football') {
      return (
        <Button onClick={() => setFormDialogOpen(true)} className="flex w-full items-center gap-2">
          <Plus className="h-5 w-5" />
          <span className="text-xs sm:text-sm">
            {activeTab === 'appointments' ? 'Νέο Παιδικό Πάρτυ' : 'Νέα Κράτηση Γηπέδου'}
          </span>
        </Button>
      );
    }

    return null;
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="xs:flex-row xs:items-center xs:gap-0 mb-4 flex flex-col items-start justify-between gap-3">
          <h1 className="text-xl font-semibold sm:text-2xl">Πίνακας Ελέγχου</h1>
          <div className="xs:w-auto flex w-full gap-2">{renderActionButton()}</div>
        </div>

        <Tabs
          defaultValue="dashboard"
          className="flex flex-1 flex-col"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 sm:gap-4">
            <TabsTrigger
              value="dashboard"
              className="bg-card data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center justify-center gap-1 rounded-lg border px-2 py-2 sm:gap-2 sm:px-6 sm:py-3"
            >
              <History className="hidden h-5 w-5 sm:block" />
              <span className="text-center text-xs leading-tight whitespace-normal sm:whitespace-nowrap">
                Πωλήσεις & Απόθεμα
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="bg-card data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center justify-center gap-1 rounded-lg border px-2 py-2 sm:gap-2 sm:px-6 sm:py-3"
            >
              <Calendar className="hidden h-5 w-5 sm:block" />
              <span className="text-center text-xs leading-tight whitespace-normal sm:whitespace-nowrap">
                Παιδικά Πάρτυ
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="football"
              className="bg-card data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center justify-center gap-1 rounded-lg border px-2 py-2 sm:gap-2 sm:px-6 sm:py-3"
            >
              <Calendar className="hidden h-5 w-5 sm:block" />
              <span className="text-center text-xs leading-tight whitespace-normal sm:whitespace-nowrap">
                Γήπεδα 5χ5
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 flex flex-1 flex-col sm:mt-6">
            <TabsContent value="dashboard" className="flex-1 space-y-4 sm:space-y-8">
              <div className="grid h-full gap-4 sm:gap-8 lg:grid-cols-2">
                <RecentSales initialSales={recentSales} onDeleteClick={handleDeleteSale} />

                <div className="bg-card rounded-lg border">
                  <div className="border-b p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="bg-destructive/10 rounded-full p-2 sm:p-3">
                          <AlertTriangle className="text-destructive h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold sm:text-xl">Χαμηλό Απόθεμα</h2>
                          <p className="text-muted-foreground text-sm">
                            Όριο: {LOW_STOCK_THRESHOLD} τεμάχια
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard/products"
                        className="text-primary hover:text-primary/80 text-sm transition-colors"
                      >
                        Διαχείριση →
                      </Link>
                    </div>
                  </div>
                  <div className="max-h-[400px] flex-1 overflow-y-auto p-4 sm:max-h-[500px] sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {lowStock.length > 0 ? (
                        lowStock.map(product => <LowStockCard key={product.id} product={product} />)
                      ) : (
                        <div className="py-6 text-center sm:py-10">
                          <AlertTriangle className="text-muted-foreground/30 mx-auto mb-3 h-10 w-10 sm:mb-4 sm:h-14 sm:w-14" />
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

            <TabsContent value="appointments" className="flex-1 space-y-6 sm:space-y-10">
              <div className="bg-card rounded-xl border p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <div className="bg-primary/10 rounded-full p-2.5 sm:p-3">
                    <Calendar className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h2 className="text-lg font-semibold sm:text-xl">Προσεχή Παιδικά Πάρτυ</h2>
                </div>
                <AppointmentsList showUpcomingOnly={true} />
              </div>
              <div className="bg-card rounded-xl border p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <div className="bg-primary/10 rounded-full p-2.5 sm:p-3">
                    <Calendar className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h2 className="text-lg font-semibold sm:text-xl">Όλα τα Παιδικά Πάρτυ</h2>
                </div>
                <AppointmentsList showUpcomingOnly={false} />
              </div>
            </TabsContent>

            <TabsContent value="football" className="flex-1 space-y-6 sm:space-y-10">
              <div className="bg-card rounded-xl border p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <div className="bg-primary/10 rounded-full p-2.5 sm:p-3">
                    <Calendar className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h2 className="text-lg font-semibold sm:text-xl">Προσεχείς Κρατήσεις</h2>
                </div>
                <FootballFieldBookingsList showUpcomingOnly={true} />
              </div>
              <div className="bg-card rounded-xl border p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <div className="bg-primary/10 rounded-full p-2.5 sm:p-3">
                    <Calendar className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h2 className="text-lg font-semibold sm:text-xl">Όλες οι Κρατήσεις</h2>
                </div>
                <FootballFieldBookingsList showUpcomingOnly={false} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Διαγραφή Πώλησης"
        description="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την πώληση; Η ενέργεια αυτή δεν μπορεί να ανατρεθεί."
        onConfirm={handleDeleteConfirm}
        loading={isPending}
      />

      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl sm:w-auto">
          <DialogTitle>
            {activeTab === 'appointments' ? 'Νέο Παιδικό Πάρτυ' : 'Νέα Κράτηση Γηπέδου'}
          </DialogTitle>
          {activeTab === 'appointments' && (
            <AppointmentForm onSuccess={() => setFormDialogOpen(false)} />
          )}
          {activeTab === 'football' && (
            <FootballFieldBookingForm onSuccess={() => setFormDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
