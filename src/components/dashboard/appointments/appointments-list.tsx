'use client';

import { addDays, format, formatDistanceToNow, isWithinInterval, parseISO } from 'date-fns';
import { el } from 'date-fns/locale';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import {
  APPOINTMENT_MESSAGES,
  BUTTON_LABELS,
  DATE_FORMAT,
  DIALOG_MESSAGES,
  FORM_LABELS,
  PLACEHOLDERS,
} from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase/client';
import { toast } from '@/lib/utils/toast';
import type { Appointment } from '@/types/appointment';
import type { Database } from '@/types/supabase';

type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

const UPCOMING_DAYS = 3;

type AppointmentsListProps = {
  showUpcomingOnly?: boolean;
  emptyState?: React.ReactNode;
  // Optional overrides to allow parent to control fetch and avoid duplicate errors
  appointmentsData?: Appointment[];
  appointmentsError?: Error | null;
  isLoadingOverride?: boolean;
};

// Utility functions
const formatDateWithGreekAmPm = (dateString: string): string => {
  try {
    return format(new Date(dateString), DATE_FORMAT.FULL_WITH_TIME, {
      locale: el,
    });
  } catch {
    return dateString;
  }
};

export const AppointmentsList = ({
  showUpcomingOnly = false,
  emptyState,
  appointmentsData,
  appointmentsError,
  isLoadingOverride,
}: AppointmentsListProps) => {
  // State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AppointmentUpdate>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize Supabase client (shared, typed)
  const supabase = createClientSupabase();

  // Data fetching
  const {
    data: swrAppointments = [],
    error: swrError,
    isLoading: swrIsLoading,
    mutate,
  } = useSWR<Appointment[]>(
    'appointments',
    async () => {
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }
      return data || [];
    },
    {
      // If parent provides data, don't revalidate on mount to avoid flicker
      revalidateOnMount: appointmentsData === undefined,
      shouldRetryOnError: true,
    }
  );

  const appointments: Appointment[] =
    appointmentsData !== undefined ? appointmentsData : swrAppointments;
  const error = appointmentsError !== undefined ? appointmentsError : swrError;
  const isLoading = typeof isLoadingOverride === 'boolean' ? isLoadingOverride : swrIsLoading;

  // Filter appointments based on props
  const filteredAppointments = React.useMemo(() => {
    if (!showUpcomingOnly) {
      return appointments;
    }

    const now = new Date();
    const threeDaysFromNow = addDays(now, UPCOMING_DAYS);

    return appointments.filter((appointment) => {
      try {
        const appointmentDate = parseISO(appointment.appointment_date);
        return isWithinInterval(appointmentDate, {
          start: now,
          end: threeDaysFromNow,
        });
      } catch {
        return false;
      }
    });
  }, [appointments, showUpcomingOnly]);

  // Event handlers
  const handleEdit = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setEditForm(appointment);
  };

  const handleSaveEdit = async () => {
    if (
      !(
        editingId &&
        editForm.appointment_date &&
        editForm.customer_name &&
        editForm.contact_info &&
        editForm.num_children
      )
    ) {
      toast.error(APPOINTMENT_MESSAGES.REQUIRED_FIELDS);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update<AppointmentUpdate>(editForm)
        .eq('id', editingId);

      if (updateError) {
        throw updateError;
      }

      toast.success(APPOINTMENT_MESSAGES.UPDATE_SUCCESS);
      setEditingId(null);
      setEditForm({});
      mutate();
    } catch (_updateError) {
      toast.error(APPOINTMENT_MESSAGES.GENERIC_ERROR);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAppointmentId) {
      return;
    }
    setIsDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', selectedAppointmentId);

      if (deleteError) {
        throw deleteError;
      }

      toast.success(APPOINTMENT_MESSAGES.DELETE_SUCCESS);
      mutate();
    } catch (_deleteError) {
      toast.error(APPOINTMENT_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
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
  if (error) {
    return (
      <div className="py-4 text-center text-destructive">{APPOINTMENT_MESSAGES.FETCH_ERROR}</div>
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

  if (filteredAppointments.length === 0) {
    return (
      emptyState || (
        <div className="py-4 text-center text-muted-foreground">
          {showUpcomingOnly
            ? APPOINTMENT_MESSAGES.NO_UPCOMING
            : APPOINTMENT_MESSAGES.NO_APPOINTMENTS}
        </div>
      )
    );
  }

  // Render appointment edit form
  const renderEditForm = (_appointment: Appointment) => (
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
          <Label className="text-sm sm:text-base" htmlFor="appointment_date">
            {FORM_LABELS.DATE_TIME}
          </Label>
          <Input
            className="h-8 text-sm sm:h-10 sm:text-base"
            id="appointment_date"
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                appointment_date: e.target.value,
              }))
            }
            type="datetime-local"
            value={editForm.appointment_date || ''}
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
          <Label className="text-sm sm:text-base" htmlFor="num_children">
            {FORM_LABELS.NUM_CHILDREN}
          </Label>
          <Input
            className="h-8 text-sm sm:h-10 sm:text-base"
            id="num_children"
            min="1"
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                num_children: Number.parseInt(e.target.value, 10),
              }))
            }
            placeholder={PLACEHOLDERS.NUM_CHILDREN}
            type="number"
            value={String(editForm.num_children ?? '')}
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm sm:text-base" htmlFor="num_adults">
            {FORM_LABELS.NUM_ADULTS}
          </Label>
          <Input
            className="h-8 text-sm sm:h-10 sm:text-base"
            id="num_adults"
            min="0"
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                num_adults: Number.parseInt(e.target.value, 10),
              }))
            }
            placeholder={PLACEHOLDERS.NUM_ADULTS}
            type="number"
            value={String(editForm.num_adults ?? '')}
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
          onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder={PLACEHOLDERS.NOTES}
          rows={3}
          value={editForm.notes || ''}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          className="flex h-8 items-center gap-1 text-xs sm:h-9 sm:gap-2 sm:text-sm"
          onClick={handleCancelEdit}
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
  );

  // Render appointment details
  const renderAppointmentDetails = (appointment: Appointment) => (
    <>
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
        <div>
          <h3 className="font-medium text-foreground text-sm sm:text-base">
            {appointment.customer_name}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {formatDateWithGreekAmPm(appointment.appointment_date)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground xs:text-xs">
            {FORM_LABELS.CREATED_AT}: {formatDateWithGreekAmPm(appointment.created_at)} (
            {formatDistanceToNow(new Date(appointment.created_at), {
              addSuffix: true,
              locale: el,
            })}
            )
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary text-xs sm:px-2 sm:py-1 sm:text-sm">
            {appointment.num_children} {FORM_LABELS.NUM_CHILDREN}, {appointment.num_adults}{' '}
            {FORM_LABELS.NUM_ADULTS}
          </span>
          <div className="flex gap-1.5 sm:gap-2">
            <Button
              className="flex h-7 items-center gap-1 px-1.5 text-xs sm:h-9 sm:gap-2 sm:px-3 sm:text-sm"
              onClick={() => handleEdit(appointment)}
              size="sm"
              variant="outline"
            >
              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="xs:inline hidden">{BUTTON_LABELS.EDIT}</span>
            </Button>
            <Button
              className="flex h-7 items-center gap-1 px-1.5 text-xs sm:h-9 sm:gap-2 sm:px-3 sm:text-sm"
              onClick={() => handleOpenDeleteDialog(appointment.id)}
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
        <p className="text-foreground">{appointment.contact_info}</p>
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
                : renderAppointmentDetails(appointment)}
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
};
