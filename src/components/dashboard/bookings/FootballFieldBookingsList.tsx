'use client';

import { addDays, isWithinInterval, parseISO, format } from 'date-fns';
import { el } from 'date-fns/locale';
import { Pencil, Trash2, X, Check, CalendarIcon } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useFootballFieldBookings } from '@/hooks/features/bookings/useFootballFieldBookings';
import { 
  FOOTBALL_BOOKING_MESSAGES,
  FORM_LABELS, 
  BUTTON_LABELS, 
  PLACEHOLDERS,
  DIALOG_MESSAGES,
  DATE_FORMAT
} from '@/lib/constants';
import { formatDateStringWithGreekAmPm , cn } from '@/lib/utils';
import type { FootballFieldBooking } from '@/types/bookings';


interface FootballFieldBookingsListProps {
  showUpcomingOnly?: boolean;
  emptyState?: React.ReactNode;
}

export default function FootballFieldBookingsList({ showUpcomingOnly = false, emptyState }: FootballFieldBookingsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FootballFieldBooking>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { bookings = [], error, isLoading, updateBooking, deleteBooking } = useFootballFieldBookings();

  const getFilteredBookings = () => {
    if (!showUpcomingOnly) {return bookings;}

    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);

    return bookings.filter(booking => {
        const bookingDate = parseISO(booking.bookingDatetime.toISOString());
        return isWithinInterval(bookingDate, { start: now, end: threeDaysFromNow });
    });
  };

  const startEdit = (booking: FootballFieldBooking) => {
    setEditingId(booking.id);
    setEditForm(booking);
    };
    
  const cancelEdit = () => {
      setEditingId(null);
      setEditForm({});
  };
  
  const saveEdit = async () => {
    if (!editingId || !editForm) {return;}
    setLoading(true);
    const { success } = await updateBooking(editingId, editForm);
    if (success) {cancelEdit();}
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) {return;}
    
    setLoading(true);
    await deleteBooking(deleteId);
    setDeleteId(null);
    setLoading(false);
  };

  const updateForm = (field: string, value: string | number | Date | boolean | null) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateDateTime = (date?: Date, time?: string) => {
    if (!date || !time) {return;}
    
    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes);
    
    updateForm('booking_datetime', dateTime.toISOString());
  };

  if (error) {
    return <div className="text-center py-4 text-destructive">{FOOTBALL_BOOKING_MESSAGES.FETCH_ERROR}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <LoadingSpinner size="lg" className="mb-2" />
        <p>{DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}</p>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

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
                <EditForm 
                  booking={editForm}
                  onUpdate={updateForm}
                  onDateTimeUpdate={updateDateTime}
                  onSave={saveEdit}
                  onCancel={cancelEdit}
                  loading={loading}
                      />
              ) : (
                <BookingView 
                  booking={booking}
                  onEdit={() => startEdit(booking)}
                  onDelete={() => setDeleteId(booking.id)}
                            />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title={DIALOG_MESSAGES.DELETE_BOOKING_TITLE}
        description={DIALOG_MESSAGES.DELETE_BOOKING_DESCRIPTION}
        onConfirm={confirmDelete}
        loading={loading}
      />
    </>
  );
}
function BookingView({ booking, onEdit, onDelete }: {
  booking: FootballFieldBooking;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <div className="flex justify-between items-start gap-4 mb-2">
        <div className="flex-1 space-y-1">
          <h3 className="font-medium text-foreground">{booking.whoBooked}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDateStringWithGreekAmPm(booking.bookingDatetime.toISOString())}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onEdit} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={onDelete} className="h-8 w-8">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <InfoRow label={FORM_LABELS.CONTACT_DETAILS} value={booking.contactDetails || ''} />
        <InfoRow label="Γήπεδο" value={booking.fieldNumber} />
        <InfoRow label="Παίκτες" value={booking.numPlayers} />
        {booking.notes && <InfoRow label={FORM_LABELS.NOTES} value={booking.notes} />}
        <InfoRow 
          label={FORM_LABELS.CREATED_AT} 
          value={formatDateStringWithGreekAmPm(booking.createdAt.toISOString())}
        />
      </div>
    </>
  );
}

function EditForm({ booking, onUpdate, onDateTimeUpdate, onSave, onCancel, loading }: {
  booking: Partial<FootballFieldBooking>;
  onUpdate: (field: string, value: string | number | Date | boolean | null) => void;
  onDateTimeUpdate: (date?: Date, time?: string) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const bookingDate = booking.bookingDatetime ? new Date(booking.bookingDatetime) : undefined;
  const bookingTime = bookingDate ? format(bookingDate, "HH:mm") : '';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{FORM_LABELS.WHO_BOOKED}</Label>
          <Input
            value={booking.whoBooked || ''}
            onChange={(e) => onUpdate('whoBooked', e.target.value)}
            placeholder={PLACEHOLDERS.WHO_BOOKED}
          />
        </div>
        <div className="space-y-2">
          <Label>{FORM_LABELS.DATE_TIME}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 truncate",
                    !bookingDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  {bookingDate ? format(bookingDate, DATE_FORMAT.DISPLAY, { locale: el }) : "Επιλέξτε ημερομηνία"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={bookingDate}
                  onSelect={(date: Date | undefined) => onDateTimeUpdate(date, bookingTime)}
                  initialFocus
                  locale={el}
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={bookingTime}
              onChange={(e) => onDateTimeUpdate(bookingDate, e.target.value)}
              className="text-center h-10"
              step="300"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{FORM_LABELS.CONTACT_DETAILS}</Label>
        <Input
          value={booking.contactDetails || ''}
          onChange={(e) => onUpdate('contactDetails', e.target.value)}
          placeholder={PLACEHOLDERS.CONTACT_DETAILS}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{FORM_LABELS.FIELD_NUMBER}</Label>
          <Select
            value={booking.fieldNumber?.toString()}
            onValueChange={(value) => onUpdate('fieldNumber', parseInt(value))}
          >
            <SelectTrigger>
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
          <Label>{FORM_LABELS.NUM_PLAYERS}</Label>
          <Input
            type="number"
            value={booking.numPlayers || ''}
            onChange={(e) => onUpdate('numPlayers', parseInt(e.target.value))}
            min="2"
            max="12"
            placeholder={PLACEHOLDERS.NUM_PLAYERS}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{FORM_LABELS.NOTES}</Label>
        <Textarea
          value={booking.notes || ''}
          onChange={(e) => onUpdate('notes', e.target.value)}
          rows={3}
          placeholder={PLACEHOLDERS.NOTES}
          className="resize-none min-h-[80px]"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="destructive" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          {BUTTON_LABELS.CANCEL}
        </Button>
        <LoadingButton onClick={onSave} loading={loading} loadingText={DIALOG_MESSAGES.SAVE_LOADING}>
          <Check className="mr-2 h-4 w-4" />
          {BUTTON_LABELS.SAVE}
        </LoadingButton>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{label}:</span> {value}
    </p>
  );
}
