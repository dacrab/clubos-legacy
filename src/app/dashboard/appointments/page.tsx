import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { AppointmentsCalendar } from "@/components/appointments/AppointmentsCalendar"
import { NewAppointmentDialog } from "@/components/appointments/NewAppointmentDialog"
import { Card } from "@/components/ui/card"

export default async function AppointmentsPage() {
  const supabase = await createClient()

  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .gte("start_time", startOfDay.toISOString())
    .order("start_time", { ascending: true })

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Appointments"
        description="Manage football field and party bookings"
      >
        <NewAppointmentDialog />
      </DashboardHeader>
      <div className="grid gap-4">
        <Card className="p-6">
          <AppointmentsCalendar appointments={appointments} />
        </Card>
      </div>
    </DashboardShell>
  )
} 