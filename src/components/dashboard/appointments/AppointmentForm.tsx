'use client';

import { format } from "date-fns";
import { el } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react";
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useAppointments } from '@/hooks/features/appointments/useAppointments';
import { 
  APPOINTMENT_MESSAGES, 
  FORM_LABELS, 
  PLACEHOLDERS,
  BUTTON_LABELS,
  DIALOG_MESSAGES,
  DATE_FORMAT
} from '@/lib/constants';
import { cn } from "@/lib/utils";
import type { AppointmentFormData } from '@/types/appointments';

interface AppointmentFormProps {
  onSuccess?: () => void;
}

interface FormState {
  who_booked: string;
  date: Date | undefined;
  time: string;
  contact_details: string;
  num_children: string;
  num_adults: string;
  notes: string;
}

const INITIAL_FORM_STATE: FormState = {
  who_booked: '',
  date: undefined,
  time: '',
  contact_details: '',
  num_children: '',
  num_adults: '',
  notes: ''
};

export default function AppointmentForm({ onSuccess }: AppointmentFormProps) {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);
    const { addAppointment } = useAppointments();
    
  const updateFormField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    };
  
  const isFormValid = (): boolean => {
    const requiredFields = [
      formState.who_booked,
      formState.date,
      formState.time,
      formState.contact_details,
      formState.num_children,
      formState.num_adults
    ];
    
    return requiredFields.every(field => field !== '' && field !== undefined);
        };
  
  const createAppointmentData = (): AppointmentFormData => {
    const [hours, minutes] = formState.time.split(':').map(Number);
    const appointmentDate = new Date(formState.date || new Date());
    appointmentDate.setHours(hours, minutes);

    return {
      title: 'Appointment', // Default title
      whoBooked: formState.who_booked,
      dateTime: appointmentDate,
      durationMinutes: 60, // Default duration
      numChildren: 0, // Default to no children
      numAdults: 1, // Default to one adult
      status: 'pending' as const,
      contactDetails: formState.contact_details,
      notes: formState.notes,
    } as AppointmentFormData;
  };

  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isLoading) {return;}

    if (!isFormValid()) {
      toast.error(APPOINTMENT_MESSAGES.REQUIRED_FIELDS);
      return;
    }

    setIsLoading(true);

    try {
      const appointmentData = createAppointmentData();
      const { success } = await addAppointment(appointmentData);

      if (success) {
        resetForm();
        onSuccess?.();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="w-full">
      <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="who_booked">
              {FORM_LABELS.WHO_BOOKED} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="who_booked"
            value={formState.who_booked}
            onChange={(e) => updateFormField('who_booked', e.target.value)}
              placeholder={PLACEHOLDERS.WHO_BOOKED}
            disabled={isLoading}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label>
              {FORM_LABELS.DATE_TIME} <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                  variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 truncate",
                    !formState.date && "text-muted-foreground"
                    )}
                  disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  {formState.date ? 
                    format(formState.date, DATE_FORMAT.DISPLAY, { locale: el }) : 
                    <span>Επιλέξτε ημερομηνία</span>
                  }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                  selected={formState.date}
                  onSelect={(date) => updateFormField('date', date as Date | undefined)}
                    initialFocus
                    locale={el}
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
              value={formState.time}
              onChange={(e) => updateFormField('time', e.target.value)}
                className="text-center h-10"
                required
              disabled={isLoading}
                step="300"
              />
            </div>
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="contact_details">
              {FORM_LABELS.CONTACT_DETAILS} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact_details"
            value={formState.contact_details}
            onChange={(e) => updateFormField('contact_details', e.target.value)}
              placeholder={PLACEHOLDERS.CONTACT_DETAILS}
              required
            disabled={isLoading}
              className="h-10"
            />
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="num_children">
                {FORM_LABELS.NUM_CHILDREN} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="num_children"
                type="number"
              value={formState.num_children}
              onChange={(e) => updateFormField('num_children', e.target.value)}
                min="1"
                required
                placeholder={PLACEHOLDERS.NUM_CHILDREN}
              disabled={isLoading}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="num_adults">
                {FORM_LABELS.NUM_ADULTS} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="num_adults"
                type="number"
              value={formState.num_adults}
              onChange={(e) => updateFormField('num_adults', e.target.value)}
                min="0"
                required
                placeholder={PLACEHOLDERS.NUM_ADULTS}
              disabled={isLoading}
                className="h-10"
              />
            </div>
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="notes">
              {FORM_LABELS.NOTES}
            </Label>
            <Textarea
              id="notes"
            value={formState.notes}
            onChange={(e) => updateFormField('notes', e.target.value)}
              rows={3}
              placeholder={PLACEHOLDERS.NOTES}
            disabled={isLoading}
              className="resize-none"
            />
          </div>
  
          <LoadingButton
            type="submit"
            className="w-full h-10"
          loading={isLoading}
            loadingText={DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}
          >
            {BUTTON_LABELS.BOOK_APPOINTMENT}
          </LoadingButton>
        </form>
      </div>
    );
}
