'use client';

import React, { useState, useMemo } from 'react';
import { addDays, isWithinInterval, parseISO, format } from 'date-fns';
import { Pencil, Trash2, X, Check, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAppointments } from '@/hooks/features/appointments/useAppointments';
import { formatDateWithGreekAmPm } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { 
  APPOINTMENT_MESSAGES,
  FORM_LABELS,
  BUTTON_LABELS, 
  PLACEHOLDERS,
  DIALOG_MESSAGES,
  DATE_FORMAT,
} from '@/lib/constants';
import type { Appointment } from '@/types/appointments';
import { cn } from '@/lib/utils';
import { el } from 'date-fns/locale';

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <p className="text-sm text-muted-foreground">
    <span className="font-medium text-foreground">{label}:</span> {value}
  </p>
);

interface AppointmentsListProps {
  showUpcomingOnly?: boolean;
  emptyState?: React.ReactNode;
}

interface EditAppointmentFormState {
  id?: string;
  who_booked?: string;
  contact_details?: string;
  num_children?: number;
  num_adults?: number;
  notes?: string | null;
  date?: Date;
  time?: string;
}

export default function AppointmentsList({ showUpcomingOnly = false, emptyState }: AppointmentsListProps) {
  // State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditAppointmentFormState>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  
  // Data fetching and mutations from hook
  const { appointments = [], error, isLoading, updateAppointment, deleteAppointment } = useAppointments();

  // Filter appointments based on props
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    if (!showUpcomingOnly) return appointments;

    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);

    return appointments.filter(appointment => {
      try {
        const appointmentDate = parseISO(appointment.date_time);
        return isWithinInterval(appointmentDate, { start: now, end: threeDaysFromNow });
      } catch {
        return false;
      }
    });
  }, [appointments, showUpcomingOnly]);

  // Event handlers
  const handleEdit = (appointment: Appointment) => {
    setEditingId(appointment.id);
    const appointmentDate = new Date(appointment.date_time);
    setEditForm({
      ...appointment,
      date: appointmentDate,
      time: format(appointmentDate, "HH:mm"),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.date || !editForm.time || !editForm.who_booked || !editForm.contact_details) {
      toast.error(APPOINTMENT_MESSAGES.REQUIRED_FIELDS);
      return;
    }
    
    setIsMutating(true);
    
    const { date, time, ...restOfForm } = editForm;
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hours, minutes);

    const updatePayload: Partial<Appointment> = {
        ...restOfForm,
        date_time: appointmentDateTime.toISOString(),
    };

    const { success } = await updateAppointment(editingId, updatePayload);
    if (success) {
      setEditingId(null);
      setEditForm({});
    }
    setIsMutating(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAppointmentId) return;
    setIsMutating(true);
    await deleteAppointment(selectedAppointmentId);
    setIsMutating(false);
    setDeleteDialogOpen(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleOpenDeleteDialog = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setDeleteDialogOpen(true);
  };

  // Render states
  if (error) return <div className="text-center py-4 text-destructive">{APPOINTMENT_MESSAGES.FETCH_ERROR}</div>;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <LoadingSpinner size="lg" className="mb-2" />
        <p>{DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}</p>
      </div>
    );
  }

  if (filteredAppointments.length === 0) {
    return emptyState || (
      <div className="text-center py-4 text-muted-foreground">
        {showUpcomingOnly ? APPOINTMENT_MESSAGES.NO_UPCOMING : APPOINTMENT_MESSAGES.NO_APPOINTMENTS}
      </div>
    );
  }

  // Render appointment edit form
  const renderEditForm = (appointment: Appointment) => (
    <div className="space-y-4" key={appointment.id}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="who_booked">{FORM_LABELS.WHO_BOOKED}</Label>
          <Input
            id="who_booked"
            value={editForm.who_booked || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, who_booked: e.target.value }))}
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
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 truncate",
                      !editForm.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
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
          onChange={(e) => setEditForm(prev => ({ ...prev, contact_details: e.target.value }))}
          placeholder={PLACEHOLDERS.CONTACT_DETAILS}
          className="h-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="num_children">{FORM_LABELS.NUM_CHILDREN}</Label>
          <Input
            id="num_children"
            type="number"
            value={editForm.num_children || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, num_children: parseInt(e.target.value) }))}
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
            value={editForm.num_adults || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, num_adults: parseInt(e.target.value) }))}
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
          value={editForm.notes || ''}
          onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
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
          <X className="mr-2 h-4 w-4 flex-shrink-0" />
          {BUTTON_LABELS.CANCEL}
        </Button>
        <LoadingButton
          onClick={handleSaveEdit}
          className="flex items-center"
          loading={isMutating}
          loadingText={DIALOG_MESSAGES.SAVE_LOADING}
        >
          <Check className="mr-2 h-4 w-4 flex-shrink-0" />
          <span>{BUTTON_LABELS.SAVE}</span>
        </LoadingButton>
      </div>
    </div>
  );

  // Render appointment details
  const renderAppointmentDetails = (appointment: Appointment) => (
    <>
      <div className="flex justify-between items-start gap-4 mb-2">
        <div className="flex-1 space-y-1">
          <h3 className="font-medium text-foreground">{appointment.who_booked}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDateWithGreekAmPm(new Date(appointment.date_time))}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(appointment)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleOpenDeleteDialog(appointment.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>
      <div className="space-y-2">
        <InfoRow label={FORM_LABELS.CONTACT_DETAILS} value={appointment.contact_details} />
        <InfoRow label="Συμμετέχοντες" value={`${appointment.num_children} ${FORM_LABELS.NUM_CHILDREN}, ${appointment.num_adults} ${FORM_LABELS.NUM_ADULTS}`} />
        {appointment.notes && <InfoRow label={FORM_LABELS.NOTES} value={appointment.notes} />}
         <InfoRow 
            label={FORM_LABELS.CREATED_AT} 
            value={appointment.created_at ? formatDateWithGreekAmPm(new Date(appointment.created_at)) : ''}
          />
      </div>
    </>
  );

  return (
    <>
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent className="p-4">
              {editingId === appointment.id 
                ? renderEditForm(appointment)
                : renderAppointmentDetails(appointment)
              }
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