'use client';

import React, { useState, useMemo } from 'react';
import { addDays, isWithinInterval, formatDistanceToNow, parseISO, format } from 'date-fns';
import { el } from 'date-fns/locale';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAppointments } from '@/hooks/features/appointments/useAppointments';
import AppointmentForm from './AppointmentForm';
import { formatDateWithGreekAmPm } from "@/lib/utils/date";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/utils/useMediaQuery";
import { 
  APPOINTMENT_MESSAGES,
  FORM_LABELS,
  BUTTON_LABELS, 
  PLACEHOLDERS,
  DIALOG_MESSAGES
} from '@/lib/constants';
import type { Appointment } from '@/types/appointments';

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <p className="text-xs text-muted-foreground">
    <span className="font-medium">{label}:</span> {value}
  </p>
);

interface AppointmentsListProps {
  showUpcomingOnly?: boolean;
  emptyState?: React.ReactNode;
}

export default function AppointmentsList({ showUpcomingOnly = false, emptyState }: AppointmentsListProps) {
  // State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  
  // Data fetching and mutations from hook
  const { appointments = [], error, isLoading, updateAppointment, deleteAppointment, addAppointment } = useAppointments();
  const isMobile = useMediaQuery("(max-width: 768px)");

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

  const upcomingAppointments = useMemo(() => {
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
  }, [appointments]);

  // Event handlers
  const handleEdit = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setEditForm(appointment);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.date_time || !editForm.who_booked || 
        !editForm.contact_details || !editForm.num_children) {
      toast.error(APPOINTMENT_MESSAGES.REQUIRED_FIELDS);
      return;
    }
    
    setIsMutating(true);
    const { success } = await updateAppointment(editingId, editForm);
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
    <div className="space-y-3 sm:space-y-4" key={appointment.id}>
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
          <Label htmlFor="date_time" className="text-sm sm:text-base">{FORM_LABELS.DATE_TIME}</Label>
          <Input
            id="date_time"
            type="datetime-local"
            value={editForm.date_time || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, date_time: e.target.value }))}
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
          <Label htmlFor="num_children" className="text-sm sm:text-base">{FORM_LABELS.NUM_CHILDREN}</Label>
          <Input
            id="num_children"
            type="number"
            value={editForm.num_children || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, num_children: parseInt(e.target.value) }))}
            min="1"
            placeholder={PLACEHOLDERS.NUM_CHILDREN}
            className="h-8 sm:h-10 text-sm sm:text-base"
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="num_adults" className="text-sm sm:text-base">{FORM_LABELS.NUM_ADULTS}</Label>
          <Input
            id="num_adults"
            type="number"
            value={editForm.num_adults || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, num_adults: parseInt(e.target.value) }))}
            min="0"
            placeholder={PLACEHOLDERS.NUM_ADULTS}
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
          onClick={handleCancelEdit}
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
          loading={isMutating}
          loadingText={DIALOG_MESSAGES.SAVE_LOADING}
        >
          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {BUTTON_LABELS.SAVE}
        </LoadingButton>
      </div>
    </div>
  );

  // Render appointment details
  const renderAppointmentDetails = (appointment: Appointment) => (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2">
        <div>
          <h3 className="font-medium text-foreground text-sm sm:text-base">{appointment.who_booked}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDateWithGreekAmPm(new Date(appointment.date_time))}
          </p>
          <InfoRow 
            label={FORM_LABELS.CREATED_AT} 
            value={appointment.created_at ? formatDateWithGreekAmPm(new Date(appointment.created_at)) : ''}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm font-medium bg-primary/10 text-primary px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
            {appointment.num_children} {FORM_LABELS.NUM_CHILDREN}, {appointment.num_adults} {FORM_LABELS.NUM_ADULTS}
          </span>
          <div className="flex gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(appointment)}
              className="h-7 sm:h-9 text-xs sm:text-sm px-1.5 sm:px-3 flex items-center gap-1 sm:gap-2"
            >
              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{BUTTON_LABELS.EDIT}</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleOpenDeleteDialog(appointment.id)}
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
        <p className="text-foreground">{appointment.contact_details}</p>
      </div>
      {appointment.notes && (
        <div className="mt-2 text-xs sm:text-sm">
          <p className="text-muted-foreground">{FORM_LABELS.NOTES}:</p>
          <p className="text-foreground">{appointment.notes}</p>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent className="p-3 sm:p-4">
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