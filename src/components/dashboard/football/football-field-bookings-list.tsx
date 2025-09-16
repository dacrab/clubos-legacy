'use client';

import { createBrowserClient } from '@supabase/ssr';
import { addDays, format, formatDistanceToNow, isWithinInterval, parseISO } from 'date-fns';
import { el } from 'date-fns/locale';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  BUTTON_LABELS,
  DATE_FORMAT,
  DIALOG_MESSAGES,
  FOOTBALL_BOOKING_MESSAGES,
  FORM_LABELS,
  PLACEHOLDERS,
} from '@/lib/constants';
import { env } from '@/lib/env';
import type { Database } from '@/types/supabase';

const THREE_DAYS = 3;
const MAX_FIELD = 5;
const FIELD_NUMBERS = Array.from({ length: MAX_FIELD }, (_, i) => i + 1);

type FootballFieldBookingsListProps = {
  showUpcomingOnly?: boolean;
  emptyState?: React.ReactNode;
  bookingsData?: FootballFieldBooking[];
  isLoadingOverride?: boolean;
  errorOverride?: Error | null;
};

type FootballFieldBooking = Database['public']['Tables']['football_bookings']['Row'];

const formatDateWithGreekAmPm = (dateString: string) => {
  try {
    return format(new Date(dateString), DATE_FORMAT.FULL_WITH_TIME, {
      locale: el,
    });
  } catch {
    return dateString;
  }
};

