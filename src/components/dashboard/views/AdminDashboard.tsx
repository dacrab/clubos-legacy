"use client";

import { History, Calendar, Plus, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { deleteSale } from "@/app/actions/deleteSale";

import { UNLIMITED_STOCK, LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { Product, SaleWithDetails } from "@/types/sales";
import type { Database } from "@/types/supabase";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

import LowStockCard from "@/components/dashboard/overview/LowStockCard";
import AppointmentsList from "@/components/dashboard/appointments/AppointmentsList";
import FootballFieldBookingsList from "@/components/dashboard/bookings/FootballFieldBookingsList";
import AppointmentForm from "@/components/dashboard/appointments/AppointmentForm";
import FootballFieldBookingForm from "@/components/dashboard/bookings/FootballFieldBookingForm";
import AddSaleButton from "@/components/dashboard/sales/AddSaleButton";
import RecentSales from "@/components/dashboard/sales/RecentSales";

// Types
interface AdminDashboardProps {
  recentSales: SaleWithDetails[];
  lowStock: Product[];
}

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
}

interface ListSectionProps extends SectionHeaderProps {
  children: React.ReactNode;
}

// Constants
const TAB_CONFIG = [
  { value: "dashboard", icon: History, label: "Πωλήσεις & Απόθεμα" },
  { value: "appointments", icon: Calendar, label: "Παιδικά Πάρτυ" },
  { value: "football", icon: Calendar, label: "Γήπεδα 5χ5" }
];

const tabTriggerClasses = "flex items-center justify-center gap-1 sm:gap-2 rounded-lg border bg-card px-2 sm:px-6 py-2 sm:py-3 data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary";

// Component
export default function AdminDashboard({ recentSales = [], lowStock = [] }: AdminDashboardProps) {
  // Hooks
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);
  const [isPending, startTransition] = useTransition();
  
  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  // Handlers
  const handleDeleteSale = (id: string) => {
    setSelectedSaleId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSaleId) return;
    
    startTransition(async () => {
      const { success, message } = await deleteSale(selectedSaleId);
      if (success) {
        toast.success("Η πώληση διαγράφηκε με επιτυχία");
      } else {
        toast.error(message || "Σφάλμα κατά τη διαγραφή της πώλησης");
      }
      setDeleteDialogOpen(false);
    });
  };

  const handleFormClose = () => setFormDialogOpen(false);

  // UI Components
  const SectionHeader = ({ icon: Icon, title }: SectionHeaderProps) => (
    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
      </div>
      <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
    </div>
  );

  const ListSection = ({ icon, title, children }: ListSectionProps) => (
    <div className="rounded-xl border bg-card p-4 sm:p-6">
      <SectionHeader icon={icon} title={title} />
      {children}
    </div>
  );

  const LowStockSection = () => (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-full bg-destructive/10 p-2 sm:p-3">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Χαμηλό Απόθεμα</h2>
              <p className="text-sm text-muted-foreground">Όριο: {LOW_STOCK_THRESHOLD} τεμάχια</p>
            </div>
          </div>
          <Link href="/dashboard/products" className="text-sm text-primary hover:text-primary/80 transition-colors">
            Διαχείριση →
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[400px] sm:max-h-[500px] p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {lowStock.length > 0 ? (
            lowStock.map(product => <LowStockCard key={product.id} product={product} />)
          ) : (
            <div className="text-center py-6 sm:py-10">
              <AlertTriangle className="h-10 w-10 sm:h-14 sm:w-14 text-muted-foreground/30 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm text-muted-foreground">Δεν υπάρχουν προϊόντα με χαμηλό απόθεμα</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderActionButton = () => {
    const actionButtonClass = "flex items-center justify-center gap-2 w-full";

    if (activeTab === "dashboard") {
      return <AddSaleButton className={actionButtonClass} />;
    }

    if (activeTab === "appointments" || activeTab === "football") {
      return (
        <Button onClick={() => setFormDialogOpen(true)} className={actionButtonClass}>
          <Plus className="h-5 w-5" />
          <span className="text-xs sm:text-sm">
            {activeTab === "appointments" ? "Νέο Παιδικό Πάρτυ" : "Νέα Κράτηση Γηπέδου"}
          </span>
        </Button>
      );
    }

    return null;
  };

  // Main Render
  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-0 mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold">Πίνακας Ελέγχου</h1>
          <div className="flex gap-2 w-full xs:w-auto">{renderActionButton()}</div>
        </div>

        <Tabs defaultValue="dashboard" className="flex flex-col flex-1" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 gap-2 sm:gap-4 bg-transparent p-0">
            {TAB_CONFIG.map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value} className={tabTriggerClasses}>
                <Icon className="hidden sm:block h-5 w-5" />
                <span className="text-xs leading-tight whitespace-normal text-center sm:whitespace-nowrap">
                  {label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4 sm:mt-6 flex flex-col flex-1">
            <TabsContent value="dashboard" className="space-y-4 sm:space-y-8 flex-1">
              <div className="grid gap-4 sm:gap-8 lg:grid-cols-2 h-full">
                <RecentSales initialSales={recentSales} onDeleteClick={handleDeleteSale} />
                <LowStockSection />
              </div>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-6 sm:space-y-10 flex-1">
              <ListSection icon={Calendar} title="Προσεχή Παιδικά Πάρτυ">
                <AppointmentsList showUpcomingOnly={true} />
              </ListSection>
              <ListSection icon={Calendar} title="Όλα τα Παιδικά Πάρτυ">
                <AppointmentsList showUpcomingOnly={false} />
              </ListSection>
            </TabsContent>

            <TabsContent value="football" className="space-y-6 sm:space-y-10 flex-1">
              <ListSection icon={Calendar} title="Προσεχείς Κατήσεις">
                <FootballFieldBookingsList showUpcomingOnly={true} />
              </ListSection>
              <ListSection icon={Calendar} title="Όλες οι Κρατήσεις">
                <FootballFieldBookingsList showUpcomingOnly={false} />
              </ListSection>
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
        <DialogContent className="max-w-2xl w-[95vw] sm:w-auto">
          <DialogTitle>
            {activeTab === "appointments" ? "Νέο Παιδικό Πάρτυ" : "Νέα Κράτηση Γηπέδου"}
          </DialogTitle>
          {activeTab === "appointments" && <AppointmentForm onSuccess={handleFormClose} />}
          {activeTab === "football" && <FootballFieldBookingForm onSuccess={handleFormClose} />}
        </DialogContent>
      </Dialog>
    </>
  );
}