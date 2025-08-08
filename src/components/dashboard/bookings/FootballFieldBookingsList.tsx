'use client';

import React, { useState, useMemo } from 'react';
import { addDays, isWithinInterval, parseISO, format } from 'date-fns';
import { Pencil, Trash2, X, Check, CalendarIcon } from 'lucide-react';
import { useFootballFieldBookings } from '@/hooks/features/bookings/useFootballFieldBookings';
import { formatDateStringWithGreekAmPm } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
import type { FootballFieldBooking } from '@/types/bookings';
import { cn } from '@/lib/utils';
import { el } from 'date-fns/locale';

const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
  <p className="text-sm text-muted-foreground">
    <span className="font-medium text-foreground">{label}:</span> {value}
  </p>
);

interface FootballFieldBookingsListProps {
  showUpcomingOnly?: boolean;
  emptyState?: React.ReactNode;
}

interface EditBookingFormState {
  id?: string;
  who_booked?: string;
  contact_details?: string;
  field_number?: number;
  num_players?: number;
  notes?: string | null;
  date?: Date;
  time?: string;
}

export default function FootballFieldBookingsList({ showUpcomingOnly = false, emptyState }: FootballFieldBookingsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditBookingFormState>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  
  const { bookings = [], error, isLoading, updateBooking, deleteBooking } = useFootballFieldBookings();

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
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
    const bookingDate = new Date(booking.booking_datetime);
    setEditForm({
      ...booking,
      date: bookingDate,
      time: format(bookingDate, "HH:mm"),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.date || !editForm.time) return;
    
    setIsMutating(true);

    const { date, time, ...restOfForm } = editForm;
    const [hours, minutes] = time.split(':').map(Number);
    const bookingDateTime = new Date(date);
    bookingDateTime.setHours(hours, minutes);

    const updatePayload: Partial<FootballFieldBooking> = {
        ...restOfForm,
        booking_datetime: bookingDateTime.toISOString(),
    };
    
    const { success } = await updateBooking(editingId, updatePayload);
    if(success){
      setEditingId(null);
      setEditForm({});
    }
    setIsMutating(false);
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBookingId) return;
    
    setIsMutating(true);
    await deleteBooking(selectedBookingId);
    setDeleteDialogOpen(false);
    setIsMutating(false);
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
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-4">
              {editingId === booking.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="who_booked">{FORM_LABELS.WHO_BOOKED}</Label>
                      <Input
                        id="who_booked"
                        value={editForm.who_booked || ''}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, who_booked: e.target.value }))}
                        placeholder={PLACEHOLDERS.WHO_BOOKED}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booking_datetime">{FORM_LABELS.DATE_TIME}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline-solid"}
                              className={cn(
                                "w-full justify-start text-left font-normal h-10 truncate",
                                !editForm.date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                              {editForm.date ? format(editForm.date, DATE_FORMAT.DISPLAY, { locale: el }) : <span>Επιλέξτε ημερομηνία</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={editForm.date}
                              onSelect={(day: Date | undefined) => setEditForm(prev => ({ ...prev, date: day }))}
                              initialFocus
                              locale={el}
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="time"
                          value={editForm.time || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                          className="text-center h-10"
                          step="300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_details">{FORM_LABELS.CONTACT_DETAILS}</Label>
                    <Input
                      id="contact_details"
                      value={editForm.contact_details || ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, contact_details: e.target.value }))}
                      placeholder={PLACEHOLDERS.CONTACT_DETAILS}
                      className="h-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="field_number">{FORM_LABELS.FIELD_NUMBER}</Label>
                      <Select
                        value={editForm.field_number?.toString()}
                        onValueChange={(value) => setEditForm((prev) => ({ ...prev, field_number: parseInt(value) }))}
                      >
                        <SelectTrigger id="field_number" className="h-10">
                          <SelectValue placeholder="Επιλέξτε γήπεδο" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(num => (
                            <SelectItem key={num} value={num.toString()}>Γήπεδο {num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="num_players">{FORM_LABELS.NUM_PLAYERS}</Label>
                      <Input
                        id="num_players"
                        type="number"
                        value={editForm.num_players || ''}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, num_players: parseInt(e.target.value) }))}
                        min="2"
                        max="12"
                        placeholder={PLACEHOLDERS.NUM_PLAYERS}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">{FORM_LABELS.NOTES}</Label>
                    <Textarea
                      id="notes"
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      placeholder={PLACEHOLDERS.NOTES}
                      className="resize-none min-h-[80px]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="destructive"
                      onClick={handleCancelEdit}
                      className="flex items-center"
                    >
                      <X className="mr-2 h-4 w-4 shrink-0" />
                      {BUTTON_LABELS.CANCEL}
                    </Button>
                    <LoadingButton
                      onClick={handleSaveEdit}
                      className="flex items-center"
                      loading={isMutating}
                      loadingText={DIALOG_MESSAGES.SAVE_LOADING}
                    >
                      <Check className="mr-2 h-4 w-4 shrink-0" />
                      <span>{BUTTON_LABELS.SAVE}</span>
                    </LoadingButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium text-foreground">{booking.who_booked}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDateStringWithGreekAmPm(booking.booking_datetime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(booking)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            setSelectedBookingId(booking.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <InfoRow label={FORM_LABELS.CONTACT_DETAILS} value={booking.contact_details} />
                    <InfoRow label="Γήπεδο" value={booking.field_number} />
                    <InfoRow label="Παίκτες" value={booking.num_players} />
                    {booking.notes && <InfoRow label={FORM_LABELS.NOTES} value={booking.notes} />}
                    <InfoRow 
                      label={FORM_LABELS.CREATED_AT} 
                      value={formatDateStringWithGreekAmPm(booking.created_at)}
                    />
                  </div>
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
        loading={isMutating}
      />
    </>
  );
}