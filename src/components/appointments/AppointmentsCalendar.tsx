import { cn, formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Appointment } from "@/types"

interface AppointmentsCalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  appointments: Appointment[] | null
}

export function AppointmentsCalendar({
  appointments,
  className,
  ...props
}: AppointmentsCalendarProps) {
  if (!appointments?.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
          <CardDescription>No appointments scheduled for today</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Today's Appointments</CardTitle>
        <CardDescription>Schedule for {formatDate(new Date())}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {appointment.customer_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(appointment.start_time).toLocaleTimeString()} - {new Date(appointment.end_time).toLocaleTimeString()}
                </p>
              </div>
              <div className="ml-auto">
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
              {appointment.type === "party" && appointment.guests && (
                <div className="ml-2">
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                    {appointment.guests} guests
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 