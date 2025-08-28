'use client';

import React, { useState } from 'react';
import { addDays, isWithinInterval, formatDistanceToNow, parseISO, format } from 'date-fns';
import { el } from 'date-fns/locale';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FOOTBALL_BOOKING_MESSAGES,
  FORM_LABELS,
  BUTTON_LABELS, 
  PLACEHOLDERS,
  DIALOG_MESSAGES,
  DATE_FORMAT
} from '@/lib/constants';

interface FootballFieldBookingsListProps {
  showUpcomingOnly?: boolean;
  emptyState?: React.ReactNode;
}

type FootballFieldBooking = Database['public']['Tables']['football_field_bookings']['Row'];

const formatDateWithGreekAmPm = (dateString: string) => {
  try {
    return format(new Date(dateString), DATE_FORMAT.FULL_WITH_TIME, { locale: el });
  } catch (error) {
    return dateString;
  }
};

export default function FootballFieldBookingsList({ showUpcomingOnly = false, emptyState }: FootballFieldBookingsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FootballFieldBooking>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: bookings = [], error, isLoading, mutate } = useSWR<FootballFieldBooking[]>(
    'football_field_bookings',
    async () => {
      const { data, error } = await supabase
        .from('football_field_bookings')
        .select('*')
        .order('booking_datetime', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  );

  const filteredBookings = React.useMemo(() => {
    if (!showUpcomingOnly) return bookings;

    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);

    return bookings.filter(booking => {
      try {
        const bookingDate = parseISO(booking.booking_datetime);
        return isWithinInterval(bookingDate, { start: now, end: threeDaysFromNow });
      } catch {
        return false;
      }
    });
  }, [bookings, showUpcomingOnly]);

  const handleEdit = (booking: FootballFieldBooking) => {
    setEditingId(booking.id);
    setEditForm(booking);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.booking_datetime || !editForm.who_booked || 
        !editForm.contact_details || !editForm.field_number) {
      toast.error(FOOTBALL_BOOKING_MESSAGES.REQUIRED_FIELDS);
      return;
    }

    try {
      const { error } = await supabase
        .from('football_field_bookings')
        .update(editForm)
        .eq('id', editingId);

      if (error) throw error;

      toast.success(FOOTBALL_BOOKING_MESSAGES.UPDATE_SUCCESS);
      setEditingId(null);
      setEditForm({});
      mutate();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBookingId) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('football_field_bookings')
        .delete()
        .eq('id', selectedBookingId);

      if (error) throw error;

      toast.success(FOOTBALL_BOOKING_MESSAGES.DELETE_SUCCESS);
      mutate();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error(FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (error) return <div className="text-center py-4 text-destructive">{FOOTBALL_BOOKING_MESSAGES.FETCH_ERROR}</div>;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <LoadingSpinner size="lg" className="mb-2" />
        <p>{DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}</p>
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return emptyState || (
      <div className="text-center py-4 text-muted-foreground">
        {showUpcomingOnly ? FOOTBALL_BOOKING_MESSAGES.NO_UPCOMING : FOOTBALL_BOOKING_MESSAGES.NO_BOOKINGS}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-3 sm:p-4">
              {editingId === booking.id ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="who_booked" className="text-sm sm:text-base">{FORM_LABELS.WHO_BOOKED}</Label>
                      <Input
                        id="who_booked"
                        value={editForm.who_booked || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, who_booked: e.target.value }))}
                        placeholder={PLACEHOLDERS.WHO_BOOKED}
                        className="h-8 sm:h-10 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="booking_datetime" className="text-sm sm:text-base">{FORM_LABELS.DATE_TIME}</Label>
                      <Input
                        id="booking_datetime"
                        type="datetime-local"
                        value={editForm.booking_datetime || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, booking_datetime: e.target.value }))}
                        className="h-8 sm:h-10 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="contact_details" className="text-sm sm:text-base">{FORM_LABELS.CONTACT_DETAILS}</Label>
                    <Input
                      id="contact_details"
                      value={editForm.contact_details || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, contact_details: e.target.value }))}
                      placeholder={PLACEHOLDERS.CONTACT_DETAILS}
                      className="h-8 sm:h-10 text-sm sm:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="field_number" className="text-sm sm:text-base">{FORM_LABELS.FIELD_NUMBER}</Label>
                      <Select
                        value={editForm.field_number?.toString()}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, field_number: parseInt(value) }))}
                      >
                        <SelectTrigger id="field_number" className="h-8 sm:h-10 text-sm sm:text-base">
                          <SelectValue placeholder="Επιλέξτε γήπεδο" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(num => (
                            <SelectItem key={num} value={num.toString()}>Γήπεδο {num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="num_players" className="text-sm sm:text-base">{FORM_LABELS.NUM_PLAYERS}</Label>
                      <Input
                        id="num_players"
                        type="number"
                        value={editForm.num_players || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, num_players: parseInt(e.target.value) }))}
                        min="2"
                        max="12"
                        placeholder={PLACEHOLDERS.NUM_PLAYERS}
                        className="h-8 sm:h-10 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="notes" className="text-sm sm:text-base">{FORM_LABELS.NOTES}</Label>
                    <Textarea
                      id="notes"
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      placeholder={PLACEHOLDERS.NOTES}
                      className="text-sm sm:text-base resize-none min-h-[80px]"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(null);
                        setEditForm({});
                      }}
                      className="h-8 sm:h-9 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                    >
                      <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {BUTTON_LABELS.CANCEL}
                    </Button>
                    <LoadingButton
                      variant="default"
                      size="sm"
                      onClick={handleSaveEdit}
                      className="h-8 sm:h-9 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                      loading={isDeleting}
                      loadingText={DIALOG_MESSAGES.SAVE_LOADING}
                    >
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {BUTTON_LABELS.SAVE}
                    </LoadingButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2">
                    <div>
                      <h3 className="font-medium text-foreground text-sm sm:text-base">{booking.who_booked}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {formatDateWithGreekAmPm(booking.booking_datetime)}
                      </p>
                      <p className="text-[10px] xs:text-xs text-muted-foreground mt-1">
                        {FORM_LABELS.CREATED_AT}: {formatDateWithGreekAmPm(booking.created_at)}
                        {' '}({formatDistanceToNow(new Date(booking.created_at), { addSuffix: true, locale: el })})
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm font-medium bg-primary/10 text-primary px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                        {FORM_LABELS.FIELD} {booking.field_number}, {booking.num_players} {FORM_LABELS.PLAYERS}
                      </span>
                      <div className="flex gap-1.5 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(booking)}
                          className="h-7 sm:h-9 text-xs sm:text-sm px-1.5 sm:px-3 flex items-center gap-1 sm:gap-2"
                        >
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">{BUTTON_LABELS.EDIT}</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedBookingId(booking.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-7 sm:h-9 text-xs sm:text-sm px-1.5 sm:px-3 flex items-center gap-1 sm:gap-2"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">{DIALOG_MESSAGES.DELETE_BUTTON}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <p className="text-muted-foreground">{FORM_LABELS.CONTACT_DETAILS}:</p>
                    <p className="text-foreground">{booking.contact_details}</p>
                  </div>
                  {booking.notes && (
                    <div className="mt-2 text-xs sm:text-sm">
                      <p className="text-muted-foreground">{FORM_LABELS.NOTES}:</p>
                      <p className="text-foreground">{booking.notes}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={DIALOG_MESSAGES.DELETE_BOOKING_TITLE}
        description={DIALOG_MESSAGES.DELETE_BOOKING_DESCRIPTION}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </>
  );
}