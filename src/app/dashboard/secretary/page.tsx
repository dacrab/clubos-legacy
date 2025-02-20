import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { AppointmentsCalendar } from "@/components/appointments/AppointmentsCalendar"
import { UpcomingParties } from "@/components/appointments/UpcomingParties"
import { Card } from "@/components/ui/card"
import { Appointment } from "@/types"

export default async function SecretaryDashboardPage() {
  const supabase = await createClient()

  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)

  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      id,
      type,
      start_time,
      end_time,
      customer_name,
      customer_phone,
      notes,
      guests,
      created_by,
      created_at,
      updated_at
    `)
    .gte("start_time", startOfDay.toISOString())
    .order("start_time", { ascending: true })

  const { data: parties } = await supabase
    .from("appointments")
    .select(`
      id,
      type,
      start_time,
      end_time,
      customer_name,
      customer_phone,
      notes,
      guests,
      created_by,
      created_at,
      updated_at
    `)
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
        <Card className="col-span-4 p-6">
          <AppointmentsCalendar appointments={appointments as Appointment[] | null} />
        </Card>
        <UpcomingParties 
          parties={parties as Appointment[] | null}
          className="col-span-3" 
        />
      </div>
    </DashboardShell>
  )
} 