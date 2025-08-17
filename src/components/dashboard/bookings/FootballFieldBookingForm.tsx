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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFootballFieldBookings } from '@/hooks/features/bookings/useFootballFieldBookings';
import { 
  FOOTBALL_BOOKING_MESSAGES, 
  FORM_LABELS, 
  PLACEHOLDERS,
  BUTTON_LABELS,
  DIALOG_MESSAGES,
  DATE_FORMAT
} from '@/lib/constants';
import { cn } from "@/lib/utils";

interface FormProps {
  onSuccess?: () => void;
}

export default function FootballFieldBookingForm({ onSuccess }: FormProps) {
    const [formData, setFormData] = useState({
        who_booked: '',
        date: undefined as Date | undefined,
        time: '',
        contact_details: '',
        field_number: '1',
        num_players: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const { addBooking } = useFootballFieldBookings();

    const handleChange = (field: string, value: string | number | Date | undefined) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({
            who_booked: '',
            date: undefined,
            time: '',
            contact_details: '',
            field_number: '1',
            num_players: '',
            notes: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) {return;}

        // Basic validation
        if (!formData.who_booked || !formData.date || !formData.time || 
            !formData.contact_details || !formData.num_players) {
            toast.error(FOOTBALL_BOOKING_MESSAGES.REQUIRED_FIELDS);
            return;
        }

        const playerCount = parseInt(formData.num_players);
        if (playerCount < 2 || playerCount > 12) {
            toast.error(FOOTBALL_BOOKING_MESSAGES.MIN_PLAYERS);
            return;
        }

        setLoading(true);

        try {
            // Create booking datetime
            const bookingDate = new Date(formData.date);
            const [hours, minutes] = formData.time.split(':').map(Number);
            bookingDate.setHours(hours, minutes, 0, 0);

            const bookingData = {
                whoBooked: formData.who_booked.trim(),
                bookingDatetime: bookingDate,
                contactDetails: formData.contact_details.trim(),
                fieldNumber: parseInt(formData.field_number),
                numPlayers: playerCount,
                durationMinutes: 90, // Default duration
                status: 'pending' as const,
                notes: formData.notes.trim() || undefined,
            };

            const result = await addBooking(bookingData);

            if (result.success) {
                resetForm();
                onSuccess?.();
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : FOOTBALL_BOOKING_MESSAGES.GENERIC_ERROR);
        } finally {
            setLoading(false);
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
                        onChange={(e) => handleChange('who_booked', e.target.value)}
                        placeholder={PLACEHOLDERS.WHO_BOOKED}
                        disabled={loading}
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
                                        "justify-start text-left font-normal w-full h-10 truncate",
                                        !formData.date && "text-muted-foreground"
                                    )}
                                    disabled={loading}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
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
                                    onSelect={(date: Date | undefined) => handleChange('date', date)}
                                    initialFocus
                                    className="rounded-md border shadow-sm p-3"
                                />
                            </PopoverContent>
                        </Popover>
                        <Input
                            type="time"
                            value={formData.time}
                            onChange={(e) => handleChange('time', e.target.value)}
                            className="text-center h-10"
                            required
                            disabled={loading}
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
                        onChange={(e) => handleChange('contact_details', e.target.value)}
                        placeholder={PLACEHOLDERS.CONTACT_DETAILS}
                        required
                        disabled={loading}
                        className="h-10"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="field_number">
                            {FORM_LABELS.FIELD_NUMBER} <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.field_number}
                            onValueChange={(value) => handleChange('field_number', value)}
                            disabled={loading}
                        >
                            <SelectTrigger id="field_number" className="h-10">
                                <SelectValue placeholder="Επιλέξτε γήπεδο" />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5].map(fieldNum => (
                                    <SelectItem key={fieldNum} value={fieldNum.toString()}>
                                        Γήπεδο {fieldNum}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="num_players">
                            {FORM_LABELS.NUM_PLAYERS} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="num_players"
                            type="number"
                            value={formData.num_players}
                            onChange={(e) => handleChange('num_players', e.target.value)}
                            min="2"
                            max="12"
                            required
                            placeholder={PLACEHOLDERS.NUM_PLAYERS}
                            disabled={loading}
                            className="h-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">{FORM_LABELS.NOTES}</Label>
                    <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        rows={3}
                        placeholder={PLACEHOLDERS.NOTES}
                        disabled={loading}
                        className="resize-none min-h-[80px]"
                    />
                </div>

                <LoadingButton 
                    type="submit" 
                    className="w-full h-10"
                    loading={loading}
                    loadingText={DIALOG_MESSAGES.SAVE_LOADING}
                >
                    {BUTTON_LABELS.BOOK_FIELD}
                </LoadingButton>
            </form>
        </div>
    );
}
