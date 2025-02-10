import { formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Appointment } from "@/types"

interface UpcomingPartiesProps extends React.HTMLAttributes<HTMLDivElement> {
  parties: Appointment[] | null
}

export function UpcomingParties({
  parties,
  className,
}: UpcomingPartiesProps) {
  if (!parties?.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Upcoming Parties</CardTitle>
          <CardDescription>No upcoming party bookings</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upcoming Parties</CardTitle>
        <CardDescription>Next 5 party bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {parties.map((party) => (
            <div key={party.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {party.customer_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(new Date(party.start_time))}
                </p>
              </div>
              {party.guests && (
                <div className="ml-auto">
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                    {party.guests} guests
                  </span>
                </div>
              )}
              {party.notes && (
                <div className="ml-2">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                    Notes
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