'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { format } from "date-fns";
import { el } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react";
import { useAppointments } from '@/hooks/features/appointments/useAppointments';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDateToYYYYMMDD, formatTimeToHHMM } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/utils/useMediaQuery";

// UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { Textarea } from "@/components/ui/textarea";

// Utils and Types
import { cn } from "@/lib/utils";
import { 
  APPOINTMENT_MESSAGES, 
  FORM_LABELS, 
  PLACEHOLDERS,
  BUTTON_LABELS,
  DIALOG_MESSAGES,
  DATE_FORMAT
} from '@/lib/constants';
import type { AppointmentFormData } from '@/types/appointments';

interface AppointmentFormProps {
  onSuccess?: () => void;
}

const initialFormData = {
  who_booked: '',
  date: undefined as Date | undefined,
  time: '',
  contact_details: '',
  num_children: '',
  num_adults: '',
  notes: ''
};

export default function AppointmentForm({ onSuccess }: AppointmentFormProps) {
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addAppointment } = useAppointments();
    
    const validateForm = () => {
      if (!formData.who_booked || !formData.date || !formData.time || !formData.contact_details || !formData.num_children || !formData.num_adults) {
        toast.error(APPOINTMENT_MESSAGES.REQUIRED_FIELDS);
        return false;
      }
      return true;
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);
  
      try {
        if (!validateForm()) return;
        
        const [hours, minutes] = formData.time.split(':').map(Number);
        // The date is validated in validateForm, so it's safe to assume it's a Date object here.
        const appointmentDateTime = new Date(formData.date as Date);
        appointmentDateTime.setHours(hours, minutes);

        const appointmentData: AppointmentFormData = {
            who_booked: formData.who_booked,
            date_time: appointmentDateTime.toISOString(),
            contact_details: formData.contact_details,
            num_children: parseInt(formData.num_children),
            num_adults: parseInt(formData.num_adults),
            notes: formData.notes,
        };
  
        const { success } = await addAppointment(appointmentData);
  
        if (success) {
          setFormData(initialFormData);
          onSuccess?.();
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="who_booked">
              {FORM_LABELS.WHO_BOOKED} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="who_booked"
              value={formData.who_booked}
              onChange={(e) => setFormData(prev => ({ ...prev, who_booked: e.target.value }))}
              placeholder={PLACEHOLDERS.WHO_BOOKED}
              disabled={isSubmitting}
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
                    variant={"outline-solid"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 truncate",
                      !formData.date && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {formData.date ? format(formData.date, DATE_FORMAT.DISPLAY, { locale: el }) : <span>Επιλέξτε ημερομηνία</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(day: Date | undefined) => setFormData(prev => ({ ...prev, date: day }))}
                    initialFocus
                    locale={el}
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="text-center h-10"
                required
                disabled={isSubmitting}
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
              value={formData.contact_details}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_details: e.target.value }))}
              placeholder={PLACEHOLDERS.CONTACT_DETAILS}
              required
              disabled={isSubmitting}
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
                value={formData.num_children}
                onChange={(e) => setFormData(prev => ({ ...prev, num_children: e.target.value }))}
                min="1"
                required
                placeholder={PLACEHOLDERS.NUM_CHILDREN}
                disabled={isSubmitting}
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
                value={formData.num_adults}
                onChange={(e) => setFormData(prev => ({ ...prev, num_adults: e.target.value }))}
                min="0"
                required
                placeholder={PLACEHOLDERS.NUM_ADULTS}
                disabled={isSubmitting}
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
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder={PLACEHOLDERS.NOTES}
              disabled={isSubmitting}
              className="resize-none"
            />
          </div>
  
          <LoadingButton
            type="submit"
            className="w-full h-10"
            loading={isSubmitting}
            loadingText={DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}
          >
            {BUTTON_LABELS.BOOK_APPOINTMENT}
          </LoadingButton>
        </form>
      </div>
    );
}
