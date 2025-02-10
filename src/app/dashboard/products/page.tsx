import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { ProductsTable } from "@/components/products/ProductsTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Toaster } from "@/components/ui/toaster"

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true })

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Products"
        description="Manage your warehouse products"
      >
        <Link href="/dashboard/products/new">
          <Button>Add Product</Button>
        </Link>
      </DashboardHeader>
      <ProductsTable products={products} />
      <Toaster />
    </DashboardShell>
  )
} 