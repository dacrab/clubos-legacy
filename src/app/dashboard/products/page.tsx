import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { ProductsTable } from "@/components/products/ProductsTable"
import { NewProductSheet } from "@/components/products/NewProductSheet"
import { Toaster } from "@/components/ui/toaster"

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products = [] } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true })

  // Get unique categories and subcategories for the new product form
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  )
  const subcategories = Array.from(
    new Set(
      products
        .map((product) => product.subcategory)
        .filter((subcategory): subcategory is string => subcategory !== null)
    )
  )

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Products"
        description="Manage your warehouse products"
      >
        <NewProductSheet categories={categories} subcategories={subcategories} />
      </DashboardHeader>
      <ProductsTable products={products} />
      <Toaster />
    </DashboardShell>
  )
} 