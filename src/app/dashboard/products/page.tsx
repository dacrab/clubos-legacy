import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { ProductsTable } from "@/components/products/ProductsTable"
import { NewProductSheet } from "@/components/products/NewProductSheet"
import { ManageCategoriesDialog } from "@/components/products/ManageCategoriesDialog"
import { Toaster } from "@/components/ui/toaster"
import { Product } from "@/types"

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: rawProducts = [] } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true })

  // Ensure products is never null
  const products: Product[] = rawProducts || []

  // Get unique categories and subcategories for the new product form
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  ).filter(Boolean) // Remove any null/undefined values

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
        <div className="flex gap-2">
          <NewProductSheet categories={categories} subcategories={subcategories} />
          <ManageCategoriesDialog 
            existingCategories={categories} 
            existingSubcategories={subcategories} 
          />
        </div>
      </DashboardHeader>
      <ProductsTable products={products} />
      <Toaster />
    </DashboardShell>
  )
} 