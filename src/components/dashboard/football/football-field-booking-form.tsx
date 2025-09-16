'use client';

import { createBrowserClient } from '@supabase/ssr';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { env } from '@/lib/env';

// Types
type FootballBookingInsert = Database['public']['Tables']['football_bookings']['Insert'];

// Constants

// UI Components
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { cn } from '@/lib/utils/format';
import type { Database } from '@/types/supabase';

// Types

type FootballFieldBookingFormProps = {
  onSuccess?: () => void;
};

const initialFormData = {
  who_booked: '',
  date: undefined as Date | undefined,
  time: '',
  contact_details: '',
  field_number: '1',
  num_players: '5',
  notes: '',
};

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 12;
const MIN_FIELD = 1;
const MAX_FIELD = 5;
const FIELD_NUMBERS = Array.from({ length: MAX_FIELD }, (_, i) => i + 1);

export default function FootballFieldBookingForm({ onSuccess }: FootballFieldBookingFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!(supabaseUrl && supabaseAnonKey)) {
    throw new Error('Missing Supabase URL or anonymous key');
  }
  const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

  const validateForm = () => {
    if (
      !(
        formData.who_booked &&
        formData.date &&
        formData.time &&
        formData.contact_details &&
        formData.field_number
      )
    ) {
      throw new Error(FOOTBALL_BOOKING_MESSAGES.REQUIRED_FIELDS);
    }

    const playersNum = Number.parseInt(formData.num_players, 10);
    const fieldNum = Number.parseInt(formData.field_number, 10);

    if (playersNum < MIN_PLAYERS || playersNum > MAX_PLAYERS) {
      throw new Error(FOOTBALL_BOOKING_MESSAGES.MIN_PLAYERS);
    }

    if (fieldNum < MIN_FIELD || fieldNum > MAX_FIELD) {
      throw new Error(FOOTBALL_BOOKING_MESSAGES.INVALID_FIELD);
    }
  };

  const prepareBookingData = (userId: string): FootballBookingInsert => {
    if (!formData.date) {
      throw new Error('Date is not defined');
    }
    if (!formData.time) {
      throw new Error('Time is not defined');
    }
    const dateTime = new Date(formData.date);
    const [hoursStr, minutesStr] = formData.time.split(':') as [string, string];
    const hoursNum = Number.parseInt(hoursStr, 10);
    const minutesNum = Number.parseInt(minutesStr || '0', 10);
    dateTime.setHours(hoursNum, minutesNum);

    return {
      customer_name: formData.who_booked.trim(),
      contact_info: formData.contact_details.trim(),
      booking_datetime: dateTime.toISOString(),
      field_number: Number.parseInt(formData.field_number, 10),
      num_players: Number.parseInt(formData.num_players, 10),
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
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required');
      }
      const bookingData = prepareBookingData(user.id);

      const { error } = await supabase.from('football_bookings').insert(bookingData);

      if (error) {
        throw error;
      }

      toast.success(FOOTBALL_BOOKING_MESSAGES.CREATE_SUCCESS);
      setFormData(initialFormData);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
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
                      ? format(formData.date, DATE_FORMAT.DISPLAY, {
                          locale: el,
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
            <Label htmlFor="field_number">
              {FORM_LABELS.FIELD_NUMBER} <span className="text-destructive">*</span>
            </Label>
            <Select
              disabled={isSubmitting}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, field_number: value }))}
              value={formData.field_number}
            >
              <SelectTrigger className="h-9 text-sm sm:h-10 sm:text-base" id="field_number">
                <SelectValue placeholder="Επιλέξτε γήπεδο" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_NUMBERS.map((num) => (
                  <SelectItem className="text-sm sm:text-base" key={num} value={num.toString()}>
                    Γήπεδο {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="num_players">
              {FORM_LABELS.NUM_PLAYERS} <span className="text-destructive">*</span>
            </Label>
            <Input
              className="h-9 text-sm sm:h-10 sm:text-base"
              disabled={isSubmitting}
              id="num_players"
              max="12"
              min="2"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  num_players: e.target.value,
                }))
              }
              placeholder={PLACEHOLDERS.NUM_PLAYERS}
              required
              type="number"
              value={formData.num_players}
            />
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-sm sm:text-base" htmlFor="notes">
            {FORM_LABELS.NOTES}
          </Label>
          <Textarea
            className="min-h-[80px] resize-none text-sm sm:text-base"
            disabled={isSubmitting}
            id="notes"
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder={PLACEHOLDERS.NOTES}
            rows={3}
            value={formData.notes}
          />
        </div>

        <LoadingButton
          className="h-9 w-full text-sm sm:h-10 sm:text-base"
          loading={isSubmitting}
          loadingText={DIALOG_MESSAGES.SAVE_LOADING}
          type="submit"
        >
          {BUTTON_LABELS.BOOK_FIELD}
        </LoadingButton>
      </form>
    </div>
  );
}
