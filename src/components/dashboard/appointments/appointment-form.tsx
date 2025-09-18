import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import {
  APPOINTMENT_MESSAGES,
  BUTTON_LABELS,
  DIALOG_MESSAGES,
  FORM_LABELS,
  PLACEHOLDERS,
} from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/date-utils';
import { cn } from '@/lib/utils/format';
import { toast } from '@/lib/utils/toast';
// Use direct Insert type to help Supabase inference
import type { Database } from '@/types/supabase';

type AppointmentFormProps = {
  onSuccess?: () => void;
};

const initialFormData = {
  who_booked: '',
  date: undefined as Date | undefined,
  time: '',
  contact_details: '',
  num_children: '1',
  num_adults: '1',
  notes: '',
};

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Using a freshly created typed Supabase client
  const supabase = createClientSupabase();

  const validateForm = () => {
    if (
      !(
        formData.who_booked &&
        formData.date &&
        formData.time &&
        formData.contact_details &&
        formData.num_children
      )
    ) {
      throw new Error(APPOINTMENT_MESSAGES.REQUIRED_FIELDS);
    }

    const childrenNum = Number.parseInt(formData.num_children, 10);
    const adultsNum = Number.parseInt(formData.num_adults, 10) || 0;

    if (Number.isNaN(childrenNum) || childrenNum < 1) {
      throw new Error(APPOINTMENT_MESSAGES.MIN_CHILDREN);
    }

    if (Number.isNaN(adultsNum) || adultsNum < 0) {
      throw new Error(APPOINTMENT_MESSAGES.MIN_ADULTS);
    }
  };

  const prepareAppointmentInsert = (
    userId: string
  ): Database['public']['Tables']['appointments']['Insert'] => {
    if (!formData.date) {
      throw new Error(APPOINTMENT_MESSAGES.REQUIRED_FIELDS);
    }
    const dateTime = new Date(formData.date);
    const [hours, minutes] = formData.time.split(':');
    const safeHours = Number.parseInt(hours ?? '0', 10);
    const safeMinutes = Number.parseInt(minutes ?? '0', 10);
    dateTime.setHours(safeHours, safeMinutes);

    return {
      customer_name: formData.who_booked.trim(),
      contact_info: formData.contact_details.trim(),
      appointment_date: dateTime.toISOString(),
      num_children: Number.parseInt(formData.num_children, 10),
      num_adults: Number.parseInt(formData.num_adults, 10),
      notes: formData.notes.trim() || null,
      created_by: userId,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);

    try {
      validateForm();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(APPOINTMENT_MESSAGES.GENERIC_ERROR);
      }
      const appointmentData = prepareAppointmentInsert(user.id);

      const { error } = await supabase.from('appointments').insert([appointmentData] as never);

      if (error) {
        throw error;
      }

      toast.success(APPOINTMENT_MESSAGES.CREATE_SUCCESS);
      setFormData(initialFormData);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : APPOINTMENT_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-full sm:max-w-lg">
      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="who_booked">
              {FORM_LABELS.WHO_BOOKED} <span className="text-destructive">*</span>
            </Label>
            <Input
              className="h-9 text-sm sm:h-10 sm:text-base"
              disabled={isSubmitting}
              id="who_booked"
              onChange={(e) => setFormData((prev) => ({ ...prev, who_booked: e.target.value }))}
              placeholder={PLACEHOLDERS.WHO_BOOKED}
              required
              value={formData.who_booked}
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label>
              {FORM_LABELS.DATE_TIME} <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      'h-9 w-full justify-start text-left font-normal text-xs sm:h-10 sm:text-sm',
                      !formData.date && 'text-muted-foreground'
                    )}
                    disabled={isSubmitting}
                    variant="outline"
                  >
                    <CalendarIcon className="mr-1 h-3.5 w-3.5 shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
                    {formData.date
                      ? formatDate(formData.date, {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : 'Επιλέξτε ημερομηνία'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    className="rounded-md border p-2 shadow-sm sm:p-3"
                    initialFocus
                    mode="single"
                    onSelect={(date: Date | undefined) =>
                      setFormData((prev) => ({ ...prev, date }))
                    }
                    selected={formData.date}
                  />
                </PopoverContent>
              </Popover>
              <Input
                className="h-9 text-center text-sm sm:h-10 sm:text-base"
                disabled={isSubmitting}
                onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                required
                step="300"
                type="time"
                value={formData.time}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="contact_details">
            {FORM_LABELS.CONTACT_DETAILS} <span className="text-destructive">*</span>
          </Label>
          <Input
            className="h-9 text-sm sm:h-10 sm:text-base"
            disabled={isSubmitting}
            id="contact_details"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                contact_details: e.target.value,
              }))
            }
            placeholder={PLACEHOLDERS.CONTACT_DETAILS}
            required
            value={formData.contact_details}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="num_children">
              {FORM_LABELS.NUM_CHILDREN} <span className="text-destructive">*</span>
            </Label>
            <Input
              className="h-9 text-sm sm:h-10 sm:text-base"
              disabled={isSubmitting}
              id="num_children"
              min="1"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  num_children: e.target.value,
                }))
              }
              placeholder={PLACEHOLDERS.NUM_CHILDREN}
              required
              type="number"
              value={formData.num_children}
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="num_adults">
              {FORM_LABELS.NUM_ADULTS} <span className="text-destructive">*</span>
            </Label>
            <Input
              className="h-9 text-sm sm:h-10 sm:text-base"
              disabled={isSubmitting}
              id="num_adults"
              min="0"
              onChange={(e) => setFormData((prev) => ({ ...prev, num_adults: e.target.value }))}
              placeholder={PLACEHOLDERS.NUM_ADULTS}
              required
              type="number"
              value={formData.num_adults}
            />
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm sm:text-base" htmlFor="notes">
            {FORM_LABELS.NOTES}
          </Label>
          <Textarea
            className="resize-none text-sm sm:text-base"
            disabled={isSubmitting}
            id="notes"
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder={PLACEHOLDERS.NOTES}
            rows={3}
            value={formData.notes}
          />
        </div>

        <LoadingButton
          className="h-9 w-full sm:h-10"
          loading={isSubmitting}
          loadingText={DIALOG_MESSAGES.SAVE_LOADING}
          type="submit"
        >
          {BUTTON_LABELS.BOOK_APPOINTMENT}
        </LoadingButton>
      </form>
    </div>
  );
};