export default function FootballFieldBookingsList({
  showUpcomingOnly = false,
  emptyState,
  bookingsData,
  isLoadingOverride,
  errorOverride,
}: FootballFieldBookingsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FootballFieldBooking>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!(supabaseUrl && supabaseAnonKey)) {
    throw new Error('Missing Supabase URL or anonymous key');
  }
  const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

  const { mutate } = useSWRConfig();

  const {
    data: swrBookings = [],
    error: swrError,
    isLoading: swrIsLoading,
  } = useSWR<FootballFieldBooking[]>(
    'football_bookings',
    async () => {
      const { data, error: fetchError } = await supabase
        .from('football_bookings')
        .select('*')
        .order('booking_datetime', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }
      return data || [];
    },
    {
      revalidateOnMount: bookingsData === undefined,
      shouldRetryOnError: true,
    }
  );

  const bookings = bookingsData !== undefined ? bookingsData : swrBookings;
  const isLoading = typeof isLoadingOverride === 'boolean' ? isLoadingOverride : swrIsLoading;
  const error = errorOverride ?? swrError;

  const filteredBookings = React.useMemo(() => {
    if (!showUpcomingOnly) {
      return bookings;
    }

    const now = new Date();
    const threeDaysFromNow = addDays(now, THREE_DAYS);

    return bookings.filter((booking) => {
      try {
        const bookingDate = parseISO(booking.booking_datetime);
        return isWithinInterval(bookingDate, {
          start: now,
          end: threeDaysFromNow,
        });
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
    if (
      !(
        editingId &&
        editForm.booking_datetime &&
        editForm.customer_name &&
        editForm.contact_info &&
        editForm.field_number
      )
    ) {
      toast.error(FOOTBALL_BOOKING_MESSAGES.REQUIRED_FIELDS);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('football_bookings')
        .update(editForm)
        .eq('id', editingId);

      if (updateError) {
        throw updateError;
      }

      toast.success(FOOTBALL_BOOKING_MESSAGES.UPDATE_SUCCESS);
      setEditingId(null);
      setEditForm({});
      mutate('football_bookings');
    } catch (_error) {
      toast.error(FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBookingId) {
      return;
    }
    setIsDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from('football_bookings')
        .delete()
        .eq('id', selectedBookingId);

      if (deleteError) {
        throw deleteError;
      }

      toast.success(FOOTBALL_BOOKING_MESSAGES.DELETE_SUCCESS);
      mutate('football_bookings');
    } catch (_error) {
      toast.error(FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (error) {
    return (
      <div className="py-4 text-center text-destructive">
        {FOOTBALL_BOOKING_MESSAGES.FETCH_ERROR}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <LoadingSpinner className="mb-2" size="lg" />
        <p>{DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}</p>
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      emptyState || (
        <div className="py-4 text-center text-muted-foreground">
          {showUpcomingOnly
            ? FOOTBALL_BOOKING_MESSAGES.NO_UPCOMING
            : FOOTBALL_BOOKING_MESSAGES.NO_BOOKINGS}
        </div>
      )
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
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-sm sm:text-base" htmlFor="customer_name">
                        {FORM_LABELS.WHO_BOOKED}
                      </Label>
                      <Input
                        className="h-8 text-sm sm:h-10 sm:text-base"
                        id="customer_name"
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            customer_name: e.target.value,
                          }))
                        }
                        placeholder={PLACEHOLDERS.WHO_BOOKED}
                        value={editForm.customer_name || ''}
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-sm sm:text-base" htmlFor="booking_datetime">
                        {FORM_LABELS.DATE_TIME}
                      </Label>
                      <Input
                        className="h-8 text-sm sm:h-10 sm:text-base"
                        id="booking_datetime"
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            booking_datetime: e.target.value,
                          }))
                        }
                        type="datetime-local"
                        value={editForm.booking_datetime || ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm sm:text-base" htmlFor="contact_info">
                      {FORM_LABELS.CONTACT_DETAILS}
                    </Label>
                    <Input
                      className="h-8 text-sm sm:h-10 sm:text-base"
                      id="contact_info"
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          contact_info: e.target.value,
                        }))
                      }
                      placeholder={PLACEHOLDERS.CONTACT_DETAILS}
                      value={editForm.contact_info || ''}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-sm sm:text-base" htmlFor="field_number">
                        {FORM_LABELS.FIELD_NUMBER}
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setEditForm((prev) => ({
                            ...prev,
                            field_number: Number.parseInt(value, 10),
                          }))
                        }
                        value={
                          editForm.field_number !== undefined ? String(editForm.field_number) : ''
                        }
                      >
                        <SelectTrigger
                          className="h-8 text-sm sm:h-10 sm:text-base"
                          id="field_number"
                        >
                          <SelectValue placeholder="Επιλέξτε γήπεδο" />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_NUMBERS.map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              Γήπεδο {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-sm sm:text-base" htmlFor="num_players">
                        {FORM_LABELS.NUM_PLAYERS}
                      </Label>
                      <Input
                        className="h-8 text-sm sm:h-10 sm:text-base"
                        id="num_players"
                        max="12"
                        min="2"
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            num_players: Number.parseInt(e.target.value, 10),
                          }))
                        }
                        placeholder={PLACEHOLDERS.NUM_PLAYERS}
                        type="number"
                        value={editForm.num_players || ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm sm:text-base" htmlFor="notes">
                      {FORM_LABELS.NOTES}
                    </Label>
                    <Textarea
                      className="min-h-[80px] resize-none text-sm sm:text-base"
                      id="notes"
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder={PLACEHOLDERS.NOTES}
                      rows={3}
                      value={editForm.notes || ''}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      className="flex h-8 items-center gap-1 text-xs sm:h-9 sm:gap-2 sm:text-sm"
                      onClick={() => {
                        setEditingId(null);
                        setEditForm({});
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {BUTTON_LABELS.CANCEL}
                    </Button>
                    <LoadingButton
                      className="flex h-8 items-center gap-1 text-xs sm:h-9 sm:gap-2 sm:text-sm"
                      loading={isDeleting}
                      loadingText={DIALOG_MESSAGES.SAVE_LOADING}
                      onClick={handleSaveEdit}
                      size="sm"
                      variant="default"
                    >
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {BUTTON_LABELS.SAVE}
                    </LoadingButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
                    <div>
                      <h3 className="font-medium text-foreground text-sm sm:text-base">
                        {booking.customer_name}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        {formatDateWithGreekAmPm(booking.booking_datetime)}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground xs:text-xs">
                        {FORM_LABELS.CREATED_AT}: {formatDateWithGreekAmPm(booking.created_at)} (
                        {formatDistanceToNow(new Date(booking.created_at), {
                          addSuffix: true,
                          locale: el,
                        })}
                        )
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary text-xs sm:px-2 sm:py-1 sm:text-sm">
                        {FORM_LABELS.FIELD} {booking.field_number}, {booking.num_players}{' '}
                        {FORM_LABELS.PLAYERS}
                      </span>
                      <div className="flex gap-1.5 sm:gap-2">
                        <Button
                          className="flex h-7 items-center gap-1 px-1.5 text-xs sm:h-9 sm:gap-2 sm:px-3 sm:text-sm"
                          onClick={() => handleEdit(booking)}
                          size="sm"
                          variant="outline"
                        >
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="xs:inline hidden">{BUTTON_LABELS.EDIT}</span>
                        </Button>
                        <Button
                          className="flex h-7 items-center gap-1 px-1.5 text-xs sm:h-9 sm:gap-2 sm:px-3 sm:text-sm"
                          onClick={() => {
                            setSelectedBookingId(booking.id);
                            setDeleteDialogOpen(true);
                          }}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="xs:inline hidden">{DIALOG_MESSAGES.DELETE_BUTTON}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <p className="text-muted-foreground">{FORM_LABELS.CONTACT_DETAILS}:</p>
                    <p className="text-foreground">{booking.contact_info}</p>
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
        description={DIALOG_MESSAGES.DELETE_BOOKING_DESCRIPTION}
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        title={DIALOG_MESSAGES.DELETE_BOOKING_TITLE}
      />
    </>
  );
}
