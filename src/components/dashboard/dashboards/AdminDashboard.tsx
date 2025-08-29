"use client";

import { createBrowserClient } from "@supabase/ssr";
import { History, Calendar, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// Constants
// Types

// UI Components
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UNLIMITED_STOCK, LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { Code, Sale, Order } from "@/types/sales";
import type { Database } from "@/types/supabase";

// Dashboard Components
import AppointmentForm from "../appointments/AppointmentForm";
import AppointmentsList from "../appointments/AppointmentsList";
import FootballFieldBookingForm from "../football/FootballFieldBookingForm";
import FootballFieldBookingsList from "../football/FootballFieldBookingsList";
import LowStockCard from "../inventory/LowStockCard";
import AddSaleButton from "../sales/AddSaleButton";
import RecentSales from "../sales/RecentSales";

interface AdminDashboardProps {
  recentSales: Sale[];
  lowStock: Code[];
}

type SaleWithRelations = Sale & {
  code: Code;
  order: Order;
};

type CodeStock = {
  stock: number;
};

export default function AdminDashboard({
  recentSales = [],
  lowStock = [],
}: AdminDashboardProps) {
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as any;

  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [localRecentSales, setLocalRecentSales] = useState<Sale[]>(recentSales);
  const [localLowStock, setLocalLowStock] = useState<Code[]>(lowStock);

  // Sync props with local state
  useEffect(() => {
    setLocalRecentSales(recentSales);
    setLocalLowStock(lowStock);
  }, [recentSales, lowStock]);

  // Delete sale handler
  const handleDeleteSale = useCallback((id: string) => {
    setSelectedSaleId(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedSaleId) {return;}

    setIsDeleting(true);
    try {
      // Get sale with order data
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .select("*, code:codes(*), order:orders(*)")
        .eq("id", selectedSaleId)
        .single();

      if (saleError || !sale) {
        throw new Error("Sale not found");
      }

      const typedSale = sale as SaleWithRelations;

      // Get code stock info
      const { data: codeData, error: codeError } = await supabase
        .from("codes")
        .select("stock")
        .eq("id", typedSale.code_id)
        .single();

      if (codeError || !codeData) {
        throw new Error("Code not found");
      }

      const typedCode = codeData as CodeStock;

      // Delete the sale
      const { error: deleteError } = await supabase
        .from("sales")
        .delete()
        .eq("id", selectedSaleId);

      if (deleteError) {
        throw deleteError;
      }

      // Restore stock if not unlimited
      if (typedCode.stock !== UNLIMITED_STOCK) {
        const { error: stockError } = await supabase
          .from("codes")
          .update({ stock: typedCode.stock + typedSale.quantity })
          .eq("id", typedSale.code_id);

        if (stockError) {
          throw stockError;
        }
      }

      // Check if order has other sales
      const { data: remainingSales, error: remainingError } = await supabase
        .from("sales")
        .select("id")
        .eq("order_id", typedSale.order_id);

      // Delete order if no remaining sales
      if (!remainingError && (!remainingSales || remainingSales.length === 0)) {
        const { error: orderError } = await supabase
          .from("orders")
          .delete()
          .eq("id", typedSale.order_id);

        if (orderError) {
          throw orderError;
        }
      }

      // Update local state
      setLocalRecentSales((prev) => prev.filter((s) => s.id !== selectedSaleId));
      toast.success("Η πώληση διαγράφηκε με επιτυχία");
      router.refresh();
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Σφάλμα κατά τη διαγραφή της πώλησης");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }, [router, selectedSaleId, supabase]);

  // Action button renderer
  const renderActionButton = useCallback(() => {
    const buttonClass = "flex items-center justify-center gap-2 w-full";
    
    switch (activeTab) {
      case "dashboard":
        return <AddSaleButton className={buttonClass} />;
      case "appointments":
        return (
          <Button onClick={() => setFormDialogOpen(true)} className={buttonClass}>
            <Plus className="h-5 w-5" />
            <span className="text-xs sm:text-sm">Νέο Παιδικό Πάρτυ</span>
          </Button>
        );
      case "football":
        return (
          <Button onClick={() => setFormDialogOpen(true)} className={buttonClass}>
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

  const tabTriggerClass = "flex items-center justify-center gap-1 sm:gap-2 rounded-lg border bg-card px-2 sm:px-6 py-2 sm:py-3 data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary";

  return (
    <>
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-0 mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold">Πίνακας Ελέγχου</h1>
          <div className="flex gap-2 w-full xs:w-auto">
            {renderActionButton()}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="flex flex-col" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 gap-2 sm:gap-4 bg-transparent p-0">
            <TabsTrigger value="dashboard" className={tabTriggerClass}>
              <History className="hidden sm:block h-5 w-5" />
              <span className="text-xs leading-tight whitespace-normal text-center sm:whitespace-nowrap">
                Πωλήσεις & Απόθεμα
              </span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className={tabTriggerClass}>
              <Calendar className="hidden sm:block h-5 w-5" />
              <span className="text-xs leading-tight whitespace-normal text-center sm:whitespace-nowrap">
                Παιδικά Πάρτυ
              </span>
            </TabsTrigger>
            <TabsTrigger value="football" className={tabTriggerClass}>
              <Calendar className="hidden sm:block h-5 w-5" />
              <span className="text-xs leading-tight whitespace-normal text-center sm:whitespace-nowrap">
                Γήπεδα 5χ5
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-4 sm:mt-6">
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4 sm:space-y-8">
              <div className="grid gap-4 sm:gap-8 lg:grid-cols-2">
                <RecentSales
                  initialSales={localRecentSales}
                  onDeleteClick={handleDeleteSale}
                />

                <div className="rounded-lg border bg-card">
                  <div className="border-b p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="rounded-full bg-destructive/10 p-2 sm:p-3">
                          <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold">Χαμηλό Απόθεμα</h2>
                          <p className="text-sm text-muted-foreground">
                            Όριο: {LOW_STOCK_THRESHOLD} τεμάχια
                          </p>
                        </div>
                      </div>
                      {localLowStock.length > 0 && (
                        <Link
                          href="/dashboard/codes"
                          className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          Διαχείριση →
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[400px] sm:max-h-[500px] p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {localLowStock.map((code) => (
                        <LowStockCard key={code.id} code={code} />
                      ))}
                      {localLowStock.length === 0 && (
                        <div className="text-center py-6 sm:py-10">
                          <AlertTriangle className="h-10 w-10 sm:h-14 sm:w-14 text-muted-foreground/30 mx-auto mb-3 sm:mb-4" />
                          <p className="text-sm text-muted-foreground">
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
            <TabsContent value="appointments" className="space-y-6 sm:space-y-10">
              <div className="rounded-xl border bg-card p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold">Προσεχή Παιδικά Πάρτυ</h2>
                </div>
                <AppointmentsList showUpcomingOnly={true} />
              </div>

              <div className="rounded-xl border bg-card p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold">Όλα τα Παιδικά Πάρτυ</h2>
                </div>
                <AppointmentsList showUpcomingOnly={false} />
              </div>
            </TabsContent>

            {/* Football Tab */}
            <TabsContent value="football" className="space-y-6 sm:space-y-10">
              <div className="rounded-xl border bg-card p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold">Προσεχείς Κρατήσεις</h2>
                </div>
                <FootballFieldBookingsList showUpcomingOnly={true} />
              </div>

              <div className="rounded-xl border bg-card p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold">Όλες οι Κρατήσεις</h2>
                </div>
                <FootballFieldBookingsList showUpcomingOnly={false} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Διαγραφή Πώλησης"
        description="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την πώληση; Η ενέργεια αυτή δεν μπορεί να ανατρεθεί."
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />

      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-auto">
          <DialogTitle>
            {activeTab === "appointments" ? "Νέο Παιδικό Πάρτυ" : "Νέα Κράτηση Γηπέδου"}
          </DialogTitle>
          {activeTab === "appointments" ? (
            <AppointmentForm onSuccess={handleFormClose} />
          ) : activeTab === "football" ? (
            <FootballFieldBookingForm onSuccess={handleFormClose} />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}