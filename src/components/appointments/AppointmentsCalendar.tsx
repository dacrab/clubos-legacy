'use client'

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Appointment } from "@/types"
import { format, isSameDay, parseISO } from "date-fns"

interface AppointmentCardProps {
  appointment: Appointment
}

const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  const startTime = parseISO(appointment.start_time)
  const endTime = parseISO(appointment.end_time)

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{appointment.customer_name}</h3>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium",
            appointment.type === "football"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          )}
        >
          {appointment.type === "football" ? "Football" : "Party"}
        </span>
      </div>
      <div className="text-sm text-muted-foreground">
        <p>Time: {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}</p>
        <p>Phone: {appointment.customer_phone}</p>
        {appointment.type === "party" && appointment.guests && (
          <p>Guests: {appointment.guests}</p>
        )}
        {appointment.notes && (
          <p className="mt-2 text-xs italic">Notes: {appointment.notes}</p>
        )}
      </div>
    </div>
  )
}

interface AppointmentsCalendarProps {
  appointments: Appointment[] | null
}

export function AppointmentsCalendar({
  appointments,
}: AppointmentsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  if (!appointments?.length) {
    return (
      <div className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
        />
        <Card>
          <CardHeader>
            <CardTitle>No Appointments</CardTitle>
            <CardDescription>
              No appointments scheduled for {format(selectedDate, "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const selectedAppointments = appointments.filter(appointment =>
    isSameDay(parseISO(appointment.start_time), selectedDate)
  )

  // Group appointments by type
  const footballAppointments = selectedAppointments.filter(
    app => app.type === "football"
  )
  const partyAppointments = selectedAppointments.filter(
    app => app.type === "party"
  )

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && setSelectedDate(date)}
        className="rounded-md border"
      />
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Football Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Football Field Bookings</CardTitle>
            <CardDescription>
              {format(selectedDate, "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {footballAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No football field bookings for this day
              </p>
            ) : (
              footballAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Party Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Party Bookings</CardTitle>
            <CardDescription>
              {format(selectedDate, "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {partyAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No party bookings for this day
              </p>
            ) : (
              partyAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}