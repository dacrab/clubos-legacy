'use client';

import { createBrowserClient } from "@supabase/ssr";
import { format } from "date-fns";
import { el } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react";
import React, { useState } from 'react';
import { toast } from 'sonner';

// Types

// Constants

// UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  FOOTBALL_BOOKING_MESSAGES, 
  FORM_LABELS, 
  PLACEHOLDERS,
  BUTTON_LABELS,
  DIALOG_MESSAGES,
  DATE_FORMAT
} from '@/lib/constants';
import { cn } from "@/lib/utils";
import { type Database } from '@/types/supabase';

// Types
type FootballFieldBookingFormData = {
  who_booked: string;
  booking_datetime: string;
  contact_details: string;
  field_number: number;
  num_players: number;
  notes: string | null;
  user_id: string;
};

interface FootballFieldBookingFormProps {
  onSuccess?: () => void;
}

const initialFormData = {
  who_booked: '',
  date: undefined as Date | undefined,
  time: '',
  contact_details: '',
  field_number: '1',
  num_players: '5',
  notes: ''
};

export default function FootballFieldBookingForm({ onSuccess }: FootballFieldBookingFormProps) {
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ) as any;

    const validateForm = () => {
      if (!formData.who_booked || !formData.date || !formData.time || !formData.contact_details || !formData.field_number) {
        throw new Error(FOOTBALL_BOOKING_MESSAGES.REQUIRED_FIELDS);
      }

      const playersNum = parseInt(formData.num_players);
      const fieldNum = parseInt(formData.field_number);

      if (playersNum < 2 || playersNum > 12) {
        throw new Error(FOOTBALL_BOOKING_MESSAGES.MIN_PLAYERS);
      }

      if (fieldNum < 1 || fieldNum > 5) {
        throw new Error(FOOTBALL_BOOKING_MESSAGES.INVALID_FIELD);
      }
    };

    const prepareBookingData = (): FootballFieldBookingFormData => {
      const dateTime = new Date(formData.date!);
      const [hours, minutes] = formData.time.split(':');
      dateTime.setHours(parseInt(hours), parseInt(minutes));

      return {
        who_booked: formData.who_booked.trim(),
        booking_datetime: dateTime.toISOString(),
        contact_details: formData.contact_details.trim(),
        field_number: parseInt(formData.field_number),
        num_players: parseInt(formData.num_players),
        notes: formData.notes.trim() || null,
        user_id: ''
      };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) {return;}
        setIsSubmitting(true);

        try {
            validateForm();
            const bookingData = prepareBookingData();

            const { error } = await supabase
              .from('football_field_bookings')
              .insert([bookingData]);

            if (error) {throw error;}

            toast.success(FOOTBALL_BOOKING_MESSAGES.CREATE_SUCCESS);
            setFormData(initialFormData);
            onSuccess?.();
        } catch (error) {
            console.error('Error:', error);
            toast.error(error instanceof Error ? error.message : FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-full sm:max-w-lg mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
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
                            className="h-9 sm:h-10 text-sm sm:text-base"
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
                                        variant="outline"
                                        className={cn(
                                            "justify-start text-left font-normal w-full h-9 sm:h-10 text-xs sm:text-sm",
                                            !formData.date && "text-muted-foreground"
                                        )}
                                        disabled={isSubmitting}
                                    >
                                        <CalendarIcon className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                        {formData.date ? 
                                          format(formData.date, DATE_FORMAT.DISPLAY, { locale: el }) :
                                          "Επιλέξτε ημερομηνία"
                                        }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.date}
                                        onSelect={(date: Date | undefined) => setFormData(prev => ({ ...prev, date }))}
                                        initialFocus
                                        className="rounded-md border shadow-sm p-2 sm:p-3"
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                className="text-center h-9 sm:h-10 text-sm sm:text-base"
                                required
                                disabled={isSubmitting}
                                step="300"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
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
                        className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="field_number">
                            {FORM_LABELS.FIELD_NUMBER} <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.field_number}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, field_number: value }))}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger id="field_number" className="h-9 sm:h-10 text-sm sm:text-base">
                                <SelectValue placeholder="Επιλέξτε γήπεδο" />
                            </SelectTrigger>
                            <SelectContent>
                                {[1,2,3,4,5].map(num => (
                                    <SelectItem key={num} value={num.toString()} className="text-sm sm:text-base">
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
                            id="num_players"
                            type="number"
                            value={formData.num_players}
                            onChange={(e) => setFormData(prev => ({ ...prev, num_players: e.target.value }))}
                            min="2"
                            max="12"
                            required
                            placeholder={PLACEHOLDERS.NUM_PLAYERS}
                            disabled={isSubmitting}
                            className="h-9 sm:h-10 text-sm sm:text-base"
                        />
                    </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="notes" className="text-sm sm:text-base">{FORM_LABELS.NOTES}</Label>
                    <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        placeholder={PLACEHOLDERS.NOTES}
                        disabled={isSubmitting}
                        className="text-sm sm:text-base resize-none min-h-[80px]"
                    />
                </div>

                <LoadingButton 
                    type="submit" 
                    className="w-full h-9 sm:h-10 text-sm sm:text-base"
                    loading={isSubmitting}
                    loadingText={DIALOG_MESSAGES.SAVE_LOADING}
                >
                    {BUTTON_LABELS.BOOK_FIELD}
                </LoadingButton>
            </form>
        </div>
    );
}