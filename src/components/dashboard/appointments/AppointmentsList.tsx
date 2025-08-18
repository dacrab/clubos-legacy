'use client';

import React, { useMemo, useState } from 'react';
import { addDays, format, isWithinInterval, parseISO } from 'date-fns';
import { el } from 'date-fns/locale';
import { CalendarIcon, Check, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import type { Appointment } from '@/types/appointments';
import {
  APPOINTMENT_MESSAGES,
  BUTTON_LABELS,
  DATE_FORMAT,
  DIALOG_MESSAGES,
  FORM_LABELS,
  PLACEHOLDERS,
} from '@/lib/constants';
import { cn, formatDateWithGreekAmPm } from '@/lib/utils';
import { useAppointments } from '@/hooks/features/appointments/useAppointments';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

interface AppointmentsListProps {
  showUpcomingOnly?: boolean;
  emptyState?: React.ReactNode;
}

interface EditFormData {
  id?: string;
  who_booked?: string;
  contact_details?: string;
  num_children?: number;
  num_adults?: number;
  notes?: string | null;
  date?: Date;
  time?: string;
}

const AppointmentInfoField = ({ label, value }: { label: string; value: string }) => (
  <div className="text-muted-foreground text-sm">
    <span className="text-foreground font-medium">{label}:</span> {value}
  </div>
);

export default function AppointmentsList({
  showUpcomingOnly = false,
  emptyState,
}: AppointmentsListProps) {
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditFormData>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    appointments = [],
    error,
    isLoading,
    updateAppointment,
    deleteAppointment,
  } = useAppointments();

  const displayedAppointments = useMemo(() => {
    if (!appointments?.length) {
      return [];
    }

    if (!showUpcomingOnly) {
      return appointments;
    }

    const currentDate = new Date();
    const futureDate = addDays(currentDate, 3);

    return appointments.filter(appointment => {
      try {
        const appointmentDateTime = parseISO(appointment.dateTime.toISOString());
        return isWithinInterval(appointmentDateTime, { start: currentDate, end: futureDate });
      } catch {
        return false;
      }
    });
  }, [appointments, showUpcomingOnly]);

  const startEditing = (appointment: Appointment) => {
    setEditingAppointmentId(appointment.id);
    const appointmentDateTime = new Date(appointment.dateTime);
    setFormData({
      ...appointment,
      date: appointmentDateTime,
      time: format(appointmentDateTime, 'HH:mm'),
    });
  };

  const saveChanges = async () => {
    if (
      !editingAppointmentId ||
      !formData.date ||
      !formData.time ||
      !formData.who_booked ||
      !formData.contact_details
    ) {
      toast.error(APPOINTMENT_MESSAGES.REQUIRED_FIELDS);
      return;
    }

    setIsProcessing(true);

    const { date, time, ...appointmentData } = formData;
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(hours, minutes);

    const updatedAppointment = {
      ...appointmentData,
      dateTime: combinedDateTime,
      notes: appointmentData.notes || undefined, // Convert null to undefined
    } as Partial<Appointment>;

    const result = await updateAppointment(editingAppointmentId, updatedAppointment);
    if (result.success) {
      setEditingAppointmentId(null);
      setFormData({});
    }
    setIsProcessing(false);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) {
      return;
    }
    setIsProcessing(true);
    await deleteAppointment(appointmentToDelete);
    setIsProcessing(false);
    setShowDeleteDialog(false);
  };

  const cancelEditing = () => {
    setEditingAppointmentId(null);
    setFormData({});
  };

  const initiateDelete = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setShowDeleteDialog(true);
  };

  if (error) {
    return (
      <div className="text-destructive py-4 text-center">{APPOINTMENT_MESSAGES.FETCH_ERROR}</div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
        <LoadingSpinner size="lg" className="mb-2" />
        <p>{DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}</p>
      </div>
    );
  }

  if (displayedAppointments.length === 0) {
    return (
      emptyState || (
        <div className="text-muted-foreground py-4 text-center">
          {showUpcomingOnly
            ? APPOINTMENT_MESSAGES.NO_UPCOMING
            : APPOINTMENT_MESSAGES.NO_APPOINTMENTS}
        </div>
      )
    );
  }

  const EditingForm = ({ appointment }: { appointment: Appointment }) => (
    <div className="space-y-4" key={appointment.id}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="who_booked">{FORM_LABELS.WHO_BOOKED}</Label>
          <Input
            id="who_booked"
            value={formData.who_booked || ''}
            onChange={e => setFormData(prev => ({ ...prev, who_booked: e.target.value }))}
            placeholder={PLACEHOLDERS.WHO_BOOKED}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_time">{FORM_LABELS.DATE_TIME}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'h-10 w-full justify-start truncate text-left font-normal',
                    !formData.date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  {formData.date ? (
                    format(formData.date, DATE_FORMAT.DISPLAY, { locale: el })
                  ) : (
                    <span>Επιλέξτε ημερομηνία</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(day: Date | undefined) =>
                    setFormData(prev => ({ ...prev, date: day }))
                  }
                  initialFocus
                  locale={el}
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={formData.time || ''}
              onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="h-10 text-center"
              step="300"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_details">{FORM_LABELS.CONTACT_DETAILS}</Label>
        <Input
          id="contact_details"
          value={formData.contact_details || ''}
          onChange={e => setFormData(prev => ({ ...prev, contact_details: e.target.value }))}
          placeholder={PLACEHOLDERS.CONTACT_DETAILS}
          className="h-10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="num_children">{FORM_LABELS.NUM_CHILDREN}</Label>
          <Input
            id="num_children"
            type="number"
            value={formData.num_children || ''}
            onChange={e =>
              setFormData(prev => ({ ...prev, num_children: parseInt(e.target.value) }))
            }
            min="1"
            placeholder={PLACEHOLDERS.NUM_CHILDREN}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="num_adults">{FORM_LABELS.NUM_ADULTS}</Label>
          <Input
            id="num_adults"
            type="number"
            value={formData.num_adults || ''}
            onChange={e => setFormData(prev => ({ ...prev, num_adults: parseInt(e.target.value) }))}
            min="0"
            placeholder={PLACEHOLDERS.NUM_ADULTS}
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{FORM_LABELS.NOTES}</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          placeholder={PLACEHOLDERS.NOTES}
          className="min-h-[80px] resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="destructive" onClick={cancelEditing} className="flex items-center">
          <X className="mr-2 h-4 w-4 shrink-0" />
          {BUTTON_LABELS.CANCEL}
        </Button>
        <LoadingButton
          onClick={saveChanges}
          className="flex items-center"
          loading={isProcessing}
          loadingText={DIALOG_MESSAGES.SAVE_LOADING}
        >
          <Check className="mr-2 h-4 w-4 shrink-0" />
          <span>{BUTTON_LABELS.SAVE}</span>
        </LoadingButton>
      </div>
    </div>
  );

  const AppointmentDisplay = ({ appointment }: { appointment: Appointment }) => (
    <>
      <div className="mb-2 flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h3 className="text-foreground font-medium">{appointment.whoBooked}</h3>
          <p className="text-muted-foreground text-sm">
            {formatDateWithGreekAmPm(new Date(appointment.dateTime))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => startEditing(appointment)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => initiateDelete(appointment.id)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <AppointmentInfoField
          label={FORM_LABELS.CONTACT_DETAILS}
          value={appointment.contactDetails || ''}
        />
        <AppointmentInfoField label="Συμμετέχοντες" value="Participants info not available" />
        {appointment.notes && (
          <AppointmentInfoField label={FORM_LABELS.NOTES} value={appointment.notes} />
        )}
        <AppointmentInfoField
          label={FORM_LABELS.CREATED_AT}
          value={
            appointment.createdAt ? formatDateWithGreekAmPm(new Date(appointment.createdAt)) : ''
          }
        />
      </div>
    </>
  );

  return (
    <>
      <div className="space-y-4">
        {displayedAppointments.map(appointment => (
          <Card key={appointment.id}>
            <CardContent className="p-4">
              {editingAppointmentId === appointment.id ? (
                <EditingForm appointment={appointment} />
              ) : (
                <AppointmentDisplay appointment={appointment} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={DIALOG_MESSAGES.DELETE_BOOKING_TITLE}
        description={DIALOG_MESSAGES.DELETE_BOOKING_DESCRIPTION}
        onConfirm={confirmDelete}
        loading={isProcessing}
      />
    </>
  );
}
