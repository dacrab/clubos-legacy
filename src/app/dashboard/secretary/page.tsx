import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { AppointmentsCalendar } from "@/components/appointments/AppointmentsCalendar"
import { UpcomingParties } from "@/components/appointments/UpcomingParties"

export default async function SecretaryDashboardPage() {
  const supabase = createClient()

  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .gte("start_time", startOfDay.toISOString())
    .order("start_time", { ascending: true })

  const { data: parties } = await supabase
    .from("appointments")
    .select("*")
    .eq("type", "party")
    .gte("start_time", startOfDay.toISOString())
    .order("start_time", { ascending: true })
    .limit(5)

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Secretary Dashboard"
        description="Manage appointments and party bookings"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <AppointmentsCalendar 
          appointments={appointments} 
          className="col-span-4" 
        />
        <UpcomingParties 
          parties={parties} 
          className="col-span-3" 
        />
      </div>
    </DashboardShell>
  )
} 